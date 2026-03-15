-- FOMO Database Setup Script (without schema specification)
-- Run this script as a PostgreSQL superuser or with proper permissions

-- Create user type enum
CREATE TYPE user_type AS ENUM ('user', 'vendor');

-- Create users table  
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  country_code VARCHAR(5),
  user_type user_type NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on email
CREATE UNIQUE INDEX email_idx ON users(email);
