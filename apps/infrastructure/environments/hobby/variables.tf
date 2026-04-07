variable "cloudflare_api_token" {
  description = "Cloudflare API token (sensitive)"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare Zone ID for your domain"
  type        = string
}
