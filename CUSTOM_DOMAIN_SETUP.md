# Setup Custom Domain checkindaily.xyz

## Status Checklist

Sebelum domain fully connected, verify:

### 1. **Di Vercel Dashboard**
- [ ] Project sudah ditambahkan ke Vercel
- [ ] Domain `checkindaily.xyz` sudah di-add di Settings → Domains
- [ ] Status domain terlihat di Vercel (pending atau verified)

### 2. **DNS Records di Registrar**
Kamu harus add DNS records ini di registrar (GoDaddy, Namecheap, etc):

```
A Record:
- Host: @
- Value: 76.76.19.165
- TTL: 3600

CNAME Record:
- Host: www
- Value: cname.vercel-dns.com
- TTL: 3600
```

### 3. **Verify DNS Propagation**
Gunakan tools ini untuk check DNS status:
- https://www.whatsmydns.net/
- https://dns.google/

### 4. **Waiting Period**
- First propagation: bisa 5 menit - 24 jam
- Vercel SSL certificate: 5-10 menit setelah DNS propagate
- Full setup: maksimal 48 jam

## Step-by-Step Setup

### A. Di Vercel
1. Login ke https://vercel.com
2. Pilih project "checkin-xyz"
3. Ke **Settings** → **Domains**
4. Klik **Add**
5. Masukkan: `checkindaily.xyz`
6. Vercel akan show DNS records yang diperlukan

### B. Di Registrar Domain (contoh Namecheap)
1. Login ke Namecheap.com
2. Pilih domain `checkindaily.xyz`
3. Ke **Advanced DNS** atau **Manage DNS**
4. Hapus existing records (biasanya default Namecheap)
5. Add records dari Vercel:
   - A record: @ → 76.76.19.165
   - CNAME record: www → cname.vercel-dns.com
6. **Save changes**

### C. Tunggu Propagation
- Check status di: https://www.whatsmydns.net/
- Masukkan domain: checkindaily.xyz
- Tunggu semua berubah ke green

## Troubleshooting

### Domain masih 404?
- [ ] DNS records sudah tersimpan di registrar?
- [ ] TTL sudah expired? (tunggu 3600 detik)
- [ ] Vercel menunjukkan domain pending atau error?
- [ ] Check DNS propagation di whatsmydns.net

### SSL Certificate tidak auto-generate?
- Tunggu 10 menit setelah DNS propagate
- Refresh Vercel dashboard
- Klik "Refresh" di domain settings

### Masih error?
Contact:
- Registrar support (jika DNS tidak bekerja)
- Vercel support (jika domain sudah DNS-linked tapi masih 404)

## Setelah Domain Connected

Update semua references dari `checkin-xyz.vercel.app` ke `checkindaily.xyz`:

1. **Frame Manifest** (`public/frame-manifest.json`)
2. **Environment variables** di Vercel (jika ada hardcoded URLs)
3. **Farcaster Frame submission** dengan URL baru
