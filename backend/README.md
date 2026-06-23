# Backend XAMPP untuk Aplikasi Pelaporan Warga

## Langkah pemasangan

1. Buka XAMPP Control Panel
2. Jalankan Apache dan MySQL
3. Copy seluruh folder `backend` ke dalam folder XAMPP `htdocs`, misalnya:
   - `C:\xampp\htdocs\laporan-api`
4. Buat file konfigurasi `backend/.env` (copy dari `backend/.env.example`) lalu isi koneksi DB dan SMTP.
5. Import schema ke database MySQL:
   - Buka `http://localhost/phpmyadmin`
   - Pilih tab SQL
   - Copy dan jalankan isi `schema.sql`

## Akses API

- `GET http://localhost/laporan-api/categories.php`
- `GET http://localhost/laporan-api/reports.php`
- `GET http://localhost/laporan-api/reports.php?id=<report_id>`
- `POST http://localhost/laporan-api/reports.php`
- `PUT http://localhost/laporan-api/reports.php?id=<report_id>&actorId=<user_id>`
- `DELETE http://localhost/laporan-api/reports.php?id=<report_id>&actorId=<pemilik_user_id>`
- `POST http://localhost/laporan-api/auth.php?action=login`
- `POST http://localhost/laporan-api/auth.php?action=register`
- `POST http://localhost/laporan-api/auth.php?action=forgot-password-request`
- `POST http://localhost/laporan-api/auth.php?action=forgot-password-reset`
- `GET http://localhost/laporan-api/users.php?actorId=<user_id>`
- `GET http://localhost/laporan-api/users.php?actorId=<user_id>&id=<target_user_id>`
- `POST http://localhost/laporan-api/users.php`
- `PUT http://localhost/laporan-api/users.php?id=<target_user_id>`
- `PUT http://localhost/laporan-api/users.php?id=<target_user_id>&action=password`
- `PUT http://localhost/laporan-api/users.php?id=<target_user_id>&action=admin-reset-password`

## Struktur data laporan

Gunakan header `Content-Type: application/json`

Contoh body `POST`:

```json
{
  "id": "123",
  "userId": "2",
  "userName": "Budi Santoso",
  "title": "Jalan Berlubang di RT 05",
  "description": "Deskripsi...",
  "category": "Infrastruktur",
  "location": "Jl. Merdeka RT 05 RW 03",
  "status": "menunggu",
  "photos": ["data:image/png;base64,..."],
  "progress": [
    {
      "id": "1",
      "status": "Laporan Diterima",
      "note": "Laporan telah diterima",
      "createdAt": "2026-05-01T08:30:00",
      "createdBy": "System"
    }
  ],
  "createdAt": "2026-05-01T08:30:00",
  "updatedAt": "2026-05-01T08:30:00"
}
```

## Catatan

- Jika `Access-Control-Allow-Origin` dibutuhkan, PHP sudah menyiapkannya.
- Jika database Anda menggunakan password, sesuaikan koneksi di `db.php`.
- Password akun bawaan pada `schema.sql` masih plain text untuk bootstrap awal, lalu otomatis di-hash saat login pertama.
- Endpoint `forgot-password-request` sekarang mengirim kode reset langsung via SMTP dan tidak lagi menampilkan kode di response API.
- Laporan sekarang dipaksa tersimpan ke server (tidak dianggap sukses jika API gagal), agar langsung terlihat di akun lain.
- Update/hapus laporan oleh warga sekarang divalidasi berdasarkan `actorId` agar hanya pemilik yang bisa mengubah laporannya sendiri.

## Upgrade DB Untuk Laporan Dengan Foto Besar

Jika tabel `reports` sudah terlanjur dibuat dengan tipe `TEXT`, jalankan SQL ini sekali:

```sql
ALTER TABLE reports
  MODIFY photos LONGTEXT NOT NULL,
  MODIFY progress LONGTEXT NOT NULL;
```

## Konfigurasi SMTP

Isi `backend/.env` dengan variabel berikut:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_ENCRYPTION=tls
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Sistem Pelaporan Warga
SMTP_TIMEOUT=15
```

Contoh untuk Gmail:

- Aktifkan 2-Step Verification.
- Buat App Password.
- Gunakan App Password itu di `SMTP_PASSWORD` (bukan password login Gmail biasa).
