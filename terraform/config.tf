terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.17"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.35"
    }
    nexus = {
      source  = "sonatype-nexus-community/sonatyperepo"
      version = "~> 1.13.0"
    }
  }
}
provider "google" {
  project               = var.project
  region                = var.region
  user_project_override = true
  billing_project       = var.project
}

data "google_client_config" "default" {}

provider "kubernetes" {
  host                   = "https://${module.cluster.cluster_endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.cluster.cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = "https://${module.cluster.cluster_endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(module.cluster.cluster_ca_certificate)
  }
}
