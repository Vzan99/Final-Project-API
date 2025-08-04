Final Project: Job Board App
Deskripsi Singkat
Job Board App adalah platform untuk menghubungkan pencari kerja dengan perusahaan. Aplikasi ini mendukung berbagai fitur seperti posting lowongan, lamaran kerja, CV generator, skill assessment, dan sistem subscription berbayar. Proyek ini dikerjakan oleh 2 developer dengan pembagian fitur sesuai role: User, Admin (Perusahaan), dan Developer (Tim App).

Repository
Backend (Express, PostgreSQL, Prisma): Final-Project-API

Frontend (Next.js, Tailwind, Redux): Final-Project-Web

Fitur Utama
1. User Authentication & Profile
Registrasi: sebagai pencari kerja atau perusahaan

Login dengan email/password

Verifikasi email dan reset password

Update profil + upload foto (validasi ukuran/format)

Role-based access: USER, ADMIN, DEVELOPER

2. Landing Page & Job Discovery
Hero section, job filter, discovery by lokasi

Preview 5 lowongan terbaru

Filtering, sorting, dan pencarian berdasarkan lokasi, kategori, tanggal

Detail job lengkap + tombol apply/save

Detail & list semua perusahaan

3. Job Application System
Upload CV + input ekspektasi gaji

Dashboard lamaran: status, detail, jadwal interview

Notifikasi interview via email

Riwayat lamaran user

4. Skill Assessment
Soal multiple choice (25 soal)

Hanya untuk user subscribed

Waktu 30 menit, nilai lulus ≥ 75

Dapat sertifikat PDF dan badge ke profil

Sistem verifikasi sertifikat via kode unik

5. Account Subscription System
2 Tipe: STANDARD (25K) & PROFESSIONAL (100K)

Fitur premium: CV Generator, Skill Assessment, Priority Review

Payment: Upload bukti transfer atau Midtrans Snap

Masa aktif 30 hari, pengingat otomatis H-1 via email

Approval oleh developer jika manual

6. CV Generator
Hanya untuk user subscribed

Form input tambahan: LinkedIn, Career Summary, dsb

Preview + download PDF

Format CV ATS-friendly

7. Company Review
Ulasan anonim + estimasi gaji

Rating aspek (culture, work-life, career path)

Hanya oleh user yang diverifikasi bekerja di perusahaan tersebut

8. Job Posting Management (Admin)
CRUD lowongan kerja

Filter dan sorting data job

Kelola daftar pelamar, status lamaran

Preview CV & jadwal wawancara

Reminder via email H-1

9. Analytics Dashboard (Developer/Admin)
Demografi user: usia, jenis kelamin, lokasi

Trend gaji & minat pelamar

Statistik subscription & lencana skill

Tech Stack
Area	Stack
Frontend	Next.js 13+, TypeScript, TailwindCSS, Redux Toolkit, Formik + Yup
Backend	Express.js, Node.js, PostgreSQL, Prisma ORM, Zod Validation
Auth	JWT, Role-based access
Upload	Multer, Cloudinary
Payment	Midtrans Snap, Manual proof upload
PDF & Badge	React-PDF, QR code verification, custom badge system

