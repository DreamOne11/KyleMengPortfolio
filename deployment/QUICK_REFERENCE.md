# 🚀 AWS 部署快速参考

## 🌐 访问地址

```
应用: http://44.223.49.55:8080
API:  http://44.223.49.55:8080/api/photos
```

## 🔑 登录信息

### SSH 连接
```bash
ssh -i kyle-portfolio-key.pem ec2-user@44.223.49.55
```

### 数据库连接
```bash
psql -h kyle-portfolio-db.covowusqeeh3.us-east-1.rds.amazonaws.com \
     -U postgres -d kyle_portfolio
# 密码: 见 .db-password.txt
```

## 📋 常用命令

### 服务管理
```bash
# 查看状态
sudo systemctl status kyle-portfolio

# 重启
sudo systemctl restart kyle-portfolio

# 查看日志
sudo journalctl -u kyle-portfolio -f
```

### 应用更新
```bash
# 本地操作
cd deployment
export EC2_HOST=ec2-user@44.223.49.55
export SSH_KEY=./kyle-portfolio-key.pem
./deploy.sh
```

### API 测试
```bash
# 健康检查
curl http://44.223.49.55:8080/

# 获取照片
curl http://44.223.49.55:8080/api/photos
```

## 📊 资源 ID

| 资源 | ID/地址 |
|------|---------|
| EC2 实例 | i-0fccaec6141678d19 |
| EC2 IP | 44.223.49.55 |
| RDS 端点 | kyle-portfolio-db.covowusqeeh3.us-east-1.rds.amazonaws.com |
| RDS 安全组 | sg-0fa662d82f338a0d3 |
| EC2 安全组 | sg-01833f2ace857e75e |
| AWS 区域 | us-east-1 |

## 📁 重要文件

```
deployment/
├── kyle-portfolio-key.pem      # SSH 私钥 🔒
├── .db-password.txt            # 数据库密码 🔒
├── aws-config.env              # AWS 配置 🔒
├── .env.production             # 应用配置 🔒
├── DEPLOYMENT_SUCCESS.md       # 完整文档 📚
└── aws-cli-setup.sh            # 创建脚本 🛠️
```

**🔒 = 敏感文件，不要提交到 Git**

## 💰 费用

当前: **$0.00/月** (免费套餐)

## 🆘 故障排查

### 应用无响应
```bash
ssh -i kyle-portfolio-key.pem ec2-user@44.223.49.55
sudo systemctl restart kyle-portfolio
sudo journalctl -u kyle-portfolio -n 50
```

### 数据库连接失败
```bash
# 检查 RDS 状态
aws rds describe-db-instances \
    --db-instance-identifier kyle-portfolio-db \
    --region us-east-1 \
    --query 'DBInstances[0].DBInstanceStatus'
```

### 无法 SSH 连接
```bash
# 检查实例状态
aws ec2 describe-instances \
    --instance-ids i-0fccaec6141678d19 \
    --region us-east-1 \
    --query 'Reservations[0].Instances[0].State.Name'

# 检查安全组
aws ec2 describe-security-groups \
    --group-ids sg-01833f2ace857e75e \
    --region us-east-1
```

## 📞 获取帮助

- 完整文档: `DEPLOYMENT_SUCCESS.md`
- AWS 指南: `AWS_DEPLOYMENT_COMPLETE.md`
- 配置详情: `aws-config.env`

---

**部署日期**: 2025年11月18日  
**状态**: ✅ 运行正常

