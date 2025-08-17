const crypto = require('crypto');

const API_KEYS = new Set([
    process.env.API_KEY || 'default-api-key-change-me',
    process.env.MCP_API_KEY || 'mcp-api-key-change-me'
]);

function generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
}

async function apiKeyAuth(ctx, next) {
    const apiKey = ctx.headers['x-api-key'] || ctx.query.api_key;
    
    if (!apiKey) {
        ctx.status = 401;
        ctx.body = {
            success: false,
            message: 'API密钥缺失，请在请求头中提供 X-API-Key 或查询参数 api_key'
        };
        return;
    }
    
    if (!API_KEYS.has(apiKey)) {
        ctx.status = 401;
        ctx.body = {
            success: false,
            message: 'API密钥无效'
        };
        return;
    }
    
    await next();
}

async function optionalAuth(ctx, next) {
    const apiKey = ctx.headers['x-api-key'] || ctx.query.api_key;
    
    if (apiKey && !API_KEYS.has(apiKey)) {
        ctx.status = 401;
        ctx.body = {
            success: false,
            message: 'API密钥无效'
        };
        return;
    }
    
    ctx.state.authenticated = !!apiKey;
    await next();
}

module.exports = {
    apiKeyAuth,
    optionalAuth,
    generateApiKey,
    API_KEYS
};