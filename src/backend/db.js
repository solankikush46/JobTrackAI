const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Load env variables (DB_HOST, DB_USER, etc.)
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "jobtrack_ai",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Simple connection test when server starts
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    console.log("MySQL connection successful");
    connection.release();
  } catch (err) {
    console.error("MySQL connection failed:", err.message);
  }
}

testConnection();

module.exports = pool;

