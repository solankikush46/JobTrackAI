CREATE DATABASE IF NOT EXISTS jobtrack_ai
    CHARACTER SET  utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE jobtrack_ai;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job applications table
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  company VARCHAR(100) NOT NULL,
  job_title VARCHAR(100) NOT NULL,
  job_posting_id VARCHAR(100),
  location VARCHAR(100),
  status ENUM('Applied', 'Online Assessment', 'Interviewing', 'Offer', 'Rejected', 'On hold', 'Accepted')
    DEFAULT 'Applied',
  source VARCHAR(100),
  applied_date DATE,
  job_link VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);