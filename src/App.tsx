import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Reportes from "./pages/Reportes";
import { Container } from "react-bootstrap";
import Header from "./components/Header";
import Cheques from "./pages/Cheques";
import Configuracion from "./pages/Configuracion";
import { UserProvider } from "./context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <UserProvider>
      <Router>
        {/* 🔹 Navbar global */}
        <Header />

        {/* 🔹 Contenedor principal de vistas */}
        <Container className="mt-5 pt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cheques" element={<Cheques />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/configuracion" element={<Configuracion />} />

          </Routes>
        </Container>

        {/* 🔹 Notificaciones globales */}
        <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      </Router>
    </UserProvider>
  );
}
