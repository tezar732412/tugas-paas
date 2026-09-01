# PicPulse - Dynamic Photo Social Media App (Next.js + Supabase + Vercel)

Aplikasi sosial media upload foto dinamis dengan fitur CRUD (Create, Read, Update, Delete) lengkap, manajemen User & Admin, integrasi Supabase (Database, Auth, Storage), serta siap diproduksi (*real production ready*) untuk Vercel.

---

## 🌟 Fitur Utama

### 📱 Bagian User
- **Dynamic Photo Feed**: Tampilan Masonry & Grid responsif untuk melihat foto yang diunggah.
- **Upload Foto & Storage**: Modal upload foto dengan drag & drop preview, judul, deskripsi, dan tag/kategori (Photography, Nature, Urban, Architecture, Art, Travel, Tech).
- **CRUD Operations**:
  - **Create**: Upload foto ke Supabase Storage & catat di PostgreSQL Database `posts`.
  - **Read**: Modal detail foto resolusi tinggi beserta komentar & total suka.
  - **Update**: Edit judul, deskripsi, dan kategori foto milik sendiri.
  - **Delete**: Hapus foto milik sendiri (otomatis dari DB dan Storage).
- **Fitur Interaktif**: Suka (Like/Unlike), sistem Komentar dinamis real-time, filter kategori, dan pencarian cepat.
- **Profil Pengguna**: Halaman profil personal yang menampilkan statistik postingan & suka.

### 🛡️ Bagian Admin (`/admin`)
- **Control Center Analytics**: Pantau total postingan, total pengguna, total suka, estimasi penggunaan storage media, dan status integrasi Supabase.
- **Moderasi Konten Foto**: Tabel moderasi foto untuk menandai foto pilihan (*Featured*), mengedit foto pengguna, atau menghapus postingan yang melanggar aturan.
- **Manajemen Pengguna & Akses Role**: Promosi/demosi role pengguna (`User` <-> `Admin`) dan fitur pembekuan akun (*Suspend/Ban*).
- **Diagnostik Sistem**: Monitoring status koneksi Supabase & panduan deployment Vercel.

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Dev Server
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

> **Catatan Dual-Mode**: Jika Anda belum mengisi kredensial Supabase, aplikasi secara otomatis berjalan dalam **Demo Mode (Offline Local Storage Sync)** sehingga Anda dapat langsung menguji semua fitur upload, CRUD, dan admin secara instan!

---

## ⚡ Langkah Integrasi Supabase & Deployment Vercel

### Langkah 1: Eksekusi SQL Schema di Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka menu **SQL Editor** -> **New Query**
3. Salin dan jalankan seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql)

Skrip SQL tersebut secara otomatis membuat:
- Tabel `profiles`, `posts`, `comments`, `likes`
- Trigger otomatis untuk pendaftaran user baru
- Kebijakan keamanan **Row Level Security (RLS)**
- Bucket Storage `photos` publik untuk foto

### Langkah 2: Konfigurasi Environment Variables
Buat file `.env.local` di root proyek dan tambahkan API Key dari **Project Settings -> API** di Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Langkah 3: Deploy ke Vercel (Production)
1. Push proyek ini ke repository **GitHub / GitLab**.
2. Masuk ke [Vercel Dashboard](https://vercel.com/new) dan **Import** repository Anda.
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**! Proyek sosial media foto Anda langsung online secara publik.

---

## 🛠️ Teknologi yang Digunakan
- **Framework**: Next.js 15 (App Router)
- **UI & Styling**: Tailwind CSS, Glassmorphism, CSS Animations
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Storage, Auth)
- **Language**: TypeScript
