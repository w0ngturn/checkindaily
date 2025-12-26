# CHECKIN - Farcaster Mini Apps Deployment Guide

## Overview
CHECKIN adalah Web3 activity layer yang rewards presence. Panduan ini akan memandu kamu step-by-step untuk deploy ke Farcaster Mini Apps marketplace.

---

## STEP 1: Verifikasi App Configuration

Sebelum submit, pastikan semua konfigurasi sudah benar:

### 1.1 Verify Domain Connection
```bash
# Test domain accessibility
curl -I https://checkindaily.xyz/
# Output: HTTP/1.1 200 OK
```

### 1.2 Verify Frame Metadata
Buka https://checkindaily.xyz/ di browser, buka DevTools → Elements, dan cari:
```html
<meta property="og:image" content="https://checkindaily.xyz/og.jpg" />
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://checkindaily.xyz/image.jpg" />
```

### 1.3 Verify Webhook Endpoint
```bash
# Test webhook dengan curl
curl -X POST https://checkindaily.xyz/api/checkin \
  -H "Content-Type: application/json" \
  -d '{"fid": 1937520}'
```

**Status Check:**
- [ ] Domain accessible dan menampilkan frame
- [ ] Meta tags lengkap
- [ ] Webhook responds 200/201

---

## STEP 2: Prepare Frame Manifest

Frame manifest adalah JSON file yang mendefinisikan frame configuration untuk Farcaster Hub.

### 2.1 Create frame-manifest.json
File sudah di-create di `public/frame-manifest.json`:

```json
{
  "frame": {
    "name": "CHECKIN",
    "version": "1",
    "homeUrl": "https://checkindaily.xyz/",
    "imageUrl": "https://checkindaily.xyz/image.jpg",
    "splashImageUrl": "https://checkindaily.xyz/splash.png",
    "splashBackgroundColor": "#050b1f",
    "webhookUrl": "https://checkindaily.xyz/api/checkin",
    "iconUrl": "https://checkindaily.xyz/og.jpg",
    "primaryCategory": "social",
    "description": "CHECKIN is a Web3 activity layer that rewards presence. Every check‑in proves consistency and unlocks on‑chain incentives.",
    "subtitle": "Check in daily. Build streaks. Get rewarded.",
    "tags": ["community", "social", "rewards"]
  },
  "accountAssociation": {
    "header": "eyJmaWQiOjE5Mzc1MjAsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg2YTkyNDVCRGQ2NzdlYWZGYkM4MDhCODY2MEE2MTJGYkUxRjhmOTBhIn0",
    "payload": "eyJkb21haW4iOiJodHRwczovL2NoZWNraW5kYWlseS54eXovIn0",
    "signature": "dS5LrJIQaJILi+wB+xcw8V9zjLtICsRElvSoBl+0GWs3wS07+x26Xxj43xM2oMLdtNFekJ+TMWnWpDYm6qo4uhw="
  }
}
```

### 2.2 Verify Image Assets
Pastikan semua image file exist:
- ✓ `public/og.jpg` - OpenGraph preview image
- ✓ `public/image.jpg` - Frame image (1200x628px)
- ✓ `public/splash.png` - Splash screen image

---

## STEP 3: Test Frame di Farcaster Dev Client

### 3.1 Install Farcaster Dev Client
Download dari: https://warpcast.com/~/developers

### 3.2 Test Frame Locally/Production
1. Buka Warpcast Dev Client
2. Compose new cast
3. Paste frame URL: `https://checkindaily.xyz/`
4. Verifikasi:
   - [ ] Frame loads tanpa error
   - [ ] Buttons responsive
   - [ ] Check-in functionality works
   - [ ] Splash screen appears correctly
   - [ ] Streaks display correct data

### 3.3 Test on Different Devices
- [ ] Desktop browser
- [ ] Mobile browser
- [ ] Farcaster mobile app

---

## STEP 4: Submit ke Farcaster Hub

### 4.1 Access Farcaster Hub
1. Buka: https://hub.farcaster.xyz/
2. Login dengan Farcaster account kamu (FID: 1937520)

### 4.2 Register Frame
Di Hub dashboard:
1. Klik **"Add Frame"** atau **"Register Mini App"**
2. Isi form dengan details:

**Frame Information:**
- **Name**: CHECKIN
- **Description**: CHECKIN is a Web3 activity layer that rewards presence. Every check-in proves consistency and unlocks on-chain incentives.
- **URL**: https://checkindaily.xyz/
- **Webhook URL**: https://checkindaily.xyz/api/checkin/
- **Category**: Social / Engagement / Rewards
- **Icon URL**: https://checkindaily.xyz/og.jpg

**Account Association** (optional):
- Copy content dari `frame-manifest.json` → `accountAssociation` section

### 4.3 Upload Manifest
1. Copy JSON dari `public/frame-manifest.json`
2. Paste ke Hub form atau upload file
3. Hub akan validate manifest

### 4.4 Submit for Review
- Klik **"Submit"** untuk review process
- Farcaster team akan verify frame functionality
- Timeline: biasanya 24-48 jam

---

## STEP 5: Monitor & Update

### 5.1 Check Submission Status
Di Hub dashboard, kamu bisa lihat:
- Submission status (Pending, Approved, Rejected)
- Error messages jika ada
- Analytics (engagement, users, etc)

### 5.2 If Rejected
Common rejection reasons:
1. **Invalid webhook response** - Pastikan webhook mengembalikan valid frame response
2. **Broken image URLs** - Verify semua image URLs accessible
3. **Missing metadata** - Pastikan semua required meta tags present
4. **Spam/inappropriate content** - Review frame content compliance

**Fix & Resubmit:**
1. Fix issues
2. Redeploy ke Vercel
3. Resubmit ke Hub

### 5.3 Post-Approval
Setelah approved:
- Frame akan appear di Farcaster Mini Apps marketplace
- Users bisa discover dan use frame
- Monitor analytics & user feedback

---

## STEP 6: Post-Launch Optimization

### 6.1 Monitor Metrics
Track di admin dashboard (`/admin`):
- Daily active users
- Check-in success rate
- Top streakers
- Reward distribution

### 6.2 Community Engagement
1. Share frame di Farcaster community channels
2. Create content demonstrating streaks & rewards
3. Build community around daily check-ins
4. Engage dengan users & collect feedback

### 6.3 Continuous Improvement
- Monitor user feedback
- Fix bugs quickly
- Add new features based on demand
- Keep checking Farcaster docs untuk updates

---

## TROUBLESHOOTING

### Frame tidak load
```
Solution:
1. Check domain accessible: curl https://checkindaily.xyz/
2. Check meta tags present in HTML
3. Check image URLs accessible
4. Check browser console untuk errors
```

### Webhook returning errors
```
Solution:
1. Check API logs di Vercel
2. Verify FID parsing dari frame context
3. Check Supabase connection
4. Test dengan sample payload
```

### Images not displaying
```
Solution:
1. Verify image files exist di public/
2. Check CORS settings
3. Verify correct image URLs di meta tags
4. Use proper aspect ratio (1.91:1 recommended)
```

### Account Association failing
```
Solution:
1. Verify domain matches payload
2. Check signature validity
3. Use correct FID in header
4. Regenerate if needed
```

---

## Checklist Sebelum Submit

- [ ] Domain terkoneksi & accessible
- [ ] Semua image assets present & correct
- [ ] Frame metadata lengkap di HTML
- [ ] Webhook endpoint responding
- [ ] Tested di Farcaster dev client
- [ ] Frame displays correctly on mobile
- [ ] All buttons functional
- [ ] Database connected & working
- [ ] Admin dashboard configured
- [ ] Privacy policy & terms updated
- [ ] Frame manifest valid JSON
- [ ] No console errors

---

## Next Steps Setelah Launch

1. **Day 1-7**: Monitor user feedback, fix critical bugs
2. **Week 2**: Analyze usage patterns, optimize based on analytics
3. **Month 1**: Build community, create content, promote frame
4. **Ongoing**: Add features, improve UX, grow user base

---

## Resources

- Farcaster Frames Docs: https://docs.farcaster.xyz/reference/frames/spec
- Farcaster Hub: https://hub.farcaster.xyz/
- Warpcast: https://warpcast.com/
- CHECKIN App: https://checkindaily.xyz/
- Admin Dashboard: https://checkindaily.xyz/admin

---

**CHECKIN adalah frame pertamamu di Farcaster! Semoga sukses! 🚀**
