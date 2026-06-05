output "ecr_repository_url" {
  description = "ECR repository URL (without tag)."
  value       = aws_ecr_repository.app.repository_url
}

output "app_url" {
  description = "Public HTTP URL for the dev deployment."
  value       = "http://${aws_lb.app.dns_name}"
}

output "alb_dns_name" {
  description = "ALB DNS name."
  value       = aws_lb.app.dns_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.app.name
}

output "ecs_service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.app.name
}
