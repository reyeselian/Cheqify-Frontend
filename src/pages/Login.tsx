import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsElectron } from "../hooks/useIsElectron";

const Login: React.FC = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const isElectron = useIsElectron();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage]   = useState("");
  const [isError, setIsError]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      await login(email, password);
      navigate("/home");
    } catch (error: any) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Correo o contraseña incorrectos");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f0f2f5",
    }}>
      <div style={{
        display: "flex", width: "min(820px, 96vw)", height: "min(480px, 92vh)", minHeight: "420px",
        borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
      }}>

        {/* ── Panel izquierdo — oculto en móvil ── */}
        <div className="d-none d-md-flex" style={{
          width: "42%", background: "linear-gradient(160deg,#0f4c5c,#27b6b1)",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "clamp(24px,4vw,32px) clamp(20px,3vw,28px)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Círculos decorativos */}
          <div style={{ position:"absolute", bottom:"-50px", right:"-50px", width:"180px", height:"180px", borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
          <div style={{ position:"absolute", top:"-30px", left:"-30px", width:"110px", height:"110px", borderRadius:"50%", background:"rgba(197,139,42,0.1)" }}/>

          {/* Logo */}
          <div style={{ position:"relative", width:"100%", marginBottom:"10px" }}>
            <div className="cheqify-logo-left" style={{ fontSize:"clamp(22px,3vw,30px)", fontWeight:800, letterSpacing:"-1px", lineHeight:1 }}>
              Cheqify
            </div>
            <div style={{ fontSize:"12px", color:"#ffffff", fontWeight:600, marginTop:"3px" }}>
              Gestión de Cheques
            </div>
            <div style={{ width:"32px", height:"3px", background:"linear-gradient(90deg,#c58b2a,#e8c47a)", borderRadius:"2px", marginTop:"8px" }}/>
          </div>

          {/* Frase */}
          <div style={{ position:"relative", width:"100%", marginBottom:"12px" }}>
            <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.65)", fontStyle:"italic", lineHeight:1.6, margin:0 }}>
              "Controla tus finanzas<br/>con precisión"
            </p>
          </div>

          {/* Ícono cheque ilustrativo grande */}
          <div style={{ flex:1, display:"flex", alignItems:"flex-end", justifyContent:"center", width:"100%" }}>
            <svg viewBox="0 0 200 175" width="100%" style={{ maxHeight:"210px" }}>
              {/* Sombra */}
              <rect x="22" y="42" width="148" height="95" rx="8" fill="rgba(0,0,0,0.15)"/>
              {/* Cuerpo cheque */}
              <rect x="18" y="38" width="148" height="95" rx="8" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              {/* Franja superior */}
              <rect x="18" y="38" width="148" height="22" rx="8" fill="rgba(197,139,42,0.25)"/>
              <rect x="18" y="52" width="148" height="8" fill="rgba(197,139,42,0.25)"/>
              {/* Texto */}
              <text x="28" y="52" fontSize="7" fill="rgba(255,255,255,0.9)" fontWeight="700" fontFamily="sans-serif">CHEQUERA</text>
              <text x="130" y="52" fontSize="6" fill="rgba(255,255,255,0.5)" fontFamily="sans-serif">No. 0001</text>
              {/* Símbolo $ */}
              <circle cx="42" cy="93" r="15" fill="rgba(197,139,42,0.2)" stroke="rgba(197,139,42,0.5)" strokeWidth="1.5"/>
              <text x="42" y="98" fontSize="15" fill="#e8c47a" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">$</text>
              {/* Líneas */}
              <line x1="66" y1="80" x2="155" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <line x1="66" y1="93" x2="155" y2="93" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <line x1="66" y1="106" x2="130" y2="106" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              {/* Firma */}
              <line x1="105" y1="120" x2="158" y2="120" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
              <text x="131" y="128" fontSize="5.5" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="sans-serif">Firma autorizada</text>
              <path d="M108 118 Q116 113 123 117 Q129 121 136 116" stroke="rgba(197,139,42,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              {/* Sello */}
              <circle cx="55" cy="115" r="13" fill="none" stroke="rgba(197,139,42,0.45)" strokeWidth="1.5" strokeDasharray="3,2"/>
              <text x="55" y="117" fontSize="5" fill="rgba(197,139,42,0.6)" textAnchor="middle" fontFamily="sans-serif" fontWeight="700">PAGADO</text>
              {/* Pluma */}
              <g transform="translate(140, 0) rotate(-35, 30, 60)">
                <rect x="22" y="18" width="12" height="60" rx="3" fill="rgba(255,255,255,0.88)"/>
                <rect x="25" y="15" width="5" height="10" rx="1.5" fill="#c58b2a"/>
                <ellipse cx="28" cy="18" rx="6" ry="4" fill="rgba(197,139,42,0.8)"/>
                <rect x="22" y="42" width="12" height="2" fill="rgba(197,139,42,0.35)"/>
                <rect x="22" y="52" width="12" height="2" fill="rgba(197,139,42,0.35)"/>
                <polygon points="22,78 34,78 28,94" fill="rgba(197,139,42,0.75)"/>
                <polygon points="24,82 32,82 28,94" fill="#c58b2a"/>
              </g>
            </svg>
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div style={{
          flex: 1, background: "#fff", minWidth: 0, width: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "clamp(24px,4vw,44px) clamp(20px,4vw,40px)",
        }}>
          {/* Logo visible solo en móvil */}
          <div className="d-md-none" style={{ textAlign:"center", marginBottom:"20px" }}>
            <div className="cheqify-logo-text" style={{ fontSize:"2.2rem", fontWeight:800, letterSpacing:"0.5px", display:"inline-block" }}>Cheqify</div>
            <div style={{ fontSize:"12px", color:"#27b6b1", fontWeight:600, marginTop:"2px" }}>Gestión de Cheques</div>
          </div>

          <div style={{ marginBottom:"24px" }}>
            <h2 style={{ fontSize:"clamp(18px,2.5vw,24px)", fontWeight:700, color:"#1a1d23", margin:"0 0 6px" }}>Bienvenido</h2>
            <p style={{ fontSize:"13px", color:"#94a3b8", margin:0 }}>Accede a tu panel de gestión de cheques</p>
          </div>

          {message && (
            <div style={{ background: isError ? "#fef2f2" : "#ecfdf5", border:`1px solid ${isError?"#fecaca":"#a7f3d0"}`, borderRadius:"10px", padding:"10px 14px", fontSize:"13px", color: isError ? "#dc2626" : "#059669", marginBottom:"16px" }}>
              {message}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:"12px", padding:"12px 16px" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" style={{ flexShrink:0 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#94a3b8" strokeWidth="1.8"/>
                <path d="M22 6l-10 7L2 6" stroke="#94a3b8" strokeWidth="1.8"/>
              </svg>
              <input
                type="email" value={email} placeholder="correo@empresa.com" required
                onChange={(e) => { setEmail(e.target.value); setMessage(""); }}
                style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:"14px", color:"#1a1d23", fontFamily:"inherit" }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom:"10px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:"12px", padding:"12px 16px" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" style={{ flexShrink:0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#94a3b8" strokeWidth="1.8"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="#94a3b8" strokeWidth="1.8"/>
              </svg>
              <input
                type={showPass ? "text" : "password"} value={password} placeholder="••••••••" required
                onChange={(e) => { setPassword(e.target.value); setMessage(""); }}
                style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:"14px", color:"#1a1d23", fontFamily:"inherit" }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center" }}>
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#94a3b8" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="#94a3b8" strokeWidth="1.8"/></>
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Olvidaste contraseña */}
          <div style={{ textAlign:"right", marginBottom:"20px" }}>
            <a href="/forgot-password" style={{ fontSize:"12px", color:"#c58b2a", fontWeight:600, textDecoration:"none" }}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Botón */}
          <button onClick={handleSubmit as any} type="button"
            style={{ background:"linear-gradient(135deg,#0f4c5c,#27b6b1)", border:"none", borderRadius:"12px", padding:"14px", width:"100%", cursor:"pointer", boxShadow:"0 4px 16px rgba(39,182,177,0.35)", transition:"transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(39,182,177,0.45)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(39,182,177,0.35)"; }}
          >
            <span style={{ fontSize:"15px", fontWeight:700, color:"#fff", letterSpacing:"0.3px" }}>Iniciar Sesión</span>
          </button>

          {/* Registro */}
          {!isElectron && (
            <p style={{ textAlign:"center", marginTop:"18px", marginBottom:0, fontSize:"13px", color:"#94a3b8" }}>
              ¿No tienes cuenta?{" "}
              <a href="/register" style={{ color:"#27b6b1", fontWeight:600, textDecoration:"none" }}>Regístrate</a>
            </p>
          )}
        </div>
      </div>

      <style>{`
        .cheqify-logo-left {
          background: linear-gradient(90deg, #c58b2a, #e8d5a3, #9b9b9b);
          background-size: 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: metallicShine 3s linear infinite;
        }
        @keyframes metallicShine {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Login;