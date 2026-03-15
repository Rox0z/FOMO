-- FOMO Database Setup Script
-- Run this script as a PostgreSQL superuser to initialize the database

-- Create user type enum
CREATE TYPE public.user_type AS ENUM ('user', 'vendor');

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  country_code VARCHAR(5),
  user_type public.user_type NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on email
CREATE UNIQUE INDEX IF NOT EXISTS email_idx ON public.users(email);

-- Grant permissions to fomo user
GRANT USAGE ON SCHEMA public TO fomo;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fomo;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fomo;
GRANT USAGE ON TYPE public.user_type TO fomo;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fomo;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO fomo;
