terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_d1_database" "app_db" {
  account_id = var.cloudflare_account_id
  name       = "fullstack-hobby-db"
}

resource "cloudflare_worker_script" "api" {
  account_id = var.cloudflare_account_id
  name       = "fullstack-api"

  content = <<EOT
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // D1 is bound as "DB" (configured via Cloudflare dashboard / wrangler when using this Terraform deployment)
  // const { DB } = request.env; // example usage
  return new Response("Hello from Cloudflare Workers + D1 (Layer 6 Hobby)!", {
    status: 200,
    headers: { "content-type": "text/plain" }
  });
}
EOT
}

resource "cloudflare_worker_route" "api_route" {
  zone_id     = var.zone_id
  pattern     = "api.*/*"
  script_name = cloudflare_worker_script.api.name
}
