import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  EyeOff,
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import logo from "../asset/logo.png";
import "../style/login.css";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirm, setConfirm] =
    useState("");

  // TOAST STATE
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
  });

  // SHOW TOAST
  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      show: true,
      message,
      type
    });

    setTimeout(() => {
      setToast(prev => ({
        ...prev,
        show: false
      }));
    }, 2500);
  };

  // REGISTER
  const handleRegister =
    async () => {

    if (
      !name ||
      !email ||
      !password ||
      !confirm
    ) {
      showToast(
        "Isi semua data dulu!",
        "error"
      );
      return;
    }

    if (
      password !== confirm
    ) {
      showToast(
        "Password tidak sama!",
        "error"
      );
      return;
    }

    try {
      const response =
        await fetch(
          "http://localhost:3000/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              name,
              email,
              password
            })
          }
        );

      const data =
        await response.json();

        if (data.success) {

        localStorage.setItem(
          "verifyEmail",
          email
        );

        showToast(
          "OTP berhasil dikirim!",
          "success"
        );

        setTimeout(() => {
          navigate(
            "/verify-otp"
          );
        }, 1200);

      } else {

        showToast(
          data.message ||
          "Gagal mendaftar.",
          "error"
        );
      }

    } catch (error) {
      console.error(error);

      showToast(
        "Terjadi kesalahan koneksi ke server.",
        "error"
      );
    }
  };

  return (
    <div className="login-page">

      {/* TOAST */}
      {toast.show && (
        <div
          className={`toast-login ${toast.type}`}
        >
          <div className="toast-content-login">

            <div className="toast-icon-wrapper">
              {toast.type ===
              "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>

            <span>
              {toast.message}
            </span>

          </div>
        </div>
      )}

      <div className="login-ambient-glow login-sphere-one"></div>
      <div className="login-ambient-glow login-sphere-two"></div>

      <div className="login-central-shell">

        <div className="login-logo">
          <img
            src={logo}
            alt="CerminSaku Logo"
          />
        </div>

        <div className="login-card">

          <h2>
            Daftar Akun
          </h2>

          <p className="sub">
            Mulai kelola
            finansialmu lebih
            pintar bersama
            CerminSaku
          </p>

          {/* NAMA */}
          <div className="login-field-group">
            <label>
              Nama Lengkap
            </label>

            <div className="input-box">
              <User size={16} />

              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="login-field-group">
            <label>Email</label>

            <div className="input-box">
              <Mail size={16} />

              <input
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="login-field-group">
            <label>Password</label>

            <div className="input-box">
              <Lock size={16} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Buat Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />

              {showPassword ? (
                <Eye
                  size={16}
                  className="eye"
                  onClick={() =>
                    setShowPassword(
                      false
                    )
                  }
                />
              ) : (
                <EyeOff
                  size={16}
                  className="eye"
                  onClick={() =>
                    setShowPassword(
                      true
                    )
                  }
                />
              )}
            </div>
          </div>

          {/* KONFIRM PASSWORD */}
          <div className="login-field-group">
            <label>
              Konfirmasi Password
            </label>

            <div className="input-box">
              <Lock size={16} />

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                placeholder="Ulangi Password"
                value={confirm}
                onChange={(e) =>
                  setConfirm(
                    e.target.value
                  )
                }
              />

              {showConfirm ? (
                <Eye
                  size={16}
                  className="eye"
                  onClick={() =>
                    setShowConfirm(
                      false
                    )
                  }
                />
              ) : (
                <EyeOff
                  size={16}
                  className="eye"
                  onClick={() =>
                    setShowConfirm(
                      true
                    )
                  }
                />
              )}
            </div>
          </div>

          <button
            className="login-btn"
            onClick={
              handleRegister
            }
          >
            Daftar Sekarang
          </button>

          <p className="bottom-text">
            Sudah punya akun?

            <span
              onClick={() =>
                navigate(
                  "/login"
                )
              }
            >
              {" "}Masuk
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}