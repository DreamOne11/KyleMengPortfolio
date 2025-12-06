# 🚀 Kyle Meng Portfolio - 部署指南

## 📋 项目概览

全栈作品集网站，包含：
- ✅ React 前端（现代化UI，3D模型，摄影展示）
- ✅ Spring Boot 后端 REST API
- ✅ PostgreSQL 数据库
- ✅ GitHub Actions 自动化部署

## 🎯 部署方式

### 方式 1: GitHub Actions 自动部署（推荐）⭐

**适合**: 持续集成/部署，自动化工作流

**前提条件**:
- AWS 账号和配置好的 EC2/RDS 资源
- GitHub 仓库中配置的 Secrets

**触发部署**:
```bash
# 前端：修改 frontend/ 目录后推送
git push origin main

# 后端：修改 backend/ 目录后推送  
git push origin main
```

**查看部署状态**: https://github.com/YOUR_USERNAME/KyleMengPortfolio/actions

---

### 方式 2: 本地脚本部署

**适合**: 手动部署，测试环境

#### 后端部署
```bash
cd deployment

# 设置环境变量
export EC2_HOST=ec2-user@your-backend-ip
export SSH_KEY=./your-key.pem

# 运行部署
./deploy.sh
```

#### 前端部署
```bash
cd deployment

# 设置环境变量
export FRONTEND_EC2_HOST=ubuntu@your-frontend-ip
export BACKEND_API_URL=http://your-backend-ip:8080/api
export SSH_KEY=./your-key.pem

# 运行部署
./deploy-frontend.sh
```

---

### 方式 3: 本地 Docker 测试

**适合**: 开发阶段本地测试

```bash
cd deployment
docker-compose up -d

# 测试 API
curl http://localhost:8080/api/photos

# 停止
docker-compose down
```

---

## 🔧 GitHub Actions 配置

### 必需的 GitHub Secrets

在 `Settings → Secrets and variables → Actions` 中添加：

#### 后端部署 Secrets:
- `AWS_ACCESS_KEY_ID` - AWS 访问密钥 ID
- `AWS_SECRET_ACCESS_KEY` - AWS 访问密钥
- `AWS_REGION` - AWS 区域（如: us-east-1）
- `EC2_HOST` - 后端服务器 IP
- `EC2_SSH_KEY` - 后端 SSH 私钥内容（完整的 .pem 文件）

#### 前端部署 Secrets:
- `FRONTEND_EC2_HOST` - 前端服务器 IP
- `FRONTEND_EC2_SSH_KEY` - 前端 SSH 私钥内容（完整的 .pem 文件）

---

## 📁 项目结构

```
KyleMengPortfolio/
├── frontend/              # React 前端
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/               # Spring Boot 后端
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── deployment/            # 部署脚本和配置
│   ├── deploy.sh         # 后端部署脚本
│   ├── deploy-frontend.sh # 前端部署脚本
│   ├── docker-compose.yml # 本地测试环境
│   └── *.sh              # 其他工具脚本
└── .github/
    └── workflows/
        ├── deploy-backend.yml  # 后端自动部署
        └── deploy-frontend.yml # 前端自动部署
```

---

## 🏗️ 架构说明

### 推荐架构（前后端分离）

```
用户浏览器
    ↓
前端服务器 (EC2 + Nginx)
    ↓ API 请求通过 Nginx 反向代理
后端服务器 (EC2 + Spring Boot)
    ↓
数据库 (RDS PostgreSQL)
```

**优势**:
- 前后端独立扩展
- Nginx 处理静态文件和反向代理
- 更好的性能和安全性

---

## 🔒 安全提醒

### ⚠️ 永远不要提交到 Git:
- `*.pem` - SSH 私钥
- `aws-config.env` - AWS 配置
- `.db-password.txt` - 数据库密码
- `.env.production` - 生产环境变量

### ✅ 已在 .gitignore 中保护:
```gitignore
deployment/*.pem
deployment/aws-config.env
deployment/.db-password.txt
.env.production
```

---

## 💰 成本估算

### AWS 免费套餐（12个月）
- EC2 t2.micro/t3.micro: 750小时/月
- RDS db.t3.micro: 750小时/月
- **总成本: $0/月**

### 小规模生产
- 前端 EC2 t3.small: ~$15/月
- 后端 EC2 t3.small: ~$15/月
- RDS db.t3.small: ~$30/月
- **总成本: ~$60/月**

---

## 📚 详细文档

- **部署脚本**: 查看 `deployment/README.md`
- **AWS 设置**: 查看 `deployment/aws-setup-guide.md`
- **开发计划**: 查看 `docs/DEVELOPMENT_PLAN.md`

---

## 🆘 故障排查

### 部署失败？
1. 检查 GitHub Actions 日志
2. 确认所有 Secrets 已正确配置
3. 验证 SSH 密钥权限（应该是 600）
4. 检查 EC2 安全组是否允许必要的端口

### 连接问题？
```bash
# 测试 SSH 连接
ssh -i your-key.pem ec2-user@your-ip

# 查看后端日志
ssh -i your-key.pem ec2-user@your-backend-ip \
  'sudo journalctl -u kyle-portfolio -n 50'

# 测试 API
curl http://your-backend-ip:8080/api/health
```

---

## 🎉 快速开始

1. **Fork 本仓库**
2. **配置 GitHub Secrets**（参考上面的列表）
3. **修改代码并推送**
```bash
git add .
git commit -m "feat: my awesome feature"
git push origin main
```
4. **查看 GitHub Actions 自动部署**
5. **访问你的网站！**

---

**祝部署顺利！** 🚀

如有问题，请查看详细文档或提交 Issue。
