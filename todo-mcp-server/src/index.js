#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TODO_API_BASE = process.env.TODO_API_URL || 'http://your-domain.com';
const API_KEY = process.env.TODO_API_KEY || '';

class TodoMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'todo-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  async makeApiRequest(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${TODO_API_BASE}/api/todos${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'X-API-Key': API_KEY }),
        },
      };

      if (data) {
        config.data = data;
      }

      console.error(`[DEBUG] Making ${method} request to: ${config.url}`);
      console.error(`[DEBUG] Request data:`, JSON.stringify(data));
      
      const response = await axios(config);
      console.error(`[DEBUG] Response status: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error(`[ERROR] API request failed:`);
      console.error(`[ERROR] URL: ${TODO_API_BASE}/api/todos${endpoint}`);
      console.error(`[ERROR] Method: ${method}`);
      console.error(`[ERROR] Data:`, JSON.stringify(data));
      console.error(`[ERROR] Status: ${error.response?.status}`);
      console.error(`[ERROR] Response:`, error.response?.data);
      console.error(`[ERROR] Message: ${error.message}`);
      throw new Error(`API 请求失败: ${error.response?.data?.message || error.message}`);
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_todos',
            description: '获取所有待办事项列表',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_todo',
            description: '创建新的待办事项',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: '待办事项的内容',
                },
              },
              required: ['text'],
            },
          },
          {
            name: 'update_todo',
            description: '更新现有的待办事项',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: '待办事项的ID',
                },
                text: {
                  type: 'string',
                  description: '新的待办事项内容',
                },
                completed: {
                  type: 'boolean',
                  description: '是否已完成',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'delete_todo',
            description: '删除待办事项',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: '要删除的待办事项ID',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'toggle_todo',
            description: '切换待办事项的完成状态',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: '要切换状态的待办事项ID',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'create_todos_batch',
            description: '批量创建多个待办事项',
            inputSchema: {
              type: 'object',
              properties: {
                todos: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: {
                        type: 'string',
                        description: '待办事项内容',
                      },
                    },
                    required: ['text'],
                  },
                  description: '待办事项列表',
                },
              },
              required: ['todos'],
            },
          },
          {
            name: 'get_todos_stats',
            description: '获取待办事项统计信息',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'clear_completed_todos',
            description: '清除所有已完成的待办事项',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_todos': {
            const result = await this.makeApiRequest('GET', '');
            return {
              content: [
                {
                  type: 'text',
                  text: `找到 ${result.data.length} 个待办事项:\\n\\n${result.data
                    .map(
                      (todo) =>
                        `${todo.completed ? '✅' : '❌'} [ID: ${todo.id}] ${todo.text}`
                    )
                    .join('\\n')}`,
                },
              ],
            };
          }

          case 'create_todo': {
            const result = await this.makeApiRequest('POST', '', {
              text: args.text,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ 成功创建待办事项: "${result.data.text}" (ID: ${result.data.id})`,
                },
              ],
            };
          }

          case 'update_todo': {
            const updateData = {};
            if (args.text !== undefined) updateData.text = args.text;
            if (args.completed !== undefined) updateData.completed = args.completed;

            const result = await this.makeApiRequest('PUT', `/${args.id}`, updateData);
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ 成功更新待办事项: "${result.data.text}" (${
                    result.data.completed ? '已完成' : '未完成'
                  })`,
                },
              ],
            };
          }

          case 'delete_todo': {
            await this.makeApiRequest('DELETE', `/${args.id}`);
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ 成功删除待办事项 (ID: ${args.id})`,
                },
              ],
            };
          }

          case 'toggle_todo': {
            const result = await this.makeApiRequest('PATCH', `/${args.id}/toggle`);
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ 成功切换状态: "${result.data.text}" 现在${
                    result.data.completed ? '已完成' : '未完成'
                  }`,
                },
              ],
            };
          }

          case 'create_todos_batch': {
            const result = await this.makeApiRequest('POST', '/batch', {
              todos: args.todos,
            });
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ 成功批量创建 ${result.data.length} 个待办事项:\\n${result.data
                    .map((todo) => `- ${todo.text} (ID: ${todo.id})`)
                    .join('\\n')}`,
                },
              ],
            };
          }

          case 'get_todos_stats': {
            const result = await this.makeApiRequest('GET', '/stats');
            const { total, completed, pending, completionRate } = result.data;
            return {
              content: [
                {
                  type: 'text',
                  text: `📊 待办事项统计:\\n- 总计: ${total} 个\\n- 已完成: ${completed} 个\\n- 待完成: ${pending} 个\\n- 完成率: ${completionRate}%`,
                },
              ],
            };
          }

          case 'clear_completed_todos': {
            const result = await this.makeApiRequest('DELETE', '/completed');
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ 成功清除 ${result.data.deletedCount} 个已完成的待办事项`,
                },
              ],
            };
          }

          default:
            throw new Error(`未知的工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ 执行失败: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Todo MCP Server 已启动');
  }
}

const server = new TodoMCPServer();
server.run().catch(console.error);