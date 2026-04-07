terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "aws" {
  alias  = "eu-west-1"
  region = "eu-west-1"
}

module "eks" {
  source = "../../modules/eks"

  vpc_id             = aws_vpc.main.id
  private_subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  environment        = "scale"
}

resource "aws_rds_global_cluster" "main" {
  global_cluster_identifier = "scale-aurora-global"
  engine                    = "aurora-postgresql"
  engine_version            = "16.3"
}

resource "aws_rds_cluster" "primary" {
  provider                  = aws
  cluster_identifier        = "scale-aurora-primary"
  engine                    = aws_rds_global_cluster.main.engine
  engine_version            = aws_rds_global_cluster.main.engine_version
  database_name             = "app"
  master_username           = "appuser"
  master_password           = var.db_password
  global_cluster_identifier = aws_rds_global_cluster.main.id
  db_subnet_group_name      = aws_db_subnet_group.main.name
  vpc_security_group_ids    = [aws_security_group.rds.id]
}

resource "aws_rds_cluster" "secondary" {
  provider                  = aws.eu-west-1
  cluster_identifier        = "scale-aurora-secondary"
  engine                    = aws_rds_global_cluster.main.engine
  engine_version            = aws_rds_global_cluster.main.engine_version
  global_cluster_identifier = aws_rds_global_cluster.main.id
  db_subnet_group_name      = aws_db_subnet_group.eu.name
  vpc_security_group_ids    = [aws_security_group.rds.id]
}

resource "aws_sqs_queue" "background" {
  name = "scale-background-queue"
}
