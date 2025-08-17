# Todo MCP Server

一个连接到远程 Todo App 的 MCP (Model Context Protocol) 服务器，允许 Claude 客户端远程操作待办事项。

## 功能特性

- 🔗 连接到远程 Todo API
- 📝 支持 8 种待办事项操作
- 🔐 API 密钥认证支持
- 📊 统计信息查询
- 🚀 批量操作支持

## 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量模板并编辑：

```bash
cp .env.example .env
nano .env
```

修改以下配置：

```bash
# Todo API 配置
TODO_API_URL=http://your-domain.com  # 你的远程服务器地址
TODO_API_KEY=your-api-key-here       # 你的 API 密钥（可选）
```

### 3. 测试服务器

```bash
node test-mcp.js
```

如果看到 "✅ 成功！找到 8 个工具"，说明配置正确。

## Claude 客户端配置

### 方法1：使用 Claude Code CLI

1. 打开 Claude Code 设置文件：
   ```bash
   code ~/.config/claude-code/claude_desktop_config.json
   ```

2. 添加 MCP 服务器配置：
   ```json
   {
     "mcpServers": {
       "todo-app": {
         "command": "node",
         "args": [
           "/path/to/todo-mcp-server/src/index.js"
         ],
         "env": {
           "TODO_API_URL": "http://your-domain.com",
           "TODO_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

3. 重启 Claude Code

### 方法2：直接运行

```bash
# 在项目目录中
npm start
```

然后在另一个终端中连接 Claude 客户端。

## 可用工具

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `list_todos` | 获取所有待办事项 | 无 |
| `create_todo` | 创建新待办事项 | `text` (字符串) |
| `update_todo` | 更新现有待办事项 | `id` (数字), `text` (字符串,可选), `completed` (布尔值,可选) |
| `delete_todo` | 删除待办事项 | `id` (数字) |
| `toggle_todo` | 切换完成状态 | `id` (数字) |
| `create_todos_batch` | 批量创建 | `todos` (数组) |
| `get_todos_stats` | 获取统计信息 | 无 |
| `clear_completed_todos` | 清除已完成项 | 无 |

## 使用示例

配置完成后，你可以在 Claude 中使用自然语言操作你的远程待办事项：

```
"帮我添加3个关于学习的待办事项"
"查看我所有的待办事项"
"把ID为5的任务标记为完成"
"删除所有已完成的任务"
"给我看看待办事项的统计信息"
```

## 故障排除

### 1. 连接失败

检查网络连接和 API 地址：
```bash
curl http://your-domain.com/api/todos
```

### 2. 认证失败

确保 API 密钥正确：
```bash
curl -H "X-API-Key: your-api-key" http://your-domain.com/api/todos
```

### 3. MCP 服务器无法启动

检查 Node.js 版本（需要 18+）：
```bash
node --version
```

检查依赖安装：
```bash
npm install
```

### 4. Claude 客户端无法连接

1. 检查配置文件路径是否正确
2. 确保配置文件 JSON 格式正确
3. 重启 Claude 客户端
4. 查看 Claude 错误日志

## 开发和调试

### 启用详细日志

```bash
export DEBUG=mcp:*
npm start
```

### 手动测试工具

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_todos","arguments":{}}}' | node src/index.js
```

## 项目结构

```
todo-mcp-server/
├── src/
│   └── index.js          # MCP 服务器主文件
├── package.json          # 项目配置
├── .env.example         # 环境变量模板
├── .env                 # 环境变量配置
├── test-mcp.js         # 测试脚本
└── README.md           # 说明文档
```

## 技术栈

- **MCP SDK**: @modelcontextprotocol/sdk
- **HTTP 客户端**: axios
- **环境配置**: dotenv
- **运行时**: Node.js 18+

---

## 下一步

配置完成后，你就可以在 Claude 中使用自然语言来管理你的远程待办事项了！

示例对话：
- "帮我看看今天有什么待办事项"
- "添加一个'完成项目文档'的任务"
- "把所有关于'学习'的任务标记为完成"

享受通过 Claude 管理你的远程待办事项吧！ 🎉