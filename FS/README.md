# Panduan Menjalankan CerminSaku

Ikuti langkah-langkah simpel di bawah ini untuk menjalankan project di laptop kamu.

### 1. Persiapan Awal (Wajib)
Pastikan kamu sudah menginstall:
* **Node.js** (Versi 18 atau terbaru)
* **Database** (Sesuai yang kamu pakai, misal MySQL/XAMPP atau PostgreSQL)

### 2. Setup Environment Variables (.env)
Masuk ke folder `backend`, lalu buat file `.env`. Pastikan isinya sudah lengkap seperti ini (termasuk konfigurasi Nodemailer dan Claude AI):

```env
DATABASE_URL=url_database_kamu
JWT_SECRET=rahasia_jwt_kamu

# Konfigurasi Nodemailer untuk fitur Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=email_kamu@gmail.com
MAIL_PASS=password_app_email_kamu

# Konfigurasi AI & Machine Learning (Ngrok dari Google Colab)
AI_SERVICE_URL=https://xxxx-xxxx.ngrok-free.app
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxx-xxxxxxxxxxxx

### 3. Instalasi & Menjalankan Server API (Backend)
Buka terminal/PowerShell, lalu jalankan perintah satu baris ini untuk masuk ke folder backend, menginstal library (termasuk Axios & Nodemailer), dan menyalakan server:
cd backend && npm install && npm run start

### 4. Menjalankan Frontend Web (React)
Buka terminal baru lagi, lalu jalankan perintah satu baris ini untuk masuk ke folder frontend dan menyalakan tampilan web CerminSaku:
cd frontend && npm install && npm run dev

Catatan Penting
Koneksi AI (Ngrok): Karena model Machine Learning dijalankan via Google Colab, pastikan cell Ngrok di Colab sedang berjalan. Jangan lupa untuk selalu meng-update AI_SERVICE_URL di file .env dengan link Ngrok terbaru sebelum menyalakan backend!

Axios Interceptors: Aplikasi ini sudah menggunakan Axios secara penuh di frontend. Token JWT kamu akan disisipkan secara otomatis ke setiap request ke backend, jadi tidak perlu pusing setting header manual lagi.

Nodemailer: Pastikan MAIL_PASS di .env menggunakan App Password (Sandi Aplikasi) dari Google, bukan password login email biasa kamu, agar fitur email berjalan mulus.

Jika Ada Error AI: Pastikan file .env di backend sudah di-save dan kamu sudah me-restart server backend (Tekan Ctrl+C di terminal backend, lalu jalankan npm run start lagi).