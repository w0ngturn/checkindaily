-- Create table for notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL UNIQUE REFERENCES users_checkins(fid) ON DELETE CASCADE,
  push_endpoint TEXT,
  push_auth_key TEXT,
  push_p256dh_key TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  email_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_fid ON notification_preferences(fid);

-- Create table for notification history
CREATE TABLE IF NOT EXISTS notification_history (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL REFERENCES users_checkins(fid) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for notification history queries
CREATE INDEX IF NOT EXISTS idx_notification_history_fid ON notification_history(fid, sent_at DESC);
