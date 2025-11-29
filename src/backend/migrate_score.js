const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'jobtrack_ai',
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Check if column exists
        const [columns] = await connection.execute(`
            SHOW COLUMNS FROM applications LIKE 'resume_match_score'
        `);

        if (columns.length === 0) {
            console.log('Adding resume_match_score column...');
            await connection.execute(`
                ALTER TABLE applications
                ADD COLUMN resume_match_score INT DEFAULT NULL
            `);
            console.log('Column added successfully.');
        } else {
            console.log('Column resume_match_score already exists.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
