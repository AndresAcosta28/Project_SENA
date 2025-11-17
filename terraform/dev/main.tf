provider "aws" {
  region = var.aws_region
}

# --- Identificador único ---
resource "random_id" "suffix" {
  byte_length = 4
}

# --- S3 Bucket para frontend ---
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "sena-frontend-${random_id.suffix.hex}"

  tags = {
    Name        = "Frontend S3"
    Environment = var.environment
  }
}

# --- Configuración de website ---
resource "aws_s3_bucket_website_configuration" "frontend_website" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# --- Hacer el bucket público ---
resource "aws_s3_bucket_public_access_block" "frontend_public" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend_public]
}

# --- CloudFront Distribution ---
resource "aws_cloudfront_distribution" "frontend_cdn" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket_website_configuration.frontend_website.website_endpoint
    origin_id   = "frontendS3"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "frontendS3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
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

# --- Security Group para RDS ---
resource "aws_security_group" "rds_sg" {
  name        = "sena-rds-sg-${random_id.suffix.hex}"
  description = "Security group para RDS MySQL"

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # INSEGURO - Solo para desarrollo/académico
    description = "MySQL access from anywhere - CAMBIAR EN PRODUCCIÓN"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "RDS Security Group"
    Environment = var.environment
  }
}

# --- Security Group para Elastic Beanstalk ---
resource "aws_security_group" "backend_sg" {
  name        = "sena-backend-sg-${random_id.suffix.hex}"
  description = "Security group para Elastic Beanstalk"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "Backend Security Group"
    Environment = var.environment
  }
}

# --- RDS MySQL ---
resource "aws_db_instance" "rds_mysql" {
  identifier           = "sena-db-${random_id.suffix.hex}"
  allocated_storage    = 20
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t3.micro"
  db_name              = "senadb"
  username             = var.db_username
  password             = var.db_password
  skip_final_snapshot  = true
  publicly_accessible  = true
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  tags = {
    Name        = "RDS MySQL"
    Environment = var.environment
  }
}

# --- Elastic Beanstalk Application ---
resource "aws_elastic_beanstalk_application" "backend_app" {
  name        = "sena-backend-${random_id.suffix.hex}"
  description = "Aplicación backend Flask para restaurante SENA"
}

# --- Elastic Beanstalk Environment ---
resource "aws_elastic_beanstalk_environment" "backend_env" {
  name                = "backend-env-${random_id.suffix.hex}"
  application         = aws_elastic_beanstalk_application.backend_app.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.3.2 running Python 3.11"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "aws-elasticbeanstalk-ec2-role"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.backend_sg.id
  }

  # Variables de entorno RDS
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_HOST"
    value     = aws_db_instance.rds_mysql.address
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_USER"
    value     = var.db_username
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_PASSWORD"
    value     = var.db_password
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_NAME"
    value     = "senadb"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_PORT"
    value     = "3306"
  }

  tags = {
    Name        = "Backend Env"
    Environment = var.environment
  }
}
