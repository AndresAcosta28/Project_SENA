output "bucket_name" {
  description = "Nombre del bucket creado para pruebas"
  value       = aws_s3_bucket.test_bucket.bucket
}