import React, { createContext, useContext, useState, useEffect } from "react";

export interface ConfiguracionData {
  tema: string;
  colorPrincipal: string;
  moneda: string;
  fechaFormato: string;
  columnas: Record<string, boolean>;
  filasPorPagina: number;
  pin: string;
  dobleConfirmacion: boolean;
  alertasActivas: boolean;
  diasAviso: number;
  mostrarLogo: boolean;
  incluirFirmas: boolean;
  idioma: string;
  notificaciones: boolean;
  animaciones: boolean;
  atajos: boolean;
}

interface ConfigContextType {
  config: ConfiguracionData;
  updateConfig: (updates: Partial<ConfiguracionData>) => void;
  resetConfig: () => void;
  applyConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const defaultConfig: ConfiguracionData = {
  tema: "oscuro",
  colorPrincipal: "#2b2b2b",
  moneda: "DOP",
  fechaFormato: "DD/MM/YYYY",
  columnas: {
    firmadoPor: true,
    notas: true,
    fechaCheque: true,
    fechaDeposito: true,
  },
  filasPorPagina: 10,
  pin: "1234",
  dobleConfirmacion: false,
  alertasActivas: true,
  diasAviso: 3,
  mostrarLogo: true,
  incluirFirmas: false,
  idioma: "es",
  notificaciones: true,
  animaciones: true,
  atajos: true,
};

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ConfiguracionData>(defaultConfig);

  // ✅ Cargar configuración desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("cheqify_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...defaultConfig, ...parsed });
      } catch (err) {
        console.error("Error al leer configuración:", err);
      }
    }
  }, []);

  // ✅ Guardar configuración automáticamente cuando cambie
  useEffect(() => {
    localStorage.setItem("cheqify_config", JSON.stringify(config));
  }, [config]);

  // ✅ Aplicar tema visual y color
  const applyConfig = () => {
    document.body.classList.remove("tema-oscuro", "tema-claro", "tema-metalico");
    document.body.classList.add(`tema-${config.tema}`);
    document.documentElement.style.setProperty("--color-principal", config.colorPrincipal);
  };

  // Aplicar al cargar o cambiar tema/color
  useEffect(() => {
    applyConfig();
  }, [config.tema, config.colorPrincipal]);

  const updateConfig = (updates: Partial<ConfiguracionData>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem("cheqify_config");
    applyConfig();
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig, applyConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error("useConfig debe usarse dentro de un ConfigProvider");
  return context;
};
