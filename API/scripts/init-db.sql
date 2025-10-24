-- Database Initialization Script
-- This script runs when PostgreSQL container first starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create schemas for different services
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS properties;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Set search path
SET search_path TO public, auth, users, properties, transactions, notifications, analytics;

-- ============================================
-- AUTH SCHEMA TABLES
-- ============================================

-- Users table (auth)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(token)
);

-- OAuth providers table
CREATE TABLE IF NOT EXISTS auth.oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- google, facebook, etc.
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- ============================================
-- USERS SCHEMA TABLES
-- ============================================

-- User profiles table
CREATE TABLE IF NOT EXISTS users.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100),
    residential_address TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin', 'sysadmin')),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE IF NOT EXISTS users.preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_sms BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'GHS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User saved properties (favorites)
CREATE TABLE IF NOT EXISTS users.saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS users.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS SCHEMA TABLES
-- ============================================

-- Email logs table
CREATE TABLE IF NOT EXISTS notifications.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    template VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
    provider VARCHAR(50), -- smtp, sendgrid, etc.
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS logs table
CREATE TABLE IF NOT EXISTS notifications.sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    to_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    provider VARCHAR(50), -- twilio, africastalking, etc.
    message_id VARCHAR(255),
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates table
CREATE TABLE IF NOT EXISTS notifications.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(500),
    template_type VARCHAR(50) DEFAULT 'email', -- email, sms
    content TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ANALYTICS SCHEMA TABLES
-- ============================================

-- Events tracking table
CREATE TABLE IF NOT EXISTS analytics.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    properties JSONB,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON auth.users(is_active);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON auth.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON auth.refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_profiles_user ON users.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON users.profiles(role);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON users.saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON users.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON users.activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_email_logs_user ON notifications.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON notifications.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON notifications.email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_user ON notifications.sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON notifications.sms_logs(status);

CREATE INDEX IF NOT EXISTS idx_events_user ON analytics.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics.events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics.events(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON users.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON users.preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default email templates
INSERT INTO notifications.templates (name, subject, template_type, content, variables) VALUES
('welcome', 'Welcome to Get Plot', 'email', 'Welcome {{firstName}}! Thank you for joining Get Plot.', '["firstName"]'),
('email_verification', 'Verify Your Email', 'email', 'Please verify your email by clicking this link: {{verificationLink}}', '["verificationLink"]'),
('password_reset', 'Reset Your Password', 'email', 'Click here to reset your password: {{resetLink}}', '["resetLink"]'),
('plot_reservation', 'Plot Reservation Confirmation', 'email', 'Your reservation for plot {{plotNo}} has been confirmed.', '["plotNo", "location", "amount"]'),
('plot_purchase', 'Plot Purchase Confirmation', 'email', 'Congratulations! You have successfully purchased plot {{plotNo}}.', '["plotNo", "location", "amount"]')
ON CONFLICT (name) DO NOTHING;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END $$;

