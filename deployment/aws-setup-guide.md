# AWS 后端部署指南

本指南将帮助您在AWS上部署Kyle Meng Portfolio的Spring Boot后端应用。

## 📋 前提条件

- AWS账号
- AWS CLI已安装并配置
- Java 17
- Maven 3.6+
- 已部署的前端应用URL

## 🏗️ AWS架构

```
┌─────────────────┐
│   Route 53      │  (可选) 域名解析
└────────┬────────┘
         │
┌────────▼────────┐
│  Application    │
│  Load Balancer  │  (可选) 负载均衡
└────────┬────────┘
         │
┌────────▼────────┐
│  EC2 Instance   │  Spring Boot应用
│  (或 Elastic    │  Port: 8080
│   Beanstalk)    │
└────────┬────────┘
         │
┌────────▼────────┐
│  RDS PostgreSQL │  数据库
│  Port: 5432     │
└─────────────────┘
```

## 🗄️ 步骤 1: 创建 RDS PostgreSQL 数据库

### 1.1 使用AWS控制台创建

1. 登录AWS控制台
2. 进入 **RDS** 服务
3. 点击 **"创建数据库"**

4. **配置数据库**:
   - 引擎类型: **PostgreSQL**
   - 版本: PostgreSQL 15.x 或更高
   - 模板: **免费套餐** (开发) 或 **生产** (正式环境)
   
5. **设置标识符**:
   - 数据库实例标识符: `kyle-portfolio-db`
   - 主用户名: `postgres`
   - 主密码: 设置一个强密码 (记住此密码！)

6. **实例配置**:
   - 免费套餐: `db.t3.micro` (1 vCPU, 1GB RAM)
   - 生产环境: `db.t3.small` 或更高
   
7. **存储**:
   - 存储类型: 通用型 SSD (gp3)
   - 分配的存储空间: 20 GB (可根据需求调整)
   - 启用存储自动扩展

8. **连接性**:
   - VPC: 默认VPC
   - 公共访问: **是** (如果需要从本地连接调试)
   - VPC安全组: 创建新的安全组 `kyle-portfolio-db-sg`
   
9. **数据库身份验证**: 密码身份验证

10. **其他配置**:
    - 初始数据库名称: `kyle_portfolio`
    - 备份保留期: 7天
    - 启用自动备份

11. 点击 **"创建数据库"**

### 1.2 配置安全组

创建完成后，配置数据库安全组:

1. 进入 **EC2** → **安全组**
2. 找到 `kyle-portfolio-db-sg`
3. 编辑入站规则:
   - 类型: PostgreSQL
   - 协议: TCP
   - 端口范围: 5432
   - 源: EC2实例的安全组 (稍后创建)

### 1.3 获取数据库连接信息

1. 在RDS控制台找到数据库实例
2. 记录 **端点 (Endpoint)**: 类似 `kyle-portfolio-db.xxxxxx.us-east-1.rds.amazonaws.com`
3. 连接字符串格式: 
   ```
   jdbc:postgresql://[ENDPOINT]:5432/kyle_portfolio
   ```

## 💻 步骤 2: 准备应用部署

### 2.1 构建应用

在本地构建应用:

```bash
cd backend
mvn clean package -DskipTests
```

构建完成后，在 `target/` 目录下会生成 `portfolio-0.0.1-SNAPSHOT.jar`

### 2.2 测试本地运行 (可选)

使用生产配置测试:

```bash
export DATABASE_URL="jdbc:postgresql://[RDS_ENDPOINT]:5432/kyle_portfolio"
export DATABASE_USERNAME="postgres"
export DATABASE_PASSWORD="your_password"
export FRONTEND_URL="https://your-frontend-domain.com"

java -jar target/portfolio-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 🖥️ 步骤 3: 创建 EC2 实例

### 3.1 启动EC2实例

1. 进入 **EC2** 服务
2. 点击 **"启动实例"**

3. **配置实例**:
   - 名称: `kyle-portfolio-backend`
   - AMI: **Amazon Linux 2023** 或 **Ubuntu Server 22.04 LTS**
   - 实例类型: `t2.micro` (免费套餐) 或 `t3.small` (生产)
   
4. **密钥对**:
   - 创建新密钥对或使用现有的
   - 名称: `kyle-portfolio-key`
   - 类型: RSA
   - 格式: .pem
   - **下载并保存密钥文件**

5. **网络设置**:
   - VPC: 与RDS相同的VPC
   - 自动分配公有IP: 启用
   - 安全组: 创建新的 `kyle-portfolio-backend-sg`
     - SSH (22): 您的IP
     - HTTP (80): 0.0.0.0/0
     - HTTPS (443): 0.0.0.0/0
     - 自定义TCP (8080): 0.0.0.0/0

6. **存储**: 8-20 GB gp3

7. 点击 **"启动实例"**

### 3.2 更新数据库安全组

1. 回到RDS数据库的安全组
2. 添加入站规则:
   - 类型: PostgreSQL
   - 端口: 5432
   - 源: EC2实例的安全组 `kyle-portfolio-backend-sg`

## 📦 步骤 4: 配置 EC2 实例

### 4.1 连接到EC2

```bash
chmod 400 kyle-portfolio-key.pem
ssh -i kyle-portfolio-key.pem ec2-user@[EC2_PUBLIC_IP]
```

### 4.2 安装Java 17

**Amazon Linux 2023:**
```bash
sudo dnf install java-17-amazon-corretto-devel -y
java -version  # 验证安装
```

**Ubuntu:**
```bash
sudo apt update
sudo apt install openjdk-17-jdk -y
java -version  # 验证安装
```

### 4.3 创建应用目录

```bash
sudo mkdir -p /opt/kyle-portfolio
sudo chown ec2-user:ec2-user /opt/kyle-portfolio
cd /opt/kyle-portfolio
```

### 4.4 上传应用 (从本地)

在**本地终端**执行:

```bash
cd /Users/mengxiangyi/codingProgram/KyleMengPortfolio/backend
scp -i kyle-portfolio-key.pem target/portfolio-0.0.1-SNAPSHOT.jar ec2-user@[EC2_PUBLIC_IP]:/opt/kyle-portfolio/
```

### 4.5 创建环境变量文件

在EC2上创建配置文件:

```bash
sudo nano /opt/kyle-portfolio/.env
```

添加以下内容 (替换为实际值):

```bash
DATABASE_URL=jdbc:postgresql://[RDS_ENDPOINT]:5432/kyle_portfolio
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_rds_password
FRONTEND_URL=https://your-frontend-domain.com
PORT=8080
```

保存: `Ctrl+X`, `Y`, `Enter`

### 4.6 创建systemd服务

创建服务文件:

```bash
sudo nano /etc/systemd/system/kyle-portfolio.service
```

添加以下内容:

```ini
[Unit]
Description=Kyle Meng Portfolio Backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/kyle-portfolio
EnvironmentFile=/opt/kyle-portfolio/.env
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/kyle-portfolio/portfolio-0.0.1-SNAPSHOT.jar
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

保存并启用服务:

```bash
sudo systemctl daemon-reload
sudo systemctl enable kyle-portfolio
sudo systemctl start kyle-portfolio
```

### 4.7 检查服务状态

```bash
sudo systemctl status kyle-portfolio
sudo journalctl -u kyle-portfolio -f  # 查看实时日志
```

### 4.8 测试应用

```bash
curl http://localhost:8080/api/health
```

应该返回健康状态。

## 🌐 步骤 5: 配置 Nginx 反向代理 (推荐)

### 5.1 安装Nginx

**Amazon Linux 2023:**
```bash
sudo dnf install nginx -y
```

**Ubuntu:**
```bash
sudo apt install nginx -y
```

### 5.2 配置Nginx

```bash
sudo nano /etc/nginx/conf.d/kyle-portfolio.conf
```

添加配置:

```nginx
server {
    listen 80;
    server_name api.kylemeng.com;  # 替换为你的后端域名

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.3 启动Nginx

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

## 🔒 步骤 6: 配置 HTTPS (Let's Encrypt)

### 6.1 安装Certbot

**Amazon Linux 2023:**
```bash
sudo dnf install certbot python3-certbot-nginx -y
```

**Ubuntu:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 获取SSL证书

```bash
sudo certbot --nginx -d api.kylemeng.com
```

按提示操作，证书会自动续期。

## 🔄 步骤 7: 更新前端配置

更新前端代码中的API地址:

```typescript
// frontend/src/services/photographyApi.ts
const API_BASE_URL = 'https://api.kylemeng.com/api';
```

重新构建并部署前端。

## 📊 步骤 8: 监控和维护

### 8.1 查看应用日志

```bash
sudo journalctl -u kyle-portfolio -f
```

### 8.2 重启应用

```bash
sudo systemctl restart kyle-portfolio
```

### 8.3 查看数据库连接

```bash
# 在EC2上安装PostgreSQL客户端
sudo dnf install postgresql15 -y  # Amazon Linux
# 或
sudo apt install postgresql-client -y  # Ubuntu

# 连接到RDS
psql -h [RDS_ENDPOINT] -U postgres -d kyle_portfolio
```

## 🔧 故障排查

### 问题1: 应用无法连接数据库

**检查点**:
1. RDS安全组是否允许EC2访问
2. 数据库凭据是否正确
3. RDS端点地址是否正确
4. 网络连通性: `telnet [RDS_ENDPOINT] 5432`

### 问题2: CORS错误

**解决方案**:
1. 检查 `application-prod.properties` 中的 `FRONTEND_URL`
2. 确保包含所有前端域名 (包括 www 和非 www)
3. 重启应用

### 问题3: 内存不足

**解决方案**:
调整JVM内存参数:

```bash
sudo nano /etc/systemd/system/kyle-portfolio.service
```

修改 `ExecStart`:
```ini
ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar -Dspring.profiles.active=prod /opt/kyle-portfolio/portfolio-0.0.1-SNAPSHOT.jar
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart kyle-portfolio
```

## 💰 成本估算

**免费套餐 (12个月)**:
- EC2 t2.micro: 免费
- RDS db.t3.micro: 免费 (750小时/月)
- 数据传输: 15GB免费/月

**小规模生产环境 (月)**:
- EC2 t3.small: ~$15
- RDS db.t3.small: ~$30
- 数据传输: ~$5-10
- **总计**: ~$50-55/月

## 📝 更新部署脚本

参考 `deployment/deploy.sh` 脚本实现自动化部署。

## 🎉 完成！

您的后端应用现已部署到AWS！

**测试端点**:
- Health Check: `https://api.kylemeng.com/api/health`
- Photo Categories: `https://api.kylemeng.com/api/photography/categories`

**下一步**:
1. 配置自动化CI/CD (GitHub Actions)
2. 设置CloudWatch监控和告警
3. 配置自动扩展和负载均衡

