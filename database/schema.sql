CREATE DATABASE IF NOT EXISTS startup_validator;
USE startup_validator;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS startup_ideas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    industry VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analysis_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    summary TEXT,
    advantages JSON,
    disadvantages JSON,
    market_potential TEXT,
    improvement_suggestions JSON,
    success_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    startup_idea_id BIGINT UNIQUE,
    FOREIGN KEY (startup_idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE
);

-- Insert a default user for demonstration purposes
INSERT IGNORE INTO users (id, name, email) VALUES (1, 'Demo User', 'demo@startupvalidator.com');
