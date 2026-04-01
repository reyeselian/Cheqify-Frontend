// src/pages/VerifyEmail.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Status = "loading" | "success" | "error" | "expired";

const VerifyEmail: React.FC = () => {
  const [searchParams]        = useSearchParams();
  const navigate              = useNavigate();
  const [status, setStatus]   = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail]     = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No se proporcionó un token de verificación.");
      return;
    }

    const verify = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => navigate("/login"), 3500);
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Enlace inválido o expirado.";
        setStatus(msg.includes("expirado") ? "expired" : "error");
        setMessage(msg);
      }
    };

    verify();
  }, [token]);

  const handleResend = async () => {
    if (!email.trim() || !email.includes("@")) {
      setResendMsg("Ingresa un correo válido.");
      return;
    }
    setResending(true);
    setResendMsg("");
    try {
      const { data } = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      setResendMsg(data.message);
    } catch {
      setResendMsg("Error al reenviar. Intenta de nuevo.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; }
        .ve-root {
          min-height: 100vh; display: flex; align-items: center;
          justify-content: center; background: #f0f2f5;
          font-family: 'DM Sans', sans-serif; padding: 2rem 1rem;
        }
        .ve-card {
          background: #fff; border-radius: 24px; padding: 2.8rem 2.4rem;
          max-width: 440px; width: 100%; text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.09);
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ve-icon {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; margin: 0 auto 1.5rem;
        }
        .ve-title {
          font-family: 'Syne', sans-serif; font-size: 1.4rem;
          font-weight: 800; color: #1a1d23; margin-bottom: 0.6rem;
        }
        .ve-msg {
          color: #6b7280; font-size: 0.9rem;
          line-height: 1.6; margin-bottom: 1.8rem;
        }
        .ve-btn {
          display: inline-block; padding: 12px 32px;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: #fff; border: none; border-radius: 12px;
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 0.9rem; cursor: pointer;
          box-shadow: 0 4px 16px rgba(14,165,233,0.3);
          transition: all 0.2s; text-decoration: none;
        }
        .ve-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(14,165,233,0.4); }
        .spinner {
          width: 44px; height: 44px; border-radius: 50%;
          border: 4px solid #e8eaed; border-top-color: #0ea5e9;
          animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .resend-section { margin-top: 1.5rem; border-top: 1px solid #e8eaed; padding-top: 1.5rem; }
        .resend-label { color: #6b7280; font-size: 0.82rem; margin-bottom: 0.75rem; }
        .resend-input {
          width: 100%; padding: 10px 14px; border: 1.5px solid #e8eaed;
          border-radius: 10px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif;
          outline: none; color: #1a1d23; background: #f8fafc;
          transition: border-color 0.2s; margin-bottom: 0.75rem;
        }
        .resend-input:focus { border-color: #0ea5e9; background: #fff; }
        .resend-btn {
          width: 100%; padding: 10px; background: #f0f2f5; border: 1.5px solid #e8eaed;
          border-radius: 10px; color: #374151; font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
        }
        .resend-btn:hover:not(:disabled) { border-color: #0ea5e9; color: #0ea5e9; background: #ecfeff; }
        .resend-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .resend-feedback { font-size: 0.8rem; color: #059669; margin-top: 0.6rem; }
        .logo {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.8rem;
          color: #0ea5e9; letter-spacing: -1px; margin-bottom: 0.2rem;
        }
        .logo-sub {
          color: #94a3b8; font-size: 0.65rem; letter-spacing: 3px;
          text-transform: uppercase; margin-bottom: 2rem;
        }
      `}</style>

      <div className="ve-root">
        <div style={{ width: "100%", maxWidth: "440px" }}>

          <div className="logo" style={{ textAlign: "center" }}>Cheqify</div>
          <div className="logo-sub" style={{ textAlign: "center" }}>Sistema de Gestión de Cheques</div>

          <div className="ve-card">

            {/* LOADING */}
            {status === "loading" && (
              <>
                <div className="spinner" />
                <div className="ve-title">Verificando tu correo...</div>
                <p className="ve-msg">Por favor espera un momento.</p>
              </>
            )}

            {/* SUCCESS */}
            {status === "success" && (
              <>
                <div className="ve-icon" style={{ background: "#ecfdf5", border: "2px solid #a7f3d0" }}>✅</div>
                <div className="ve-title">¡Correo verificado!</div>
                <p className="ve-msg">
                  {message}<br/><br/>
                  Serás redirigido al inicio de sesión en unos segundos...
                </p>
                <a href="/login" className="ve-btn">Ir a iniciar sesión</a>
              </>
            )}

            {/* EXPIRED */}
            {status === "expired" && (
              <>
                <div className="ve-icon" style={{ background: "#fffbeb", border: "2px solid #fde68a" }}>⏳</div>
                <div className="ve-title">Enlace expirado</div>
                <p className="ve-msg">{message}</p>
                <div className="resend-section">
                  <p className="resend-label">Ingresa tu correo para recibir un nuevo enlace:</p>
                  <input
                    className="resend-input" type="email" placeholder="correo@empresa.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="resend-btn" onClick={handleResend} disabled={resending}>
                    {resending ? "Enviando..." : "📧 Reenviar verificación"}
                  </button>
                  {resendMsg && <p className="resend-feedback">{resendMsg}</p>}
                </div>
              </>
            )}

            {/* ERROR */}
            {status === "error" && (
              <>
                <div className="ve-icon" style={{ background: "#fef2f2", border: "2px solid #fecaca" }}>❌</div>
                <div className="ve-title">Enlace inválido</div>
                <p className="ve-msg">{message}</p>
                <a href="/login" className="ve-btn">Volver al inicio</a>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;