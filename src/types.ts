// frontend/src/types.ts

export interface User {
  _id?: string;
  nombre: string;
  email: string;
  password?: string;
  rol?: string; // "admin" o "empleado"
  avatar?: string;
  createdAt?: Date;
}
