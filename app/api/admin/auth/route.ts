import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    // For now, we check for a specific admin FID or API key
    const adminFid = process.env.ADMIN_FID
    const authHeader = req.headers.get("authorization")

    // If no ADMIN_FID is configured, deny access
    if (!adminFid) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 401 })
    }

    // If authorization header exists, validate it contains the admin FID
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "")
      if (token === adminFid) {
        return NextResponse.json({ authorized: true }, { status: 200 })
      }
    }

    // No valid authorization provided
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } catch (error) {
    console.error("[admin] Auth error:", error)
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const adminFid = process.env.ADMIN_FID

    if (!adminFid) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 401 })
    }

    const body = await req.json()
    const { fid } = body

    if (fid && fid.toString() === adminFid.toString()) {
      return NextResponse.json({ authorized: true }, { status: 200 })
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } catch (error) {
    console.error("[admin] Auth error:", error)
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 })
  }
}
