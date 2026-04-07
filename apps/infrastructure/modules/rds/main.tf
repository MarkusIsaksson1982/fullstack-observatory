resource "aws_db_instance" "main" {
  identifier             = "${var.environment}-rds"
  engine                 = "postgres"
  engine_version         = "16.3"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = "app"
  username               = "appuser"
  password               = var.db_password
  vpc_security_group_ids = [var.security_group_id]
  db_subnet_group_name   = var.db_subnet_group_name
  multi_az               = true
  skip_final_snapshot    = true
}
