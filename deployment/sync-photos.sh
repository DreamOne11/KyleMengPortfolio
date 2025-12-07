#!/bin/bash

# 照片同步脚本
# 用途：将本地照片同步到服务器的 /var/www/photos/photography 目录

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  照片同步工具${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 配置变量
LOCAL_PHOTO_DIR="../frontend/public/images/photography"
REMOTE_PHOTO_DIR="/var/www/photos/photography"
EC2_USER="ubuntu"

# 从环境变量或参数获取服务器信息
EC2_HOST=${EC2_HOST:-""}
SSH_KEY=${SSH_KEY:-""}

# 如果没有设置环境变量，提示用户输入
if [ -z "$EC2_HOST" ]; then
    echo -e "${YELLOW}请输入服务器地址（例如：ec2-xx-xx-xx-xx.compute.amazonaws.com）:${NC}"
    read -r EC2_HOST
fi

if [ -z "$SSH_KEY" ]; then
    echo -e "${YELLOW}请输入SSH密钥路径（例如：./kyle-portfolio-key.pem）:${NC}"
    read -r SSH_KEY
fi

# 验证本地照片目录
if [ ! -d "$LOCAL_PHOTO_DIR" ]; then
    echo -e "${RED}错误: 本地照片目录不存在: $LOCAL_PHOTO_DIR${NC}"
    exit 1
fi

# 验证SSH密钥
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}错误: SSH密钥文件不存在: $SSH_KEY${NC}"
    exit 1
fi

echo -e "${BLUE}配置信息:${NC}"
echo "  本地目录: $LOCAL_PHOTO_DIR"
echo "  远程目录: $REMOTE_PHOTO_DIR"
echo "  服务器: $EC2_USER@$EC2_HOST"
echo "  SSH密钥: $SSH_KEY"
echo ""

# 统计文件数量
TOTAL_FILES=$(find "$LOCAL_PHOTO_DIR" -type f | wc -l | tr -d ' ')
echo -e "${YELLOW}找到 $TOTAL_FILES 个文件${NC}"
echo ""

# 询问是否继续
read -p "是否继续同步? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo -e "${GREEN}开始同步...${NC}"
echo ""

# 步骤1: 在服务器上创建目录
echo -e "${BLUE}[1/3] 创建服务器目录结构...${NC}"
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "sudo mkdir -p $REMOTE_PHOTO_DIR && sudo chown -R $EC2_USER:$EC2_USER /var/www/photos"
echo -e "${GREEN}✓ 目录创建完成${NC}"
echo ""

# 步骤2: 使用rsync同步文件
echo -e "${BLUE}[2/3] 同步照片文件...${NC}"
rsync -avz --progress \
    -e "ssh -i $SSH_KEY" \
    "$LOCAL_PHOTO_DIR/" \
    "$EC2_USER@$EC2_HOST:$REMOTE_PHOTO_DIR/"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ 照片同步完成${NC}"
else
    echo ""
    echo -e "${RED}✗ 同步失败${NC}"
    exit 1
fi
echo ""

# 步骤3: 设置正确的权限
echo -e "${BLUE}[3/3] 设置文件权限...${NC}"
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
sudo chown -R www-data:www-data /var/www/photos
sudo chmod -R 755 /var/www/photos
sudo find /var/www/photos -type f -exec chmod 644 {} \;
ENDSSH

echo -e "${GREEN}✓ 权限设置完成${NC}"
echo ""

# 验证同步结果
echo -e "${BLUE}验证同步结果...${NC}"
REMOTE_FILE_COUNT=$(ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "find $REMOTE_PHOTO_DIR -type f | wc -l" | tr -d ' ')
echo "  远程文件数: $REMOTE_FILE_COUNT"
echo ""

if [ "$REMOTE_FILE_COUNT" -eq "$TOTAL_FILES" ]; then
    echo -e "${GREEN}✓ 文件数量匹配${NC}"
else
    echo -e "${YELLOW}⚠ 文件数量不匹配，请检查${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  同步完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "照片已同步到服务器:"
echo "  $REMOTE_PHOTO_DIR"
echo ""
echo "下一步:"
echo "1. 应用 Nginx 配置（运行 deployment/nginx-photos.conf）"
echo "2. 重启后端服务以重新初始化数据库"
echo "3. 测试访问: https://kylemeng11.com/photos/photography/portrait/thumbnails/DSC_4661-full.webp"
echo ""

