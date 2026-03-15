-- Add new columns to users table for vendor approval and admin functionality

ALTER TABLE users ADD COLUMN IF NOT EXISTS superuser BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Update active status: vendors should be inactive, users should be active
UPDATE users SET active = FALSE WHERE user_type = 'vendor';
UPDATE users SET active = TRUE WHERE user_type = 'user';
