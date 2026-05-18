#!/usr/bin/env python3
"""
Agensi Catalog MCP Server (Combined Local + Agensi)

A stdio MCP server exposing high-level tools for autonomous Agensi skill
library health checking and publishing status tracking.

- Local file-system tools (read/write reports and metadata)
- Built-in Agensi access (short-lived connections via streamablehttp_client)
- Designed to be the single "agensi-catalog" entry in mcp.json for Grok

Grok (or any MCP client) can call these tools directly to perform full
audits without the user running Python scripts manually.
"""

import os
import sys
import json
import asyncio
import logging
import re
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import yaml
from dotenv import load_dotenv

from mcp.server import Server
from mcp.server.stdio import stdio_server
import mcp.types as types
from mcp.client.streamable_http import streamablehttp_client
from mcp import ClientSession

# -----------------------------------------------------------------------------
# Logging (must go to stderr; stdout is reserved for MCP JSON-RPC)
# -----------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stderr,
)
logger = logging.getLogger("agensi-catalog")

# -----------------------------------------------------------------------------
# Paths & Configuration
# -----------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
SHARED_ROOT = SCRIPT_DIR.parents[1]
SYNC_CONFIG_PATH: Optional[Path] = None


def load_sync_config() -> Dict[str, Any]:
    """Load optional shared sync config.

    The server remains backward-compatible if no config is present, but the
    shared deployment should set AGENSI_SYNC_CONFIG to agensi-sync.config.json.
    """
    raw_path = os.getenv("AGENSI_SYNC_CONFIG", "").strip()
    candidates = []
    if raw_path:
        candidates.append(Path(raw_path))
    candidates.extend(
        [
            SCRIPT_DIR / "agensi-sync.config.json",
            SCRIPT_DIR / "agensi-sync.config.example.json",
        ]
    )

    for path in candidates:
        if path.exists():
            try:
                global SYNC_CONFIG_PATH
                SYNC_CONFIG_PATH = path.resolve()
                return json.loads(path.read_text(encoding="utf-8"))
            except Exception as exc:
                logger.warning(f"Failed to parse sync config {path}: {exc}")
                return {}
    return {}


SYNC_CONFIG = load_sync_config()


def resolve_runtime_path(value: Any, default: Optional[Path] = None) -> Path:
    if value in (None, ""):
        if default is None:
            raise ValueError("path value is required")
        path = default
    else:
        path = Path(str(value)).expanduser()
    if not path.is_absolute():
        base = SYNC_CONFIG_PATH.parent if SYNC_CONFIG_PATH else SCRIPT_DIR
        path = base / path
    return path.resolve()


def config_path(*keys: str, default: Path) -> Path:
    data: Any = SYNC_CONFIG
    for key in keys:
        if not isinstance(data, dict) or key not in data:
            return resolve_runtime_path(None, default)
        data = data[key]
    return resolve_runtime_path(data, default)


def configured_skill_root() -> Path:
    raw_env = os.getenv("AGENSI_SKILLS_ROOT", "").strip()
    if raw_env:
        return resolve_runtime_path(raw_env)

    roots = SYNC_CONFIG.get("roots", {}) if isinstance(SYNC_CONFIG, dict) else {}
    grok_root = roots.get("grok", {}) if isinstance(roots, dict) else {}
    if isinstance(grok_root, dict) and grok_root.get("local_root"):
        return resolve_runtime_path(grok_root["local_root"])

    # Backward-compatible fallback for the old Grok-local layout.
    return resolve_runtime_path(None, SCRIPT_DIR.parent.parent / "skills")


SKILLS_ROOT = configured_skill_root()
STATUS_SECTIONS: List[str] = ["listed", "ready-to-list", "ready-to-update", "working-state"]
# Status meanings:
#   listed         → currently live on Agensi
#   ready-to-list  → never published, fully polished, ready for first release
#   ready-to-update → already published, but local version is newer/better → needs new version on Agensi
#   working-state  → still in development / drafts / stubs
PRICE_FOLDERS: List[str] = ["free", "5", "6", "7", "8", "10"]
SPECIAL_FOLDERS: List[str] = ["internal", "infrastructure", "published-markers"]
MY_AUTHOR = "Markus Isaksson"

# Shared output locations. Defaults remain local if config is absent.
REPORTS_DIR = config_path("shared_paths", "reports_dir", default=SCRIPT_DIR / "reports")
CACHE_DIR = config_path("shared_paths", "cache_dir", default=SCRIPT_DIR)
LIVE_LOCAL_DIR = config_path("shared_paths", "live_local_dir", default=CACHE_DIR / "live-local")
CACHE_FILE = CACHE_DIR / "marketplace-cache.json"
CACHE_META_FILE = CACHE_DIR / "marketplace-cache.meta.json"

# Load .env from *this* folder (works even when Grok spawns us from elsewhere)
load_dotenv(SCRIPT_DIR / ".env")

API_KEY = os.getenv("AGENSI_API_KEY")
MCP_URL = os.getenv("AGENSI_MCP_URL", "https://mcp.agensi.io/mcp")

if not API_KEY:
    logger.warning("AGENSI_API_KEY not found; live marketplace tools will be unavailable until it is configured.")

HEADERS = {"Authorization": f"Bearer {API_KEY}"} if API_KEY else {}

# Ensure shared dirs exist
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)
LIVE_LOCAL_DIR.mkdir(parents=True, exist_ok=True)

# -----------------------------------------------------------------------------
# MCP Server Instance
# -----------------------------------------------------------------------------
server = Server("agensi-catalog")


# -----------------------------------------------------------------------------
# Local Skill Scanning (read)
# -----------------------------------------------------------------------------
def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
    normalized = re.sub(r"-{2,}", "-", normalized).strip("-")
    return normalized


def extract_skill_metadata(skill_dir: Path) -> Optional[Dict[str, Any]]:
    """Extract rich metadata from a SKILL.md file (YAML frontmatter + fs info)."""
    md_file = skill_dir / "SKILL.md"
    if not md_file.exists():
        return None

    try:
        content = md_file.read_text(encoding="utf-8")
        frontmatter = {}
        body = content

        if content.startswith("---"):
            end = content.find("---", 3)
            if end != -1:
                fm_text = content[3:end]
                try:
                    frontmatter = yaml.safe_load(fm_text) or {}
                except Exception:
                    frontmatter = {}
                body = content[end + 3 :].strip()

        name = frontmatter.get("name") or skill_dir.name
        price = frontmatter.get("price", 0)
        version = str(frontmatter.get("version", "1.0.0"))
        author = frontmatter.get("author", "")
        tags = frontmatter.get("tags", []) or []
        description = frontmatter.get("description", "") or body.split("\n\n")[0][:200]

        # Improved Grok authorship detection
        is_grok = False
        if author == MY_AUTHOR or "mjisa" in str(author).lower():
            is_grok = True
        elif any(x in name.lower() for x in ["with grok", "grok-"]):
            is_grok = True
        elif "grok" in [t.lower() for t in tags]:
            is_grok = True

        # Explicit override via frontmatter (useful for "other author" skills)
        if frontmatter.get("authorship") == "other":
            is_grok = False
        elif frontmatter.get("authorship") == "grok":
            is_grok = True

        # Store original author for non-Grok skills
        original_author = None
        if not is_grok and author and author != "Unknown":
            original_author = author

        stat = md_file.stat()
        last_modified = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()

        tier = skill_dir.parent.name if skill_dir.parent.name in PRICE_FOLDERS + ["internal"] else "unknown"

        # Load any recorded published metadata (version + timestamp)
        pub_meta = load_published_metadata(skill_dir)

        result = {
            "name": name,
            "folder_name": skill_dir.name,
            "tier": tier,
            "price": price if isinstance(price, (int, float)) else 0,
            "version": version,
            "author": author,
            "original_author": original_author,
            "tags": tags,
            "description": description[:300],
            "path": str(skill_dir.relative_to(SKILLS_ROOT)),
            "last_modified": last_modified,
            "is_grok_authored": is_grok,
        }
        result.update(pub_meta)
        return result
    except Exception as exc:
        logger.warning(f"Failed to parse {md_file}: {exc}")
        return {
            "name": skill_dir.name,
            "folder_name": skill_dir.name,
            "tier": skill_dir.parent.name,
            "price": 0,
            "version": "unknown",
            "author": "Unknown",
            "tags": [],
            "description": "",
            "path": str(skill_dir.relative_to(SKILLS_ROOT)),
            "last_modified": "",
            "is_grok_authored": False,
        }


def load_published_metadata(skill_dir: Path) -> Dict[str, Any]:
    """Load published version/timestamp info if the author recorded it.
    Supports both PUBLISHED.md (simple) and marketplace.json (preferred).
    """
    meta = {}

    # Preferred: structured JSON
    json_path = skill_dir / "marketplace.json"
    if json_path.exists():
        try:
            data = json.loads(json_path.read_text(encoding="utf-8"))
            meta.update({
                "published_version": data.get("version") or data.get("published_version"),
                "published_at": data.get("published_at") or data.get("last_published"),
                "published_installs": data.get("installs"),
                "published_views": data.get("views"),
                "agensi_slug": data.get("slug") or data.get("agensi_slug"),
            })
            return {k: v for k, v in meta.items() if v is not None}
        except Exception:
            pass

    # Fallback: lightweight markdown
    md_path = skill_dir / "PUBLISHED.md"
    if md_path.exists():
        try:
            content = md_path.read_text(encoding="utf-8")
            for line in content.splitlines():
                line = line.strip()
                if line.startswith("- **Version**") or line.startswith("version:"):
                    meta["published_version"] = line.split(":", 1)[-1].strip().strip("*").strip()
                elif line.startswith("- **Published at**") or line.startswith("published_at:"):
                    meta["published_at"] = line.split(":", 1)[-1].strip().strip("*").strip()
                elif line.startswith("- **Installs**"):
                    meta["published_installs"] = line.split(":", 1)[-1].strip().strip("*").strip()
        except Exception:
            pass

    return meta


def scan_local_skills(include_internal: bool = True) -> List[Dict[str, Any]]:
    """Walk the new three-section structure (listed / ready-to-list / working-state)
    and return rich metadata including status and price tier.
    """
    skills: List[Dict[str, Any]] = []

    for status in STATUS_SECTIONS:
        status_dir = SKILLS_ROOT / status
        if not status_dir.exists():
            continue

        # Walk price tiers + special folders (internal, infrastructure, etc.)
        for sub in PRICE_FOLDERS + SPECIAL_FOLDERS:
            subdir = status_dir / sub
            if not subdir.exists():
                continue

            for entry in subdir.iterdir():
                if entry.is_dir() and (entry / "SKILL.md").exists():
                    meta = extract_skill_metadata(entry)
                    if meta:
                        meta["status"] = status
                        # Keep the old 'tier' field for backward compatibility in reports
                        if sub in PRICE_FOLDERS:
                            meta["tier"] = sub
                        else:
                            meta["tier"] = sub   # internal / infrastructure etc.
                        skills.append(meta)

    # Stable sort: status > tier > name
    status_order = {s: i for i, s in enumerate(STATUS_SECTIONS)}
    tier_order = {t: i for i, t in enumerate(PRICE_FOLDERS + SPECIAL_FOLDERS)}
    skills.sort(key=lambda s: (
        status_order.get(s.get("status", "zzz"), 99),
        tier_order.get(s.get("tier", "zzz"), 99),
        s["name"].lower()
    ))
    return skills


def configured_roots() -> Dict[str, Dict[str, Any]]:
    roots = SYNC_CONFIG.get("roots", {}) if isinstance(SYNC_CONFIG, dict) else {}
    normalized: Dict[str, Dict[str, Any]] = {}
    if isinstance(roots, dict):
        for family, raw in roots.items():
            if isinstance(raw, str):
                normalized[family] = {"local_root": str(resolve_runtime_path(raw)), "layout": "status-tier-folders"}
            elif isinstance(raw, dict):
                root_data = dict(raw)
                if root_data.get("local_root"):
                    root_data["local_root"] = str(resolve_runtime_path(root_data["local_root"]))
                normalized[family] = root_data
    if not normalized:
        normalized["grok"] = {"local_root": str(SKILLS_ROOT), "layout": "status-tier-folders"}
    return normalized


def parse_skill_frontmatter(path: Path) -> Dict[str, Any]:
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return {}
    if not text.startswith("---"):
        return {}
    end = text.find("---", 3)
    if end == -1:
        return {}
    try:
        return yaml.safe_load(text[3:end]) or {}
    except Exception:
        return {}


def normalize_local_status_record(
    model_family: str,
    local_root: Path,
    skill_dir: Path,
    status: str,
    catalog_item: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    catalog_item = catalog_item or {}
    skill_md = skill_dir / "SKILL.md"
    frontmatter = parse_skill_frontmatter(skill_md) if skill_md.exists() else {}
    local_id = (
        catalog_item.get("id")
        or catalog_item.get("name")
        or frontmatter.get("name")
        or skill_dir.name
    )
    local_id = slugify(str(local_id)) or skill_dir.name
    version = str(catalog_item.get("version") or frontmatter.get("version") or "1.0.0")
    marketplace_slug = catalog_item.get("marketplace_slug") or catalog_item.get("agensi_slug") or frontmatter.get("agensi_slug") or local_id
    try:
        local_path = str(skill_dir.relative_to(local_root))
    except ValueError:
        local_path = str(skill_dir)
    return {
        "local_id": str(local_id),
        "local_path": local_path,
        "local_status": str(catalog_item.get("status") or status),
        "local_version": version,
        "target_model": str(catalog_item.get("target") or frontmatter.get("target_model") or model_family),
        "marketplace_slug": slugify(str(marketplace_slug)) or local_id,
        "marketplace_name": "",
        "marketplace_url": "",
        "sync_status": "unmatched-local",
        "install_count": 0,
        "identity_warnings": [],
        "drift_policy": "batch-with-version",
        "notes": "",
    }


def scan_catalog_root(model_family: str, root: Path, root_config: Dict[str, Any]) -> Dict[str, Any]:
    catalog_path = root / str(root_config.get("catalog", "catalog.yaml"))
    skills: List[Dict[str, Any]] = []
    errors: List[str] = []
    if not catalog_path.exists():
        errors.append(f"catalog not found: {catalog_path}")
    else:
        try:
            data = yaml.safe_load(catalog_path.read_text(encoding="utf-8")) or {}
            for item in data.get("skills", []):
                if not isinstance(item, dict):
                    continue
                path = root / str(item.get("path", ""))
                skills.append(normalize_local_status_record(model_family, root, path, str(item.get("status", "unknown")), item))
        except Exception as exc:
            errors.append(f"catalog parse failed: {exc}")
    return {
        "model_family": model_family,
        "root": str(root),
        "layout": "catalog-yaml",
        "skills": skills,
        "errors": errors,
    }


def scan_status_tier_root(model_family: str, root: Path) -> Dict[str, Any]:
    skills: List[Dict[str, Any]] = []
    errors: List[str] = []
    if not root.exists():
        errors.append(f"root not found: {root}")
    else:
        for status in STATUS_SECTIONS:
            status_dir = root / status
            if not status_dir.exists():
                continue
            for sub in PRICE_FOLDERS + SPECIAL_FOLDERS:
                subdir = status_dir / sub
                if not subdir.exists():
                    continue
                for entry in subdir.iterdir():
                    if entry.is_dir() and (entry / "SKILL.md").exists():
                        skills.append(normalize_local_status_record(model_family, root, entry, status))
    return {
        "model_family": model_family,
        "root": str(root),
        "layout": "status-tier-folders",
        "skills": skills,
        "errors": errors,
    }


def scan_local_roots() -> Dict[str, Any]:
    results: Dict[str, Any] = {}
    for model_family, root_config in configured_roots().items():
        root = Path(str(root_config.get("local_root", "")))
        layout = root_config.get("layout", "status-tier-folders")
        if layout == "catalog-yaml":
            results[model_family] = scan_catalog_root(model_family, root, root_config)
        else:
            results[model_family] = scan_status_tier_root(model_family, root)

    return {
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "roots": results,
        "summary": {
            "root_count": len(results),
            "local_skill_count": sum(len(item.get("skills", [])) for item in results.values()),
            "error_count": sum(len(item.get("errors", [])) for item in results.values()),
        },
    }


def flag_stale_ports(agensi_slug: str, current_version: str, exclude_dir: Path):
    """Scan all configured roots for the given agensi_slug and write NEEDS_SYNC.md 
    if found in a directory other than exclude_dir. Implementation of Consensus Item 5.
    """
    logger.info(f"Checking for stale ports of slug '{agensi_slug}' (v{current_version})...")
    for family, config in configured_roots().items():
        root_path = Path(str(config.get("local_root", "")))
        if not root_path.exists():
            continue
        
        layout = config.get("layout", "status-tier-folders")
        if layout == "catalog-yaml":
            root_data = scan_catalog_root(family, root_path, config)
        else:
            root_data = scan_status_tier_root(family, root_path)
            
        for skill in root_data.get("skills", []):
            if skill.get("marketplace_slug") == agensi_slug:
                skill_dir = root_path / skill.get("local_path", "")
                if skill_dir.resolve() == exclude_dir.resolve():
                    continue
                
                flag_path = skill_dir / "NEEDS_SYNC.md"
                flag_content = f"""# Sync Required

This skill has a newer version ({current_version}) published on Agensi.
Please sync your local port with the latest marketplace state.

**Detected at**: {datetime.now(timezone.utc).replace(microsecond=0).isoformat()}
"""
                try:
                    flag_path.write_text(flag_content, encoding="utf-8")
                    logger.info(f"✓ Flagged stale port: {flag_path}")
                except Exception as e:
                    logger.warning(f"Failed to write NEEDS_SYNC.md to {flag_path}: {e}")


def manual_snapshot_live_count() -> Optional[int]:
    snapshot = SHARED_ROOT / "manually-added-data-from-human" / "manual-snapshot-of-marketplace.txt"
    if not snapshot.exists():
        return None
    try:
        text = snapshot.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return None
    match = re.search(r"(?m)^\s*(\d+)\s*\r?\n\s*Live\s*$", text)
    if not match:
        return None
    return int(match.group(1))


def marketplace_count_state() -> Dict[str, Any]:
    if not CACHE_FILE.exists():
        manual_count = manual_snapshot_live_count()
        return {
            "live_count": manual_count,
            "source": "manual-snapshot" if manual_count is not None else "none",
            "cache_available": False,
        }
    try:
        data = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return {"live_count": len(data), "source": str(CACHE_FILE), "cache_available": True}
        if isinstance(data, dict):
            return {
                "live_count": int(data.get("skill_count") or len(data.get("skills", []))),
                "source": str(CACHE_FILE),
                "cache_available": True,
            }
    except Exception:
        manual_count = manual_snapshot_live_count()
        return {
            "live_count": manual_count,
            "source": "manual-snapshot" if manual_count is not None else "cache-parse-error",
            "cache_available": False,
        }
    return {"live_count": None, "source": "none", "cache_available": False}


def aggregate_footprint() -> Dict[str, Any]:
    local = scan_local_roots()
    cap = int((SYNC_CONFIG.get("policy", {}) if isinstance(SYNC_CONFIG, dict) else {}).get("live_listing_cap", 50))
    marketplace_state = marketplace_count_state()
    live_count = marketplace_state.get("live_count")
    ready_to_list = []
    for family, root_data in local["roots"].items():
        for skill in root_data.get("skills", []):
            if skill.get("local_status") == "ready-to-list":
                ready_to_list.append({"model_family": family, **skill})

    projected = (live_count or 0) + len(ready_to_list)
    return {
        "generated_at": local["generated_at"],
        "cap": cap,
        "live_count": live_count,
        "marketplace_source": marketplace_state.get("source"),
        "cache_available": marketplace_state.get("cache_available"),
        "ready_to_list_count": len(ready_to_list),
        "projected_live_count": projected,
        "cap_status": "unknown" if live_count is None else "over-cap" if live_count > cap else "would-exceed" if projected > cap else "ok",
        "ready_to_list": ready_to_list,
        "local_summary": local["summary"],
    }


def validate_publish_intent(skill_id: str, action: str = "publish") -> Dict[str, Any]:
    footprint = aggregate_footprint()
    local = scan_local_roots()
    action = action.lower().strip()
    matches = []
    for family, root_data in local["roots"].items():
        for skill in root_data.get("skills", []):
            if skill.get("local_id") == skill_id or skill.get("marketplace_slug") == skill_id:
                matches.append({"model_family": family, **skill})

    require_version = bool((SYNC_CONFIG.get("policy", {}) if isinstance(SYNC_CONFIG, dict) else {}).get("require_version_for_publish_or_update", True))
    messages: List[str] = []
    verdict = "allow"

    if not matches:
        verdict = "block"
        messages.append(f"skill not found in configured local roots: {skill_id}")

    live_count = footprint.get("live_count")
    if action in {"publish", "list", "ready-to-list"} and live_count is not None and live_count >= footprint["cap"]:
        verdict = "block"
        messages.append(f"live listing cap is already at or above {footprint['cap']}; do not add new listings")
    elif action in {"publish", "list", "ready-to-list"} and live_count is None:
        verdict = "block"
        messages.append("live marketplace count is unknown; refresh marketplace cache before publishing")

    if require_version:
        for match in matches:
            if not match.get("local_version") or match.get("local_version") == "0.0.0":
                verdict = "block"
                messages.append(f"{match['model_family']}:{match['local_id']} is missing a publishable version")

    if not messages:
        messages.append("publish intent passed configured local checks")

    return {
        "skill_id": skill_id,
        "action": action,
        "verdict": verdict,
        "messages": messages,
        "matches": matches,
        "footprint": footprint,
    }


# -----------------------------------------------------------------------------
# Agensi Published Skills Fetch (network via MCP)
# -----------------------------------------------------------------------------
def normalize_skill(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize any Agensi skill record to our internal shape."""
    return {
        "name": raw.get("name") or raw.get("title") or "Unknown Skill",
        "price": raw.get("price", 0),
        "installs": raw.get("installs", 0),
        "views": raw.get("views", 0),
        "author": raw.get("author") or raw.get("creator") or "Unknown",
        "last_updated": raw.get("last_updated") or raw.get("updated_at") or raw.get("published_at"),
        "description": raw.get("description") or raw.get("short_description", "")[:300],
        "tags": raw.get("tags", []),
        "source": "agensi_mcp",
    }


async def _fetch_from_agensi() -> List[Dict[str, Any]]:
    """Open a short-lived connection and try the most likely tool names."""
    logger.info("Connecting to Agensi MCP for published skills fetch...")

    async with streamablehttp_client(url=MCP_URL, headers=HEADERS) as (
        read_stream,
        write_stream,
        _get_session_id,
    ):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()

            tools_result = await session.list_tools()
            available = [t.name for t in getattr(tools_result, "tools", tools_result)]
            logger.info(f"Agensi tools available: {available}")

            candidates = [
                "list_my_skills",
                "get_my_published_skills",
                "list_published_skills",
                "get_user_skills",
                "search_skills",
            ]

            for tool_name in candidates:
                if tool_name not in available:
                    continue
                try:
                    args: Dict[str, Any] = {}
                    if tool_name == "search_skills":
                        args = {"query": "", "include_owned": True, "limit": 200}

                    result = await session.call_tool(tool_name, arguments=args)

                    skills_raw: List[Dict[str, Any]] = []
                    if hasattr(result, "content"):
                        for item in result.content:
                            if hasattr(item, "text"):
                                try:
                                    data = json.loads(item.text)
                                    if isinstance(data, list):
                                        skills_raw = data
                                    elif isinstance(data, dict):
                                        skills_raw = data.get("skills") or data.get("results") or []
                                except Exception:
                                    pass
                    elif isinstance(result, list):
                        skills_raw = result
                    elif isinstance(result, dict):
                        skills_raw = result.get("skills") or result.get("results") or []

                    if skills_raw:
                        normalized = [normalize_skill(s) for s in skills_raw if isinstance(s, dict)]
                        logger.info(f"✓ Fetched {len(normalized)} published skills via {tool_name}")
                        return normalized
                except Exception as e:
                    logger.warning(f"Tool {tool_name} failed: {e}")

    logger.warning("No published skills tool succeeded on Agensi MCP.")
    return []


async def fetch_published_skills(force_refresh: bool = False) -> List[Dict[str, Any]]:
    """Return cached or fresh published skills. Writes cache on success."""
    if not force_refresh and CACHE_FILE.exists():
        try:
            cached = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
            if cached:
                logger.info(f"Using cached published_skills.json ({len(cached)} entries)")
                return cached
        except Exception:
            pass

    skills = await _fetch_from_agensi()
    if skills:
        CACHE_FILE.write_text(json.dumps(skills, indent=2, ensure_ascii=False), encoding="utf-8")
        CACHE_META_FILE.write_text(
            json.dumps(
                {
                    "fetched_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
                    "source": "Agensi MCP",
                    "count": len(skills),
                    "mcp_url": MCP_URL,
                },
                indent=2,
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        logger.info(f"Saved fresh published skills cache → {CACHE_FILE}")
    return skills


# -----------------------------------------------------------------------------
# Comparison & Report Generation (core intelligence)
# -----------------------------------------------------------------------------
def compare_local_vs_published(
    local_skills: List[Dict[str, Any]], published_skills: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Produce authorship-aware publishing status analysis.

    A local skill is now considered "published" if:
    - It exists in the live Agensi data, OR
    - It has a local published record (marketplace.json / PUBLISHED.md)
    """
    pub_by_name = {s["name"].lower().strip(): s for s in published_skills}

    my_published = []
    other_authors_published = []
    unpublished_grok = []
    version_drift = []
    published_missing_locally = []

    local_names = {s["name"].lower().strip(): s for s in local_skills}

    # Build set of names that have local published records
    local_published_names = {
        s["name"].lower().strip() 
        for s in local_skills 
        if s.get("published_version")
    }

    for pub in published_skills:
        pub_name = pub["name"].lower().strip()
        local = local_names.get(pub_name)

        pub_author = pub.get("author", "")
        if pub_author == MY_AUTHOR or "Grok" in str(pub.get("tags", [])):
            pub["is_my_listing"] = True
            my_published.append(pub)
        else:
            pub["is_my_listing"] = False
            pub["original_author"] = pub_author
            other_authors_published.append(pub)

        if local:
            if local.get("version") != pub.get("version"):
                version_drift.append({
                    "name": pub["name"],
                    "local_version": local.get("version"),
                    "published_version": pub.get("version"),
                })
        else:
            published_missing_locally.append(pub)

    # Grok-authored skills that exist locally but have no published record (live or local)
    for local in local_skills:
        lname = local["name"].lower().strip()
        has_live_record = lname in pub_by_name
        has_local_record = bool(local.get("published_version"))

        if local.get("is_grok_authored") and not has_live_record and not has_local_record:
            unpublished_grok.append(local)

    # === NEW: Include locally recorded published skills in "my_published" ===
    # This ensures the summary count "Published on Agensi (your listings)" reflects
    # skills we have explicit local records for, even if the live fetch is slightly out of sync.
    existing_my_names = {p["name"].lower().strip() for p in my_published}

    for local in local_skills:
        lname = local["name"].lower().strip()
        if (local.get("is_grok_authored") 
            and local.get("published_version") 
            and lname not in existing_my_names):

            my_published.append({
                "name": local["name"],
                "price": local.get("price", 0),
                "installs": 0,
                "views": 0,
                "author": MY_AUTHOR,
                "is_my_listing": True,
                "source": "local_record",
                "version": local.get("published_version")
            })

    # Local skills that are not published (no live record and no local metadata record)
    only_local_non_internal = [
        s for s in local_skills
        if not s.get("published_version") and s["name"].lower().strip() not in pub_by_name
    ]

    # === Ready-to-update logic (improved) ===
    ready_to_update = []
    suggested_to_ready_to_update = []
    suggested_back_to_listed = []

    for local in local_skills:
        lname = local["name"].lower().strip()
        pub = pub_by_name.get(lname)

        local_published_ver = local.get("published_version")
        live_published_ver = pub.get("version") if pub else None
        best_published_ver = local_published_ver or live_published_ver or ""

        local_ver = local.get("version", "0.0.0")
        current_status = local.get("status", "unknown")

        # Skill has local published record but local version is newer
        if local_published_ver and local_ver != local_published_ver:
            if current_status in ("listed", "ready-to-update"):
                suggested_to_ready_to_update.append({
                    "name": local["name"],
                    "current_status": current_status,
                    "suggested_status": "ready-to-update",
                    "local_version": local_ver,
                    "last_published_version": local_published_ver,
                    "path": local.get("path"),
                    "reason": f"Local v{local_ver} > recorded published v{local_published_ver}"
                })

        # Skill is in ready-to-update but versions now match
        if current_status == "ready-to-update" and local_ver == best_published_ver and best_published_ver:
            suggested_back_to_listed.append({
                "name": local["name"],
                "current_status": "ready-to-update",
                "suggested_status": "listed",
                "local_version": local_ver,
                "last_published_version": best_published_ver,
                "path": local.get("path"),
                "reason": "Local version now matches the last published version"
            })

        # Legacy ready_to_update list
        if current_status == "listed" and pub and local_ver != (pub.get("version") or ""):
            ready_to_update.append({
                "name": local["name"],
                "tier": local.get("tier"),
                "status": "listed",
                "local_version": local_ver,
                "published_version": pub.get("version"),
                "path": local.get("path"),
            })

    summary = {
        "total_local": len(local_skills),
        "total_published": len(published_skills),
        "my_published_count": len(my_published),
        "other_authors_listed_count": len(other_authors_published),
        "unpublished_grok_count": len(unpublished_grok),
        "version_drift_count": len(version_drift),
        "published_but_missing_locally": len(published_missing_locally),
        "ready_to_update_count": len(ready_to_update),
        "suggested_to_ready_to_update": len(suggested_to_ready_to_update),
        "suggested_back_to_listed": len(suggested_back_to_listed),
    }

    return {
        "summary": summary,
        "my_published": my_published,
        "other_authors_published": other_authors_published,
        "unpublished_grok": unpublished_grok,
        "version_drift": version_drift,
        "published_missing_locally": published_missing_locally,
        "only_local_non_internal": only_local_non_internal,
        "ready_to_update": ready_to_update,
        "suggested_to_ready_to_update": suggested_to_ready_to_update,
        "suggested_back_to_listed": suggested_back_to_listed,
    }


def format_health_report(comp: Dict[str, Any]) -> str:
    """Render a clean, actionable markdown publishing health report."""
    s = comp["summary"]
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    lines = [
        "# Agensi Listing Health Report",
        f"**Generated**: {now}",
        "",
        "## Summary",
        f"- **Local skills scanned**: {s['total_local']}",
        f"- **Published on Agensi (your listings)**: {s['my_published_count']}",
        f"- **Other authors' skills you have listed**: {s['other_authors_listed_count']}",
        f"- **Your Grok-authored skills still unpublished**: **{s['unpublished_grok_count']}**",
        f"- **Version drift detected**: {s['version_drift_count']}",
        f"- **Published skills with local improvements (ready to update)**: **{s.get('ready_to_update_count', 0)}**",
        f"- **Automated suggestions to move to ready-to-update**: {s.get('suggested_to_ready_to_update', 0)}",
        f"- **Automated suggestions to move back to listed**: {s.get('suggested_back_to_listed', 0)}",
        f"- **Published on Agensi but missing from local library**: {s['published_but_missing_locally']}",
        "",
    ]

    # Unpublished Grok skills (the key actionable list)
    if comp["unpublished_grok"]:
        lines.append("## 🚀 Your Grok-Authored Skills Still Unpublished (Ready to Publish)")
        lines.append("| Skill | Tier | Version | Path |")
        lines.append("|-------|------|---------|------|")
        for item in sorted(comp["unpublished_grok"], key=lambda x: x["name"]):
            lines.append(f"| {item['name']} | {item['tier']} | {item['version']} | `{item['path']}` |")
        lines.append("")

    # Ready to Update (published but local has newer/better version)
    if comp.get("ready_to_update"):
        lines.append("## 🔄 Ready to Update — Published Skills with Local Improvements")
        lines.append("These skills are live on Agensi but you have made improvements locally.")
        lines.append("Move them to `ready-to-update/` and publish a new version.")
        lines.append("| Skill | Current Published | Local Version | Path |")
        lines.append("|-------|-------------------|---------------|------|")
        for item in sorted(comp["ready_to_update"], key=lambda x: x["name"]):
            lines.append(f"| {item['name']} | {item.get('published_version', '?')} | {item.get('local_version', '?')} | `{item.get('path', '')}` |")
        lines.append("")

    # Other authors you are listing
    if comp["other_authors_published"]:
        lines.append("## 👥 Skills from Other Authors You Have Published")
        lines.append("| Skill | Original Author | Installs | Views |")
        lines.append("|-------|-----------------|----------|-------|")
        for item in sorted(comp["other_authors_published"], key=lambda x: -x.get("installs", 0)):
            author_display = item.get("original_author") or item.get("author") or "Unknown"
            lines.append(
                f"| {item['name']} | {author_display} | {item.get('installs', 0)} | {item.get('views', 0)} |"
            )
        lines.append("")

    # Version drift
    if comp["version_drift"]:
        lines.append("## 🔄 Version Drift (Local vs Published)")
        for v in comp["version_drift"]:
            lines.append(f"- **{v['name']}**: local {v['local_version']} → published {v['published_version']}")
        lines.append("")

    # Automated Move Suggestions based on local published metadata
    if comp.get("suggested_to_ready_to_update") or comp.get("suggested_back_to_listed"):
        lines.append("## 📦 Automated Move Suggestions (based on published metadata)")
        lines.append("The Health Checker compared local `version` against recorded `published_version` (from `marketplace.json` / `PUBLISHED.md`).")

        if comp.get("suggested_to_ready_to_update"):
            lines.append("\n**Move these from `listed/` → `ready-to-update/`** (local version is newer):")
            for item in comp["suggested_to_ready_to_update"]:
                lines.append(f"- **{item['name']}** — {item['reason']}")

        if comp.get("suggested_back_to_listed"):
            lines.append("\n**Move these from `ready-to-update/` → `listed/`** (versions now match):")
            for item in comp["suggested_back_to_listed"]:
                lines.append(f"- **{item['name']}** — {item['reason']}")
        lines.append("")

    # Recommendations
    lines.append("## Recommended Next Actions")
    recs = []
    if s["unpublished_grok_count"] > 0:
        recs.append(f"1. Publish the {s['unpublished_grok_count']} Grok-authored skills listed above (start with the highest-tier ready ones).")
    if s["other_authors_listed_count"] > 0:
        recs.append("2. Review the other-authors listings — consider whether you want to keep maintaining them or focus on your own catalog.")
    if s["version_drift_count"] > 0:
        recs.append("3. Bump versions in the local files for drifted skills before next publish.")
    if s.get("ready_to_update_count", 0) > 0:
        recs.append(f"4. Move the {s.get('ready_to_update_count')} skills that have local improvements into `ready-to-update/` and publish updated versions on Agensi.")
    if s.get("suggested_to_ready_to_update", 0) > 0:
        recs.append(f"5. Follow the automated suggestions above to move {s.get('suggested_to_ready_to_update')} skills into `ready-to-update/`.")
    if s.get("suggested_back_to_listed", 0) > 0:
        recs.append(f"6. Move {s.get('suggested_back_to_listed')} skills back from `ready-to-update/` to `listed/` (they are now in sync).")
    if not recs:
        recs.append("✅ Your local library and published listings are in excellent sync.")
    lines.extend(recs)

    lines.append("")
    lines.append("---")
    lines.append("*Report produced by Agensi Catalog MCP Server (Agensi Listing Health Checker).*")

    return "\n".join(lines)


def format_multi_root_footprint_section(footprint: Dict[str, Any]) -> str:
    """Render the shared multi-root live/local footprint for cross-agent decisions."""
    local_summary = footprint.get("local_summary", {}) or {}
    lines = [
        "",
        "## Multi-Root Live/Local Footprint",
        "",
        "This section is generated from `scan_local_roots` and `aggregate_footprint`.",
        "",
        f"- **Configured roots scanned**: {local_summary.get('root_count', 0)}",
        f"- **Local skills across configured roots**: {local_summary.get('local_skill_count', 0)}",
        f"- **Root scan errors**: {local_summary.get('error_count', 0)}",
        f"- **Live marketplace count**: {footprint.get('live_count')}",
        f"- **Marketplace source**: `{footprint.get('marketplace_source')}`",
        f"- **Live listing cap**: {footprint.get('cap')}",
        f"- **Ready-to-list count**: {footprint.get('ready_to_list_count')}",
        f"- **Projected live count after ready-to-list**: {footprint.get('projected_live_count')}",
        f"- **Cap status**: **{footprint.get('cap_status')}**",
        "",
    ]

    ready_to_list = footprint.get("ready_to_list", []) or []
    if ready_to_list:
        lines.extend([
            "### Ready-to-List Pressure",
            "",
            "| Model | Skill ID | Version | Path |",
            "|-------|----------|---------|------|",
        ])
        for item in sorted(ready_to_list, key=lambda value: (value.get("model_family", ""), value.get("local_id", ""))):
            lines.append(
                f"| {item.get('model_family', '')} | {item.get('local_id', '')} | "
                f"{item.get('local_version', '')} | `{item.get('local_path', '')}` |"
            )
        lines.append("")

    return "\n".join(lines)


def suggest_publishing_actions(min_priority: str = "low", auto_prepare_metadata: bool = False) -> Dict[str, Any]:
    """Dedicated tool that returns structured publish and update recommendations.

    This is lighter than generate_health_report and focused purely on actionable next steps.

    Args:
        min_priority: Filter recommendations. Valid values: "high", "medium", "low" (default).
                      Only returns items whose priority is >= min_priority.
        auto_prepare_metadata: If True, automatically calls ensure_ready_metadata for any
                               skill being recommended for ready-to-list or ready-to-update
                               that is missing its agents/<platform>.yaml file.
    """
    local_skills = scan_local_skills(include_internal=True)

    # We try to use cached published data first for speed
    try:
        published = json.loads(CACHE_FILE.read_text(encoding="utf-8")) if CACHE_FILE.exists() else []
    except Exception:
        published = []

    comparison = compare_local_vs_published(local_skills, published)

    recommendations = []

    # 1. Skills in ready-to-list that should be published
    for skill in local_skills:
        if skill.get("status") == "ready-to-list":
            priority = "high" if skill.get("tier") in ["5", "6", "7"] else "medium"
            recommendations.append({
                "action": "publish",
                "skill_name": skill["name"],
                "current_status": "ready-to-list",
                "suggested_status": "listed",
                "priority": priority,
                "reason": f"Polished skill in ready-to-list tier {skill.get('tier')}",
                "path": skill.get("path"),
                "current_version": skill.get("version"),
            })

    # 2. Skills in listed that have local improvements (ready to update)
    for item in comparison.get("suggested_to_ready_to_update", []):
        priority = "high" if item.get("tier") in ["7", "8", "10"] else "medium"
        recommendations.append({
            "action": "move_and_update",
            "skill_name": item["name"],
            "current_status": "listed",
            "suggested_status": "ready-to-update",
            "priority": priority,
            "reason": item.get("reason", "Local version is newer than published version"),
            "path": item.get("path"),
            "local_version": item.get("local_version"),
            "last_published_version": item.get("last_published_version"),
        })

    # 3. Skills in ready-to-update that are now in sync (move back to listed)
    for item in comparison.get("suggested_back_to_listed", []):
        recommendations.append({
            "action": "move_back_to_listed",
            "skill_name": item["name"],
            "current_status": "ready-to-update",
            "suggested_status": "listed",
            "priority": "low",
            "reason": item.get("reason", "Local version now matches published version"),
            "path": item.get("path"),
        })

    # 4. High-value unpublished skills that are in working-state but look mature
    mature_working = []
    for skill in local_skills:
        if skill.get("status") == "working-state" and skill.get("is_grok_authored"):
            if skill.get("version", "0.0.0") not in ["0.0.0", "0.1.0", "1.0.0-stub"]:
                mature_working.append(skill)

    for skill in sorted(mature_working, key=lambda x: x.get("tier", "z"))[:5]:
        recommendations.append({
            "action": "consider_promoting",
            "skill_name": skill["name"],
            "current_status": "working-state",
            "suggested_status": "ready-to-list",
            "priority": "medium",
            "reason": "Looks mature (has version and is Grok-authored) — consider moving to ready-to-list after final polish",
            "path": skill.get("path"),
            "current_version": skill.get("version"),
        })

    # --- New: Check for missing adjacent metadata in ready-to-list / ready-to-update ---
    for skill in local_skills:
        status = skill.get("status")
        if status in ("ready-to-list", "ready-to-update"):
            agents_dir = (SKILLS_ROOT / skill["path"] / "agents")
            has_metadata = False
            if agents_dir.exists():
                yaml_files = list(agents_dir.glob("*.yaml")) + list(agents_dir.glob("*.yml"))
                if yaml_files:
                    has_metadata = True
            
            if not has_metadata:
                prio = "high" if status == "ready-to-list" else "medium"
                recommendations.append({
                    "action": "add_metadata_file",
                    "skill_name": skill["name"],
                    "current_status": status,
                    "suggested_status": status,
                    "priority": prio,
                    "reason": "Missing agents/grok.yaml (or agents/openai.yaml) — required for ready-to-publish skills",
                    "path": skill.get("path"),
                })

                # Auto-prepare metadata if requested (useful for future automation / bulk moves)
                if auto_prepare_metadata:
                    try:
                        meta_result = ensure_ready_metadata(skill.get("path"), platform="grok")
                        if meta_result.get("status") == "success":
                            # Update the recommendation to reflect that it was auto-created
                            recommendations[-1]["action"] = "metadata_file_created"
                            recommendations[-1]["reason"] = f"Auto-created {meta_result.get('path')} during recommendation generation"
                            recommendations[-1]["metadata_path"] = meta_result.get("path")
                    except Exception as e:
                        logger.warning(f"Failed to auto-create metadata for {skill.get('path')}: {e}")

    # Apply priority filter
    priority_order = {"high": 3, "medium": 2, "low": 1}
    min_prio_level = priority_order.get(min_priority, 1)
    filtered_recs = [
        r for r in recommendations
        if priority_order.get(r.get("priority", "low"), 1) >= min_prio_level
    ]

    summary = {
        "total_recommendations": len(filtered_recs),
        "to_publish": len([r for r in filtered_recs if r["action"] == "publish"]),
        "to_move_to_ready_to_update": len([r for r in filtered_recs if r["action"] == "move_and_update"]),
        "to_move_back_to_listed": len([r for r in filtered_recs if r["action"] == "move_back_to_listed"]),
        "to_consider_promoting": len([r for r in filtered_recs if r["action"] == "consider_promoting"]),
        "missing_metadata": len([r for r in filtered_recs if r["action"] == "add_metadata_file"]),
        "min_priority": min_priority,
    }

    return {
        "recommendations": filtered_recs,
        "summary": summary,
    }


def ensure_ready_metadata(skill_path: str, platform: str = "grok") -> Dict[str, Any]:
    """Create or ensure the presence of a properly populated agents/<platform>.yaml file.

    This is a convenience tool meant to be called when moving a skill into
    ready-to-list or ready-to-update. It reads the SKILL.md and generates
    sensible defaults for the platform-specific metadata file, including
    compatibility note and permissions/file scopes.

    It also tries to record:
    - agensi_slug (for mapping live Agensi data back to local folders)
    - target_model (for non-Grok skills: codex, gemini, chatgpt, etc.)

    Args:
        skill_path: Relative path under skills/
        platform: Target platform ("grok", "openai", "gemini", etc.). Defaults to "grok".

    Returns:
        Dict with status and path to the created/updated file.
    """
    target_dir = SKILLS_ROOT / skill_path
    if not target_dir.exists():
        return {"error": f"Skill path does not exist: {skill_path}"}

    skill_md = target_dir / "SKILL.md"
    if not skill_md.exists():
        return {"error": "SKILL.md not found in the specified skill folder"}

    content = skill_md.read_text(encoding="utf-8")

    # Extract frontmatter
    frontmatter = {}
    try:
        if content.startswith("---"):
            end = content.find("---", 3)
            if end != -1:
                frontmatter = yaml.safe_load(content[3:end]) or {}
    except Exception:
        pass

    name = frontmatter.get("name", target_dir.name)
    description = frontmatter.get("description", "")
    price = frontmatter.get("price", 5)
    tags = frontmatter.get("tags", [])
    version = str(frontmatter.get("version", "1.0.0"))

    # Improved extraction for Compatibility and Permissions
    compatibility_note = ""
    permissions_data = {
        "profile": "",
        "tools_used": {
            "terminal_shell": "",
            "read_files": "",
            "write_files": "",
            "browser": "",
            "network_access": ""
        },
        "file_scopes": [],
        "environment_variables": [],
        "allowed_hosts": [],
        "notes": ""
    }

    try:
        if "## Compatibility" in content:
            comp_start = content.find("## Compatibility") + len("## Compatibility")
            comp_end = content.find("\n## ", comp_start)
            if comp_end == -1:
                comp_end = len(content)
            compatibility_note = content[comp_start:comp_end].strip()

        if "## Permissions" in content:
            perm_start = content.find("## Permissions") + len("## Permissions")
            perm_end = content.find("\n## ", perm_start)
            if perm_end == -1:
                perm_end = len(content)
            perm_text = content[perm_start:perm_end].strip()

            if "Permission Profile" in perm_text:
                profile_line = perm_text.split("Permission Profile")[-1].split("\n")[0]
                permissions_data["profile"] = profile_line.strip(": ").strip("**").strip()

            tools_section = ""
            if "**Tools Used**" in perm_text:
                tools_section = perm_text.split("**Tools Used**")[-1]
            elif "Tools Used" in perm_text:
                tools_section = perm_text.split("Tools Used")[-1]

            if tools_section:
                for line in tools_section.split("\n"):
                    line = line.strip().lstrip("-* ").strip().replace("**", "")
                    lower = line.lower()
                    if "terminal" in lower:
                        permissions_data["tools_used"]["terminal_shell"] = line.split(":", 1)[-1].strip() if ":" in line else line
                    elif "read files" in lower:
                        permissions_data["tools_used"]["read_files"] = line.split(":", 1)[-1].strip() if ":" in line else line
                    elif "write files" in lower:
                        permissions_data["tools_used"]["write_files"] = line.split(":", 1)[-1].strip() if ":" in line else line
                    elif "browser" in lower:
                        permissions_data["tools_used"]["browser"] = line.split(":", 1)[-1].strip() if ":" in line else line
                    elif "network access" in lower or "network" in lower:
                        permissions_data["tools_used"]["network_access"] = line.split(":", 1)[-1].strip() if ":" in line else line

            if "**File Scopes**" in perm_text or "File Scopes" in perm_text:
                scopes_section = perm_text.split("File Scopes")[-1]
                for line in scopes_section.split("\n"):
                    line = line.strip()
                    if (line.startswith("-") or line.startswith("*")) and "Notes" not in line and "Allowed" not in line:
                        scope = line.lstrip("-* ").strip().strip("`")
                        if scope and not scope.lower().startswith("notes"):
                            permissions_data["file_scopes"].append(scope)

            if "Environment Variables" in perm_text:
                env_section = perm_text.split("Environment Variables")[-1]
                for line in env_section.split("\n"):
                    line = line.strip()
                    if line.startswith("-") or line.startswith("*"):
                        env = line.lstrip("-* ").strip()
                        if env:
                            permissions_data["environment_variables"].append(env)

            if "Allowed Hosts" in perm_text:
                hosts_section = perm_text.split("Allowed Hosts")[-1]
                for line in hosts_section.split("\n"):
                    line = line.strip()
                    if line.startswith("-") or line.startswith("*"):
                        host = line.lstrip("-* ").strip().strip("`")
                        if host:
                            permissions_data["allowed_hosts"].append(host)

            if not permissions_data["notes"]:
                permissions_data["notes"] = perm_text[:600]
    except Exception:
        pass

    # Create agents directory
    agents_dir = target_dir / "agents"
    agents_dir.mkdir(exist_ok=True)

    filename = f"{platform}.yaml"
    meta_path = agents_dir / filename

    short_desc = description[:64] if description else f"{name} skill for {platform}"

    # Infer target_model for non-Grok skills (conservative for now)
    target_model = None
    if platform != "grok":
        folder_lower = target_dir.name.lower()
        if "codex" in folder_lower:
            target_model = "codex"
        elif "gemini" in folder_lower:
            target_model = "gemini"
        elif "chatgpt" in folder_lower:
            target_model = "chatgpt"
        elif "claude" in folder_lower:
            target_model = "claude"
        else:
            target_model = platform

    # Best-effort agensi_slug
    agensi_slug = frontmatter.get("slug") or name.lower().replace(" ", "-").replace("_", "-")

    data = {
        "interface": {
            "display_name": name,
            "short_description": short_desc,
            "default_prompt": f"Use the {name} skill when..."
        },
        "metadata": {
            "price": price,
            "tags": tags,
            "version": version,
            "target_agent": platform,
            "target_model": target_model,
            "agensi_slug": agensi_slug
        },
        "compatibility": {
            "note": compatibility_note or f"This skill is optimized for **{platform.capitalize()}**."
        },
        "permissions": permissions_data
    }

    meta_path.write_text(yaml.dump(data, sort_keys=False, default_flow_style=False, allow_unicode=True), encoding="utf-8")

    return {
        "status": "success",
        "message": f"Created/updated {filename}",
        "path": str(meta_path.relative_to(SKILLS_ROOT)),
        "platform": platform
    }


def prepare_skills_for_publishing(
    paths: List[str],
    target_status: str = "ready-to-list",
    platform: str = "grok"
) -> Dict[str, Any]:
    """Higher-level convenience tool for future automation.

    Takes a list of skill paths (usually from working-state), moves them into
    the correct ready-to-list or ready-to-update bucket (based on their price
    in SKILL.md), and automatically creates the agents/<platform>.yaml metadata
    file using ensure_ready_metadata.

    It now also tries to record:
    - agensi_slug (for mapping live Agensi data back to local folders)
    - target_model (for non-Grok skills)

    This is the recommended single-step tool when you want to "graduate" skills
    from working-state into the publishing pipeline.
    """
    import shutil

    results = []

    for raw_path in paths:
        src = SKILLS_ROOT / raw_path
        if not src.exists():
            results.append({"path": raw_path, "status": "error", "message": "Source does not exist"})
            continue

        # Read price from SKILL.md to determine target tier folder
        try:
            content = (src / "SKILL.md").read_text(encoding="utf-8")
            fm = {}
            if content.startswith("---"):
                end = content.find("---", 3)
                if end != -1:
                    fm = yaml.safe_load(content[3:end]) or {}
            price = fm.get("price", 5)
            tier = "free" if price == 0 or price == "0" else str(price)
        except Exception:
            tier = "5"

        target_base = SKILLS_ROOT / target_status / tier
        target_base.mkdir(parents=True, exist_ok=True)

        dest = target_base / src.name

        if dest.exists():
            results.append({
                "path": raw_path,
                "status": "skipped",
                "message": f"Already exists at {dest.relative_to(SKILLS_ROOT)}"
            })
            continue

        # Move the folder
        shutil.move(str(src), str(dest))

        # Determine best platform for the moved skill
        folder_lower = dest.name.lower()
        if "codex" in folder_lower:
            effective_platform = "openai"
        elif "gemini" in folder_lower:
            effective_platform = "gemini"
        elif "chatgpt" in folder_lower:
            effective_platform = "openai"
        else:
            effective_platform = platform

        # Ensure metadata file exists (now also records slug + target_model)
        meta_result = ensure_ready_metadata(str(dest.relative_to(SKILLS_ROOT)), platform=effective_platform)

        results.append({
            "path": raw_path,
            "status": "moved",
            "new_location": str(dest.relative_to(SKILLS_ROOT)),
            "metadata": meta_result
        })

    summary = {
        "total": len(paths),
        "moved": len([r for r in results if r["status"] == "moved"]),
        "skipped": len([r for r in results if r["status"] == "skipped"]),
        "errors": len([r for r in results if r["status"] == "error"]),
    }

    return {
        "results": results,
        "summary": summary
    }


def suggest_high_priority_actions() -> Dict[str, Any]:
    """Standalone convenience tool that only returns high-priority publish and update recommendations.

    This is an alias for suggest_publishing_actions(min_priority="high") for extra clarity
    in the MCP interface.
    """
    return suggest_publishing_actions(min_priority="high")


async def generate_health_report(save: bool = True, include_suggestions: bool = True) -> str:
    """High-level orchestrator: scan + fetch + compare + (optionally) write file.

    When include_suggestions=True, it internally calls suggest_publishing_actions
    (high priority only) and embeds the recommendations in the report.
    """
    logger.info("Generating full health report...")

    local = scan_local_skills(include_internal=True)
    published = await fetch_published_skills(force_refresh=True)

    comparison = compare_local_vs_published(local, published)
    report_md = format_health_report(comparison)
    report_md += format_multi_root_footprint_section(aggregate_footprint())

    # Optionally include focused high-priority publishing recommendations
    if include_suggestions:
        try:
            suggestions = suggest_publishing_actions(min_priority="high")
            if suggestions.get("recommendations"):
                suggestion_md = "\n## 🔥 High-Priority Publishing Recommendations\n\n"
                for rec in suggestions["recommendations"][:8]:  # limit output
                    suggestion_md += f"- **{rec['action'].upper()}** — *{rec['skill_name']}*\n"
                    suggestion_md += f"  Current: `{rec['current_status']}` → Suggested: `{rec['suggested_status']}`\n"
                    suggestion_md += f"  Reason: {rec['reason']}\n\n"
                report_md += suggestion_md
        except Exception as e:
            logger.warning(f"Failed to include suggestions in report: {e}")

    if save:
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H%M%SZ")
        out_path = REPORTS_DIR / f"health_report_{ts}.md"
        out_path.write_text(report_md, encoding="utf-8")
        logger.info(f"Health report written to {out_path}")
        # Also keep a latest symlink-like copy
        latest = REPORTS_DIR / "health_report_latest.md"
        latest.write_text(report_md, encoding="utf-8")

    return report_md


# -----------------------------------------------------------------------------
# MCP Tool Handlers
# -----------------------------------------------------------------------------
@server.list_tools()
async def list_tools() -> List[types.Tool]:
    """Advertise the four primary catalog tools."""
    return [
        types.Tool(
            name="scan_local_skills",
            description="Scan the entire local Agensi skill library (price tiers + internal). Returns rich metadata including author detection for Grok-authored skills.",
            inputSchema={
                "type": "object",
                "properties": {
                    "include_internal": {"type": "boolean", "default": True, "description": "Include skills in the internal/ folder"}
                },
            },
        ),
        types.Tool(
            name="fetch_published_skills",
            description="Fetch your current published listings from Agensi (with author information). Results are cached locally for speed.",
            inputSchema={
                "type": "object",
                "properties": {
                    "force_refresh": {"type": "boolean", "default": False}
                },
            },
        ),
        types.Tool(
            name="scan_local_roots",
            description="Read-only multi-root scan using agensi-sync.config.json. Returns normalized local skill records for Codex, Gemini, Grok, and any configured roots.",
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="aggregate_footprint",
            description="Read-only footprint summary using shared marketplace cache plus configured local roots. Reports cap status and ready-to-list pressure.",
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="validate_publish_intent",
            description="Read-only guardrail for proposed publish/update/list actions. Blocks new listings when cap pressure or missing version metadata is detected.",
            inputSchema={
                "type": "object",
                "properties": {
                    "skill_id": {"type": "string", "description": "Local ID or marketplace slug to check"},
                    "action": {
                        "type": "string",
                        "default": "publish",
                        "description": "Intended action: publish, update, list, ready-to-list, delist"
                    }
                },
                "required": ["skill_id"]
            },
        ),
        types.Tool(
            name="compare_local_vs_published",
            description="Perform a full cross-reference. Returns structured data separating your Grok-authored published skills, other authors' skills you listed, unpublished Grok work, and version drift.",
            inputSchema={"type": "object", "properties": {}},
        ),
        types.Tool(
            name="generate_health_report",
            description="The primary autonomous workflow tool. Runs scan + fetch + compare and returns a complete markdown health & publishing status report. When include_suggestions=True, it internally calls the high-priority publishing recommender and embeds focused recommendations. Optionally persists the report.",
            inputSchema={
                "type": "object",
                "properties": {
                    "save": {"type": "boolean", "default": True, "description": "Write the report to reports/health_report_*.md"},
                    "include_suggestions": {
                        "type": "boolean",
                        "default": True,
                        "description": "When true, internally calls suggest_publishing_actions (high priority only) and includes the recommendations in the report."
                    }
                },
            },
        ),
        types.Tool(
            name="record_published_version",
            description="Write capability. After publishing or updating a skill on Agensi, record the published version + timestamp. Creates/updates marketplace.json (preferred) or PUBLISHED.md inside the skill folder. This enables better offline drift detection and triggers 'Flagging' (Consensus Item 5) for stale ports in other agent roots.",
            inputSchema={
                "type": "object",
                "properties": {
                    "skill_path": {
                        "type": "string",
                        "description": "Relative path to the skill folder under the model root (e.g. 'listed/5/task-finisher-with-grok' or 'ready-to-update/7/my-skill')"
                    },
                    "model_family": {
                        "type": "string",
                        "default": "grok",
                        "description": "The model family (root) this skill belongs to (grok, gemini, codex)."
                    },
                    "version": {"type": "string", "description": "The version you just published (e.g. '1.2.0')"},
                    "published_at": {"type": "string", "description": "ISO timestamp of publication (default: now)"},
                    "installs": {"type": "integer"},
                    "views": {"type": "integer"},
                    "slug": {"type": "string", "description": "Agensi slug if different from folder name"}
                },
                "required": ["skill_path", "version"]
            },
        ),
        types.Tool(
            name="suggest_publishing_actions",
            description="Dedicated tool that returns structured publish and update recommendations. Supports automatic creation of agents/grok.yaml when moving skills into ready states (via auto_prepare_metadata).",
            inputSchema={
                "type": "object",
                "properties": {
                    "min_priority": {
                        "type": "string",
                        "enum": ["high", "medium", "low"],
                        "default": "low",
                        "description": "Only return recommendations at or above this priority level."
                    },
                    "auto_prepare_metadata": {
                        "type": "boolean",
                        "default": False,
                        "description": "If true, automatically creates agents/grok.yaml (using ensure_ready_metadata) for any skill recommended for ready-to-list or ready-to-update that is missing metadata."
                    }
                }
            },
        ),
        types.Tool(
            name="suggest_high_priority_actions",
            description="Standalone convenience alias for suggest_publishing_actions with min_priority='high'. Returns only the most critical publish and update recommendations (high priority items only).",
            inputSchema={"type": "object", "properties": {}},  # no parameters
        ),
        types.Tool(
            name="ensure_ready_metadata",
            description="Creates (or updates) a properly populated agents/<platform>.yaml file for a skill. Intended to be called when moving a skill into ready-to-list or ready-to-update. Reads SKILL.md to generate good defaults.",
            inputSchema={
                "type": "object",
                "properties": {
                    "skill_path": {
                        "type": "string",
                        "description": "Relative path under skills/ (e.g. 'ready-to-list/5/my-skill' or 'working-state/internal/foo')"
                    },
                    "platform": {
                        "type": "string",
                        "default": "grok",
                        "description": "Target platform: 'grok', 'openai', 'gemini', etc."
                    }
                },
                "required": ["skill_path"]
            },
        ),
        types.Tool(
            name="prepare_skills_for_publishing",
            description="High-level automation tool. Takes a list of skill paths (usually from working-state), moves them into the correct ready-to-list or ready-to-update bucket (based on price in SKILL.md), and automatically creates the agents/grok.yaml metadata file. Combines moving + metadata preparation in one step.",
            inputSchema={
                "type": "object",
                "properties": {
                    "paths": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of relative paths under skills/ to prepare (e.g. ['working-state/internal/my-skill'])"
                    },
                    "target_status": {
                        "type": "string",
                        "enum": ["ready-to-list", "ready-to-update"],
                        "default": "ready-to-list",
                        "description": "Which bucket to move the skills into"
                    },
                    "platform": {
                        "type": "string",
                        "default": "grok",
                        "description": "Platform for the metadata file (grok, openai, gemini...)"
                    }
                },
                "required": ["paths"]
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[types.TextContent]:
    """Route tool calls to the appropriate implementation."""
    try:
        if name == "scan_local_skills":
            include = arguments.get("include_internal", True)
            data = scan_local_skills(include)
            return [types.TextContent(type="text", text=json.dumps(data, indent=2, ensure_ascii=False))]

        elif name == "fetch_published_skills":
            force = arguments.get("force_refresh", False)
            data = await fetch_published_skills(force)
            return [types.TextContent(type="text", text=json.dumps(data, indent=2, ensure_ascii=False))]

        elif name == "scan_local_roots":
            data = scan_local_roots()
            return [types.TextContent(type="text", text=json.dumps(data, indent=2, ensure_ascii=False))]

        elif name == "aggregate_footprint":
            data = aggregate_footprint()
            return [types.TextContent(type="text", text=json.dumps(data, indent=2, ensure_ascii=False))]

        elif name == "validate_publish_intent":
            skill_id = arguments.get("skill_id", "")
            action = arguments.get("action", "publish")
            data = validate_publish_intent(skill_id, action)
            return [types.TextContent(type="text", text=json.dumps(data, indent=2, ensure_ascii=False))]

        elif name == "compare_local_vs_published":
            local = scan_local_skills(include_internal=True)
            published = await fetch_published_skills(force_refresh=False)
            comp = compare_local_vs_published(local, published)
            return [types.TextContent(type="text", text=json.dumps(comp, indent=2, ensure_ascii=False))]

        elif name == "generate_health_report":
            save = arguments.get("save", True)
            include_suggestions = arguments.get("include_suggestions", True)
            report = await generate_health_report(save=save, include_suggestions=include_suggestions)
            return [types.TextContent(type="text", text=report)]

        elif name == "record_published_version":
            skill_path = arguments.get("skill_path")
            model_family = arguments.get("model_family", "grok")
            version = arguments.get("version")
            published_at = arguments.get("published_at") or datetime.now(timezone.utc).isoformat()
            installs = arguments.get("installs")
            views = arguments.get("views")
            slug = arguments.get("slug")

            if not skill_path or not version:
                return [types.TextContent(type="text", text="ERROR: skill_path and version are required")]

            root_config = configured_roots().get(model_family)
            if not root_config:
                return [types.TextContent(type="text", text=f"ERROR: Unknown model family '{model_family}'")]

            root_path = Path(str(root_config.get("local_root", "")))
            target_dir = root_path / skill_path
            if not target_dir.exists():
                return [types.TextContent(type="text", text=f"ERROR: Skill folder not found: {target_dir}")]

            # Write preferred structured format
            data = {
                "version": version,
                "published_at": published_at,
            }
            if installs is not None:
                data["installs"] = installs
            if views is not None:
                data["views"] = views
            if slug:
                data["slug"] = slug

            json_path = target_dir / "marketplace.json"
            json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

            # Also write a human-friendly PUBLISHED.md
            md_content = f"""# Published on Agensi

- **Version**: {version}
- **Published at**: {published_at}
"""
            if installs is not None:
                md_content += f"- **Installs**: {installs}\n"
            if views is not None:
                md_content += f"- **Views**: {views}\n"
            if slug:
                md_content += f"- **Agensi Slug**: {slug}\n"

            (target_dir / "PUBLISHED.md").write_text(md_content, encoding="utf-8")

            # Implementation of "Flagging" (Consensus Item 5)
            final_slug = slug or data.get("slug")
            if not final_slug:
                # Try to extract it from the SKILL.md frontmatter or folder name
                skill_md = target_dir / "SKILL.md"
                fm = parse_skill_frontmatter(skill_md) if skill_md.exists() else {}
                final_slug = fm.get("agensi_slug") or fm.get("slug") or slugify(target_dir.name)

            if final_slug:
                try:
                    flag_stale_ports(final_slug, version, target_dir)
                except Exception as e:
                    logger.warning(f"Flagging stale ports failed: {e}")

            return [types.TextContent(type="text", text=f"Successfully recorded published version {version} for {skill_path} in {model_family} root")]

        elif name == "suggest_publishing_actions":
            min_priority = arguments.get("min_priority", "low")
            auto_prepare = arguments.get("auto_prepare_metadata", False)
            actions = suggest_publishing_actions(min_priority=min_priority, auto_prepare_metadata=auto_prepare)
            return [types.TextContent(type="text", text=json.dumps(actions, indent=2, ensure_ascii=False))]

        elif name == "suggest_high_priority_actions":
            actions = suggest_high_priority_actions()
            return [types.TextContent(type="text", text=json.dumps(actions, indent=2, ensure_ascii=False))]

        elif name == "ensure_ready_metadata":
            skill_path = arguments.get("skill_path")
            platform = arguments.get("platform", "grok")
            result = ensure_ready_metadata(skill_path, platform=platform)
            return [types.TextContent(type="text", text=json.dumps(result, indent=2, ensure_ascii=False))]

        elif name == "prepare_skills_for_publishing":
            paths = arguments.get("paths", [])
            target_status = arguments.get("target_status", "ready-to-list")
            platform = arguments.get("platform", "grok")
            result = prepare_skills_for_publishing(paths, target_status=target_status, platform=platform)
            return [types.TextContent(type="text", text=json.dumps(result, indent=2, ensure_ascii=False))]

        else:
            return [types.TextContent(type="text", text=f"ERROR: Unknown tool '{name}'")]

    except Exception as exc:
        logger.exception(f"Tool {name} failed")
        return [types.TextContent(type="text", text=f"ERROR in {name}: {exc}")]


# -----------------------------------------------------------------------------
# Server Entry Point
# -----------------------------------------------------------------------------
async def main() -> None:
    logger.info("Starting Agensi Catalog MCP Server (combined local + Agensi access)")
    logger.info(f"Skills root: {SKILLS_ROOT}")
    logger.info(f"Reports will be written under: {REPORTS_DIR}")
    logger.info(f"Marketplace cache: {CACHE_FILE}")

    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user.")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)
