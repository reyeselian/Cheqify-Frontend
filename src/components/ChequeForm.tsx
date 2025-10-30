import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import { toast } from "react-toastify";
import { api } from "../services/api";

interface Props {
  show: boolean;
  handleClose: () => void;
  cheque?: any;
  onSaved: () => void;
}

const formatDateForInput = (date: string | Date | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

export default function ChequeForm({ show, handleClose, cheque, onSaved }: Props) {
  const [form, setForm] = useState({
    numero: "",
    banco: "",
    beneficiario: "",
    monto: "",
    estado: "pendiente",
    corbata: 0,
    firmadoPor: "",
    notas: "",
    fechaCheque: "",
    fechaDeposito: "",
  });

  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cheque) {
      setForm({
        numero: cheque.numero || "",
        banco: cheque.banco || "",
        beneficiario: cheque.beneficiario || "",
        monto: cheque.monto || "",
        estado: cheque.estado || "pendiente",
        corbata: cheque.corbata || 0,
        firmadoPor: cheque.firmadoPor || "",
        notas: cheque.notas || "",
        fechaCheque: formatDateForInput(cheque.fechaCheque || cheque.fechaEmision),
        fechaDeposito: formatDateForInput(cheque.fechaDeposito),
      });
      setPreview(cheque.imagen || null);
    } else {
      setForm({
        numero: "",
        banco: "",
        beneficiario: "",
        monto: "",
        estado: "pendiente",
        corbata: 0,
        firmadoPor: "",
        notas: "",
        fechaCheque: "",
        fechaDeposito: "",
      });
      setPreview(null);
      setImagen(null);
    }
  }, [cheque]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "monto" || name === "corbata" ? Number(value) : value,
    });
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

    // Validar campos requeridos
    if (!form.numero || !form.banco || !form.beneficiario || !form.monto || !form.fechaCheque) {
      toast.error("Por favor completa todos los campos requeridos.");
      setLoading(false);
      return;
    }

    // Verificar duplicados
    try {
      const checkDuplicate = await api.get("/cheques");
      const duplicado = checkDuplicate.data.find(
        (c: any) =>
          c.numero === form.numero &&
          (!cheque || c._id !== cheque._id)
      );

      if (duplicado) {
        toast.warning("⚠️ Ya existe un cheque con ese número.");
        setLoading(false);
        return;
      }
    } catch {
      toast.error("Error verificando número de cheque.");
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        formData.append(key, String(value));
    });

    if (imagen) formData.append("imagen", imagen);

    try {
      if (cheque) {
        await api.put(`/cheques/${cheque._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("💾 Cheque actualizado correctamente.", {
          style: {
            background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)",
            color: "#e6e6e6",
          },
        });
      } else {
        await api.post("/cheques", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("✅ Cheque registrado exitosamente.", {
          style: {
            background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)",
            color: "#e6e6e6",
          },
        });
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
          <Modal.Title>
            {cheque ? "✏️ Editar Cheque" : "➕ Nuevo Cheque"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ background: "linear-gradient(145deg, #f8f9fa, #fff)" }}>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Número</Form.Label>
                <Form.Control
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="Ej: 001245"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Banco</Form.Label>
                <Form.Control
                  name="banco"
                  value={form.banco}
                  onChange={handleChange}
                  placeholder="Nombre del banco"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Beneficiario</Form.Label>
                <Form.Control
                  name="beneficiario"
                  value={form.beneficiario}
                  onChange={handleChange}
                  placeholder="A nombre de..."
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="number"
                  name="monto"
                  value={form.monto}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="cobrado">Cobrado</option>
                  <option value="devuelto">Devuelto</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Corbata (días)</Form.Label>
                <Form.Control
                  type="number"
                  name="corbata"
                  value={form.corbata}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha del Cheque</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaCheque"
                  value={form.fechaCheque}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha de Depósito</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaDeposito"
                  value={form.fechaDeposito}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Firmado por</Form.Label>
                <Form.Control
                  name="firmadoPor"
                  value={form.firmadoPor}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Concepto</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notas"
                  value={form.notas}
                  onChange={handleChange}
                  placeholder="Comentarios o detalles del cheque"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Subida de imagen */}
          <Row className="mt-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Imagen del Cheque (opcional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Form.Group>
              {preview && (
                <div className="mt-3 text-center">
                  <Image
                    src={preview}
                    alt="Vista previa del cheque"
                    fluid
                    rounded
                    style={{
                      maxHeight: "220px",
                      objectFit: "contain",
                      border: "2px solid #ccc",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer
          className="d-flex justify-content-between"
          style={{
            background: "linear-gradient(135deg, #1a1a1a, #333, #1f1f1f)",
            borderTop: "1px solid #555",
          }}
        >
          <Button
            variant="secondary"
            onClick={handleClose}
            style={{
              border: "none",
              background: "linear-gradient(145deg, #6c757d, #adb5bd)",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(145deg, #1a1a1a, #3c3c3c)",
              border: "none",
              color: "#fff",
              fontWeight: "bold",
              boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
            }}
          >
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
