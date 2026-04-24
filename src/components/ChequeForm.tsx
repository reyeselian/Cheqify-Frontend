import { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import { toast } from "react-toastify";
import { api } from "../services/api";

interface Props {
  show: boolean;
  handleClose: () => void;
  cheque?: any;
  onSaved: () => void;
}

const BANCOS_RD = [
  "Banco Popular Dominicano",
  "Banco de Reservas",
  "Banco BHD León",
  "Scotiabank",
  "Banco Santa Cruz",
  "Banco Caribe",
  "Banco Promerica",
  "Banco Vimenca",
  "Banco López de Haro",
  "Asociación Popular de Ahorros y Préstamos",
  "Asociación Cibao de Ahorros y Préstamos",
  "Asociación La Nacional de Ahorros y Préstamos",
  "Banco Lafise",
  "Citibank",
  "Banco Activo",
  "Bancamérica",
];

const formatDateForInput = (date: string | Date | undefined): string => {
  if (!date) return "";
  if (typeof date === "string") return date.slice(0, 10);
  const d = date as Date;
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day   = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calcularCorbata = (fechaDeposito: string): number => {
  if (!fechaDeposito) return 0;
  const [year, month, day] = fechaDeposito.split("-").map(Number);
  const hoy           = new Date();
  const hoyLocal      = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const depositoLocal = new Date(year, month - 1, day);
  const diff = Math.round((depositoLocal.getTime() - hoyLocal.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

// ── Selector de banco con búsqueda ─────────────────────────────
function BancoSelector({
  value, onChange,
}: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState("");
  const [bancos, setBancos]     = useState(BANCOS_RD);
  const [addMode, setAddMode]   = useState(false);
  const [newBanco, setNewBanco] = useState("");
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setAddMode(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = bancos.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (banco: string) => {
    onChange(banco);
    setOpen(false);
    setSearch("");
    setAddMode(false);
  };

  const handleAdd = () => {
    const trimmed = newBanco.trim();
    if (!trimmed) return;
    if (!bancos.includes(trimmed)) setBancos([...bancos, trimmed].sort());
    onChange(trimmed);
    setNewBanco("");
    setAddMode(false);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* Campo visible */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#fff", border: "1px solid #dee2e6", borderRadius: "6px",
          padding: "6px 12px", cursor: "pointer", fontSize: "0.9rem",
          color: value ? "#212529" : "#adb5bd", minHeight: "38px",
          userSelect: "none",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "Seleccionar banco..."}
        </span>
        <span style={{ color: "#6c757d", fontSize: "0.7rem", marginLeft: "8px" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #dee2e6", borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9999,
          overflow: "hidden",
        }}>
          {/* Búsqueda */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar banco..."
              style={{
                flex: 1, border: "1px solid #dee2e6", borderRadius: "6px",
                padding: "5px 10px", fontSize: "0.85rem", outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0d6efd")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#dee2e6")}
            />
            <button
              type="button"
              title="Agregar banco personalizado"
              onClick={() => { setAddMode(!addMode); setSearch(""); }}
              style={{
                background: addMode ? "#0d6efd" : "#f8f9fa",
                border: "1px solid #dee2e6", borderRadius: "6px",
                padding: "4px 10px", cursor: "pointer", fontSize: "0.85rem",
                color: addMode ? "#fff" : "#495057", fontWeight: 600,
                whiteSpace: "nowrap", transition: "all 0.15s",
              }}
            >
              + Otro
            </button>
          </div>

          {/* Agregar banco nuevo */}
          {addMode && (
            <div style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: "6px" }}>
              <input
                autoFocus
                value={newBanco}
                onChange={(e) => setNewBanco(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Nombre del banco..."
                style={{
                  flex: 1, border: "1px solid #0d6efd", borderRadius: "6px",
                  padding: "5px 10px", fontSize: "0.85rem", outline: "none", fontFamily: "inherit",
                }}
              />
              <button
                type="button" onClick={handleAdd}
                style={{
                  background: "linear-gradient(135deg,#198754,#28a745)", border: "none",
                  borderRadius: "6px", padding: "4px 12px", cursor: "pointer",
                  color: "#fff", fontWeight: 700, fontSize: "0.85rem",
                }}
              >
                ✓
              </button>
            </div>
          )}

          {/* Lista */}
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "12px 14px", color: "#94a3b8", fontSize: "0.85rem", textAlign: "center" }}>
                No se encontró ese banco. Usa "+ Otro" para agregarlo.
              </div>
            ) : (
              filtered.map((banco) => (
                <div
                  key={banco}
                  onClick={() => handleSelect(banco)}
                  style={{
                    padding: "9px 14px", cursor: "pointer", fontSize: "0.88rem",
                    color: banco === value ? "#0d6efd" : "#212529",
                    background: banco === value ? "#f0f7ff" : "transparent",
                    fontWeight: banco === value ? 600 : 400,
                    borderBottom: "1px solid #f8fafc",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (banco !== value) e.currentTarget.style.background = "#f8f9fa"; }}
                  onMouseLeave={(e) => { if (banco !== value) e.currentTarget.style.background = "transparent"; }}
                >
                  {banco}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────
export default function ChequeForm({ show, handleClose, cheque, onSaved }: Props) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    numero: "", banco: "", beneficiario: "", monto: "",
    estado: "pendiente", corbata: 0, firmadoPor: "", notas: "",
    fechaDeposito: "", usuario: user._id || "", company: user.empresa || "",
  });

  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cheque) {
      const fechaDeposito = formatDateForInput(cheque.fechaDeposito);
      setForm({
        numero: cheque.numero || "", banco: cheque.banco || "",
        beneficiario: cheque.beneficiario || "", monto: cheque.monto || "",
        estado: cheque.estado || "pendiente",
        corbata: calcularCorbata(fechaDeposito),
        firmadoPor: cheque.firmadoPor || "", notas: cheque.notas || "",
        fechaDeposito, usuario: user._id || "", company: user.company || "",
      });
      setPreview(cheque.imagen || null);
    } else {
      setForm({
        numero: "", banco: "", beneficiario: "", monto: "",
        estado: "pendiente", corbata: 0, firmadoPor: "", notas: "",
        fechaDeposito: "", usuario: user._id || "", company: user.empresa || "",
      });
      setPreview(null);
      setImagen(null);
    }
  }, [cheque]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "fechaDeposito") {
      setForm({ ...form, fechaDeposito: value, corbata: calcularCorbata(value) });
    } else {
      setForm({ ...form, [name]: name === "corbata" ? Number(value) : value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!cheque) {
      const blockedStatuses = ["trial_expired", "payment_required", "blocked"];
      if (blockedStatuses.includes(user.status)) {
        toast.error("⛔ No puedes agregar nuevos cheques. Actualiza tu plan.");
        setLoading(false); return;
      }
    }

    if (!form.numero.toString().trim())         { toast.error("El número de cheque es obligatorio."); setLoading(false); return; }
    if (!form.banco.toString().trim())          { toast.error("El banco es obligatorio.");            setLoading(false); return; }
    if (!form.beneficiario.toString().trim())   { toast.error("El beneficiario es obligatorio.");     setLoading(false); return; }
    if (!form.monto || Number(form.monto) <= 0) { toast.error("El monto debe ser mayor a 0.");        setLoading(false); return; }
    if (!form.fechaDeposito)                    { toast.error("La fecha de depósito es obligatoria.");setLoading(false); return; }
    if (!form.firmadoPor.toString().trim())     { toast.error("El campo Firmado por es obligatorio.");setLoading(false); return; }
    if (!form.notas.toString().trim())          { toast.error("El concepto es obligatorio.");         setLoading(false); return; }

    try {
      const checkDuplicate = await api.get("/cheques");
      const duplicado = checkDuplicate.data.find(
        (c: any) => c.numero === form.numero && (!cheque || c._id !== cheque._id)
      );
      if (duplicado) { toast.warning("⚠️ Ya existe un cheque con ese número."); setLoading(false); return; }
    } catch { toast.error("Error verificando número de cheque."); }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "fechaDeposito" && value) {
        formData.append(key, `${value}T12:00:00.000Z`);
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    formData.set("usuario", user._id);
    formData.set("company", user.company);
    if (imagen) formData.append("imagen", imagen);

    try {
      if (cheque) {
        await api.put(`/cheques/${cheque._id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("💾 Cheque actualizado correctamente.", { style: { background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)", color: "#e6e6e6" } });
      } else {
        await api.post("/cheques", formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("✅ Cheque registrado exitosamente.", { style: { background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)", color: "#e6e6e6" } });
      }
      onSaved();
      handleClose();
    } catch (error) {
      console.error("Error guardando cheque:", error);
      toast.error("❌ Error al guardar el cheque.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Form onSubmit={handleSubmit} className="p-3">
        <Modal.Header closeButton className="bg-dark text-white rounded-top-3">
          <Modal.Title>{cheque ? "✏️ Editar Cheque" : "➕ Nuevo Cheque"}</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ background: "linear-gradient(145deg, #f8f9fa, #fff)" }}>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Número</Form.Label>
                <Form.Control name="numero" value={form.numero} onChange={handleChange} placeholder="Ej: 001245" required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Banco</Form.Label>
                <BancoSelector value={form.banco} onChange={(val) => setForm({ ...form, banco: val })} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Beneficiario</Form.Label>
                <Form.Control name="beneficiario" value={form.beneficiario} onChange={handleChange} placeholder="A nombre de..." required />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={cheque ? 3 : 4}>
              <Form.Group>
                <Form.Label>Monto</Form.Label>
                <Form.Control type="number" step="0.01" min="0" name="monto" value={form.monto} onChange={handleChange} placeholder="0.00" required />
              </Form.Group>
            </Col>
            <Col md={cheque ? 3 : 4}>
              <Form.Group>
                <Form.Label>Fecha de Depósito</Form.Label>
                <Form.Control type="date" name="fechaDeposito" value={form.fechaDeposito} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={cheque ? 3 : 4}>
              <Form.Group>
                <Form.Label>Días de Corbata</Form.Label>
                <Form.Control
                  type="number" name="corbata" value={form.corbata} readOnly
                  style={{ background: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }}
                />
                <Form.Text className="text-muted" style={{ fontSize: "0.72rem" }}>
                  Se calcula automáticamente
                </Form.Text>
              </Form.Group>
            </Col>
            {cheque && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select name="estado" value={form.estado} onChange={handleChange}>
                    <option value="pendiente">Pendiente</option>
                    <option value="cobrado">Cobrado</option>
                    <option value="devuelto">Devuelto</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Firmado por</Form.Label>
                <Form.Control name="firmadoPor" value={form.firmadoPor} onChange={handleChange} placeholder="Ej: Juan Pérez" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Concepto</Form.Label>
                <Form.Control as="textarea" rows={2} name="notas" value={form.notas} onChange={handleChange} placeholder="Comentarios o detalles del cheque" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Imagen del Cheque (opcional)</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              </Form.Group>
              {preview && (
                <div className="mt-3 text-center">
                  <Image src={preview} alt="Vista previa del cheque" fluid rounded
                    style={{ maxHeight: "220px", objectFit: "contain", border: "2px solid #ccc", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                  />
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer
          className="d-flex justify-content-between"
          style={{ background: "linear-gradient(135deg, #1a1a1a, #333, #1f1f1f)", borderTop: "1px solid #555" }}
        >
          <Button variant="secondary" onClick={handleClose}
            style={{ border: "none", background: "linear-gradient(145deg, #6c757d, #adb5bd)", color: "#fff", fontWeight: "bold" }}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}
            style={{ background: "linear-gradient(145deg, #198754, #28a745)", border: "none", color: "#fff", fontWeight: "bold", boxShadow: "0 4px 10px rgba(40,167,69,0.4)" }}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}