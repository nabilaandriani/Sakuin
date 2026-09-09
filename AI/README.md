# 📊 Personal Finance AI — Deep Learning Classification

Repository ini berisi proyek **Deep Learning** menggunakan **TensorFlow Functional API** untuk mengklasifikasikan kategori transaksi keuangan pribadi (**10 Kelas**) secara otomatis berdasarkan nominal transaksi (*Amount*), pola waktu (*Date*), dan jenis transaksi (*Type*).

Dokumen ini memberikan penjelasan mendalam pada setiap bagian kode di dalam notebook `Personal_Finance_AI_Complete.ipynb` agar pembaca dapat memahami alur kerja, fungsi komponen kustom, serta arsitektur yang diimplementasikan.

---

## 🛠️ 1. Install & Import Dependencies
Bagian awal kode bertanggung jawab untuk mempersiapkan lingkungan kerja (*environment*) dan memuat semua modul yang diperlukan.

* **Instalasi Pustaka (`!pip install`)**: Mengunduh pustaka utama untuk Deep Learning (`tensorflow`), manipulasi data dan visualisasi (`pandas`, `scikit-learn`, `matplotlib`, `seaborn`), pembuatan REST API (`fastapi`, `uvicorn`, `pyngrok`), serta integrasi LLM (`anthropic`, `google-generativeai`). Parameter `-q` (*quiet*) digunakan untuk menyembunyikan log proses instalasi agar notebook tetap rapi.
* **Pengaturan Lingkungan (`warnings` & `SEED`)**: `warnings.filterwarnings('ignore')` digunakan untuk mengabaikan pesan peringatan non-kritis. Variabel `SEED = 42` diset pada `numpy` dan `tensorflow` untuk menjamin hasil pembagian data (*split*) serta inisialisasi bobot saraf selalu konsisten jika kode dijalankan ulang (*reproducibility*).
* **Akselerasi Perangkat Keras**: Kode melakukan pengecekan ketersediaan GPU (`tf.config.list_physical_devices('GPU')`) guna memastikan pelatihan model berjalan lebih cepat dibandingkan menggunakan CPU standar.

---

## 🗄️ 2. Load Dataset
Proses pemuatan data dilakukan secara daring langsung dari repositori GitHub publik menggunakan fungsi `pd.read_csv()`.
* Data yang digunakan adalah varian data yang telah dibersihkan (*Cleaned Dataset*).
* Setelah data masuk ke memori dalam bentuk DataFrame (`df`), kode menjalankan fungsi inspeksi mendasar seperti `.shape` untuk mengetahui jumlah baris dan kolom, `.columns.tolist()` untuk melihat daftar fitur, serta `.isnull().sum()` untuk memastikan tidak ada data yang kosong (*missing values*) yang dapat mengganggu kalkulasi matematika model.

---

## 📊 3. Exploratory Data Analysis (EDA)
Sebelum membangun model, visualisasi dilakukan menggunakan `matplotlib.pyplot` dan `seaborn` untuk memahami karakteristik dan distribusi data.
* **Grafik 1 (Distribusi Target)**: Menggunakan diagram batang horizontal (`barh`) untuk mengecek apakah sebaran 10 kategori transaksi (seperti Makanan, Transportasi, Belanja, dll) seimbang atau mengalami ketimpangan (*imbalanced data*).
* **Grafik 2 (Distribusi Amount)**: Menggunakan histogram untuk melihat pola nominal uang. Skala sumbu X dibagi dengan `1e6` (1 juta) agar label angka lebih bersih dan mudah dibaca secara visual.
* **Grafik 3 (Income vs Expense)**: Menggunakan diagram lingkaran (`pie chart`) untuk membandingkan persentase total transaksi masuk versus transaksi keluar.
* **Statistik Deskriptif**: Fungsi `.describe()` dipadukan dengan pemformatan string Rupiah (`Rp {x:,.0f}`) memberikan ringkasan angka minimum, maksimum, rata-rata, dan kuartil data transaksi.

---

## ⚙️ 4. Feature Engineering & Preprocessing
Data mentah diubah menjadi bentuk representasi numerik yang optimal bagi algoritma Deep Learning.
* **Ekstraksi Fitur Waktu (*Datetime Features*)**: Kolom teks tanggal dikonversi menjadi objek temporal. Dari objek ini, diekstrak 7 fitur baru yang kaya informasi: hari dalam seminggu (`day_of_week`), tanggal bulanan (`day_of_month`), bulan (`month`), kuartal (`quarter`), tahun (`year`), indikator akhir pekan (`is_weekend`), dan indikator akhir bulan (`is_month_end`). Fitur-fitur ini membantu model menangkap pola perilaku musiman keuangan manusia (misalnya: belanja meningkat di akhir bulan/gajian atau akhir pekan).
* **Encoding Variabel Kategorikal**:
    * Kolom biner `Type` (Income/Expense) diubah menjadi angka `1` atau `0`.
    * Kolom target `Category` ditransformasikan menjadi indeks numerik berurutan `0` sampai `9` menggunakan `LabelEncoder`.
* **Transformasi Logaritma (`amount_log`)**: Nominal uang mentah diproses menggunakan `np.log1p(x)` yang menghitung $\ln(x + 1)$. Skala keuangan umumnya memiliki pencilan (*outliers*) tinggi; transformasi log membuat sebaran data menjadi berdistribusi normal, mencegah gradien meledak (*exploding gradient*), dan menstabilkan pelatihan.
* **Pembagian Data Latih, Validasi, dan Uji**: Data dipecah secara bertahap menggunakan `train_test_split` dengan rasio **70% Data Latih**, **15% Data Validasi**, dan **15% Data Uji**. Atribut `stratify=y` wajib digunakan agar proporsi sebaran 10 kelas target tetap sama dan adil di ketiga subset data tersebut.
* **Standardisasi Fitur (`StandardScaler`)**: Skala seluruh fitur disamakan menggunakan rumus Z-score (mengubah rata-rata menjadi 0 dan varians menjadi 1). Ini memastikan fitur dengan rentang besar (seperti tahun) tidak mendominasi fitur berrentang kecil (seperti biner 0/1) saat bobot diperbarui.

---

## 💎 5. Custom Components (Kelebihan Arsitektur)

Notebook ini menerapkan tiga komponen kustom berbasis objek berorientasi (OOP) untuk meningkatkan performa dan kapabilitas kontrol:

### 🧠 A. Custom Layer: `FeatureAttentionLayer`
Mewarisi kelas `layers.Layer`. Layer ini mengimplementasikan mekanisme atensi spasial 1D (mirip blok *Squeeze-and-Excitation*). Layer ini mempelajari relasi antar-fitur tabel masukan secara dinamis, menghasilkan matriks bobot kepentingan (*attention weights*), dan mengalikan bobot tersebut kembali ke fitur asli. Fitur yang paling berpengaruh akan diperkuat, sedangkan fitur noise/tidak relevan akan diredam.

### 📉 B. Custom Loss Function: `FocalLoss`
Mewarisi kelas `keras.losses.Loss`. Fungsi kerugian kustom ini dirancang khusus untuk mengatasi masalah ketidakseimbangan kelas (*class imbalance*). Berbeda dengan *Categorical Crossentropy* standar, `Focal Loss` menambahkan faktor pengondisian $(1 - p_t)^\gamma$. Jika model sudah sangat percaya diri dan benar dalam menebak suatu sampel yang mudah, nilai kerugiannya ditekan mendekati nol. Sebaliknya, jika model salah atau ragu pada sampel kelas yang langka/sulit, nilai kerugiannya diperbesar, memaksa model belajar lebih keras pada bagian data yang sulit tersebut.

### 🔔 C. Custom Callback: `TrainingMonitorCallback`
Mewarisi kelas `keras.callbacks.Callback`. Bertindak sebagai pengawas otomatis selama proses komputasi berlangsung. Callback ini diprogram untuk:
* Mencetak metrik performa ringkas setiap kelipatan 10 epoch agar log tidak memenuhi layar.
* Memantau selisih nilai akurasi data latih dan data validasi. Jika gap tersebut melebihi ambang batas, sistem akan otomatis mencetak peringatan dini **"WARNING: Overfitting Terdeteksi!"** di konsol.

---

## 🏗️ 6. Model Architecture (TensorFlow Functional API)
Model dibangun menggunakan struktur **Functional API** yang memberikan fleksibilitas tinggi dibandingkan model sekuensial biasa:
1.  **Input Layer**: Menerima vektor fitur numerik berdimensi sesuai dengan variabel input kita.
2.  **Attention Block**: Menyalurkan input ke `FeatureAttentionLayer`.
3.  **Dense Blocks**: Serangkaian layer penuh terhubung (*Fully Connected*) yang diperkuat dengan:
    * `BatchNormalization`: Menormalkan aktivasi antar layer untuk mempercepat konvergensi.
    * `Activation('relu')`: Memberikan sifat non-linearitas agar jaringan dapat mempelajari pola rumit.
    * `Dropout`: Mematikan neuron acak sebesar 20-30% selama training untuk mencegah ketergantungan berlebih antar neuron (*co-adaptation*).
4.  **Residual Connection (Shortcut)**: Menambahkan jalur pintas (*skip connection*) yang menjumlahkan input blok dengan output blok menggunakan `layers.Add()`. Teknik ini diadopsi dari arsitektur *ResNet* untuk mencegah masalah hilangnya gradien (*vanishing gradient*) pada jaringan dalam.
5.  **Output Layer**: Menggunakan layer Dense berukuran 10 dengan fungsi aktivasi `softmax` untuk menghasilkan distribusi probabilitas kelas target.

---

## 👟 7. Model Training & Callbacks
Proses komputasi dijalankan melalui perintah `model.fit()`. Proses ini dikawal oleh kombinasi callback tangguh:
* `monitor_cb`: Callback kustom untuk memantau indikasi overfitting.
* `EarlyStopping`: Menghentikan proses latihan secara otomatis di tengah jalan jika nilai *Validation Loss* tidak mengalami penurunan selama 15 epoch berturut-turut untuk menghemat waktu komputasi.
* `ReduceLROnPlateau`: Menurunkan nilai *learning rate* (kecepatan belajar) secara otomatis (dikali faktor 0.2) jika performa validasi mendatar (*stagnant*), membantu model berosilasi dengan mulus menuju titik optimal global terkecil.

---

## 📊 8. Evaluation & Visualization
Setelah proses latihan selesai, model diuji secara ketat menggunakan data uji (*Test Set*):
* **Grafik Evaluasi**: Menampilkan visualisasi kurva *Loss* dan *Accuracy* dari epoch awal hingga akhir untuk menganalisis stabilitas model.
* **Classification Report**: Menghitung secara presisi metrik *Precision*, *Recall*, dan *F1-Score* untuk masing-masing dari 10 kelas target.
* **Confusion Matrix**: Digambarkan dalam format visual *Heatmap* menggunakan `seaborn`. Matriks ini sangat penting untuk mendeteksi secara spesifik pasangan kelas apa yang sering membuat model salah paham (misal: apakah transaksi 'Belanja' sering tertukar dengan 'Hiburan').

---

## 💾 9. Serialization (Save & Export)
Agar hasil model dapat dideploy ke server produksi, seluruh artefak dipadatkan dan disimpan ke dalam direktori lokal `saved_model/`:
* Model disimpan dalam format standardisasi `.keras` dan format folder `SavedModel` TensorFlow.
* Objek `scaler` (StandardScaler) dan objek `label_encoder` (LabelEncoder) diekspor ke file biner menggunakan pustaka `pickle`. Ini wajib dilakukan agar struktur transformasi data baru saat implementasi nanti bernilai persis sama dengan transformasi saat training.

---

## 🔮 10. Inference Pipeline
Bagian akhir menyediakan fungsi hulu-ke-hilir (*end-to-end*) siap pakai bernama `predict_category()`. 
* Fungsi ini menerima input teks mentah mentah sehari-hari (Contoh: nominal Rp150.000, tipe 'Expense', tanggal '2026-05-22').
* Di dalam fungsi, input tersebut diproses otomatis melewati ekstraksi fitur waktu, transformasi logaritma, dan penskalaan standardizer secara internal.
* Fungsi kemudian mengembalikan **Top-3 Prediksi Kategori Terbaik** lengkap dengan skor persentase keyakinannya (*confidence score*), memberikan fungsionalitas cerdas siap pakai untuk aplikasi sisi klien.

---

## 🚀 Side Quests (Fitur Lanjutan)

### 🔄 Side Quest 2: Custom Training Loop
Bagian ini menunjukkan keahlian tingkat lanjut dengan membongkar fungsi otomatis `.fit()` menjadi loop manual baris demi baris menggunakan **`tf.GradientTape`**. 
* Kita mengontrol penuh perhitungan fungsi kerugian, pelacakan metrik akurasi, pembukaan pita rekaman gradien bobot, dan optimasi pembaruan bobot model melalui optimizer langkah demi langkah.
* Fungsi ini dibungkus menggunakan dekorator `@tf.function` untuk mengompilasi kode Python murni menjadi *TensorFlow Graph execution* yang berjalan sangat cepat pada tingkat mesin.

### 🤖 Side Quest 3: Generative AI (Gemini / Anthropic) Integration
Mengintegrasikan kecerdasan buatan berbasis teks (LLM) dengan model Deep Learning klasifikasi kita. setelah model Deep Learning berhasil mengelompokkan kategori transaksi keuangan pengguna, hasil tersebut dikirim bersama riwayat finansialnya ke API **Gemini 1.5 Flash** atau **Anthropic Claude**. Sistem kemudian akan menghasilkan teks rekomendasi, analisis anggaran, dan nasihat finansial yang dipersonalisasi secara interaktif, kontekstual, dan cerdas bagi pengguna.

---
*Penjelasan ini dirancang untuk memandu pembaca memahami struktur kecerdasan buatan dari pengolahan data mentah awal hingga sistem aplikasi cerdas modern.*

