import { useEffect, useState } from "react";
import {
  Table,
  Spinner,
  Badge,
  Card,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Modal,
} from "react-bootstrap";
import { api } from "../services/api";
import {
  FaSyncAlt,
  FaMoneyBillWave,
  FaUndoAlt,
  FaExclamationCircle,
  FaSearch,
  FaEllipsisV,
} from "react-icons/fa";
import { useConfig } from "../context/ConfigContext";
import { toast } from "react-toastify";
import ChequeForm from "../components/ChequeForm"; // ✅ para editar

export default function Cheques() {
  const { config } = useConfig();
  const [cheques, setCheques] = useState<any[]>([]);
  const [filteredCheques, setFilteredCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  // 🔹 Acciones / modales
  const [selectedCheque, setSelectedCheque] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModal, setShowModal] = useState(false); // ChequeForm

  // ✅ Verificación de contraseña (igual que en Home)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [accionSeleccionada, setAccionSeleccionada] = useState<"editar" | "eliminar" | null>(null);
  const [chequeSeleccionado, setChequeSeleccionado] = useState<any>(null);

  const fetchCheques = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cheques");
      setCheques(res.data);
      setFilteredCheques(res.data);
    } catch (error) {
      console.error("Error al obtener cheques:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheques();
  }, []);

  // 🔍 Filtro de búsqueda y estado
  useEffect(() => {
    let result = cheques.filter((c) =>
      [c.numero, c.banco, c.beneficiario].some((field) =>
        field?.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
    if (estadoFiltro !== "todos") {
      result = result.filter((c) => c.estado === estadoFiltro);
    }
    setFilteredCheques(result);
  }, [search, estadoFiltro, cheques]);

  // 💰 Formato de moneda dinámico según configuración
  const formatCurrency = (value: number) =>
    value.toLocaleString(config.idioma === "en" ? "en-US" : "es-DO", {
      style: "currency",
      currency: config.moneda || "DOP",
      minimumFractionDigits: 2,
    });

  // 📅 Formato de fecha según configuración
  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    if (config.fechaFormato === "MM/DD/YYYY") {
      return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
        .getDate()
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
    }
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  // 🏷️ Badges de estado
  const getBadge = (estado: string) => {
    const map: Record<string, string> = {
      pendiente: "warning",
      cobrado: "success",
      devuelto: "secondary",
    };
    return <Badge bg={map[estado] || "dark"}>{estado.toUpperCase()}</Badge>;
  };

  // 🔹 Ver Detalles
  const handleViewDetails = (cheque: any) => {
    setSelectedCheque(cheque);
    setShowDetailsModal(true);
  };

  // ✅ Flujo Editar / Eliminar con contraseña (igual que Home)
  const solicitarPasswordYAccion = (accion: "editar" | "eliminar", cheque: any) => {
    setAccionSeleccionada(accion);
    setChequeSeleccionado(cheque);
    setShowPasswordModal(true);
  };

  const verificarPassword = async () => {
    try {
      // Buscar token como en Home
      const storedUser = localStorage.getItem("user");
      const token = storedUser ? JSON.parse(storedUser).token : null;

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
        const c = chequeSeleccionado;

        if (accionSeleccionada === "editar") {
          setSelectedCheque(c);
          setShowModal(true); // abre ChequeForm
        }

        if (accionSeleccionada === "eliminar") {
          // 🗑️ SOFT DELETE -> mover a Eliminados
          if (confirm("¿Desea mover este cheque a 'Eliminados'?")) {
            await api.delete(`/cheques/${c._id}`); // <- SOFT DELETE
            fetchCheques();
            toast.warn("🗑️ Cheque movido a eliminados.", {
              style: { background: "linear-gradient(135deg, #2b2b2b, #444)" },
            });
          }
        }

        setPasswordInput("");
        toast.success("🔐 Contraseña verificada correctamente.", {
          style: { background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)", color: "#e6e6e6" },
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Contraseña incorrecta");
    }
  };

  // 🔹 Totales
  const totalPendientes = cheques.filter((c) => c.estado === "pendiente");
  const totalCobrados = cheques.filter((c) => c.estado === "cobrado");
  const totalDevueltos = cheques.filter((c) => c.estado === "devuelto");

  const sum = (arr: any[]) => arr.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

  return (
    <div className="p-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3
          className="fw-bold"
          style={{
            background: "linear-gradient(135deg, #222, #555)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📋 {config.idioma === "en" ? "Check Management" : "Gestión de Cheques"}
        </h3>
        <Button
          variant="dark"
          size="sm"
          className="fw-bold border-0 d-flex align-items-center gap-2"
          onClick={fetchCheques}
          style={{
            background: `linear-gradient(135deg, var(--color-principal), #3a3a3a)`,
            borderRadius: "10px",
          }}
        >
          <FaSyncAlt /> {config.idioma === "en" ? "Refresh" : "Actualizar"}
        </Button>
      </div>

      {/* 🔍 BUSCADOR */}
      <InputGroup className="mb-4 shadow-sm">
        <InputGroup.Text className="bg-dark text-white border-0">
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          placeholder={
            config.idioma === "en"
              ? "Search by number, bank or beneficiary..."
              : "Buscar por número, banco o beneficiario..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Form.Select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          style={{ maxWidth: "180px" }}
        >
          <option value="todos">{config.idioma === "en" ? "All" : "Todos"}</option>
          <option value="pendiente">{config.idioma === "en" ? "Pending" : "Pendientes"}</option>
          <option value="cobrado">{config.idioma === "en" ? "Paid" : "Cobrados"}</option>
          <option value="devuelto">{config.idioma === "en" ? "Returned" : "Devueltos"}</option>
        </Form.Select>
      </InputGroup>

      {/* RESUMEN */}
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
        {[
          {
            label: config.idioma === "en" ? "Pending" : "Pendientes",
            value: totalPendientes.length,
            monto: sum(totalPendientes),
            icon: <FaExclamationCircle size={22} />,
            color: "warning",
          },
          {
            label: config.idioma === "en" ? "Paid" : "Cobrados",
            value: totalCobrados.length,
            monto: sum(totalCobrados),
            icon: <FaMoneyBillWave size={22} />,
            color: "success",
          },
          {
            label: config.idioma === "en" ? "Returned" : "Devueltos",
            value: totalDevueltos.length,
            monto: sum(totalDevueltos),
            icon: <FaUndoAlt size={22} />,
            color: "secondary",
          },
        ].map((item, i) => (
          <Card
            key={i}
            className="text-center border-0 shadow-sm flex-grow-1"
            style={{
              minWidth: "200px",
              background: `linear-gradient(145deg, var(--bs-${item.color}) 20%, var(--color-principal))`,
              color: item.color === "warning" ? "#000" : "#fff",
              borderRadius: "12px",
            }}
          >
            <Card.Body>
              <div className="d-flex justify-content-center mb-2">{item.icon}</div>
              <h5 className="fw-bold mb-0">{item.label}</h5>
              <p className="mb-1">{item.value} cheques</p>
              <small className="fw-semibold">{formatCurrency(item.monto)}</small>
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
          {config.idioma === "en" ? "No checks registered yet." : "No hay cheques registrados aún."}
        </p>
      ) : (
        <div
          className="table-responsive shadow-sm rounded-4 border p-2"
          style={{ background: "var(--color-card)", color: "var(--color-texto)" }}
        >
          <Table hover className="align-middle mb-0">
            <thead
              className="text-white"
              style={{ background: `linear-gradient(135deg, var(--color-principal), #3a3a3a)` }}
            >
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>No. Cheque</th>
                <th>Banco</th>
                <th>Beneficiario</th>
                <th>Monto</th>
                <th>Estado</th>
                {config.columnas.fechaCheque && (
                  <th>{config.idioma === "en" ? "Check Date" : "Fecha Cheque"}</th>
                )}
                {config.columnas.fechaDeposito && (
                  <th>{config.idioma === "en" ? "Deposit Date" : "Fecha Depósito"}</th>
                )}
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCheques.map((c, index) => (
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
                  <td>{getBadge(c.estado)}</td>
                  {config.columnas.fechaCheque && <td>{formatDate(c.fechaCheque)}</td>}
                  {config.columnas.fechaDeposito && <td>{formatDate(c.fechaDeposito)}</td>}
                  <td className="text-center">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="dark"
                        size="sm"
                        style={{ background: "linear-gradient(135deg, #333, #555)", border: "none" }}
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
                        <Dropdown.Item
                          onClick={() => solicitarPasswordYAccion("editar", c)}
                          className="text-info fw-semibold"
                        >
                          Editar
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => solicitarPasswordYAccion("eliminar", c)}
                          className="text-danger fw-semibold"
                        >
                          Eliminar
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* MODAL DETALLES */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
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
              <p><strong>Fecha Cheque:</strong> {formatDate(selectedCheque.fechaCheque)}</p>
              <p><strong>Fecha Depósito:</strong> {formatDate(selectedCheque.fechaDeposito)}</p>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* ✅ CHEQUE FORM (editar) */}
      <ChequeForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        cheque={selectedCheque}
        onSaved={fetchCheques}
      />

      {/* ✅ MODAL CONTRASEÑA */}
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
