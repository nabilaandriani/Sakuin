import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../asset/logo.png";
import "../style/landing.css";

import {
  Wallet,
  BarChart2,
  Target,
  PieChart,
  UserCheck,
  PenLine,
  LineChart,
  Trophy,
  Moon,
  Sun,
  ArrowRight,
  ChevronRight,
  ArrowUp,
} from "lucide-react";
import dashboard from "../asset/dashboard.png";
import darkmodeDashboard from "../asset/darkmode_dashboard.png";

export default function Landing() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    const sections = document.querySelectorAll(
      "#fitur, #cara-kerja, #tabungan",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "-45% 0px -50% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("landing_theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");

      localStorage.setItem("landing_theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");

      localStorage.setItem("landing_theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const els = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.01,
      },
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="landing-global-env">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo-box" onClick={scrollToTop}>
          <img src={logo} alt="Sakuin Logo" />
        </div>

        <div className="nav-menu">
          <a
            href="#fitur"
            className={activeSection === "fitur" ? "active" : ""}
          >
            Fitur
          </a>
          <a
            href="#cara-kerja"
            className={activeSection === "cara-kerja" ? "active" : ""}
          >
            Cara Kerja
          </a>

          <a
            href="#tabungan"
            className={activeSection === "tabungan" ? "active" : ""}
          >
            Tabungan
          </a>
        </div>

        <div className="nav-btn">
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="nav-btn-outline"
            onClick={() => navigate("/login")}
          >
            Masuk
          </button>

          <button
            className="nav-btn-primary"
            onClick={() => navigate("/register")}
          >
            Daftar Gratis
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero reveal">
        <div className="hero-grid-overlay"></div>
        <div className="hero-samar-glow-stream"></div>

        <div className="money-rain-wrapper">
          <div className="falling-bill bill-1">Rp</div>
          <div className="falling-bill bill-2">Rp</div>
          <div className="falling-bill bill-3">Rp</div>
          <div className="falling-bill bill-4">Rp</div>
          <div className="falling-bill bill-5">Rp</div>
          <div className="falling-bill bill-6">Rp</div>
          <div className="falling-bill bill-7">Rp</div>
          <div className="falling-bill bill-8">Rp</div>
        </div>

        <div className="hero-inner-content">
          <h1>
            Kelola Keuangan Jadi <br />
            <span className="accent-gradient-text">Lebih Mudah.</span>
          </h1>

          <p className="desc">
            Nikmati fitur keuangan modern yang membantu Anda memahami dan
            mengatur keuangan dengan lebih jelas. Wujudkan masa depan yang lebih
            aman dengan desain yang nyaman dan data yang terstruktur.
          </p>

          <div className="hero-btn">
            <button
              className="btn-primary hero-main-cta"
              onClick={() => navigate("/register")}
            >
              <span>Mulai Gratis Sekarang</span>
              <ChevronRight size={14} />
            </button>
            <button
              className="btn-outline"
              onClick={() => {
                document.getElementById("fitur")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              Lihat Fitur
            </button>
          </div>

          <div className="dashboard-placeholder-wrapper">
            <div className="dashboard-placeholder">
              <div className="placeholder-inner-glow">
                <img
                  src={darkMode ? darkmodeDashboard : dashboard}
                  alt="Preview dashboard Sakuin"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR SECTION */}
      <section id="fitur" className="fitur reveal">
        <p className="subtitle">SEMUA YANG KAMU BUTUHKAN</p>
        <h2>
          Fitur Lengkap,
          <br />
          Satu Platform
        </h2>
        <p className="fitur-desc">
          Sakuin membuang semua fungsi rumit and fokus menyediakan instrumen
          keuangan mendasar untuk mempermudah manajemen kas harian Anda.
        </p>

        <div className="premium-fitur-bento-grid">
          {/* 1. Transaksi */}
          <div className="card active-card-style reveal delay-100">
            <div className="icon-box">
              <Wallet size={22} />
            </div>
            <h4>Pemasukan & Pengeluaran</h4>
            <p>
              Input transaksi kas masuk (inflow) and beban keluar (outflow)
              dengan cepat, kategorikan otomatis, and pantau ringkasan saldo
              bersih harian secara real-time.
            </p>
          </div>

          {/* 2. Visualisasi Grafik */}
          <div className="card outline-card-style reveal delay-200">
            <div className="icon-box">
              <BarChart2 size={22} />
            </div>
            <h4>Visualisasi Grafik</h4>
            <p>
              Bar chart, pie chart, dan analisis grafik tren keuangan bulanan
              membantu Anda membaca pola mutasi dana kas secara instan.
            </p>
          </div>

          {/* 3. Dream Savings */}
          <div className="card active-card-style reveal delay-300">
            <div className="icon-box">
              <Target size={22} />
            </div>
            <h4>Dream Savings</h4>
            <p>
              Tetapkan target tabungan impianmu secara berkala, lacak persentase
              progres, and raih impian finansial secara terencana.
            </p>
          </div>

          {/* 4. Batas Budget Anggaran */}
          <div className="card outline-card-style reveal delay-100">
            <div className="icon-box">
              <PieChart size={22} />
            </div>
            <h4>Manajemen Limit Budget</h4>
            <p>
              Atur batasan kuota pengeluaran bulanan maksimal Anda secara
              terstruktur agar kondisi finansial terhindar dari defisit kas
              harian.
            </p>
          </div>
        </div>
      </section>

      {/*HOW IT WORKS */}
      <section id="cara-kerja" className="how-it-works reveal">
        <p className="subtitle">MUDAH DALAM 4 LANGKAH</p>
        <h2>
          Mulai dalam <br />
          Hitungan Menit
        </h2>
        <p className="how-desc">
          Tidak perlu keahlian khusus. Sakuin dirancang agar siapa pun bisa
          langsung pakai dan merasakan manfaatnya hari ini.
        </p>

        <div className="how-grid">
          <div className="how-card reveal delay-100">
            <div className="how-num">01</div>
            <div className="how-icon">
              <Wallet size={26} />
            </div>
            <h4>Daftar Gratis</h4>
            <p>
              Buat akun dalam 30 detik. Tidak perlu kartu kredit, tidak ada
              biaya tersembunyi.
            </p>
          </div>

          <div className="how-arrow reveal delay-100">
            <ArrowRight size={20} />
          </div>

          <div className="how-card reveal delay-200">
            <div className="how-num">02</div>
            <div className="how-icon">
              <PenLine size={26} />
            </div>
            <h4>Catat Transaksi</h4>
            <p>
              Input pemasukan dan pengeluaran harian dengan cepat. Kategorikan
              otomatis atau manual.
            </p>
          </div>

          <div className="how-arrow reveal delay-200">
            <ArrowRight size={20} />
          </div>

          <div className="how-card reveal delay-300">
            <div className="how-num">03</div>
            <div className="how-icon">
              <LineChart size={26} />
            </div>
            <h4>Pantau Keuangan</h4>
            <p>
              Lihat grafik, insight otomatis, dan notifikasi budget yang
              membantu kamu lebih sadar finansial.
            </p>
          </div>

          <div className="how-arrow reveal delay-300">
            <ArrowRight size={20} />
          </div>

          <div className="how-card how-card--highlight reveal delay-400">
            <div className="how-num">04</div>
            <div className="how-icon">
              <Trophy size={26} />
            </div>
            <h4>Capai Impianmu</h4>
            <p>
              Tetapkan target Dream Savings dan rayakan setiap pencapaian menuju
              kebebasan finansialmu.
            </p>
          </div>
        </div>
      </section>

      {/*DREAM SAVINGS*/}
      <section id="tabungan" className="dream reveal">
        <div className="dream-container">
          <div className="dream-cards reveal-left">
            <div className="dream-card reveal delay-100">
              <div className="dream-header">
                <div>
                  <p className="label">Target Impian</p>
                  <h3>Liburan ke Bali</h3>
                </div>
                <div className="right">
                  <span className="percent">63%</span>
                  <p className="amount">Rp 10 jt / 15 jt</p>
                </div>
              </div>
              <div className="dream-bar">
                <div className="dream-fill"></div>
              </div>
            </div>

            <div className="dream-card reveal delay-200">
              <div className="dream-header">
                <div>
                  <p className="label">Target Impian</p>
                  <h3>Laptop Baru</h3>
                </div>
                <div className="right">
                  <span className="percent">41%</span>
                  <p className="amount">Rp 8,2 jt / 20 jt</p>
                </div>
              </div>
              <div className="dream-bar">
                <div className="dream-fill" style={{ width: "41%" }} />
              </div>
            </div>

            <div className="dream-card reveal delay-300">
              <div className="dream-header">
                <div>
                  <p className="label">Target Impian</p>
                  <h3>Dana Darurat</h3>
                </div>
                <div className="right">
                  <span className="percent">80%</span>
                  <p className="amount">Rp 24 jt / 30 jt</p>
                </div>
              </div>
              <div className="dream-bar">
                <div className="dream-fill" style={{ width: "80%" }} />
              </div>
            </div>
          </div>

          <div className="dream-text reveal-right">
            <p className="subtitle">Dream Saving</p>
            <h2>
              Wujudkan Impianmu
              <br />
              Sekarang
            </h2>
            <p>
              Tetapkan target keuangan, atur kontribusi bulanan, dan pantau
              progres tabunganmu secara berkala. Dengan fitur ini, kamu bisa
              merencanakan masa depan dengan lebih terarah.
            </p>
            <p>
              Buat impian yang kamu mau sekarang dan mulai langkah pertamamu
              untuk mencapainya dengan lebih mudah dan terstruktur!
            </p>

            <button
              className="dream-cta-style"
              onClick={() => navigate("/register")}
            >
              Mulai Nabung Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-final reveal">
        <div className="cta-box">
          <h2>
            Mulai Perjalanan
            <br />
            Keuanganmu Sekarang
          </h2>
          <p>
            Daftar dalam 30 detik. Tidak perlu kartu kredit. Mulai kendalikan
            keuanganmu sekarang juga.
          </p>
          <button className="cta-btn" onClick={() => navigate("/register")}>
            Daftar Gratis
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="kontak" className="footer">
        <div className="footer-workspace-shell">
          <div
            className="footer-brand-hub"
            onClick={() => navigate("/dashboard")}
            style={{ cursor: "pointer" }}
          >
            <h2 className="footer-title-brand">Sakuin</h2>
            <p className="footer-brand-brief">
              Aplikasi inovatif untuk memudahkan Anda mencatat pembukuan
              keuangan dan memantau rencana anggaran secara terstruktur.
            </p>
          </div>

          <div className="footer-nav-col">
            <h5>Tautan</h5>
            <ul>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/tentang-kami");
                  }}
                >
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#fitur">Fitur</a>
              </li>
              <li>
                <a href="#kontak">Kontak</a>
              </li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h5>Kontak Kami</h5>
            <ul>
              <li className="contact-plain-text">Email: sakuin@gmail.com</li>
              <li className="contact-plain-text">Telepon: (031) 82912312</li>
              <li className="contact-plain-text">
                Alamat: Jl. Ketintang Wiyata Gedung A10, Ketintang, Gayungan,
                Surabaya, East Java 60231
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-copyright-bar">
          <p>© 2026 Sakuin. Hak cipta dilindungi.</p>

          <button
            className="scroll-to-top-btn"
            onClick={scrollToTop}
            title="Kembali ke Atas"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}
