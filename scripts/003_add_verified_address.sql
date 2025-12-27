-- Add verified_addresses column to store Farcaster primary wallet
ALTER TABLE users_checkins 
ADD COLUMN IF NOT EXISTS verified_address text;

-- Add comment for documentation
COMMENT ON COLUMN users_checkins.verified_address IS 'Primary verified wallet address from Farcaster';
