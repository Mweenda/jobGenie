-- JobGenie Database Schema
-- This file contains the complete database schema for the JobGenie application
-- Run this in your Supabase SQL editor or PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    job_title VARCHAR,
    experience_level VARCHAR CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
    profile_image_url TEXT,
    resume_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    logo_url TEXT,
    website VARCHAR,
    industry VARCHAR,
    size VARCHAR CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT,
    requirements TEXT[],
    location VARCHAR,
    job_type VARCHAR CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
    salary_min INTEGER,
    salary_max INTEGER,
    is_remote BOOLEAN DEFAULT false,
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    cover_letter TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Saved jobs table
CREATE TABLE public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- User skills table
CREATE TABLE public.user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table (for AI chatbot history)
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent_type VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job views table (for analytics)
CREATE TABLE public.job_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_is_remote ON jobs(is_remote);
CREATE INDEX idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_job_views_user_id ON job_views(user_id);
CREATE INDEX idx_job_views_job_id ON job_views(job_id);

-- Full-text search indexes
CREATE INDEX idx_jobs_title_search ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX idx_jobs_description_search ON jobs USING gin(to_tsvector('english', description));
CREATE INDEX idx_companies_name_search ON companies USING gin(to_tsvector('english', name));

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Applications policies
CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON applications FOR UPDATE USING (auth.uid() = user_id);

-- Saved jobs policies
CREATE POLICY "Users can view own saved jobs" ON saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own saved jobs" ON saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved jobs" ON saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- User skills policies
CREATE POLICY "Users can view own skills" ON user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own skills" ON user_skills FOR ALL USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Job views policies
CREATE POLICY "Users can view own job views" ON job_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own job views" ON job_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for jobs and companies
CREATE POLICY "Anyone can view active jobs" ON jobs FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for development
INSERT INTO companies (name, description, logo_url, industry, size) VALUES
('TechCorp Inc.', 'Leading technology company specializing in cloud solutions', 'https://via.placeholder.com/100x100?text=TC', 'Technology', 'large'),
('StartupXYZ', 'Innovative startup disrupting the fintech space', 'https://via.placeholder.com/100x100?text=SX', 'Financial Services', 'startup'),
('Design Studio', 'Creative agency focused on digital experiences', 'https://via.placeholder.com/100x100?text=DS', 'Design', 'small'),
('Global Corp', 'Multinational corporation with diverse business interests', 'https://via.placeholder.com/100x100?text=GC', 'Consulting', 'enterprise'),
('AI Innovations', 'Cutting-edge artificial intelligence research company', 'https://via.placeholder.com/100x100?text=AI', 'Technology', 'medium');

INSERT INTO jobs (company_id, title, description, requirements, location, job_type, salary_min, salary_max, is_remote) VALUES
((SELECT id FROM companies WHERE name = 'TechCorp Inc.'), 'Senior Frontend Developer', 'We are looking for a senior frontend developer to join our team and help build the next generation of web applications.', ARRAY['React', 'TypeScript', 'CSS', 'JavaScript', '5+ years experience'], 'San Francisco, CA', 'full-time', 120000, 160000, false),
((SELECT id FROM companies WHERE name = 'StartupXYZ'), 'Product Manager', 'Join our product team to drive innovation and growth in the fintech space.', ARRAY['Product Management', 'Agile', 'Analytics', '3+ years experience'], 'Remote', 'full-time', 100000, 140000, true),
((SELECT id FROM companies WHERE name = 'Design Studio'), 'UX Designer', 'Create beautiful and intuitive user experiences for our clients.', ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems'], 'New York, NY', 'full-time', 80000, 110000, false),
((SELECT id FROM companies WHERE name = 'Global Corp'), 'Data Scientist', 'Analyze complex datasets to drive business insights and decision making.', ARRAY['Python', 'Machine Learning', 'SQL', 'Statistics'], 'Chicago, IL', 'full-time', 110000, 150000, true),
((SELECT id FROM companies WHERE name = 'AI Innovations'), 'Machine Learning Engineer', 'Build and deploy ML models at scale for our AI platform.', ARRAY['Python', 'TensorFlow', 'AWS', 'Docker', 'MLOps'], 'Seattle, WA', 'full-time', 130000, 180000, false);