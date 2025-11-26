const pool = require("../db");

// Create a new user
async function createUser({ username, email, passwordHash, verificationToken }) {
    const [result] = await pool.execute(
        `
        INSERT INTO users (username, email, password_hash, verification_token, is_verified)
        VALUES (?, ?, ?, ?, FALSE)
        `,
        [username, email, passwordHash, verificationToken]
    );

    return {
        id: result.insertId,
        username,
        email
    };
}

async function findUserByUsername(username) {
    const [rows] = await pool.execute(
        `
        SELECT id, username, email, password_hash, is_verified, created_at
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [username]
    );
    return rows[0] || null;
}

// Find user by email
async function findUserByEmail(email) {
    const [rows] = await pool.execute(
        `
        SELECT id, username, email, password_hash, is_verified, created_at
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );
    return rows[0] || null;
}

// Find user by user_id
async function findUserById(id) {
    const [rows] = await pool.execute(
        `
        SELECT id, username, email, password_hash, is_verified, created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );
    return rows[0] || null;
}

// Verify user
async function verifyUser(token) {
    const [result] = await pool.execute(
        `
        UPDATE users
        SET is_verified = TRUE, verification_token = NULL
        WHERE verification_token = ?
        `,
        [token]
    );
    return result.affectedRows > 0;
}

// Delete user
async function deleteUser(id) {
    const [result] = await pool.execute(
        `
        DELETE FROM users
        WHERE id = ?
        `,
        [id]
    );
    return result.affectedRows > 0;
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserByUsername,
    findUserById,
    verifyUser,
    deleteUser,
};