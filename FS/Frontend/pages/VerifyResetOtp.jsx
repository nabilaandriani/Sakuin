import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import logo from "../asset/logo.png";
import "../style/login.css";

export default function VerifyResetOtp() {

  const navigate =
    useNavigate();

  const [otp, setOtp] =
    useState("");

  const email =
    localStorage.getItem(
      "resetEmail"
    );

  const [toast, setToast] =
    useState({
      show: false,
      message: "",
      type: "success"
    });

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

  const handleVerifyOtp =
    async () => {

    if (!otp) {

      showToast(
        "Masukkan kode OTP!",
        "error"
      );

      return;
    }

    try {

      const response =
        await fetch(
          "http://localhost:3000/api/auth/verify-reset-otp",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                email,
                otp
              })
          }
        );

      const data =
        await response.json();

      if (
        data.success
      ) {

        showToast(
          "OTP berhasil diverifikasi!",
          "success"
        );

        setTimeout(() => {

          navigate(
            "/new-password"
          );

        }, 1200);

      } else {

        showToast(
          data.message ||
          "OTP tidak valid!",
          "error"
        );
      }

    } catch {

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
          className={`
          toast-login
          ${toast.type}
          `}
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

          <h2>
            Verifikasi OTP
          </h2>

          <p className="sub">
            Masukkan kode OTP
            yang dikirim ke email
            kamu
          </p>

          <div className="login-field-group">

            <label>
              Kode OTP
            </label>

            <div className="input-box">

              <ShieldCheck
                size={16}
              />

              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                  )
                }
              />

            </div>
          </div>

          <button
            className="login-btn"
            onClick={
              handleVerifyOtp
            }
          >
            Verifikasi OTP
          </button>

          <p className="bottom-text">

            Kembali ke

            <span
              onClick={() =>
                navigate(
                  "/login"
                )
              }
            >
              {" "}
              Login
            </span>

          </p>

        </div>
      </div>
    </div>
  );
}