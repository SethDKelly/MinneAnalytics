provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "minneanalytics"
      Environment = "dev"
      ManagedBy   = "minneanalytics-terraform"
    }
  }
}

data "aws_caller_identity" "current" {}
data "aws_vpc" "default" { default = true }

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

locals {
  name = var.project
}

resource "aws_ecr_repository" "app" {
  name                 = local.name
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${local.name}"
  retention_in_days = 14
}

resource "aws_efs_file_system" "data" {
  creation_token = "${local.name}-data"
  encrypted      = true
}

resource "aws_efs_access_point" "data" {
  file_system_id = aws_efs_file_system.data.id

  posix_user {
    gid = 1001
    uid = 1001
  }

  root_directory {
    path = "/data"
    creation_info {
      owner_gid   = 1001
      owner_uid   = 1001
      permissions = "755"
    }
  }

  tags = {
    Name = "${local.name}-data"
  }
}

resource "aws_security_group" "efs" {
  name        = "${local.name}-efs"
  description = "EFS for ${local.name}"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_efs_mount_target" "data" {
  for_each        = toset(data.aws_subnets.default.ids)
  file_system_id  = aws_efs_file_system.data.id
  subnet_id       = each.value
  security_groups = [aws_security_group.efs.id]
}

resource "aws_security_group" "alb" {
  name        = "${local.name}-alb"
  description = "ALB for ${local.name}"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs" {
  name        = "${local.name}-ecs"
  description = "ECS tasks for ${local.name}"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "app" {
  name               = local.name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "app" {
  name        = local.name
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    matcher             = "200-399"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

resource "aws_iam_role" "ecs_execution" {
  name = "${local.name}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  name = "${local.name}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_ecs_cluster" "app" {
  name = local.name
}

resource "aws_ecs_task_definition" "app" {
  family                   = local.name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  lifecycle {
    create_before_destroy = true
  }

  container_definitions = jsonencode([{
    name      = "app"
    image     = var.container_image
    essential = true
    portMappings = [{
      containerPort = var.container_port
      hostPort      = var.container_port
      protocol      = "tcp"
    }]
    environment = [
      { name = "DEPLOYMENT_MODE", value = "aws" },
      { name = "DATA_DIR", value = "/data" },
      { name = "DATABASE_URL", value = "file:/data/prisma/dev.db" },
      { name = "UPLOAD_DIR", value = "/data/uploads" },
      { name = "SEED_ON_START", value = var.seed_on_start ? "true" : "false" },
      { name = "NEXT_PUBLIC_APP_URL", value = "http://${aws_lb.app.dns_name}" },
      { name = "NEXT_PUBLIC_SITE_URL", value = "http://${aws_lb.app.dns_name}" },
      { name = "PORT", value = tostring(var.container_port) },
      { name = "HOSTNAME", value = "0.0.0.0" },
    ]
    mountPoints = [{
      sourceVolume  = "data"
      containerPath = "/data"
      readOnly      = false
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.app.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "app"
      }
    }
  }])

  volume {
    name = "data"

    efs_volume_configuration {
      file_system_id = aws_efs_file_system.data.id
      transit_encryption = "ENABLED"

      authorization_config {
        access_point_id = aws_efs_access_point.data.id
        iam             = "DISABLED"
      }
    }
  }
}

resource "aws_ecs_service" "app" {
  name            = local.name
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  health_check_grace_period_seconds = 180

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = var.container_port
  }

  depends_on = [aws_lb_listener.http, aws_efs_mount_target.data]
}
