#!/bin/bash

# AWS CLI 自动化配置脚本
# 用于快速创建RDS和EC2资源

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}AWS 资源自动化创建脚本${NC}"
echo -e "${GREEN}=====================================${NC}\n"

# 检查AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}错误: AWS CLI 未安装${NC}"
    echo "请先安装: https://aws.amazon.com/cli/"
    exit 1
fi

# 检查AWS配置
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}错误: AWS CLI 未配置${NC}"
    echo "请运行: aws configure"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI 已配置${NC}\n"

# 设置变量
PROJECT_NAME="kyle-portfolio"
REGION=${AWS_REGION:-us-east-1}
DB_INSTANCE_CLASS=${DB_INSTANCE_CLASS:-db.t3.micro}
DB_ALLOCATED_STORAGE=20
DB_NAME="kyle_portfolio"
DB_USERNAME="postgres"
DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 20)

echo -e "${YELLOW}配置信息:${NC}"
echo "  项目名称: $PROJECT_NAME"
echo "  AWS区域: $REGION"
echo "  数据库类型: PostgreSQL 15"
echo "  实例类型: $DB_INSTANCE_CLASS"
echo "  存储空间: ${DB_ALLOCATED_STORAGE}GB"
echo ""

read -p "是否继续创建资源? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 1. 创建安全组
echo -e "\n${YELLOW}[1/4] 创建安全组...${NC}"

# RDS安全组
RDS_SG_ID=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-rds-sg" \
    --description "Security group for ${PROJECT_NAME} RDS" \
    --region "$REGION" \
    --output text --query 'GroupId')

echo -e "${GREEN}✓ RDS安全组创建成功: $RDS_SG_ID${NC}"

# EC2安全组
EC2_SG_ID=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-ec2-sg" \
    --description "Security group for ${PROJECT_NAME} EC2" \
    --region "$REGION" \
    --output text --query 'GroupId')

echo -e "${GREEN}✓ EC2安全组创建成功: $EC2_SG_ID${NC}"

# 配置EC2安全组规则
aws ec2 authorize-security-group-ingress \
    --group-id "$EC2_SG_ID" \
    --protocol tcp --port 22 --cidr 0.0.0.0/0 \
    --region "$REGION" > /dev/null

aws ec2 authorize-security-group-ingress \
    --group-id "$EC2_SG_ID" \
    --protocol tcp --port 80 --cidr 0.0.0.0/0 \
    --region "$REGION" > /dev/null

aws ec2 authorize-security-group-ingress \
    --group-id "$EC2_SG_ID" \
    --protocol tcp --port 443 --cidr 0.0.0.0/0 \
    --region "$REGION" > /dev/null

aws ec2 authorize-security-group-ingress \
    --group-id "$EC2_SG_ID" \
    --protocol tcp --port 8080 --cidr 0.0.0.0/0 \
    --region "$REGION" > /dev/null

# 配置RDS安全组规则 (允许EC2访问)
aws ec2 authorize-security-group-ingress \
    --group-id "$RDS_SG_ID" \
    --protocol tcp --port 5432 \
    --source-group "$EC2_SG_ID" \
    --region "$REGION" > /dev/null

echo -e "${GREEN}✓ 安全组规则配置完成${NC}"

# 2. 创建RDS实例
echo -e "\n${YELLOW}[2/4] 创建 RDS PostgreSQL 实例...${NC}"
echo -e "${YELLOW}(这可能需要5-10分钟)${NC}"

aws rds create-db-instance \
    --db-instance-identifier "${PROJECT_NAME}-db" \
    --db-instance-class "$DB_INSTANCE_CLASS" \
    --engine postgres \
    --engine-version 15.15 \
    --master-username "$DB_USERNAME" \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage "$DB_ALLOCATED_STORAGE" \
    --storage-type gp2 \
    --db-name "$DB_NAME" \
    --vpc-security-group-ids "$RDS_SG_ID" \
    --backup-retention-period 0 \
    --publicly-accessible \
    --region "$REGION" \
    --tags Key=Project,Value="$PROJECT_NAME" \
    > /dev/null

echo -e "${GREEN}✓ RDS实例创建请求已提交${NC}"

# 等待RDS可用
echo -e "${YELLOW}等待RDS实例启动...${NC}"
aws rds wait db-instance-available \
    --db-instance-identifier "${PROJECT_NAME}-db" \
    --region "$REGION"

# 获取RDS端点
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "${PROJECT_NAME}-db" \
    --region "$REGION" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo -e "${GREEN}✓ RDS实例已就绪: $RDS_ENDPOINT${NC}"

# 3. 创建密钥对 (如果不存在)
echo -e "\n${YELLOW}[3/4] 创建EC2密钥对...${NC}"

KEY_NAME="${PROJECT_NAME}-key"
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$REGION" &> /dev/null; then
    aws ec2 create-key-pair \
        --key-name "$KEY_NAME" \
        --region "$REGION" \
        --query 'KeyMaterial' \
        --output text > "${KEY_NAME}.pem"
    
    chmod 400 "${KEY_NAME}.pem"
    echo -e "${GREEN}✓ 密钥对已创建并保存到: ${KEY_NAME}.pem${NC}"
else
    echo -e "${YELLOW}! 密钥对已存在，跳过创建${NC}"
fi

# 4. 启动EC2实例
echo -e "\n${YELLOW}[4/4] 启动 EC2 实例...${NC}"

# 获取最新的Amazon Linux 2023 AMI
AMI_ID=$(aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=al2023-ami-2023*-x86_64" "Name=state,Values=available" \
    --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
    --output text \
    --region "$REGION")

echo "使用AMI: $AMI_ID"

# 启动实例
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --instance-type t3.micro \
    --key-name "$KEY_NAME" \
    --security-group-ids "$EC2_SG_ID" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=${PROJECT_NAME}-backend},{Key=Project,Value=${PROJECT_NAME}}]" \
    --region "$REGION" \
    --query 'Instances[0].InstanceId' \
    --output text)

echo -e "${GREEN}✓ EC2实例创建成功: $INSTANCE_ID${NC}"

# 等待实例运行
echo -e "${YELLOW}等待实例启动...${NC}"
aws ec2 wait instance-running \
    --instance-ids "$INSTANCE_ID" \
    --region "$REGION"

# 获取公共IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --region "$REGION" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo -e "${GREEN}✓ EC2实例已就绪: $PUBLIC_IP${NC}"

# 生成配置文件
echo -e "\n${YELLOW}生成配置文件...${NC}"

cat > aws-config.env << EOF
# AWS配置信息 - $(date)

# RDS配置
RDS_ENDPOINT=$RDS_ENDPOINT
DATABASE_URL=jdbc:postgresql://$RDS_ENDPOINT:5432/$DB_NAME
DATABASE_USERNAME=$DB_USERNAME
DATABASE_PASSWORD=$DB_PASSWORD

# EC2配置
EC2_INSTANCE_ID=$INSTANCE_ID
EC2_PUBLIC_IP=$PUBLIC_IP
EC2_HOST=ec2-user@$PUBLIC_IP

# 安全组
RDS_SG_ID=$RDS_SG_ID
EC2_SG_ID=$EC2_SG_ID

# SSH密钥
SSH_KEY=./${KEY_NAME}.pem

# AWS区域
AWS_REGION=$REGION
EOF

cat > .env.production << EOF
# 生产环境配置 - 用于EC2实例

DATABASE_URL=jdbc:postgresql://$RDS_ENDPOINT:5432/$DB_NAME
DATABASE_USERNAME=$DB_USERNAME
DATABASE_PASSWORD=$DB_PASSWORD
FRONTEND_URL=https://your-frontend-domain.com
PORT=8080
EOF

echo -e "${GREEN}✓ 配置文件已生成${NC}"

# 完成总结
echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}AWS资源创建完成！${NC}"
echo -e "${GREEN}=====================================${NC}\n"

echo -e "${YELLOW}资源信息:${NC}"
echo "  RDS端点: $RDS_ENDPOINT"
echo "  数据库名: $DB_NAME"
echo "  数据库用户: $DB_USERNAME"
echo "  数据库密码: $DB_PASSWORD"
echo ""
echo "  EC2实例ID: $INSTANCE_ID"
echo "  EC2公网IP: $PUBLIC_IP"
echo "  SSH密钥: ${KEY_NAME}.pem"
echo ""

echo -e "${YELLOW}配置文件:${NC}"
echo "  aws-config.env - AWS资源配置"
echo "  .env.production - 应用环境变量"
echo ""

echo -e "${YELLOW}下一步操作:${NC}"
echo "1. 连接到EC2实例:"
echo "   ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
echo ""
echo "2. 按照 aws-setup-guide.md 配置应用环境"
echo ""
echo "3. 或使用自动部署脚本:"
echo "   export EC2_HOST=ec2-user@$PUBLIC_IP"
echo "   export SSH_KEY=./${KEY_NAME}.pem"
echo "   ./deploy.sh"
echo ""

echo -e "${RED}⚠️  重要提示:${NC}"
echo "  - 请妥善保管密钥文件 ${KEY_NAME}.pem"
echo "  - 数据库密码已保存在 aws-config.env"
echo "  - 建议立即修改RDS密码并更新配置"

