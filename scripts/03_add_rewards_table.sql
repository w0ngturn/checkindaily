-- Create rewards table to track user rewards
CREATE TABLE IF NOT EXISTS user_rewards (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL UNIQUE REFERENCES users_checkins(fid) ON DELETE CASCADE,
  total_points INT NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  last_reward_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create rewards history table for tracking reward calculations
CREATE TABLE IF NOT EXISTS reward_history (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL REFERENCES users_checkins(fid) ON DELETE CASCADE,
  points_earned INT NOT NULL,
  streak_at_time INT NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_rewards_fid ON user_rewards(fid);
CREATE INDEX IF NOT EXISTS idx_reward_history_fid ON reward_history(fid);
CREATE INDEX IF NOT EXISTS idx_reward_history_earned_at ON reward_history(earned_at);
