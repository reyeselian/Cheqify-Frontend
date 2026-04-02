// src/pages/admin/AdminIngresos.tsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { FaSearch, FaDollarSign, FaUsers, FaTag } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PLAN_LABEL: Record<string, string> = {
  monthly: "Mensual", annual: "Anual", trial: "Prueba",
};
const PLAN_COLOR: Record<string, string> = {
  monthly: "#c58b2a", annual: "#7c3aed", trial: "#0891b2",
};

interface IngresoRow {
  _id: string;
  empresa: string;
  email: string;
  plan: string;
  status: string;
  planExpiresAt: string | null;
  registeredAt: string;
  precioBase: number;
  customPrice: number | null;
  customDiscount: number | null;
  customPriceNote: string | null;
  precioFinal: number;
  tieneDescuento: boolean;
}

interface Resumen {
  totalMensual: number;
  totalAnual: number;
  totalGeneral: number;
  usuariosActivos: number;
  usuariosActivosMes: number;
}

export default function AdminIngresos() {
  const { admin } = useAdmin();
  const headers = { Authorization: `Bearer ${admin?.token}` };

  const [ingresos, setIngresos] = useState<IngresoRow[]>([]);
  const [resumen, setResumen]   = useState<Resumen | null>(null);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const fetchIngresos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const { data } = await axios.get(`${API}/admin/ingresos?${params}`, { headers });
      setIngresos(data.ingresos);
      setResumen(data.resumen);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error("Error al cargar ingresos."); }
    finally { setLoading(false); }
  }, [page, search, admin?.token]);

  useEffect(() => { fetchIngresos(); }, [fetchIngresos]);
  useEffect(() => { setPage(1); }, [search]);

  const fmt = (n: number) => `$${n.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Tarjetas resumen */}
      {resumen && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: "1rem" }}>
          {[
            { label: "Ingresos mensuales", value: fmt(resumen.totalMensual),       icon: <FaDollarSign />, color: "#c58b2a", bg: "#fffbeb" },
            { label: "Ingresos anuales",   value: fmt(resumen.totalAnual),         icon: <FaDollarSign />, color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Total estimado",     value: fmt(resumen.totalGeneral),       icon: <FaDollarSign />, color: "#059669", bg: "#ecfdf5" },
            { label: "Clientes activos",   value: String(resumen.usuariosActivos), icon: <FaUsers />,      color: "#0891b2", bg: "#ecfeff" },
          ].map((c, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: "16px", padding: "1.2rem 1.4rem",
              border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              display: "flex", flexDirection: "column", gap: "0.5rem",
              animation: `cardIn 0.4s ease ${i * 0.06}s both`,
            }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, fontSize: "0.88rem" }}>{c.icon}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "1rem 1.25rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ position: "relative", maxWidth: "380px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.8rem" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por empresa o correo..."
            style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "9px 12px 9px 34px", fontSize: "0.85rem", outline: "none", fontFamily: "'Outfit',sans-serif", color: "#0f172a", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Cargando...</div>
        ) : ingresos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No hay clientes activos.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Empresa", "Plan", "Precio base", "Descuento/Precio especial", "Precio final", "Próx. renovación"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "0.71rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ingresos.map((u, i) => (
                  <tr key={u._id} style={{ borderTop: "1px solid #f1f5f9", animation: `cardIn 0.35s ease ${i * 0.03}s both` }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontSize: "0.75rem", flexShrink: 0 }}>
                          {u.empresa[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{u.empresa}</div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: `${PLAN_COLOR[u.plan]}15`, color: PLAN_COLOR[u.plan], borderRadius: "8px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600 }}>
                        {PLAN_LABEL[u.plan] ?? u.plan}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#64748b" }}>
                      {fmt(u.precioBase)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {u.tieneDescuento ? (
                        <div>
                          <span style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600, color: "#059669", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <FaTag size={9} />
                            {u.customPrice !== null ? `Precio especial: ${fmt(u.customPrice)}` : `${u.customDiscount}% descuento`}
                          </span>
                          {u.customPriceNote && (
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "3px" }}>{u.customPriceNote}</div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#cbd5e1", fontSize: "0.78rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.88rem", color: "#059669", fontWeight: 700 }}>
                      {fmt(u.precioFinal)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "#94a3b8" }}>
                      {u.planExpiresAt ? new Date(u.planExpiresAt).toLocaleDateString("es-DO") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {pages > 1 && (
          <div style={{ padding: "0.9rem 1.25rem", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Página {page} de {pages} · {total} clientes</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", color: page <= 1 ? "#cbd5e1" : "#475569", fontSize: "0.8rem" }}>← Anterior</button>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)} style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: page >= pages ? "not-allowed" : "pointer", color: page >= pages ? "#cbd5e1" : "#475569", fontSize: "0.8rem" }}>Siguiente →</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}