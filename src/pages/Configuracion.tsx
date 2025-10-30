import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import {
  FaPalette,
  FaMoneyBill,
  FaTable,
  FaLock,
  FaBell,
  FaFileAlt,
  FaCogs,
} from "react-icons/fa";
import { toast } from "react-toastify";

// 🧩 Tipo para la configuración guardada
interface ConfiguracionData {
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

export default function Configuracion() {
  // 🧩 Cargar configuración previa (si existe)
  const cargarConfig = (): ConfiguracionData | null => {
    try {
      const saved = localStorage.getItem("cheqify_config");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedConfig = cargarConfig();

  // 🎨 Tema visual
  const [tema, setTema] = useState<string>(savedConfig?.tema || "oscuro");
  const [colorPrincipal, setColorPrincipal] = useState<string>(
    savedConfig?.colorPrincipal || "#2b2b2b"
  );

  // 💰 Moneda y fecha
  const [moneda, setMoneda] = useState<string>(savedConfig?.moneda || "DOP");
  const [fechaFormato, setFechaFormato] = useState<string>(
    savedConfig?.fechaFormato || "DD/MM/YYYY"
  );

  // 🧾 Tabla
  const [columnas, setColumnas] = useState<Record<string, boolean>>(
    savedConfig?.columnas || {
      firmadoPor: true,
      notas: true,
      fechaCheque: true,
      fechaDeposito: true,
    }
  );
  const [filasPorPagina, setFilasPorPagina] = useState<number>(
    savedConfig?.filasPorPagina || 10
  );

  // 🔐 Seguridad
  const [pin, setPin] = useState<string>(savedConfig?.pin || "1234");
  const [dobleConfirmacion, setDobleConfirmacion] = useState<boolean>(
    !!savedConfig?.dobleConfirmacion
  );

  // ⚙️ Automatización
  const [alertasActivas, setAlertasActivas] = useState<boolean>(
    savedConfig?.alertasActivas ?? true
  );
  const [diasAviso, setDiasAviso] = useState<number>(
    savedConfig?.diasAviso || 3
  );

  // 🖨️ Reportes
  const [mostrarLogo, setMostrarLogo] = useState<boolean>(
    savedConfig?.mostrarLogo ?? true
  );
  const [incluirFirmas, setIncluirFirmas] = useState<boolean>(
    savedConfig?.incluirFirmas ?? false
  );

  // 🎯 Extras
  const [idioma, setIdioma] = useState<string>(savedConfig?.idioma || "es");
  const [notificaciones, setNotificaciones] = useState<boolean>(
    savedConfig?.notificaciones ?? true
  );
  const [animaciones, setAnimaciones] = useState<boolean>(
    savedConfig?.animaciones ?? true
  );
  const [atajos, setAtajos] = useState<boolean>(
    savedConfig?.atajos ?? true
  );

  // 💾 Guardar configuración automáticamente
  useEffect(() => {
    const config: ConfiguracionData = {
      tema,
      colorPrincipal,
      moneda,
      fechaFormato,
      columnas,
      filasPorPagina,
      pin,
      dobleConfirmacion,
      alertasActivas,
      diasAviso,
      mostrarLogo,
      incluirFirmas,
      idioma,
      notificaciones,
      animaciones,
      atajos,
    };
    localStorage.setItem("cheqify_config", JSON.stringify(config));
  }, [
    tema,
    colorPrincipal,
    moneda,
    fechaFormato,
    columnas,
    filasPorPagina,
    pin,
    dobleConfirmacion,
    alertasActivas,
    diasAviso,
    mostrarLogo,
    incluirFirmas,
    idioma,
    notificaciones,
    animaciones,
    atajos,
  ]);

  const aplicarTema = () => {
    document.body.classList.remove("tema-oscuro", "tema-claro", "tema-metalico");
    document.body.classList.add(`tema-${tema}`);
    document.documentElement.style.setProperty("--color-principal", colorPrincipal);
  };

  useEffect(() => {
    aplicarTema();
  }, [tema, colorPrincipal]);

  const guardarConfiguracion = () => {
    toast.success("Configuraciones guardadas correctamente ✅", {
      style: { background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)", color: "#fff" },
    });
  };

  return (
    <div className="p-3">
      <h3
        className="fw-bold mb-4"
        style={{
          background: "linear-gradient(135deg, #222, #555)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ⚙️ Configuración del Sistema
      </h3>

      <Row className="g-4">
        {/* 🎨 TEMA VISUAL */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-dark text-white d-flex align-items-center gap-2">
              <FaPalette /> <strong>Tema Visual</strong>
            </Card.Header>
            <Card.Body>
              <Form.Select
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="mb-3"
              >
                <option value="oscuro">Oscuro</option>
                <option value="claro">Claro</option>
                <option value="metalico">Metálico</option>
              </Form.Select>

              <Form.Group>
                <Form.Label>Color principal</Form.Label>
                <Form.Control
                  type="color"
                  value={colorPrincipal}
                  onChange={(e) => setColorPrincipal(e.target.value)}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* 💰 MONEDA Y FECHA */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-dark text-white d-flex align-items-center gap-2">
              <FaMoneyBill /> <strong>Formato de Moneda y Fecha</strong>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Moneda</Form.Label>
                <Form.Select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                >
                  <option value="DOP">DOP (RD$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Formato de Fecha</Form.Label>
                <Form.Select
                  value={fechaFormato}
                  onChange={(e) => setFechaFormato(e.target.value)}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* 🧾 VISTA DE TABLAS */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-dark text-white d-flex align-items-center gap-2">
              <FaTable /> <strong>Personalización de Tablas</strong>
            </Card.Header>
            <Card.Body>
              {Object.entries(columnas).map(([columna, activa]) => (
                <Form.Check
                  key={columna}
                  type="switch"
                  id={columna}
                  label={`Mostrar columna "${columna}"`}
                  checked={!!activa}
                  onChange={(e) =>
                    setColumnas({ ...columnas, [columna]: e.target.checked })
                  }
                />
              ))}

              <Form.Group className="mt-3">
                <Form.Label>Filas por página</Form.Label>
                <Form.Control
                  type="number"
                  min={5}
                  max={50}
                  value={filasPorPagina}
                  onChange={(e) =>
                    setFilasPorPagina(parseInt(e.target.value, 10))
                  }
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* 🔐 SEGURIDAD */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-dark text-white d-flex align-items-center gap-2">
              <FaLock /> <strong>Seguridad</strong>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>PIN de administrador</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                  <Button variant="outline-dark">Cambiar</Button>
                </InputGroup>
              </Form.Group>

              <Form.Check
                type="switch"
                id="dobleConfirmacion"
                label="Activar doble confirmación en eliminaciones"
                checked={!!dobleConfirmacion}
                onChange={(e) => setDobleConfirmacion(e.target.checked)}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* ⚙️ AUTOMATIZACIÓN */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-dark text-white d-flex align-items-center gap-2">
              <FaBell /> <strong>Automatización y Alertas</strong>
            </Card.Header>
            <Card.Body>
              <Form.Check
                type="switch"
                id="alertasActivas"
                label="Activar alertas automáticas"
                checked={!!alertasActivas}
                onChange={(e) => setAlertasActivas(e.target.checked)}
              />

              {alertasActivas && (
                <Form.Group className="mt-3">
                  <Form.Label>Días de aviso antes del depósito</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={10}
                    value={diasAviso}
                    onChange={(e) => setDiasAviso(parseInt(e.target.value))}
                  />
                </Form.Group>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* 🖨️ PERSONALIZACIÓN DE REPORTES */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-dark text-white d-flex align-items-center gap-2">
              <FaFileAlt /> <strong>Reportes Personalizados</strong>
            </Card.Header>
            <Card.Body>
              <Form.Check
                type="switch"
                label="Incluir logo en reportes"
                checked={!!mostrarLogo}
                onChange={(e) => setMostrarLogo(e.target.checked)}
              />
              <Form.Check
                type="switch"
                label="Incluir firmas"
                checked={!!incluirFirmas}
                onChange={(e) => setIncluirFirmas(e.target.checked)}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* 🎯 EXTRAS */}
        <Col md={12}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-dark text-white d-flex align-items-center gap-2">
              <FaCogs /> <strong>Preferencias Generales</strong>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Idioma</Form.Label>
                    <Form.Select
                      value={idioma}
                      onChange={(e) => setIdioma(e.target.value)}
                    >
                      <option value="es">Español</option>
                      <option value="en">Inglés</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={8}>
                  <div className="d-flex flex-wrap gap-3 mt-3">
                    <Form.Check
                      type="switch"
                      id="notificaciones"
                      label="Notificaciones en pantalla"
                      checked={!!notificaciones}
                      onChange={(e) => setNotificaciones(e.target.checked)}
                    />
                    <Form.Check
                      type="switch"
                      id="animaciones"
                      label="Efectos visuales"
                      checked={!!animaciones}
                      onChange={(e) => setAnimaciones(e.target.checked)}
                    />
                    <Form.Check
                      type="switch"
                      id="atajos"
                      label="Atajos de teclado"
                      checked={!!atajos}
                      onChange={(e) => setAtajos(e.target.checked)}
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="text-end mt-4">
        <Button
          size="lg"
          variant="dark"
          className="px-5 fw-bold"
          style={{
            background: "linear-gradient(135deg, #1a1a1a, #3a3a3a)",
            borderRadius: "12px",
          }}
          onClick={guardarConfiguracion}
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
