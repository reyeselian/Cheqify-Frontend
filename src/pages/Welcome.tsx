import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useIsElectron } from "../hooks/useIsElectron";

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isElectron = useIsElectron();

  useEffect(() => {
    if (user) navigate("/home");
    // ✅ En Electron redirigir directo al login sin mostrar bienvenida
    if (isElectron && !user) navigate("/login");
  }, [user, navigate, isElectron]);

  // En Electron no mostrar nada — redirige inmediatamente
  if (isElectron) return null;

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "12vh",
        color: "#111",
        overflow: "hidden", // ✅ sin scroll
      }}
    >
      <div
        style={{
          backgroundColor: "#f4f4f4",
          borderRadius: "16px",
          boxShadow: "0 4px 25px rgba(0,0,0,0.1)",
          padding: "60px 80px",
          textAlign: "center",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <h1 style={{ fontWeight: 800, fontSize: "3rem", marginBottom: "1.5rem", color: "#1a1a1a", letterSpacing: "1px" }}>
          Cheqify
        </h1>
        <p style={{ color: "#444", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: "1.6" }}>
          Bienvenido a <strong>Cheqify</strong>, tu sistema digital para el control y organización de cheques.
        </p>
        <Button
          size="lg"
          style={{ borderRadius: "10px", padding: "12px 40px", background: "linear-gradient(135deg, #222, #444)", border: "none", fontWeight: "600", color: "#fff", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}
          onClick={() => navigate("/login")}
        >
          Comenzar
        </Button>
      </div>
    </div>
  );
}