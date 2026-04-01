/**
 * TrialGuard
 * ----------
 * Envuelve el botón "Añadir Cheque" (y cualquier acción que cree cheques).
 * Si el trial expiró:
 *   - Oculta/deshabilita el elemento hijo
 *   - Muestra un banner compacto invitando a mejorar el plan
 *
 * Uso en Home.tsx:
 *   <TrialGuard>
 *     <Button onClick={...}>Añadir Cheque</Button>
 *   </TrialGuard>
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaLock, FaRocket } from "react-icons/fa";

interface TrialGuardProps {
  children: React.ReactNode;
  /** Si true, renderiza los children deshabilitados en vez de ocultarlos */
  showDisabled?: boolean;
}

export default function TrialGuard({ children, showDisabled = false }: TrialGuardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isExpired = user
    ? ["trial_expired", "payment_required", "blocked"].includes(user.status)
    : false;

  if (!isExpired) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Disabled / hidden children */}
      {showDisabled && (
        <div style={{ opacity: 0.35, pointerEvents: "none", userSelect: "none", cursor: "not-allowed" }}>
          {children}
        </div>
      )}

      {/* Compact locked banner */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "12px",
        background: "linear-gradient(135deg, rgba(197,139,42,0.08), rgba(197,139,42,0.04))",
        border: "1px solid rgba(197,139,42,0.25)",
        borderRadius: "12px",
        padding: "10px 18px",
        maxWidth: "fit-content",
      }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
          background: "rgba(197,139,42,0.1)", border: "1px solid rgba(197,139,42,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#c58b2a", fontSize: "0.85rem",
        }}>
          <FaLock />
        </div>

        <div style={{ lineHeight: 1.3 }}>
          <p style={{ margin: 0, color: "#c58b2a", fontWeight: 700, fontSize: "0.85rem" }}>
            Prueba vencida
          </p>
          <p style={{ margin: 0, color: "#666", fontSize: "0.75rem" }}>
            Actualiza tu plan para añadir nuevos cheques
          </p>
        </div>

        <button
          onClick={() => navigate("/planes")}
          style={{
            background: "linear-gradient(135deg, #c58b2a, #e8c47a)",
            border: "none", borderRadius: "8px",
            color: "#111", fontWeight: 700, fontSize: "0.78rem",
            padding: "7px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            whiteSpace: "nowrap",
            boxShadow: "0 3px 12px rgba(197,139,42,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(197,139,42,0.45)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(197,139,42,0.3)"; }}
        >
          <FaRocket size={11} /> Ver Planes
        </button>
      </div>
    </div>
  );
}