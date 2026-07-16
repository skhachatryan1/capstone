terraform {
  backend "gcs" {
    bucket = "apex-capstone-bucket"
    prefix = "terraform/state"
  }
}
