resource "aws_cloudwatch_log_group" "eks" {
  name              = "/aws/eks/scale-cluster"
  retention_in_days = 30
}

resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  alarm_name          = "scale-eks-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "EKS node CPU > 80%"

  dimensions = {
    AutoScalingGroupName = "scale-eks-ng"
  }
}
