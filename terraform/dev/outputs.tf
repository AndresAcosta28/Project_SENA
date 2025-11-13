# --- Outputs útiles ---

output "frontend_bucket_name" {
  description = "Nombre del bucket S3 del frontend"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "frontend_bucket_website_endpoint" {
  description = "Endpoint del website S3"
  value       = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
}

output "cloudfront_domain" {
  description = "Dominio de CloudFront para acceder al frontend"
  value       = aws_cloudfront_distribution.frontend_cdn.domain_name
}

output "cloudfront_url" {
  description = "URL completa de CloudFront"
  value       = "https://${aws_cloudfront_distribution.frontend_cdn.domain_name}"
}

output "rds_endpoint" {
  description = "Endpoint de la base de datos RDS"
  value       = aws_db_instance.rds_mysql.endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "Nombre de la base de datos"
  value       = aws_db_instance.rds_mysql.db_name
}

output "backend_url" {
  description = "URL del backend en Elastic Beanstalk"
  value       = aws_elastic_beanstalk_environment.backend_env.endpoint_url
}

output "beanstalk_cname" {
  description = "CNAME del ambiente Elastic Beanstalk"
  value       = aws_elastic_beanstalk_environment.backend_env.cname
}