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
import { FaUserCircle, FaSignOutAlt, FaBuilding, FaBars } from "react-icons/fa";

export default function Header() {
  const { user, logout } = useAuth();
  const { config } = useConfig();
  const navigate = useNavigate();

  const [scrollY, setScrollY] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [expanded, setExpanded] = useState(false); // 🔹 Control del menú móvil

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
        expanded={expanded}
        fixed="top"
        onToggle={(val) => setExpanded(val)}
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
        <Container>
          {/* 🌟 LOGO */}
          <div
            className="cheqify-logo-text"
            onClick={() => navigate("/")}
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              letterSpacing: "0.5px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Cheqify
          </div>

          {/* 🔹 Botón hamburguesa en móvil */}
          <Button
            variant="link"
            className="d-lg-none text-white fs-3 border-0"
            onClick={() => setExpanded(!expanded)}
            aria-label="Toggle menu"
          >
            <FaBars />
          </Button>

          {/* 🔹 Menú colapsable */}
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-center text-center"
          >
            <Nav className="mx-auto gap-3">
              <Nav.Link
                href="/"
                style={{ color: textColor }}
                className="fw-semibold nav-premium"
              >
                Inicio
              </Nav.Link>
              <Nav.Link
                href="/cheques"
                style={{ color: textColor }}
                className="fw-semibold nav-premium"
              >
                Cheques
              </Nav.Link>
              <Nav.Link
                href="/reportes"
                style={{ color: textColor }}
                className="fw-semibold nav-premium"
              >
                Reportes
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>

          {/* 🔹 Usuario / Login */}
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
                  <span className="d-none d-sm-inline">{user.empresa}</span>
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

      {/* 🔹 Espaciador dinámico (desplaza el contenido cuando el menú está abierto) */}
      <div
        style={{
          height: expanded ? "260px" : "70px",
          transition: "height 0.35s ease",
        }}
      ></div>

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

          /* Menú móvil */
          @media (max-width: 992px) {
            .navbar-collapse {
              background: rgba(0,0,0,0.85);
              border-radius: 10px;
              padding: 1rem;
              margin-top: 0.5rem;
              animation: slideDown 0.35s ease;
            }

            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }

            .nav-premium {
              display: block;
              padding: 0.5rem 0;
              color: #fff !important;
            }
          }
        `}
      </style>
    </>
  );
}
