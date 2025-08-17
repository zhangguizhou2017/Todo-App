const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const serve = require('koa-static');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const todoRoutes = require('./routes/todos');
const { optionalAuth } = require('./middleware/auth');
const { rateLimiter, inputSanitizer, errorHandler, securityHeaders } = require('./middleware/security');

const app = new Koa();
const router = new Router();

app.use(errorHandler);
app.use(securityHeaders);
app.use(rateLimiter);
app.use(inputSanitizer);

app.use(cors({
    origin: function(ctx) {
        const origin = ctx.get('Origin');
        
        if (!origin) {
            return '*';
        }
        
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://127.0.0.1:3000'];
            
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return origin;
        }
        
        return false;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
    exposeHeaders: ['X-Total-Count', 'X-Page-Count']
}));

app.use(bodyParser({
    jsonLimit: '10mb',
    formLimit: '10mb',
    textLimit: '10mb'
}));

router.use('/api/todos', todoRoutes.routes());

app.use(router.routes());
app.use(router.allowedMethods());

app.use(serve(path.join(__dirname)));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📝 前端页面: http://localhost:${PORT}/index.html`);
});