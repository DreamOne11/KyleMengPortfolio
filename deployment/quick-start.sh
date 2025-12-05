#!/bin/bash

# Quick Start Script - 快速开始部署

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════╗
║     Kyle Meng Portfolio - AWS 部署快速向导       ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

echo -e "${YELLOW}请选择部署方式:${NC}\n"
echo "  1) 使用 AWS CLI 自动创建资源 (推荐)"
echo "  2) 手动部署 (已有AWS资源)"
echo "  3) 本地 Docker 测试环境"
echo "  4) 查看部署文档"
echo "  5) 退出"
echo ""

read -p "请选择 (1-5): " choice

case $choice in
  1)
    echo -e "\n${GREEN}=== AWS CLI 自动部署 ===${NC}\n"
    
    # 检查AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${YELLOW}安装AWS CLI...${NC}"
        echo "macOS: brew install awscli"
        echo "Linux: sudo apt install awscli 或 sudo yum install awscli"
        echo "安装后运行: aws configure"
        exit 1
    fi
    
    # 检查配置
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${YELLOW}配置AWS CLI...${NC}"
        aws configure
    fi
    
    echo -e "${GREEN}AWS CLI 已准备就绪${NC}\n"
    
    # 设置区域
    read -p "请输入AWS区域 [us-east-1]: " region
    region=${region:-us-east-1}
    export AWS_REGION=$region
    
    # 执行自动化脚本
    chmod +x aws-cli-setup.sh
    ./aws-cli-setup.sh
    
    echo -e "\n${GREEN}✓ 自动部署完成！${NC}"
    echo -e "${YELLOW}下一步: 按照提示完成应用配置${NC}"
    ;;
    
  2)
    echo -e "\n${GREEN}=== 手动部署 ===${NC}\n"
    
    # 收集信息
    read -p "EC2 公网IP: " ec2_ip
    read -p "SSH密钥路径: " ssh_key
    
    export EC2_HOST="ec2-user@$ec2_ip"
    export SSH_KEY="$ssh_key"
    
    echo -e "\n${YELLOW}测试SSH连接...${NC}"
    if ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$EC2_HOST" "echo '连接成功'" 2>/dev/null; then
        echo -e "${GREEN}✓ SSH连接正常${NC}\n"
    else
        echo -e "${RED}✗ SSH连接失败，请检查IP和密钥${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}开始部署...${NC}"
    chmod +x deploy.sh
    ./deploy.sh
    
    echo -e "\n${GREEN}✓ 部署完成！${NC}"
    ;;
    
  3)
    echo -e "\n${GREEN}=== Docker 本地测试 ===${NC}\n"
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker未安装${NC}"
        echo "请访问: https://www.docker.com/get-started"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}错误: Docker Compose未安装${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}启动Docker环境...${NC}"
    docker-compose up -d
    
    echo -e "\n${GREEN}✓ Docker环境已启动！${NC}"
    echo ""
    echo "服务地址:"
    echo "  Backend: http://localhost:8080"
    echo "  Database: localhost:5432"
    echo ""
    echo "查看日志: docker-compose logs -f"
    echo "停止服务: docker-compose down"
    ;;
    
  4)
    echo -e "\n${GREEN}=== 部署文档 ===${NC}\n"
    
    if command -v bat &> /dev/null; then
        bat aws-setup-guide.md
    elif command -v less &> /dev/null; then
        less aws-setup-guide.md
    else
        cat aws-setup-guide.md
    fi
    ;;
    
  5)
    echo -e "\n再见！"
    exit 0
    ;;
    
  *)
    echo -e "\n${RED}无效选择${NC}"
    exit 1
    ;;
esac

echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}需要帮助？查看文档: aws-setup-guide.md${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

