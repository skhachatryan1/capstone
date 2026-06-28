variable "namespace" {
  type    = string
  default = "apex-app"
}
variable "db_host" { type = string }
variable "db_name" { type = string }
variable "db_user" { type = string }
variable "db_port" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}
variable "nexus_user" { type = string }
variable "nexus_pass" { type = string }
variable "nexus_registry" { type = string }

variable "jwt_access_secret" { type = string }
variable "jwt_refresh_secret" { type = string }
variable "salt" { type = string }

variable "jwt_access_expires_in" { type = string }
variable "jwt_refresh_expires_in" { type = string }
variable "cors_origin" { type = string }

variable "ingress_ip" { type = string }
