# README — Sakuin

## 📌 Deskripsi Singkat Proyek

**Sakuin** merupakan aplikasi web manajemen keuangan pribadi yang dirancang untuk membantu generasi muda, khususnya Gen Z, dalam mengelola kondisi finansial secara lebih terarah, sederhana, dan konsisten.

Permasalahan utama yang diangkat dalam proyek ini adalah masih banyaknya anak muda yang mengalami kesulitan dalam mengelola keuangan pribadi, seperti pengeluaran yang tidak terlacak (*untracked spending*), kurangnya kebiasaan mencatat transaksi, kesulitan memahami kondisi keuangan dari data mentah, serta belum adanya motivasi yang cukup untuk membangun kebiasaan finansial yang konsisten.

Untuk menjawab permasalahan tersebut, **Sakuin** menyediakan fitur pencatatan transaksi, dashboard analitik keuangan, perencanaan target tabungan melalui **Dream Savings**, insight dan rekomendasi finansial berbasis AI, serta sistem **Streak** untuk mendorong konsistensi pengguna dalam mencatat aktivitas keuangannya.

---

## 🔍 Problem Discovery & Solusi Utama

### 1. Analisis Permasalahan

Manajemen keuangan pribadi menjadi salah satu tantangan bagi generasi muda saat ini. Banyak pengguna mengalami:

* Pengeluaran tidak terkontrol (*untracked spending*).
* Tidak memiliki kebiasaan mencatat transaksi secara rutin.
* Sulit memahami kondisi keuangan dari angka mentah.
* Tidak mengetahui pola pengeluaran pribadi.
* Kesulitan mempertahankan kebiasaan finansial yang konsisten.
* Tidak memiliki target finansial yang terstruktur.

### 2. Solusi yang Dikembangkan

Untuk menjawab permasalahan tersebut, proyek ini mengembangkan **Sakuin**, sebuah sistem pengelolaan keuangan berbasis web dengan fitur:

* **Dashboard Finansial Personal** untuk memvisualisasikan kondisi keuangan pengguna.
* **Pencatatan Transaksi** untuk mencatat pemasukan dan pengeluaran.
* **AI Financial Insight** untuk memberikan analisis kondisi finansial secara personal.
* **Dream Savings** untuk membantu pengguna menetapkan dan memantau target finansial.
* **AI Financial Recommendation** untuk memberikan rekomendasi berdasarkan kondisi dan pola keuangan pengguna.
* **Financial Streak** untuk mendorong pengguna membangun kebiasaan mencatat aktivitas keuangan secara konsisten.
* **Riwayat Aktivitas** untuk membantu pengguna melihat perkembangan aktivitas finansial dari waktu ke waktu.

---

## 💰 Fitur Utama

### 1. Dashboard Finansial

Dashboard menyediakan ringkasan kondisi keuangan pengguna, seperti:

* Total pemasukan.
* Total pengeluaran.
* Saldo bersih.
* Penggunaan budget.
* Ringkasan aktivitas keuangan.
* Insight finansial personal.

Dashboard dirancang agar pengguna dapat memahami kondisi keuangan tanpa harus menganalisis data transaksi secara manual.

---

### 2. Pencatatan Transaksi

Pengguna dapat mencatat aktivitas keuangan berupa:

* Pemasukan (*Income*).
* Pengeluaran (*Expense*).
* Nominal transaksi.
* Kategori transaksi.
* Tanggal transaksi.
* Catatan transaksi.

Data transaksi digunakan sebagai dasar untuk menampilkan ringkasan dan analisis kondisi finansial pengguna.

---

### 3. Dream Savings

**Dream Savings** merupakan fitur untuk membantu pengguna menetapkan target finansial berdasarkan tujuan yang ingin dicapai.

Pengguna dapat menentukan:

* Nama atau tujuan impian.
* Target nominal.
* Jumlah tabungan yang telah terkumpul.
* Progress pencapaian target.
* Target waktu pencapaian.

Fitur ini membantu pengguna mengubah tujuan finansial menjadi target yang lebih terukur dan mudah dipantau.

---

### 4. AI Financial Insight

Sakuin mengintegrasikan **Generative AI** untuk memberikan insight berdasarkan kondisi keuangan pengguna.

Analisis dapat mempertimbangkan:

* Total pemasukan.
* Total pengeluaran.
* Saldo bersih.
* Penggunaan budget.
* Pola aktivitas finansial.
* Progress target tabungan.

AI digunakan sebagai **decision support system** untuk membantu pengguna memahami kondisi finansialnya, bukan sebagai pengganti keputusan finansial pengguna.

---

### 5. AI Financial Recommendation

Fitur ini memberikan rekomendasi finansial berdasarkan data keuangan pengguna.

Contohnya meliputi:

* Rekomendasi penghematan.
* Evaluasi pola pengeluaran.
* Saran untuk mengatur budget.
* Rekomendasi terkait target tabungan.
* Insight terhadap kebiasaan pengeluaran.

Rekomendasi bersifat personal dan disesuaikan dengan kondisi keuangan yang tercatat pada aplikasi.

---

### 6. Financial Streak 🔥

**Financial Streak** merupakan fitur gamifikasi yang dirancang untuk mendorong pengguna agar lebih konsisten dalam mencatat aktivitas keuangannya.

Streak akan bertambah ketika pengguna melakukan aktivitas finansial pada hari yang berbeda, seperti:

* Menambahkan catatan transaksi.
* Menambahkan catatan impian (*Dream Savings*).

Dalam satu hari, pengguna tetap dihitung sebagai **satu hari aktif**, meskipun melakukan beberapa aktivitas.

Contoh:

```text
9 September  → 🔥 Streak 1
10 September → 🔥 Streak 2
11 September → 🔥 Streak 3
12 September → Tidak melakukan aktivitas
13 September → 🔥 Streak kembali 1
```

Sistem menyimpan beberapa informasi streak, seperti:

* **Current Streak** — jumlah hari aktif berturut-turut.
* **Longest Streak** — streak terpanjang yang pernah dicapai.
* **Total Activity** — jumlah aktivitas yang telah dilakukan.
* **Last Active Date** — tanggal terakhir pengguna melakukan aktivitas.
* **Activity History** — riwayat hari aktif pengguna.

Tujuan utama fitur ini bukan sekadar memberikan angka streak, tetapi membantu membangun **kebiasaan pencatatan keuangan yang konsisten**.

---

## 🧹 Data Wrangling (End-to-End)

Tahapan pengolahan data dilakukan menggunakan:

* `pandas`
* `numpy`
* `matplotlib`
* `seaborn`

### 1. Gathering Data

Dataset dimuat menggunakan:

```python
pd.read_csv('Personal_Finance_Dataset_Row.csv')
```

Dataset berasal dari **Kaggle (Personal Finance Dataset by ramyapintchy)** dengan modifikasi berupa penambahan **10.000 data dummy** untuk meningkatkan realism perilaku transaksi pengguna.

### 2. Assessing Data

Tahap evaluasi data dilakukan untuk mendeteksi:

* Missing values.
* Inkonsistensi kategori.
* Duplikasi data.
* Outlier ekstrem.

Hasil evaluasi:

* Total data: **11.590 entries**.
* Tidak ditemukan missing values.
* Tidak ditemukan data duplikat.
* Outlier dianggap masih realistis sehingga dipertahankan.

### 3. Cleaning Data

Tahap pembersihan meliputi:

* Konversi tipe data `Date` menjadi `datetime`.
* Feature scaling pada nominal transaksi.
* Rename kolom dataset.
* Export dataset bersih ke:

```plaintext
Personal_Finance_Dataset_Cleaned.csv
```

---

## 📚 Data Dictionary & Feature Engineering

### Feature Engineering yang Digunakan

#### 1. Day Type Feature

Mengelompokkan hari menjadi:

* `Weekday`
* `Weekend`

Menggunakan:

```python
df_clean['Date'].dt.day_name()
```

#### 2. Budget Status Feature

Menghasilkan status finansial:

* **Aman / Surplus**
* **Overbudget / Defisit**

berdasarkan selisih pemasukan dan pengeluaran pengguna.

---

## 🤖 Generative AI

Sakuin mengintegrasikan **Anthropic Claude API** dan **Gemini API** untuk menghasilkan insight dan rekomendasi finansial yang lebih personal.

### AI Dashboard Insight

Menganalisis kondisi finansial pengguna berdasarkan:

* Total pemasukan.
* Total pengeluaran.
* Saldo bersih.
* Budget usage.
* Aktivitas keuangan.

### AI Dream Savings Insight

Memberikan insight terkait progress target tabungan pengguna, seperti:

* Evaluasi progress.
* Saran pencapaian target.
* Rekomendasi pengelolaan tabungan.

### AI Financial Recommendation

Memberikan rekomendasi berdasarkan pola finansial pengguna, seperti:

* Penghematan.
* Pengelolaan pengeluaran.
* Pengaturan budget.
* Kebiasaan finansial.

> **Catatan:** Sakuin tidak lagi menggunakan model Machine Learning untuk melakukan klasifikasi kategori transaksi secara otomatis. Kategori transaksi dikelola melalui sistem pencatatan transaksi pada aplikasi.

---

## ⚙️ Petunjuk Setup Environment

### 1. Persiapan Awal

Pastikan telah menginstall:

* **Node.js** (Versi 18+).
* **Database MySQL / PostgreSQL**.
* **Git**.
* **XAMPP** *(jika menggunakan MySQL lokal)*.

---

### 2. Setup Environment Variables (.env)

Masuk ke folder `backend`, lalu buat file `.env`:

```env
DATABASE_URL=url_database_kamu
JWT_SECRET=rahasia_jwt_kamu

# Email Service (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=email_kamu@gmail.com
MAIL_PASS=app_password_email

# AI Service
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
GEMINI_API_KEY=xxxxxxxx
```

Sesuaikan environment variable dengan konfigurasi backend yang digunakan pada project.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Jalankan Backend

Masuk ke folder backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Jalankan server:

```bash
npm run start
```

---

### 2. Jalankan Frontend

Buka terminal baru:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Jalankan aplikasi:

```bash
npm run dev
```

---

## 📦 Tech Stack

### Frontend

* React.js
* CSS
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* JWT Authentication
* Nodemailer
* Axios

### Artificial Intelligence

* Anthropic Claude API
* Gemini API
* Generative AI

### Data Processing

* Python
* Pandas
* NumPy
* Matplotlib
* Seaborn

### Database

* MySQL

---

## 🔐 Authentication & Security

Sakuin menggunakan sistem autentikasi untuk melindungi data finansial pengguna.

Teknologi yang digunakan antara lain:

* JWT Authentication.
* Password hashing.
* Protected API endpoint.
* Environment variables untuk menyimpan informasi sensitif.
* Role-based access pada endpoint tertentu.

Data finansial pengguna digunakan untuk kebutuhan fitur aplikasi dan analisis personal.

---

## 🔥 Streak System

Sistem streak menggunakan tanggal aktivitas pengguna untuk menentukan konsistensi penggunaan aplikasi.

Ketika pengguna melakukan aktivitas pada hari yang sama, aktivitas tersebut tetap dihitung sebagai satu hari aktif.

Sementara itu, ketika pengguna kembali melakukan aktivitas pada hari berikutnya secara berturut-turut, nilai streak akan bertambah.

Data streak disimpan pada:

```javascript
localStorage
```

dengan storage key:

```javascript
streakData
```

Informasi yang disimpan meliputi:

```javascript
{
  streakCount: 0,
  longestStreak: 0,
  totalCount: 0,
  lastActiveDate: null,
  history: []
}
```

Sistem ini dirancang untuk memberikan motivasi tambahan agar pengguna membangun kebiasaan pencatatan finansial secara konsisten.

---

## ⚠️ Catatan Penting Terkait AI

Fitur AI pada Sakuin masih berada dalam tahap pengembangan (*prototype stage*). Oleh karena itu, hasil insight dan rekomendasi yang diberikan AI tidak selalu sempurna.

Hal ini dapat dipengaruhi oleh:

* Kualitas dan kelengkapan data transaksi pengguna.
* Keterbatasan model Generative AI.
* Interpretasi AI terhadap pola keuangan.
* Perbedaan kondisi dan kebutuhan finansial setiap pengguna.

Oleh karena itu, output AI pada Sakuin berfungsi sebagai **pendukung pengambilan keputusan finansial**, bukan sebagai sumber keputusan absolut.

Pengguna tetap memiliki kendali penuh dalam menentukan keputusan finansial berdasarkan kondisi dan kebutuhannya masing-masing.

---

## 👨‍💻 Tim Pengembang

Dikembangkan oleh **Tim Capstone Sakuin** yang terdiri dari bidang:

* **Full Stack Development**
* **Artificial Intelligence**
* **Data Science**

Sakuin dikembangkan untuk membantu generasi muda membangun kebiasaan finansial yang lebih sehat, memahami kondisi keuangannya, serta mencapai tujuan finansial dengan lebih terarah.
