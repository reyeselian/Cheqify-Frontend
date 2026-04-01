// src/pages/admin/AdminUsuarios.tsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAdmin } from "../../context/AdminContext";
import { toast } from "react-toastify";
import {
  FaSearch, FaEdit, FaBan, FaCheck, FaTrash,
  FaChevronLeft, FaChevronRight, FaTimes, FaSave, FaUser,
} from "react-icons/fa";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_COLOR: Record<string, string> = {
  active: "#059669", trial: "#0891b2", trial_expired: "#d97706",
  payment_required: "#dc2626", blocked: "#9f1239",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Activo", trial: "Prueba", trial_expired: "Vencido",
  payment_required: "Pago pendiente", blocked: "Bloqueado",
};

interface UserRow {
  _id: string; email: string; empresa: string;
  plan: string; status: string; registeredAt: string;
  trialDays: number; planExpiresAt: string | null;
}

interface EditForm {
  empresa: string; email: string; plan: string;
  status: string; trialDays: number;
}

export default function AdminUsuarios() {
  const { admin } = useAdmin();
  const headers = { Authorization: `Bearer ${admin?.token}` };

  const [users, setUsers]       = useState<UserRow[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlan,   setFilterPlan]   = useState("");

  /* edit modal */
  const [editUser, setEditUser]     = useState<UserRow | null>(null);
  const [editForm, setEditForm]     = useState<EditForm | null>(null);
  const [saving, setSaving]         = useState(false);

  /* delete confirm */
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search)       params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterPlan)   params.set("plan",   filterPlan);

      const { data } = await axios.get(`${API}/admin/users?${params}`, { headers });
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error("Error al cargar usuarios."); }
    finally { setLoading(false); }
  }, [page, search, filterStatus, filterPlan, admin?.token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* search debounce */
  useEffect(() => { setPage(1); }, [search, filterStatus, filterPlan]);

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setEditForm({ empresa: u.empresa, email: u.email, plan: u.plan, status: u.status, trialDays: u.trialDays });
  };

  const handleSaveEdit = async () => {
    if (!editUser || !editForm) return;
    setSaving(true);
    try {
      await axios.patch(`${API}/admin/users/${editUser._id}`, editForm, { headers });
      toast.success("✅ Usuario actualizado.");
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al guardar.");
    } finally { setSaving(false); }
  };

  const handleToggleBlock = async (u: UserRow) => {
    try {
      const { data } = await axios.patch(`${API}/admin/users/${u._id}/block`, {}, { headers });
      toast.success(data.message);
      fetchUsers();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Error."); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/admin/users/${deleteTarget._id}`, { headers });
      toast.success("Usuario eliminado.");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) { toast.error(err?.response?.data?.message || "Error."); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Filters bar */}
      <div style={{
        background: "#fff", borderRadius: "16px", padding: "1rem 1.25rem",
        border: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap",
        gap: "0.75rem", alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "0.8rem" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por empresa o correo..."
            style={{
              width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
              borderRadius: "10px", padding: "9px 12px 9px 34px",
              fontSize: "0.85rem", outline: "none", fontFamily: "'Outfit',sans-serif",
              color: "#0f172a", boxSizing: "border-box",
            }}
          />
        </div>

        <Select value={filterStatus} onChange={setFilterStatus} placeholder="Todos los estados">
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="trial">Prueba</option>
          <option value="trial_expired">Vencido</option>
          <option value="payment_required">Pago pendiente</option>
          <option value="blocked">Bloqueado</option>
        </Select>

        <Select value={filterPlan} onChange={setFilterPlan} placeholder="Todos los planes">
          <option value="">Todos los planes</option>
          <option value="trial">Trial</option>
          <option value="monthly">Mensual</option>
          <option value="annual">Anual</option>
        </Select>

        <span style={{ color: "#94a3b8", fontSize: "0.78rem", marginLeft: "auto" }}>
          {total} usuario{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "18px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.9rem" }}>Cargando...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.9rem" }}>No se encontraron usuarios.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Empresa", "Correo", "Plan", "Estado", "Registro", "Acciones"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "0.71rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderTop: "1px solid #f1f5f9", animation: `cardIn 0.35s ease ${i * 0.04}s both` }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", fontSize: "0.75rem", flexShrink: 0 }}>
                          {u.empresa[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{u.empresa}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#64748b" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: "#f1f5f9", borderRadius: "8px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600, color: "#475569", textTransform: "capitalize" }}>{u.plan}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: `${STATUS_COLOR[u.status]}12`, color: STATUS_COLOR[u.status], borderRadius: "8px", padding: "2px 9px", fontSize: "0.73rem", fontWeight: 600 }}>
                        {STATUS_LABEL[u.status] ?? u.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "#94a3b8" }}>
                      {new Date(u.registeredAt).toLocaleDateString("es-DO")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <ActionBtn color="#6366f1" bg="#eef2ff" title="Editar" onClick={() => openEdit(u)}><FaEdit size={11} /></ActionBtn>
                        <ActionBtn
                          color={u.status === "blocked" ? "#059669" : "#d97706"}
                          bg={u.status === "blocked" ? "#ecfdf5" : "#fffbeb"}
                          title={u.status === "blocked" ? "Desbloquear" : "Bloquear"}
                          onClick={() => handleToggleBlock(u)}
                        >
                          {u.status === "blocked" ? <FaCheck size={11} /> : <FaBan size={11} />}
                        </ActionBtn>
                        <ActionBtn color="#dc2626" bg="#fef2f2" title="Eliminar" onClick={() => setDeleteTarget(u)}><FaTrash size={11} /></ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: "0.9rem 1.25rem", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Página {page} de {pages}</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <PageBtn disabled={page <= 1} onClick={() => setPage(page - 1)}><FaChevronLeft size={11} /></PageBtn>
              <PageBtn disabled={page >= pages} onClick={() => setPage(page + 1)}><FaChevronRight size={11} /></PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────── */}
      {editUser && editForm && (
        <Modal title={`Editar: ${editUser.empresa}`} onClose={() => setEditUser(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <ModalField label="Empresa">
              <ModalInput value={editForm.empresa} onChange={(v) => setEditForm({ ...editForm, empresa: v })} />
            </ModalField>
            <ModalField label="Correo">
              <ModalInput value={editForm.email} type="email" onChange={(v) => setEditForm({ ...editForm, email: v })} />
            </ModalField>
            <ModalField label="Plan">
              <ModalSelect value={editForm.plan} onChange={(v) => setEditForm({ ...editForm, plan: v })}>
                <option value="trial">Trial</option>
                <option value="monthly">Mensual</option>
                <option value="annual">Anual</option>
              </ModalSelect>
            </ModalField>
            <ModalField label="Estado">
              <ModalSelect value={editForm.status} onChange={(v) => setEditForm({ ...editForm, status: v })}>
                <option value="trial">Prueba</option>
                <option value="active">Activo</option>
                <option value="trial_expired">Vencido</option>
                <option value="payment_required">Pago requerido</option>
                <option value="blocked">Bloqueado</option>
              </ModalSelect>
            </ModalField>
            <ModalField label="Días de prueba">
              <ModalInput value={String(editForm.trialDays)} type="number" onChange={(v) => setEditForm({ ...editForm, trialDays: Number(v) })} />
            </ModalField>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
            <button onClick={() => setEditUser(null)} style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#64748b", padding: "10px", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Cancelar</button>
            <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 2, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, padding: "10px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", opacity: saving ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
              <FaSave size={13} />{saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete confirm ───────────────────────────────────────── */}
      {deleteTarget && (
        <Modal title="Confirmar eliminación" onClose={() => setDeleteTarget(null)}>
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: "0 0 1.5rem" }}>
            ¿Eliminar permanentemente a <strong>{deleteTarget.empresa}</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#64748b", padding: "10px", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Cancelar</button>
            <button onClick={handleDelete} style={{ flex: 1, background: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 700, padding: "10px", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Eliminar</button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes cardIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

/* ── Shared micro-components ─────────────────────────────────── */
function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; placeholder?: string; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "9px 12px", fontSize: "0.83rem", outline: "none", fontFamily: "'Outfit',sans-serif", color: "#475569", cursor: "pointer", minWidth: "150px" }}>
      {children}
    </select>
  );
}

function ActionBtn({ color, bg, title, onClick, children }: { color: string; bg: string; title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} style={{ width: "30px", height: "30px", borderRadius: "8px", background: bg, border: "none", color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

function PageBtn({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button disabled={disabled} onClick={onClick} style={{ width: "30px", height: "30px", borderRadius: "8px", background: disabled ? "#f1f5f9" : "#fff", border: "1px solid #e2e8f0", color: disabled ? "#cbd5e1" : "#475569", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.18s ease" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "460px", boxShadow: "0 30px 80px rgba(0,0,0,0.2)", animation: "slideUp 0.25s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.4rem" }}>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1rem", fontWeight: 700, fontFamily: "'Outfit',sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "5px 9px", cursor: "pointer", color: "#64748b" }}><FaTimes size={12} /></button>
        </div>
        {children}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500, fontFamily: "'Outfit',sans-serif" }}>{label}</label>
      {children}
    </div>
  );
}

function ModalInput({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#0f172a", padding: "9px 12px", fontSize: "0.87rem", outline: "none", fontFamily: "'Outfit',sans-serif", transition: "border-color 0.18s" }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
    />
  );
}

function ModalSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#0f172a", padding: "9px 12px", fontSize: "0.87rem", outline: "none", fontFamily: "'Outfit',sans-serif", cursor: "pointer" }}>
      {children}
    </select>
  );
}