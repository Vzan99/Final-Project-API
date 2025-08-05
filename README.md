# Final Project: Job Board App

## Deskripsi Singkat

Job Board App adalah platform yang menghubungkan pencari kerja dengan perusahaan. Aplikasi ini mendukung fitur lengkap seperti posting lowongan, lamaran kerja, CV generator, skill assessment, dan sistem subscription berbayar.

Proyek ini dikerjakan oleh 2 developer dengan pembagian fitur sesuai role: **User**, **Admin (Perusahaan)**, dan **Developer (Tim App)**.

---

## Repository

- **Backend (Express, PostgreSQL, Prisma)**  
  [Final-Project-API](https://github.com/Vzan99/Final-Project-API)

- **Frontend (Next.js, Tailwind, Redux)**  
  [Final-Project-Web](https://github.com/Vzan99/Final-Project-Web)


---

## Fitur Utama

### 1. User Authentication & Profile
- Registrasi sebagai pencari kerja atau perusahaan
- Login menggunakan email dan password
- Verifikasi email dan reset password
- Update profil dan upload foto (validasi format dan ukuran)
- Role-based access: `USER`, `ADMIN`, `DEVELOPER`

### 2. Landing Page & Job Discovery
- Hero section dan fitur job filter
- Preview 5 lowongan terbaru
- Filtering, sorting, dan search berdasarkan lokasi, kategori, dan tanggal
- Halaman detail job dan tombol apply/save
- Detail dan list seluruh perusahaan

### 3. Job Application System
- Upload CV dan input ekspektasi gaji
- Dashboard lamaran (status, detail, jadwal interview)
- Notifikasi interview via email
- Riwayat lamaran lengkap

### 4. Skill Assessment
- Soal multiple choice (25 soal)
- Hanya untuk user subscribed
- Waktu 30 menit, nilai lulus ≥ 75
- Dapat sertifikat PDF dan badge otomatis ke profil
- Sistem verifikasi sertifikat dengan kode QR unik

### 5. Account Subscription System
- 2 Tipe langganan: `STANDARD (25K)` dan `PROFESSIONAL (100K)`
- Akses fitur premium: CV Generator, Skill Assessment, Priority Review
- Metode pembayaran:
  - Upload bukti transfer manual
  - Midtrans Snap (otomatis)
- Masa aktif 30 hari
- Reminder otomatis H-1 via email
- Manual approval oleh developer jika pembayaran manual

### 6. CV Generator
- Khusus untuk user dengan subscription aktif
- Form input tambahan: LinkedIn, Career Summary, dll
- Preview dan download PDF
- Desain CV ATS-friendly

### 7. Company Review
- Ulasan anonim dari user
- Rating aspek: culture, work-life, career path
- Estimasi gaji per posisi
- Hanya untuk user terverifikasi yang bekerja di perusahaan tersebut

### 8. Job Posting Management (Admin)
- CRUD lowongan kerja
- Filtering dan sorting daftar lowongan
- Kelola daftar pelamar dan status lamaran
- Preview CV dan penjadwalan interview
- Email reminder untuk interview H-1

### 9. Analytics Dashboard (Developer/Admin)
- Statistik demografi user: usia, gender, lokasi
- Tren gaji dan minat pelamar
- Statistik subscription dan skill badge

---

## Tech Stack

| Area      | Stack                                                                 |
|-----------|------------------------------------------------------------------------|
| Frontend  | Next.js 13+, TypeScript, TailwindCSS, Redux Toolkit, Formik + Yup     |
| Backend   | Express.js, Node.js, PostgreSQL, Prisma ORM, Zod Validation            |
| Auth      | JWT, Role-based access                                                 |
| Upload    | Multer, Cloudinary                                                     |
| Payment   | Midtrans Snap, Manual proof upload                                     |
| PDF & Badge | React-PDF, QR code verification, custom badge system                |

---

## Setup & Deployment

> Silakan lihat petunjuk instalasi masing-masing di repository:
> - [API Setup](https://github.com/Vzan99/Final-Project-API#readme)
> - [Web Setup](https://github.com/Vzan99/Final-Project-Web#readme)
> - [Vercel](https://precise-web-ochre.vercel.app/)
