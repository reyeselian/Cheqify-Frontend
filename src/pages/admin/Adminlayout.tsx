// src/pages/admin/AdminLayout.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import axios from "axios";
import {
  FaTachometerAlt, FaUsers, FaCreditCard,
  FaSignOutAlt, FaShieldAlt, FaBars, FaChartLine, FaBell,
} from "react-icons/fa";

const FONT = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
const API  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const S = {
  sidebar: { width: "240px", bg: "#0f172a", border: "rgba(255,255,255,0.06)" },
};

export default function AdminLayout() {
  const { admin, adminLogout } = useAdmin();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendientes, setPendientes] = useState(0);

  // Contar solicitudes pendientes al cargar y al cambiar de página
  useEffect(() => {
    if (!admin?.token) return;
    axios.get(`${API}/plan-requests/admin?status=pendiente&limit=1`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    }).then(({ data }) => setPendientes(data.total ?? 0)).catch(() => {});
  }, [admin?.token, location.pathname]);

  const NAV_ITEMS = [
    { label: "Dashboard",   path: "/admin/dashboard",   icon: <FaTachometerAlt />, badge: null },
    { label: "Usuarios",    path: "/admin/usuarios",    icon: <FaUsers />,         badge: null },
    { label: "Planes",      path: "/admin/planes",      icon: <FaCreditCard />,    badge: null },
    { label: "Ingresos",    path: "/admin/ingresos",    icon: <FaChartLine />,     badge: null },
    { label: "Solicitudes", path: "/admin/solicitudes", icon: <FaBell />,          badge: pendientes > 0 ? pendientes : null },
  ];

  const handleLogout = () => { adminLogout(); navigate("/admin/login"); };

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1.6rem 1.4rem 1.2rem", borderBottom: `1px solid ${S.sidebar.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.9rem", flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}>
            <FaShieldAlt />
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>Cheqify</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin Panel</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }} style={{
              background: active ? "rgba(99,102,241,0.15)" : "none",
              border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
              borderRadius: "10px", color: active ? "#a5b4fc" : "rgba(255,255,255,0.45)",
              padding: "10px 12px", cursor: "pointer", width: "100%", textAlign: "left",
              display: "flex", alignItems: "center", gap: "10px",
              fontFamily: "'Outfit', sans-serif", fontSize: "0.88rem", fontWeight: active ? 600 : 400,
              transition: "all 0.18s",
            }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; } }}
            >
              <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== null && (
                <span style={{ background: "#ef4444", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "1px 7px", borderRadius: "20px", minWidth: "20px", textAlign: "center" }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "0.75rem", borderTop: `1px solid ${S.sidebar.border}` }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "0.85rem", display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
            {admin?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin?.empresa}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: "100%", background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", color: "rgba(239,68,68,0.7)", padding: "8px 12px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: "0.82rem", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", transition: "all 0.18s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(239,68,68,0.7)"; }}
        >
          <FaSignOutAlt size={12} /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  const currentLabel = NAV_ITEMS.find((n) => n.path === location.pathname)?.label ?? "Admin";

  return (
    <>
      <link rel="stylesheet" href={FONT} />
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Outfit', sans-serif", background: "#f1f5f9" }}>
        <aside style={{ width: S.sidebar.width, flexShrink: 0, background: S.sidebar.bg, borderRight: `1px solid ${S.sidebar.border}`, position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 200, overflowY: "auto", display: "flex", flexDirection: "column" }} className="admin-sidebar-desktop">
          <SidebarContent />
        </aside>

        {mobileOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setMobileOpen(false)} />
            <aside style={{ position: "relative", zIndex: 1, width: S.sidebar.width, background: S.sidebar.bg, display: "flex", flexDirection: "column", animation: "slideRight 0.25s ease" }}>
              <SidebarContent />
            </aside>
          </div>
        )}

        <div style={{ flex: 1, marginLeft: S.sidebar.width, display: "flex", flexDirection: "column" }} className="admin-main">
          <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0.9rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <button onClick={() => setMobileOpen(true)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "1.1rem" }} className="admin-hamburger">
              <FaBars />
            </button>
            <div>
              <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1rem", fontWeight: 700 }}>{currentLabel}</h2>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.75rem" }}>Panel de administración · Cheqify</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {pendientes > 0 && (
                <div onClick={() => navigate("/admin/solicitudes")} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "20px", padding: "4px 12px", fontSize: "0.75rem", color: "#dc2626", fontWeight: 600, cursor: "pointer" }}>
                  <FaBell size={10} /> {pendientes} solicitud{pendientes !== 1 ? "es" : ""}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "20px", padding: "4px 12px", fontSize: "0.75rem", color: "#6366f1", fontWeight: 600 }}>
                <FaShieldAlt size={10} /> Admin
              </div>
            </div>
          </header>

          <main style={{ flex: 1, padding: "1.75rem", overflowY: "auto" }}>
            <Outlet />
          </main>
        </div>
      </div>

      <style>{`
        @keyframes slideRight { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-main { margin-left: 0 !important; }
          .admin-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}