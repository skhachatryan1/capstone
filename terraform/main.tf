module "network" {
  source        = "./modules/network"
  project       = var.project
  region        = var.region
  ip_cidr_range = var.ip_cidr_range
}

module "sql" {
  source                = "./modules/sql"
  region                = var.region
  network               = module.network.network_id
  depends_on            = [module.network]
  networking_connection = module.network.networking_connection
}

module "cluster" {
  source  = "./modules/cluster"
  region  = var.region
  network = module.network.network_id
  subnet  = module.network.subnet_id
}

module "helm_nexus" {
  source     = "./modules/helm_nexus"
  nexus_ip   = module.network.nexus_ip
  depends_on = [module.cluster]
}
module "helm_app" {
  source                 = "./modules/helm_app"
  depends_on             = [module.cluster, module.sql]
  db_host                = module.sql.db_host
  db_name                = module.sql.db_name
  db_user                = module.sql.db_user
  db_password            = module.sql.db_password
  db_port                = "5432"
  nexus_user             = var.nexus_user
  nexus_pass             = var.nexus_pass
  nexus_registry         = "${module.network.nexus_ip}:8082"
  jwt_access_secret      = var.jwt_access_secret
  jwt_refresh_secret     = var.jwt_refresh_secret
  jwt_access_expires_in  = var.jwt_access_expires_in
  jwt_refresh_expires_in = var.jwt_refresh_expires_in
  cors_origin            = module.network.ingress_ip
  salt                   = var.salt
  ingress_ip             = module.network.ingress_ip
}
