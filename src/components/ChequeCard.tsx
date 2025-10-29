import { Card, Button } from "react-bootstrap";
import { FaEdit, FaTrash, FaCalendarAlt, FaUser, FaMoneyBillWave } from "react-icons/fa";

interface Props {
  cheque: any;
  onEdit: (cheque: any) => void;
  onDelete: (id: string) => void;
}

export default function ChequeCard({ cheque, onEdit, onDelete }: Props) {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <span className="badge bg-warning text-dark">Pendiente</span>;
      case "cobrado":
        return <span className="badge bg-success">Cobrado</span>;
      case "anulado":
        return <span className="badge bg-danger">Anulado</span>;
      default:
        return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  return (
    <Card
      className="shadow-sm border-0 rounded-4 mx-auto"
      style={{
        width: "80%", // Reducido al 80%
        background: "#fdfdfd",
        transition: "all 0.2s ease",
      }}
    >
      <Card.Body>
        {/* Encabezado */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold mb-0">{cheque.banco || "Banco no especificado"}</h6>
          {getEstadoBadge(cheque.estado)}
        </div>

        {/* Información principal */}
        <div className="p-2 rounded-3 bg-white mb-3 border">
          <div className="d-flex justify-content-between flex-wrap">
            <div className="mb-2">
              <strong>Número:</strong> {cheque.numero || "N/A"}
            </div>
            <div className="mb-2">
              <FaMoneyBillWave className="me-1 text-success" />
              <strong>Monto:</strong> ${cheque.monto?.toLocaleString() || "0.00"}
            </div>
            <div className="mb-2">
              <strong>Corbata:</strong> {cheque.corbata || 0} días
            </div>
          </div>

          <div className="d-flex justify-content-between flex-wrap mt-2">
            <div className="mb-2">
              <FaUser className="me-1 text-secondary" />
              <strong>Beneficiario:</strong> {cheque.beneficiario || "N/A"}
            </div>
            <div className="mb-2">
              <strong>Firmado por:</strong> {cheque.firmadoPor || "No registrado"}
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="p-2 rounded-3 bg-light border mb-3">
          <div className="d-flex justify-content-between flex-wrap">
            <div className="mb-2">
              <FaCalendarAlt className="me-1 text-primary" />
              <strong>Fecha Cheque:</strong>{" "}
              {cheque.fechaCheque
                ? new Date(cheque.fechaCheque).toLocaleDateString()
                : "No registrada"}
            </div>
            <div className="mb-2">
              <FaCalendarAlt className="me-1 text-info" />
              <strong>Fecha Depósito:</strong>{" "}
              {cheque.fechaDeposito
                ? new Date(cheque.fechaDeposito).toLocaleDateString()
                : "No registrada"}
            </div>
          </div>
        </div>

        {/* Notas */}
        {cheque.notas && (
          <div className="mb-3">
            <strong>Notas:</strong>
            <div className="text-muted small">{cheque.notas}</div>
          </div>
        )}

        {/* Botones */}
        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="outline-dark"
            size="sm"
            onClick={() => onEdit(cheque)}
            className="d-flex align-items-center gap-1"
          >
            <FaEdit /> Editar
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete(cheque._id)}
            className="d-flex align-items-center gap-1"
          >
            <FaTrash /> Eliminar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
