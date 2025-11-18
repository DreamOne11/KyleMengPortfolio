# 🚀 AWS后端部署完整方案

## ✅ 已创建的文件

### 📋 配置文件

1. **`backend/src/main/resources/application-prod.properties`**
   - 生产环境配置
   - 支持环境变量注入
   - 包含数据库、CORS、日志等配置

2. **`backend/Dockerfile`**
   - 多阶段构建Docker镜像
   - 优化镜像大小
   - 包含健康检查

### 📚 部署文档

3. **`deployment/aws-setup-guide.md`**
   - 详细的AWS部署步骤指南 (300+行)
   - 包含RDS、EC2、Nginx、SSL配置
   - 故障排查指南

4. **`deployment/README.md`**
   - 部署工具包使用说明
   - 快速开始指南
   - 维护操作手册

### 🔧 自动化脚本

5. **`deployment/quick-start.sh`** ⭐
   - **交互式部署向导**
   - 适合初次部署
   - 支持多种部署方式选择

6. **`deployment/aws-cli-setup.sh`**
   - **AWS资源自动创建脚本**
   - 自动创建RDS + EC2 + 安全组
   - 生成配置文件

7. **`deployment/deploy.sh`**
   - **应用部署和更新脚本**
   - 自动备份、上传、重启
   - 包含健康检查

8. **`deployment/docker-compose.yml`**
   - **本地测试环境**
   - PostgreSQL + Spring Boot
   - 一键启动完整环境

### 🔄 CI/CD配置

9. **`.github/workflows/deploy-backend.yml`**
   - GitHub Actions自动化部署
   - 推送main分支自动触发
   - 包含构建、测试、部署完整流程

---

## 🎯 快速开始指南

### 选项1: 全自动部署 (最简单)

适合：**首次部署 + 没有AWS资源**

```bash
cd deployment
./quick-start.sh
```

选择 "1) 使用 AWS CLI 自动创建资源"，脚本会自动：
✅ 创建RDS PostgreSQL数据库
✅ 创建EC2实例  
✅ 配置安全组和网络
✅ 生成SSH密钥
✅ 创建配置文件

**预计时间**: 10-15分钟

---

### 选项2: 手动部署 (已有AWS资源)

适合：**已有EC2和RDS**

#### 步骤1: 配置环境变量

```bash
export EC2_HOST=ec2-user@your-ec2-ip
export SSH_KEY=/path/to/your-key.pem
```

#### 步骤2: 运行部署

```bash
cd deployment
./deploy.sh
```

**预计时间**: 5-10分钟

---

### 选项3: 本地Docker测试

适合：**部署前本地测试**

```bash
cd deployment
docker-compose up -d

# 测试API
curl http://localhost:8080/api/health

# 停止
docker-compose down
```

**预计时间**: 2-3分钟

---

### 选项4: GitHub Actions自动化

适合：**持续集成/持续部署**

#### 配置Secrets (一次性)

在GitHub仓库 → Settings → Secrets添加:

| Secret名称 | 说明 | 示例值 |
|-----------|------|--------|
| `AWS_ACCESS_KEY_ID` | AWS访问密钥ID | AKIA... |
| `AWS_SECRET_ACCESS_KEY` | AWS访问密钥Secret | xxx... |
| `AWS_REGION` | AWS区域 | us-east-1 |
| `EC2_HOST` | EC2实例IP | 3.84.123.45 |
| `EC2_SSH_KEY` | SSH私钥内容 | -----BEGIN RSA... |

#### 触发部署

```bash
# 推送到main分支自动部署
git push origin main

# 或在GitHub Actions页面手动触发
```

**预计时间**: 5-8分钟

---

## 📊 部署架构

```
┌─────────────────────────────────────────────┐
│  Frontend (已部署)                          │
│  https://kylemeng.com                       │
└───────────────┬─────────────────────────────┘
                │
                │ API调用
                ↓
┌───────────────────────────────────────────────┐
│  Nginx (可选)                                 │
│  https://api.kylemeng.com                     │
│  - SSL终止                                    │
│  - 反向代理                                   │
└───────────────┬───────────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────┐
│  EC2 Instance                                 │
│  - Amazon Linux 2023 / Ubuntu                 │
│  - Java 17                                    │
│  - Spring Boot App (Port 8080)                │
│  - Systemd Service                            │
└───────────────┬───────────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────┐
│  RDS PostgreSQL                               │
│  - PostgreSQL 15                              │
│  - Port 5432                                  │
│  - 自动备份                                   │
└───────────────────────────────────────────────┘
```

---

## ⚙️ 详细步骤（手动部署参考）

### 第一阶段: AWS资源准备

#### 1. 创建RDS数据库 (5-10分钟)

```bash
# 使用AWS CLI
cd deployment
./aws-cli-setup.sh

# 或按照文档手动创建
参考: deployment/aws-setup-guide.md → 步骤1
```

**输出**: RDS端点地址 (如 `kyle-portfolio-db.xxx.us-east-1.rds.amazonaws.com`)

#### 2. 创建EC2实例 (3-5分钟)

```bash
# 自动创建（包含在aws-cli-setup.sh中）
# 或手动创建
参考: deployment/aws-setup-guide.md → 步骤3
```

**输出**: EC2公网IP和SSH密钥

#### 3. 配置安全组 (2分钟)

```bash
# 自动配置（包含在aws-cli-setup.sh中）
# 或手动配置
参考: deployment/aws-setup-guide.md → 步骤1.2
```

---

### 第二阶段: 应用部署

#### 4. 本地构建应用 (2-3分钟)

```bash
cd backend
mvn clean package -DskipTests
```

**输出**: `target/portfolio-0.0.1-SNAPSHOT.jar`

#### 5. 配置EC2环境 (5-8分钟)

```bash
# 连接到EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# 安装Java 17
sudo dnf install java-17-amazon-corretto-devel -y

# 创建应用目录
sudo mkdir -p /opt/kyle-portfolio
sudo chown ec2-user:ec2-user /opt/kyle-portfolio
```

#### 6. 上传和配置应用 (3-5分钟)

```bash
# 上传JAR文件
scp -i your-key.pem target/portfolio-0.0.1-SNAPSHOT.jar \
  ec2-user@your-ec2-ip:/opt/kyle-portfolio/

# 创建环境变量文件
ssh -i your-key.pem ec2-user@your-ec2-ip
cat > /opt/kyle-portfolio/.env << EOF
DATABASE_URL=jdbc:postgresql://your-rds-endpoint:5432/kyle_portfolio
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
FRONTEND_URL=https://your-frontend-domain.com
PORT=8080
EOF
```

#### 7. 创建Systemd服务 (2分钟)

```bash
# 参考: deployment/aws-setup-guide.md → 步骤4.6
sudo nano /etc/systemd/system/kyle-portfolio.service
# (复制配置内容)

sudo systemctl enable kyle-portfolio
sudo systemctl start kyle-portfolio
```

#### 8. 验证部署 (1分钟)

```bash
# 检查服务状态
sudo systemctl status kyle-portfolio

# 测试健康端点
curl http://localhost:8080/api/health
```

**期望输出**: `{"status":"UP"}`

---

### 第三阶段: 生产环境优化 (可选)

#### 9. 配置Nginx反向代理 (5-10分钟)

```bash
参考: deployment/aws-setup-guide.md → 步骤5
```

#### 10. 配置SSL证书 (3-5分钟)

```bash
参考: deployment/aws-setup-guide.md → 步骤6
```

#### 11. 更新前端API地址 (2分钟)

```typescript
// frontend/src/services/photographyApi.ts
const API_BASE_URL = 'https://api.kylemeng.com/api';
```

---

## 🔍 验证检查清单

部署完成后，请验证以下项目:

### Backend API

- [ ] Health Check: `https://api.your-domain.com/api/health`
- [ ] Categories: `https://api.your-domain.com/api/photography/categories`
- [ ] Photos: `https://api.your-domain.com/api/photography/photos/category/1`

### Service Status

```bash
# EC2上执行
sudo systemctl status kyle-portfolio
sudo journalctl -u kyle-portfolio -n 50
```

### Database Connection

```bash
# EC2上执行
psql -h your-rds-endpoint -U postgres -d kyle_portfolio -c "\dt"
```

### CORS Configuration

- [ ] 前端可以成功调用后端API
- [ ] 无CORS错误
- [ ] Cookies/Credentials正常工作

---

## 💰 成本估算

### 免费套餐 (12个月)
- EC2 t2.micro: **免费**
- RDS db.t3.micro: **免费**
- 数据传输: 15GB/月免费
- **总计: $0/月**

### 小规模生产
- EC2 t3.small: $15/月
- RDS db.t3.small: $30/月
- 数据传输: $5-10/月
- **总计: ~$50-55/月**

### 中等规模
- EC2 t3.medium: $30/月
- RDS db.t3.medium: $60/月
- Load Balancer: $18/月
- 数据传输: $10-20/月
- **总计: ~$118-128/月**

---

## 🆘 故障排查

### 问题1: 应用无法启动

```bash
# 查看日志
sudo journalctl -u kyle-portfolio -xe

# 常见原因:
# - Java版本不匹配 (需要Java 17)
# - 数据库连接失败
# - 端口被占用
```

### 问题2: 无法连接数据库

```bash
# 测试连通性
telnet your-rds-endpoint 5432

# 检查安全组:
# - RDS安全组是否允许EC2访问
# - 端口5432是否开放
```

### 问题3: CORS错误

```bash
# 检查环境变量
cat /opt/kyle-portfolio/.env

# 更新FRONTEND_URL
# 重启服务
sudo systemctl restart kyle-portfolio
```

### 问题4: 健康检查失败

```bash
# 检查应用是否运行
curl http://localhost:8080/api/health

# 查看最近日志
sudo journalctl -u kyle-portfolio -n 100
```

---

## 📖 下一步

1. **设置监控**
   - CloudWatch日志和指标
   - 设置告警通知

2. **配置自动扩展**
   - Auto Scaling Group
   - Load Balancer

3. **优化性能**
   - 数据库索引优化
   - 缓存配置 (Redis)

4. **安全加固**
   - 定期更新系统
   - 配置WAF
   - 设置VPN访问

---

## 📞 获取帮助

- 📚 **完整文档**: `deployment/aws-setup-guide.md`
- 🔧 **脚本使用**: `deployment/README.md`
- 🐛 **故障排查**: 查看日志 `sudo journalctl -u kyle-portfolio -f`

---

## ✅ 部署状态检查

完成部署后，运行以下命令验证:

```bash
# 在EC2上执行
cd deployment
./check-deployment.sh  # (待创建)

# 或手动检查
curl http://localhost:8080/api/health
sudo systemctl status kyle-portfolio
psql -h $RDS_ENDPOINT -U postgres -d kyle_portfolio -c "\l"
```

---

**🎉 恭喜！您的后端应用已成功部署到AWS！**

**生产URL**: `https://api.your-domain.com`

**管理入口**: `ssh -i your-key.pem ec2-user@your-ec2-ip`

