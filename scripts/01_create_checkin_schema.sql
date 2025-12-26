-- Create users_checkins table to store check-in history and streaks
CREATE TABLE IF NOT EXISTS users_checkins (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL UNIQUE,
  last_checkin TIMESTAMP WITH TIME ZONE NOT NULL,
  streak_count INT NOT NULL DEFAULT 1,
  total_checkins INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups by fid
CREATE INDEX IF NOT EXISTS idx_users_checkins_fid ON users_checkins(fid);

-- Create checkin_history table for analytics
CREATE TABLE IF NOT EXISTS checkin_history (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL REFERENCES users_checkins(fid) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  streak_at_time INT NOT NULL
);

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_checkin_history_fid_date ON checkin_history(fid, checked_in_at);
