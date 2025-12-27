export async function getUsernameFromNeynar(fid: number): Promise<string | null> {
  try {
    const response = await fetch(`/api/get-farcaster-username?fid=${fid}`)
    if (!response.ok) return null
    const data = await response.json()
    return data.username || null
  } catch (error) {
    console.error("[v0] Error fetching username:", error)
    return null
  }
}
