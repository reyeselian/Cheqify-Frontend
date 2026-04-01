// src/pages/admin/AdminIngresos.tsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { FaSearch, FaDollarSign, FaUsers, FaTag, FaTimes, FaSave, FaStar } from "react-icons/fa";

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

interface PrecioModal {
  user: IngresoRow;
  customPrice: string;
  customDiscount: string;
  customPriceNote: string;
  modo: "precio" | "descuento" | "ninguno";
}

export default function AdminIngresos() {
  const { admin } = useAdmin();
  const headers = { Authorization: `Bearer ${admin?.token}` };

  const [ingresos, setIngresos]   = useState<IngresoRow[]>([]);
  const [resumen, setResumen]     = useState<Resumen | null>(null);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [precioModal, setPrecioModal] = useState<PrecioModal | null>(null);
  const [saving, setSaving]       = useState(false);

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

  const openPrecioModal = (u: IngresoRow) => {
    setPrecioModal({
      user: u,
      customPrice:    u.customPrice    !== null ? String(u.customPrice)    : "",
      customDiscount: u.customDiscount !== null ? String(u.customDiscount) : "",
      customPriceNote: u.customPriceNote ?? "",
      modo: u.customPrice !== null ? "precio" : u.customDiscount !== null ? "descuento" : "ninguno",
    });
  };

  const handleSavePrecio = async () => {
    if (!precioModal) return;
    setSaving(true);
    try {
      const body: any = { customPriceNote: precioModal.customPriceNote };

      if (precioModal.modo === "precio" && precioModal.customPrice !== "") {
        body.customPrice = parseFloat(precioModal.customPrice);
      } else if (precioModal.modo === "descuento" && precioModal.customDiscount !== "") {
        body.customDiscount = parseFloat(precioModal.customDiscount);
      } else {
        body.customPrice    = null;
        body.customDiscount = null;
      }

      await axios.patch(`${API}/admin/users/${precioModal.user._id}/precio`, body, { headers });
      toast.success("✅ Precio personalizado guardado.");
      setPrecioModal(null);
      fetchIngresos();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al guardar.");
    } finally { setSaving(false); }
  };

  const fmt = (n: number) => `$${n.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Tarjetas resumen */}
      {resumen && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: "1rem" }}>
          {[
            { label: "Ingresos mensuales",  value: fmt(resumen.totalMensual),  icon: <FaDollarSign />, color: "#c58b2a", bg: "#fffbeb" },
            { label: "Ingresos anuales",    value: fmt(resumen.totalAnual),    icon: <FaDollarSign />, color: "#7c3aed", bg: "#f5f3ff" },
            { label: "Total estimado",      value: fmt(resumen.totalGeneral),  icon: <FaDollarSign />, color: "#059669", bg: "#ecfdf5" },
            { label: "Clientes activos",    value: String(resumen.usuariosActivos), icon: <FaUsers />, color: "#0891b2", bg: "#ecfeff" },
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
                  {["Empresa", "Plan", "Precio base", "Descuento/Precio especial", "Precio final", "Próx. renovación", "Acciones"].map((h) => (
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
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => openPrecioModal(u)} title="Asignar precio especial" style={{
                        width: "30px", height: "30px", borderRadius: "8px", background: "#fffbeb",
                        border: "none", color: "#c58b2a", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s",
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        <FaStar size={11} />
                      </button>
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

      {/* Modal precio personalizado */}
      {precioModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "480px", boxShadow: "0 30px 80px rgba(0,0,0,0.2)" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.4rem" }}>
              <div>
                <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>Precio especial</h3>
                <p style={{ margin: "2px 0 0", color: "#94a3b8", fontSize: "0.78rem" }}>{precioModal.user.empresa}</p>
              </div>
              <button onClick={() => setPrecioModal(null)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "5px 9px", cursor: "pointer", color: "#64748b" }}><FaTimes size={12} /></button>
            </div>

            {/* Info precio base */}
            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 14px", marginBottom: "1.2rem", fontSize: "0.82rem", color: "#64748b" }}>
              Precio base del plan <strong style={{ color: PLAN_COLOR[precioModal.user.plan] }}>{PLAN_LABEL[precioModal.user.plan]}</strong>: <strong style={{ color: "#0f172a" }}>{fmt(precioModal.user.precioBase)}</strong>
            </div>

            {/* Selector de modo */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "1.2rem" }}>
              {(["ninguno", "precio", "descuento"] as const).map((m) => (
                <button key={m} onClick={() => setPrecioModal({ ...precioModal, modo: m })} style={{
                  flex: 1, padding: "8px", borderRadius: "10px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: "0.78rem", fontWeight: 600,
                  background: precioModal.modo === m ? "#6366f1" : "#f8fafc",
                  border: precioModal.modo === m ? "none" : "1px solid #e2e8f0",
                  color: precioModal.modo === m ? "#fff" : "#475569",
                  transition: "all 0.18s",
                }}>
                  {m === "ninguno" ? "Sin especial" : m === "precio" ? "Precio fijo" : "% Descuento"}
                </button>
              ))}
            </div>

            {/* Input precio fijo */}
            {precioModal.modo === "precio" && (
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#64748b", fontSize: "0.75rem", fontWeight: 500, marginBottom: "5px", fontFamily: "'Outfit',sans-serif" }}>Precio especial (USD)</label>
                <input type="number" min="0" step="0.01" value={precioModal.customPrice}
                  onChange={(e) => setPrecioModal({ ...precioModal, customPrice: e.target.value })}
                  placeholder="Ej: 25.00"
                  style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", color: "#0f172a", padding: "9px 12px", fontSize: "0.87rem", outline: "none", boxSizing: "border-box", fontFamily: "'Outfit',sans-serif" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "#e2e8f0")}
                />
              </div>
            )}

            {/* Input descuento */}
            {precioModal.modo === "descuento" && (
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", color: "#64748b", fontSize: "0.75rem", fontWeight: 500, marginBottom: "5px", fontFamily: "'Outfit',sans-serif" }}>Descuento (%)</label>
                <input type="number" min="0" max="100" value={precioModal.customDiscount}
                  onChange={(e) => setPrecioModal({ ...precioModal, customDiscount: e.target.value })}
                  placeholder="Ej: 20"
                  style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", color: "#0f172a", padding: "9px 12px", fontSize: "0.87rem", outline: "none", boxSizing: "border-box", fontFamily: "'Outfit',sans-serif" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "#e2e8f0")}
                />
                {precioModal.customDiscount && (
                  <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#059669" }}>
                    Precio final: {fmt(precioModal.user.precioBase * (1 - parseFloat(precioModal.customDiscount) / 100))}
                  </p>
                )}
              </div>
            )}

            {/* Mensaje para el usuario */}
            {precioModal.modo !== "ninguno" && (
              <div style={{ marginBottom: "1.4rem" }}>
                <label style={{ display: "block", color: "#64748b", fontSize: "0.75rem", fontWeight: 500, marginBottom: "5px", fontFamily: "'Outfit',sans-serif" }}>Mensaje para el usuario (opcional)</label>
                <input type="text" value={precioModal.customPriceNote}
                  onChange={(e) => setPrecioModal({ ...precioModal, customPriceNote: e.target.value })}
                  placeholder="Ej: Precio especial por ser cliente fiel"
                  style={{ width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "10px", color: "#0f172a", padding: "9px 12px", fontSize: "0.87rem", outline: "none", boxSizing: "border-box", fontFamily: "'Outfit',sans-serif" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "#e2e8f0")}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setPrecioModal(null)} style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#64748b", padding: "10px", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Cancelar</button>
              <button onClick={handleSavePrecio} disabled={saving} style={{ flex: 2, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, padding: "10px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", opacity: saving ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                <FaSave size={13} />{saving ? "Guardando..." : "Guardar precio especial"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}