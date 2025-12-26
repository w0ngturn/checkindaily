# CHECKIN Mini App - Deployment Guide

## Pre-Deployment Checklist

### Step 1: Environment Variables

Before deploying to Vercel, configure these environment variables in your Vercel project settings:

#### Required Variables (auto-configured with Supabase integration):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase public API key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

#### Required for Admin Dashboard:
- `ADMIN_FID` - Set this to your Farcaster ID (FID) to enable admin dashboard access

**How to set ADMIN_FID:**
1. Go to your [Vercel Dashboard](https://vercel.com)
2. Select your CHECKIN project
3. Go to Settings → Environment Variables
4. Add new variable:
   - Name: `ADMIN_FID`
   - Value: Your Farcaster ID (e.g., `12345`)
5. Select deployment environment (Production recommended)
6. Click "Add"

### Step 2: Database Migrations

Ensure all database migration scripts have been executed in Supabase:

1. Log into [Supabase Dashboard](https://supabase.com)
2. Select your CHECKIN project
3. Go to SQL Editor
4. Run these scripts in order:
   - `scripts/01_create_checkin_schema.sql` - Creates users_checkins, checkin_history, reward_history tables
   - `scripts/02_add_user_profile_fields.sql` - Adds user profile fields
   - `scripts/03_add_rewards_table.sql` - Creates user_rewards and reward_history tables
   - `scripts/04_add_notifications_table.sql` - Creates notification preferences and history

### Step 3: Privacy Policy & Terms

Add these pages to your app:
- `/privacy` - Privacy policy
- `/terms` - Terms of service

These are required for Farcaster marketplace approval.

### Step 4: Frame Configuration

Your frame is configured at:
- URL: `https://checkin-xyz.vercel.app`
- Frame endpoint: `https://checkin-xyz.vercel.app/api/checkin`

The frame metadata is set in `app/layout.tsx` with proper Open Graph tags.

### Step 5: Testing Before Deployment

1. **Local Testing:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` and test check-in functionality

2. **Farcaster Frame Dev Testing:**
   - Use Farcaster Dev Client
   - Test on both web and mobile
   - Verify check-in button works
   - Check leaderboard loads
   - Test share streak functionality

3. **Admin Dashboard:**
   - Visit `https://checkin-xyz.vercel.app/admin`
   - Verify admin authentication works with your ADMIN_FID
   - Check user management features

### Step 6: Deploy to Vercel

1. Click the "Publish" button in v0
2. Verify deployment succeeded
3. Test live at `https://checkin-xyz.vercel.app`

### Step 7: Register with Farcaster

1. Go to [Farcaster Frame Directory](https://hub.farcaster.xyz)
2. Submit your frame:
   - Frame URL: `https://checkin-xyz.vercel.app`
   - Title: CHECKIN
   - Description: Daily Activity Rewards - Check in daily, build streaks, earn on-chain rewards
   - Category: Social/Productivity
3. Add privacy policy link
4. Add terms link
5. Submit for review

## Troubleshooting

### Admin Dashboard Returns 401
- Verify `ADMIN_FID` environment variable is set to your Farcaster ID
- Check that deployment includes the new environment variable

### Database Queries Failing
- Ensure all migration scripts have been run in Supabase SQL Editor
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correctly set

### Frame Not Loading in Farcaster
- Verify frame URL is publicly accessible: `https://checkin-xyz.vercel.app`
- Check that SDK initialization completes (no splash screen issue)
- Test in Farcaster dev client first

## Support

For issues, check:
- Vercel deployment logs
- Farcaster dev console
- Supabase SQL Editor for schema verification
