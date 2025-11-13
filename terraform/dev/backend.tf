terraform {
  backend "s3" {
    bucket         = "project-sena-tfstate"   # Nombre exacto del bucket S3 que creaste
    key            = "dev/terraform.tfstate"  # Ruta dentro del bucket
    region         = "us-east-1"              # Misma región que el bucket y DynamoDB
    dynamodb_table = "sena-tf-locks"          # Tabla que creaste en DynamoDB
    encrypt        = true                     # Encripta el estado automáticamente
  }
}
