#!/bin/bash

# Kyle Meng Portfolio - Frontend Deployment Script
# 此脚本用于自动化部署前端到AWS EC2

set -e  # 遇到错误时退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Kyle Meng Portfolio - 前端部署脚本${NC}"
echo -e "${GREEN}=====================================${NC}\n"

# 配置变量（从截图中的EC2实例）
FRONTEND_EC2_HOST="${FRONTEND_EC2_HOST:-ec2-user@3.22.167.117}"
SSH_KEY="${SSH_KEY:-./kyle-portfolio-key.pem}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/kyle-portfolio}"
BACKEND_API_URL="http://44.223.49.55:8080/api"

# 检查SSH密钥
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}错误: SSH密钥文件不存在: $SSH_KEY${NC}"
    echo "请确保密钥文件在当前目录或设置 SSH_KEY 环境变量"
    exit 1
fi

echo -e "${YELLOW}配置信息:${NC}"
echo "  前端服务器: $FRONTEND_EC2_HOST"
echo "  后端API地址: $BACKEND_API_URL"
echo "  SSH密钥: $SSH_KEY"
echo "  部署目录: $REMOTE_DIR"
echo ""

read -p "是否继续部署? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 1. 构建前端
echo -e "\n${YELLOW}[1/5] 构建前端应用...${NC}"
cd ../frontend

# 创建临时 .env.production 文件
cat > .env.production.tmp << EOF
REACT_APP_API_URL=$BACKEND_API_URL
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
EOF

# 使用临时环境变量构建
echo "正在构建前端（API: $BACKEND_API_URL）..."
REACT_APP_API_URL=$BACKEND_API_URL npm run build

# 清理临时文件
rm -f .env.production.tmp

echo -e "${GREEN}✓ 前端构建完成${NC}"

# 2. 创建部署包
echo -e "\n${YELLOW}[2/5] 创建部署包...${NC}"
cd build
tar -czf ../frontend-build.tar.gz .
cd ..
echo -e "${GREEN}✓ 部署包创建完成${NC}"

# 3. 备份现有文件
echo -e "\n${YELLOW}[3/5] 备份现有文件...${NC}"
ssh -i "../deployment/$SSH_KEY" "$FRONTEND_EC2_HOST" "
    if [ -d $REMOTE_DIR ]; then
        sudo tar -czf $REMOTE_DIR.backup.\$(date +%Y%m%d_%H%M%S).tar.gz -C $REMOTE_DIR . 2>/dev/null || echo '无文件需要备份'
        echo '✓ 备份已创建'
    else
        echo '! 目录不存在，跳过备份'
    fi
"

# 4. 上传新版本
echo -e "\n${YELLOW}[4/5] 上传新版本...${NC}"
scp -i "../deployment/$SSH_KEY" frontend-build.tar.gz "$FRONTEND_EC2_HOST:/tmp/"
echo -e "${GREEN}✓ 文件上传完成${NC}"

# 5. 部署到服务器
echo -e "\n${YELLOW}[5/5] 部署到服务器...${NC}"
ssh -i "../deployment/$SSH_KEY" "$FRONTEND_EC2_HOST" << 'ENDSSH'
    # 创建部署目录
    if [ ! -d /var/www/kyle-portfolio ]; then
        sudo mkdir -p /var/www/kyle-portfolio
        sudo chown -R ec2-user:ec2-user /var/www/kyle-portfolio
        echo "✓ 创建部署目录"
    fi
    
    # 清理旧文件
    sudo rm -rf /var/www/kyle-portfolio/*
    
    # 解压新文件
    cd /var/www/kyle-portfolio
    sudo tar -xzf /tmp/frontend-build.tar.gz
    sudo chown -R ec2-user:ec2-user /var/www/kyle-portfolio
    
    # 清理临时文件
    rm /tmp/frontend-build.tar.gz
    
    # 检查 Nginx 配置
    if command -v nginx > /dev/null; then
        echo "重新加载 Nginx..."
        sudo nginx -t && sudo systemctl reload nginx
        echo "✓ Nginx 重载完成"
    else
        echo "! Nginx 未安装，需要手动配置 Web 服务器"
    fi
    
    echo "✓ 部署完成"
ENDSSH

# 清理本地构建文件
cd ..
rm -f frontend-build.tar.gz

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}前端部署成功完成！${NC}"
echo -e "${GREEN}=====================================${NC}\n"

echo -e "${YELLOW}访问地址:${NC}"
echo "  http://3.22.167.117"
echo ""

echo -e "${YELLOW}验证步骤:${NC}"
echo "  1. 打开浏览器访问: http://3.22.167.117"
echo "  2. 打开开发者工具 > Network 标签"
echo "  3. 检查 API 请求是否发送到: $BACKEND_API_URL"
echo ""

echo -e "${YELLOW}如果遇到 CORS 问题，需要在后端添加 CORS 配置${NC}"
echo -e "${YELLOW}后端配置文件: backend/src/main/resources/application-prod.properties${NC}"
echo "  cors.allowed-origins=http://3.22.167.117"
echo ""

echo -e "${YELLOW}查看前端日志:${NC}"
echo "  浏览器开发者工具 > Console"
echo ""

echo -e "${YELLOW}回滚到上一版本 (如需要):${NC}"
echo "  ssh -i $SSH_KEY $FRONTEND_EC2_HOST"
echo "  cd /var/www/kyle-portfolio && sudo tar -xzf /var/www/kyle-portfolio.backup.*.tar.gz"
echo ""

