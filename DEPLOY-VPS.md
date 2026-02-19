# 🚀 Tutorial Deploy Discord Bot ke VPS

Panduan lengkap untuk deploy bot Discord ini ke VPS (Virtual Private Server) menggunakan Ubuntu/Debian.

---

## 📋 Persyaratan

- VPS dengan OS **Ubuntu 20.04 / 22.04** (atau Debian)
- Akses SSH ke VPS
- Domain atau IP publik VPS
- Bot Discord sudah dibuat di [Discord Developer Portal](https://discord.com/developers/applications)
- MongoDB Atlas (gratis) atau MongoDB yang diinstall di VPS

---

## Langkah 1 — Masuk ke VPS via SSH

Buka terminal di komputer kamu, lalu masuk ke VPS:

```bash
ssh root@IP_VPS_KAMU
```

Contoh:
```bash
ssh root@123.456.789.000
```

Masukkan password VPS kamu jika diminta.

---

## Langkah 2 — Update Sistem & Install Node.js 20

Setelah masuk ke VPS, jalankan perintah berikut satu per satu:

```bash
# Update daftar paket
apt update && apt upgrade -y

# Install curl (jika belum ada)
apt install -y curl git

# Install Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Cek versi Node.js (harus 20.x)
node -v

# Cek versi npm
npm -v
```

---

## Langkah 3 — Install PM2 (Process Manager)

PM2 digunakan agar bot tetap berjalan meskipun terminal ditutup, dan otomatis restart jika crash.

```bash
npm install -g pm2
```

---

## Langkah 4 — Upload Kode Bot ke VPS

### Opsi A: Menggunakan Git (Direkomendasikan)

Jika kode kamu sudah di GitHub/GitLab:

```bash
# Pindah ke folder home
cd /home

# Clone repository kamu
git clone https://github.com/USERNAME/NAMA_REPO.git bot-discord

# Masuk ke folder bot
cd bot-discord
```

### Opsi B: Upload Manual via SCP

Dari komputer lokal kamu (bukan di VPS), jalankan:

```bash
scp -r "d:/bot dc" root@IP_VPS_KAMU:/home/bot-discord
```

Lalu masuk ke folder di VPS:
```bash
cd /home/bot-discord
```

---

## Langkah 5 — Install Dependensi

Di dalam folder bot, jalankan:

```bash
npm install
```

---

## Langkah 6 — Buat File .env

Buat file `.env` berisi konfigurasi bot:

```bash
nano .env
```

Isi dengan data kamu (tekan `i` untuk mulai mengetik di nano):

```env
DISCORD_TOKEN=token_bot_discord_kamu
CLIENT_ID=client_id_aplikasi_discord_kamu
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/botdb
NODE_ENV=production
```

Simpan file:
- Tekan `Ctrl + X`
- Tekan `Y`
- Tekan `Enter`

> **Cara dapat DISCORD_TOKEN dan CLIENT_ID:**
> 1. Buka [Discord Developer Portal](https://discord.com/developers/applications)
> 2. Pilih aplikasi bot kamu
> 3. **CLIENT_ID** = Application ID (ada di halaman General Information)
> 4. **DISCORD_TOKEN** = Pergi ke tab **Bot** → klik **Reset Token** → copy token

> **Cara dapat MONGO_URI (MongoDB Atlas gratis):**
> 1. Daftar di [mongodb.com/atlas](https://www.mongodb.com/atlas)
> 2. Buat cluster gratis (M0)
> 3. Buat database user dan whitelist IP `0.0.0.0/0`
> 4. Klik **Connect** → **Drivers** → copy connection string
> 5. Ganti `<password>` dengan password database user kamu

---

## Langkah 7 — Daftarkan Slash Commands

Jalankan perintah ini sekali untuk mendaftarkan semua slash command ke Discord:

```bash
npm run deploy
```

Output yang benar:
```
Registering 10 commands...
Successfully registered 10 global commands
```

> ⚠️ **Catatan:** Command global butuh waktu hingga **1 jam** untuk muncul di semua server.
> Untuk testing cepat, tambahkan `DEV_GUILD_ID=ID_SERVER_KAMU` di file `.env` sebelum jalankan deploy.

---

## Langkah 8 — Jalankan Bot dengan PM2

```bash
# Jalankan bot
pm2 start src/index.js --name "discord-bot"

# Lihat status bot
pm2 status

# Lihat log bot secara live
pm2 logs discord-bot
```

Output `pm2 status` yang benar:
```
┌─────┬──────────────┬─────────┬──────┬───────────┬──────────┐
│ id  │ name         │ mode    │ ↺    │ status    │ cpu      │
├─────┼──────────────┼─────────┼──────┼───────────┼──────────┤
│ 0   │ discord-bot  │ fork    │ 0    │ online    │ 0%       │
└─────┴──────────────┴─────────┴──────┴───────────┴──────────┘
```

---

## Langkah 9 — Auto-Start saat VPS Reboot

Agar bot otomatis jalan kembali setelah VPS restart:

```bash
pm2 startup
```

Perintah ini akan menampilkan sebuah perintah lagi, **copy dan jalankan** perintah tersebut. Contohnya:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

Lalu simpan konfigurasi PM2 saat ini:

```bash
pm2 save
```

---

## ✅ Verifikasi Bot Berjalan

1. Buka Discord
2. Pergi ke server yang sudah diundang bot
3. Ketik `/` — seharusnya muncul daftar slash command bot kamu
4. Coba `/setup` untuk inisialisasi konfigurasi server

---

## 🔧 Perintah PM2 yang Berguna

| Perintah | Fungsi |
|----------|--------|
| `pm2 status` | Lihat status semua proses |
| `pm2 logs discord-bot` | Lihat log bot secara live |
| `pm2 restart discord-bot` | Restart bot |
| `pm2 stop discord-bot` | Hentikan bot |
| `pm2 delete discord-bot` | Hapus bot dari PM2 |

---

## 🔄 Update Kode Bot

Jika kamu mengubah kode dan ingin update di VPS:

### Jika pakai Git:
```bash
cd /home/bot-discord
git pull
npm install
pm2 restart discord-bot
```

### Jika upload manual:
```bash
# Upload file baru via SCP dari komputer lokal
scp -r "d:/bot dc/src" root@IP_VPS_KAMU:/home/bot-discord/

# Lalu restart bot di VPS
pm2 restart discord-bot
```

---

## ❗ Troubleshooting

### Bot tidak muncul online di Discord
- Cek log: `pm2 logs discord-bot`
- Pastikan `DISCORD_TOKEN` di `.env` benar
- Pastikan bot sudah diundang ke server dengan permission yang benar

### Slash command tidak muncul
- Jalankan ulang `npm run deploy`
- Tunggu hingga 1 jam untuk command global
- Gunakan `DEV_GUILD_ID` untuk testing instan

### Error koneksi MongoDB
- Pastikan `MONGO_URI` benar
- Pastikan IP VPS sudah di-whitelist di MongoDB Atlas (atau gunakan `0.0.0.0/0`)

### Bot crash terus
- Lihat log error: `pm2 logs discord-bot --err`
- Pastikan semua variabel di `.env` sudah diisi

---

## 🔒 Tips Keamanan

1. **Jangan pernah share** file `.env` atau token bot ke siapapun
2. Gunakan user non-root untuk menjalankan bot di production:
   ```bash
   adduser botuser
   su - botuser
   ```
3. Aktifkan firewall VPS:
   ```bash
   ufw allow ssh
   ufw enable
   ```
