-- Create user_tasks table to track completed tasks
CREATE TABLE IF NOT EXISTS user_tasks (
  id BIGSERIAL PRIMARY KEY,
  fid BIGINT NOT NULL,
  task_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fid, task_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_tasks_fid ON user_tasks(fid);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON user_tasks(task_id);
