output "d1_database_id" {
  value       = cloudflare_d1_database.app_db.id
  description = "D1 Database ID"
}

output "worker_script_name" {
  value       = cloudflare_worker_script.api.name
  description = "Deployed Worker script name"
}

output "worker_route_pattern" {
  value       = cloudflare_worker_route.api_route.pattern
  description = "Worker route pattern"
}
