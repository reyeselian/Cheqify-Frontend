import { useState } from "react";
import { useConfig } from "../context/ConfigContext";
import { Card, Form, Button, Row, Col, InputGroup, Modal } from "react-bootstrap";
import {
  FaPalette,
  FaTable,
  FaLock,
  FaFileAlt,
  FaCogs,
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function Configuracion() {
  const { config, updateConfig, resetConfig, applyConfig } = useConfig();

  // Estado para modal PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handlePinChange = () => {
    if (oldPin !== config.pin) {
      toast.error("El PIN actual es incorrecto ❌");
      return;
    }
    if (newPin.length < 4) {
      toast.warning("El nuevo PIN debe tener al menos 4 dígitos ⚠️");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("Los PIN no coinciden ❌");
      return;
    }

    updateConfig({ pin: newPin });
    toast.success("PIN cambiado correctamente ✅");
    setShowPinModal(false);
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
  };

  const guardarConfiguracion = () => {
    applyConfig(); // 🔹 Aplica tema, idioma, etc.
    toast.success("Configuraciones aplicadas correctamente ✅", {
      style: {
        background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)",
        color: "#fff",
      },
    });
  };

  const openPinModal = () => {
    toast.info("⚠️ Estás entrando a una zona sensible. Verifica tu identidad.");
    setShowPinModal(true);
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
                value={config.tema ?? "oscuro"}
                onChange={(e) => updateConfig({ tema: e.target.value })}
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
                  value={config.colorPrincipal ?? "#2b2b2b"}
                  onChange={(e) => updateConfig({ colorPrincipal: e.target.value })}
                  style={{ width: "70px", height: "40px", cursor: "pointer" }}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* 🧾 TABLAS */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-dark text-white d-flex align-items-center gap-2">
              <FaTable /> <strong>Personalización de Tablas</strong>
            </Card.Header>
            <Card.Body>
              {Object.entries(config.columnas ?? {}).map(([columna, activa]) => (
                <Form.Check
                  key={columna}
                  type="switch"
                  id={columna}
                  label={`Mostrar columna "${columna}"`}
                  checked={!!activa}
                  onChange={(e) =>
                    updateConfig({
                      columnas: { ...config.columnas, [columna]: e.target.checked },
                    })
                  }
                />
              ))}

              <Form.Group className="mt-3">
                <Form.Label>Filas por página</Form.Label>
                <Form.Control
                  type="number"
                  min={5}
                  max={50}
                  value={config.filasPorPagina ?? 10}
                  onChange={(e) =>
                    updateConfig({ filasPorPagina: parseInt(e.target.value, 10) })
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
                  <Form.Control type="password" value="••••••" readOnly disabled />
                  <Button variant="outline-dark" onClick={openPinModal}>
                    Cambiar
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Check
                type="switch"
                id="dobleConfirmacion"
                label="Activar doble confirmación en eliminaciones"
                checked={config.dobleConfirmacion ?? false}
                onChange={(e) => updateConfig({ dobleConfirmacion: e.target.checked })}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* BOTONES FINALES */}
      <div className="d-flex justify-content-end gap-3 mt-4">
        <Button variant="secondary" onClick={resetConfig}>
          Restablecer por defecto
        </Button>
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

      {/* 🔐 MODAL DE CAMBIO DE PIN */}
      <Modal show={showPinModal} onHide={() => setShowPinModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar PIN de Administrador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>PIN actual</Form.Label>
            <Form.Control
              type="password"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nuevo PIN</Form.Label>
            <Form.Control
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Confirmar nuevo PIN</Form.Label>
            <Form.Control
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPinModal(false)}>
            Cancelar
          </Button>
          <Button variant="dark" onClick={handlePinChange}>
            Confirmar Cambio
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
