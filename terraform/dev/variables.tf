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

variable "db_password" {
  description = "Contraseña de la base de datos"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Nombre del entorno (dev, prod, etc.)"
  type        = string
  default     = "dev"
}

variable "amplify_repo_url" {
  description = "URL del repositorio para Amplify"
  type        = string
}

variable "amplify_branch_name" {
  description = "Nombre de la rama para despliegue"
  type        = string
}

variable "github_token" {
  description = "Token OAuth para conectar GitHub con Amplify"
  type        = string
  sensitive   = true
}