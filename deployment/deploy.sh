#!/bin/bash

# Kyle Meng Portfolio - Backend Deployment Script
# 此脚本用于自动化部署Spring Boot应用到AWS EC2

set -e  # 遇到错误时退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Kyle Meng Portfolio - 后端部署脚本${NC}"
echo -e "${GREEN}=====================================${NC}\n"

# 检查必需的环境变量
if [ -z "$EC2_HOST" ]; then
    echo -e "${RED}错误: 请设置 EC2_HOST 环境变量${NC}"
    echo "例如: export EC2_HOST=ec2-user@your-ec2-ip"
    exit 1
fi

if [ -z "$SSH_KEY" ]; then
    echo -e "${RED}错误: 请设置 SSH_KEY 环境变量${NC}"
    echo "例如: export SSH_KEY=~/.ssh/kyle-portfolio-key.pem"
    exit 1
fi

# 配置变量
APP_NAME="kyle-portfolio"
LOCAL_JAR_PATH="../backend/target/portfolio-0.0.1-SNAPSHOT.jar"
REMOTE_APP_DIR="/opt/kyle-portfolio"
REMOTE_JAR_NAME="portfolio.jar"
SERVICE_NAME="kyle-portfolio"

echo -e "${YELLOW}[1/5] 检查本地构建文件...${NC}"
if [ ! -f "$LOCAL_JAR_PATH" ]; then
    echo -e "${YELLOW}未找到JAR文件，开始构建...${NC}"
    cd ../backend
    mvn clean package -DskipTests
    cd ../deployment
    echo -e "${GREEN}✓ 构建完成${NC}"
else
    echo -e "${GREEN}✓ 找到JAR文件${NC}"
fi

echo -e "\n${YELLOW}[2/5] 创建备份...${NC}"
ssh -i "$SSH_KEY" "$EC2_HOST" "
    if [ -f $REMOTE_APP_DIR/$REMOTE_JAR_NAME ]; then
        sudo cp $REMOTE_APP_DIR/$REMOTE_JAR_NAME $REMOTE_APP_DIR/$REMOTE_JAR_NAME.backup.\$(date +%Y%m%d_%H%M%S)
        echo '✓ 备份已创建'
    else
        echo '! 无现有文件需要备份'
    fi
"

echo -e "\n${YELLOW}[3/5] 上传新版本...${NC}"
scp -i "$SSH_KEY" "$LOCAL_JAR_PATH" "$EC2_HOST:$REMOTE_APP_DIR/$REMOTE_JAR_NAME.new"
echo -e "${GREEN}✓ 文件上传完成${NC}"

echo -e "\n${YELLOW}[4/5] 部署新版本...${NC}"
ssh -i "$SSH_KEY" "$EC2_HOST" "
    # 停止服务
    echo '停止应用服务...'
    sudo systemctl stop $SERVICE_NAME
    
    # 替换JAR文件
    sudo mv $REMOTE_APP_DIR/$REMOTE_JAR_NAME.new $REMOTE_APP_DIR/$REMOTE_JAR_NAME
    sudo chown ec2-user:ec2-user $REMOTE_APP_DIR/$REMOTE_JAR_NAME
    
    # 启动服务
    echo '启动应用服务...'
    sudo systemctl start $SERVICE_NAME
    
    # 等待服务启动
    sleep 5
    
    echo '✓ 部署完成'
"

echo -e "\n${YELLOW}[5/5] 验证部署...${NC}"
ssh -i "$SSH_KEY" "$EC2_HOST" "
    # 检查服务状态
    if sudo systemctl is-active --quiet $SERVICE_NAME; then
        echo '✓ 服务运行正常'
    else
        echo '✗ 服务未运行，检查日志...'
        sudo journalctl -u $SERVICE_NAME -n 20 --no-pager
        exit 1
    fi
    
    # 检查健康端点
    sleep 3
    if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
        echo '✓ 健康检查通过'
    else
        echo '! 健康检查失败，但服务正在运行'
    fi
"

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}部署成功完成！${NC}"
echo -e "${GREEN}=====================================${NC}\n"

echo -e "查看应用日志:"
echo -e "  ssh -i $SSH_KEY $EC2_HOST 'sudo journalctl -u $SERVICE_NAME -f'"

echo -e "\n查看服务状态:"
echo -e "  ssh -i $SSH_KEY $EC2_HOST 'sudo systemctl status $SERVICE_NAME'"

echo -e "\n回滚到上一版本 (如需要):"
echo -e "  ssh -i $SSH_KEY $EC2_HOST 'sudo systemctl stop $SERVICE_NAME && sudo cp $REMOTE_APP_DIR/$REMOTE_JAR_NAME.backup.* $REMOTE_APP_DIR/$REMOTE_JAR_NAME && sudo systemctl start $SERVICE_NAME'"

