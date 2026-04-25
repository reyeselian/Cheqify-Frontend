// src/hooks/useIsElectron.ts
// Detecta si la app está corriendo dentro de Electron
export const useIsElectron = (): boolean => {
  return navigator.userAgent.toLowerCase().includes("electron");
};