# 🚀 GitHub Actions 自动部署指南

这个指南将帮你设置 GitHub Actions 自动部署，让你每次推送代码时都能自动更新服务器上的应用。

## 📋 前置条件

1. ✅ GitHub 仓库已创建并关联
2. ✅ 服务器已部署应用（按照 deploy-guide.md）
3. ✅ 服务器已安装 Git, Node.js, PM2
4. ✅ 服务器可以通过 SSH 访问

## 🔧 第一步：准备服务器

### 1. 在服务器上设置 Git 仓库

```bash
# SSH 连接到你的服务器
ssh root@你的服务器IP

# 进入项目目录
cd /www/wwwroot/todo-app

# 初始化 Git（如果还没有）
git init
git remote add origin https://github.com/zhangguizhou2017/Todo-App.git

# 拉取代码
git pull origin main
```

### 2. 生成 SSH 密钥（用于 GitHub Actions 连接）

```bash
# 在服务器上生成专用密钥
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""

# 将公钥添加到 authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# 查看私钥（稍后需要复制到 GitHub）
cat ~/.ssh/github_actions
```

**重要**: 复制私钥内容，包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`

### 3. 确保部署脚本有执行权限

```bash
chmod +x /www/wwwroot/todo-app/deploy.sh
```

## 🔐 第二步：配置 GitHub Secrets

在你的 GitHub 仓库中设置敏感信息：

1. 进入 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，依次添加：

| Secret 名称 | 值 | 说明 |
|------------|--------|------|
| `SERVER_HOST` | `你的服务器IP` | 服务器地址 |
| `SERVER_USER` | `root` | SSH 用户名 |
| `SERVER_SSH_KEY` | `私钥内容` | 上面生成的私钥 |
| `SERVER_PORT` | `22` | SSH 端口（可选） |

### 添加 Secret 的步骤：
```
1. Secret name: SERVER_HOST
   Secret value: 8.134.137.101 （你的服务器IP）

2. Secret name: SERVER_USER  
   Secret value: root

3. Secret name: SERVER_SSH_KEY
   Secret value: -----BEGIN OPENSSH PRIVATE KEY-----
                [你的完整私钥内容]
                -----END OPENSSH PRIVATE KEY-----

4. Secret name: SERVER_PORT
   Secret value: 22
```

## 🔄 第三步：测试自动部署

### 1. 提交代码触发部署

```bash
# 在本地项目目录
git add .
git commit -m "feat: 添加 GitHub Actions 自动部署配置"
git push origin main
```

### 2. 查看 Actions 执行

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看 "自动部署到服务器" 工作流
4. 点击进入查看详细日志

### 3. 验证部署结果

```bash
# SSH 到服务器检查
ssh root@你的服务器IP

# 检查 PM2 状态
pm2 status

# 查看应用日志
pm2 logs todo-app --lines 20

# 测试 API
curl http://localhost:3000/api/todos
```

## 📊 监控和日志

### 查看部署日志
```bash
# 服务器上查看部署日志
tail -f /var/log/todo-app-deploy.log
```

### 常用 PM2 命令
```bash
pm2 status          # 查看状态
pm2 logs todo-app    # 查看日志
pm2 restart todo-app # 重启应用
pm2 stop todo-app    # 停止应用
```

## 🔧 高级配置

### 1. 只在特定分支部署

修改 `.github/workflows/deploy.yml`：
```yaml
on:
  push:
    branches: [ main, production ]  # 只在这些分支部署
```

### 2. 添加环境区分

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # 添加环境保护
```

### 3. 添加 Slack/微信通知

在 workflow 末尾添加：
```yaml
- name: 发送通知
  if: always()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"部署状态: ${{ job.status }}"}' \
    你的Webhook地址
```

## ❗ 故障排除

### 1. SSH 连接失败
```
Error: Process completed with exit code 255
```
**解决方案:**
- 检查服务器 IP 和端口
- 确认 SSH 密钥格式正确
- 检查服务器防火墙设置

### 2. Git 权限问题
```
Permission denied (publickey)
```
**解决方案:**
```bash
# 在服务器上配置 Git 用户
git config --global user.name "GitHub Actions"
git config --global user.email "actions@github.com"
```

### 3. PM2 命令不存在
```
pm2: command not found
```
**解决方案:**
```bash
# 安装 PM2
npm install -g pm2
```

### 4. 数据库连接失败
**解决方案:**
- 检查 `.env` 文件配置
- 确认 MySQL 服务运行正常
- 检查数据库用户权限

## 🎯 部署成功后

✅ **每次推送代码到 main 分支，会自动:**
1. 拉取最新代码
2. 安装依赖
3. 重启应用
4. 检查应用状态

✅ **你可以:**
- 在 GitHub Actions 页面查看部署状态
- 在服务器上查看详细日志
- 通过 API 测试应用功能

## 📝 最佳实践

1. **本地测试**: 推送前确保本地代码正常运行
2. **小步快跑**: 频繁小量提交，便于快速定位问题
3. **回滚准备**: 保留 Git 历史，必要时可快速回滚
4. **监控告警**: 设置应用监控和异常告警

---

🎉 **恭喜！** 你现在有了一个全自动的 CI/CD 部署流水线！

每次修改代码 → 推送到 GitHub → 自动部署到服务器 🚀