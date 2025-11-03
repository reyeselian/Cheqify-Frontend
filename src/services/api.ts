import axios from "axios";

// =========================================================
// 🌐 CONFIGURACIÓN GLOBAL DEL BACKEND
// =========================================================
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// 🔹 Crear instancia de Axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Interceptor para agregar automáticamente el token JWT
api.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const token = JSON.parse(user).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Error leyendo token del localStorage:", err);
    }
  }
  return config;
});

// =========================================================
// 🧾 CHEQUES ACTIVOS
// =========================================================

// Obtener todos los cheques activos (solo los del usuario autenticado)
export const getCheques = async () => {
  const res = await api.get("/cheques");
  return res.data;
};

// Crear nuevo cheque
export const createCheque = async (data: any) => {
  const res = await api.post("/cheques", data);
  return res.data;
};

// Obtener cheque por ID
export const getChequeById = async (id: string) => {
  const res = await api.get(`/cheques/${id}`);
  return res.data;
};

// Actualizar cheque
export const updateCheque = async (id: string, data: any) => {
  const res = await api.put(`/cheques/${id}`, data);
  return res.data;
};

// Mover cheque a “Eliminados”
export const deleteCheque = async (id: string) => {
  const res = await api.delete(`/cheques/${id}`);
  return res.data;
};

// =========================================================
// 🗑️ CHEQUES ELIMINADOS
// =========================================================

// Listar todos los cheques eliminados
export const getDeletedCheques = async () => {
  const res = await api.get("/cheques/deleted/all");
  return res.data;
};

// Restaurar cheque eliminado
export const restoreDeletedCheque = async (id: string) => {
  const res = await api.put(`/cheques/restore/${id}`);
  return res.data;
};

// Eliminar cheque permanentemente
export const deletePermanently = async (id: string) => {
  const res = await api.delete(`/cheques/permanent/${id}`);
  return res.data;
};
