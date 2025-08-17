class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.apiUrl = '/api/todos';
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadTodos();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        const todoInput = document.getElementById('todoInput');
        const addBtn = document.getElementById('addBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    async addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (!text) {
            this.showNotification('请输入待办事项内容', 'error');
            return;
        }

        if (text.length > 255) {
            this.showNotification('待办事项内容不能超过255个字符', 'error');
            return;
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            const result = await response.json();

            if (result.success) {
                input.value = '';
                await this.loadTodos();
                this.render();
                this.updateStats();
                this.showNotification(result.message, 'success');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('添加待办事项失败:', error);
            this.showNotification('添加失败，请检查网络连接', 'error');
        }
    }

    async toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !todo.completed })
            });

            const result = await response.json();

            if (result.success) {
                await this.loadTodos();
                this.render();
                this.updateStats();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('更新待办事项失败:', error);
            this.showNotification('更新失败，请检查网络连接', 'error');
        }
    }

    async deleteTodo(id) {
        if (!confirm('确定要删除这个待办事项吗？')) return;

        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                await this.loadTodos();
                this.render();
                this.updateStats();
                this.showNotification(result.message, 'info');
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('删除待办事项失败:', error);
            this.showNotification('删除失败，请检查网络连接', 'error');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<li class="empty-state">📋 暂无待办事项</li>';
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" 
                       class="todo-checkbox" 
                       ${todo.completed ? 'checked' : ''}
                       onchange="todoApp.toggleTodo(${todo.id})">
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
                    删除
                </button>
            </li>
        `).join('');
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalCount').textContent = `总计: ${total}`;
        document.getElementById('completedCount').textContent = `已完成: ${completed}`;
        document.getElementById('pendingCount').textContent = `待完成: ${pending}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-size: 14px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            case 'info':
                notification.style.background = '#17a2b8';
                break;
        }
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadTodos() {
        try {
            const response = await fetch(this.apiUrl);
            const result = await response.json();

            if (result.success) {
                this.todos = result.data;
            } else {
                this.showNotification('加载待办事项失败', 'error');
                this.todos = [];
            }
        } catch (error) {
            console.error('加载待办事项失败:', error);
            this.showNotification('加载失败，请检查网络连接', 'error');
            this.todos = [];
        }
    }
}

const todoApp = new TodoApp();