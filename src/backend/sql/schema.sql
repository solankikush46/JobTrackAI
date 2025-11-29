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
  location VARCHAR(255),
  status ENUM('Applied', 'Online Assessment', 'Interviewing', 'Offer', 'Rejected', 'On hold', 'Accepted')
    DEFAULT 'Applied',
  source VARCHAR(100),
  applied_date DATE,
  job_link VARCHAR(255),
  notes TEXT,
  company_description TEXT,
  responsibilities TEXT,
  required_qualifications TEXT,
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
  location VARCHAR(255),
  status ENUM('Applied', 'Online Assessment', 'Interviewing', 'Offer', 'Rejected', 'On hold', 'Accepted')
    DEFAULT 'Applied',
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);