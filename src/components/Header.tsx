import { useEffect, useState } from "react";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Dropdown,
  Modal,
  Form,
  Image,
} from "react-bootstrap";
import { useUser } from "../context/UserContext";
import { FaUserCircle, FaSignOutAlt, FaBuilding } from "react-icons/fa";

export default function Header() {
  const { user, login, register, logout } = useUser();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hidden, setHidden] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nombre: "",
    empresa: "",
    email: "",
    password: "",
  });

  // 🔹 Ocultar el Navbar al hacer scroll hacia abajo
  useEffect(() => {
    const handleScroll = () => {
      setHidden(window.scrollY > scrollY && window.scrollY > 80);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(loginForm.email, loginForm.password);
    setShowLogin(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(
      registerForm.nombre,
      registerForm.empresa,
      registerForm.email,
      registerForm.password
    );
    setShowRegister(false);
  };

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        className="px-3 py-2 shadow-sm"
        style={{
          background: "linear-gradient(135deg, #121212, #1f1f1f, #0d0d0d)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          transition: "transform 0.4s ease, opacity 0.4s ease",
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
          opacity: hidden ? 0 : 1,
          zIndex: 1000,
        }}
      >
        <Container className="d-flex justify-content-between align-items-center">
          {/* 🔹 LOGO */}
          <div className="d-flex align-items-center gap-2">
            <Image
              src="https://res.cloudinary.com/dwzfntvql/image/upload/v1761753042/Logo_Cheqify_sin_fondo_bskm6l.png"
              alt="Cheqify Logo"
              style={{
                height: "55px",
                width: "auto",
                filter:
                  "drop-shadow(0 0 12px rgba(255,255,255,0.3)) brightness(1.1)",
                animation: "fadeInSlide 1.2s ease forwards",
              }}
            />
          </div>

          {/* 🔹 Menú central */}
          <Nav className="mx-auto gap-4">
            <Nav.Link
              href="/cheques"
              className="text-light fw-semibold nav-premium"
            >
              Cheques
            </Nav.Link>
            <Nav.Link
              href="/reportes"
              className="text-light fw-semibold nav-premium"
            >
              Reportes
            </Nav.Link>
            <Nav.Link
              href="/configuracion"
              className="text-light fw-semibold nav-premium"
            >
              Configuración
            </Nav.Link>
          </Nav>

          {/* 🔹 Sesión (Derecha) */}
          <div className="d-flex align-items-center gap-3">
            {!user ? (
              <>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="px-3 premium-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="px-3 premium-btn-dark"
                  onClick={() => setShowRegister(true)}
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
                    {user.nombre}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="text-danger">
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
          @keyframes fadeInSlide {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .nav-premium:hover {
            text-shadow: 0 0 8px rgba(255,255,255,0.7);
            transform: scale(1.05);
            transition: all 0.3s ease;
          }

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

      {/* 🔐 Modal Login */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Iniciar Sesión</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleLogin}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowLogin(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="dark">
              Ingresar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 🏢 Modal Registro */}
      <Modal show={showRegister} onHide={() => setShowRegister(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Registrarse</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRegister}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                value={registerForm.nombre}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    nombre: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la empresa</Form.Label>
              <Form.Control
                value={registerForm.empresa}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    empresa: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    email: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    password: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRegister(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="dark">
              Crear cuenta
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
