output "eks_cluster_name" {
  value       = module.eks.cluster_name
  description = "EKS cluster name"
}

output "aurora_global_endpoint" {
  value       = aws_rds_global_cluster.main.global_cluster_identifier
  description = "Aurora Global Database endpoint"
}

output "sqs_queue_url" {
  value       = aws_sqs_queue.background.url
  description = "SQS background queue URL"
}
