const pool = require('../db');

async function createResume(userId, fileName, originalName) {
    const [result] = await pool.execute(
        'INSERT INTO resumes (user_id, file_name, original_name) VALUES (?, ?, ?)',
        [userId, fileName, originalName]
    );
    return { id: result.insertId, userId, fileName, originalName, isPrimary: false };
}

async function getResumesByUserId(userId) {
    const [rows] = await pool.execute(
        'SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
    );
    return rows;
}

async function setPrimaryResume(userId, resumeId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Set all user's resumes to not primary
        await connection.execute(
            'UPDATE resumes SET is_primary = FALSE WHERE user_id = ?',
            [userId]
        );

        // Set the selected resume to primary
        await connection.execute(
            'UPDATE resumes SET is_primary = TRUE WHERE id = ? AND user_id = ?',
            [resumeId, userId]
        );

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteResume(userId, resumeId) {
    const [result] = await pool.execute(
        'DELETE FROM resumes WHERE id = ? AND user_id = ?',
        [resumeId, userId]
    );
    return result.affectedRows > 0;
}

async function getResumeById(userId, resumeId) {
    const [rows] = await pool.execute(
        'SELECT * FROM resumes WHERE id = ? AND user_id = ?',
        [resumeId, userId]
    );
    return rows[0];
}

module.exports = {
    createResume,
    getResumesByUserId,
    setPrimaryResume,
    deleteResume,
    getResumeById
};
