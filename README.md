# README — CerminSaku

## 📌 Deskripsi Singkat Proyek

**CerminSaku** merupakan aplikasi web manajemen keuangan pribadi berbasis kecerdasan buatan (*AI-powered personal finance management system*) yang dirancang khusus untuk membantu generasi muda (Gen Z) mengelola kondisi finansial secara lebih terarah.

Permasalahan utama yang diangkat dalam proyek ini adalah masih banyaknya anak muda yang mengalami kesulitan dalam mengelola keuangan pribadi, seperti pengeluaran yang tidak terlacak (*untracked spending*), kurangnya kebiasaan mencatat transaksi, serta ketidakmampuan memahami kondisi kesehatan finansial mereka dari data mentah.

Untuk menjawab masalah tersebut, **CerminSaku** tidak hanya menyediakan fitur pencatatan pemasukan dan pengeluaran, tetapi juga menghadirkan sistem analitik berbasis **Machine Learning** dan **Generative AI** untuk:

* Mengklasifikasikan kategori transaksi secara otomatis.
* Memberikan insight finansial personal.
* Menampilkan dashboard analitik kondisi keuangan.
* Membantu pengguna merencanakan target tabungan (*Dream Savings*).

---

## 🔍 Problem Discovery & Solusi Utama

### 1. Analisis Permasalahan

Manajemen keuangan pribadi menjadi salah satu tantangan terbesar bagi generasi muda saat ini. Banyak pengguna mengalami:

* Pengeluaran tidak terkontrol (*untracked spending*).
* Tidak memiliki kebiasaan mencatat transaksi.
* Sulit memahami kondisi kesehatan finansial dari angka mentah.
* Tidak memiliki insight mengenai pola konsumsi impulsif.

### 2. Solusi yang Dikembangkan

Untuk menjawab permasalahan tersebut, proyek ini mengembangkan **CerminSaku**, sebuah sistem pengelolaan keuangan berbasis web yang memiliki fitur:

* **Dashboard Finansial Personal** untuk memvisualisasikan kondisi keuangan.
* **AI Transaction Classification** menggunakan Deep Learning.
* **AI Financial Insight** menggunakan Claude AI / Gemini.
* **Dream Savings Management** untuk membantu mencapai target finansial.
* **Smart Financial Recommendation** berbasis data transaksi pengguna.

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

* Missing values
* Inkonsistensi kategori
* Duplikasi data
* Outlier ekstrem

Hasil evaluasi:

* Total data: **11.590 entries**
* Tidak ditemukan missing values
* Tidak ditemukan data duplikat
* Outlier dianggap masih realistis sehingga dipertahankan

### 3. Cleaning Data

Tahap pembersihan meliputi:

* Konversi tipe data `Date` menjadi `datetime`
* Feature scaling pada nominal transaksi
* Rename kolom dataset
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

## 🤖 Machine Learning Model

Model Deep Learning digunakan untuk melakukan **klasifikasi kategori transaksi otomatis (10 kelas)** berdasarkan:

* Nominal transaksi (*Amount*)
* Jenis transaksi (*Income / Expense*)
* Pola waktu transaksi (*Date Features*)

### Arsitektur yang Digunakan

* **TensorFlow Functional API**
* Dense Neural Network
* Attention Layer
* Residual Connection
* Batch Normalization
* Dropout Regularization
* Focal Loss Function

### Output Model

Model menghasilkan:

* **Top-3 Prediksi Kategori Transaksi**
* Confidence Score (%)

Contoh:

```plaintext
1. Food & Drink (87%)
2. Entertainment (8%)
3. Transportation (5%)
```

---

## 🧠 Integrasi Generative AI

CerminSaku mengintegrasikan **Anthropic Claude API** dan **Gemini API** untuk menghasilkan:

### AI Dashboard Insight

Analisis kondisi finansial pengguna secara otomatis berdasarkan:

* Total pemasukan
* Total pengeluaran
* Saldo bersih
* Budget usage

### AI Dream Savings Insight

Memberikan rekomendasi terhadap progress tabungan pengguna.

### AI Financial Recommendation

Memberikan insight personal terkait pola pengeluaran impulsif dan rekomendasi penghematan.

---

## ⚙️ Petunjuk Setup Environment

### 1. Persiapan Awal

Pastikan telah menginstall:

* **Node.js** (Versi 18+)
* **Database MySQL / PostgreSQL**
* **Git**
* **XAMPP** *(Jika menggunakan MySQL lokal)*

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

# AI Service (ML + Claude)
AI_SERVICE_URL=https://xxxx.ngrok-free.app
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
```

---

## 🔗 Tautan Model Machine Learning

Model ML dijalankan menggunakan **Google Colab + FastAPI + Ngrok**.

Model dapat dimuat melalui endpoint:

```plaintext
AI_SERVICE_URL
```

yang dikonfigurasi pada file:

```env
.env
```

**Catatan:**
Pastikan link **Ngrok** selalu diperbarui sebelum menjalankan backend.

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

Jalankan React App:

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

### AI & Machine Learning

* TensorFlow
* FastAPI
* Google Colab
* Ngrok
* Claude API (Anthropic)
* Gemini API

### Database

* MySQL

---

## ⚠️ Catatan Penting

### AI Service

Karena model ML berjalan melalui **Google Colab**, pastikan **Ngrok aktif** sebelum backend dinyalakan.

### Nodemailer

Gunakan **Google App Password**, bukan password Gmail biasa.

### Jika AI Tidak Berjalan

Pastikan:

1. File `.env` sudah benar.
2. `AI_SERVICE_URL` masih aktif.
3. Backend direstart ulang:

```bash
npm run start
```

---
## ⚠️ Catatan Penting Terkait AI

### Limitasi AI Klasifikasi Transaksi

Fitur AI pada menu **Transaksi** (prediksi kategori otomatis) masih berada pada tahap pengembangan awal (*prototype stage*) sehingga tingkat akurasinya belum sepenuhnya sempurna.

Hal ini disebabkan oleh beberapa faktor berikut:

* **Konfigurasi model masih ringan (lightweight)** agar tetap optimal dijalankan pada lingkungan komputasi terbatas (*Google Colab deployment*), sehingga kompleksitas model belum dimaksimalkan sepenuhnya.
* **Dataset yang digunakan belum 100% real-world data**, melainkan kombinasi dataset publik dari Kaggle dan data dummy tambahan untuk simulasi perilaku transaksi pengguna.
* **Perilaku finansial setiap individu berbeda-beda**, sehingga terdapat kemungkinan hasil klasifikasi kategori transaksi tidak selalu sesuai dengan preferensi atau konteks pengguna.

Sebagai contoh, transaksi tertentu terkadang dapat diprediksi ke kategori yang kurang tepat apabila nominal, pola waktu, atau konteks transaksi memiliki karakteristik yang mirip dengan kategori lain.

Namun demikian, sistem AI tetap mampu memberikan **prediksi kategori transaksi otomatis, insight finansial personal, dan rekomendasi keuangan** sebagai pendukung pengambilan keputusan finansial pengguna, bukan sebagai sumber keputusan absolut (*decision support system*).

Pengembangan lanjutan akan difokuskan pada:

1. Penambahan jumlah dan kualitas data transaksi nyata (*real transaction data*).
2. Peningkatan kompleksitas model Deep Learning.
3. Fine-tuning model agar lebih personal terhadap pola keuangan masing-masing pengguna.
4. Optimasi inference agar prediksi semakin akurat dan kontekstual.

## 👨‍💻 Tim Pengembang

Dikembangkan oleh **Tim Capstone CerminSaku** yang terdiri dari bidang:

* **Full Stack Development**
* **Artificial Intelligence**
* **Data Science**

untuk membantu generasi muda mengelola finansial dengan lebih cerdas.

