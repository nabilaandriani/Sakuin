import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

import logo from "../asset/logo.png";
import "../style/login.css";

export default function VerifyOtp() {
  const navigate = useNavigate();

  const email =
    localStorage.getItem(
      "verifyEmail"
    );

  const [otp, setOtp] =
    useState("");

  const [success, setSuccess] =
    useState(false);

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

  const handleVerify =
    async () => {

    if (!otp) {
      showToast(
        "Masukkan kode OTP",
        "error"
      );
      return;
    }

    try {
      const response =
        await fetch(
          "http://localhost:3000/api/auth/verify-otp",
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

      if (data.success) {

        setSuccess(true);

        setTimeout(() => {
          navigate("/login");
        }, 1800);

      } else {
        showToast(
          data.message,
          "error"
        );
      }

    } catch (error) {
      console.error(error);

      showToast(
        "Terjadi kesalahan server",
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
                  size={18}
                />
              ) : (
                <AlertCircle
                  size={18}
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

          {!success ? (
            <>

              <div
                style={{
                  textAlign:
                    "center",
                  marginBottom:
                    "22px"
                }}
              >
                <ShieldCheck
                  size={42}
                  color="#0E4834"
                />

                <h2
                  style={{
                    marginTop:
                      "12px"
                  }}
                >
                  Verifikasi OTP
                </h2>

                <p className="sub">
                  Masukkan kode OTP
                  yang dikirim ke
                  email kamu
                </p>

                <p
                  style={{
                    fontSize:
                      "13px",
                    color:
                      "#64748B",
                    marginTop:
                      "8px"
                  }}
                >
                  {email}
                </p>
              </div>

              <div className="login-field-group">
                <label>
                  Kode OTP
                </label>

                <div className="input-box">

                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Masukkan 6 digit OTP"
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
                  handleVerify
                }
              >
                Verifikasi
              </button>

            </>
          ) : (

            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "20px 0"
              }}
            >
              <div
                className="success-circle"
              >
                ✓
              </div>

              <h2>
                Verifikasi
                Berhasil
              </h2>

              <p
                className="sub"
                style={{
                  marginTop:
                    "12px"
                }}
              >
                Email kamu
                berhasil
                diverifikasi.

                <br />

                Mengalihkan
                ke login...
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}