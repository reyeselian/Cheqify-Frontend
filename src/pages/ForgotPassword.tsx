import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap";
const T = { gold: "#c58b2a", font: "'Raleway', sans-serif", text: "#1a1d23", muted: "#6b7280", border: "#e8eaed", bg: "#f0f2f5" };

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Ingresa tu correo electrónico."); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSent(true);
    } catch { setError("Error al procesar la solicitud. Intenta de nuevo."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <link rel="stylesheet" href={FONT_LINK} />
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-1px", background: "linear-gradient(90deg,#c58b2a,#27b6b1,#9b9b9b)", backgroundSize: "300%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Cheqify</div>
            <div style={{ color: "#94a3b8", fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase" }}>Sistema de Gestión de Cheques</div>
          </div>

          <div style={{ background: "#fff", borderRadius: "20px", padding: "2.2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: `1px solid ${T.border}` }}>
            {!sent ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fef3cd", border: "2px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 1rem" }}>🔐</div>
                  <h2 style={{ margin: 0, color: T.text, fontSize: "1.2rem", fontWeight: 700 }}>¿Olvidaste tu contraseña?</h2>
                  <p style={{ margin: "0.5rem 0 0", color: T.muted, fontSize: "0.85rem", lineHeight: 1.6 }}>Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
                </div>

                {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", color: "#dc2626", fontSize: "0.83rem", marginBottom: "1rem" }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "0.35rem", fontFamily: T.font }}>Correo electrónico</label>
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="correo@empresa.com"
                      style={{ width: "100%", background: "#f8fafc", border: `1.5px solid ${T.border}`, borderRadius: "11px", padding: "0.65rem 0.9rem", color: T.text, fontSize: "0.92rem", fontFamily: T.font, outline: "none", boxSizing: "border-box" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = T.gold)}
                      onBlur={(e)  => (e.currentTarget.style.borderColor = T.border)}
                    />
                  </div>
                  <button type="submit" disabled={loading}
                    style={{ width: "100%", padding: "0.8rem", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#c58b2a,#e8c47a)", color: "#111", fontWeight: 700, fontSize: "0.95rem", fontFamily: T.font, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 16px rgba(197,139,42,0.3)" }}>
                    {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#ecfdf5", border: "2px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.2rem" }}>✉️</div>
                <h2 style={{ margin: "0 0 0.6rem", color: T.text, fontSize: "1.2rem", fontWeight: 700 }}>¡Correo enviado!</h2>
                <p style={{ color: T.muted, fontSize: "0.86rem", lineHeight: 1.7, margin: "0 0 1.4rem" }}>
                  Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.<br />Revisa también tu carpeta de <strong>spam</strong>.
                </p>
                <div style={{ background: "#f0fdf4", border: "1.5px solid #a7f3d0", borderRadius: "12px", padding: "12px 16px", marginBottom: "1.4rem" }}>
                  <p style={{ margin: 0, color: "#059669", fontSize: "0.82rem", fontWeight: 600 }}>⏳ El enlace expira en 1 hora</p>
                </div>
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: "1.2rem" }}>
              <a href="/login" style={{ color: T.gold, textDecoration: "none", fontSize: "0.83rem", fontWeight: 600 }}>← Volver al inicio de sesión</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}