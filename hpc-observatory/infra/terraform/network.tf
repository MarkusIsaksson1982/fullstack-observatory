resource "aws_vpc" "hpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-vpc"
  })
}

resource "aws_subnet" "compute" {
  vpc_id                  = aws_vpc.hpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = false

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-compute-subnet"
    Role = "compute"
  })
}

resource "aws_subnet" "gpu" {
  vpc_id                  = aws_vpc.hpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.region}b"
  map_public_ip_on_launch = false

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-gpu-subnet"
    Role = "gpu"
  })
}

resource "aws_internet_gateway" "hpc" {
  vpc_id = aws_vpc.hpc.id

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-igw"
  })
}

resource "aws_route_table" "hpc" {
  vpc_id = aws_vpc.hpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.hpc.id
  }

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-rt"
  })
}

resource "aws_route_table_association" "compute" {
  subnet_id      = aws_subnet.compute.id
  route_table_id = aws_route_table.hpc.id
}

resource "aws_route_table_association" "gpu" {
  subnet_id      = aws_subnet.gpu.id
  route_table_id = aws_route_table.hpc.id
}

resource "aws_security_group" "hpc_nodes" {
  name        = "${var.cluster_name}-nodes"
  description = "Security group for HPC compute nodes"
  vpc_id      = aws_vpc.hpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-sg"
  })
}
