# 🎉 AWS 后端环境部署完成！

部署时间：$(date)

## 📋 资源清单

### RDS 数据库
- **实例标识符**: kyle-portfolio-db
- **端点**: kyle-portfolio-db.covowusqeeh3.us-east-1.rds.amazonaws.com
- **端口**: 5432
- **数据库名**: kyle_portfolio
- **用户名**: postgres
- **密码**: 见 `.db-password.txt` 文件
- **引擎**: PostgreSQL 15.15
- **实例类型**: db.t3.micro
- **存储**: 20GB (gp2)
- **安全组ID**: sg-0fa662d82f338a0d3

### EC2 实例
- **实例ID**: i-0fccaec6141678d19
- **公网IP**: 44.223.49.55
- **实例类型**: t3.micro
- **AMI**: ami-0cae6d6fe6048ca2c (Amazon Linux 2023)
- **安全组ID**: sg-01833f2ace857e75e
- **SSH密钥**: kyle-portfolio-key.pem

### 安全组规则
**RDS安全组** (sg-0fa662d82f338a0d3):
- 入站: 允许 PostgreSQL (5432) 从任何IP
- 出站: 允许所有流量

**EC2安全组** (sg-01833f2ace857e75e):
- 入站: 
  - SSH (22) - 从任何IP
  - HTTP (80) - 从任何IP
  - Spring Boot (8080) - 从任何IP
- 出站: 允许所有流量

### AWS 区域
- **Region**: us-east-1 (美国东部-弗吉尼亚)

---

## 🔧 配置文件

已生成以下配置文件：

1. **aws-config.env** - AWS资源完整配置信息
2. **.env.production** - Spring Boot应用环境变量
3. **.db-password.txt** - 数据库密码（请妥善保管）
4. **kyle-portfolio-key.pem** - SSH私钥文件

---

## 🚀 下一步操作

### 选项1: 使用自动部署脚本（推荐）

```bash
# 1. 设置环境变量
export EC2_HOST=ec2-user@44.223.49.55
export SSH_KEY=./kyle-portfolio-key.pem

# 2. 运行部署脚本
./deploy.sh
```

### 选项2: 手动部署

#### 步骤1: 连接到 EC2 实例

```bash
ssh -i kyle-portfolio-key.pem ec2-user@44.223.49.55
```

#### 步骤2: 在 EC2 上安装环境

```bash
# 更新系统
sudo dnf update -y

# 安装 Java 17
sudo dnf install -y java-17-amazon-corretto-headless

# 安装 Docker
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# 验证安装
java -version
docker --version
```

#### 步骤3: 部署应用

```bash
# 创建应用目录
mkdir -p ~/kyle-portfolio
cd ~/kyle-portfolio

# 上传应用（在本地执行）
scp -i kyle-portfolio-key.pem ../backend/target/*.jar ec2-user@44.223.49.55:~/kyle-portfolio/

# 上传配置文件（在本地执行）
scp -i kyle-portfolio-key.pem .env.production ec2-user@44.223.49.55:~/kyle-portfolio/.env

# 在 EC2 上运行应用
cd ~/kyle-portfolio
java -jar *.jar --spring.profiles.active=prod
```

---

## 🧪 测试连接

### 测试 RDS 连接

```bash
# 安装 PostgreSQL 客户端
sudo dnf install -y postgresql15

# 连接到数据库
psql -h kyle-portfolio-db.covowusqeeh3.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d kyle_portfolio \
     -p 5432
```

### 测试应用访问

部署完成后：
```bash
# 健康检查
curl http://44.223.49.55:8080/actuator/health

# API测试
curl http://44.223.49.55:8080/api/photos/categories
```

---

## 📝 重要提示

### 🔒 安全注意事项

1. **妥善保管密钥文件**: kyle-portfolio-key.pem 和 .db-password.txt
2. **修改数据库密码**: 建议定期更新RDS密码
3. **配置防火墙**: 生产环境应限制SSH访问IP范围
4. **启用HTTPS**: 配置SSL证书用于生产环境
5. **不要提交敏感文件到Git**:
   ```bash
   # 已添加到 .gitignore:
   *.pem
   aws-config.env
   .env.production
   .db-password.txt
   ```

### 💰 成本估算

基于 AWS 免费套餐：
- **EC2 t3.micro**: 免费套餐每月750小时（足够全月运行）
- **RDS db.t3.micro**: 免费套餐每月750小时
- **存储**: 20GB 免费
- **数据传输**: 15GB/月 免费

**注意**: 超出免费套餐限制会产生费用，请定期检查 AWS 账单。

### 🔄 更新和维护

```bash
# 停止应用
pkill -f kyle-portfolio

# 重新部署
./deploy.sh

# 查看日志
tail -f ~/kyle-portfolio/logs/application.log

# 备份数据库
pg_dump -h kyle-portfolio-db.covowusqeeh3.us-east-1.rds.amazonaws.com \
        -U postgres -d kyle_portfolio > backup.sql
```

---

## 🆘 故障排查

### 问题1: 无法连接到 EC2
```bash
# 检查安全组规则
aws ec2 describe-security-groups --group-ids sg-01833f2ace857e75e --region us-east-1

# 检查实例状态
aws ec2 describe-instances --instance-ids i-0fccaec6141678d19 --region us-east-1
```

### 问题2: 无法连接到 RDS
```bash
# 检查 RDS 状态
aws rds describe-db-instances --db-instance-identifier kyle-portfolio-db --region us-east-1

# 验证安全组
aws ec2 describe-security-groups --group-ids sg-0fa662d82f338a0d3 --region us-east-1
```

### 问题3: 应用启动失败
```bash
# 查看应用日志
ssh -i kyle-portfolio-key.pem ec2-user@44.223.49.55 'cat ~/kyle-portfolio/logs/application.log'

# 检查 Java 版本
ssh -i kyle-portfolio-key.pem ec2-user@44.223.49.55 'java -version'

# 验证环境变量
ssh -i kyle-portfolio-key.pem ec2-user@44.223.49.55 'cat ~/kyle-portfolio/.env'
```

---

## 📚 相关文档

- [AWS设置详细指南](./aws-setup-guide.md)
- [部署脚本使用说明](./README.md)
- [完整部署方案](./DEPLOYMENT_SUMMARY.md)

---

## ✅ 部署检查清单

- [x] RDS PostgreSQL 数据库创建成功
- [x] EC2 实例创建并运行
- [x] 安全组配置完成
- [x] SSH 密钥生成并保存
- [x] 配置文件生成
- [ ] 应用部署到 EC2
- [ ] 数据库架构初始化
- [ ] API 端点测试通过
- [ ] 前端连接后端测试
- [ ] SSL 证书配置（可选）
- [ ] 域名绑定（可选）

---

## 🎯 快速参考

```bash
# SSH 连接
ssh -i kyle-portfolio-key.pem ec2-user@44.223.49.55

# 数据库连接
psql -h kyle-portfolio-db.covowusqeeh3.us-east-1.rds.amazonaws.com -U postgres -d kyle_portfolio

# 应用URL
http://44.223.49.55:8080

# 查看资源状态
aws ec2 describe-instances --instance-ids i-0fccaec6141678d19 --region us-east-1
aws rds describe-db-instances --db-instance-identifier kyle-portfolio-db --region us-east-1
```

---

**祝部署顺利！** 🚀

