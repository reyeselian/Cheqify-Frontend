import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsElectron } from "../hooks/useIsElectron";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const isElectron = useIsElectron();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      setMessage("✅ Bienvenido a Cheqify");
      navigate("/home");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-light"
      style={{
        height: "100vh",
        overflow: "hidden",
        marginTop: isElectron ? "0" : "-70px",
      }}
    >
      <Card
        className="p-4 shadow-lg text-center"
        style={{ maxWidth: "400px", width: "100%", borderRadius: "1rem" }}
      >
        {/* 🌟 Logo metálico animado */}
        <h1
          className="cheqify-logo-text mb-3"
          style={{ fontWeight: 800, fontSize: "2.8rem", letterSpacing: "0.5px" }}
        >
          Cheqify
        </h1>

        <h4 className="text-center mb-4 fw-bold text-dark">Iniciar Sesión</h4>

        {message && <Alert variant="info">{message}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="correo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {/* ── Olvidaste tu contraseña ── */}
          <div className="text-end mb-3">
            <a
              href="/forgot-password"
              className="text-decoration-none"
              style={{ fontSize: "0.82rem", color: "#c58b2a", fontWeight: 600 }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button type="submit" className="w-100 btn btn-dark">
            Entrar
          </Button>
        </Form>

        {/* ✅ En Electron no mostrar link de registro */}
        {!isElectron && (
          <p className="text-center mt-3 mb-0">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-decoration-none fw-bold">
              Regístrate
            </a>
          </p>
        )}
      </Card>

      <style>{`
        .cheqify-logo-text {
          background: linear-gradient(90deg, #c58b2a, #27b6b1, #9b9b9b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 10px rgba(0,0,0,0.4);
          animation: metallicShine 3s linear infinite;
          background-size: 300%;
          position: relative;
        }
        .cheqify-logo-text:hover { transform: scale(1.05); }
        .cheqify-logo-text::after {
          content: ""; position: absolute; top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg); transition: left 0.6s ease;
        }
        .cheqify-logo-text:hover::after { left: 120%; }
        @keyframes metallicShine {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

      `}</style>
    </div>
  );
};

export default Login;