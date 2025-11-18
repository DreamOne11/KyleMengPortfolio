# 🎨 前端部署指南

## 📋 部署前准备

### 1. 已完成的配置 ✅

- ✅ API 地址已更新为后端服务器: `http://44.223.49.55:8080/api`
- ✅ 前端部署脚本已创建: `deploy-frontend.sh`
- ✅ 代码已修改支持环境变量配置

### 2. 需要的信息

| 项目 | 值 |
|------|-----|
| **前端服务器** | 3.22.167.117 (从您的截图) |
| **后端服务器** | 44.223.49.55:8080 |
| **SSH 用户** | ec2-user |
| **SSH 密钥** | kyle-portfolio-key.pem |
| **部署目录** | /var/www/kyle-portfolio |

---

## 🚀 快速部署步骤

### 方法一：使用自动部署脚本（推荐）

```bash
# 1. 进入 deployment 目录
cd deployment

# 2. 确保有正确的 SSH 密钥
# 如果密钥在其他位置，复制到这里或设置环境变量

# 3. 运行部署脚本
./deploy-frontend.sh

# 或者指定自定义配置
FRONTEND_EC2_HOST=ec2-user@3.22.167.117 \
SSH_KEY=./kyle-portfolio-key.pem \
./deploy-frontend.sh
```

### 方法二：手动部署

```bash
# 1. 构建前端
cd frontend
REACT_APP_API_URL=http://44.223.49.55:8080/api npm run build

# 2. 打包构建文件
cd build
tar -czf frontend-build.tar.gz .

# 3. 上传到服务器
scp -i ../deployment/kyle-portfolio-key.pem \
    frontend-build.tar.gz \
    ec2-user@3.22.167.117:/tmp/

# 4. SSH 到服务器部署
ssh -i deployment/kyle-portfolio-key.pem ec2-user@3.22.167.117

# 在服务器上执行：
sudo rm -rf /var/www/kyle-portfolio/*
cd /var/www/kyle-portfolio
sudo tar -xzf /tmp/frontend-build.tar.gz
sudo chown -R ec2-user:ec2-user /var/www/kyle-portfolio

# 5. 重启 Web 服务器
sudo systemctl reload nginx   # 如果使用 Nginx
# 或
sudo systemctl reload httpd   # 如果使用 Apache
```

---

## 🔧 必需的后端 CORS 配置

部署前端后，需要确保后端允许前端域名访问。

### 1. 更新后端 CORS 配置

在后端服务器上修改配置文件：

```bash
# SSH 到后端服务器
ssh -i deployment/kyle-portfolio-key.pem ec2-user@44.223.49.55

# 编辑环境配置
sudo nano /opt/kyle-portfolio/.env
```

添加或修改：
```properties
# 允许的前端源地址
CORS_ALLOWED_ORIGINS=http://3.22.167.117,http://localhost:3000
```

### 2. 重启后端服务

```bash
sudo systemctl restart kyle-portfolio
```

### 3. 验证 CORS 配置

```bash
# 测试 CORS
curl -H "Origin: http://3.22.167.117" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://44.223.49.55:8080/api/photos
```

---

## 🧪 部署后验证

### 1. 访问前端应用

打开浏览器访问：**http://3.22.167.117**

### 2. 检查 API 连接

1. 打开浏览器开发者工具 (F12)
2. 切换到 **Network** (网络) 标签
3. 刷新页面
4. 查看 API 请求：
   - ✅ 请求应该发送到: `http://44.223.49.55:8080/api/...`
   - ✅ 状态码应该是: 200 (成功)
   - ❌ 如果是 404: 检查 API 路径
   - ❌ 如果是 CORS 错误: 检查后端 CORS 配置

### 3. 检查控制台日志

在开发者工具的 **Console** (控制台) 标签：
- ✅ 无错误信息
- ❌ 如有 CORS 错误: 需要更新后端配置
- ❌ 如有网络错误: 检查后端服务状态

### 4. 功能测试

- [ ] 主页加载正常
- [ ] Photography 页面显示照片
- [ ] 照片分类正确显示
- [ ] 照片详情可以打开
- [ ] 页面切换流畅

---

## 🔍 Web 服务器配置

### Nginx 配置示例

如果使用 Nginx，配置文件通常在 `/etc/nginx/conf.d/` 或 `/etc/nginx/sites-available/`:

```nginx
server {
    listen 80;
    server_name 3.22.167.117;

    root /var/www/kyle-portfolio;
    index index.html;

    # 支持 React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

应用配置：
```bash
sudo nginx -t                    # 测试配置
sudo systemctl reload nginx      # 重载配置
```

### Apache 配置示例

如果使用 Apache，配置文件通常在 `/etc/httpd/conf.d/`:

```apache
<VirtualHost *:80>
    ServerName 3.22.167.117
    DocumentRoot /var/www/kyle-portfolio

    <Directory /var/www/kyle-portfolio>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # 支持 React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Gzip 压缩
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript
</VirtualHost>
```

应用配置：
```bash
sudo httpd -t                    # 测试配置
sudo systemctl reload httpd      # 重载配置
```

---

## 🐛 故障排查

### 问题 1: API 请求失败 (CORS 错误)

**症状**: 浏览器控制台显示 CORS 错误

**解决方案**:
```bash
# 1. SSH 到后端服务器
ssh -i deployment/kyle-portfolio-key.pem ec2-user@44.223.49.55

# 2. 检查后端日志
sudo journalctl -u kyle-portfolio -f

# 3. 更新 CORS 配置
sudo nano /opt/kyle-portfolio/.env
# 添加: CORS_ALLOWED_ORIGINS=http://3.22.167.117

# 4. 重启后端
sudo systemctl restart kyle-portfolio
```

### 问题 2: 页面显示但照片不加载

**症状**: 前端页面正常，但照片列表为空

**解决方案**:
```bash
# 1. 检查 API 是否可访问
curl http://44.223.49.55:8080/api/photos

# 2. 检查浏览器控制台是否有错误

# 3. 验证后端服务运行正常
ssh -i deployment/kyle-portfolio-key.pem ec2-user@44.223.49.55
sudo systemctl status kyle-portfolio
```

### 问题 3: 404 页面刷新后丢失

**症状**: 直接访问 /photography 等路由显示 404

**解决方案**: 需要配置 Web 服务器支持 React Router (见上面的 Nginx/Apache 配置)

### 问题 4: 部署脚本权限错误

**症状**: `Permission denied: deploy-frontend.sh`

**解决方案**:
```bash
chmod +x deployment/deploy-frontend.sh
```

### 问题 5: SSH 连接失败

**症状**: `Permission denied (publickey)`

**解决方案**:
```bash
# 检查密钥权限
chmod 400 deployment/kyle-portfolio-key.pem

# 使用正确的用户名
ssh -i deployment/kyle-portfolio-key.pem ec2-user@3.22.167.117
```

---

## 📊 部署检查清单

### 部署前
- [ ] 后端服务正常运行 (http://44.223.49.55:8080)
- [ ] SSH 密钥文件存在且权限正确 (400)
- [ ] 前端代码已提交到 Git
- [ ] 已备份现有前端文件

### 部署中
- [ ] 前端构建成功
- [ ] 文件上传成功
- [ ] 部署脚本执行无错误
- [ ] Web 服务器重载成功

### 部署后
- [ ] 前端页面可访问 (http://3.22.167.117)
- [ ] API 请求成功 (无 CORS 错误)
- [ ] 照片正常显示
- [ ] 页面路由正常工作
- [ ] 浏览器控制台无错误

---

## 🎯 性能优化建议

### 1. 启用 Gzip 压缩
减少传输文件大小，加快加载速度

### 2. 配置静态资源缓存
```nginx
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 配置 CDN
将静态资源部署到 CloudFront 等 CDN

### 4. 启用 HTTP/2
```nginx
listen 443 ssl http2;
```

### 5. 图片优化
- 使用 WebP 格式
- 配置响应式图片
- 启用懒加载

---

## 🔄 更新流程

后续更新前端时：

```bash
# 1. 开发完成后提交代码
git add .
git commit -m "Update frontend features"

# 2. 运行部署脚本
cd deployment
./deploy-frontend.sh

# 3. 验证更新
# 访问 http://3.22.167.117
# 检查新功能是否正常
```

---

## 📞 快速参考

```bash
# 构建前端
cd frontend && npm run build

# 部署到服务器
cd deployment && ./deploy-frontend.sh

# SSH 到前端服务器
ssh -i deployment/kyle-portfolio-key.pem ec2-user@3.22.167.117

# SSH 到后端服务器
ssh -i deployment/kyle-portfolio-key.pem ec2-user@44.223.49.55

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 重启 Web 服务
sudo systemctl restart nginx

# 测试 API
curl http://44.223.49.55:8080/api/photos
```

---

**祝部署顺利！** 🚀

如有问题，请参考故障排查部分或查看日志文件。

