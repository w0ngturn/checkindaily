-- Fix total_checkins bug by recalculating from checkin_history
-- This script syncs total_checkins in users_checkins with actual count from checkin_history

-- First, let's see the current inconsistencies
SELECT 
  uc.fid,
  uc.username,
  uc.total_checkins as current_total,
  COALESCE(ch.actual_count, 0) as actual_count,
  uc.total_checkins - COALESCE(ch.actual_count, 0) as difference
FROM users_checkins uc
LEFT JOIN (
  SELECT fid, COUNT(*) as actual_count
  FROM checkin_history
  GROUP BY fid
) ch ON uc.fid = ch.fid
WHERE uc.total_checkins != COALESCE(ch.actual_count, 0)
ORDER BY ABS(uc.total_checkins - COALESCE(ch.actual_count, 0)) DESC;

-- Update total_checkins to match actual checkin_history count
UPDATE users_checkins uc
SET 
  total_checkins = COALESCE(ch.actual_count, 0),
  updated_at = NOW()
FROM (
  SELECT fid, COUNT(*) as actual_count
  FROM checkin_history
  GROUP BY fid
) ch
WHERE uc.fid = ch.fid
AND uc.total_checkins != ch.actual_count;

-- For users who have no checkin_history records but have total_checkins > 0
-- Insert their missing history records based on created_at date
INSERT INTO checkin_history (fid, checked_in_at, streak_at_time)
SELECT 
  uc.fid,
  uc.created_at,
  1
FROM users_checkins uc
LEFT JOIN checkin_history ch ON uc.fid = ch.fid
WHERE ch.fid IS NULL
AND uc.total_checkins > 0;

-- Verify the fix
SELECT 
  uc.fid,
  uc.username,
  uc.total_checkins as current_total,
  COALESCE(ch.actual_count, 0) as actual_count,
  CASE 
    WHEN uc.total_checkins = COALESCE(ch.actual_count, 0) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM users_checkins uc
LEFT JOIN (
  SELECT fid, COUNT(*) as actual_count
  FROM checkin_history
  GROUP BY fid
) ch ON uc.fid = ch.fid
ORDER BY uc.fid;
