// src/pages/admin/AdminSolicitudes.tsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaPhoneAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PLAN_LABEL: Record<string, string> = {
  trial: "Prueba", monthly: "Mensual", annual: "Anual",
};
const PLAN_COLOR: Record<string, string> = {
  trial: "#0891b2", monthly: "#c58b2a", annual: "#7c3aed",
};
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:  { label: "Pendiente",  color: "#d97706", bg: "#fffbeb" },
  contactado: { label: "Contactado", color: "#6366f1", bg: "#eef2ff" },
  completado: { label: "Completado", color: "#059669", bg: "#ecfdf5" },
  rechazado:  { label: "Rechazado",  color: "#dc2626", bg: "#fef2f2" },
};

interface SolicitudRow {
  _id: string;
  empresa: string;
  email: string;
  planActual: string;
  planSolicitado: string;
  status: string;
  notas: string;
  createdAt: string;
}

export default function AdminSolicitudes() {
  const { admin } = useAdmin();
  const headers = { Authorization: `Bearer ${admin?.token}` };

  const [solicitudes, setSolicitudes] = useState<SolicitudRow[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filterStatus) params.set("status", filterStatus);
      const { data } = await axios.get(`${API}/plan-requests/admin?${params}`, { headers });
      setSolicitudes(data.requests);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error("Error al cargar solicitudes."); }
    finally { setLoading(false); }
  }, [page, filterStatus, admin?.token]);

  useEffect(() => { fetchSolicitudes(); }, [fetchSolicitudes]);
  useEffect(() => { setPage(1); }, [filterStatus]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await axios.patch(`${API}/plan-requests/admin/${id}`, { status }, { headers });
      toast.success("✅ Estado actualizado.");
      fetchSolicitudes();
    } catch { toast.error("Error al actualizar."); }
    finally { setUpdating(null); }
  };

  const pendientes = solicitudes.filter((s) => s.status === "pendiente").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Banner pendientes */}
      {pendientes > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "#92400e", fontWeight: 600 }}>
          🔔 Tienes <strong style={{ margin: "0 3px" }}>{pendientes}</strong> solicitud{pendientes !== 1 ? "es" : ""} pendiente{pendientes !== 1 ? "s" : ""} de atender.
        </div>
      )}

      {/* Filtro */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "1rem 1.25rem", border: "1px solid #e2e8f0", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "9px 12px", fontSize: "0.83rem", outline: "none", fontFamily: "'Outfit',sans-serif", color: "#475569", cursor: "pointer", minWidth: "160px" }}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="contactado">Contactado</option>
          <option value="completado">Completado</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <span style={{ color: "#94a3b8", fontSize: "0.78rem", marginLeft: "auto" }}>
          {total} solicitud{total !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Cargando...</div>
        ) : solicitudes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No hay solicitudes.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Empresa", "Plan actual", "Plan solicitado", "Estado", "Fecha", "Acciones"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "0.71rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s, i) => {
                  const stCfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.pendiente;
                  return (
                    <tr key={s._id} style={{ borderTop: "1px solid #f1f5f9", animation: `cardIn 0.3s ease ${i * 0.03}s both` }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{s.empresa}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{s.email}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: `${PLAN_COLOR[s.planActual]}15`, color: PLAN_COLOR[s.planActual], borderRadius: "8px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600 }}>
                          {PLAN_LABEL[s.planActual] ?? s.planActual}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: `${PLAN_COLOR[s.planSolicitado]}15`, color: PLAN_COLOR[s.planSolicitado], borderRadius: "8px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 700 }}>
                          {PLAN_LABEL[s.planSolicitado] ?? s.planSolicitado}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: stCfg.bg, color: stCfg.color, borderRadius: "8px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600 }}>
                          {stCfg.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "#94a3b8" }}>
                        {new Date(s.createdAt).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {s.status === "pendiente" && (
                            <button title="Marcar como contactado" disabled={updating === s._id}
                              onClick={() => updateStatus(s._id, "contactado")}
                              style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#eef2ff", border: "none", color: "#6366f1", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            ><FaPhoneAlt size={11} /></button>
                          )}
                          {(s.status === "pendiente" || s.status === "contactado") && (
                            <button title="Marcar como completado" disabled={updating === s._id}
                              onClick={() => updateStatus(s._id, "completado")}
                              style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#ecfdf5", border: "none", color: "#059669", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            ><FaCheck size={11} /></button>
                          )}
                          {s.status !== "rechazado" && s.status !== "completado" && (
                            <button title="Rechazar" disabled={updating === s._id}
                              onClick={() => updateStatus(s._id, "rechazado")}
                              style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#fef2f2", border: "none", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            ><FaTimes size={11} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div style={{ padding: "0.9rem 1.25rem", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Página {page} de {pages}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ width: "30px", height: "30px", borderRadius: "8px", background: page <= 1 ? "#f1f5f9" : "#fff", border: "1px solid #e2e8f0", color: page <= 1 ? "#cbd5e1" : "#475569", cursor: page <= 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaChevronLeft size={11} /></button>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)} style={{ width: "30px", height: "30px", borderRadius: "8px", background: page >= pages ? "#f1f5f9" : "#fff", border: "1px solid #e2e8f0", color: page >= pages ? "#cbd5e1" : "#475569", cursor: page >= pages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaChevronRight size={11} /></button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}