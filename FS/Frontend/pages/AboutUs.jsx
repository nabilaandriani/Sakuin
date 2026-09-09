import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Target, Award } from "lucide-react";
import logo from "../asset/logo.png";
import "../style/landing.css"; 

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="landing-global-env clean-about-page">
      <div className="about-back-header">
        <button className="btn-outline back-to-landing-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={16} />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      <section className="about-hero-core">
        <div className="about-inner-shell">
          <div className="about-brand-badge">
            <img src={logo} alt="CerminSaku" />

          </div>
          
          <h1>Transparansi Finansial <br /><span className="accent-gradient-text">Dalam Genggaman.</span></h1>
          <p className="about-brief-desc">
            CerminSaku lahir sebagai solusi pembukuan modern yang berfokus pada kemudahan, kejelasan data, and kenyamanan visual untuk mengontrol kas harian Anda tanpa fungsi yang rumit.
          </p>

          <div className="about-bento-vision">
            <div className="about-vision-card">
              <div className="about-icon-shape"><Target size={20} /></div>
              <h4>Visi Kami</h4>
              <p>Menjadi refleksi keuangan pribadi yang andal, membantu mahasiswa and masyarakat membangun kebiasaan finansial yang sehat dan terstruktur.</p>
            </div>

            <div className="about-vision-card">
              <div className="about-icon-shape"><Users size={20} /></div>
              <h4>Tim Pengembang</h4>
              <p>
                Dikembangkan oleh tim Coding Capstone yang terdiri dari talenta Fullstack Development, Data Science, dan Artificial Intelligence untuk menghadirkan pengalaman finansial digital yang modern, efisien, dan relevan bagi generasi masa kini.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}