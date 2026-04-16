resource "aws_instance" "compute_node" {
  count         = var.compute_node_config.count
  ami           = var.compute_node_config.ami
  instance_type = var.compute_node_config.instance_type
  subnet_id     = aws_subnet.compute.id

  vpc_security_group_ids = [aws_security_group.hpc_nodes.id]

  root_block_device {
    volume_size = 100
    volume_type = "gp3"
  }

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-compute-${count.index + 1}"
    Role = "compute"
  })

  provisioner "remote-exec" {
    inline = [
      "hostnamectl set-hostname compute-${count.index + 1}",
      "echo '10.0.1.${10 + count.index} compute-${count.index + 1}' >> /etc/hosts"
    ]

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file("~/.ssh/id_rsa")
      host        = self.public_ip
    }
  }
}

resource "aws_instance" "gpu_node" {
  count         = var.gpu_node_config.count
  ami           = var.gpu_node_config.ami
  instance_type = var.gpu_node_config.instance_type
  subnet_id     = aws_subnet.gpu.id

  vpc_security_group_ids = [aws_security_group.hpc_nodes.id]

  root_block_device {
    volume_size = 200
    volume_type = "gp3"
  }

  ebs_block_device {
    device_name = "/dev/sdb"
    volume_size = 500
    volume_type = "gp3"
  }

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-gpu-${count.index + 1}"
    Role = "gpu"
  })
}

resource "aws_lb" "hpc" {
  name               = "${var.cluster_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.hpc_nodes.id]
  subnets            = [aws_subnet.compute.id, aws_subnet.gpu.id]

  enable_deletion_protection = false

  tags = merge(local.common_tags, {
    Name = "${var.cluster_name}-alb"
  })
}

resource "aws_lb_target_group" "scheduler" {
  name     = "${var.cluster_name}-scheduler-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = aws_vpc.hpc.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
}

resource "aws_lb_target_group_attachment" "scheduler" {
  target_group_arn = aws_lb_target_group.scheduler.arn
  target_id        = aws_instance.compute_node[0].id
  port             = 8080
}

resource "aws_lb_listener" "scheduler" {
  load_balancer_arn = aws_lb.hpc.arn
  port              = "8080"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.scheduler.arn
  }
}

output "scheduler_url" {
  description = "URL to access the HPC scheduler"
  value       = "http://${aws_lb.hpc.dns_name}:8080"
}

output "compute_node_ips" {
  description = "Private IPs of compute nodes"
  value       = aws_instance.compute_node[*].private_ip
}

output "gpu_node_ips" {
  description = "Private IPs of GPU nodes"
  value       = aws_instance.gpu_node[*].private_ip
}
