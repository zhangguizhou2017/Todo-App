# Todo List 应用

一个使用 Koa2 + MySQL 的全栈待办事项应用。

## 功能特性

- ✅ 添加、编辑、删除待办事项
- 🔄 标记完成/未完成状态
- 🔍 筛选功能（全部/待完成/已完成）
- 📊 统计信息显示
- 💾 MySQL 数据持久化
- 📱 响应式设计

## 技术栈

**前端：**
- HTML5 + CSS3
- 原生 JavaScript (ES6+)
- Fetch API

**后端：**
- Node.js
- Koa2 框架
- MySQL 数据库

## 环境要求

- Node.js >= 14.0.0
- MySQL >= 5.7
- npm 或 yarn

## 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd CCClaude
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置数据库**
   - 创建 MySQL 数据库
   - 复制 `.env` 文件并修改数据库配置：
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=todoapp
   PORT=3000
   ```

4. **启动应用**
   ```bash
   # 开发模式（自动重启）
   npm run dev
   
   # 生产模式
   npm start
   ```

5. **访问应用**
   打开浏览器访问 `http://localhost:3000/index.html`

## API 接口

### 获取所有待办事项
```
GET /api/todos
```

### 添加待办事项
```
POST /api/todos
Content-Type: application/json

{
  "text": "待办事项内容"
}
```

### 更新待办事项
```
PUT /api/todos/:id
Content-Type: application/json

{
  "text": "新的内容",
  "completed": true
}
```

### 删除待办事项
```
DELETE /api/todos/:id
```

## 数据库结构

```sql
CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 项目结构

```
CCClaude/
├── config/
│   └── database.js     # 数据库配置
├── routes/
│   └── todos.js        # API路由
├── index.html          # 前端页面
├── style.css           # 样式文件
├── script.js           # 前端逻辑
├── server.js           # 服务器入口
├── package.json        # 项目配置
├── .env               # 环境变量
└── README.md          # 说明文档
```

## 开发说明

- 前端使用原生 JavaScript，无需构建工具
- 后端 API 遵循 RESTful 规范
- 数据库连接使用连接池，支持并发访问
- 错误处理完善，用户体验友好

## 部署注意事项

1. 确保 MySQL 服务正常运行
2. 修改 `.env` 文件中的数据库配置
3. 生产环境建议使用 PM2 进行进程管理
4. 配置 Nginx 反向代理（可选）