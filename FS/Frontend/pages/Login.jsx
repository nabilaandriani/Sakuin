import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  EyeOff,
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import logo from "../asset/logo.png";
import "../style/login.css";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
  console.log(
    "CURRENT PATH:",
    window.location.pathname
  );

  console.log(
    "IS LOGIN:",
    localStorage.getItem("isLogin")
  );

  if (
    localStorage.getItem(
      "isLogin"
    )
  ) {
    navigate("/dashboard");
  }
}, [navigate]);

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  // TOAST STATE
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
  });

  // SHOW TOAST FUNCTION
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

  // LOGIN
  const handleLogin =
async () => {

  if (
    !email ||
    !password
  ) {

    showToast(
      "Isi email dan password!",
      "error"
    );

    return;
  }

  try {

    const response =
      await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              email,
              password
            })
        }
      );

    const data =
      await response.json();

    if (
      data.success
    ) {

      localStorage.setItem(
        "isLogin",
        "true"
      );

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "userData",
        JSON.stringify(
          data.data
        )
      );

      showToast(
        "Login berhasil!",
        "success"
      );

      setTimeout(() => {

        navigate(
          "/dashboard"
        );

      }, 1200);

    } else {

      showToast(
        data.message ||
        "Email atau password salah!",
        "error"
      );
    }

  } catch (
    error
  ) {

    console.error(
      error
    );

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
                <CheckCircle
                  size={20}
                />
              ) : (
                <AlertCircle
                  size={20}
                />
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
            alt="logo"
          />
        </div>

        <div className="login-card">

          <h2>Masuk</h2>

          <p className="sub">
            Masukkan email dan
            password untuk
            mengakses
            CerminSaku
          </p>

          {/* EMAIL */}
          <div className="login-field-group">
            <label>Email</label>

            <div className="input-box">
              <Mail size={18} />

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

            <div className="label-row">
              <label>
                Password
              </label>

              <span
                className="forgot"
                onClick={() => {
                  console.log(
                    "CLICK FORGOT"
                  );

                  navigate(
                    "/forgot-password"
                  );
                }}
              >
                Lupa Password?
              </span>
            </div>

            <div className="input-box">
              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />

              {showPassword ? (
                <Eye
                  size={18}
                  className="eye"
                  onClick={() =>
                    setShowPassword(
                      false
                    )
                  }
                />
              ) : (
                <EyeOff
                  size={18}
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

          <button
            className="login-btn"
            onClick={handleLogin}
          >
            Masuk
          </button>

          <p className="bottom-text">
            Belum punya akun?

            <span
              onClick={() =>
                navigate(
                  "/register"
                )
              }
            >
              {" "}
              Daftar sekarang
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}