import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaArrowLeft, FaCheckCircle, FaCrown,
  FaShieldAlt, FaRocket, FaStar, FaTimes,
} from "react-icons/fa";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap";

const T = {
  bg:       "#f0f2f5",
  surface:  "#ffffff",
  border:   "#e8eaed",
  text:     "#1a1d23",
  muted:    "#6b7280",
  faint:    "#9ca3af",
  gold:     "#c58b2a",
  font:     "'Raleway', sans-serif",
  radius:   "22px",
  shadow:   "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)",
  shadowLg: "0 20px 40px -8px rgba(0,0,0,0.10), 0 8px 16px -4px rgba(0,0,0,0.06)",
};

const PLAN_STYLE: Record<string, {
  color: string; bg: string; border: string;
  gradient: string; icon: React.ReactNode; badge?: string;
}> = {
  monthly: {
    color: "#c58b2a", bg: "#fffbeb", border: "#fde68a",
    gradient: "linear-gradient(135deg,#c58b2a,#e8c47a)",
    icon: <FaCrown />, badge: "Más popular",
  },
  annual: {
    color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
    gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)",
    icon: <FaShieldAlt />, badge: "Mejor valor",
  },
};

interface Plan {
  _id: string;
  name: string;
  type: "trial" | "monthly" | "annual";
  price: number;
  durationDays: number;
  trialDays: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export default function Planes() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [plans, setPlans]         = useState<Plan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);

  // Modal de solicitud
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);
  const [modalDone, setModalDone] = useState(false);

  useEffect(() => {
    api.get("/plans")
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data))             setPlans(data);
        else if (Array.isArray(data?.plans)) setPlans(data.plans);
        else if (Array.isArray(data?.data))  setPlans(data.data);
        else { setPlans([]); }
      })
      .catch(() => toast.error("Error al cargar los planes."))
      .finally(() => setLoading(false));
  }, []);

  const getToken = () => {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s).token : null;
  };

  const isCurrentPlan = (plan: Plan) =>
    user?.plan === plan.type && user?.status === "active";

  const handleSelectPlan = (plan: Plan) => {
    if (!user) { navigate("/login"); return; }
    if (isCurrentPlan(plan)) { toast.info("Ya tienes este plan activo."); return; }
    setModalPlan(plan);
    setModalDone(false);
  };

  const handleEnviarSolicitud = async () => {
    if (!modalPlan || !user) return;
    setSending(true);
    try {
      await api.post("/plan-requests", {
        empresa:        user.empresa,
        email:          user.email,
        planActual:     user.plan,
        planSolicitado: modalPlan.type,
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      setModalDone(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al enviar la solicitud.");
    } finally { setSending(false); }
  };

  const visiblePlans = plans.filter((p) => p.isActive && p.type !== "trial");

  return (
    <>
      <link rel="stylesheet" href={FONT_LINK} />
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, paddingBottom: "4rem" }}>

        {/* Top bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${T.border}`,
          padding: "0.9rem 2rem",
          display: "flex", alignItems: "center", gap: "1rem",
        }}>
          <button onClick={() => navigate(-1 as any)} style={{
            background: "none", border: `1px solid ${T.border}`, borderRadius: "10px",
            color: T.muted, cursor: "pointer", padding: "6px 13px", fontSize: "0.88rem",
            display: "flex", alignItems: "center", gap: "6px", fontFamily: T.font, transition: "all 0.18s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
          >
            <FaArrowLeft size={11} /> Volver
          </button>
          <span style={{ fontWeight: 700, fontSize: "1.2rem", color: T.text, letterSpacing: "-0.01em" }}>Planes</span>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "2rem 1.25rem 1.5rem" }}>
          <span style={{
            display: "inline-block", background: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: "20px", padding: "4px 14px", fontSize: "0.8rem",
            color: T.gold, fontWeight: 600, letterSpacing: "0.06em",
            textTransform: "uppercase", marginBottom: "0.75rem",
          }}>Elige tu plan</span>

          <h1 style={{
            margin: "0 0 0.6rem", fontWeight: 800,
            fontSize: "clamp(1.7rem,3.5vw,2.4rem)",
            color: T.text, lineHeight: 1.15, letterSpacing: "-0.02em",
          }}>
            Gestiona tus cheques<br />
            <span style={{ color: T.gold }}>sin límites</span>
          </h1>

          <p style={{ color: T.muted, fontSize: "1rem", maxWidth: "380px", margin: "0 auto" }}>
            Selecciona el plan que mejor se adapta a tu negocio.
          </p>

          {user && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              marginTop: "1rem",
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: "20px", padding: "5px 16px",
              fontSize: "0.85rem", color: T.muted, boxShadow: T.shadow,
            }}>
              Plan actual:&nbsp;
              <span style={{ color: T.gold, fontWeight: 700 }}>
                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
              </span>
              &nbsp;·&nbsp;
              <span style={{ color: user.status === "active" ? "#059669" : "#dc2626", fontWeight: 600 }}>
                {user.status === "active" ? "Activo" : user.status === "trial" ? "En prueba" : "Vencido"}
              </span>
            </div>
          )}
        </div>

        {/* Cards grid */}
        <div style={{
          maxWidth: "860px", margin: "0 auto", padding: "0 1.25rem",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.4rem", alignItems: "start",
        }}>
          {loading ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: T.muted, padding: "3rem", fontSize: "1rem" }}>
              Cargando planes...
            </div>
          ) : visiblePlans.map((plan, i) => {
            const style     = PLAN_STYLE[plan.type] ?? PLAN_STYLE.monthly;
            const isCurrent = isCurrentPlan(plan);
            const isPopular = plan.type === "monthly";
            const delay     = `${i * 0.08}s`;

            return (
              <div key={plan._id} style={{
                position: "relative", overflow: "hidden",
                background: T.surface,
                border: isCurrent
                  ? `2px solid ${style.color}`
                  : isPopular ? `1.5px solid ${style.border}` : `1px solid ${T.border}`,
                borderRadius: T.radius, padding: "2rem",
                boxShadow: isPopular ? `${T.shadowLg}, 0 0 0 4px ${style.color}12` : T.shadowLg,
                animation: `cardIn 0.45s ease ${delay} both`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 28px 55px -8px rgba(0,0,0,0.14), 0 0 0 4px ${style.color}18`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isPopular ? `${T.shadowLg}, 0 0 0 4px ${style.color}12` : T.shadowLg; }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: style.gradient, borderRadius: "22px 22px 0 0" }} />

                {style.badge && (
                  <div style={{ position: "absolute", top: "1.1rem", right: "1.1rem", background: style.bg, border: `1px solid ${style.border}`, borderRadius: "20px", padding: "3px 11px", fontSize: "0.75rem", color: style.color, fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                    <FaStar size={9} /> {style.badge}
                  </div>
                )}

                <div style={{ fontSize: "2rem", color: style.color, marginBottom: "0.6rem", marginTop: "0.3rem" }}>{style.icon}</div>
                <h3 style={{ margin: "0 0 0.35rem", color: T.text, fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.01em" }}>{plan.name}</h3>
                <p style={{ margin: "0 0 1.3rem", color: T.muted, fontSize: "0.95rem" }}>{plan.description}</p>

                <div style={{ marginBottom: "1.4rem", paddingBottom: "1.4rem", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: "2.4rem", fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>
                    ${plan.price.toLocaleString("es-DO")}
                  </span>
                  <span style={{ color: T.muted, fontSize: "0.92rem", marginLeft: "6px" }}>
                    USD / {plan.type === "annual" ? "año" : "mes"}
                  </span>
                  {plan.type === "annual" && (
                    <div style={{ color: "#059669", fontSize: "0.82rem", marginTop: "4px", fontWeight: 500 }}>
                      ✓ Equivale a 2 meses gratis
                    </div>
                  )}
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.6rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: T.text, fontSize: "0.95rem" }}>
                      <FaCheckCircle style={{ color: style.color, flexShrink: 0, fontSize: "0.75rem", marginTop: "3px" }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div style={{ textAlign: "center", padding: "12px", background: style.bg, border: `1px solid ${style.border}`, borderRadius: "12px", color: style.color, fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                    <FaCheckCircle size={14} /> Plan actual
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    style={{
                      width: "100%", background: style.gradient,
                      border: "none", borderRadius: "12px",
                      color: "#fff", fontWeight: 700, fontSize: "1rem",
                      padding: "14px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      fontFamily: T.font,
                      boxShadow: `0 4px 14px ${style.color}35`,
                      transition: "opacity 0.18s, transform 0.18s, box-shadow 0.18s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${style.color}50`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 14px ${style.color}35`; }}
                  >
                    <FaRocket size={14} /> Seleccionar plan
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Modal de solicitud ────────────────────────────────── */}
        {modalPlan && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem", animation: "fadeIn 0.18s ease",
          }}>
            <div style={{
              background: "#fff", borderRadius: "24px", padding: "2.4rem",
              width: "100%", maxWidth: "440px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
              animation: "slideUp 0.25s ease",
            }}>
              {!modalDone ? (
                <>
                  {/* Confirmación */}
                  <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                      {PLAN_STYLE[modalPlan.type]?.icon}
                    </div>
                    <h3 style={{ margin: "0 0 0.5rem", color: T.text, fontSize: "1.1rem", fontWeight: 700, fontFamily: T.font }}>
                      Solicitar {modalPlan.name}
                    </h3>
                    <p style={{ margin: 0, color: T.muted, fontSize: "0.86rem", lineHeight: 1.6 }}>
                      Al confirmar, enviaremos tu solicitud al equipo de Cheqify. Te contactaremos a la brevedad para completar el proceso.
                    </p>
                  </div>

                  {/* Info del plan */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1rem 1.2rem", marginBottom: "1.6rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ color: T.muted, fontSize: "0.82rem" }}>Plan solicitado</span>
                      <span style={{ color: PLAN_STYLE[modalPlan.type]?.color, fontWeight: 700, fontSize: "0.88rem" }}>{modalPlan.name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: T.muted, fontSize: "0.82rem" }}>Precio</span>
                      <span style={{ color: T.text, fontWeight: 700, fontSize: "0.88rem" }}>
                        ${modalPlan.price.toLocaleString("es-DO")} USD / {modalPlan.type === "annual" ? "año" : "mes"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setModalPlan(null)} style={{
                      flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px",
                      color: T.muted, padding: "11px", cursor: "pointer", fontSize: "0.85rem",
                      fontFamily: T.font, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    }}>
                      <FaTimes size={11} /> Cancelar
                    </button>
                    <button onClick={handleEnviarSolicitud} disabled={sending} style={{
                      flex: 2, background: PLAN_STYLE[modalPlan.type]?.gradient,
                      border: "none", borderRadius: "12px",
                      color: "#fff", fontWeight: 700, padding: "11px", cursor: "pointer",
                      fontSize: "0.85rem", fontFamily: T.font, opacity: sending ? 0.75 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                      boxShadow: `0 4px 14px ${PLAN_STYLE[modalPlan.type]?.color}35`,
                    }}>
                      <FaRocket size={12} />
                      {sending ? "Enviando..." : "Confirmar solicitud"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Confirmación exitosa */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#ecfdf5", border: "2px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem", fontSize: "2rem" }}>
                      ✅
                    </div>
                    <h3 style={{ margin: "0 0 0.6rem", color: T.text, fontSize: "1.1rem", fontWeight: 700, fontFamily: T.font }}>
                      ¡Solicitud enviada!
                    </h3>
                    <p style={{ margin: "0 0 1.6rem", color: T.muted, fontSize: "0.86rem", lineHeight: 1.7 }}>
                      Tu solicitud para el <strong>{modalPlan.name}</strong> ha sido recibida. El equipo de Cheqify se pondrá en contacto contigo a la brevedad posible.
                    </p>
                    <div style={{ background: "#f0fdf4", border: "1.5px solid #a7f3d0", borderRadius: "12px", padding: "12px 16px", marginBottom: "1.6rem" }}>
                      <p style={{ margin: 0, color: "#059669", fontSize: "0.82rem", fontWeight: 600 }}>
                        ⏳ Tiempo de respuesta estimado: 24 horas hábiles
                      </p>
                    </div>
                    <button onClick={() => { setModalPlan(null); navigate("/mi-cuenta"); }} style={{
                      width: "100%", background: "linear-gradient(135deg,#059669,#047857)",
                      border: "none", borderRadius: "12px", color: "#fff",
                      fontWeight: 700, padding: "12px", cursor: "pointer",
                      fontSize: "0.9rem", fontFamily: T.font,
                      boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
                    }}>
                      Volver a Mi Cuenta
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes cardIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    </>
  );
}