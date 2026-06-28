variable "project" {
  type = string
}
variable "region" {
  type = string
}
variable "ip_cidr_range" {
  type    = string
  default = "10.0.0.0/24"
}

variable "nexus_user" { type = string }
variable "nexus_pass" { type = string }

variable "jwt_access_secret" { type = string }
variable "jwt_refresh_secret" { type = string }
variable "salt" { type = string }

variable "jwt_access_expires_in" { type = string }
variable "jwt_refresh_expires_in" { type = string }
