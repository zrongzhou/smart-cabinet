# GitHub Actions CI/CD 自动部署配置指南

## 📋 配置步骤

### 1. 在 GitHub 仓库配置 Secrets

访问：https://github.com/zrongzhou/smart-cabinet/settings/secrets/actions

点击 **"New repository secret"** 添加以下 4 个 Secrets：

| Secret 名称 | 描述 | 示例值 |
|--------------|------|----------|
| `SERVER_IP` | 服务器 IP 地址 | `43.139.193.135` (新 IP) |
| `SERVER_USER` | SSH 用户名 | `root` |
| `SERVER_PORT` | SSH 端口 | `22` |
| `SSH_PRIVATE_KEY` | SSH 私钥内容 | (见下方获取方法) |

---

### 2. 获取 SSH 私钥内容

**如果已有私钥文件** (`C:\Users\Administrator\.ssh\github-actions-key`)：

```bash
# Windows PowerShell
Get-Content C:\Users\Administrator\.ssh\github-actions-key
```

复制**整个私钥内容**（包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`），粘贴到 `SSH_PRIVATE_KEY` Secret。

**如果需要生成新密钥对**：

```bash
# 在本地生成新密钥对
ssh-keygen -t ed25519 -C "github-actions@smart-cabinet" -f ~/.ssh/smart-cabinet-deploy

# 复制私钥内容（添加到 GitHub Secrets）
Get-Content ~/.ssh/smart-cabinet-deploy

# 复制公钥内容（添加到服务器）
Get-Content ~/.ssh/smart-cabinet-deploy.pub
```

将公钥添加到服务器：
```bash
# 在服务器上执行（通过 VNC 或新 SSH）
echo "ssh-ed25519 AAAA... github-actions@smart-cabinet" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

### 3. 在服务器上准备项目目录

通过 VNC 控制台或新 SSH 连接执行：

```bash
# 1. 安装 Node.js, npm, PM2, Nginx (如果重装系统后未安装)
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
yum install -y nodejs nginx
npm install -g pm2

# 2. 克隆项目
mkdir -p /var/www
cd /var/www
git clone https://github.com/zrongzhou/smart-cabinet.git
cd smart-cabinet
npm install
npm run build

# 3. 启动 PM2
pm2 start npm --name "smart-cabinet" -- start
pm2 save

# 4. 配置 Nginx 反向代理
cat > /etc/nginx/conf.d/smart-cabinet.conf << 'EOF'
server {
    listen 80;
    server_name test.wstoolcabinet.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 5. 配置 HTTPS (如果有 SSL 证书)
cat > /etc/nginx/conf.d/smart-cabinet-ssl.conf << 'EOF'
server {
    listen 443 ssl http2;
    server_name test.wstoolcabinet.com;

    ssl_certificate /etc/nginx/ssl/test.wstoolcabinet.com_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/test.wstoolcabinet.com.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name test.wstoolcabinet.com;
    return 301 https://$server_name$request_uri;
}
EOF

# 6. 测试并重载 Nginx
nginx -t
systemctl reload nginx
```

---

### 4. 推送代码触发自动部署

```bash
cd d:/workbuddy/2026-06-19-13-21-39/smart-cabinet-local
git add .github/workflows/deploy.yml GITHUB_ACTIONS_SETUP.md
git commit -m "Add GitHub Actions CI/CD workflow"
git push origin master
```

推送后，GitHub Actions 将自动执行：
1. ✅ 检出代码
2. ✅ 安装依赖
3. ✅ 构建项目
4. ✅ 部署到服务器
5. ✅ 健康检查

查看进度：https://github.com/zrongzhou/smart-cabinet/actions

---

## 🔧 故障排查

### 问题 1：SSH 连接失败

**错误信息**：`ssh: connect to host xxx port 22: Connection timed out`

**解决方案**：
1. 检查服务器防火墙：`firewall-cmd --list-all`
2. 开放 SSH 端口：`firewall-cmd --permanent --add-service=ssh && firewall-cmd --reload`
3. 检查服务器 SSH 服务：`systemctl status sshd`

### 问题 2：权限被拒绝

**错误信息**：`Permission denied (publickey)`

**解决方案**：
1. 确认 SSH 私钥格式正确（包含 `-----BEGIN OPENSSH PRIVATE KEY-----`）
2. 确认公钥已添加到服务器 `~/.ssh/authorized_keys`
3. 确认文件权限：`chmod 600 ~/.ssh/authorized_keys`

### 问题 3：GitHub Actions 超时

**原因**：部署脚本执行时间过长

**解决方案**：
在 `deploy.yml` 中增加超时时间：
```yaml
- name: Deploy to server
  uses: appleboy/ssh-action@v1.0.0
  with:
    command_timeout: 5m  # 增加超时到 5 分钟
```

---

## 📊 预期效果

配置完成后，工作流程：

```
本地修改代码 → git push → GitHub Actions 自动触发 → 部署到服务器 → 网站更新
     ↓              ↓                ↓                    ↓                 ↓
   5 秒钟        10 秒钟         2-3 分钟            1-2 分钟         立即生效
```

**不再需要手动 SSH 部署！** 🎉

---

## 📞 需要提供的信息

请告知新服务器的：
1. **IP 地址**（重装后的新 IP）
2. **SSH 连接方式**（新的 SSH 密钥或密码）

我会立即更新 `.github/workflows/deploy.yml` 并推送到 GitHub。
