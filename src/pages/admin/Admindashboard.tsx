// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import { toast } from "react-toastify";
import {
  FaUsers, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaCreditCard, FaFileAlt, FaDollarSign, FaArrowUp,
} from "react-icons/fa";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Stats {
  users:   { total: number; active: number; trial: number; expired: number };
  plans:   { total: number };
  cheques: { total: number };
  revenue: { estimated: number; monthly: number; annual: number };
  recentUsers: { _id: string; empresa: string; email: string; plan: string; status: string; registeredAt: string }[];
}

const STATUS_COLOR: Record<string, string> = {
  active:           "#059669",
  trial:            "#0891b2",
  trial_expired:    "#d97706",
  payment_required: "#dc2626",
  blocked:          "#9f1239",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Activo", trial: "Prueba", trial_expired: "Vencido",
  payment_required: "Pago pendiente", blocked: "Bloqueado",
};

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${admin?.token}` };

  useEffect(() => {
    axios.get(`${API}/admin/stats`, { headers })
      .then((r) => setStats(r.data))
      .catch(() => toast.error("Error al cargar estadísticas."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!stats)  return null;

  const cards = [
    { label: "Usuarios totales",  value: stats.users.total,   icon: <FaUsers />,             color: "#6366f1", bg: "#eef2ff" },
    { label: "Activos",           value: stats.users.active,  icon: <FaCheckCircle />,        color: "#059669", bg: "#ecfdf5" },
    { label: "En prueba",         value: stats.users.trial,   icon: <FaClock />,              color: "#0891b2", bg: "#ecfeff" },
    { label: "Vencidos / Bloq.",  value: stats.users.expired, icon: <FaExclamationTriangle />,color: "#dc2626", bg: "#fef2f2" },
    { label: "Planes activos",    value: stats.plans.total,   icon: <FaCreditCard />,         color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Cheques totales",   value: stats.cheques.total, icon: <FaFileAlt />,            color: "#c58b2a", bg: "#fffbeb" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Welcome */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        borderRadius: "18px", padding: "1.5rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
        boxShadow: "0 8px 25px rgba(99,102,241,0.3)",
      }}>
        <div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontWeight: 500 }}>Bienvenido de vuelta</p>
          <h2 style={{ margin: "2px 0 0", color: "#fff", fontSize: "1.35rem", fontWeight: 800 }}>{admin?.empresa}</h2>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.12)", borderRadius: "12px",
          padding: "0.8rem 1.4rem", color: "#fff", textAlign: "right",
        }}>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Ingresos estimados</p>
          <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>
            ${stats.revenue.estimated.toLocaleString("es-DO")} DOP
          </p>
          <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>
            {stats.revenue.monthly} mensual · {stats.revenue.annual} anual
          </p>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
        gap: "1rem",
      }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: "16px",
            padding: "1.3rem", border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column", gap: "0.5rem",
            animation: `cardIn 0.4s ease ${i * 0.05}s both`,
          }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: c.bg, display: "flex", alignItems: "center",
              justifyContent: "center", color: c.color, fontSize: "0.9rem",
            }}>
              {c.icon}
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
              {c.value.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "0.92rem", fontWeight: 700 }}>Usuarios recientes</h3>
          <span style={{ color: "#6366f1", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
            onClick={() => {}}>Ver todos →</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Empresa", "Correo", "Plan", "Estado", "Registro"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.72rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u, i) => (
                <tr key={u._id} style={{ borderTop: "1px solid #f1f5f9", animation: `cardIn 0.4s ease ${i * 0.06}s both` }}>
                  <td style={{ padding: "12px 16px", fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{u.empresa}</td>
                  <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#64748b" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: "#f1f5f9", borderRadius: "8px", padding: "2px 9px", fontSize: "0.75rem", fontWeight: 600, color: "#475569", textTransform: "capitalize" }}>{u.plan}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      background: `${STATUS_COLOR[u.status]}15`,
                      color: STATUS_COLOR[u.status],
                      borderRadius: "8px", padding: "2px 9px",
                      fontSize: "0.75rem", fontWeight: 600,
                    }}>
                      {STATUS_LABEL[u.status] ?? u.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.8rem", color: "#94a3b8" }}>
                    {new Date(u.registeredAt).toLocaleDateString("es-DO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes cardIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: "1rem" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: "16px", padding: "1.3rem", border: "1px solid #e2e8f0", height: "110px", animation: "pulse 1.5s ease infinite" }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}