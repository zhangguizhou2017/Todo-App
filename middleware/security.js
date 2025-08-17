const rateLimit = new Map();

async function rateLimiter(ctx, next) {
    const ip = ctx.ip || ctx.request.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15分钟
    const maxRequests = 1000; // 每15分钟最多1000个请求
    
    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
        const data = rateLimit.get(ip);
        
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + windowMs;
        } else {
            data.count++;
            
            if (data.count > maxRequests) {
                ctx.status = 429;
                ctx.body = {
                    success: false,
                    message: '请求过于频繁，请稍后再试',
                    retryAfter: Math.ceil((data.resetTime - now) / 1000)
                };
                return;
            }
        }
    }
    
    setInterval(() => {
        const now = Date.now();
        for (const [ip, data] of rateLimit.entries()) {
            if (now > data.resetTime) {
                rateLimit.delete(ip);
            }
        }
    }, windowMs);
    
    await next();
}

function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }
    
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
}

async function inputSanitizer(ctx, next) {
    if (ctx.request.body) {
        const sanitizeObject = (obj) => {
            if (typeof obj === 'string') {
                return sanitizeInput(obj);
            }
            
            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            }
            
            if (obj && typeof obj === 'object') {
                const sanitized = {};
                for (const [key, value] of Object.entries(obj)) {
                    sanitized[sanitizeInput(key)] = sanitizeObject(value);
                }
                return sanitized;
            }
            
            return obj;
        };
        
        ctx.request.body = sanitizeObject(ctx.request.body);
    }
    
    await next();
}

async function errorHandler(ctx, next) {
    try {
        await next();
    } catch (error) {
        console.error('API Error:', error);
        
        ctx.status = error.status || 500;
        ctx.body = {
            success: false,
            message: process.env.NODE_ENV === 'production' 
                ? '服务器内部错误' 
                : error.message,
            ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
        };
        
        ctx.app.emit('error', error, ctx);
    }
}

async function securityHeaders(ctx, next) {
    ctx.set('X-Content-Type-Options', 'nosniff');
    ctx.set('X-Frame-Options', 'DENY');
    ctx.set('X-XSS-Protection', '1; mode=block');
    ctx.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (ctx.secure) {
        ctx.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    await next();
}

module.exports = {
    rateLimiter,
    inputSanitizer,
    errorHandler,
    securityHeaders,
    sanitizeInput
};