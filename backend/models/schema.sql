-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS simulated_emails CASCADE;
DROP TABLE IF EXISTS score_breakdown CASCADE;
DROP TABLE IF EXISTS investor_details CASCADE;
DROP TABLE IF EXISTS founder_details CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- Drop ENUMs if they exist
DROP TYPE IF EXISTS user_type_enum CASCADE;
DROP TYPE IF EXISTS score_bucket_enum CASCADE;
DROP TYPE IF EXISTS lead_status_enum CASCADE;
DROP TYPE IF EXISTS mvp_status_enum CASCADE;
DROP TYPE IF EXISTS funding_stage_enum CASCADE;
DROP TYPE IF EXISTS round_preference_enum CASCADE;

-- Define Custom Types
CREATE TYPE user_type_enum AS ENUM ('founder', 'investor');
CREATE TYPE score_bucket_enum AS ENUM ('hot', 'good', 'maybe', 'low');
CREATE TYPE lead_status_enum AS ENUM ('new', 'contacted', 'rejected', 'enrolled');
CREATE TYPE mvp_status_enum AS ENUM ('idea', 'prototype', 'beta', 'revenue');
CREATE TYPE funding_stage_enum AS ENUM ('pre-seed', 'seed', 'series-a');
CREATE TYPE round_preference_enum AS ENUM ('lead', 'co-invest', 'both');

-- Create Leads Table (Primary Table)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_type user_type_enum NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    linkedin_url VARCHAR(255),
    qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
    score_bucket score_bucket_enum,
    status lead_status_enum NOT NULL DEFAULT 'new',
    session_answers JSONB DEFAULT '{}'::jsonb,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Founder Details Table
CREATE TABLE founder_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    startup_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    problem_statement TEXT NOT NULL,
    solution TEXT NOT NULL,
    mvp_status mvp_status_enum NOT NULL,
    has_paying_customers BOOLEAN NOT NULL,
    customer_count INTEGER,
    mrr DECIMAL,
    traction_metric TEXT NOT NULL,
    co_founder_count INTEGER NOT NULL,
    team_background TEXT NOT NULL,
    funding_ask DECIMAL NOT NULL,
    funding_stage funding_stage_enum NOT NULL,
    previous_funding BOOLEAN NOT NULL,
    previous_funding_details TEXT,
    validation_types VARCHAR(100)[] DEFAULT '{}'::VARCHAR(100)[],
    pitch_statement TEXT NOT NULL
);

-- Create Investor Details Table
CREATE TABLE investor_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    fund_name VARCHAR(255) NOT NULL,
    sectors VARCHAR(100)[] DEFAULT '{}'::VARCHAR(100)[],
    stage_focus VARCHAR(100) NOT NULL,
    investment_thesis TEXT NOT NULL,
    cheque_size DECIMAL NOT NULL,
    deals_last_2_years INTEGER NOT NULL,
    portfolio_companies TEXT,
    round_preference round_preference_enum NOT NULL,
    support_types VARCHAR(100)[] DEFAULT '{}'::VARCHAR(100)[],
    involvement_level VARCHAR(100) NOT NULL,
    active_deployment VARCHAR(100) NOT NULL,
    target_deals_6_months INTEGER NOT NULL,
    venturizer_interest TEXT NOT NULL
);

-- Create Score Breakdown Table
CREATE TABLE score_breakdown (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    score_components JSONB NOT NULL,
    total_score INTEGER NOT NULL,
    calculated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Simulated Emails Table
CREATE TABLE simulated_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    to_address VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT NOW()
);
