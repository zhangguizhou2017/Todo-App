import { spawn } from 'child_process';

console.log('🧪 测试 MCP 服务器...');

const mcp = spawn('node', ['src/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

mcp.stderr.on('data', (data) => {
  console.log('MCP Server:', data.toString());
});

const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

setTimeout(() => {
  console.log('📤 发送 tools/list 请求...');
  mcp.stdin.write(JSON.stringify(testRequest) + '\n');
}, 1000);

mcp.stdout.on('data', (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log('📥 收到响应:', JSON.stringify(response, null, 2));
    
    if (response.result && response.result.tools) {
      console.log(`✅ 成功！找到 ${response.result.tools.length} 个工具:`);
      response.result.tools.forEach(tool => {
        console.log(`  - ${tool.name}: ${tool.description}`);
      });
    }
  } catch (error) {
    console.log('📄 输出:', data.toString());
  }
  
  setTimeout(() => {
    mcp.kill();
    process.exit(0);
  }, 1000);
});

mcp.on('error', (error) => {
  console.error('❌ MCP 服务器错误:', error);
  process.exit(1);
});

setTimeout(() => {
  console.log('⏰ 测试超时');
  mcp.kill();
  process.exit(1);
}, 10000);