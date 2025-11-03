import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Simula una pequeña espera mientras AuthContext carga desde localStorage
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 150); // 🔹 150ms es suficiente para evitar redirecciones falsas
    return () => clearTimeout(timer);
  }, []);

  if (checkingAuth) {
    // Mientras se verifica el usuario, evita mostrar nada (o muestra un loader si prefieres)
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
