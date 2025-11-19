CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE SCHEMA IF NOT EXISTS landandhomes_c_db;

-------------------------------------------------------------------------------
-- Core tables (no cross-schema dependencies)
-------------------------------------------------------------------------------
CREATE TABLE landandhomes_c_db.activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type = ANY (ARRAY['property', 'user', 'settings', 'system'])),
  action text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'success' CHECK (status = ANY (ARRAY['success', 'error', 'pending'])),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE landandhomes_c_db.asokore_mampong (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text,
  geometry jsonb,
  properties jsonb,
  status varchar,
  firstname varchar,
  lastname varchar,
  email varchar,
  country varchar,
  phone varchar,
  residentialAddress varchar,
  agent varchar,
  plotTotalAmount real DEFAULT 0,
  paidAmount real DEFAULT 0,
  remainingAmount real DEFAULT 0,
  remarks text,
  paymentDetails json,
  paymentId varchar,
  paymentReference varchar
);

CREATE TABLE landandhomes_c_db.berekuso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  geometry jsonb,
  properties jsonb,
  status varchar,
  firstname varchar,
  lastname varchar,
  email varchar,
  country varchar,
  phone varchar,
  residentialAddress varchar,
  agent varchar,
  plotTotalAmount real,
  paidAmount real,
  remarks json,
  paymentDetails json,
  paymentId varchar,
  paymentReference varchar,
  type varchar,
  remainingAmount integer
);

CREATE TABLE landandhomes_c_db.dar_es_salaam (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text,
  geometry jsonb,
  properties jsonb,
  status varchar,
  firstname varchar,
  lastname varchar,
  email varchar,
  country varchar,
  phone varchar,
  residentialAddress varchar,
  agent varchar,
  plotTotalAmount real,
  paidAmount real,
  remainingAmount real,
  remarks text,
  paymentDetails json,
  paymentId varchar,
  paymentReference varchar
);

CREATE TABLE landandhomes_c_db.houselistings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  address varchar,
  coordinates json,
  createdBy varchar,
  active boolean DEFAULT false,
  propertyType varchar,
  bedroom numeric,
  parking numeric,
  phone real,
  areaSize real,
  price real,
  description text,
  title text,
  type varchar,
  bathroom varchar,
  username varchar NOT NULL,
  fullName varchar
);

CREATE TABLE landandhomes_c_db.landlistings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  address varchar,
  coordinates json,
  active boolean DEFAULT false,
  title varchar,
  price real,
  areaSize real,
  createdBy varchar,
  description text,
  phone varchar,
  username varchar,
  fullName varchar,
  propertyType varchar
);

CREATE TABLE landandhomes_c_db.legon_hills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  geometry jsonb,
  properties jsonb,
  status varchar,
  firstname varchar,
  lastname varchar,
  email varchar,
  country varchar,
  phone varchar,
  residentialAddress varchar,
  agent varchar,
  plotTotalAmount real,
  paidAmount real,
  remarks json,
  paymentDetails json,
  paymentId varchar,
  paymentReference varchar,
  type varchar,
  remainingAmount integer
);

CREATE TABLE landandhomes_c_db.news_letter_mails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email varchar
);

CREATE TABLE landandhomes_c_db.nthc (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text,
  geometry jsonb,
  properties jsonb,
  status varchar,
  firstname varchar,
  lastname varchar,
  email varchar,
  country varchar,
  phone varchar,
  residentialAddress varchar,
  agent varchar,
  plotTotalAmount real DEFAULT 0,
  paidAmount real DEFAULT 0,
  remainingAmount real DEFAULT 0,
  remarks text,
  paymentDetails json,
  paymentId varchar,
  paymentReference varchar
);

CREATE TABLE landandhomes_c_db.properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  price numeric,
  negotiable boolean DEFAULT false,
  location text NOT NULL,
  address text NOT NULL,
  location_coordinates jsonb,
  size text NOT NULL,
  bedrooms integer,
  bathrooms integer,
  features jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected', 'sold'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_email text,
  region text,
  rejection_reason text,
  documents json,
  contact numeric,
  property_type varchar NOT NULL DEFAULT 'sale',
  rental_type varchar,
  rental_duration varchar,
  rental_price numeric,
  rental_available_from date,
  rental_available_to date,
  rental_deposit numeric,
  rental_utilities_included boolean DEFAULT false,
  rental_furnished boolean DEFAULT false,
  airbnb_min_stay numeric,
  listing_type text
);

CREATE TABLE landandhomes_c_db.saadi (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text,
  geometry jsonb,
  properties jsonb,
  status varchar,
  firstname varchar,
  lastname varchar,
  email varchar,
  country varchar,
  phone varchar,
  residentialAddress varchar,
  agent varchar,
  plotTotalAmount real DEFAULT 0,
  paidAmount real DEFAULT 0,
  remainingAmount real DEFAULT 0,
  remarks text,
  paymentDetails json,
  paymentId varchar,
  paymentReference varchar
);

CREATE TABLE landandhomes_c_db.spatial_ref_sys (
  srid integer PRIMARY KEY CHECK (srid > 0 AND srid <= 998999),
  auth_name varchar,
  auth_srid integer,
  srtext varchar,
  proj4text varchar
);

CREATE TABLE landandhomes_c_db.trabuom (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text,
  geometry jsonb,
  properties jsonb,
  status varchar NOT NULL DEFAULT 'Available',
  firstname varchar,
  lastname varchar,
  email varchar,
  country varchar,
  phone varchar,
  residentialAddress varchar,
  agent varchar,
  plotTotalAmount real NOT NULL DEFAULT 25000,
  paidAmount real DEFAULT 0,
  remainingAmount real DEFAULT 0,
  remarks text,
  paymentDetails json,
  paymentId varchar,
  paymentReference varchar,
  created_at timestamptz DEFAULT now(),
  owner_info text
);

CREATE TABLE landandhomes_c_db.yabi (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text,
  geometry jsonb,
  properties jsonb,
  status varchar,
  firstname varchar,
  lastname varchar,
  email varchar,
  country varchar,
  phone varchar,
  residentialAddress varchar,
  agent varchar,
  plotTotalAmount real DEFAULT 0,
  paidAmount real DEFAULT 0,
  remainingAmount real DEFAULT 0,
  remarks text,
  paymentDetails json,
  paymentId varchar,
  paymentReference varchar
);

CREATE TABLE landandhomes_c_db.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text,
  type text NOT NULL,
  property_id uuid,
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'sent', 'failed'])),
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  data jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT notifications_property_id_fkey FOREIGN KEY (property_id) REFERENCES landandhomes_c_db.properties (id)
);

-------------------------------------------------------------------------------
-- Tables with foreign keys
-------------------------------------------------------------------------------
CREATE TABLE landandhomes_c_db.favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  property_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT favorites_property_id_fkey FOREIGN KEY (property_id) REFERENCES landandhomes_c_db.properties (id)
);

CREATE TABLE landandhomes_c_db.houseListingImages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  url varchar,
  listing_id uuid,
  CONSTRAINT houselistingimages_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES landandhomes_c_db.houselistings (id)
);

CREATE TABLE landandhomes_c_db.landListingImages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  url varchar,
  listing_id uuid,
  CONSTRAINT landlistingimages_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES landandhomes_c_db.landlistings (id)
);

CREATE TABLE landandhomes_c_db.property_inquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'contacted', 'completed'])),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT property_inquiries_property_id_fkey FOREIGN KEY (property_id) REFERENCES landandhomes_c_db.properties (id)
);

CREATE TABLE landandhomes_c_db.asokore_mampong_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  country text,
  phone text NOT NULL,
  plotId uuid,
  plot_number text NOT NULL,
  plot_name text,
  message text,
  plot_amount text,
  CONSTRAINT asokore_mampong_interests_plotid_fkey FOREIGN KEY (plotId) REFERENCES landandhomes_c_db.saadi (id),
  CONSTRAINT asokore_mampong_interests_plotid_fkey1 FOREIGN KEY (plotId) REFERENCES landandhomes_c_db.asokore_mampong (id)
);

CREATE TABLE landandhomes_c_db.berekuso_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  country text,
  phone text NOT NULL,
  plotId uuid,
  plot_number text NOT NULL,
  plot_name text,
  message text,
  plot_amount text,
  CONSTRAINT berekuso_interests_plotid_fkey FOREIGN KEY (plotId) REFERENCES landandhomes_c_db.berekuso (id)
);

CREATE TABLE landandhomes_c_db.dar_es_salaam_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  country text,
  phone text NOT NULL,
  plotId uuid,
  plot_number text NOT NULL,
  plot_name text,
  message text,
  plot_amount text,
  CONSTRAINT dar_es_salaam_interests_plotid_fkey FOREIGN KEY (plotId) REFERENCES landandhomes_c_db.dar_es_salaam (id)
);

CREATE TABLE landandhomes_c_db.legon_hills_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  country text,
  phone text NOT NULL,
  plotId uuid,
  plot_number text NOT NULL,
  plot_name text,
  message text,
  plot_amount text,
  CONSTRAINT legon_hills_interests_plotid_fkey FOREIGN KEY (plotId) REFERENCES landandhomes_c_db.legon_hills (id)
);

CREATE TABLE landandhomes_c_db.nthc_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  country text,
  phone text NOT NULL,
  plotId uuid,
  plot_number text NOT NULL,
  plot_name text,
  message text,
  plot_amount text,
  CONSTRAINT nthc_interests_plotid_fkey FOREIGN KEY (plotId) REFERENCES landandhomes_c_db.yabi (id)
);

CREATE TABLE landandhomes_c_db.saadi_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  country text,
  phone text NOT NULL,
  plotId uuid,
  plot_number text NOT NULL,
  plot_name text,
  message text,
  plot_amount text,
  CONSTRAINT saadi_interests_plotid_fkey FOREIGN KEY (plotId) REFERENCES landandhomes_c_db.saadi (id)
);

CREATE TABLE landandhomes_c_db.trabuom_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  country text,
  phone text NOT NULL,
  plotId uuid,
  plot_number text NOT NULL,
  plot_name text,
  message text,
  plot_amount text,
  CONSTRAINT trabuom_interests_plotid_fkey FOREIGN KEY (plotId) REFERENCES landandhomes_c_db.trabuom (id)
);

CREATE TABLE landandhomes_c_db.yabi_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  country text,
  phone text NOT NULL,
  plotId uuid,
  plot_number text NOT NULL,
  plot_name text,
  message text,
  plot_amount text,
  CONSTRAINT yabi_interests_plotid_fkey FOREIGN KEY (plotId) REFERENCES landandhomes_c_db.yabi (id)
);

-------------------------------------------------------------------------------
-- Additional Schemas for Microservices (auth/users/properties/transactions/etc.)
-------------------------------------------------------------------------------

-- Create service schemas if they don't exist
CREATE SCHEMA IF NOT EXISTS app_auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS properties;
CREATE SCHEMA IF NOT EXISTS transactions;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Updated at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- AUTH SCHEMA
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_auth.users (
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

CREATE TABLE IF NOT EXISTS app_auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(token)
);

CREATE TABLE IF NOT EXISTS app_auth.oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE TRIGGER update_auth_users_updated_at BEFORE UPDATE ON app_auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin', 'sysadmin')),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users.preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_sms BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'GHS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users.saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON users.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON users.preferences
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
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(500),
    template_type VARCHAR(50) DEFAULT 'email',
    content TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_notifications_templates_updated_at BEFORE UPDATE ON notifications.templates
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------------------------------
-- PROPERTIES SCHEMA (normalized copy of plot tables)
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
            hold_expires_at TIMESTAMP,
            reserved_at TIMESTAMP,
            sold_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT valid_geometry CHECK (jsonb_typeof(geometry) = ''object''),
            CONSTRAINT valid_properties CHECK (jsonb_typeof(properties) = ''object'')
        );

        CREATE INDEX IF NOT EXISTS idx_%I_status ON properties.%I(status);
        CREATE INDEX IF NOT EXISTS idx_%I_created ON properties.%I(created_at);
        CREATE INDEX IF NOT EXISTS idx_%I_plot_no ON properties.%I((properties->>''Plot_No''));
        CREATE INDEX IF NOT EXISTS idx_%I_properties ON properties.%I USING GIN (properties);

        CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON properties.%I
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ',
    table_name,
    table_name, table_name,
    table_name, table_name,
    table_name, table_name,
    table_name, table_name,
    table_name, table_name
    );
END;
$$ LANGUAGE plpgsql;

SELECT create_property_table('yabi');
SELECT create_property_table('trabuom');
SELECT create_property_table('dar_es_salaam');
SELECT create_property_table('legon_hills');
SELECT create_property_table('nthc');
SELECT create_property_table('berekuso');
SELECT create_property_table('saadi');

CREATE OR REPLACE VIEW properties.all_properties AS
    SELECT id, 'yabi' as location, type, geometry, properties, status, plotTotalAmount, paidAmount, remainingAmount,
           firstname, lastname, email, phone, country, residentialAddress,
           hold_expires_at, reserved_at, sold_at, created_at, updated_at
    FROM properties.yabi
    UNION ALL
    SELECT id, 'trabuom' as location, type, geometry, properties, status, plotTotalAmount, paidAmount, remainingAmount,
           firstname, lastname, email, phone, country, residentialAddress,
           hold_expires_at, reserved_at, sold_at, created_at, updated_at
    FROM properties.trabuom
    UNION ALL
    SELECT id, 'dar_es_salaam' as location, type, geometry, properties, status, plotTotalAmount, paidAmount, remainingAmount,
           firstname, lastname, email, phone, country, residentialAddress,
           hold_expires_at, reserved_at, sold_at, created_at, updated_at
    FROM properties.dar_es_salaam
    UNION ALL
    SELECT id, 'legon_hills' as location, type, geometry, properties, status, plotTotalAmount, paidAmount, remainingAmount,
           firstname, lastname, email, phone, country, residentialAddress,
           hold_expires_at, reserved_at, sold_at, created_at, updated_at
    FROM properties.legon_hills
    UNION ALL
    SELECT id, 'nthc' as location, type, geometry, properties, status, plotTotalAmount, paidAmount, remainingAmount,
           firstname, lastname, email, phone, country, residentialAddress,
           hold_expires_at, reserved_at, sold_at, created_at, updated_at
    FROM properties.nthc
    UNION ALL
    SELECT id, 'berekuso' as location, type, geometry, properties, status, plotTotalAmount, paidAmount, remainingAmount,
           firstname, lastname, email, phone, country, residentialAddress,
           hold_expires_at, reserved_at, sold_at, created_at, updated_at
    FROM properties.berekuso
    UNION ALL
    SELECT id, 'saadi' as location, type, geometry, properties, status, plotTotalAmount, paidAmount, remainingAmount,
           firstname, lastname, email, phone, country, residentialAddress,
           hold_expires_at, reserved_at, sold_at, created_at, updated_at
    FROM properties.saadi;

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
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-------------------------------------------------------------------------------
-- INDEXES TO MATCH SERVICE QUERIES
-------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON app_auth.users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_active ON app_auth.users(is_active);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON app_auth.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON app_auth.refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_profiles_user ON users.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON users.profiles(role);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON users.saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON users.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON users.activity_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_email_logs_user ON notifications.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON notifications.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_user ON notifications.sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON notifications.sms_logs(status);

CREATE INDEX IF NOT EXISTS idx_events_user ON analytics.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics.events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics.events(created_at);

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
    RAISE NOTICE 'landandhomes_c_db schema plus service schemas initialized successfully';
END $$;
