provider "aws" {
  region = var.aws_region
}

# --- Identificador único para evitar colisiones ---
resource "random_id" "suffix" {
  byte_length = 4
}

# --- Bucket S3 para hosting del frontend ---
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "sena-frontend-${random_id.suffix.hex}"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  tags = {
    Name        = "Frontend S3"
    Environment = var.environment
  }
}

# --- CloudFront para CDN del frontend ---
resource "aws_cloudfront_distribution" "frontend_cdn" {
  enabled = true

  origin {
    domain_name = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id   = "frontendS3"
  }

  default_cache_behavior {
    target_origin_id       = "frontendS3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name        = "Frontend CDN"
    Environment = var.environment
  }
}

# --- Base de datos RDS (MySQL) ---
resource "aws_db_instance" "rds_mysql" {
  identifier              = "sena-db-${random_id.suffix.hex}"
  allocated_storage       = 20
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = "db.t3.micro"
  username                = var.db_username
  password                = var.db_password
  skip_final_snapshot     = true
  publicly_accessible     = true
  deletion_protection     = false

  tags = {
    Name        = "RDS MySQL"
    Environment = var.environment
  }
}

# --- Backend con Elastic Beanstalk ---
resource "aws_elastic_beanstalk_application" "backend_app" {
  name        = "sena-backend-${random_id.suffix.hex}"
  description = "Aplicación backend para restaurante SENA"
}

resource "aws_elastic_beanstalk_environment" "backend_env" {
  name                = "backend-env-${random_id.suffix.hex}"
  application         = aws_elastic_beanstalk_application.backend_app.name
  solution_stack_name = "64bit Amazon Linux 2 v5.8.7 running Node.js 18"

  tags = {
    Name        = "Backend Env"
    Environment = var.environment
  }
}