import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const viewerFid = url.searchParams.get("viewer_fid") || "880415" // default test FID
  const targetUsername = url.searchParams.get("target") || "checkinxyz"

  const neynarApiKey = process.env.NEYNAR_API_KEY
  if (!neynarApiKey) {
    return NextResponse.json({ error: "Neynar API not configured" }, { status: 500 })
  }

  try {
    // Method 1: by_username with viewer_fid
    const response1 = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${targetUsername}&viewer_fid=${viewerFid}`,
      {
        headers: {
          accept: "application/json",
          "x-api-key": neynarApiKey,
        },
      },
    )
    const data1 = await response1.json()

    // Method 2: Check followers of checkinxyz to see if viewer is in list
    const targetFid = data1.user?.fid
    let followerCheck = null

    if (targetFid) {
      const response2 = await fetch(`https://api.neynar.com/v2/farcaster/followers?fid=${targetFid}&limit=100`, {
        headers: {
          accept: "application/json",
          "x-api-key": neynarApiKey,
        },
      })
      const data2 = await response2.json()
      const isInFollowers = data2.users?.some((u: any) => u.fid === Number.parseInt(viewerFid))
      followerCheck = {
        totalFollowers: data2.users?.length || 0,
        isInFollowers,
        firstFewFollowers: data2.users?.slice(0, 5).map((u: any) => ({ fid: u.fid, username: u.username })),
      }
    }

    // Method 3: Check following of viewer to see if target is in list
    const response3 = await fetch(`https://api.neynar.com/v2/farcaster/following?fid=${viewerFid}&limit=100`, {
      headers: {
        accept: "application/json",
        "x-api-key": neynarApiKey,
      },
    })
    const data3 = await response3.json()
    const followingCheck = {
      totalFollowing: data3.users?.length || 0,
      isFollowingTarget: data3.users?.some((u: any) => u.fid === targetFid),
      firstFewFollowing: data3.users?.slice(0, 5).map((u: any) => ({ fid: u.fid, username: u.username })),
    }

    return NextResponse.json({
      viewerFid,
      targetUsername,
      targetFid,
      method1_byUsername: {
        viewerContext: data1.user?.viewer_context,
        following: data1.user?.viewer_context?.following,
        followedBy: data1.user?.viewer_context?.followed_by,
      },
      method2_followerCheck: followerCheck,
      method3_followingCheck: followingCheck,
      rawUserData: data1.user,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
