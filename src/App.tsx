import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import Reportes from "./pages/Reportes";
import Cheques from "./pages/Cheques";
import Configuracion from "./pages/Configuracion";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import {ConfigProvider} from "./context/ConfigContext";
import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <Router>
          {/* 🔹 Navbar global */}
          <Header />

          {/* 🔹 Contenedor principal */}
          <Container className="mt-5 pt-4">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rutas protegidas */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cheques"
                element={
                  <PrivateRoute>
                    <Cheques />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reportes"
                element={
                  <PrivateRoute>
                    <Reportes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/configuracion"
                element={
                  <PrivateRoute>
                    <Configuracion />
                  </PrivateRoute>
                }
              />

              {/* Redirección si no coincide ninguna ruta */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>

          {/* 🔹 Notificaciones globales */}
          <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
}
