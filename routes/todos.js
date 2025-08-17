const Router = require('koa-router');
const db = require('../config/database');
const { optionalAuth, apiKeyAuth } = require('../middleware/auth');

const router = new Router();

router.get('/', async (ctx) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM todos ORDER BY created_at DESC'
        );
        
        const todos = rows.map(row => ({
            id: row.id,
            text: row.text,
            completed: Boolean(row.completed),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
        
        ctx.body = {
            success: true,
            data: todos
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: '获取待办事项失败',
            error: error.message
        };
    }
});

router.post('/', async (ctx) => {
    try {
        const { text } = ctx.request.body;
        
        if (!text || text.trim().length === 0) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: '待办事项内容不能为空'
            };
            return;
        }
        
        if (text.length > 255) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: '待办事项内容不能超过255个字符'
            };
            return;
        }
        
        const [result] = await db.execute(
            'INSERT INTO todos (text) VALUES (?)',
            [text.trim()]
        );
        
        const [newTodo] = await db.execute(
            'SELECT * FROM todos WHERE id = ?',
            [result.insertId]
        );
        
        ctx.body = {
            success: true,
            data: {
                id: newTodo[0].id,
                text: newTodo[0].text,
                completed: Boolean(newTodo[0].completed),
                createdAt: newTodo[0].created_at,
                updatedAt: newTodo[0].updated_at
            },
            message: '待办事项添加成功'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: '添加待办事项失败',
            error: error.message
        };
    }
});

router.put('/:id', async (ctx) => {
    try {
        const { id } = ctx.params;
        const { text, completed } = ctx.request.body;
        
        const [existingTodo] = await db.execute(
            'SELECT * FROM todos WHERE id = ?',
            [id]
        );
        
        if (existingTodo.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: '待办事项不存在'
            };
            return;
        }
        
        let updateQuery = 'UPDATE todos SET ';
        let updateParams = [];
        let updateFields = [];
        
        if (text !== undefined) {
            if (text.trim().length === 0) {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: '待办事项内容不能为空'
                };
                return;
            }
            
            if (text.length > 255) {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: '待办事项内容不能超过255个字符'
                };
                return;
            }
            
            updateFields.push('text = ?');
            updateParams.push(text.trim());
        }
        
        if (completed !== undefined) {
            updateFields.push('completed = ?');
            updateParams.push(completed);
        }
        
        if (updateFields.length === 0) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: '没有要更新的内容'
            };
            return;
        }
        
        updateQuery += updateFields.join(', ') + ' WHERE id = ?';
        updateParams.push(id);
        
        await db.execute(updateQuery, updateParams);
        
        const [updatedTodo] = await db.execute(
            'SELECT * FROM todos WHERE id = ?',
            [id]
        );
        
        ctx.body = {
            success: true,
            data: {
                id: updatedTodo[0].id,
                text: updatedTodo[0].text,
                completed: Boolean(updatedTodo[0].completed),
                createdAt: updatedTodo[0].created_at,
                updatedAt: updatedTodo[0].updated_at
            },
            message: '待办事项更新成功'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: '更新待办事项失败',
            error: error.message
        };
    }
});

router.delete('/:id', async (ctx) => {
    try {
        const { id } = ctx.params;
        
        const [existingTodo] = await db.execute(
            'SELECT * FROM todos WHERE id = ?',
            [id]
        );
        
        if (existingTodo.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: '待办事项不存在'
            };
            return;
        }
        
        await db.execute('DELETE FROM todos WHERE id = ?', [id]);
        
        ctx.body = {
            success: true,
            message: '待办事项删除成功'
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: '删除待办事项失败',
            error: error.message
        };
    }
});

router.patch('/:id/toggle', optionalAuth, async (ctx) => {
    try {
        const { id } = ctx.params;
        
        const [existingTodo] = await db.execute(
            'SELECT * FROM todos WHERE id = ?',
            [id]
        );
        
        if (existingTodo.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: '待办事项不存在'
            };
            return;
        }
        
        const currentCompleted = Boolean(existingTodo[0].completed);
        const newCompleted = !currentCompleted;
        
        await db.execute(
            'UPDATE todos SET completed = ? WHERE id = ?',
            [newCompleted, id]
        );
        
        const [updatedTodo] = await db.execute(
            'SELECT * FROM todos WHERE id = ?',
            [id]
        );
        
        ctx.body = {
            success: true,
            data: {
                id: updatedTodo[0].id,
                text: updatedTodo[0].text,
                completed: Boolean(updatedTodo[0].completed),
                createdAt: updatedTodo[0].created_at,
                updatedAt: updatedTodo[0].updated_at
            },
            message: `待办事项已${newCompleted ? '完成' : '取消完成'}`
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: '切换待办事项状态失败',
            error: error.message
        };
    }
});

router.post('/batch', optionalAuth, async (ctx) => {
    try {
        const { todos } = ctx.request.body;
        
        if (!Array.isArray(todos) || todos.length === 0) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: '请提供有效的待办事项数组'
            };
            return;
        }
        
        if (todos.length > 100) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                message: '批量创建数量不能超过100个'
            };
            return;
        }
        
        const results = [];
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            for (const todoItem of todos) {
                const { text } = todoItem;
                
                if (!text || text.trim().length === 0) {
                    throw new Error('待办事项内容不能为空');
                }
                
                if (text.length > 255) {
                    throw new Error('待办事项内容不能超过255个字符');
                }
                
                const [result] = await connection.execute(
                    'INSERT INTO todos (text) VALUES (?)',
                    [text.trim()]
                );
                
                const [newTodo] = await connection.execute(
                    'SELECT * FROM todos WHERE id = ?',
                    [result.insertId]
                );
                
                results.push({
                    id: newTodo[0].id,
                    text: newTodo[0].text,
                    completed: Boolean(newTodo[0].completed),
                    createdAt: newTodo[0].created_at,
                    updatedAt: newTodo[0].updated_at
                });
            }
            
            await connection.commit();
            
            ctx.body = {
                success: true,
                data: results,
                message: `成功创建${results.length}个待办事项`
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: '批量创建待办事项失败',
            error: error.message
        };
    }
});

router.get('/stats', optionalAuth, async (ctx) => {
    try {
        const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM todos');
        const [completedResult] = await db.execute('SELECT COUNT(*) as completed FROM todos WHERE completed = true');
        const [pendingResult] = await db.execute('SELECT COUNT(*) as pending FROM todos WHERE completed = false');
        
        ctx.body = {
            success: true,
            data: {
                total: totalResult[0].total,
                completed: completedResult[0].completed,
                pending: pendingResult[0].pending,
                completionRate: totalResult[0].total > 0 
                    ? Math.round((completedResult[0].completed / totalResult[0].total) * 100) 
                    : 0
            }
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: '获取统计信息失败',
            error: error.message
        };
    }
});

router.delete('/completed', optionalAuth, async (ctx) => {
    try {
        const [result] = await db.execute('DELETE FROM todos WHERE completed = true');
        
        ctx.body = {
            success: true,
            data: {
                deletedCount: result.affectedRows
            },
            message: `成功删除${result.affectedRows}个已完成的待办事项`
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: '删除已完成待办事项失败',
            error: error.message
        };
    }
});

module.exports = router;