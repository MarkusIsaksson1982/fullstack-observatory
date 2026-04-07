terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "alb" {
  source = "../../modules/alb"

  vpc_id             = aws_vpc.main.id
  subnet_ids         = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  security_group_ids = [aws_security_group.alb.id]
  environment        = "startup"
  target_port        = 8080
}

module "rds" {
  source = "../../modules/rds"

  vpc_id               = aws_vpc.main.id
  db_subnet_group_name = aws_db_subnet_group.main.name
  security_group_id    = aws_security_group.rds.id
  environment          = "startup"
  db_password          = var.db_password
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "startup-cache-subnet"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "startup-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.cache.id]
}

resource "aws_launch_template" "app" {
  name_prefix   = "startup-app-"
  image_id      = "ami-0c7217cdde40c4772"
  instance_type = "t3.micro"

  vpc_security_group_ids = [aws_security_group.asg.id]

  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo "Full Stack App starting on EC2 (Layer 6 Startup)" > /var/www/index.html
    # Your app deployment logic here (Layer 7)
    EOF
  )
}

resource "aws_autoscaling_group" "main" {
  name                = "startup-asg"
  vpc_zone_identifier = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  min_size            = 2
  max_size            = 10
  desired_capacity    = 2

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  target_group_arns = [module.alb.target_group_arn]

  tag {
    key                 = "Name"
    value               = "startup-app"
    propagate_at_launch = true
  }
}
