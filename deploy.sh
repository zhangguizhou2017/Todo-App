#!/bin/bash

# Todo App 自动部署脚本

set -e  # 遇到错误立即停止

echo "🚀 开始部署 Todo App..."

# 项目目录
PROJECT_DIR="/www/wwwroot/todo-app"
LOG_FILE="/var/log/todo-app-deploy.log"

# 记录日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}

# 错误处理函数
error_exit() {
    log "❌ 部署失败: $1"
    exit 1
}

log "🗑️ 清理旧版本..."
if [ -d "$PROJECT_DIR" ]; then
    log "删除旧项目目录: $PROJECT_DIR"
    rm -rf "$PROJECT_DIR"
fi

log "📁 创建项目目录..."
mkdir -p "$(dirname "$PROJECT_DIR")"

log "📥 克隆最新代码..."
git clone https://github.com/zhangguizhou2017/Todo-App.git "$PROJECT_DIR" || error_exit "Git 克隆失败"

cd "$PROJECT_DIR" || error_exit "无法进入项目目录"

log "📦 备份旧的 node_modules..."
if [ -d "node_modules" ]; then
    mv node_modules node_modules.backup.$(date +%s)
fi

log "⚙️ 安装主应用依赖..."
npm ci --production || error_exit "主应用依赖安装失败"

log "⚙️ 安装 MCP 服务器依赖..."
cd todo-mcp-server || error_exit "无法进入 MCP 服务器目录"
if [ -d "node_modules" ]; then
    mv node_modules node_modules.backup.$(date +%s)
fi
npm ci --production || error_exit "MCP 服务器依赖安装失败"
cd .. || error_exit "无法返回主目录"

log "🗄️ 检查数据库连接..."
timeout 10s node -e "
const db = require('./config/database');
db.execute('SELECT 1').then(() => {
    console.log('数据库连接正常');
    process.exit(0);
}).catch(err => {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
});
" || error_exit "数据库连接检查失败"

log "🔄 重启应用服务..."
if pm2 list | grep -q "todo-app"; then
    pm2 restart todo-app || error_exit "PM2 重启失败"
else
    pm2 start server.js --name todo-app || error_exit "PM2 启动失败"
fi

log "⏳ 等待应用启动..."
sleep 5

log "🔍 检查应用状态..."
if ! pm2 list | grep -q "online.*todo-app"; then
    error_exit "应用未能正常启动"
fi

log "🌐 测试 API 连接..."
timeout 10s curl -f http://localhost:3000/api/todos > /dev/null || error_exit "API 测试失败"

log "🧹 清理备份文件（保留最近3个）..."
find . -name "node_modules.backup.*" -type d -mtime +3 -exec rm -rf {} + 2>/dev/null || true

log "✅ 部署成功完成！"
log "📊 应用状态:"
pm2 status | tee -a "$LOG_FILE"

log "📋 最近日志:"
pm2 logs todo-app --lines 5 | tee -a "$LOG_FILE"

echo ""
echo "🎉 部署完成！你的 Todo App 现在运行在最新版本上。"
echo "📝 完整日志: $LOG_FILE"
echo "🔗 访问地址: http://你的域名/index.html"