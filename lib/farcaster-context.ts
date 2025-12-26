export interface FarcasterUser {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
  custody?: string
}

/**
 * Parse Farcaster user context from frame message
 * This receives trusted user data from Farcaster
 */
export function parseFarcasterUser(untrustedData: any): FarcasterUser | null {
  if (!untrustedData?.fid) return null

  return {
    fid: untrustedData.fid,
    username: untrustedData.username,
    displayName: untrustedData.displayName,
    pfpUrl: untrustedData.profileImage,
    custody: untrustedData.custodyAddress,
  }
}
