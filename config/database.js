const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todoapp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};


const pool = mysql.createPool(config);

async function initDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });
        
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
        console.log('✅ 数据库创建成功');
        
        await connection.end();
        
        const dbConnection = await pool.getConnection();
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS todos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                text VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        await dbConnection.execute(createTableQuery);
        console.log('✅ 数据表创建成功');
        
        dbConnection.release();
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        throw error;
    }
}

initDatabase();

module.exports = pool;