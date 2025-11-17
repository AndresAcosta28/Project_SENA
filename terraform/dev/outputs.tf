# --- Outputs ---
output "frontend_cloudfront_url" {
  description = "URL de CloudFront para acceder al frontend"
  value       = "https://${aws_cloudfront_distribution.frontend_cdn.domain_name}"
}

output "frontend_s3_bucket" {
  description = "Nombre del bucket S3 para deploy del frontend"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "backend_url" {
  description = "URL de Elastic Beanstalk para el backend API"
  value       = "http://${aws_elastic_beanstalk_environment.backend_env.endpoint_url}"
}

output "database_endpoint" {
  description = "Endpoint de RDS MySQL"
  value       = aws_db_instance.rds_mysql.address
}

output "database_port" {
  description = "Puerto de RDS MySQL"
  value       = aws_db_instance.rds_mysql.port
}
