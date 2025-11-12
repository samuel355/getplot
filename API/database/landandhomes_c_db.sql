CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
