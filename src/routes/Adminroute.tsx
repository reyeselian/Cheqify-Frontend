// src/routes/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { admin, isAdminLoading } = useAdmin();
  if (isAdminLoading) return null;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}