provider "aws" {
  region = "us-east-1"
}

# Identificador aleatorio para evitar nombres repetidos
resource "random_id" "suffix" {
  byte_length = 4
}

# Recurso de prueba: un bucket S3 temporal
resource "aws_s3_bucket" "test_bucket" {
  bucket = "sena-dev-${random_id.suffix.hex}"
  tags = {
    Name        = "SENA Dev Bucket"
    Environment = "Development"
  }
}


