# 🚀 TODO应用宝塔面板部署指南

## 准备工作
- ✅ 阿里云服务器（Linux + 宝塔面板）
- ✅ 远程连接工具（SSH）
- ✅ 项目源码

## 第一步：检查宝塔面板
1. 浏览器访问：`http://你的服务器IP:8888`
2. 登录宝塔面板

## 第二步：安装必要软件
在宝塔面板「软件商店」中安装：
- **MySQL 5.7+**
- **Node.js 版本管理器** 
- **Nginx**（如果没有）
- **PM2 管理器**（推荐）

## 第三步：创建网站目录
1. 点击「文件」→ 进入 `/www/wwwroot/`
2. 新建文件夹：`todo-app`

## 第四步：上传项目文件

### 方法一：宝塔面板上传（推荐新手）
1. 先将本地项目打包成 `todo-app.zip`
2. 在宝塔文件管理中，进入 `/www/wwwroot/todo-app/`
3. 点击「上传」→ 选择 `todo-app.zip`
4. 上传完成后，右键解压

### 方法二：Git 克隆（如果有Git仓库）
```bash
cd /www/wwwroot/
git clone <你的仓库地址> todo-app
```

## 第五步：配置 MySQL 数据库
1. 宝塔面板 → 「数据库」→ 「添加数据库」
2. 填写信息：
   - 数据库名：`todoapp`
   - 用户名：`todoapp`
   - 密码：`DRGFcZTHEDwGfjbn`
roo密码-数据库密码 SPdhRM5jm4RcjYa2
3. 记下这些信息！

## 第六步：修改环境配置
编辑项目中的 `.env` 文件：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=todoapp
DB_PASSWORD=你设置的数据库密码
DB_NAME=todoapp

# 服务器配置
PORT=3001
```

## 第七步：安装依赖并启动项目

### 在宝塔终端中执行：
```bash
# 进入项目目录
cd /www/wwwroot/todo-app

# 安装依赖
npm install

# 测试启动
npm start
```

## 第八步：使用 PM2 管理进程（推荐）
1. 宝塔面板 → 「软件商店」→ 安装「PM2管理器」
2. 在 PM2 中添加项目：
   - 项目名称：`todo-app`
   - 启动文件：`/www/wwwroot/todo-app/server.js`
   - 运行目录：`/www/wwwroot/todo-app`
3. 点击启动

## 第九步：配置 Nginx 反向代理
1. 宝塔面板 → 「网站」→ 「添加站点」
2. 填写：
   - 域名：你的域名（或直接用IP）
   - 根目录：`/www/wwwroot/todo-app`
3. 添加完成后，点击「设置」→「反向代理」
4. 添加反向代理：
   - 代理名称：`todo-app`
   - 目标URL：`http://127.0.0.1:3001`
   - 发送域名：`$host`

## 第十步：配置安全组
在阿里云控制台：
1. 找到你的ECS实例
2. 「网络与安全」→「安全组」
3. 添加规则：
   - 端口：`80/443`（HTTP/HTTPS）
   - 授权对象：`0.0.0.0/0`

## 访问测试
- **直接访问**：`http://你的IP:3001/index.html`
- **通过域名**：`http://你的域名/index.html`

## 常见问题

### 1. 连接数据库失败
- 检查 `.env` 文件中的数据库配置
- 确保 MySQL 服务正在运行

### 2. 端口访问不了
- 检查阿里云安全组设置
- 检查宝塔面板安全设置

### 3. PM2 启动失败
- 查看 PM2 日志：项目详情 → 日志
- 检查 Node.js 版本

### 4. 反向代理不生效
- 检查 Nginx 配置
- 重启 Nginx 服务

## 维护命令

### PM2 常用命令：
```bash
pm2 list              # 查看进程列表
pm2 restart todo-app   # 重启应用
pm2 stop todo-app      # 停止应用
pm2 logs todo-app      # 查看日志
```

### 更新代码：
```bash
cd /www/wwwroot/todo-app
git pull              # 如果使用Git
pm2 restart todo-app  # 重启应用
```

## 🎉 完成！
现在你的 TODO 应用已经成功部署到线上了！

## todo
 proxy_set_header X-Forwarded-Proto $scheme; // nginx