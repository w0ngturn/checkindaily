export async function getFarcasterUsername(fid: number): Promise<string | null> {
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        "x-api-key": process.env.NEYNAR_API_KEY || "",
      },
    })

    if (!response.ok) {
      console.log("[v0] Neynar API error:", response.status)
      return null
    }

    const data = await response.json()
    const user = data.users?.[0]

    if (user?.username) {
      console.log("[v0] Fetched username from Neynar for FID", fid, ":", user.username)
      return user.username
    }

    return null
  } catch (error) {
    console.error("[v0] Error fetching username from Neynar:", error)
    return null
  }
}
