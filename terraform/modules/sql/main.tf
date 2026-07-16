resource "google_sql_database_instance" "database_instance" {
  name                = "apex-db-instance"
  database_version    = "POSTGRES_15"
  region              = var.region
  deletion_protection = false

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network
    }
  }

  timeouts {
    create = "60m"
    update = "40m"
    delete = "40m"
  }
  depends_on = [
    var.networking_connection
  ]
}

resource "random_password" "password" {
  length  = 24
  special = false
}
resource "google_sql_database" "database" {
  name     = "apex-db"
  instance = google_sql_database_instance.database_instance.name
}

resource "google_sql_user" "db_user" {
  name     = "apex-db-user"
  instance = google_sql_database_instance.database_instance.name
  password = random_password.password.result
}
