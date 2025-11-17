# ================================
#           OUTPUTS
# ================================

# --- Frontend ---
output "frontend_cloudfront_url" {
  description = "URL pública del frontend vía CloudFront"
  value       = "https://${aws_cloudfront_distribution.frontend_cdn.domain_name}"
}

output "frontend_s3_bucket" {
  description = "Bucket S3 donde se despliega el frontend"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución de CloudFront (para invalidación)"
  value       = aws_cloudfront_distribution.frontend_cdn.id
}

# --- Backend (Elastic Beanstalk) ---
output "backend_app_name" {
  description = "Nombre de la aplicación de Elastic Beanstalk"
  value       = aws_elastic_beanstalk_application.backend_app.name
}

output "backend_env_name" {
  description = "Nombre del environment de Elastic Beanstalk"
  value       = aws_elastic_beanstalk_environment.backend_env.name
}

output "backend_url" {
  description = "Dominio público del backend en Elastic Beanstalk"
  value       = "http://${aws_elastic_beanstalk_environment.backend_env.cname}"
}

# --- Base de Datos ---
output "database_endpoint" {
  description = "Endpoint del servidor RDS MySQL"
  value       = aws_db_instance.rds_mysql.address
}

output "database_port" {
  description = "Puerto del servidor MySQL"
  value       = aws_db_instance.rds_mysql.port
}
