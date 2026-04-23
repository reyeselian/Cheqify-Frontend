import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import axios from "axios";
import { api } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* =========================================================
   Tipos
========================================================= */
export type PlanType     = "trial" | "monthly" | "annual";
export type AccountStatus = "trial" | "trial_expired" | "active" | "payment_required" | "blocked";

export interface User {
  _id: string;
  email: string;
  empresa: string;
  token: string;
  plan: PlanType;
  planRef?: string;
  status: AccountStatus;
  trialDays: number;
  registeredAt: string;
  planExpiresAt: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, empresa: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

/* =========================================================
   Intervalo de verificación: cada 30 segundos
========================================================= */
const STATUS_CHECK_INTERVAL = 30_000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Restaurar sesión desde localStorage ───────────────── */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed: User = JSON.parse(storedUser);
      setUser(parsed);
      axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
    }
  }, []);

  /* ── Verificación periódica de status ──────────────────── */
  useEffect(() => {
    if (!user) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const checkStatus = async () => {
      try {
        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        // Ya no cerramos sesión al bloquear — solo actualizamos el status

        // Actualizar todos los campos que el admin puede cambiar
        updateUser({
          status:          data.status,
          plan:            data.plan,
          trialDays:       data.trialDays,
          planExpiresAt:   data.planExpiresAt,
          registeredAt:    data.registeredAt,
          customPriceNote: data.customPriceNote ?? null,
        } as any);

      } catch {
        // Si el token expiró o hay error 401, cerrar sesión
      }
    };

    // Verificar inmediatamente y luego cada 30 segundos
    checkStatus();
    intervalRef.current = setInterval(checkStatus, STATUS_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user?.token]);

  /* ── Login ──────────────────────────────────────────────── */
  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const userData: User = res.data;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    setUser(userData);
  };

  /* ── Register ───────────────────────────────────────────── */
  const register = async (email: string, password: string, empresa: string) => {
    const { data } = await axios.post(`${API_URL}/auth/register`, { email, password, empresa });
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  };

  /* ── Logout ─────────────────────────────────────────────── */
  const logout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  /* ── Update user ────────────────────────────────────────── */
  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};