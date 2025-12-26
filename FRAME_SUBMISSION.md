# CHECKIN Frame Submission Guide

## Farcaster Frame Information

### Frame Details
- **Name:** CHECKIN
- **URL:** https://checkin-xyz.vercel.app
- **Category:** Social / Productivity
- **Status:** Ready for Submission

### Frame Description
CHECKIN rewards consistency. Check in daily, build streaks, earn on-chain rewards. Track your daily activity, compete on leaderboards, and earn points for maintaining streaks.

### Key Features
- Daily check-in system with streak tracking
- Points and rewards system based on streak length
- Community leaderboard showing top performers
- Share streak achievements to Farcaster
- Push notifications for reminders
- Admin dashboard for management

### Frame Endpoints
- **Main Frame:** https://checkin-xyz.vercel.app
- **Check-in Endpoint:** https://checkin-xyz.vercel.app/api/checkin
- **Leaderboard Endpoint:** https://checkin-xyz.vercel.app/api/leaderboard
- **User Streak Endpoint:** https://checkin-xyz.vercel.app/api/user/streak
- **Rewards Endpoint:** https://checkin-xyz.vercel.app/api/user/rewards

### Metadata Tags
The frame includes proper Open Graph tags for preview:
```html
<meta property="og:title" content="CHECKIN — Daily Activity Rewards" />
<meta property="og:description" content="CHECKIN rewards consistency. Check in daily, build streaks, earn on-chain rewards." />
<meta property="og:image" content="https://checkin-xyz.vercel.app/og.png" />
<meta property="og:url" content="https://checkin-xyz.vercel.app" />
```

### Legal & Compliance
- **Privacy Policy:** https://checkin-xyz.vercel.app/privacy
- **Terms of Service:** https://checkin-xyz.vercel.app/terms
- **Support:** Contact via Farcaster DMs to @checkin

## Pre-Submission Checklist

- [ ] Frame URL is publicly accessible and responding
- [ ] Check-in button works correctly in Farcaster
- [ ] Leaderboard loads without errors
- [ ] Share functionality posts to Farcaster timeline
- [ ] Privacy Policy page accessible at /privacy
- [ ] Terms of Service page accessible at /terms
- [ ] Admin dashboard protected with ADMIN_FID
- [ ] Database is stable with all migrations run
- [ ] Environment variables configured in Vercel
- [ ] Frame metadata properly set in layout.tsx
- [ ] No console errors or warnings

## Submission Steps

### 1. Prepare Documentation
- Create frame.json configuration (see below)
- Document all endpoints and APIs
- Prepare screenshots for store listing

### 2. Submit to Farcaster Hub
- Go to [Farcaster Hub](https://hub.farcaster.xyz)
- Navigate to Developer Tools → Register Frame
- Fill in frame details:
  - Title: CHECKIN
  - Description: Rewards consistency. Check in daily, build streaks, earn points
  - URL: https://checkin-xyz.vercel.app
  - Category: Social / Productivity
  - Privacy Policy: https://checkin-xyz.vercel.app/privacy
  - Terms: https://checkin-xyz.vercel.app/terms

### 3. Testing Before Review
- Test in Farcaster Dev client (web)
- Test in Farcaster Mobile (iOS/Android)
- Test check-in flow end-to-end
- Verify leaderboard renders correctly
- Check share functionality

### 4. Monitor Submission Status
- Wait for Farcaster team review (typically 3-5 days)
- Respond to any feedback or requests
- Be ready to deploy fixes if needed

## Frame Configuration JSON (frame.json)

Place this in your public folder at `/public/frame.json`:

```json
{
  "name": "CHECKIN",
  "description": "CHECKIN rewards consistency. Check in daily, build streaks, earn on-chain rewards.",
  "url": "https://checkin-xyz.vercel.app",
  "splashImageUrl": "https://checkin-xyz.vercel.app/splash.png",
  "splashBackgroundColor": "#0e1b52",
  "linkedinUrl": "https://linkedin.com/company/checkin",
  "twitterUrl": "https://twitter.com/checkin",
  "webhookUrl": "https://checkin-xyz.vercel.app/api/webhook",
  "version": "1.0.0",
  "createdAt": "2024-12-26T00:00:00Z",
  "updatedAt": "2024-12-26T00:00:00Z"
}
```

## After Approval

Once approved:
1. Frame will be listed in Farcaster miniapps marketplace
2. Users can add CHECKIN from their Farcaster profile
3. Begin marketing and promotion
4. Monitor usage and gather feedback
5. Plan feature updates based on community feedback

## Support & Updates

For questions or issues during submission:
- Check Farcaster developer documentation
- Reference Farcaster team on Hub
- Iterate on feedback quickly
- Deploy updates and resubmit if needed
