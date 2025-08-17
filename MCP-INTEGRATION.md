# Todo App MCP 集成改造文档

## 概述

本文档描述了 Todo App 为支持 MCP (Model Context Protocol) 集成所进行的改造。这些改造使得 Claude 客户端能够通过 MCP 服务器远程操作部署在云服务器上的 Todo 应用。

## 改造内容

### 1. API 认证机制

#### 新增文件: `middleware/auth.js`

添加了基于 API Key 的认证系统：

- **API Key 验证**: 支持通过 `X-API-Key` 请求头或 `api_key` 查询参数传递
- **多密钥支持**: 支持配置多个 API 密钥
- **可选认证**: 提供 `optionalAuth` 中间件，允许某些端点无需认证访问
- **强制认证**: 提供 `apiKeyAuth` 中间件，要求必须提供有效 API 密钥

**配置方式:**
```bash
export API_KEY="your-secure-api-key-here"
export MCP_API_KEY="your-mcp-api-key-here"
```

### 2. 增强的 CORS 配置

#### 修改文件: `server.js`

升级了 CORS 配置以支持跨域 MCP 调用：

- **动态域名配置**: 通过环境变量 `ALLOWED_ORIGINS` 配置允许的域名
- **凭证支持**: 启用 `credentials: true` 支持认证请求
- **完整的方法支持**: 支持 GET, POST, PUT, DELETE, OPTIONS 方法
- **自定义请求头**: 允许 `X-API-Key`, `Authorization` 等认证相关头部

**配置示例:**
```bash
# 开发环境 - 允许所有域名
export ALLOWED_ORIGINS="*"

# 生产环境 - 指定具体域名
export ALLOWED_ORIGINS="https://your-mcp-server.com,https://your-frontend.com"
```

### 3. 新增 MCP 友好的 API 端点

#### 修改文件: `routes/todos.js`

新增了以下专为 MCP 设计的 API 端点：

**3.1 切换状态端点**
```
PATCH /api/todos/:id/toggle
```
- 快速切换单个待办事项的完成状态
- 无需传递 body，自动反转当前状态

**3.2 批量创建端点**
```
POST /api/todos/batch
```
- 支持一次性创建多个待办事项
- 使用事务确保数据一致性
- 最多支持100个待办事项的批量创建

请求示例:
```json
{
  "todos": [
    {"text": "学习 MCP 协议"},
    {"text": "实现 MCP 服务器"},
    {"text": "测试集成功能"}
  ]
}
```

**3.3 统计信息端点**
```
GET /api/todos/stats
```
- 获取待办事项的统计信息
- 包含总数、已完成数、未完成数和完成率

响应示例:
```json
{
  "success": true,
  "data": {
    "total": 10,
    "completed": 3,
    "pending": 7,
    "completionRate": 30
  }
}
```

**3.4 清理已完成项端点**
```
DELETE /api/todos/completed
```
- 批量删除所有已完成的待办事项
- 返回删除的数量

### 4. 安全防护

#### 新增文件: `middleware/security.js`

实现了多层安全防护：

**4.1 频率限制**
- 每个 IP 每15分钟最多1000个请求
- 内存中维护计数器，定期清理

**4.2 输入清理**
- 自动清理用户输入中的潜在恶意代码
- 移除 HTML 标签和 JavaScript 代码
- 递归处理嵌套对象和数组

**4.3 错误处理**
- 统一的错误处理机制
- 生产环境隐藏敏感错误信息
- 开发环境提供详细堆栈信息

**4.4 安全头部**
- 添加标准安全头部
- 防止 XSS 攻击和内容嗅探
- HTTPS 环境下启用 HSTS

### 5. 配置管理

#### 新增文件: `.env.example`

提供了完整的环境变量配置模板：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=todoapp

# API 配置
API_KEY=your-secure-api-key-here
MCP_API_KEY=your-mcp-api-key-here
PORT=3000

# CORS 配置
ALLOWED_ORIGINS=*

# 环境
NODE_ENV=development
```

## API 端点总结

### 现有端点 (已增强)
- `GET /api/todos` - 获取所有待办事项
- `POST /api/todos` - 创建单个待办事项
- `PUT /api/todos/:id` - 更新待办事项
- `DELETE /api/todos/:id` - 删除待办事项

### 新增端点 (为 MCP 优化)
- `PATCH /api/todos/:id/toggle` - 切换完成状态
- `POST /api/todos/batch` - 批量创建
- `GET /api/todos/stats` - 获取统计信息  
- `DELETE /api/todos/completed` - 清理已完成项

## MCP 集成优势

1. **批量操作**: 支持一次性创建多个待办事项
2. **智能状态管理**: 快速切换完成状态
3. **数据洞察**: 提供统计信息和完成率
4. **安全可靠**: 多层安全防护和错误处理
5. **灵活认证**: 支持可选和强制认证模式
6. **跨域友好**: 完善的 CORS 配置

## 部署建议

### 生产环境配置

1. **设置强密码**:
   ```bash
   export API_KEY=$(openssl rand -hex 32)
   export MCP_API_KEY=$(openssl rand -hex 32)
   ```

2. **限制 CORS 域名**:
   ```bash
   export ALLOWED_ORIGINS="https://your-mcp-server.com"
   ```

3. **启用 HTTPS**:
   ```bash
   export NODE_ENV=production
   ```

4. **数据库安全**:
   - 使用专用数据库用户
   - 启用 SSL 连接
   - 定期备份数据

### 监控和日志

建议添加以下监控：
- API 调用频率和错误率
- 认证失败次数
- 数据库连接状态
- 服务器资源使用情况

## 下一步: MCP 服务器实现

完成 Todo App 改造后，下一步需要：

1. **创建 MCP 服务器**: 实现与 Todo App API 通信的 MCP 服务器
2. **定义工具函数**: 创建 `createTodo`, `listTodos`, `updateTodo` 等 MCP 工具
3. **配置 Claude 客户端**: 连接 MCP 服务器到 Claude 客户端
4. **测试集成**: 验证端到端的 MCP 工作流

## 技术栈

- **后端框架**: Koa.js
- **数据库**: MySQL
- **认证**: API Key 
- **安全**: 自定义中间件
- **协议**: HTTP REST API
- **未来集成**: MCP (Model Context Protocol)

---

*此文档记录了 Todo App 为支持 MCP 集成而进行的全面改造，为后续的 MCP 服务器开发和 Claude 客户端集成奠定了基础。*