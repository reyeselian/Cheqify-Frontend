// src/pages/admin/AdminPlanes.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import { toast } from "react-toastify";
import {
  FaPlus, FaEdit, FaToggleOn, FaToggleOff, FaTimes, FaSave,
  FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Plan {
  _id: string; name: string; type: string;
  price: number; durationDays: number; trialDays: number;
  description: string; features: string[]; isActive: boolean;
}

const EMPTY_FORM = {
  name: "", type: "monthly", price: 0, durationDays: 30,
  trialDays: 0, description: "", features: [] as string[],
};

type PlanForm = typeof EMPTY_FORM;

export default function AdminPlanes() {
  const { admin } = useAdmin();
  const headers = { Authorization: `Bearer ${admin?.token}` };

  const [plans, setPlans]     = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan]   = useState<Plan | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]       = useState<PlanForm>(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [featInput, setFeatInput] = useState("");

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/plans`, { headers });
      setPlans(data.data ?? data);
    } catch { toast.error("Error al cargar planes."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFeatInput("");
    setEditPlan(null);
    setShowCreate(true);
  };

  const openEdit = (p: Plan) => {
    setForm({
      name: p.name, type: p.type, price: p.price,
      durationDays: p.durationDays, trialDays: p.trialDays,
      description: p.description, features: [...p.features],
    });
    setFeatInput("");
    setEditPlan(p);
    setShowCreate(true);
  };

  const addFeature = () => {
    const f = featInput.trim();
    if (!f) return;
    setForm((prev) => ({ ...prev, features: [...prev.features, f] }));
    setFeatInput("");
  };

  const removeFeature = (i: number) =>
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio."); return; }
    setSaving(true);
    try {
      if (editPlan) {
        await axios.put(`${API}/admin/plans/${editPlan._id}`, form, { headers });
        toast.success("✅ Plan actualizado.");
      } else {
        await axios.post(`${API}/admin/plans`, form, { headers });
        toast.success("✅ Plan creado.");
      }
      setShowCreate(false);
      setEditPlan(null);
      fetchPlans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al guardar plan.");
    } finally { setSaving(false); }
  };

  const handleToggle = async (p: Plan) => {
    try {
      await axios.patch(`${API}/admin/plans/${p._id}/toggle`, {}, { headers });
      toast.success(`Plan ${p.isActive ? "desactivado" : "activado"}.`);
      fetchPlans();
    } catch { toast.error("Error al cambiar estado."); }
  };

  const PLAN_COLOR: Record<string, string> = { trial: "#0891b2", monthly: "#c58b2a", annual: "#7c3aed" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.83rem" }}>
            {plans.length} plan{plans.length !== 1 ? "es" : ""} en total
          </p>
        </div>
        <button onClick={openCreate} style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          border: "none", borderRadius: "12px", color: "#fff",
          fontWeight: 700, fontSize: "0.85rem", padding: "10px 20px",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "7px",
          fontFamily: "'Outfit',sans-serif",
          boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
        }}>
          <FaPlus size={12} /> Nuevo Plan
        </button>
      </div>

      {/* Plans grid */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "3rem" }}>Cargando...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.1rem" }}>
          {plans.map((p, i) => {
            const color = PLAN_COLOR[p.type] ?? "#6366f1";
            return (
              <div key={p._id} style={{
                background: "#fff", borderRadius: "18px",
                border: `1px solid ${p.isActive ? "#e2e8f0" : "#fee2e2"}`,
                overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                opacity: p.isActive ? 1 : 0.65,
                animation: `cardIn 0.4s ease ${i * 0.05}s both`,
              }}>
                {/* Top strip */}
                <div style={{ height: "4px", background: `linear-gradient(90deg,${color},${color}88)` }} />

                <div style={{ padding: "1.4rem" }}>
                  {/* Name + badges */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <div>
                      <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1.05rem", fontWeight: 700 }}>{p.name}</h3>
                      <div style={{ display: "flex", gap: "6px", marginTop: "5px", flexWrap: "wrap" }}>
                        <Badge color={color}>{p.type}</Badge>
                        <Badge color={p.isActive ? "#059669" : "#dc2626"}>
                          {p.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", textAlign: "right" }}>
                      {p.price === 0 ? (
                        <span style={{ color }}>Gratis</span>
                      ) : (
                        <>${p.price.toLocaleString()}<span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 400 }}> USD</span></>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: "0 0 0.85rem", color: "#64748b", fontSize: "0.8rem" }}>{p.description || "—"}</p>

                  {/* Features */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {p.features.slice(0, 4).map((f, fi) => (
                      <li key={fi} style={{ display: "flex", alignItems: "center", gap: "7px", color: "#475569", fontSize: "0.8rem" }}>
                        <FaCheckCircle style={{ color, fontSize: "0.65rem", flexShrink: 0 }} />{f}
                      </li>
                    ))}
                    {p.features.length > 4 && (
                      <li style={{ color: "#94a3b8", fontSize: "0.75rem" }}>+{p.features.length - 4} más...</li>
                    )}
                  </ul>

                  {/* Info row */}
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    {p.trialDays > 0 && <InfoChip label="Trial" value={`${p.trialDays}d`} />}
                    {p.durationDays > 0 && <InfoChip label="Duración" value={`${p.durationDays}d`} />}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => openEdit(p)} style={{
                      flex: 1, background: "#eef2ff", border: "none", borderRadius: "10px",
                      color: "#6366f1", fontWeight: 600, fontSize: "0.8rem",
                      padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      fontFamily: "'Outfit',sans-serif",
                    }}>
                      <FaEdit size={11} /> Editar
                    </button>
                    <button onClick={() => handleToggle(p)} style={{
                      flex: 1, background: p.isActive ? "#fff7ed" : "#ecfdf5",
                      border: "none", borderRadius: "10px",
                      color: p.isActive ? "#ea580c" : "#059669",
                      fontWeight: 600, fontSize: "0.8rem",
                      padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      fontFamily: "'Outfit',sans-serif",
                    }}>
                      {p.isActive ? <><FaToggleOff size={12} /> Desactivar</> : <><FaToggleOn size={12} /> Activar</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────── */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem", overflowY: "auto", animation: "fadeIn 0.18s ease" }}>
          <div style={{ background: "#fff", borderRadius: "22px", padding: "2rem", width: "100%", maxWidth: "520px", boxShadow: "0 30px 80px rgba(0,0,0,0.2)", animation: "slideUp 0.25s ease", marginTop: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>
                {editPlan ? `Editar: ${editPlan.name}` : "Nuevo Plan"}
              </h3>
              <button onClick={() => { setShowCreate(false); setEditPlan(null); }} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "5px 9px", cursor: "pointer", color: "#64748b" }}><FaTimes size={12} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <Row2>
                <FormField label="Nombre">
                  <FInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Plan Mensual" />
                </FormField>
                <FormField label="Tipo">
                  <FSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })}>
                    <option value="trial">Trial</option>
                    <option value="monthly">Mensual</option>
                    <option value="annual">Anual</option>
                  </FSelect>
                </FormField>
              </Row2>
              <Row2>
                <FormField label="Precio (USD)">
                  <FInput value={String(form.price)} type="number" onChange={(v) => setForm({ ...form, price: Number(v) })} placeholder="0" />
                </FormField>
                <FormField label="Duración (días)">
                  <FInput value={String(form.durationDays)} type="number" onChange={(v) => setForm({ ...form, durationDays: Number(v) })} placeholder="30" />
                </FormField>
              </Row2>
              <FormField label="Días de prueba">
                <FInput value={String(form.trialDays)} type="number" onChange={(v) => setForm({ ...form, trialDays: Number(v) })} placeholder="0" />
              </FormField>
              <FormField label="Descripción">
                <FInput value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Descripción breve del plan" />
              </FormField>

              {/* Features */}
              <FormField label="Características">
                <div style={{ display: "flex", gap: "8px" }}>
                  <FInput value={featInput} onChange={setFeatInput} placeholder="Ej: Cheques ilimitados"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
                  <button onClick={addFeature} style={{ background: "#eef2ff", border: "none", borderRadius: "10px", color: "#6366f1", fontWeight: 700, padding: "9px 14px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Outfit',sans-serif", fontSize: "0.8rem" }}>
                    + Agregar
                  </button>
                </div>
                {form.features.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0", display: "flex", flexDirection: "column", gap: "5px" }}>
                    {form.features.map((f, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 10px", fontSize: "0.8rem", color: "#475569" }}>
                        <span>{f}</span>
                        <button onClick={() => removeFeature(i)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: "2px" }}><FaTimesCircle size={12} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </FormField>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
              <button onClick={() => { setShowCreate(false); setEditPlan(null); }} style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#64748b", padding: "10px", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, padding: "10px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", opacity: saving ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                <FaSave size={13} />{saving ? "Guardando..." : "Guardar Plan"}
              </button>
            </div>
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}

      <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

/* ── Micro-components ────────────────────────────────────────── */
function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return <span style={{ background: `${color}15`, color, borderRadius: "6px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 600, textTransform: "capitalize" }}>{children}</span>;
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "3px 10px", display: "flex", gap: "4px", alignItems: "center" }}>
      <span style={{ color: "#94a3b8", fontSize: "0.7rem" }}>{label}</span>
      <span style={{ color: "#475569", fontSize: "0.78rem", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>{children}</div>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 500, fontFamily: "'Outfit',sans-serif" }}>{label}</label>
      {children}
    </div>
  );
}

function FInput({ value, onChange, placeholder, type = "text", onKeyDown }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onKeyDown={onKeyDown}
      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#0f172a", padding: "9px 12px", fontSize: "0.87rem", outline: "none", fontFamily: "'Outfit',sans-serif", transition: "border-color 0.18s" }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
    />
  );
}

function FSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#0f172a", padding: "9px 12px", fontSize: "0.87rem", outline: "none", fontFamily: "'Outfit',sans-serif", cursor: "pointer" }}>
      {children}
    </select>
  );
}