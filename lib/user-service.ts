import { createSupabaseServerClient } from "./supabase-server"
import type { FarcasterUser } from "./farcaster-context"

export interface StoredUser {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
  custodyAddress?: string
  lastSeen: string
}

export async function upsertUser(user: FarcasterUser): Promise<StoredUser | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("users_checkins")
    .upsert(
      {
        fid: user.fid,
        username: user.username,
        display_name: user.displayName,
        pfp_url: user.pfpUrl,
        custody_address: user.custody,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "fid" },
    )
    .select()
    .single()

  if (error || !data) return null

  return {
    fid: data.fid,
    username: data.username,
    displayName: data.display_name,
    pfpUrl: data.pfp_url,
    custodyAddress: data.custody_address,
    lastSeen: data.last_seen,
  }
}

export async function getUser(fid: number): Promise<StoredUser | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("users_checkins")
    .select("fid, username, display_name, pfp_url, custody_address, last_seen")
    .eq("fid", fid)
    .single()

  if (error || !data) return null

  return {
    fid: data.fid,
    username: data.username,
    displayName: data.display_name,
    pfpUrl: data.pfp_url,
    custodyAddress: data.custody_address,
    lastSeen: data.last_seen,
  }
}
