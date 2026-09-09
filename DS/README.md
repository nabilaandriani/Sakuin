# 📊 CerminSaku - Data Science Project

## 📌 Overview

CerminSaku adalah project data science yang bertujuan untuk menganalisis data keuangan pribadi dan membantu pengguna memahami pola pengeluaran serta kebiasaan finansial mereka. Project ini fokus pada eksplorasi data, data cleaning, hingga visualisasi dalam bentuk dashboard interaktif.

## 🛠️ Tech Stack

Python
Pandas
NumPy
Matplotlib / Seaborn
Streamlit

## 📂 Project Structure
```
DS/
├── notebook.ipynb                                # Business questions, assessing data, cleaning data, EDA, feature engineering, visualisasi
├── data_dictionary.md                            # Penjelasan tiap kolom dataset
├── Personal_Finance_Dataset_Raw.csv              # Dataset mentah
├── Personal_Finance_Dataset_Cleaned.csv          # Dataset setelah preprocessing
├── Laporan Teknis Komprehensif DATA SCIENCE.pdf  # Laporan lengkap project
├── README.md                                     # Dokumentasi project
└── dashboard streamlit/
    ├── dashboard.py                              # Script dashboard streamlit
    ├── requirements.txt                          # Dependencies dashboard streamlit
    └── URL dashboard streamlit cloud.txt         # Link deployment streamlit cloud
```

## 🔍 Workflow
1. Data Collection
   * Menggunakan dataset keuangan yang diperoleg dari platform kaggle
3. Data Cleaning
   * Handling missing values
   * Data transformation
5. Exploratory Data Analysis (EDA)
   * Analisis pola pengeluaran
   * Insight dari kebiasaan finansial
7. Data Visualization
   * Grafik untuk memahami tren
9. Dashboard Development
   * Dibuat menggunakan Streamlit
   * Menyajikan insight secara interaktif

## 🚀 How to Run Dashboard
1. Masuk ke folder:
```
cd "dashboard streamlit"
```
2. Install dependencies:
```
pip install -r requirements.txt
```
3. Jalankan:
```
streamlit run dashboard.py
```

## 🌐 Deployment

Link dashboard bisa dilihat di file: [URL dashboard streamlit cloud.txt](https://github.com/AndikaHaikalS/CerminSaku/blob/main/DS/dashboard%20streamlit/URL%20dashboard%20streamlit%20cloud.txt)
