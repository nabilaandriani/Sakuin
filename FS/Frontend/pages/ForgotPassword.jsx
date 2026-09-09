import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Mail,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import logo from "../asset/logo.png";
import "../style/login.css";

export default function ForgotPassword() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

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

  const handleSendOtp =
    async () => {

    if (!email) {

      showToast(
        "Isi email dulu!",
        "error"
      );

      return;
    }

    try {

      const response =
        await fetch(
          "http://localhost:3000/api/auth/forgot-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                email
              })
          }
        );

      const data =
        await response.json();

      if (
        data.success
      ) {

        localStorage.setItem(
          "resetEmail",
          email
        );

        showToast(
          "OTP berhasil dikirim!",
          "success"
        );

        setTimeout(() => {

          navigate(
            "/verify-reset-otp"
          );

        }, 1200);

      } else {

        showToast(
          data.message,
          "error"
        );
      }

    } catch {

      showToast(
        "Server error",
        "error"
      );
    }
  };

  return (
    <div className="login-page">

      {toast.show && (
        <div
          className={`toast-login ${toast.type}`}
        >
          <div className="toast-content-login">

            <div className="toast-icon-wrapper">

              {toast.type ===
              "success" ? (
                <CheckCircle size={20}/>
              ) : (
                <AlertCircle size={20}/>
              )}

            </div>

            <span>
              {toast.message}
            </span>

          </div>
        </div>
      )}

      <div className="login-central-shell">

        <div className="login-logo">
          <img
            src={logo}
            alt="logo"
          />
        </div>

        <div className="login-card">

          <h2>
            Lupa Password
          </h2>

          <p className="sub">
            Masukkan email
            untuk menerima
            OTP reset password
          </p>

          <div className="login-field-group">

            <label>Email</label>

            <div className="input-box">

              <Mail size={16}/>

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

          <button
            className="login-btn"
            onClick={
              handleSendOtp
            }
          >
            Kirim OTP
          </button>

          <p className="bottom-text">

            Ingat password?

            <span
              onClick={() =>
                navigate(
                  "/login"
                )
              }
            >
              {" "}
              Kembali Masuk
            </span>

          </p>

        </div>
      </div>
    </div>
  );
}