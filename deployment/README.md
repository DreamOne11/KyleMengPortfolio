# AWS 部署工具包

本目录包含Kyle Meng Portfolio后端应用的完整AWS部署工具和文档。

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `aws-setup-guide.md` | 详细的AWS部署步骤指南 |
| `quick-start.sh` | 交互式快速部署向导 ⭐ |
| `aws-cli-setup.sh` | AWS CLI自动化资源创建脚本 |
| `deploy.sh` | 应用部署和更新脚本 |
| `docker-compose.yml` | 本地Docker测试环境 |

## 🚀 快速开始

### 方式1: 使用快速向导 (推荐新手)

```bash
cd deployment
./quick-start.sh
```

交互式向导会引导您完成整个部署过程。

### 方式2: 自动化AWS资源创建

如果您是第一次部署，使用此脚本自动创建RDS和EC2:

```bash
cd deployment

# 配置AWS CLI (如果还没配置)
aws configure

# 运行自动化脚本
./aws-cli-setup.sh
```

脚本会自动创建:
- ✅ RDS PostgreSQL数据库
- ✅ EC2实例
- ✅ 安全组配置
- ✅ SSH密钥对
- ✅ 配置文件

### 方式3: 手动部署到现有EC2

如果您已经有EC2实例和RDS数据库:

```bash
cd deployment

# 设置环境变量
export EC2_HOST=ec2-user@your-ec2-ip
export SSH_KEY=path/to/your-key.pem

# 运行部署
./deploy.sh
```

### 方式4: 本地Docker测试

在部署到AWS之前，先在本地测试:

```bash
cd deployment
docker-compose up -d

# 查看日志
docker-compose logs -f

# 测试API
curl http://localhost:8080/api/health

# 停止服务
docker-compose down
```

## 📚 详细文档

### AWS部署完整指南

详细的步骤说明请查看: [`aws-setup-guide.md`](./aws-setup-guide.md)

包含:
- 🗄️ RDS PostgreSQL配置
- 💻 EC2实例设置
- 🔧 应用配置
- 🌐 Nginx配置
- 🔒 SSL证书设置
- 📊 监控和维护
- 🔧 故障排查

## 🔐 环境变量配置

部署后需要在EC2上配置以下环境变量:

```bash
# /opt/kyle-portfolio/.env

DATABASE_URL=jdbc:postgresql://your-rds-endpoint:5432/kyle_portfolio
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
FRONTEND_URL=https://your-frontend-domain.com
PORT=8080
```

## 🔄 CI/CD自动化部署

### GitHub Actions配置

已创建GitHub Actions工作流: `.github/workflows/deploy-backend.yml`

#### 设置Secrets

在GitHub仓库设置中添加以下Secrets:

1. **AWS_ACCESS_KEY_ID**: AWS访问密钥ID
2. **AWS_SECRET_ACCESS_KEY**: AWS访问密钥Secret
3. **AWS_REGION**: AWS区域 (如 us-east-1)
4. **EC2_HOST**: EC2实例IP地址
5. **EC2_SSH_KEY**: EC2 SSH私钥内容 (完整的.pem文件内容)

#### 触发部署

推送到main分支时自动触发:
```bash
git push origin main
```

或手动触发:
1. 进入GitHub仓库
2. Actions → Deploy Backend to AWS
3. 点击 "Run workflow"

## 📊 部署后检查

### 验证部署

```bash
# SSH连接到EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# 检查服务状态
sudo systemctl status kyle-portfolio

# 查看日志
sudo journalctl -u kyle-portfolio -f

# 测试健康端点
curl http://localhost:8080/api/health
```

### 测试API端点

```bash
# Health Check
curl https://api.your-domain.com/api/health

# Photo Categories
curl https://api.your-domain.com/api/photography/categories

# Photos by Category
curl https://api.your-domain.com/api/photography/photos/category/1
```

## 🔄 更新应用

### 使用部署脚本

```bash
cd deployment

export EC2_HOST=ec2-user@your-ec2-ip
export SSH_KEY=path/to/your-key.pem

./deploy.sh
```

### 手动更新

```bash
# 1. 本地构建
cd backend
mvn clean package -DskipTests

# 2. 上传到EC2
scp -i your-key.pem target/portfolio-0.0.1-SNAPSHOT.jar ec2-user@your-ec2-ip:/opt/kyle-portfolio/

# 3. 重启服务
ssh -i your-key.pem ec2-user@your-ec2-ip
sudo systemctl restart kyle-portfolio
```

## 🛠️ 维护操作

### 查看日志

```bash
# 实时日志
sudo journalctl -u kyle-portfolio -f

# 最近100行
sudo journalctl -u kyle-portfolio -n 100

# 今天的日志
sudo journalctl -u kyle-portfolio --since today
```

### 重启服务

```bash
sudo systemctl restart kyle-portfolio
```

### 数据库备份

```bash
# 在EC2上
pg_dump -h your-rds-endpoint -U postgres -d kyle_portfolio > backup.sql

# 恢复
psql -h your-rds-endpoint -U postgres -d kyle_portfolio < backup.sql
```

## 💰 成本估算

### 免费套餐 (前12个月)
- EC2 t2.micro: 免费750小时/月
- RDS db.t3.micro: 免费750小时/月
- 总计: **$0/月**

### 小规模生产环境
- EC2 t3.small: ~$15/月
- RDS db.t3.small: ~$30/月
- 负载均衡器: ~$18/月 (可选)
- 数据传输: ~$5-10/月
- **总计: ~$50-75/月**

## 🔧 故障排查

### 常见问题

#### 1. 应用无法连接数据库

```bash
# 检查网络连通性
telnet your-rds-endpoint 5432

# 检查安全组配置
# 确保RDS安全组允许来自EC2的5432端口访问
```

#### 2. 服务启动失败

```bash
# 查看详细错误
sudo journalctl -u kyle-portfolio -xe

# 检查Java版本
java -version

# 检查JAR文件权限
ls -la /opt/kyle-portfolio/
```

#### 3. CORS错误

更新 `/opt/kyle-portfolio/.env`:
```bash
FRONTEND_URL=https://your-actual-frontend-domain.com
```

然后重启:
```bash
sudo systemctl restart kyle-portfolio
```

## 📖 相关资源

- [AWS RDS文档](https://docs.aws.amazon.com/rds/)
- [AWS EC2文档](https://docs.aws.amazon.com/ec2/)
- [Spring Boot生产部署](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html)
- [PostgreSQL文档](https://www.postgresql.org/docs/)

## 🆘 获取帮助

如果遇到问题:

1. 查看 `aws-setup-guide.md` 的故障排查部分
2. 检查应用日志: `sudo journalctl -u kyle-portfolio -f`
3. 验证AWS资源配置 (安全组、网络等)
4. 测试数据库连接

## 📝 更新日志

- 2025-01-18: 初始版本创建
- 添加自动化部署脚本
- 添加Docker本地测试环境
- 添加GitHub Actions CI/CD配置

