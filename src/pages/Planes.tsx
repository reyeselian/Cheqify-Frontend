import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaArrowLeft, FaCheckCircle, FaCrown,
  FaShieldAlt, FaRocket, FaStar,
} from "react-icons/fa";

/* ── Google Font ─────────────────────────────────────────────── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";

/* ── Design tokens ───────────────────────────────────────────── */
const T = {
  bg:       "#f0f2f5",
  surface:  "#ffffff",
  border:   "#e8eaed",
  text:     "#1a1d23",
  muted:    "#6b7280",
  faint:    "#9ca3af",
  gold:     "#c58b2a",
  font:     "'Outfit', sans-serif",
  radius:   "22px",
  shadow:   "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)",
  shadowLg: "0 20px 40px -8px rgba(0,0,0,0.10), 0 8px 16px -4px rgba(0,0,0,0.06)",
};

/* ── Plan style — only monthly & annual shown ────────────────── */
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
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans]     = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    api.get("/plans")
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data))             setPlans(data);
        else if (Array.isArray(data?.plans)) setPlans(data.plans);
        else if (Array.isArray(data?.data))  setPlans(data.data);
        else { console.warn("Formato inesperado:", data); setPlans([]); }
      })
      .catch(() => toast.error("Error al cargar los planes."))
      .finally(() => setLoading(false));
  }, []);

  const getToken = () => {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s).token : null;
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) { navigate("/login"); return; }
    if (user.plan === plan.type && user.status === "active") {
      toast.info("Ya tienes este plan activo."); return;
    }
    setSelecting(plan._id);
    try {
      await api.patch(
        "/auth/update",
        { plan: plan.type, planRef: plan._id, status: "payment_required" },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      updateUser({ plan: plan.type, planRef: plan._id, status: "payment_required" });
      toast.success(`✅ Plan ${plan.name} seleccionado. Completa el pago para activarlo.`);
      setTimeout(() => navigate("/mi-cuenta"), 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al seleccionar el plan.");
    } finally { setSelecting(null); }
  };

  const isCurrentPlan = (plan: Plan) =>
    user?.plan === plan.type && user?.status === "active";

  /* ── Filter: exclude trial, only show active non-trial plans ── */
  const visiblePlans = plans.filter((p) => p.isActive && p.type !== "trial");

  return (
    <>
      <link rel="stylesheet" href={FONT_LINK} />
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, paddingBottom: "6rem" }}>

        {/* ── Top bar ─────────────────────────────── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${T.border}`,
          padding: "0.9rem 2rem",
          display: "flex", alignItems: "center", gap: "1rem",
        }}>
          <button onClick={() => navigate(-1 as any)} style={{
            background: "none", border: `1px solid ${T.border}`, borderRadius: "10px",
            color: T.muted, cursor: "pointer", padding: "6px 13px", fontSize: "0.82rem",
            display: "flex", alignItems: "center", gap: "6px", fontFamily: T.font,
            transition: "all 0.18s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
          >
            <FaArrowLeft size={11} /> Volver
          </button>
          <span style={{ fontWeight: 700, fontSize: "1.2rem", color: T.text, letterSpacing: "-0.01em" }}>
            Planes
          </span>
        </div>

        {/* ── Hero ────────────────────────────────── */}
        <div style={{ textAlign: "center", padding: "3.5rem 1.25rem 2rem" }}>
          <span style={{
            display: "inline-block", background: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: "20px", padding: "4px 14px", fontSize: "0.73rem",
            color: T.gold, fontWeight: 600, letterSpacing: "0.06em",
            textTransform: "uppercase", marginBottom: "1rem",
          }}>
            Elige tu plan
          </span>

          <h1 style={{
            margin: "0 0 0.75rem", fontWeight: 800,
            fontSize: "clamp(1.9rem,4vw,2.8rem)",
            color: T.text, lineHeight: 1.15, letterSpacing: "-0.02em",
          }}>
            Gestiona tus cheques<br />
            <span style={{ color: T.gold }}>sin límites</span>
          </h1>

          <p style={{ color: T.muted, fontSize: "0.95rem", maxWidth: "380px", margin: "0 auto" }}>
            Selecciona el plan que mejor se adapta a tu negocio.
          </p>

          {/* Current plan chip */}
          {user && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              marginTop: "1.3rem",
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: "20px", padding: "5px 16px",
              fontSize: "0.78rem", color: T.muted,
              boxShadow: T.shadow,
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

        {/* ── Cards grid ──────────────────────────── */}
        <div style={{
          maxWidth: "820px", margin: "0 auto",
          padding: "0 1.25rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.4rem",
          alignItems: "start",
        }}>
          {loading ? (
            <div style={{
              gridColumn: "1/-1", textAlign: "center",
              color: T.muted, padding: "3rem", fontSize: "0.9rem",
            }}>
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
                  : isPopular
                    ? `1.5px solid ${style.border}`
                    : `1px solid ${T.border}`,
                borderRadius: T.radius,
                padding: "2rem",
                boxShadow: isPopular ? `${T.shadowLg}, 0 0 0 4px ${style.color}12` : T.shadowLg,
                animation: `cardIn 0.45s ease ${delay} both`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 28px 55px -8px rgba(0,0,0,0.14), 0 0 0 4px ${style.color}18`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isPopular ? `${T.shadowLg}, 0 0 0 4px ${style.color}12` : T.shadowLg; }}
              >
                {/* Colored top strip */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: style.gradient, borderRadius: "22px 22px 0 0" }} />

                {/* Badge */}
                {style.badge && (
                  <div style={{
                    position: "absolute", top: "1.1rem", right: "1.1rem",
                    background: style.bg, border: `1px solid ${style.border}`,
                    borderRadius: "20px", padding: "3px 11px",
                    fontSize: "0.68rem", color: style.color,
                    fontWeight: 700, display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    <FaStar size={8} /> {style.badge}
                  </div>
                )}

                {/* Icon + name */}
                <div style={{ fontSize: "1.8rem", color: style.color, marginBottom: "0.5rem", marginTop: "0.3rem" }}>{style.icon}</div>
                <h3 style={{ margin: "0 0 0.3rem", color: T.text, fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                  {plan.name}
                </h3>
                <p style={{ margin: "0 0 1.3rem", color: T.muted, fontSize: "0.83rem" }}>{plan.description}</p>

                {/* Price */}
                <div style={{ marginBottom: "1.4rem", paddingBottom: "1.4rem", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: "2.2rem", fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>
                    ${plan.price.toLocaleString("es-DO")}
                  </span>
                  <span style={{ color: T.muted, fontSize: "0.82rem", marginLeft: "5px" }}>
                    USD / {plan.type === "annual" ? "año" : "mes"}
                  </span>
                  {plan.type === "annual" && (
                    <div style={{ color: "#059669", fontSize: "0.75rem", marginTop: "4px", fontWeight: 500 }}>
                      
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.6rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: T.text, fontSize: "0.86rem" }}>
                      <FaCheckCircle style={{ color: style.color, flexShrink: 0, fontSize: "0.7rem", marginTop: "3px" }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div style={{
                    textAlign: "center", padding: "11px",
                    background: style.bg, border: `1px solid ${style.border}`,
                    borderRadius: "12px", color: style.color,
                    fontSize: "0.85rem", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  }}>
                    <FaCheckCircle size={13} /> Plan actual
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={selecting === plan._id}
                    style={{
                      width: "100%", background: style.gradient,
                      border: "none", borderRadius: "12px",
                      color: "#fff", fontWeight: 700, fontSize: "0.9rem",
                      padding: "13px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      fontFamily: T.font,
                      boxShadow: `0 4px 14px ${style.color}35`,
                      transition: "opacity 0.18s, transform 0.18s, box-shadow 0.18s",
                      opacity: selecting === plan._id ? 0.75 : 1,
                    }}
                    onMouseEnter={(e) => { if (selecting !== plan._id) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${style.color}50`; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 14px ${style.color}35`; }}
                  >
                    <FaRocket size={13} />
                    {selecting === plan._id ? "Procesando..." : "Seleccionar plan"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes cardIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    </>
  );
}