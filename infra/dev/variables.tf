variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-2"
}

variable "aws_account_id" {
  description = "AWS account ID."
  type        = string
  default     = "521018312783"
}

variable "project" {
  description = "Resource name prefix."
  type        = string
  default     = "minneanalytics-dev"
}

variable "container_image" {
  description = "ECR image URI including tag (set by deploy workflow)."
  type        = string
  default     = "public.ecr.aws/docker/library/nginx:stable-alpine"
}

variable "container_port" {
  description = "Container listen port."
  type        = number
  default     = 3000
}

variable "seed_on_start" {
  description = "Run prisma seed on container start (first deploy only)."
  type        = bool
  default     = false
}
