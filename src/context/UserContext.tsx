import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";


interface User {
  nombre: string;
  empresa: string;
  email: string;
  password?: string;
  role?: string; // 👈 agregado para roles futuros
  customPriceNote?: string | null;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    nombre: string,
    empresa: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  fetchUser: () => void;
  isAdmin: boolean; // 👈 agregado correctamente
}

const UserContext = createContext<UserContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  fetchUser: () => {},
  isAdmin: false,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    fetchUser();
  }, []);

  // 🔹 Cargar usuario guardado
  const fetchUser = () => {
    const stored = localStorage.getItem("cheqifyUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      // 👇 Detecta si el correo pertenece a un admin
      setIsAdmin(parsed.email === "admin@cheqify.com");
    }
  };

  // 🔹 Login
  const login = async (email: string, password: string) => {
    const stored = localStorage.getItem("cheqifyUsers");
    const users = stored ? JSON.parse(stored) : [];

    const found = users.find(
      (u: any) => u.email === email && u.password === password
    );
    if (!found) throw new Error("Credenciales inválidas");

    localStorage.setItem("cheqifyUser", JSON.stringify(found));
    setUser(found);
    setIsAdmin(found.email === "admin@cheqify.com");
  };

  // 🔹 Registro
  const register = async (
    nombre: string,
    empresa: string,
    email: string,
    password: string
  ) => {
    const stored = localStorage.getItem("cheqifyUsers");
    const users = stored ? JSON.parse(stored) : [];

    const exists = users.find((u: any) => u.email === email);
    if (exists) throw new Error("El correo ya está registrado");

    const newUser = {
      nombre,
      empresa,
      email,
      password,
      role: email === "admin@cheqify.com" ? "admin" : "user",
    };

    users.push(newUser);
    localStorage.setItem("cheqifyUsers", JSON.stringify(users));
    localStorage.setItem("cheqifyUser", JSON.stringify(newUser));
    setUser(newUser);
    setIsAdmin(newUser.role === "admin");
  };

  // 🔹 Cerrar sesión
  const logout = () => {
    localStorage.removeItem("cheqifyUser");
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <UserContext.Provider
      value={{ user, login, register, logout, fetchUser, isAdmin }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
