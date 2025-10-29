import { useEffect, useState } from "react";
import ChequeForm from "../components/ChequeForm";
import { api } from "../services/api";
import {
  Table,
  Button,
  Spinner,
  Badge,
  Card,
  Dropdown,
  Modal,
} from "react-bootstrap";
import { FaEllipsisV, FaPlus } from "react-icons/fa";

export default function Home() {
  const [cheques, setCheques] = useState<any[]>([]);
  const [filteredCheques, setFilteredCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCheque, setSelectedCheque] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("total");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [accionSeleccionada, setAccionSeleccionada] = useState<
    "editar" | "eliminar" | null
  >(null);
  const [chequeSeleccionado, setChequeSeleccionado] = useState<any>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const ADMIN_PASSWORD = "1234";

  // 🔹 Cargar cheques activos
  const fetchCheques = () => {
    setLoading(true);
    api
      .get("/cheques")
      .then((res) => {
        setCheques(res.data);
        setFilteredCheques(res.data);
        setActiveFilter("total");
        setShowDeleted(false);
      })
      .finally(() => setLoading(false));
  };

  // 🔹 Cargar cheques eliminados
  const fetchDeletedCheques = () => {
    setLoading(true);
    api
      .get("/cheques/deleted")
      .then((res) => {
        setFilteredCheques(res.data);
        setActiveFilter("eliminados");
        setShowDeleted(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCheques();
  }, []);

  // 🔁 Cambiar estado a cobrado/pendiente

  const handleEdit = (cheque: any) => {
    setSelectedCheque(cheque);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Desea eliminar este cheque?")) {
      await api.delete(`/cheques/${id}`);
      fetchCheques();
    }
  };

  const handleRestore = async (cheque: any) => {
    await api.put(`/cheques/restore/${cheque._id}`);
    fetchCheques();
  };

  const handlePermanentDelete = async (cheque: any) => {
    if (confirm("¿Desea eliminar permanentemente este cheque?")) {
      await api.delete(`/cheques/permanent/${cheque._id}`);
      fetchDeletedCheques();
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge bg="warning" text="dark">
            Pendiente
          </Badge>
        );
      case "cobrado":
        return <Badge bg="success">Cobrado</Badge>;
      case "devuelto":
        return <Badge bg="secondary">Devuelto</Badge>; // 🔄 Color intercambiado
      default:
        return <Badge bg="danger">{estado}</Badge>; // 🔄 Color intercambiado
    }
  };

  const verificarPassword = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setShowPasswordModal(false);
      if (accionSeleccionada === "editar") {
        if (showDeleted) handleRestore(chequeSeleccionado);
        else handleEdit(chequeSeleccionado);
      }
      if (accionSeleccionada === "eliminar") {
        if (showDeleted) handlePermanentDelete(chequeSeleccionado);
        else handleDelete(chequeSeleccionado._id);
      }
      setPasswordInput("");
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const handleViewDetails = (cheque: any) => {
    setSelectedCheque(cheque);
    setImagePreview(cheque.imagen || null);
    setShowDetailsModal(true);
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    });

  // Totales
  const pendientes = cheques.filter((c) => c.estado === "pendiente");
  const cobrados = cheques.filter((c) => c.estado === "cobrado");
  const devueltos = cheques.filter((c) => c.estado === "devuelto");

  const montoTotal = cheques.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoPendiente = pendientes.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoCobrados = cobrados.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoDevueltos = devueltos.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

  // 🔹 Filtro dinámico
  const handleFilter = (type: string) => {
    setActiveFilter(type);
    switch (type) {
      case "pendientes":
        setFilteredCheques(pendientes);
        break;
      case "cobrados":
        setFilteredCheques(cobrados);
        break;
      case "devueltos":
        setFilteredCheques(devueltos);
        break;
      case "eliminados":
        fetchDeletedCheques();
        break;
      default:
        setFilteredCheques(cheques);
    }
  };

  return (
    <div className="p-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Historial de Cheques</h3>

        {/* 🔥 Botón Premium Metálico */}
        <Button
          size="sm"
          className="border-0 fw-bold text-white px-4 py-2 position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a1a1a, #444, #222)",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            transition: "all 0.4s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #2a2a2a, #555, #222)";
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #1a1a1a, #444, #222)";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
          }}
          onClick={() => {
            setSelectedCheque(null);
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Añadir Cheque
          {/* ✨ Reflejo animado */}
          <span
            style={{
              position: "absolute",
              top: 0,
              left: "-75%",
              width: "50%",
              height: "100%",
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)",
              transform: "skewX(-20deg)",
              animation: "shine 3s infinite",
            }}
          ></span>
          <style>
            {`@keyframes shine {
              0% { left: -75%; }
              50% { left: 125%; }
              100% { left: 125%; }
            }`}
          </style>
        </Button>
      </div>

      {/* 🌈 DASHBOARD PREMIUM */}
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
        {[
          { key: "total", label: "Total", count: cheques.length, amount: montoTotal, color: "primary" },
          { key: "pendientes", label: "Pendientes", count: pendientes.length, amount: montoPendiente, color: "warning" },
          { key: "cobrados", label: "Cobrados", count: cobrados.length, amount: montoCobrados, color: "success" },
          { key: "devueltos", label: "Devueltos", count: devueltos.length, amount: montoDevueltos, color: "secondary" },
          { key: "eliminados", label: "Eliminados", count: "-", amount: 0, color: "danger" },
        ].map((item, idx) => (
          <Card
            key={idx}
            onClick={() => handleFilter(item.key)}
            className={`text-center border-0 rounded-4 shadow-sm flex-grow-1 ${
              activeFilter === item.key ? `border-3 border-${item.color}` : ""
            }`}
            style={{
              minWidth: "160px",
              cursor: "pointer",
              background: activeFilter === item.key
                ? `linear-gradient(145deg, var(--bs-${item.color}) 10%, #fff)`
                : "linear-gradient(145deg, #f8f9fa, #ffffff)",
              boxShadow: activeFilter === item.key
                ? `0 8px 20px rgba(var(--bs-${item.color}-rgb), 0.3)`
                : "0 4px 10px rgba(0,0,0,0.1)",
              transform: activeFilter === item.key ? "scale(1.05)" : "scale(1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            <Card.Body className="p-3">
              <h6 className="text-muted mb-1">{item.label}</h6>
              <h4 className={`fw-bold text-${item.color} mb-0`}>{item.count}</h4>
              <small className="text-muted">{formatCurrency(item.amount)}</small>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : filteredCheques.length === 0 ? (
        <p className="text-center text-muted mt-5">
          {showDeleted ? "No hay cheques eliminados." : "No hay cheques registrados aún."}
        </p>
      ) : (
        <div className="table-responsive shadow-sm rounded-4 border bg-white p-2">
          <Table hover className="align-middle mb-0">
            <thead className="bg-dark text-white">
              <tr>
                <th>No. Cheque</th>
                <th>Banco</th>
                <th>Beneficiario</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha Depósito</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCheques.map((c) => (
                <tr key={c._id}>
                  <td>{c.numero}</td>
                  <td>{c.banco}</td>
                  <td>{c.beneficiario}</td>
                  <td>{formatCurrency(Number(c.monto))}</td>
                  <td>{getEstadoBadge(c.estado)}</td>
                  <td>
                    {c.fechaDeposito
                      ? new Date(c.fechaDeposito).toLocaleDateString()
                      : "No registrada"}
                  </td>
                  <td className="text-center">
                    <Dropdown>
                      <Dropdown.Toggle variant="secondary" size="sm">
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleViewDetails(c)}>
                          Ver Detalles
                        </Dropdown.Item>
                        {!showDeleted ? (
                          <>
                            <Dropdown.Item
                              onClick={() => {
                                setAccionSeleccionada("editar");
                                setChequeSeleccionado(c);
                                setShowPasswordModal(true);
                              }}
                            >
                              Editar
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                setAccionSeleccionada("eliminar");
                                setChequeSeleccionado(c);
                                setShowPasswordModal(true);
                              }}
                              className="text-danger"
                            >
                              Eliminar
                            </Dropdown.Item>
                          </>
                        ) : (
                          <>
                            <Dropdown.Item onClick={() => handleRestore(c)}>
                              Restaurar
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handlePermanentDelete(c)}
                              className="text-danger"
                            >
                              Eliminar Permanentemente
                            </Dropdown.Item>
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* MODAL FORMULARIO */}
      <ChequeForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        cheque={selectedCheque}
        onSaved={fetchCheques}
      />

      {/* MODAL DETALLES */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Cheque</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCheque && (
            <>
              <p><strong>No. Cheque:</strong> {selectedCheque.numero}</p>
              <p><strong>Banco:</strong> {selectedCheque.banco}</p>
              <p><strong>Beneficiario:</strong> {selectedCheque.beneficiario}</p>
              <p><strong>Monto:</strong> {formatCurrency(selectedCheque.monto)}</p>
              <p><strong>Estado:</strong> {selectedCheque.estado}</p>
              <p><strong>Firmado Por:</strong> {selectedCheque.firmadoPor}</p>
              <p><strong>Fecha Cheque:</strong> {selectedCheque.fechaCheque ? new Date(selectedCheque.fechaCheque).toLocaleDateString() : "No registrada"}</p>
              <p><strong>Fecha Depósito:</strong> {selectedCheque.fechaDeposito ? new Date(selectedCheque.fechaDeposito).toLocaleDateString() : "No registrada"}</p>

              {imagePreview && (
                <div className="mt-3 text-center">
                  <img
                    src={imagePreview}
                    alt="Cheque"
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: "220px", objectFit: "contain" }}
                  />
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL CONTRASEÑA */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contraseña Administrador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="password"
            className="form-control"
            placeholder="Ingrese la contraseña"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={verificarPassword}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
