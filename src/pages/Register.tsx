import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, { email, password, empresa });
      setMessage("✅ Registro exitoso. Ahora puedes iniciar sesión.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error al registrarse");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <Card
        className="p-4 shadow-lg text-center"
        style={{ maxWidth: "400px", width: "100%", borderRadius: "1rem" }}
      >
        {/* 🌟 Logo metálico animado */}
        <h1
          className="cheqify-logo-text mb-3"
          style={{
            fontWeight: 800,
            fontSize: "2.8rem",
            letterSpacing: "0.5px",
          }}
        >
          Cheqify
        </h1>

        <h4 className="text-center mb-4 fw-bold text-dark">Registro</h4>

        {message && <Alert variant="info">{message}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la empresa</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Grupo Fénix SRL"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              required
            />
          </Form.Group>

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

          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" className="w-100 btn btn-primary">
            Registrar
          </Button>
        </Form>

        <p className="text-center mt-3">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-decoration-none fw-bold">
            Inicia sesión
          </a>
        </p>
      </Card>

      {/* ✨ Estilo metálico del logo */}
      <style>
        {`
          .cheqify-logo-text {
            background: linear-gradient(90deg, #c58b2a, #27b6b1, #9b9b9b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 2px 10px rgba(0,0,0,0.4);
            animation: metallicShine 3s linear infinite;
            background-size: 300%;
            position: relative;
          }

          .cheqify-logo-text:hover {
            transform: scale(1.05);
            text-shadow: 0 0 12px rgba(255,255,255,0.7);
          }

          .cheqify-logo-text::after {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(
              120deg,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.4) 50%,
              rgba(255,255,255,0) 100%
            );
            transform: skewX(-20deg);
            transition: left 0.6s ease;
          }

          .cheqify-logo-text:hover::after {
            left: 120%;
          }

          @keyframes metallicShine {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
};

export default Register;
