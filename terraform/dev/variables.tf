variable "aws_region" {
  description = "Región AWS para desplegar los recursos"
  type        = string
  default     = "us-east-1"
}

variable "db_username" {
  description = "Usuario de la base de datos"
  type        = string
  default     = "admin"
}

variable "environment" {
  description = "Nombre del entorno (dev, prod, etc.)"
  type        = string
  default     = "dev"
}
