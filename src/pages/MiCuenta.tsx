import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type AccountStatus, type PlanType } from "../context/AuthContext";
import { api } from "../services/api";
import { toast } from "react-toastify";
import {
  FaUser, FaEnvelope, FaBuilding, FaShieldAlt, FaCrown,
  FaCheckCircle, FaClock, FaEdit, FaSave, FaTimes,
  FaArrowLeft, FaCalendarAlt, FaLock, FaExclamationTriangle,
  FaBan, FaHourglassHalf, FaKey, FaRocket, FaStar,
} from "react-icons/fa";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap";

const T = {
  bg:        "#f0f2f5",
  surface:   "#ffffff",
  border:    "#e8eaed",
  text:      "#1a1d23",
  muted:     "#6b7280",
  faint:     "#9ca3af",
  gold:      "#c58b2a",
  goldLight: "#fef3cd",
  font:      "'Raleway', sans-serif",
  radius:    "20px",
  shadowLg:  "0 20px 40px -8px rgba(0,0,0,0.10), 0 8px 16px -4px rgba(0,0,0,0.06)",
};

const PLAN_CONFIG: Record<PlanType, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  trial: {
    label: "Plan de Prueba", color: "#0891b2",
    bg: "#ecfeff", border: "#a5f3fc",
    icon: <FaHourglassHalf />,
  },
  monthly: {
    label: "Plan Mensual", color: "#c58b2a",
    bg: "#fffbeb", border: "#fde68a",
    icon: <FaCrown />,
  },
  annual: {
    label: "Plan Anual", color: "#7c3aed",
    bg: "#f5f3ff", border: "#ddd6fe",
    icon: <FaShieldAlt />,
  },
};

const STATUS_CONFIG: Record<AccountStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  trial:            { label: "Prueba activa",    color: "#0891b2", bg: "#ecfeff", icon: <FaClock /> },
  trial_expired:    { label: "Prueba vencida",   color: "#d97706", bg: "#fffbeb", icon: <FaExclamationTriangle /> },
  active:           { label: "Activo",           color: "#059669", bg: "#ecfdf5", icon: <FaCheckCircle /> },
  payment_required: { label: "Pago requerido",   color: "#dc2626", bg: "#fef2f2", icon: <FaExclamationTriangle /> },
  blocked:          { label: "Bloqueada",        color: "#9f1239", bg: "#fff1f2", icon: <FaBan /> },
};

function calcTrialDaysLeft(registeredAt: string, trialDays: number): number {
  const start = new Date(registeredAt).getTime();
  const end   = start + trialDays * 86400000;
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}

export default function MiCuenta() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const getToken = () => {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s).token : null;
  };

  // ── Features reales del plan desde la API ─────────────────
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.plan) return;
    api.get("/plans")
      .then((res) => {
        const plans = Array.isArray(res.data) ? res.data
          : Array.isArray(res.data?.data) ? res.data.data
          : [];
        const match = plans.find((p: any) => p.type === user.plan && p.isActive);
        if (match?.features?.length) setPlanFeatures(match.features);
      })
      .catch(() => {});
  }, [user?.plan]);

  const [showPwGate, setShowPwGate]       = useState(false);
  const [pwGateInput, setPwGateInput]     = useState("");
  const [pwGateLoading, setPwGateLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [editingEmpresa, setEditingEmpresa] = useState(false);
  const [empresaValue, setEmpresaValue]     = useState(user?.empresa || "");
  const [savingEmpresa, setSavingEmpresa]   = useState(false);

  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw, setCurrentPw]         = useState("");
  const [newPw, setNewPw]                 = useState("");
  const [confirmPw, setConfirmPw]         = useState("");
  const [savingPw, setSavingPw]           = useState(false);

  const requestEdit = (action: () => void) => {
    setPendingAction(() => action);
    setPwGateInput("");
    setShowPwGate(true);
  };

  const verifyAndProceed = async () => {
    if (!pwGateInput.trim()) return toast.error("Ingresa tu contraseña.");
    setPwGateLoading(true);
    try {
      await api.post("/auth/verify-password", { password: pwGateInput }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setShowPwGate(false);
      pendingAction?.();
      setPendingAction(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Contraseña incorrecta.");
    } finally { setPwGateLoading(false); }
  };

  const handleSaveEmpresa = async () => {
    if (!empresaValue.trim()) return toast.error("El nombre no puede estar vacío.");
    setSavingEmpresa(true);
    try {
      await api.patch("/auth/update", { empresa: empresaValue.trim() }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      updateUser({ empresa: empresaValue.trim() });
      toast.success("✅ Empresa actualizada.");
      setEditingEmpresa(false);
    } catch { toast.error("Error al actualizar la empresa."); }
    finally { setSavingEmpresa(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return toast.error("Completa todos los campos.");
    if (newPw !== confirmPw)               return toast.error("Las contraseñas no coinciden.");
    if (newPw.length < 6)                  return toast.error("Mínimo 6 caracteres.");
    setSavingPw(true);
    try {
      await api.patch("/auth/change-password", { currentPassword: currentPw, newPassword: newPw }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success("🔐 Contraseña actualizada. Vuelve a iniciar sesión.");
      setTimeout(() => { logout(); navigate("/login"); }, 1800);
    } catch (err: any) { toast.error(err?.response?.data?.message || "Contraseña actual incorrecta."); }
    finally { setSavingPw(false); }
  };

  if (!user) return null;

  const planCfg        = PLAN_CONFIG[user.plan]     ?? PLAN_CONFIG.trial;
  const statusCfg      = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.trial;
  const isTrialExpired = ["trial_expired", "payment_required", "blocked"].includes(user.status);
  const trialDaysLeft  = user.status === "trial" ? calcTrialDaysLeft(user.registeredAt, user.trialDays) : null;
  const registeredFmt  = new Date(user.registeredAt).toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" });
  const expiresFmt     = user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" }) : null;
  const customPriceNote = (user as any).customPriceNote as string | null | undefined;

  return (
    <>
      <link rel="stylesheet" href={FONT_LINK} />
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, paddingBottom: "5rem" }}>

        {/* Top bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${T.border}`, padding: "0.9rem 2rem",
          display: "flex", alignItems: "center", gap: "1rem",
        }}>
          <button onClick={() => navigate("/home")} style={{
            background: "none", border: `1px solid ${T.border}`, borderRadius: "10px",
            color: T.muted, cursor: "pointer", padding: "6px 13px", fontSize: "0.82rem",
            display: "flex", alignItems: "center", gap: "6px", fontFamily: T.font, transition: "all 0.18s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
          >
            <FaArrowLeft size={11} /> Volver
          </button>
          <span style={{ fontWeight: 700, fontSize: "1.2rem", color: T.text, letterSpacing: "-0.01em" }}>Mi Cuenta</span>
          {isTrialExpired && (
            <div style={{
              marginLeft: "auto", background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "20px", padding: "4px 14px", fontSize: "0.75rem", color: "#dc2626",
              fontWeight: 600, display: "flex", alignItems: "center", gap: "6px",
            }}>
              <FaExclamationTriangle size={10} /> Prueba vencida
            </div>
          )}
        </div>

        {/* Trial expired banner */}
        {isTrialExpired && (
          <div style={{ maxWidth: "860px", margin: "1.5rem auto 0", padding: "0 1.25rem" }}>
            <div style={{
              background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: T.radius,
              padding: "1.1rem 1.5rem", display: "flex", flexWrap: "wrap",
              alignItems: "center", gap: "1rem", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                  background: "#ffedd5", border: "1px solid #fed7aa",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c",
                }}>
                  <FaExclamationTriangle size={15} />
                </div>
                <div>
                  <p style={{ margin: 0, color: "#9a3412", fontWeight: 600, fontSize: "0.9rem" }}>Tu período de prueba ha vencido</p>
                  <p style={{ margin: "2px 0 0", color: "#c2410c", fontSize: "0.78rem" }}>Solo puedes consultar cheques existentes. Actualiza tu plan para continuar.</p>
                </div>
              </div>
              <button onClick={() => navigate("/planes")} style={{
                background: "linear-gradient(135deg,#ea580c,#c2410c)", border: "none", borderRadius: "10px",
                color: "#fff", fontWeight: 600, fontSize: "0.82rem", padding: "9px 18px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "7px", fontFamily: T.font,
                boxShadow: "0 4px 12px rgba(234,88,12,0.3)", transition: "transform 0.18s, box-shadow 0.18s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 7px 20px rgba(234,88,12,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(234,88,12,0.3)"; }}
              >
                <FaRocket size={12} /> Ver Planes
              </button>
            </div>
          </div>
        )}

        <div style={{ maxWidth: "860px", margin: "2rem auto", padding: "0 1.25rem", display: "grid", gap: "1.25rem" }}>

          {/* CARD 1 — Cuenta */}
          <Card label="Información de la Cuenta" icon={<FaUser />} delay="0ms">
            <Row label="Empresa" icon={<FaBuilding />}>
              {editingEmpresa ? (
                <InlineEdit value={empresaValue} onChange={setEmpresaValue}
                  onSave={handleSaveEmpresa}
                  onCancel={() => { setEditingEmpresa(false); setEmpresaValue(user.empresa); }}
                  saving={savingEmpresa} placeholder="Nombre de la empresa" />
              ) : (
                <ValueDisplay value={user.empresa} onEdit={() => requestEdit(() => setEditingEmpresa(true))} />
              )}
            </Row>

            <Divider />

            <Row label="Correo electrónico" icon={<FaEnvelope />}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ color: T.text, fontSize: "0.92rem", fontWeight: 500 }}>{user.email}</span>
                <span style={{
                  background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "20px",
                  padding: "2px 10px", fontSize: "0.68rem", color: "#059669", fontWeight: 600,
                  display: "inline-flex", alignItems: "center", gap: "4px",
                }}>
                  <FaCheckCircle size={9} /> Verificado
                </span>
              </div>
            </Row>

            <Divider />

            <Row label="Miembro desde" icon={<FaCalendarAlt />}>
              <span style={{ color: T.muted, fontSize: "0.9rem", fontWeight: 500 }}>{registeredFmt}</span>
            </Row>
          </Card>

          {/* CARD 2 — Plan */}
          <Card label="Plan Actual" icon={planCfg.icon} accentColor={planCfg.color} delay="80ms">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              <div style={{
                background: planCfg.bg, border: `1px solid ${planCfg.border}`,
                borderRadius: "16px", padding: "1.4rem 1.6rem", minWidth: "185px",
                textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.55rem",
              }}>
                <div style={{ fontSize: "2.2rem", color: planCfg.color }}>{planCfg.icon}</div>
                <div style={{ color: planCfg.color, fontWeight: 700, fontSize: "0.98rem" }}>{planCfg.label}</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  background: statusCfg.bg, border: `1px solid ${statusCfg.color}30`,
                  borderRadius: "20px", padding: "3px 12px",
                  fontSize: "0.72rem", color: statusCfg.color, fontWeight: 600,
                }}>
                  {statusCfg.icon}&nbsp;{statusCfg.label}
                </div>
                {trialDaysLeft !== null && (
                  <div style={{ fontSize: "0.77rem", color: trialDaysLeft <= 3 ? "#dc2626" : T.muted, fontWeight: trialDaysLeft <= 3 ? 700 : 400 }}>
                    {trialDaysLeft > 0 ? `⏳ ${trialDaysLeft} día${trialDaysLeft !== 1 ? "s" : ""} restante${trialDaysLeft !== 1 ? "s" : ""}` : "⛔ Prueba vencida"}
                  </div>
                )}
                {expiresFmt && <div style={{ fontSize: "0.72rem", color: T.faint }}>Vence: {expiresFmt}</div>}
              </div>

              <div style={{ flex: 1, minWidth: "190px" }}>
                {planFeatures.length > 0 && (
                  <>
                    <p style={{ color: T.faint, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", fontWeight: 600 }}>Incluye</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.25rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                      {planFeatures.map((f, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "center", gap: "9px", color: T.text, fontSize: "0.87rem" }}>
                          <FaCheckCircle style={{ color: planCfg.color, flexShrink: 0, fontSize: "0.68rem" }} />{f}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {user.plan !== "annual" && (
                  <button onClick={() => navigate("/planes")} style={{
                    background: planCfg.bg, border: `1.5px solid ${planCfg.border}`,
                    borderRadius: "12px", color: planCfg.color, fontWeight: 700, fontSize: "0.83rem",
                    padding: "9px 20px", cursor: "pointer", display: "inline-flex", alignItems: "center",
                    gap: "8px", fontFamily: T.font, transition: "all 0.18s", boxShadow: `0 2px 8px ${planCfg.color}20`,
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = planCfg.color; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = `0 6px 20px ${planCfg.color}40`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = planCfg.bg; e.currentTarget.style.color = planCfg.color; e.currentTarget.style.boxShadow = `0 2px 8px ${planCfg.color}20`; }}
                  >
                    <FaRocket size={12} />{isTrialExpired ? "Activar Plan Ahora" : "Mejorar Plan →"}
                  </button>
                )}

                {/* ── Mensaje de precio especial del admin ── */}
                {customPriceNote && (
                  <div style={{
                    marginTop: "0.9rem",
                    background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: "12px", padding: "10px 14px",
                    display: "flex", alignItems: "center", gap: "8px",
                    fontSize: "0.78rem", color: "#92400e", fontWeight: 500,
                  }}>
                    <FaStar size={11} style={{ color: "#f59e0b", flexShrink: 0 }} />
                    {customPriceNote}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* CARD 3 — Seguridad */}
          <Card label="Seguridad" icon={<FaLock />} delay="160ms">
            <button onClick={() => requestEdit(() => setShowPwSection((v) => !v))} style={{
              background: "none", border: `1px solid ${T.border}`, borderRadius: "10px",
              color: T.muted, cursor: "pointer", padding: "8px 16px", fontSize: "0.83rem",
              display: "flex", alignItems: "center", gap: "7px", fontFamily: T.font, transition: "all 0.18s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
            >
              <FaKey size={12} />{showPwSection ? "Cancelar" : "Cambiar contraseña"}
            </button>

            {showPwSection && (
              <div style={{ marginTop: "1.3rem", display: "flex", flexDirection: "column", gap: "0.9rem", maxWidth: "380px" }}>
                <StackedInput label="Contraseña actual"          type="password" value={currentPw}  onChange={setCurrentPw}  placeholder="••••••••" />
                <StackedInput label="Nueva contraseña"           type="password" value={newPw}       onChange={setNewPw}       placeholder="••••••••" />
                <StackedInput label="Confirmar nueva contraseña" type="password" value={confirmPw}   onChange={setConfirmPw}   placeholder="••••••••" />
                <button onClick={handleChangePassword} disabled={savingPw} style={{
                  alignSelf: "flex-start", background: T.gold, border: "none", borderRadius: "10px",
                  color: "#fff", fontWeight: 600, padding: "9px 22px", cursor: "pointer",
                  fontSize: "0.83rem", opacity: savingPw ? 0.7 : 1,
                  display: "flex", alignItems: "center", gap: "7px", fontFamily: T.font,
                  boxShadow: `0 4px 14px ${T.gold}40`, transition: "transform 0.18s, box-shadow 0.18s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <FaSave size={13} />{savingPw ? "Guardando..." : "Actualizar contraseña"}
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Password gate modal */}
        {showPwGate && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn 0.18s ease",
          }}>
            <div style={{
              background: T.surface, borderRadius: "24px", padding: "2.4rem",
              width: "100%", maxWidth: "400px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)",
              animation: "slideUp 0.25s ease",
            }}>
              <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%", margin: "0 auto 1rem",
                  background: T.goldLight, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", color: T.gold,
                }}>
                  <FaLock />
                </div>
                <h3 style={{ margin: 0, color: T.text, fontSize: "1.05rem", fontWeight: 700, fontFamily: T.font }}>Verificación requerida</h3>
                <p style={{ margin: "0.4rem 0 0", color: T.muted, fontSize: "0.83rem", fontFamily: T.font }}>Ingresa tu contraseña para continuar</p>
              </div>

              <input
                type="password" value={pwGateInput}
                onChange={(e) => setPwGateInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyAndProceed()}
                placeholder="••••••••" autoFocus
                style={{
                  width: "100%", background: T.bg, border: `1.5px solid ${T.border}`,
                  borderRadius: "12px", color: T.text, padding: "12px 16px", fontSize: "1rem",
                  outline: "none", boxSizing: "border-box", marginBottom: "1rem",
                  fontFamily: T.font, transition: "border-color 0.18s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = T.gold)}
                onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => { setShowPwGate(false); setPendingAction(null); }} style={{
                  flex: 1, background: T.bg, border: `1px solid ${T.border}`, borderRadius: "12px",
                  color: T.muted, padding: "11px", cursor: "pointer", fontSize: "0.85rem",
                  fontFamily: T.font, transition: "all 0.18s",
                }}>Cancelar</button>
                <button onClick={verifyAndProceed} disabled={pwGateLoading} style={{
                  flex: 2, background: T.gold, border: "none", borderRadius: "12px",
                  color: "#fff", fontWeight: 700, padding: "11px", cursor: "pointer",
                  fontSize: "0.85rem", fontFamily: T.font, opacity: pwGateLoading ? 0.75 : 1,
                  boxShadow: `0 4px 14px ${T.gold}40`, transition: "opacity 0.18s",
                }}>
                  {pwGateLoading ? "Verificando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
          @keyframes cardIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    </>
  );
}

function Card({ label, icon, children, accentColor, delay = "0ms" }: {
  label: string; icon: React.ReactNode; children: React.ReactNode; accentColor?: string; delay?: string;
}) {
  return (
    <div style={{
      background: "#ffffff", borderRadius: "20px", padding: "1.8rem 2rem",
      border: accentColor ? `1px solid ${accentColor}22` : `1px solid #e8eaed`,
      boxShadow: "0 20px 40px -8px rgba(0,0,0,0.10), 0 8px 16px -4px rgba(0,0,0,0.06)",
      animation: `cardIn 0.4s ease ${delay} both`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "1.4rem" }}>
        <span style={{ color: accentColor ?? "#c58b2a", fontSize: "0.88rem" }}>{icon}</span>
        <h2 style={{ margin: 0, color: "#1a1d23", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.01em", fontFamily: "'Raleway', sans-serif" }}>{label}</h2>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "#e8eaed", margin: "1rem 0" }} />;
}

function Row({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ minWidth: "185px", display: "flex", alignItems: "center", gap: "7px" }}>
        <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>{icon}</span>
        <span style={{ color: "#6b7280", fontSize: "0.78rem", fontWeight: 500, fontFamily: "'Raleway', sans-serif" }}>{label}</span>
      </div>
      <div style={{ flex: 1, minWidth: "180px" }}>{children}</div>
    </div>
  );
}

function ValueDisplay({ value, onEdit }: { value: string; onEdit: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
      <span style={{ color: "#1a1d23", fontSize: "0.92rem", fontWeight: 500 }}>{value}</span>
      <button onClick={onEdit} style={{
        background: "none", border: `1px solid #e8eaed`, borderRadius: "8px",
        color: "#6b7280", cursor: "pointer", padding: "3px 10px", fontSize: "0.73rem",
        display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Raleway', sans-serif",
        transition: "all 0.18s", whiteSpace: "nowrap",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c58b2a"; e.currentTarget.style.color = "#c58b2a"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e8eaed"; e.currentTarget.style.color = "#6b7280"; }}
      >
        <FaEdit size={10} /> Editar
      </button>
    </div>
  );
}

function InlineEdit({ value, onChange, onSave, onCancel, saving, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; onSave: () => void; onCancel: () => void;
  saving: boolean; placeholder: string; type?: string;
}) {
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} onKeyDown={(e) => e.key === "Enter" && onSave()}
        style={{
          flex: 1, minWidth: "150px", background: "#f0f2f5", border: `1.5px solid #e8eaed`,
          borderRadius: "9px", color: "#1a1d23", padding: "7px 12px", fontSize: "0.87rem",
          outline: "none", fontFamily: "'Raleway', sans-serif", transition: "border-color 0.18s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#c58b2a")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#e8eaed")}
      />
      <button onClick={onSave} disabled={saving} style={{
        background: "#c58b2a", border: "none", borderRadius: "9px", color: "#fff",
        fontWeight: 600, padding: "7px 14px", cursor: "pointer", fontSize: "0.78rem",
        opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Raleway', sans-serif",
      }}>
        <FaSave size={11} />{saving ? "..." : "Guardar"}
      </button>
      <button onClick={onCancel} style={{
        background: "none", border: `1px solid #e8eaed`, borderRadius: "9px",
        color: "#6b7280", cursor: "pointer", padding: "7px 10px",
      }}>
        <FaTimes size={11} />
      </button>
    </div>
  );
}

function StackedInput({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: 500, fontFamily: "'Raleway', sans-serif" }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{
          background: "#f0f2f5", border: `1.5px solid #e8eaed`, borderRadius: "10px",
          color: "#1a1d23", padding: "9px 13px", fontSize: "0.87rem", outline: "none",
          fontFamily: "'Raleway', sans-serif", transition: "border-color 0.18s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#c58b2a")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#e8eaed")}
      />
    </div>
  );
}