# Sistem Pelaporan Pengaduan Warga Desa

![CI](https://github.com/aulixca/Pelaporan-Pengaduan-Warga-Desa/actions/workflows/test.yml/badge.svg)
![coverage](https://raw.githubusercontent.com/aulixca/Pelaporan-Pengaduan-Warga-Desa/main/.github/badges/coverage.svg)

Website pelaporan pengaduan warga berbasis web dengan dua peran (Admin & Warga).

## Fitur

- **Warga:** Registrasi, login, buat laporan pengaduan, riwayat laporan, detail laporan, edit laporan, profil
- **Admin:** Dashboard, kelola laporan (verifikasi/tindak lanjut/selesai/tolak), detail laporan, manajemen kategori, kelola akun

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS 4, MUI 7, shadcn/ui (Radix UI), React Router, Recharts

**Backend:** PHP native REST API, MySQL

## Menjalankan Proyek

```bash
# Install dependencies
npm i

# Jalankan dev server (http://localhost:5173)
npm run dev

# Build production
npm run build
```

## Backend (PHP)

Backend API ada di folder `backend/`. Import `schema.sql` ke MySQL, lalu atur koneksi database di `backend/db.php`.

## Struktur Proyek

```
src/
├── components/      # Layout components (sidebar)
├── contexts/        # Auth context
├── pages/
│   ├── admin/       # Halaman admin
│   └── warga/       # Halaman warga
├── styles/          # Global CSS
└── utils/           # API helpers & mock data
backend/
├── auth.php         # Login/register API
├── reports.php      # CRUD laporan
├── categories.php   # Manajemen kategori
├── users.php        # Manajemen user
├── db.php           # Koneksi database
└── schema.sql       # Struktur database
```
