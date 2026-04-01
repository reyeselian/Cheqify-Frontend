// src/context/AdminContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface AdminUser {
  _id: string;
  email: string;
  empresa: string;
  role: "admin";
  token: string;
}

interface AdminContextType {
  admin: AdminUser | null;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
  isAdminLoading: boolean;
}

const AdminContext = createContext<AdminContextType>({} as AdminContextType);
export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin]               = useState<AdminUser | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    if (stored) {
      const parsed: AdminUser = JSON.parse(stored);
      setAdmin(parsed);
      axios.defaults.headers.common["x-admin-token"] = parsed.token;
    }
    setIsAdminLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string) => {
    const { data } = await axios.post(`${API_URL}/admin/login`, { email, password });
    const adminData: AdminUser = data;
    localStorage.setItem("adminUser", JSON.stringify(adminData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${adminData.token}`;
    setAdmin(adminData);
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem("adminUser");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AdminContext.Provider value={{ admin, adminLogin, adminLogout, isAdminLoading }}>
      {children}
    </AdminContext.Provider>
  );
};

export {};