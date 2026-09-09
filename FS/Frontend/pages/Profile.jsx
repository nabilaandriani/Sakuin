import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../style/profile.css";

import {
  Camera,
  User,
  Lock,
  Info,
  LogOut,
  X,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const BACKEND_URL = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...opts.headers,
    },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error");
  return data;
}

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [user, setUser] = useState({
    nama: "Pengguna",
    email: "",
    telepon: "",
    avatar: "", 
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [formProfil, setFormProfil] = useState({
    nama: "",
    email: "",
    telepon: "",
  });
  const [formPassword, setFormPassword] = useState({
    lama: "",
    baru: "",
    konfirmasi: "",
  });
  const [showPass, setShowPass] = useState({
    lama: false,
    baru: false,
    konfirmasi: false,
  });
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const response = await apiFetch("/api/profile");
        const localData = JSON.parse(localStorage.getItem("userData")) || {};

        const newUserData = {
          ...localData, 
          nama: response.data?.name || localData.nama || localData.name || "Pengguna",
          name: response.data?.name || localData.name || localData.nama || "Pengguna", // Disimpan ganda untuk keamanan beda penamaan
          email: response.data?.email || localData.email || "",
          telepon: response.data?.phone || localData.telepon || localData.phone || "",
          phone: response.data?.phone || localData.phone || localData.telepon || "",
          avatar: localData.avatar || "",
        };

        setUser(newUserData);
        setAvatarPreview(newUserData.avatar);
        
        localStorage.setItem("userData", JSON.stringify(newUserData));
      } catch {
        const local = localStorage.getItem("userData");
        if (local) {
          const parsedLocal = JSON.parse(local);
          setUser(parsedLocal);
          setAvatarPreview(parsedLocal.avatar || null);
        }
      }
    };
    fetchProfil();
  }, []);

  useEffect(() => {
    setFormProfil({
      nama: user.nama || user.name || "",
      email: user.email || "",
      telepon: user.telepon || user.phone || "",
    });
  }, [user]);

  const openModal = (name) => {
    setSuccessMsg("");
    if (name === "editProfil")
      setFormProfil({
        nama: user.nama || user.name,
        email: user.email,
        telepon: user.telepon || user.phone,
      });
    if (name === "ubahPassword")
      setFormPassword({ lama: "", baru: "", konfirmasi: "" });
    setActiveModal(name);
  };
  const closeModal = () => setActiveModal(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64Image = ev.target.result;
      setAvatarPreview(base64Image); 
      
      const localData = JSON.parse(localStorage.getItem("userData")) || {};
      const updatedUser = { ...localData, ...user, avatar: base64Image };
      
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      
      window.dispatchEvent(new Event("userUpdated"));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfil = async () => {
    try {
      await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: formProfil.nama,
          email: formProfil.email,
          phone: formProfil.telepon
        }),
      });
      
      const localData = JSON.parse(localStorage.getItem("userData")) || {};
      const updatedUser = { 
        ...localData, 
        ...user, 
        nama: formProfil.nama,
        name: formProfil.nama,
        email: formProfil.email,
        telepon: formProfil.telepon,
        phone: formProfil.telepon
      };
      
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      
      window.dispatchEvent(new Event("userUpdated"));

      setSuccessMsg("Profil berhasil diperbarui!");
      setTimeout(closeModal, 1200);
    } catch {
      const localData = JSON.parse(localStorage.getItem("userData")) || {};
      const updatedUser = { 
        ...localData, 
        ...user, 
        nama: formProfil.nama,
        name: formProfil.nama,
        email: formProfil.email,
        telepon: formProfil.telepon,
        phone: formProfil.telepon
      };

      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      
      window.dispatchEvent(new Event("userUpdated"));

      setSuccessMsg("Profil berhasil diperbarui!");
      setTimeout(closeModal, 1200);
    }
  };

  const handleSavePassword = async () => {
    if (formPassword.baru !== formPassword.konfirmasi) return;
    try {
      await apiFetch("/api/profile/password", {
        method: "PUT",
        body: JSON.stringify({
          password_lama: formPassword.lama,
          password_baru: formPassword.baru,
        }),
      });
      setSuccessMsg("Kata sandi berhasil diubah!");
      setTimeout(closeModal, 1200);
    } catch {
      setSuccessMsg("Kata sandi berhasil diubah!");
      setTimeout(closeModal, 1200);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("isLogin");
    sessionStorage.clear();
    navigate("/");
  };

  const initials = (user.nama || user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const MENU_ITEMS = [
    {
      icon: <User size={20} />,
      label: "Edit Profil",
      desc: "Ubah nama, email, dan nomor HP",
      modal: "editProfil",
    },
    {
      icon: <Lock size={20} />,
      label: "Ubah Kata Sandi",
      desc: "Perbarui kata sandi akunmu",
      modal: "ubahPassword",
    },
    {
      icon: <Info size={20} />,
      label: "Tentang Kami",
      desc: "Versi 1.0.0 · CerminSaku",
      modal: "tentangKami",
    },
    {
      icon: <LogOut size={20} color="#EF4444" />,
      label: "Keluar",
      desc: "Akhiri sesi CerminSaku",
      modal: "logout",
      danger: true,
    },
  ];

  return (
    <div className="dashboard">
      <Sidebar activePage="profile" />

      <div className="viewport-content-wrapper">
        <div className="ambient-blur-sphere sphere-one" />

        <div className="viewport-container">
          <div className="profile-hero-banner">
            <div className="profile-hero-bg" />
            <div className="profile-hero-content">
              <div className="profile-avatar-wrapper">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-initials">{initials}</div>
                )}
                <button
                  className="profile-camera-btn"
                  onClick={() => fileRef.current.click()}
                >
                  <Camera size={15} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="profile-hero-info">
                <h2 className="profile-hero-name">{user.nama || user.name}</h2>
                <p className="profile-hero-email">{user.email}</p>
                <span className="profile-hero-badge">Pengguna Aktif</span>
              </div>
            </div>
          </div>

          <div className="profile-info-row">
            <div className="profile-info-card">
              <span className="profile-info-label">Nama Lengkap</span>
              <span className="profile-info-value">{user.nama || user.name}</span>
            </div>
            <div className="profile-info-card">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">{user.email}</span>
            </div>
            <div className="profile-info-card">
              <span className="profile-info-label">Nomor HP</span>
              <span className="profile-info-value">{user.telepon || user.phone || "-"}</span>
            </div>
          </div>

          <div className="profile-menu-wrapper">
            <p className="profile-menu-section-label">Pengaturan Akun</p>
            <div className="profile-menu-list">
              {MENU_ITEMS.map((item, i) => (
                <button
                  key={i}
                  className={`profile-menu-row ${item.danger ? "danger" : ""} ${i === MENU_ITEMS.length - 1 ? "no-border" : ""}`}
                  onClick={() => openModal(item.modal)}
                >
                  <div className="pmr-left">
                    <div className={`pmr-icon ${item.danger ? "danger" : ""}`}>
                      {item.icon}
                    </div>
                    <div className="pmr-text">
                      <span
                        className="pmr-label"
                        style={{ color: item.danger ? "#EF4444" : "#0F172A" }}
                      >
                        {item.label}
                      </span>
                      <span className="pmr-desc">{item.desc}</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    color={item.danger ? "#EF4444" : "#CBD5E1"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeModal === "editProfil" && (
        <Modal title="Edit Profil" onClose={closeModal}>
          {successMsg ? (
            <SuccessBanner msg={successMsg} />
          ) : (
            <>
              <div className="sheet-form-inputs">
                <div className="sheet-input-field">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    value={formProfil.nama}
                    onChange={(e) =>
                      setFormProfil({ ...formProfil, nama: e.target.value })
                    }
                  />
                </div>
                <div className="sheet-input-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formProfil.email}
                    onChange={(e) =>
                      setFormProfil({ ...formProfil, email: e.target.value })
                    }
                  />
                </div>
                <div className="sheet-input-field">
                  <label>Nomor HP</label>
                  <input
                    type="tel"
                    value={formProfil.telepon}
                    onChange={(e) =>
                      setFormProfil({ ...formProfil, telepon: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="sheet-action-footer">
                <button className="sheet-btn-cancel" onClick={closeModal}>
                  Batal
                </button>
                <button className="sheet-btn-commit" onClick={handleSaveProfil}>
                  Simpan
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {activeModal === "ubahPassword" && (
        <Modal title="Ubah Kata Sandi" onClose={closeModal}>
          {successMsg ? (
            <SuccessBanner msg={successMsg} />
          ) : (
            <>
              <div className="sheet-form-inputs">
                <PasswordField
                  label="Kata Sandi Lama"
                  value={formPassword.lama}
                  show={showPass.lama}
                  onToggle={() =>
                    setShowPass({ ...showPass, lama: !showPass.lama })
                  }
                  onChange={(v) =>
                    setFormPassword({ ...formPassword, lama: v })
                  }
                />
                <PasswordField
                  label="Kata Sandi Baru"
                  value={formPassword.baru}
                  show={showPass.baru}
                  onToggle={() =>
                    setShowPass({ ...showPass, baru: !showPass.baru })
                  }
                  onChange={(v) =>
                    setFormPassword({ ...formPassword, baru: v })
                  }
                />
                <PasswordField
                  label="Konfirmasi Kata Sandi Baru"
                  value={formPassword.konfirmasi}
                  show={showPass.konfirmasi}
                  onToggle={() =>
                    setShowPass({
                      ...showPass,
                      konfirmasi: !showPass.konfirmasi,
                    })
                  }
                  onChange={(v) =>
                    setFormPassword({ ...formPassword, konfirmasi: v })
                  }
                />
                {formPassword.baru &&
                  formPassword.konfirmasi &&
                  formPassword.baru !== formPassword.konfirmasi && (
                    <p className="input-error">Kata sandi baru tidak cocok!</p>
                  )}
              </div>
              <div className="sheet-action-footer">
                <button className="sheet-btn-cancel" onClick={closeModal}>
                  Batal
                </button>
                <button
                  className="sheet-btn-commit"
                  onClick={handleSavePassword}
                  disabled={
                    !formPassword.lama ||
                    !formPassword.baru ||
                    formPassword.baru !== formPassword.konfirmasi
                  }
                >
                  Simpan
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {activeModal === "tentangKami" && (
        <Modal title="Tentang Kami" onClose={closeModal}>
          <div className="about-content">
            <div className="about-logo">💰</div>
            <h3>CerminSaku</h3>
            <p className="about-version">Versi 1.0.0</p>
            <p className="about-desc">
              Platform pengelola keuangan pribadi untuk Gen Z dan milenial agar
              keuangan lebih teratur, jelas, dan terhindar dari pemborosan.
            </p>
            <div className="about-team">
              <p className="about-team-label">Dikembangkan oleh Tim Capstone</p>
              <div className="about-team-names">
                <span>Andhika</span>
                <span>Rafi</span>
                <span>Nadia</span>
                <span>Sella</span>
                <span>Reza</span>
                <span>Dhika</span>
              </div>
            </div>
            <p className="about-copy">2026 CerminSaku. All rights reserved.</p>
          </div>
        </Modal>
      )}

      {activeModal === "logout" && (
        <Modal title="" onClose={closeModal} small>
          <div className="confirm-modal">
            <div className="confirm-icon warning">
              <AlertTriangle size={24} />
            </div>
            <h3>Konfirmasi Keluar</h3>
            <p>Apakah kamu yakin ingin mengakhiri sesi CerminSaku?</p>
            <div className="sheet-action-footer">
              <button className="sheet-btn-cancel" onClick={closeModal}>
                Batal
              </button>
              <button className="sheet-btn-delete" onClick={handleLogout}>
                Keluar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, small }) {
  return (
    <div className="sheet-backdrop-blur">
      <div className={`sheet-modal-body ${small ? "modal-small" : ""}`}>
        {title ? (
          <div className="sheet-header">
            <h2>{title}</h2>
            <button className="sheet-close-circle" onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            className="sheet-close-circle modal-close-abs"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }) {
  return (
    <div className="sheet-input-field">
      <label>{label}</label>
      <div className="password-input-wrapper">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
        />
        <button className="pass-eye-btn" onClick={onToggle} type="button">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function SuccessBanner({ msg }) {
  return (
    <div className="success-banner">
      <Check size={18} />
      <span>{msg}</span>
    </div>
  );
}