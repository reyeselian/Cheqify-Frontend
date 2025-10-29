import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import { api } from "../services/api";

interface Props {
  show: boolean;
  handleClose: () => void;
  cheque?: any;
  onSaved: () => void;
}

// Convierte cualquier fecha a YYYY-MM-DD para el input type="date"
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

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        formData.append(key, String(value));
    });

    if (imagen) {
      formData.append("imagen", imagen);
    }

    try {
      if (cheque) {
        await api.put(`/cheques/${cheque._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/cheques", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSaved();
      handleClose();
    } catch (error) {
      console.error("Error guardando cheque:", error);
      alert("Error al guardar el cheque. Verifica los datos.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Form onSubmit={handleSubmit} className="p-3">
        <Modal.Header closeButton>
          <Modal.Title>{cheque ? "Editar Cheque" : "Nuevo Cheque"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
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
                    style={{ maxHeight: "200px", objectFit: "contain" }}
                  />
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="dark">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
