import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";
import { api } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface User {
  _id: string;
  email: string;
  empresa: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, empresa: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
    }
  }, []);

  const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  const userData = res.data;

  // ✅ Guardar en localStorage
  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.setItem("token", userData.token);

  setUser(userData);
};

  const register = async (email: string, password: string, empresa: string) => {
    const { data } = await axios.post(`${API_URL}/auth/register`, { email, password, empresa });
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
