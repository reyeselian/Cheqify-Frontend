// src/pages/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { FaLock, FaEnvelope, FaShieldAlt } from "react-icons/fa";

const FONT = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";

export default function AdminLogin() {
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Completa todos los campos."); return; }
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Credenciales incorrectas.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <link rel="stylesheet" href={FONT} />
      <div style={{
        minHeight: "100vh", fontFamily: "'Outfit', sans-serif",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div style={{
          position: "relative", zIndex: 10,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "3rem 2.5rem",
          width: "100%", maxWidth: "420px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
          animation: "slideUp 0.4s ease",
        }}>
          {/* Logo / icon */}
          <div style={{ textAlign: "center", marginBottom: "2.2rem" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "18px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem", fontSize: "1.6rem", color: "#fff",
              boxShadow: "0 8px 25px rgba(99,102,241,0.4)",
            }}>
              <FaShieldAlt />
            </div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
              Panel Administrativo
            </h1>
            <p style={{ margin: "0.4rem 0 0", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
              Acceso restringido · Solo administradores
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Correo
              </label>
              <div style={{ position: "relative" }}>
                <FaEnvelope style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cheqify.com"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
                    color: "#fff", padding: "12px 14px 12px 40px",
                    fontSize: "0.9rem", outline: "none", fontFamily: "'Outfit', sans-serif",
                    boxSizing: "border-box", transition: "border-color 0.18s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <FaLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: "0.82rem" }} />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
                    color: "#fff", padding: "12px 14px 12px 40px",
                    fontSize: "0.9rem", outline: "none", fontFamily: "'Outfit', sans-serif",
                    boxSizing: "border-box", transition: "border-color 0.18s",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: "0.5rem",
              background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none", borderRadius: "12px", color: "#fff",
              fontWeight: 700, fontSize: "0.95rem", padding: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: loading ? "none" : "0 4px 18px rgba(99,102,241,0.45)",
              transition: "all 0.2s",
            }}>
              {loading ? "Verificando..." : "Ingresar al Panel"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
            Cheqify Admin · Acceso protegido
          </p>
        </div>

        <style>{`
          @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    </>
  );
}