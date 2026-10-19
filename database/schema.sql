-- AI Startup Idea Validator Schema
CREATE DATABASE IF NOT EXISTS startup_validator;
USE startup_validator;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
);

-- 2. Startup Ideas Table
CREATE TABLE IF NOT EXISTS startup_ideas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    industry VARCHAR(255) NOT NULL,
    target_audience TEXT,
    problem_statement TEXT,
    proposed_solution TEXT,
    business_model VARCHAR(255),
    target_geography VARCHAR(255),
    estimated_budget DOUBLE,
    expected_monthly_expenses DOUBLE,
    expected_monthly_revenue DOUBLE,
    current_stage VARCHAR(100),
    known_competitors TEXT,
    additional_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ideas_user_id (user_id)
);

-- 3. Analysis Reports Table
CREATE TABLE IF NOT EXISTS analysis_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    startup_idea_id BIGINT UNIQUE,
    summary TEXT,
    executive_summary TEXT,
    readiness_score INT,
    success_score INT,
    score_explanation TEXT,
    evaluation_dimensions JSON,
    strengths JSON,
    weaknesses JSON,
    opportunities JSON,
    threats JSON,
    risks JSON,
    recommendations_list JSON,
    market_potential TEXT,
    market_assessment TEXT,
    advantages JSON,
    disadvantages JSON,
    improvement_suggestions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE,
    INDEX idx_reports_idea_id (startup_idea_id)
);

-- 4. Competitors Table
CREATE TABLE IF NOT EXISTS competitors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    summary TEXT,
    target_segment VARCHAR(255),
    strengths TEXT,
    weaknesses TEXT,
    differentiation TEXT,
    source_url VARCHAR(255),
    retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES analysis_reports(id) ON DELETE CASCADE,
    INDEX idx_competitors_analysis_id (analysis_id)
);

-- 5. Financial Projections Table
CREATE TABLE IF NOT EXISTS financial_projections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    startup_idea_id BIGINT,
    initial_investment DOUBLE,
    monthly_fixed_costs DOUBLE,
    variable_cost_per_unit DOUBLE,
    selling_price_per_unit DOUBLE,
    expected_units INT,
    estimated_revenue DOUBLE,
    estimated_variable_costs DOUBLE,
    estimated_total_costs DOUBLE,
    estimated_operating_profit DOUBLE,
    operating_margin_percent DOUBLE,
    break_even_units INT,
    break_even_revenue DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE,
    INDEX idx_fin_idea_id (startup_idea_id)
);

-- 6. Roadmap Tasks Table
CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    startup_idea_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'PENDING',
    phase VARCHAR(100),
    estimated_timeframe VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_idea_id) REFERENCES startup_ideas(id) ON DELETE CASCADE,
    INDEX idx_tasks_idea_id (startup_idea_id)
);

-- Demo user seed
INSERT IGNORE INTO users (id, name, email, password_hash)
VALUES (1, 'Demo User', 'demo@startupvalidator.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/f/fN7BqX2V7J7rC.P3kI.Q2sQf6W');
