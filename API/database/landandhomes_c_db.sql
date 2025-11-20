-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS landandhomes_c_db;
CREATE SCHEMA IF NOT EXISTS app_auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS properties;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Updated at trigger function (must be created before tables that use it)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- AUTH SCHEMA (must be created first due to foreign key dependencies)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(token)
);

CREATE TABLE IF NOT EXISTS app_auth.oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE TRIGGER update_auth_users_updated_at 
    BEFORE UPDATE ON app_auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------------------
-- Core tables
-------------------------------------------------------------------------------
CREATE TABLE landandhomes_c_db.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type = ANY (ARRAY['property', 'user', 'settings', 'system'])),
    action TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status = ANY (ARRAY['success', 'error', 'pending'])),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE landandhomes_c_db.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150),
    code VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status = ANY (ARRAY['active', 'inactive', 'archived'])),
    region VARCHAR(100),
    country VARCHAR(100),
    chief_user_id UUID REFERENCES app_auth.users(id) ON DELETE SET NULL,
    location JSONB,
    geometry JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (slug),
    UNIQUE (code)
);

CREATE TABLE landandhomes_c_db.site_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES landandhomes_c_db.sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('chief', 'chief_assistant', 'admin', 'system_admin')),
    permissions JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id, user_id)
);

CREATE TABLE landandhomes_c_db.plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES landandhomes_c_db.sites(id) ON DELETE CASCADE,
    plot_no VARCHAR(100),
    type VARCHAR(50) DEFAULT 'Feature',
    geometry JSONB,
    properties JSONB DEFAULT '{}'::JSONB,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'hold')),
    area NUMERIC,
    area_unit VARCHAR(20) DEFAULT 'acres',
    price NUMERIC,
    currency VARCHAR(10) DEFAULT 'GHS',
    metadata JSONB DEFAULT '{}'::JSONB,
    owner_name VARCHAR(255),
    owner_contact VARCHAR(255),
    assigned_to UUID REFERENCES app_auth.users(id) ON DELETE SET NULL,
    hold_expires_at TIMESTAMPTZ,
    reserved_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id, plot_no)
);

CREATE TABLE landandhomes_c_db.plot_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES landandhomes_c_db.plots(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL CHECK (new_status IN ('available', 'reserved', 'sold', 'hold')),
    changed_by UUID REFERENCES app_auth.users(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE landandhomes_c_db.plot_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES landandhomes_c_db.plots(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES landandhomes_c_db.sites(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    country TEXT,
    phone TEXT NOT NULL,
    message TEXT,
    amount_offered NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE landandhomes_c_db.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    price NUMERIC,
    negotiable BOOLEAN DEFAULT FALSE,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    location_coordinates JSONB,
    size TEXT NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    features JSONB DEFAULT '[]'::JSONB,
    images JSONB DEFAULT '[]'::JSONB,
    status TEXT DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected', 'sold'])),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_email TEXT,
    region TEXT,
    rejection_reason TEXT,
    documents JSONB,
    contact NUMERIC,
    property_type VARCHAR(50) NOT NULL DEFAULT 'sale',
    rental_type VARCHAR(50),
    rental_duration VARCHAR(50),
    rental_price NUMERIC,
    rental_available_from DATE,
    rental_available_to DATE,
    rental_deposit NUMERIC,
    rental_utilities_included BOOLEAN DEFAULT FALSE,
    rental_furnished BOOLEAN DEFAULT FALSE,
    airbnb_min_stay NUMERIC,
    listing_type TEXT
);

CREATE TABLE landandhomes_c_db.news_letter_mails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    email VARCHAR(255)
);

CREATE TABLE landandhomes_c_db.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    type TEXT NOT NULL,
    property_id UUID,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'sent', 'failed'])),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    data JSONB DEFAULT '{}'::JSONB,
    CONSTRAINT notifications_property_id_fkey FOREIGN KEY (property_id) REFERENCES landandhomes_c_db.properties (id)
);

-- Tables with foreign keys (created after referenced tables)
CREATE TABLE landandhomes_c_db.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    property_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT favorites_property_id_fkey FOREIGN KEY (property_id) REFERENCES landandhomes_c_db.properties (id)
);

CREATE TABLE landandhomes_c_db.property_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'contacted', 'completed'])),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT property_inquiries_property_id_fkey FOREIGN KEY (property_id) REFERENCES landandhomes_c_db.properties (id)
);

-------------------------------------------------------------------------------
-- USERS SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100),
    residential_address TEXT,
    role VARCHAR(20) DEFAULT 'default_member' CHECK (
        role IN ('default_member', 'agent', 'admin', 'system_admin', 'chief', 'chief_assistant')
    ),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users.preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_sms BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'GHS',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users.saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

CREATE TABLE IF NOT EXISTS users.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON users.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at 
    BEFORE UPDATE ON users.preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------------------
-- NOTIFICATIONS SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_auth.users(id) ON DELETE SET NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    template VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    provider VARCHAR(50),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications.sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_auth.users(id) ON DELETE SET NULL,
    to_phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    provider VARCHAR(50),
    message_id VARCHAR(255),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(500),
    template_type VARCHAR(50) DEFAULT 'email',
    content TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_notifications_templates_updated_at 
    BEFORE UPDATE ON notifications.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------------------
-- ANALYTICS SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_auth.users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    properties JSONB,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------------------------------
-- TRANSACTIONS SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_auth.users(id) ON DELETE SET NULL,
    property_id UUID NOT NULL,
    location VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('reservation', 'purchase')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
    total_amount DECIMAL(15, 2) NOT NULL,
    deposit_amount DECIMAL(15, 2),
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    customer_details JSONB,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions.transactions(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    payment_proof TEXT,
    verified_by UUID REFERENCES app_auth.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------------------
-- PROPERTIES SCHEMA (property tables function)
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_property_table(table_name TEXT) RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS properties.%I (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            type VARCHAR(50) DEFAULT ''Feature'',
            geometry JSONB NOT NULL,
            properties JSONB NOT NULL,
            status VARCHAR(50) DEFAULT ''available'' CHECK (status IN (''available'', ''reserved'', ''sold'', ''hold'')),
            plotTotalAmount DECIMAL(15, 2),
            paidAmount DECIMAL(15, 2) DEFAULT 0,
            remainingAmount DECIMAL(15, 2),
            firstname VARCHAR(100),
            lastname VARCHAR(100),
            email VARCHAR(255),
            phone VARCHAR(20),
            country VARCHAR(100),
            residentialAddress TEXT,
            hold_expires_at TIMESTAMPTZ,
            reserved_at TIMESTAMPTZ,
            sold_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT valid_geometry CHECK (jsonb_typeof(geometry) = ''object''),
            CONSTRAINT valid_properties CHECK (jsonb_typeof(properties) = ''object'')
        )
    ', table_name);

    -- Create indexes
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_status ON properties.%I(status)', table_name, table_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_created ON properties.%I(created_at)', table_name, table_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_plot_no ON properties.%I((properties->>''Plot_No''))', table_name, table_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_properties ON properties.%I USING GIN (properties)', table_name, table_name);

    -- Create trigger
    EXECUTE format('
        CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON properties.%I
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    ', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Create property tables
SELECT create_property_table('yabi');
SELECT create_property_table('trabuom');
SELECT create_property_table('dar_es_salaam');
SELECT create_property_table('legon_hills');
SELECT create_property_table('nthc');
SELECT create_property_table('berekuso');
SELECT create_property_table('saadi');

-------------------------------------------------------------------------------
-- PROPERTIES VIEW (centralized view over plots)
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW properties.all_properties AS
    SELECT
        p.id,
        COALESCE(s.slug, s.name) AS location,
        p.type,
        p.geometry,
        p.properties,
        p.status,
        p.price AS plotTotalAmount,
        COALESCE(NULLIF(p.properties->>'paidAmount', '')::NUMERIC, 0) AS paidAmount,
        CASE
            WHEN p.price IS NULL THEN NULL
            ELSE p.price - COALESCE(NULLIF(p.properties->>'paidAmount', '')::NUMERIC, 0)
        END AS remainingAmount,
        p.properties->>'firstname' AS firstname,
        p.properties->>'lastname' AS lastname,
        p.properties->>'email' AS email,
        p.properties->>'phone' AS phone,
        p.properties->>'country' AS country,
        p.properties->>'residentialAddress' AS residentialAddress,
        p.hold_expires_at,
        p.reserved_at,
        p.sold_at,
        p.created_at,
        p.updated_at
    FROM landandhomes_c_db.plots p
    LEFT JOIN landandhomes_c_db.sites s ON s.id = p.site_id;

-------------------------------------------------------------------------------
-- CREATE TRIGGERS
-------------------------------------------------------------------------------
CREATE TRIGGER update_sites_updated_at
    BEFORE UPDATE ON landandhomes_c_db.sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_assignments_updated_at
    BEFORE UPDATE ON landandhomes_c_db.site_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plots_updated_at
    BEFORE UPDATE ON landandhomes_c_db.plots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------------------
-- CREATE INDEXES
-------------------------------------------------------------------------------
-- Core schema indexes
CREATE INDEX IF NOT EXISTS idx_sites_status ON landandhomes_c_db.sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_chief ON landandhomes_c_db.sites(chief_user_id);
CREATE INDEX IF NOT EXISTS idx_site_assignments_site_role ON landandhomes_c_db.site_assignments(site_id, role);
CREATE INDEX IF NOT EXISTS idx_plots_site ON landandhomes_c_db.plots(site_id);
CREATE INDEX IF NOT EXISTS idx_plots_status ON landandhomes_c_db.plots(status);
CREATE INDEX IF NOT EXISTS idx_plots_plot_no ON landandhomes_c_db.plots(plot_no);
CREATE INDEX IF NOT EXISTS idx_plot_interests_plot ON landandhomes_c_db.plot_interests(plot_id);
CREATE INDEX IF NOT EXISTS idx_plot_interests_site ON landandhomes_c_db.plot_interests(site_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON landandhomes_c_db.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_user ON landandhomes_c_db.properties(user_id);

-- Auth schema indexes
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON app_auth.users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_active ON app_auth.users(is_active);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON app_auth.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON app_auth.refresh_tokens(expires_at);

-- Users schema indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user ON users.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON users.profiles(role);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON users.saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON users.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON users.activity_logs(created_at);

-- Notifications schema indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON notifications.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON notifications.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_user ON notifications.sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON notifications.sms_logs(status);

-- Analytics schema indexes
CREATE INDEX IF NOT EXISTS idx_events_user ON analytics.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics.events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics.events(created_at);

-- Transactions schema indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_property ON transactions.transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON transactions.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON transactions.payments(status);

-------------------------------------------------------------------------------
-- DEFAULT EMAIL TEMPLATES
-------------------------------------------------------------------------------
INSERT INTO notifications.templates (name, subject, template_type, content, variables) VALUES
('welcome', 'Welcome to Get Plot', 'email', 'Welcome {{firstName}}! Thank you for joining Get Plot.', '["firstName"]'),
('email_verification', 'Verify Your Email', 'email', 'Please verify your email by clicking this link: {{verificationLink}}', '["verificationLink"]'),
('password_reset', 'Reset Your Password', 'email', 'Click here to reset your password: {{resetLink}}', '["resetLink"]'),
('plot_reservation', 'Plot Reservation Confirmation', 'email', 'Your reservation for plot {{plotNo}} has been confirmed.', '["plotNo", "location", "amount"]'),
('plot_purchase', 'Plot Purchase Confirmation', 'email', 'Congratulations! You have successfully purchased plot {{plotNo}}.', '["plotNo", "location", "amount"]')
ON CONFLICT (name) DO NOTHING;

-------------------------------------------------------------------------------
-- COMPLETION NOTICE
-------------------------------------------------------------------------------
DO $$
BEGIN
    RAISE NOTICE 'Database schema initialized successfully with all tables, indexes, and triggers';
END $$;