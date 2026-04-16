terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "cluster_name" {
  description = "Name of the HPC cluster"
  type        = string
  default     = "hpc-observatory"
}

variable "cloud_provider" {
  description = "Cloud provider to use: aws, digitalocean, gcp"
  type        = string
  default     = "aws"
}

variable "region" {
  description = "Cloud region"
  type        = string
  default     = "us-east-1"
}

variable "compute_node_config" {
  description = "Configuration for compute nodes"
  type = object({
    instance_type = string
    ami           = string
    count         = number
    spot_enabled  = bool
  })
  default = {
    instance_type = "c5.24xlarge"
    ami           = "ami-0c55b159cbfafe1f0"
    count         = 4
    spot_enabled  = true
  }
}

variable "gpu_node_config" {
  description = "Configuration for GPU nodes"
  type = object({
    instance_type = string
    ami           = string
    count         = number
    spot_enabled  = bool
  })
  default = {
    instance_type = "p4d.24xlarge"
    ami           = "ami-0c55b159cbfafe1f0"
    count         = 2
    spot_enabled  = false
  }
}

provider "aws" {
  region = var.region
}

data "aws_ami" "hpc" {
  most_recent = true
  owners      = ["self"]

  filter {
    name   = "name"
    values = ["hpc-observatory-*"]
  }
}

locals {
  common_tags = {
    Project     = "HPC-Observatory"
    Environment = "demo"
    ManagedBy   = "terraform"
  }
}
