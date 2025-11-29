const pool = require("../db");

// Create a new application for a user
async function createApplication(userId, { company, jobTitle, jobPostingId, location, status, companyDescription, responsibilities, requiredQualifications, preferredQualifications, logoUrl, resumeMatchScore }) {
  const [result] = await pool.execute(
    `
    INSERT INTO applications (user_id, company, job_title, job_posting_id, location, status, company_description, responsibilities, required_qualifications, preferred_qualifications, logo_url, resume_match_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      company,
      jobTitle,
      jobPostingId || null,
      location || null,
      status || 'Applied',
      companyDescription || null,
      responsibilities || null,
      requiredQualifications || null,
      preferredQualifications || null,
      logoUrl || null,
      resumeMatchScore || null
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

async function updateApplication(id, userId, { company, jobTitle, jobPostingId, location, status, companyDescription, responsibilities, requiredQualifications, preferredQualifications, logoUrl, resumeMatchScore }) {
  const [result] = await pool.execute(
    `
    UPDATE applications
    SET company = ?, job_title = ?, job_posting_id = ?, location = ?, status = ?, company_description = ?, responsibilities = ?, required_qualifications = ?, preferred_qualifications = ?, logo_url = ?, resume_match_score = ?
    WHERE id = ? AND user_id = ?
    `,
    [
      company,
      jobTitle,
      jobPostingId || null,
      location || null,
      status,
      companyDescription || null,
      responsibilities || null,
      requiredQualifications || null,
      preferredQualifications || null,
      logoUrl || null,
      resumeMatchScore || null,
      id,
      userId
    ]
  );

  return getApplicationById(userId, id);
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
