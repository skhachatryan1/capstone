output "database_instance" {
  value = google_sql_database_instance.database_instance.name
}
output "database" {
  value = google_sql_database.database.id
}
output "db_user" {
  value = google_sql_user.db_user.name
}
output "db_host" {
  value = google_sql_database_instance.database_instance.private_ip_address
}
output "db_name" {
  value = google_sql_database.database.name
}
output "db_password" {
  sensitive = true
  value     = random_password.password.result
}
