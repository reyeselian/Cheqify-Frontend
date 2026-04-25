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
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import TrialGuard from "../components/TrialGuard";

export default function Home() {
  useAuth();

  const [cheques, setCheques] = useState<any[]>([]);
  const [filteredCheques, setFilteredCheques] = useState<any[]>([]);
  const [deletedCheques, setDeletedCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCheque, setSelectedCheque] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("total");
  const [showDeleted, setShowDeleted] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [accionSeleccionada, setAccionSeleccionada] = useState<"editar" | "eliminar" | null>(null);
  const [chequeSeleccionado, setChequeSeleccionado] = useState<any>(null);

  const getToken = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  // 🔹 Cargar cheques activos
  const fetchCheques = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await api.get("/cheques", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCheques(res.data);
      setFilteredCheques(res.data);
      setActiveFilter("total");
      setShowDeleted(false);
    } catch (err) {
      console.error("Error al obtener cheques:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar cheques eliminados
  const fetchDeletedCheques = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await api.get("/cheques/deleted/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedCheques(res.data);
      setFilteredCheques(res.data);
      setShowDeleted(true);
      setActiveFilter("eliminados");
    } catch (err) {
      console.error("Error al cargar cheques eliminados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheques();
  }, []);

  // ✅ Marcar como cobrado
  const marcarCobrado = async (cheque: any) => {
    if (cheque.estado !== "pendiente") {
      toast.info("Solo los cheques pendientes pueden marcarse como cobrado.", {
        style: { background: "#2b2b2b", color: "#fff" },
      });
      return;
    }
    try {
      const token = getToken();
      await api.put(
        `/cheques/${cheque._id}`,
        { estado: "cobrado" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCheques();
      toast.success("💰 Cheque marcado como cobrado.", {
        style: { background: "#1f1f1f", color: "#fff" },
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

  // 🗑️ Eliminar cheque (SOFT DELETE)
  const handleDelete = async (id: string) => {
    const token = getToken();
    if (confirm("¿Desea mover este cheque a 'Eliminados'?")) {
      await api.delete(`/cheques/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCheques();
      fetchDeletedCheques();
      toast.warn("🗑️ Cheque movido a eliminados.", {
        style: { background: "#333", color: "#fff" },
      });
    }
  };

  // ♻️ Restaurar cheque
  const handleRestore = async (cheque: any) => {
    const token = getToken();
    await api.put(`/cheques/restore/${cheque._id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCheques();
    fetchDeletedCheques();
    toast.success("♻️ Cheque restaurado correctamente.", {
      style: { background: "#1f1f1f", color: "#fff" },
    });
  };

  // ❌ Eliminar permanentemente
  const handlePermanentDelete = async (cheque: any) => {
    const token = getToken();
    if (confirm("¿Desea eliminar permanentemente este cheque?")) {
      await api.delete(`/cheques/permanent/${cheque._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDeletedCheques();
      toast.error("❌ Cheque eliminado permanentemente.");
    }
  };

  // 🔐 Verificar contraseña
  const verificarPassword = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("⚠️ Sesión expirada, vuelve a iniciar sesión.");
        return;
      }
      const res = await api.post(
        "/auth/verify-password",
        { password: passwordInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setShowPasswordModal(false);
        if (accionSeleccionada === "editar") handleEdit(chequeSeleccionado);
        if (accionSeleccionada === "eliminar") handleDelete(chequeSeleccionado._id);
        setPasswordInput("");
        toast.success("🔐 Contraseña verificada correctamente.", {
          style: { background: "#1f1f1f", color: "#fff" },
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Contraseña incorrecta");
    }
  };

  const handleViewDetails = (cheque: any) => {
    setSelectedCheque(cheque);
    setImagePreview(cheque.imagen || null);
    setShowDetailsModal(true);
  };

  // 💰 Totales
  const pendientes = cheques.filter((c) => c.estado === "pendiente");
  const cobrados = cheques.filter((c) => c.estado === "cobrado");
  const devueltos = cheques.filter((c) => c.estado === "devuelto");
  const montoTotal = cheques.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoPendiente = pendientes.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoCobrados = cobrados.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoDevueltos = devueltos.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);
  const montoEliminados = deletedCheques.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

  // 🔍 Filtros
  const handleFilter = async (type: string) => {
    setActiveFilter(type);
    setLoading(true);
    try {
      if (type === "pendientes") {
        setFilteredCheques(pendientes);
        setShowDeleted(false);
      } else if (type === "cobrados") {
        setFilteredCheques(cobrados);
        setShowDeleted(false);
      } else if (type === "devueltos") {
        setFilteredCheques(devueltos);
        setShowDeleted(false);
      } else if (type === "eliminados") {
        await fetchDeletedCheques();
      } else {
        await fetchCheques();
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-DO", { style: "currency", currency: "DOP" });

  const getEstadoBadge = (estado: string) => {
    const style: any = {
      pendiente: { bg: "warning", text: "Pendiente" },
      cobrado: { bg: "success", text: "Cobrado" },
      devuelto: { bg: "secondary", text: "Devuelto" },
    };
    return <Badge bg={style[estado]?.bg || "dark"}>{style[estado]?.text || estado}</Badge>;
  };

  return (
    // ✅ Sin scroll — todo el contenido cabe en pantalla
    <div className="px-3 pt-2 pb-2">
      {/* HEADER — menos margen arriba */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* 🎨 BOTÓN METÁLICO PREMIUM — más compacto */}
        <TrialGuard showDisabled>
          <Button
            size="sm"
            className="fw-bold text-dark px-4 py-2 border-0"
            style={{
              background: "linear-gradient(145deg, #b3b3b3, #d9d9d9, #a6a6a6)",
              borderRadius: "12px",
              boxShadow: "inset 0 1px 2px rgba(255,255,255,0.7), 0 4px 15px rgba(0,0,0,0.3)",
              textShadow: "0 1px 1px rgba(255,255,255,0.6)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(145deg, #dcdcdc, #f2f2f2, #bfbfbf)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(145deg, #b3b3b3, #d9d9d9, #a6a6a6)")
            }
            onClick={() => {
              setSelectedCheque(null);
              setShowModal(true);
            }}
          >
            <FaPlus className="me-2" />
            Añadir Cheque
          </Button>
        </TrialGuard>
      </div>

      {/* 🔹 DASHBOARD — tarjetas más compactas */}
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
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
            className={`text-center border-0 rounded-3 shadow-sm flex-grow-1 ${
              activeFilter === item.key ? `border-3 border-${item.color}` : ""
            }`}
            style={{
              minWidth: "130px",
              cursor: "pointer",
              background:
                activeFilter === item.key
                  ? `linear-gradient(145deg, var(--bs-${item.color}) 10%, #fff)`
                  : "linear-gradient(145deg, #f8f9fa, #ffffff)",
              transition: "all 0.3s ease",
            }}
          >
            <Card.Body className="py-2 px-2">
              <h6 className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>{item.label}</h6>
              <h4 className={`fw-bold text-${item.color} mb-0`}>{item.count}</h4>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>{formatCurrency(item.amount)}</small>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* 🔹 TABLA DE CHEQUES */}
      {loading ? (
        <div className="text-center mt-3">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : filteredCheques.length === 0 ? (
        <p className="text-center text-muted mt-3">
          {showDeleted ? "No hay cheques eliminados." : "No hay cheques registrados aún."}
        </p>
      ) : (
        <div className="table-responsive shadow-sm rounded-4 border bg-white p-2">
          <Table hover className="align-middle mb-0" size="sm">
            <thead className="bg-dark text-white">
              <tr>
                <th style={{ width: "50px" }}>#</th>
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
              {(showDeleted ? filteredCheques : filteredCheques.slice(0, 5)).map((c, index) => (
                <tr key={c._id}>
                  <td>
                    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"26px", height:"26px", borderRadius:"50%", background:"linear-gradient(145deg,#333,#555)", color:"#fff", fontSize:"0.72rem", fontWeight:700 }}>
                      {index + 1}
                    </span>
                  </td>
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

      {/* 🔹 MODALES */}
      <ChequeForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        cheque={selectedCheque}
        onSaved={fetchCheques}
      />

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
                  <p><strong>Firmado Por:</strong> {selectedCheque.firmadoPor || "No registrado"}</p>
                  <p><strong>Notas:</strong> {selectedCheque.notas || "Sin notas"}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Monto:</strong> {formatCurrency(selectedCheque.monto)}</p>
                  <p><strong>Estado:</strong> {selectedCheque.estado}</p>
                  <p>
                    <strong>Fecha Cheque:</strong>{" "}
                    {selectedCheque.fechaCheque
                      ? new Date(selectedCheque.fechaCheque).toLocaleDateString()
                      : "No registrada"}
                  </p>
                  <p>
                    <strong>Fecha Depósito:</strong>{" "}
                    {selectedCheque.fechaDeposito
                      ? new Date(selectedCheque.fechaDeposito).toLocaleDateString()
                      : "No registrada"}
                  </p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

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

export {};