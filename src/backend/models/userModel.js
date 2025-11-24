const pool = require("../db");

// Create a new user
async function createUser({ username, email, passwordHash }){
    const [result] = await pool.execute(
        `
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
        `,
        [username, email, passwordHash]
    );

    return{
        id: result.insertId,
        username,
        email
    };
}

async function findUserByUsername(username){
    const[rows] = await pool.execute(
        `
        SELECT id, username, email, password_hash, created_at
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [username]
    );
    return rows[0] || null;
}

// Find user ny username
async function findUserByUsername(username){
    const[rows] = await pool.execute(
        `
        SELECT id, username, email, password_hash, created_at
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [username]
    );
    return rows[0] || null;
}

// Find user by email
async function findUserByEmail(email){
    const[rows] = await pool.execute(
        `
        SELECT id, username, email, password_hash, created_at
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );
    return rows[0] || null;
}

// Find user by user_id
async function findUserById(id){
    const[rows] = await pool.execute(
        `
        SELECT id, username, email, password_hash, created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );
    return rows[0] || null;
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserByUsername,
    findUserById,
};