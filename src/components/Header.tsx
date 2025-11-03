import { useEffect, useState } from "react";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Dropdown,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useConfig } from "../context/ConfigContext";
import { FaUserCircle, FaSignOutAlt, FaBuilding } from "react-icons/fa";

export default function Header() {
  const { user, logout } = useAuth();
  const { config } = useConfig();
  const navigate = useNavigate();

  const [scrollY, setScrollY] = useState(0);
  const [hidden, setHidden] = useState(false);

  // 🔹 Ocultar el Navbar al hacer scroll hacia abajo
  useEffect(() => {
    const handleScroll = () => {
      setHidden(window.scrollY > scrollY && window.scrollY > 80);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY]);

  // 🎨 Cambiar colores según tema configurado
  const getBackground = () => {
    switch (config.tema) {
      case "claro":
        return "linear-gradient(135deg, #fff, #e0e0e0)";
      case "metalico":
        return `linear-gradient(135deg, ${config.colorPrincipal}, #888)`;
      default:
        return `linear-gradient(135deg, ${config.colorPrincipal}, #111)`;
    }
  };

  const textColor = config.tema === "claro" ? "#111" : "#fff";

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        className="px-3 py-2 shadow-sm"
        style={{
          background: getBackground(),
          borderBottom: `2px solid ${config.colorPrincipal}`,
          transition: "transform 0.4s ease, opacity 0.4s ease",
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          opacity: hidden ? 0 : 1,
          zIndex: 1000,
        }}
      >
        <Container className="d-flex justify-content-between align-items-center">
          {/* 🌟 LOGO EN TEXTO METÁLICO */}
          <div
            className="cheqify-logo-text"
            onClick={() => navigate("/")}
            style={{
              fontSize: "2.7rem",
              fontWeight: 800,
              letterSpacing: "0.5px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Cheqify
          </div>

          {/* 🔹 Menú central */}
          <Nav className="mx-auto gap-4">
            <Nav.Link
              href="/"
              className="fw-semibold nav-premium"
              style={{ color: textColor }}
            >
              Inicio
            </Nav.Link>
            <Nav.Link
              href="/cheques"
              className="fw-semibold nav-premium"
              style={{ color: textColor }}
            >
              Cheques
            </Nav.Link>
            <Nav.Link
              href="/reportes"
              className="fw-semibold nav-premium"
              style={{ color: textColor }}
            >
              Reportes
            </Nav.Link>
            {/* <Nav.Link
              href="/configuracion"
              className="fw-semibold nav-premium"
              style={{ color: textColor }}
            >
              Configuración
            </Nav.Link> */}
          </Nav>

          {/* 🔹 Sección derecha (usuario o login) */}
          <div className="d-flex align-items-center gap-3">
            {!user ? (
              <>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="px-3 premium-btn"
                  onClick={() => navigate("/login")}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="px-3 premium-btn-dark"
                  onClick={() => navigate("/register")}
                >
                  Registrarse
                </Button>
              </>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="dark"
                  id="dropdown-user"
                  className="d-flex align-items-center gap-2 premium-btn"
                >
                  <FaUserCircle />
                  {user.empresa}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item disabled>
                    <FaBuilding className="me-2" />
                    {user.email}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="text-danger fw-semibold"
                  >
                    <FaSignOutAlt className="me-2" />
                    Cerrar sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </Container>
      </Navbar>

      {/* 🌈 Estilos Premium */}
      <style>
        {`
          /* ✨ Texto metálico animado */
          .cheqify-logo-text {
            background: linear-gradient(90deg, #c58b2a, #27b6b1, #9b9b9b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
            animation: metallicShine 3s linear infinite;
            background-size: 300%;
            transition: transform 0.4s ease, text-shadow 0.4s ease;
            position: relative;
          }

          .cheqify-logo-text:hover {
            transform: scale(1.08);
            text-shadow: 0 0 14px rgba(255,255,255,0.7);
          }

          /* 🌟 Efecto de flash al pasar el mouse */
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

          /* Menú premium */
          .nav-premium {
            transition: all 0.3s ease;
          }

          .nav-premium:hover {
            text-shadow: 0 0 8px rgba(255,255,255,0.7);
            transform: scale(1.05);
          }

          /* Botones premium */
          .premium-btn {
            background: linear-gradient(145deg, #444, #222);
            border: 1px solid #555;
            color: #fff;
            transition: all 0.3s ease;
          }

          .premium-btn:hover {
            background: linear-gradient(145deg, #666, #333);
            box-shadow: 0 0 8px rgba(255,255,255,0.3);
          }

          .premium-btn-dark {
            background: linear-gradient(145deg, #eee, #ccc);
            border: none;
            color: #111;
            font-weight: 600;
          }

          .premium-btn-dark:hover {
            background: linear-gradient(145deg, #fff, #ddd);
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
          }
        `}
      </style>
    </>
  );
}
