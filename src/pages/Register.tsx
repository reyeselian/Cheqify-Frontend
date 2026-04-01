// src/pages/Register.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type PlanType = "trial" | "monthly" | "annual";

interface IPlanAPI {
  _id: string;
  name: string;
  type: PlanType;
  price: number;
  durationDays: number;
  trialDays: number;
  description: string;
  features: string[];
  isActive: boolean;
}

const PLAN_META: Record<PlanType, { color: string; icon: string; badge?: string; period: string }> = {
  trial:   { color: "#0ea5e9", icon: "🚀", period: "" },
  monthly: { color: "#f59e0b", icon: "📅", period: "/ mes", badge: "Popular" },
  annual:  { color: "#8b5cf6", icon: "⚡", period: "/ año", badge: "Mejor valor" },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .reg-root {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    padding: 2.5rem 1rem;
    overflow: hidden;
  }
  .reg-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 15%, rgba(14,165,233,0.07) 0%, transparent 50%),
      radial-gradient(circle at 85% 85%, rgba(139,92,246,0.07) 0%, transparent 50%),
      radial-gradient(circle at 70% 5%,  rgba(245,158,11,0.05) 0%, transparent 40%);
    pointer-events: none;
  }

  .logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2.4rem;
    background: linear-gradient(90deg, #0ea5e9, #8b5cf6, #f59e0b);
    background-size: 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: logoPulse 4s linear infinite;
    text-align: center;
    margin-bottom: 0.2rem;
    letter-spacing: -1px;
  }
  @keyframes logoPulse {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .logo-sub {
    color: #94a3b8;
    font-size: 0.75rem;
    text-align: center;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 2.5rem;
  }

  .steps { display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
  .step-dot {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700;
    font-family: 'Syne', sans-serif;
    transition: all 0.35s ease;
    border: 2px solid #e2e8f0;
    color: #94a3b8; background: #fff;
  }
  .step-dot.active { background: #0ea5e9; border-color: #0ea5e9; color: #fff; box-shadow: 0 0 0 4px rgba(14,165,233,0.15); }
  .step-dot.done   { background: rgba(14,165,233,0.1); border-color: #0ea5e9; color: #0ea5e9; }
  .step-line { width: 60px; height: 2px; background: #e2e8f0; transition: background 0.35s ease; }
  .step-line.done { background: #0ea5e9; }

  .plans-wrapper { width: 100%; max-width: 880px; animation: fadeUp 0.45s ease both; position: relative; z-index: 1; }
  .plans-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #0f172a; text-align: center; margin-bottom: 0.4rem; }
  .plans-subtitle { color: #64748b; font-size: 0.875rem; text-align: center; margin-bottom: 2rem; }
  .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.1rem; margin-bottom: 1.6rem; }
  @media (max-width: 700px) { .plans-grid { grid-template-columns: 1fr; } }

  .plan-card {
    position: relative; background: #fff;
    border: 2px solid #e2e8f0; border-radius: 20px;
    padding: 1.6rem 1.4rem; cursor: pointer;
    transition: all 0.28s ease; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .plan-card:hover { border-color: #cbd5e1; box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-3px); }
  .plan-card.selected {
    border-color: var(--plan-color);
    box-shadow: 0 0 0 1px var(--plan-color), 0 12px 32px rgba(0,0,0,0.09);
    transform: translateY(-4px);
  }
  .plan-card.selected::after {
    content: ''; position: absolute; inset: 0; border-radius: 18px;
    background: radial-gradient(ellipse at top left, color-mix(in srgb, var(--plan-color) 6%, transparent), transparent 60%);
    pointer-events: none;
  }
  .plan-badge {
    position: absolute; top: 14px; right: 14px;
    background: var(--plan-color); color: #fff;
    font-size: 0.62rem; font-weight: 700;
    font-family: 'Syne', sans-serif;
    letter-spacing: 0.8px; padding: 3px 10px;
    border-radius: 20px; text-transform: uppercase;
  }
  .plan-icon {
    width: 44px; height: 44px; border-radius: 13px;
    background: color-mix(in srgb, var(--plan-color) 10%, transparent);
    border: 1.5px solid color-mix(in srgb, var(--plan-color) 22%, transparent);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.25rem; margin-bottom: 1rem;
  }
  .plan-name { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem; }
  .plan-desc { font-size: 0.78rem; color: #94a3b8; margin-bottom: 1rem; line-height: 1.5; }
  .plan-price-wrap { display: flex; align-items: baseline; gap: 3px; margin-bottom: 0.75rem; }
  .plan-price { font-family: 'Syne', sans-serif; font-size: 2.1rem; font-weight: 800; color: var(--plan-color); line-height: 1; }
  .plan-period { font-size: 0.8rem; color: #94a3b8; }
  .trial-tag {
    font-size: 0.73rem; font-weight: 600; color: var(--plan-color);
    background: color-mix(in srgb, var(--plan-color) 10%, transparent);
    border-radius: 6px; padding: 2px 8px; margin-bottom: 0.75rem; display: inline-block;
  }
  .plan-divider { height: 1px; background: #f1f5f9; margin-bottom: 1rem; }
  .plan-features { list-style: none; display: flex; flex-direction: column; gap: 0.55rem; }
  .plan-features li { font-size: 0.8rem; color: #475569; display: flex; align-items: center; gap: 8px; }
  .plan-features li .check {
    width: 17px; height: 17px; min-width: 17px; border-radius: 50%;
    background: color-mix(in srgb, var(--plan-color) 12%, transparent);
    border: 1.5px solid color-mix(in srgb, var(--plan-color) 35%, transparent);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.58rem; color: var(--plan-color); font-weight: 700;
  }
  .select-indicator {
    margin-top: 1.25rem; height: 38px; border-radius: 10px; border: 1.5px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.82rem; font-weight: 700; font-family: 'Syne', sans-serif;
    color: #94a3b8; transition: all 0.28s ease; background: #f8fafc;
  }
  .plan-card.selected .select-indicator { background: var(--plan-color); border-color: var(--plan-color); color: #fff; }

  .skeleton-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.1rem; margin-bottom: 1.6rem; }
  @media (max-width: 700px) { .skeleton-grid { grid-template-columns: 1fr; } }
  .skeleton-card { background: #fff; border: 2px solid #e2e8f0; border-radius: 20px; padding: 1.6rem 1.4rem; height: 340px; }
  .skel {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite;
    border-radius: 8px; margin-bottom: 0.75rem;
  }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .plans-error {
    text-align: center; color: #ef4444;
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 12px; padding: 1rem 1.5rem; font-size: 0.875rem; margin-bottom: 1.5rem;
  }

  .form-wrapper { width: 100%; max-width: 430px; animation: fadeUp 0.45s ease both; position: relative; z-index: 1; }
  .form-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 24px; padding: 2rem; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .form-title { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 0.3rem; }
  .form-subtitle { color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem; }

  .selected-plan-chip {
    display: inline-flex; align-items: center; gap: 7px;
    background: #f8fafc; border: 1.5px solid #e2e8f0;
    border-radius: 20px; padding: 5px 14px 5px 9px;
    font-size: 0.78rem; color: #475569; margin-bottom: 1.5rem;
    cursor: pointer; transition: all 0.2s;
  }
  .selected-plan-chip:hover { border-color: #cbd5e1; color: #0f172a; }
  .chip-dot { width: 8px; height: 8px; border-radius: 50%; }

  .field-group { margin-bottom: 1rem; }
  .field-label {
    font-size: 0.73rem; font-weight: 700; color: #64748b;
    letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 0.4rem;
    display: block; font-family: 'Syne', sans-serif;
  }
  .field-input-wrap { position: relative; }
  .field-input {
    width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0;
    border-radius: 12px; padding: 0.75rem 1rem; color: #0f172a;
    font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
    outline: none; transition: all 0.2s ease;
  }
  .field-input::placeholder { color: #cbd5e1; }
  .field-input:focus { border-color: #0ea5e9; background: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
  .field-input.has-toggle { padding-right: 3rem; }
  .toggle-pass {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: #94a3b8; cursor: pointer;
    font-size: 0.9rem; transition: color 0.2s; padding: 4px;
  }
  .toggle-pass:hover { color: #475569; }

  .msg-alert { border-radius: 10px; padding: 0.75rem 1rem; font-size: 0.85rem; margin-bottom: 1.2rem; border: 1px solid; }
  .msg-alert.error { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

  .btn-back {
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: 1.5px solid #e2e8f0; border-radius: 10px;
    padding: 0.5rem 1rem; font-size: 0.82rem; font-family: 'Syne', sans-serif;
    font-weight: 600; color: #64748b; cursor: pointer; margin-bottom: 1.25rem; transition: all 0.2s;
  }
  .btn-back:hover { border-color: #cbd5e1; color: #0f172a; background: #f8fafc; }

  .btn-next {
    display: block; width: 100%; padding: 0.9rem; border-radius: 13px;
    border: none; cursor: pointer; font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 0.95rem;
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    color: #fff; box-shadow: 0 4px 16px rgba(14,165,233,0.3); transition: all 0.25s ease;
  }
  .btn-next:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
  .btn-next:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(14,165,233,0.4); }

  .btn-submit {
    width: 100%; padding: 0.9rem; border-radius: 13px; border: none; cursor: pointer;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.95rem;
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    color: #fff; box-shadow: 0 4px 16px rgba(14,165,233,0.3);
    transition: all 0.25s ease; margin-top: 1.5rem;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(14,165,233,0.4); }

  .spinner {
    width: 16px; height: 16px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .login-link { text-align: center; margin-top: 1.25rem; font-size: 0.82rem; color: #94a3b8; }
  .login-link a { color: #0ea5e9; text-decoration: none; font-weight: 600; }
  .login-link a:hover { text-decoration: underline; }

  /* ── Pantalla verificación ── */
  .ve-root {
    min-height: 100vh; display: flex; align-items: center;
    justify-content: center; background: #f0f2f5;
    font-family: 'DM Sans', sans-serif; padding: 2rem 1rem;
  }
  .ve-card {
    background: #fff; border-radius: 24px; padding: 2.8rem 2.4rem;
    max-width: 460px; width: 100%; text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.09); animation: fadeUp 0.4s ease both;
  }
  .ve-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: #f0fdf4; border: 2px solid #a7f3d0;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; margin: 0 auto 1.5rem;
  }
  .ve-title { font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 800; color: #1a1d23; margin-bottom: 0.6rem; }
  .ve-msg { color: #6b7280; font-size: 0.88rem; line-height: 1.7; margin-bottom: 1.4rem; }
  .ve-email-badge {
    display: inline-block; background: #f0f9ff; border: 1.5px solid #bae6fd;
    border-radius: 10px; padding: 8px 18px; color: #0369a1;
    font-weight: 600; font-size: 0.88rem; margin-bottom: 1.4rem;
  }
  .ve-divider { height: 1px; background: #e8eaed; margin: 1.4rem 0; }
  .ve-resend-label { color: #9ca3af; font-size: 0.78rem; margin-bottom: 0.75rem; }
  .ve-resend-btn {
    width: 100%; padding: 11px; background: #f8fafc; border: 1.5px solid #e8eaed;
    border-radius: 11px; color: #374151; font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
  }
  .ve-resend-btn:hover:not(:disabled) { border-color: #0ea5e9; color: #0ea5e9; background: #ecfeff; }
  .ve-resend-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ve-resend-msg { font-size: 0.78rem; color: #059669; margin-top: 0.7rem; }
  .ve-login-link { margin-top: 1.2rem; font-size: 0.8rem; color: #9ca3af; }
  .ve-login-link a { color: #0ea5e9; text-decoration: none; font-weight: 600; }
  .ve-login-link a:hover { text-decoration: underline; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep]                       = useState<1 | 2>(1);
  const [plans, setPlans]                     = useState<IPlanAPI[]>([]);
  const [plansLoading, setPlansLoading]       = useState(true);
  const [plansError, setPlansError]           = useState("");
  const [selectedPlan, setSelectedPlan]       = useState<IPlanAPI | null>(null);
  const [empresa, setEmpresa]                 = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [errorMsg, setErrorMsg]               = useState("");
  const [loading, setLoading]                 = useState(false);
  const [showPass, setShowPass]               = useState(false);

  // Estado pantalla verificación
  const [registered, setRegistered]           = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending]             = useState(false);
  const [resendMsg, setResendMsg]             = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/plans`);
        setPlans(data.data);
      } catch {
        setPlansError("No se pudieron cargar los planes. Intenta de nuevo.");
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleNext = () => {
    if (!selectedPlan) return;
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        empresa,
        plan: selectedPlan.type,
        planId: selectedPlan._id,
      });
      setRegisteredEmail(email);
      setRegistered(true);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Error al registrarse. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    try {
      const { data } = await axios.post(`${API_URL}/auth/resend-verification`, {
        email: registeredEmail,
      });
      setResendMsg(data.message);
    } catch {
      setResendMsg("Error al reenviar. Intenta de nuevo.");
    } finally {
      setResending(false);
    }
  };

  const formatPrice = (plan: IPlanAPI) =>
    plan.type === "trial" ? "Gratis" : `$${plan.price}`;

  // ── PANTALLA DE VERIFICACIÓN ─────────────────────────────
  if (registered) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="ve-root">
          <div style={{ width: "100%", maxWidth: "460px" }}>
            <div className="logo">Cheqify</div>
            <div className="logo-sub">Sistema de Gestión de Cheques</div>
            <div className="ve-card">
              <div className="ve-icon">✉️</div>
              <div className="ve-title">Revisa tu correo</div>
              <p className="ve-msg">Enviamos un enlace de verificación a:</p>
              <div className="ve-email-badge">{registeredEmail}</div>
              <p className="ve-msg">
                Haz clic en el enlace del correo para activar tu cuenta.<br />
                Revisa también tu carpeta de <strong>spam</strong> si no lo ves.
              </p>
              <div className="ve-divider" />
              <p className="ve-resend-label">¿No recibiste el correo?</p>
              <button
                className="ve-resend-btn"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Enviando..." : "📧 Reenviar correo de verificación"}
              </button>
              {resendMsg && <p className="ve-resend-msg">{resendMsg}</p>}
              <div className="ve-login-link">
                ¿Ya verificaste? <a href="/login">Iniciar sesión</a>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── REGISTRO NORMAL ──────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div className="reg-root">
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

          <div className="logo">Cheqify</div>
          <div className="logo-sub">Sistema de Gestión de Cheques</div>

          <div className="steps">
            <div className={`step-dot ${step === 1 ? "active" : "done"}`}>
              {step > 1 ? "✓" : "1"}
            </div>
            <div className={`step-line ${step > 1 ? "done" : ""}`} />
            <div className={`step-dot ${step === 2 ? "active" : ""}`}>2</div>
          </div>

          {/* ── STEP 1: PLANES ── */}
          {step === 1 && (
            <div className="plans-wrapper">
              <div className="plans-title">Elige tu plan</div>
              <div className="plans-subtitle">Comienza gratis o elige el plan que se adapte a tu empresa</div>

              {plansError && <div className="plans-error">⚠️ {plansError}</div>}

              {plansLoading && (
                <div className="skeleton-grid">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-card">
                      <div className="skel" style={{ width: 44, height: 44, borderRadius: 13 }} />
                      <div className="skel" style={{ width: "60%", height: 18 }} />
                      <div className="skel" style={{ width: "85%", height: 13 }} />
                      <div className="skel" style={{ width: "40%", height: 36, marginTop: 8 }} />
                      <div className="skel" style={{ width: "100%", height: 1, marginTop: 16 }} />
                      {[80, 90, 75, 85].map((w, j) => (
                        <div key={j} className="skel" style={{ width: `${w}%`, height: 12 }} />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {!plansLoading && !plansError && (
                <div className="plans-grid">
                  {plans.map((plan) => {
                    const meta = PLAN_META[plan.type];
                    const isSelected = selectedPlan?._id === plan._id;
                    return (
                      <div
                        key={plan._id}
                        className={`plan-card ${isSelected ? "selected" : ""}`}
                        style={{ "--plan-color": meta.color } as React.CSSProperties}
                        onClick={() => setSelectedPlan(plan)}
                      >
                        {meta.badge && <div className="plan-badge">{meta.badge}</div>}
                        <div className="plan-icon">{meta.icon}</div>
                        <div className="plan-name">{plan.name}</div>
                        <div className="plan-desc">{plan.description}</div>
                        <div className="plan-price-wrap">
                          <span className="plan-price">{formatPrice(plan)}</span>
                          <span className="plan-period">{meta.period}</span>
                        </div>
                        {plan.type === "trial" && plan.trialDays > 0 && (
                          <div className="trial-tag">✦ {plan.trialDays} días de prueba gratuita</div>
                        )}
                        <div className="plan-divider" />
                        <ul className="plan-features">
                          {plan.features.map((f, i) => (
                            <li key={i}>
                              <span className="check">✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className="select-indicator">
                          {isSelected ? "✓ Seleccionado" : "Seleccionar"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                className="btn-next"
                onClick={handleNext}
                disabled={!selectedPlan || plansLoading}
              >
                Continuar con el registro →
              </button>

              <div className="login-link">
                ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
              </div>
            </div>
          )}

          {/* ── STEP 2: FORMULARIO ── */}
          {step === 2 && selectedPlan && (
            <div className="form-wrapper">
              <button className="btn-back" onClick={handleBack}>← Volver</button>

              <div className="form-card">
                <div className="form-title">Crea tu cuenta</div>
                <div className="form-subtitle">Completa tus datos para empezar</div>

                <div
                  className="selected-plan-chip"
                  onClick={handleBack}
                  title="Cambiar plan"
                >
                  <span className="chip-dot" style={{ background: PLAN_META[selectedPlan.type].color }} />
                  Plan {selectedPlan.name}
                  {selectedPlan.type !== "trial" && (
                    <span style={{ color: PLAN_META[selectedPlan.type].color, fontWeight: 700 }}>
                      &nbsp;${selectedPlan.price}{PLAN_META[selectedPlan.type].period}
                    </span>
                  )}
                  <span style={{ marginLeft: 4, opacity: 0.4, fontSize: "0.7rem" }}>✎ cambiar</span>
                </div>

                {errorMsg && (
                  <div className="msg-alert error">{errorMsg}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="field-group">
                    <label className="field-label">Nombre de la empresa</label>
                    <div className="field-input-wrap">
                      <input
                        className="field-input"
                        type="text"
                        placeholder="Ej: Grupo Fénix SRL"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Correo electrónico</label>
                    <div className="field-input-wrap">
                      <input
                        className="field-input"
                        type="email"
                        placeholder="correo@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Contraseña</label>
                    <div className="field-input-wrap">
                      <input
                        className={`field-input has-toggle`}
                        type={showPass ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="toggle-pass"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading && <span className="spinner" />}
                    {loading ? "Creando cuenta..." : "Crear cuenta"}
                  </button>
                </form>
              </div>

              <div className="login-link">
                ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Register;