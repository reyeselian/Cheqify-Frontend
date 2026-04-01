import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── User app ─────────────────────────────────────────────────
import Header       from "./components/Header";
import Home         from "./pages/Home";
import Reportes     from "./pages/Reportes";
import Cheques      from "./pages/Cheques";
import Configuracion from "./pages/Configuracion";
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Welcome      from "./pages/Welcome";
import MiCuenta     from "./pages/MiCuenta";
import Planes       from "./pages/Planes";
import { AuthProvider }   from "./context/AuthContext";
import { ConfigProvider } from "./context/ConfigContext";
import PrivateRoute from "./routes/PrivateRoute";
import VerifyEmail from "./pages/Verifyemail";

// ── Admin app ─────────────────────────────────────────────────
import AdminLogin     from "./pages/admin/Adminlogin";
import AdminLayout    from "./pages/admin/Adminlayout";
import AdminDashboard from "./pages/admin/Admindashboard";
import AdminUsuarios  from "./pages/admin/AdminUsuarios";
import AdminPlanes    from "./pages/admin/AdminPlanes";
import { AdminProvider } from "./context/AdminContext";
import AdminRoute       from "./routes/Adminroute";

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <ConfigProvider>
          <Router>
            <Routes>

              {/* ═══════════════════════════════════════════════
                  ADMIN — rutas completamente separadas
                  No usan Header ni Container del user-app
              ═══════════════════════════════════════════════ */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                {/* Redirect /admin → /admin/dashboard */}
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="usuarios"  element={<AdminUsuarios />} />
                <Route path="planes"    element={<AdminPlanes />} />
                
              </Route>

              {/* ═══════════════════════════════════════════════
                  USER APP — con Header y Container
              ═══════════════════════════════════════════════ */}
              <Route
                path="/*"
                element={
                  <>
                    <Header />
                    <Container className="mt-5 pt-4">
                      <Routes>
                        <Route path="/"         element={<Welcome />} />
                        <Route path="/login"    element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/planes"   element={<Planes />} />

                        <Route path="/mi-cuenta" element={<PrivateRoute><MiCuenta /></PrivateRoute>} />
                        <Route path="/home"         element={<PrivateRoute><Home /></PrivateRoute>} />
                        <Route path="/cheques"      element={<PrivateRoute><Cheques /></PrivateRoute>} />
                        <Route path="/reportes"     element={<PrivateRoute><Reportes /></PrivateRoute>} />
                        <Route path="/configuracion" element={<PrivateRoute><Configuracion /></PrivateRoute>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Container>
                  </>
                }
              />
            </Routes>

            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
          </Router>
        </ConfigProvider>
      </AdminProvider>
    </AuthProvider>
  );
}