-- Properties Schema for Get Plot
-- Based on existing implementation

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create properties schema if not exists
CREATE SCHEMA IF NOT EXISTS properties;

-- Function to create a property table with consistent structure
CREATE OR REPLACE FUNCTION create_property_table(table_name TEXT) RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS properties.%I (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            type VARCHAR(50) DEFAULT ''Feature'',
            geometry JSONB NOT NULL,  -- GeoJSON Polygon
            properties JSONB NOT NULL, -- Plot details (Plot_No, Street_Nam, etc.)
            
            -- Status and ownership
            status VARCHAR(50) DEFAULT ''available'' CHECK (status IN (''available'', ''reserved'', ''sold'', ''hold'')),
            
            -- Financial information
            plotTotalAmount DECIMAL(15, 2),
            paidAmount DECIMAL(15, 2) DEFAULT 0,
            remainingAmount DECIMAL(15, 2),
            
            -- Customer information (when reserved/sold)
            firstname VARCHAR(100),
            lastname VARCHAR(100),
            email VARCHAR(255),
            phone VARCHAR(20),
            country VARCHAR(100),
            residentialAddress TEXT,
            
            -- Timestamps
            hold_expires_at TIMESTAMP,
            reserved_at TIMESTAMP,
            sold_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Indexes
            CONSTRAINT valid_geometry CHECK (jsonb_typeof(geometry) = ''object''),
            CONSTRAINT valid_properties CHECK (jsonb_typeof(properties) = ''object'')
        );
        
        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_%I_status ON properties.%I(status);
        CREATE INDEX IF NOT EXISTS idx_%I_email ON properties.%I(email);
        CREATE INDEX IF NOT EXISTS idx_%I_created ON properties.%I(created_at);
        CREATE INDEX IF NOT EXISTS idx_%I_plot_no ON properties.%I((properties->>''Plot_No''));
        CREATE INDEX IF NOT EXISTS idx_%I_geometry ON properties.%I USING GIN (geometry);
        CREATE INDEX IF NOT EXISTS idx_%I_properties ON properties.%I USING GIN (properties);
        
        -- Create updated_at trigger
        CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON properties.%I
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', 
    table_name, 
    table_name, table_name,
    table_name, table_name,
    table_name, table_name,
    table_name, table_name,
    table_name, table_name,
    table_name, table_name,
    table_name, table_name
    );
END;
$$ LANGUAGE plpgsql;

-- Create all property tables matching existing implementation
SELECT create_property_table('yabi');
SELECT create_property_table('trabuom');
SELECT create_property_table('dar_es_salaam');
SELECT create_property_table('legon_hills');
SELECT create_property_table('nthc');
SELECT create_property_table('berekuso');
SELECT create_property_table('saadi');

-- Create a view to get all properties across all locations
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

-- Function to get properties with filters
CREATE OR REPLACE FUNCTION properties.search_properties(
    p_location TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_page INT DEFAULT 1,
    p_limit INT DEFAULT 20
) RETURNS TABLE (
    id UUID,
    location TEXT,
    plot_no TEXT,
    street_name TEXT,
    status VARCHAR(50),
    price DECIMAL,
    geometry JSONB,
    properties JSONB,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.id,
        ap.location,
        ap.properties->>'Plot_No' as plot_no,
        ap.properties->>'Street_Nam' as street_name,
        ap.status,
        ap.plotTotalAmount as price,
        ap.geometry,
        ap.properties,
        ap.created_at
    FROM properties.all_properties ap
    WHERE 
        (p_location IS NULL OR ap.location = p_location)
        AND (p_status IS NULL OR ap.status = p_status)
        AND (p_min_price IS NULL OR ap.plotTotalAmount >= p_min_price)
        AND (p_max_price IS NULL OR ap.plotTotalAmount <= p_max_price)
    ORDER BY ap.created_at DESC
    LIMIT p_limit
    OFFSET (p_page - 1) * p_limit;
END;
$$ LANGUAGE plpgsql;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Properties schema initialized successfully';
END $$;

