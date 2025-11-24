const pool = require("../db");

// Create a new application for a user
async function createApplication(userId, data) {
  const {
    company,
    jobTitle,
    location,
    status = "Applied",
    source,
    appliedDate,
    jobLink,
    notes,
  } = data;

  const [result] = await pool.execute(
    `i
    INSERT INTO applications
    (user_id, company, job_title, location, status, source, applied_date, job_link, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
        user_id,
        company,
        job_title,
        location || null,
        status || "Applied",
        source || null,
        applied_date || null, 
        job_link || null, 
        notes|| null,
    ]
  );

  const [rows] = await pool.execute(
    `
    SELECT *
    FROM applications
    WHERE id = ?
    `,
    [result.insertId]
  );

  return rows[0];
}

async function getApplicationsForUser(userId) {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM applications
    WHERE user_id = ?
    ORDER BY applied_date DESC, created_at DESC
    `,
    [userId]
  );
  return rows;
}

async function getApplicationById(userId, appId) {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM applications
    WHERE id = ? AND user_id = ?
    LIMIT 1
    `,
    [appId, userId]
  );
  return rows[0] || null;
}

async function updateApplication(userId, appId, data) {
  const {
    company,
    jobTitle,
    location,
    status,
    source,
    appliedDate,
    jobLink,
    notes,
  } = data;

  await pool.execute(
    `
    UPDATE applications
    SET
      company = ?,
      job_title = ?,
      location = ?,
      status = ?,
      source = ?,
      applied_date = ?,
      job_link = ?,
      notes = ?
    WHERE id = ? AND user_id = ?
    `,
    [
      company,
      jobTitle,
      location || null,
      status || "Applied",
      source || null,
      appliedDate || null,
      jobLink || null,
      notes || null,
      appId,
      userId,
    ]
  );

  return getApplicationById(userId, appId);
}

async function deleteApplication(userId, appId) {
  const [result] = await pool.execute(
    `
    DELETE FROM applications
    WHERE id = ? AND user_id = ?
    `,
    [appId, userId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createApplication,
  getApplicationsForUser,
  getApplicationById,
  updateApplication,
  deleteApplication,
};