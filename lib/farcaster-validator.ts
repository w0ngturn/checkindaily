import { verifyMessage } from "viem"
import { hexToBytes } from "viem/utils"

export async function validateFarcaster(body: any) {
  try {
    const trusted = body?.trustedData
    const untrusted = body?.untrustedData

    if (!trusted || !untrusted) {
      console.log("[v0] Missing trusted or untrusted data")
      return null
    }

    const isValid = await verifyMessage({
      address: untrusted.address,
      message: hexToBytes(trusted.messageBytes),
      signature: trusted.signature,
    })

    if (!isValid) {
      console.log("[v0] Message signature verification failed")
      return null
    }

    return {
      fid: untrusted.fid,
      address: untrusted.address,
      username: untrusted.username,
      displayName: untrusted.displayName,
      pfpUrl: untrusted.pfpUrl,
    }
  } catch (error) {
    console.error("[v0] Farcaster validation error:", error)
    return null
  }
}
