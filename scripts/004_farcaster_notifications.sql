-- Create table for Farcaster notification tokens
CREATE TABLE IF NOT EXISTS farcaster_notification_tokens (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL,
  token TEXT NOT NULL,
  notification_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fid, token)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_farcaster_notifications_fid ON farcaster_notification_tokens(fid);
CREATE INDEX IF NOT EXISTS idx_farcaster_notifications_active ON farcaster_notification_tokens(is_active) WHERE is_active = true;
