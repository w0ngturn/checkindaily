# Setting Up ADMIN_FID Environment Variable

## Step 1: Find Your Farcaster ID (FID)

Your FID adalah unique identifier di Farcaster network. Caranya dapatkan:

1. **Via Warpcast**
   - Buka https://warpcast.com
   - Login dengan akun Farcaster kamu
   - Klik profil kamu di top-right
   - FID akan terlihat di URL: `warpcast.com/username` atau search untuk `fid: xxx` di profil

2. **Via Farcaster Hub**
   - Visit https://hub.farcaster.xyz
   - Search username kamu
   - FID akan terlihat di user profile

3. **Via Console pada CHECKIN app**
   - Saat check-in, lihat debug logs (F12 > Console)
   - Cari `[v0] FID detected:` untuk lihat FID kamu

## Step 2: Set ADMIN_FID di Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Pilih project "checkin-xyz" (atau nama project kamu)

2. **Go to Settings → Environment Variables**
   - Klik "Settings" tab pada project
   - Pilih "Environment Variables" dari sidebar
   - Klik "+ Add New"

3. **Add ADMIN_FID Variable**
   - **Name**: `ADMIN_FID`
   - **Value**: `[YOUR_FID_HERE]` (hanya angka, contoh: `12345`)
   - **Environments**: Pilih all (Production, Preview, Development)
   - Klik "Save"

4. **Redeploy Project**
   - Pergi ke "Deployments" tab
   - Klik "Redeploy" pada latest deployment
   - Atau trigger redeploy dengan push baru ke repo

## Step 3: Verify Admin Access

1. Deploy ulang selesai
2. Buka https://checkin-xyz.vercel.app/admin
3. Kamu seharusnya bisa akses admin dashboard
4. Jika muncul "Unauthorized", cek:
   - ADMIN_FID sudah di-set dengan benar
   - FID value sudah match dengan FID mu
   - Deployment sudah selesai dengan env var baru

## Notes

- ADMIN_FID hanya digunakan untuk protect route `/admin`
- Hanya FID yang match bisa akses admin dashboard
- Bisa add multiple admins dengan update logic di `/app/api/admin/auth/route.ts`

## Troubleshooting

- **"Unauthorized" error**: Cek FID value di env var, pastikan sama dengan FID mu
- **Still not working**: Clear browser cache dan coba lagi (Ctrl+Shift+Del)
- **Can't find FID**: Search di https://warpcast.com atau https://hub.farcaster.xyz
