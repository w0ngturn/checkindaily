import { createServerClient } from "@supabase/ssr"

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  })

  console.log("[v0] Running migrations...")

  try {
    // Migration 1: Create checkin schema
    await supabase.rpc("exec", {
      sql: `
        CREATE TABLE IF NOT EXISTS users_checkins (
          fid BIGINT PRIMARY KEY,
          last_checkin TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          streak_count INT DEFAULT 0,
          total_checkins INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS checkin_history (
          id SERIAL PRIMARY KEY,
          fid BIGINT NOT NULL REFERENCES users_checkins(fid),
          checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          streak_at_time INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_rewards (
          fid BIGINT PRIMARY KEY REFERENCES users_checkins(fid),
          total_points INT DEFAULT 0,
          tier VARCHAR(20) DEFAULT 'bronze',
          multiplier FLOAT DEFAULT 1.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reward_history (
          id SERIAL PRIMARY KEY,
          fid BIGINT NOT NULL REFERENCES users_checkins(fid),
          points_earned INT DEFAULT 0,
          streak_at_time INT DEFAULT 0,
          multiplier FLOAT DEFAULT 1.0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    console.log("[v0] Database setup completed!")
  } catch (error) {
    console.error("[v0] Database setup failed:", error)
  }
}

setupDatabase()
