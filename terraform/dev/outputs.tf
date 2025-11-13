output "frontend_bucket_url" {
  description = "URL del bucket S3 del frontend"
  value       = aws_s3_bucket.frontend_bucket.website_endpoint
}

output "cloudfront_domain" {
  description = "Dominio de distribución CloudFront"
  value       = aws_cloudfront_distribution.frontend_cdn.domain_name
}

output "rds_endpoint" {
  description = "Endpoint de la base de datos RDS"
  value       = aws_db_instance.rds_mysql.endpoint
}

output "beanstalk_url" {
  description = "URL del entorno Elastic Beanstalk"
  value       = aws_elastic_beanstalk_environment.backend_env.endpoint_url
}
