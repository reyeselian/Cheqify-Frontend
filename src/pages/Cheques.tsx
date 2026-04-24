import { useEffect, useState } from "react";
import {
  Table, Spinner, Badge, Card, Button,
  Form, InputGroup, Dropdown, Modal,
} from "react-bootstrap";
import { api } from "../services/api";
import {
  FaSyncAlt, FaMoneyBillWave, FaUndoAlt,
  FaExclamationCircle, FaSearch, FaEllipsisV, FaCalendarAlt,
} from "react-icons/fa";
import { useConfig } from "../context/ConfigContext";
import { toast } from "react-toastify";
import ChequeForm from "../components/ChequeForm";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function Cheques() {
  const { config } = useConfig();
  const [cheques, setCheques]                 = useState<any[]>([]);
  const [filteredCheques, setFilteredCheques] = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [estadoFiltro, setEstadoFiltro]       = useState("todos");

  const [selectedCheque, setSelectedCheque]     = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModal, setShowModal]               = useState(false);
  const [showCalendar, setShowCalendar]         = useState(false);
  const [calendarDate, setCalendarDate]         = useState<Date>(new Date());
  const [chequesDelDia, setChequesDelDia]       = useState<any[]>([]);

  const [showPasswordModal, setShowPasswordModal]     = useState(false);
  const [passwordInput, setPasswordInput]             = useState("");
  const [accionSeleccionada, setAccionSeleccionada]   = useState<"editar" | "eliminar" | null>(null);
  const [chequeSeleccionado, setChequeSeleccionado]   = useState<any>(null);

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

  useEffect(() => { fetchCheques(); }, []);

  useEffect(() => {
    let result = cheques.filter((c) =>
      [c.numero, c.banco, c.beneficiario].some((field) =>
        field?.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
    if (estadoFiltro !== "todos") result = result.filter((c) => c.estado === estadoFiltro);
    setFilteredCheques(result);
  }, [search, estadoFiltro, cheques]);

  // Obtener cheques pendientes por fecha de depósito
  const getFechaDeposito = (cheque: any): string => {
    if (!cheque.fechaDeposito) return "";
    return cheque.fechaDeposito.slice(0, 10); // YYYY-MM-DD
  };

  // Fechas con cheques pendientes
  const fechasConCheques = new Set(
    cheques
      .filter((c) => c.estado === "pendiente" && c.fechaDeposito)
      .map(getFechaDeposito)
  );

  // Al hacer click en un día del calendario
  const handleDayClick = (date: Date) => {
    setCalendarDate(date);
    const yyyy = date.getFullYear();
    const mm   = String(date.getMonth() + 1).padStart(2, "0");
    const dd   = String(date.getDate()).padStart(2, "0");
    const key  = `${yyyy}-${mm}-${dd}`;
    const del  = cheques.filter(
      (c) => c.estado === "pendiente" && getFechaDeposito(c) === key
    );
    setChequesDelDia(del);
  };

  // Marcar días con cheques en el calendario
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    const yyyy = date.getFullYear();
    const mm   = String(date.getMonth() + 1).padStart(2, "0");
    const dd   = String(date.getDate()).padStart(2, "0");
    const key  = `${yyyy}-${mm}-${dd}`;
    if (!fechasConCheques.has(key)) return null;
    const count = cheques.filter(
      (c) => c.estado === "pendiente" && getFechaDeposito(c) === key
    ).length;
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "2px" }}>
        <span style={{
          background: "#dc3545", color: "#fff", borderRadius: "50%",
          width: "18px", height: "18px", fontSize: "0.65rem", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{count}</span>
      </div>
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";
    const yyyy = date.getFullYear();
    const mm   = String(date.getMonth() + 1).padStart(2, "0");
    const dd   = String(date.getDate()).padStart(2, "0");
    const key  = `${yyyy}-${mm}-${dd}`;
    return fechasConCheques.has(key) ? "dia-con-cheque" : "";
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString(config.idioma === "en" ? "en-US" : "es-DO", {
      style: "currency", currency: config.moneda || "DOP", minimumFractionDigits: 2,
    });

  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    if (config.fechaFormato === "MM/DD/YYYY") {
      return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d.getFullYear()}`;
    }
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  const getBadge = (estado: string) => {
    const map: Record<string, string> = { pendiente: "warning", cobrado: "success", devuelto: "secondary" };
    return <Badge bg={map[estado] || "dark"}>{estado.toUpperCase()}</Badge>;
  };

  const marcarCobrado = async (cheque: any) => {
    if (cheque.estado !== "pendiente") {
      toast.info("Solo los cheques pendientes pueden marcarse como cobrado.", {
        style: { background: "#2b2b2b", color: "#fff" },
      });
      return;
    }
    try {
      await api.put(`/cheques/${cheque._id}`, { estado: "cobrado" });
      fetchCheques();
      toast.success("💰 Cheque marcado como cobrado.", {
        style: { background: "#1f1f1f", color: "#fff" },
      });
    } catch {
      toast.error("Error al actualizar el estado del cheque.");
    }
  };

  const handleViewDetails = (cheque: any) => {
    setSelectedCheque(cheque);
    setShowDetailsModal(true);
  };

  const solicitarPasswordYAccion = (accion: "editar" | "eliminar", cheque: any) => {
    setAccionSeleccionada(accion);
    setChequeSeleccionado(cheque);
    setShowPasswordModal(true);
  };

  const verificarPassword = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = storedUser ? JSON.parse(storedUser).token : null;
      if (!token) { toast.error("⚠️ Sesión expirada, vuelve a iniciar sesión."); return; }

      const res = await api.post("/auth/verify-password", { password: passwordInput }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setShowPasswordModal(false);
        const c = chequeSeleccionado;
        if (accionSeleccionada === "editar") { setSelectedCheque(c); setShowModal(true); }
        if (accionSeleccionada === "eliminar") {
          if (confirm("¿Desea mover este cheque a 'Eliminados'?")) {
            await api.delete(`/cheques/${c._id}`);
            fetchCheques();
            toast.warn("🗑️ Cheque movido a eliminados.", { style: { background: "linear-gradient(135deg, #2b2b2b, #444)" } });
          }
        }
        setPasswordInput("");
        toast.success("🔐 Contraseña verificada correctamente.", { style: { background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)", color: "#e6e6e6" } });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Contraseña incorrecta");
    }
  };

  const totalPendientes = cheques.filter((c) => c.estado === "pendiente");
  const totalCobrados   = cheques.filter((c) => c.estado === "cobrado");
  const totalDevueltos  = cheques.filter((c) => c.estado === "devuelto");
  const sum = (arr: any[]) => arr.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

  return (
    <div className="p-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="fw-bold" style={{ background: "linear-gradient(135deg, #222, #555)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          📋 {config.idioma === "en" ? "Check Management" : "Gestión de Cheques"}
        </h3>
        <div className="d-flex gap-2">
          <Button
            size="sm"
            className="fw-bold border-0 d-flex align-items-center gap-2"
            onClick={() => { setChequesDelDia([]); setShowCalendar(true); }}
            style={{ background: "linear-gradient(135deg, #0d6efd, #0a58ca)", borderRadius: "10px" }}
          >
            <FaCalendarAlt /> Calendario de Cheques
          </Button>
          <Button
            variant="dark" size="sm"
            className="fw-bold border-0 d-flex align-items-center gap-2"
            onClick={fetchCheques}
            style={{ background: `linear-gradient(135deg, var(--color-principal), #3a3a3a)`, borderRadius: "10px" }}
          >
            <FaSyncAlt /> {config.idioma === "en" ? "Refresh" : "Actualizar"}
          </Button>
        </div>
      </div>

      {/* BUSCADOR */}
      <InputGroup className="mb-4 shadow-sm">
        <InputGroup.Text className="bg-dark text-white border-0"><FaSearch /></InputGroup.Text>
        <Form.Control
          placeholder={config.idioma === "en" ? "Search by number, bank or beneficiary..." : "Buscar por número, banco o beneficiario..."}
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <Form.Select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)} style={{ maxWidth: "180px" }}>
          <option value="todos">{config.idioma === "en" ? "All" : "Todos"}</option>
          <option value="pendiente">{config.idioma === "en" ? "Pending" : "Pendientes"}</option>
          <option value="cobrado">{config.idioma === "en" ? "Paid" : "Cobrados"}</option>
          <option value="devuelto">{config.idioma === "en" ? "Returned" : "Devueltos"}</option>
        </Form.Select>
      </InputGroup>

      {/* RESUMEN */}
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
        {[
          { label: config.idioma === "en" ? "Pending" : "Pendientes", value: totalPendientes.length, monto: sum(totalPendientes), icon: <FaExclamationCircle size={22} />, color: "warning" },
          { label: config.idioma === "en" ? "Paid"    : "Cobrados",   value: totalCobrados.length,   monto: sum(totalCobrados),   icon: <FaMoneyBillWave size={22} />,    color: "success" },
          { label: config.idioma === "en" ? "Returned": "Devueltos",  value: totalDevueltos.length,  monto: sum(totalDevueltos),  icon: <FaUndoAlt size={22} />,          color: "secondary" },
        ].map((item, i) => (
          <Card key={i} className="text-center border-0 shadow-sm flex-grow-1"
            style={{ minWidth: "200px", background: `linear-gradient(145deg, var(--bs-${item.color}) 20%, var(--color-principal))`, color: item.color === "warning" ? "#000" : "#fff", borderRadius: "12px" }}>
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
        <div className="text-center mt-5"><Spinner animation="border" variant="dark" /></div>
      ) : filteredCheques.length === 0 ? (
        <p className="text-center text-muted mt-5">
          {config.idioma === "en" ? "No checks registered yet." : "No hay cheques registrados aún."}
        </p>
      ) : (
        <div className="table-responsive shadow-sm rounded-4 border p-2" style={{ background: "var(--color-card)", color: "var(--color-texto)" }}>
          <Table hover className="align-middle mb-0">
            <thead className="text-white" style={{ background: `linear-gradient(135deg, var(--color-principal), #3a3a3a)` }}>
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>No. Cheque</th>
                <th>Banco</th>
                <th>Beneficiario</th>
                <th>Monto</th>
                <th>Estado</th>
                {config.columnas.fechaCheque   && <th>{config.idioma === "en" ? "Check Date"   : "Fecha Cheque"}</th>}
                {config.columnas.fechaDeposito && <th>{config.idioma === "en" ? "Deposit Date" : "Fecha Depósito"}</th>}
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
                  {config.columnas.fechaCheque   && <td>{formatDate(c.fechaCheque)}</td>}
                  {config.columnas.fechaDeposito && <td>{formatDate(c.fechaDeposito)}</td>}
                  <td className="text-center d-flex justify-content-center align-items-center gap-2">
                    <Button
                      size="sm" className="rounded-circle border-0"
                      title={c.estado === "pendiente" ? "Marcar como cobrado" : ""}
                      onClick={() => marcarCobrado(c)}
                      style={{
                        width: "30px", height: "30px",
                        background: c.estado === "cobrado"
                          ? "linear-gradient(145deg, #198754, #2ecc71)"
                          : "linear-gradient(145deg, #6c757d, #adb5bd)",
                        color: "#fff",
                      }}
                    >✓</Button>
                    <Dropdown>
                      <Dropdown.Toggle variant="dark" size="sm" style={{ background: "linear-gradient(135deg, #333, #555)", border: "none" }}>
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleViewDetails(c)} className="text-primary fw-semibold">Ver Detalles</Dropdown.Item>
                        <Dropdown.Item onClick={() => solicitarPasswordYAccion("editar", c)} className="text-info fw-semibold">Editar</Dropdown.Item>
                        <Dropdown.Item onClick={() => solicitarPasswordYAccion("eliminar", c)} className="text-danger fw-semibold">Eliminar</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* ── MODAL CALENDARIO ─────────────────────────────── */}
      <Modal show={showCalendar} onHide={() => setShowCalendar(false)} centered size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title><FaCalendarAlt className="me-2" />Calendario de Cheques</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#f8fafc" }}>
          <div className="d-flex flex-wrap gap-3">
            {/* Calendario */}
            <div style={{ flex: "1 1 320px" }}>
              <style>{`
                .react-calendar { width: 100%; border: none; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); font-family: inherit; }
                .react-calendar__tile { padding: 10px 4px; }
                .react-calendar__tile--active { background: #0d6efd !important; border-radius: 8px; }
                .react-calendar__tile:hover { background: #e9f0ff !important; border-radius: 8px; }
                .dia-con-cheque { background: #fff3cd !important; border-radius: 8px; font-weight: 700; }
                .react-calendar__navigation button { font-size: 1rem; font-weight: 600; }
              `}</style>
              <Calendar
                onChange={(val) => handleDayClick(val as Date)}
                value={calendarDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                locale="es-DO"
              />
              <div className="mt-3 d-flex align-items-center gap-2" style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                <span style={{ background: "#fff3cd", border: "1px solid #fde68a", borderRadius: "4px", padding: "2px 8px", fontWeight: 600 }}>Amarillo</span> = días con cheques pendientes
                &nbsp;·&nbsp;
                <span style={{ background: "#dc3545", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700 }}>N</span> = cantidad
              </div>
            </div>

            {/* Panel lateral de cheques del día */}
            <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1d23", marginBottom: "0.75rem" }}>
                {chequesDelDia.length > 0
                  ? `📅 ${calendarDate.toLocaleDateString("es-DO", { weekday: "long", day: "2-digit", month: "long" })}`
                  : "Selecciona un día del calendario"}
              </div>

              {chequesDelDia.length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", marginTop: "2rem" }}>
                  {fechasConCheques.size === 0
                    ? "No hay cheques pendientes."
                    : "No hay cheques para depositar este día."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {chequesDelDia.map((c) => (
                    <div key={c._id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>#{c.numero}</span>
                        <span style={{ background: "#fff3cd", color: "#92400e", fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: "20px" }}>PENDIENTE</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#475569" }}>{c.banco}</div>
                      <div style={{ fontSize: "0.8rem", color: "#475569" }}>{c.beneficiario}</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#059669", marginTop: "4px" }}>
                        {formatCurrency(Number(c.monto))}
                      </div>
                    </div>
                  ))}
                  <div style={{ background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "8px 12px", fontSize: "0.82rem", fontWeight: 700, color: "#059669", textAlign: "right" }}>
                    Total: {formatCurrency(chequesDelDia.reduce((a, c) => a + Number(c.monto), 0))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCalendar(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

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

      <ChequeForm show={showModal} handleClose={() => setShowModal(false)} cheque={selectedCheque} onSaved={fetchCheques} />

      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contraseña Administrador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="password" className="form-control" placeholder="Ingrese la contraseña"
            value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
          <Button variant="dark" onClick={verificarPassword}>Aceptar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}