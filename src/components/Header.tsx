import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useConfig } from "../context/ConfigContext";
import { FaUserCircle, FaSignOutAlt, FaUserCog, FaBuilding, FaTimes } from "react-icons/fa";

const IconInicio = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
    <path d="M12 3L4 9v12h5v-5h6v5h5V9L12 3z" fill="#c58b2a" opacity="0.25"/>
    <path d="M12 3L4 9v12h5v-5h6v5h5V9L12 3z" stroke="#c58b2a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconCheques = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
    <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" fill="#27b6b1" opacity="0.25"/>
    <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="#27b6b1" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M3 10h18M7 15h4M15 15h2" stroke="#27b6b1" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconReportes = () => (
  <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
    <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" fill="#4ade80" opacity="0.25"/>
    <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M8 16v-4M12 16V8M16 16v-6" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function Header() {
  const { user, logout } = useAuth();
  const { config }       = useConfig();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [scrollY, setScrollY]   = useState(0);
  const [hidden, setHidden]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHidden(window.scrollY > scrollY && window.scrollY > 80);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY]);

  useEffect(() => { setDrawerOpen(false); }, [location]);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  if (!user) return null;

  const getBackground = () => {
    switch (config.tema) {
      case "claro":    return "linear-gradient(135deg, #fff, #e0e0e0)";
      case "metalico": return `linear-gradient(135deg, ${config.colorPrincipal}, #888)`;
      default:         return `linear-gradient(135deg, ${config.colorPrincipal}, #111)`;
    }
  };

  const textColor = config.tema === "claro" ? "#111" : "#fff";

  const navLinks = [
    { href: "/home",     label: "Inicio",   icon: <IconInicio /> },
    { href: "/cheques",  label: "Cheques",  icon: <IconCheques /> },
    { href: "/reportes", label: "Reportes", icon: <IconReportes /> },
  ];

  const go = (path: string) => { navigate(path); setDrawerOpen(false); };

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: getBackground(),
        borderBottom: `2px solid ${config.colorPrincipal}`,
        transition: "transform 0.4s ease, opacity 0.4s ease",
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        opacity: hidden ? 0 : 1,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}>
        <Container>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0" }}>

            {/* Logo */}
            <div className="cheqify-logo-text" onClick={() => go("/home")}
              style={{ fontSize:"2rem", fontWeight:800, letterSpacing:"0.5px", cursor:"pointer", userSelect:"none" }}>
              Cheqify
            </div>

            {/* Nav links — solo desktop */}
            <div className="d-none d-lg-flex" style={{ gap:"4px", alignItems:"center" }}>
              {navLinks.map((link) => (
                <a key={link.href} href={link.href}
                  style={{
                    color: textColor, textDecoration:"none", fontWeight:600,
                    display:"flex", alignItems:"center", gap:"6px",
                    padding:"6px 14px", borderRadius:"8px", transition:"all 0.2s", fontSize:"0.9rem",
                    background: isActive(link.href) ? "rgba(255,255,255,0.12)" : "transparent",
                  }}
                  className="nav-premium">
                  {link.icon} {link.label}
                </a>
              ))}
            </div>

            {/* Dropdown usuario — solo desktop */}
            <div className="d-none d-lg-block">
              <div className="dropdown">
                <button className="btn premium-btn d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                  <FaUserCircle /> <span>{user.empresa}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><span className="dropdown-item text-muted small disabled"><FaBuilding className="me-2"/>{user.email}</span></li>
                  <li><hr className="dropdown-divider"/></li>
                  <li><button className="dropdown-item fw-semibold d-flex align-items-center gap-2" style={{ color:"#c58b2a" }} onClick={() => navigate("/mi-cuenta")}><FaUserCog /> Mi Cuenta</button></li>
                  <li><hr className="dropdown-divider"/></li>
                  <li><button className="dropdown-item text-danger fw-semibold d-flex align-items-center gap-2" onClick={() => { logout(); navigate("/login"); }}><FaSignOutAlt /> Cerrar sesión</button></li>
                </ul>
              </div>
            </div>

            {/* Botón hamburguesa — solo móvil */}
            <button className="d-lg-none" onClick={() => setDrawerOpen(true)}
              style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"10px", padding:"8px 10px", cursor:"pointer", display:"flex", flexDirection:"column", gap:"5px" }}>
              <span style={{ display:"block", width:"20px", height:"2px", background:"#fff", borderRadius:"2px" }}/>
              <span style={{ display:"block", width:"20px", height:"2px", background:"#fff", borderRadius:"2px" }}/>
              <span style={{ display:"block", width:"20px", height:"2px", background:"#fff", borderRadius:"2px" }}/>
            </button>
          </div>
        </Container>
      </nav>

      {/* Spacer */}
      <div style={{ height:"70px" }} />

      {/* ── Drawer lateral — solo móvil ── */}
      {/* Overlay */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position:"fixed", inset:0, zIndex:2000,
          background:"transparent",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "all" : "none",
          transition:"opacity 0.3s ease",
        }}
      />

      {/* Drawer */}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0, zIndex:2001,
        width:"min(280px, 80vw)",
        background:"linear-gradient(160deg,#0f1a2e,#1a2a3e)",
        boxShadow:"-4px 0 32px rgba(0,0,0,0.4)",
        transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        transition:"transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        display:"flex", flexDirection:"column",
        overflowY:"auto",
      }}>
        {/* Header drawer */}
        <div style={{ padding:"20px 20px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div className="cheqify-logo-text" style={{ fontSize:"1.6rem", fontWeight:800 }}>Cheqify</div>
          <button onClick={() => setDrawerOpen(false)}
            style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:"8px", padding:"6px 8px", cursor:"pointer", color:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center" }}>
            <FaTimes size={14}/>
          </button>
        </div>

        {/* Info usuario */}
        <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"38px", height:"38px", borderRadius:"50%", background:"linear-gradient(135deg,#c58b2a,#e8c47a)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <FaUserCircle size={20} color="#fff"/>
            </div>
            <div>
              <div style={{ fontSize:"13px", fontWeight:700, color:"#fff" }}>{user.empresa}</div>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)" }}>{user.email}</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div style={{ padding:"12px 12px", flex:1 }}>
          <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", padding:"0 8px", marginBottom:"8px" }}>Navegación</div>
          {navLinks.map((link) => (
            <button key={link.href} onClick={() => go(link.href)}
              style={{
                display:"flex", alignItems:"center", gap:"12px", width:"100%",
                background: isActive(link.href) ? "rgba(255,255,255,0.08)" : "transparent",
                border: isActive(link.href) ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                borderLeft: isActive(link.href) ? "3px solid #c58b2a" : "3px solid transparent",
                borderRadius:"10px", padding:"12px 14px", cursor:"pointer", textAlign:"left",
                marginBottom:"4px", transition:"all 0.15s",
              }}
              onMouseEnter={(e) => { if (!isActive(link.href)) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { if (!isActive(link.href)) e.currentTarget.style.background = "transparent"; }}
            >
              {link.icon}
              <span style={{ fontSize:"14px", fontWeight:600, color: isActive(link.href) ? "#fff" : "rgba(255,255,255,0.7)" }}>
                {link.label}
              </span>
            </button>
          ))}
        </div>

        {/* Opciones de cuenta */}
        <div style={{ padding:"12px 12px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", padding:"0 8px", marginBottom:"8px" }}>Cuenta</div>

          <button onClick={() => go("/mi-cuenta")}
            style={{ display:"flex", alignItems:"center", gap:"12px", width:"100%", background:"transparent", border:"1px solid transparent", borderRadius:"10px", padding:"12px 14px", cursor:"pointer", textAlign:"left", marginBottom:"4px", transition:"all 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(197,139,42,0.08)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <FaUserCog size={18} color="#c58b2a"/>
            <span style={{ fontSize:"14px", fontWeight:600, color:"#c58b2a" }}>Mi Cuenta</span>
          </button>

          <button onClick={() => { logout(); navigate("/login"); setDrawerOpen(false); }}
            style={{ display:"flex", alignItems:"center", gap:"12px", width:"100%", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"10px", padding:"12px 14px", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
          >
            <FaSignOutAlt size={18} color="#ef4444"/>
            <span style={{ fontSize:"14px", fontWeight:600, color:"#ef4444" }}>Cerrar sesión</span>
          </button>
        </div>
      </div>

      <style>{`
        .cheqify-logo-text {
          background: linear-gradient(90deg, #c58b2a, #27b6b1, #9b9b9b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: metallicShine 3s linear infinite;
          background-size: 300%;
          transition: transform 0.4s ease;
        }
        .cheqify-logo-text:hover { transform: scale(1.08); }
        @keyframes metallicShine {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .nav-premium:hover { background: rgba(255,255,255,0.1) !important; }
        .premium-btn { background: linear-gradient(145deg, #444, #222); border: 1px solid #555; color: #fff; transition: all 0.3s ease; border-radius: 8px; padding: 6px 14px; }
        .premium-btn:hover { background: linear-gradient(145deg, #666, #333); }
      `}</style>
    </>
  );
}