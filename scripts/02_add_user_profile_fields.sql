-- Add user profile fields to users_checkins table
ALTER TABLE users_checkins ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users_checkins ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users_checkins ADD COLUMN IF NOT EXISTS pfp_url TEXT;
ALTER TABLE users_checkins ADD COLUMN IF NOT EXISTS custody_address TEXT;
ALTER TABLE users_checkins ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_checkins_username ON users_checkins(username);
