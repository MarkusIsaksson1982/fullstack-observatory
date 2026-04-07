resource "aws_vpc" "main" {
  cidr_block = "10.1.0.0/16"

  tags = {
    Name = "scale-vpc"
  }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.1.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "scale-private-a"
  }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.1.2.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "scale-private-b"
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "scale-db-subnet"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

resource "aws_db_subnet_group" "eu" {
  provider   = aws.eu-west-1
  name       = "scale-eu-db-subnet"
  subnet_ids = []
}

resource "aws_security_group" "rds" {
  vpc_id = aws_vpc.main.id
  name   = "scale-rds-sg"
}
