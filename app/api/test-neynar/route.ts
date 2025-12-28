import { type NextRequest, NextResponse } from "next/server"

const CHECKINXYZ_FID = 1937520

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userFid = searchParams.get("fid")

  if (!userFid) {
    return NextResponse.json({ error: "Missing fid parameter" }, { status: 400 })
  }

  const apiKey = process.env.NEYNAR_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "NEYNAR_API_KEY not configured" }, { status: 500 })
  }

  try {
    // Test with user/bulk endpoint
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${CHECKINXYZ_FID}&viewer_fid=${userFid}`

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      status: response.status,
      url,
      apiKeyExists: !!apiKey,
      apiKeyPrefix: apiKey.substring(0, 8) + "...",
      response: data,
      viewerContext: data?.users?.[0]?.viewer_context || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
