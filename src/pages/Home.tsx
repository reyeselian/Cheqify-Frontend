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
  Form,
  InputGroup,
} from "react-bootstrap";
import { FaEllipsisV, FaPlus, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Home() {
  const [cheques, setCheques] = useState<any[]>([]);
  const [filteredCheques, setFilteredCheques] = useState<any[]>([]);
  const [deletedCheques, setDeletedCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCheque, setSelectedCheque] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("total");
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [accionSeleccionada, setAccionSeleccionada] = useState<"editar" | "eliminar" | null>(null);
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
      .get("/cheques/deleted/all")
      .then((res) => {
        setDeletedCheques(res.data);
        setFilteredCheques(res.data);
        setActiveFilter("eliminados");
        setShowDeleted(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCheques();
  }, []);

  // ✅ Marcar como cobrado (solo si está pendiente)
  const marcarCobrado = async (cheque: any) => {
    if (cheque.estado !== "pendiente") {
      toast.info("Solo los cheques pendientes pueden marcarse como cobrado.", {
        style: { background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)", color: "#e6e6e6" },
      });
      return;
    }
    try {
      await api.put(`/cheques/${cheque._id}`, { estado: "cobrado" });
      setCheques((prev) => prev.map((c) => (c._id === cheque._id ? { ...c, estado: "cobrado" } : c)));
      setFilteredCheques((prev) =>
        prev.map((c) => (c._id === cheque._id ? { ...c, estado: "cobrado" } : c))
      );
      toast.success("💰 Cheque marcado como cobrado.", {
        style: { background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)", color: "#e6e6e6" },
      });
    } catch {
      toast.error("Error al actualizar el estado del cheque.");
    }
  };

  // ✏️ Editar cheque
  const handleEdit = (cheque: any) => {
    setSelectedCheque(cheque);
    setShowModal(true);
  };

  // 🗑️ Eliminar cheque (mover a Eliminados)
  const handleDelete = async (id: string) => {
    if (confirm("¿Desea eliminar este cheque?")) {
      await api.delete(`/cheques/${id}`);
      fetchCheques();
      fetchDeletedCheques(); // refrescar eliminados para dashboard
      toast.warn("🗑️ Cheque movido a eliminados.", {
        style: { background: "linear-gradient(135deg, #2b2b2b, #444)" },
      });
    }
  };

  // ♻️ Restaurar cheque desde Eliminados
  const handleRestore = async (cheque: any) => {
    await api.put(`/cheques/restore/${cheque._id}`);
    fetchCheques();
    fetchDeletedCheques();
    toast.success("♻️ Cheque restaurado correctamente.", {
      style: { background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)" },
    });
  };

  // ❌ Eliminar permanentemente desde Eliminados
  const handlePermanentDelete = async (cheque: any) => {
    if (confirm("¿Desea eliminar permanentemente este cheque?")) {
      await api.delete(`/cheques/permanent/${cheque._id}`);
      fetchDeletedCheques();
      toast.error("❌ Cheque eliminado permanentemente.");
    }
  };

  const getEstadoBadge = (estado: string) => {
    const style: any = {
      pendiente: { bg: "warning", text: "Pendiente" },
      cobrado: { bg: "success", text: "Cobrado" },
      devuelto: { bg: "secondary", text: "Devuelto" },
    };
    return <Badge bg={style[estado]?.bg || "dark"}>{style[estado]?.text || estado}</Badge>;
  };

  const verificarPassword = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setShowPasswordModal(false);
      if (accionSeleccionada === "editar") handleEdit(chequeSeleccionado);
      if (accionSeleccionada === "eliminar") handleDelete(chequeSeleccionado._id);
      setPasswordInput("");
    } else {
      toast.error("Contraseña incorrecta.");
    }
  };

  const handleViewDetails = (cheque: any) => {
    setSelectedCheque(cheque);
    setImagePreview(cheque.imagen || null);
    setShowDetailsModal(true);
  };

  // 🔍 Filtro de búsqueda/estado sobre activos
  useEffect(() => {
    let result = cheques.filter((c) =>
      [c.numero, c.banco, c.beneficiario].some((field) =>
        field?.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
    if (estadoFiltro !== "todos") result = result.filter((c) => c.estado === estadoFiltro);
    setFilteredCheques(result);
  }, [search, estadoFiltro, cheques]);

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    });

  // Totales (activos)
  const pendientes = cheques.filter((c) => c.estado === "pendiente");
  const cobrados = cheques.filter((c) => c.estado === "cobrado");
  const devueltos = cheques.filter((c) => c.estado === "devuelto");
  const montoTotal = cheques.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoPendiente = pendientes.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoCobrados = cobrados.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoDevueltos = devueltos.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

  // Totales (eliminados)
  const montoEliminados = deletedCheques.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

  const handleFilter = (type: string) => {
    setActiveFilter(type);
    switch (type) {
      case "pendientes":
        setFilteredCheques(pendientes);
        setShowDeleted(false);
        break;
      case "cobrados":
        setFilteredCheques(cobrados);
        setShowDeleted(false);
        break;
      case "devueltos":
        setFilteredCheques(devueltos);
        setShowDeleted(false);
        break;
      case "eliminados":
        fetchDeletedCheques(); // esto setea showDeleted(true) internamente
        break;
      default:
        fetchCheques(); // vuelve a activos y showDeleted(false)
    }
  };

  return (
    <div className="p-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Super Colmado Domba</h3>

        <Button
          size="sm"
          className="border-0 fw-bold text-white px-4 py-2"
          style={{
            background: "linear-gradient(135deg, #1a1a1a, #444, #222)",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
          onClick={() => {
            setSelectedCheque(null);
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Añadir Cheque
        </Button>
      </div>

      {/* BUSCADOR */}
      <InputGroup className="mb-3">
        <InputGroup.Text className="bg-dark text-white border-0">
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          placeholder="Buscar por número, banco o beneficiario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Form.Select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          style={{ maxWidth: "180px" }}
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="cobrado">Cobrados</option>
          <option value="devuelto">Devueltos</option>
        </Form.Select>
      </InputGroup>

      {/* DASHBOARD */}
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
        {[
          { key: "total", label: "Total", count: cheques.length, amount: montoTotal, color: "primary" },
          { key: "pendientes", label: "Pendientes", count: pendientes.length, amount: montoPendiente, color: "warning" },
          { key: "cobrados", label: "Cobrados", count: cobrados.length, amount: montoCobrados, color: "success" },
          { key: "devueltos", label: "Devueltos", count: devueltos.length, amount: montoDevueltos, color: "secondary" },
          { key: "eliminados", label: "Eliminados", count: deletedCheques.length, amount: montoEliminados, color: "danger" },
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
              transition: "all 0.3s ease",
            }}
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
                  <td className="text-center d-flex justify-content-center align-items-center gap-2">
                    {/* ✅ Botón verde/gris para marcar cobrado (solo en activos) */}
                    {!showDeleted && (
                      <Button
                        size="sm"
                        className="rounded-circle border-0"
                        title={c.estado === "pendiente" ? "Marcar como cobrado" : ""}
                        onClick={() => marcarCobrado(c)}
                        style={{
                          width: "30px",
                          height: "30px",
                          background:
                            c.estado === "cobrado"
                              ? "linear-gradient(145deg, #198754, #2ecc71)"
                              : "linear-gradient(145deg, #6c757d, #adb5bd)",
                          color: "#fff",
                          fontWeight: "bold",
                          transition: "all 0.3s ease",
                        }}
                      >
                        ✓
                      </Button>
                    )}

                    <Dropdown>
                      <Dropdown.Toggle
                        variant="dark"
                        size="sm"
                        style={{
                          background: "linear-gradient(135deg, #333, #555)",
                          border: "none",
                        }}
                      >
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => handleViewDetails(c)}
                          className="text-primary fw-semibold"
                        >
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
                              className="text-info fw-semibold"
                            >
                              Editar
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => {
                                setAccionSeleccionada("eliminar");
                                setChequeSeleccionado(c);
                                setShowPasswordModal(true);
                              }}
                              className="text-danger fw-semibold"
                            >
                              Eliminar
                            </Dropdown.Item>
                          </>
                        ) : (
                          <>
                            <Dropdown.Item
                              onClick={() => handleRestore(c)}
                              className="text-success fw-semibold"
                            >
                              Restaurar
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handlePermanentDelete(c)}
                              className="text-danger fw-semibold"
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

      {/* MODALES */}
      <ChequeForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        cheque={selectedCheque}
        onSaved={fetchCheques}
      />

      {/* MODAL DETALLES */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Detalles del Cheque</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "linear-gradient(145deg, #f8f9fa, #ffffff)" }}>
          {selectedCheque && (
            <>
              {imagePreview && (
                <div className="text-center mb-3">
                  <img
                    src={imagePreview}
                    alt="Cheque"
                    className="img-fluid rounded shadow-sm"
                    style={{
                      maxHeight: "250px",
                      objectFit: "contain",
                      border: "2px solid #ccc",
                    }}
                  />
                </div>
              )}
              <div className="row">
                <div className="col-md-6">
                  <p><strong>No. Cheque:</strong> {selectedCheque.numero}</p>
                  <p><strong>Banco:</strong> {selectedCheque.banco}</p>
                  <p><strong>Beneficiario:</strong> {selectedCheque.beneficiario}</p>
                  <p><strong>Firmado Por:</strong> {selectedCheque.firmadoPor}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Monto:</strong> {formatCurrency(selectedCheque.monto)}</p>
                  <p><strong>Estado:</strong> {selectedCheque.estado}</p>
                  <p><strong>Fecha Cheque:</strong> {selectedCheque.fechaCheque ? new Date(selectedCheque.fechaCheque).toLocaleDateString() : "No registrada"}</p>
                  <p><strong>Fecha Depósito:</strong> {selectedCheque.fechaDeposito ? new Date(selectedCheque.fechaDeposito).toLocaleDateString() : "No registrada"}</p>
                </div>
              </div>
              {selectedCheque.notas && (
                <p className="mt-3"><strong>Notas:</strong> {selectedCheque.notas}</p>
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
          <Button variant="dark" onClick={verificarPassword}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
