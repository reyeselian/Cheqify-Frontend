// src/components/DeletedCheques.tsx
import { useEffect, useState } from "react";
import { Table, Button, Spinner, Badge, Modal } from "react-bootstrap";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";

export default function DeletedCheques() {
  const [deletedCheques, setDeletedCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [chequeSeleccionado, setChequeSeleccionado] = useState<any>(null);

  const { isAdmin } = useUser();
  const [passwordInput, setPasswordInput] = useState("");
  const ADMIN_PASSWORD = "1234"; // igual que en Home

  useEffect(() => {
    fetchDeletedCheques();
  }, []);

  const fetchDeletedCheques = () => {
    setLoading(true);
    api.get("/cheques/deleted")
      .then((res) => setDeletedCheques(res.data))
      .finally(() => setLoading(false));
  };

  const handleRestore = async (cheque: any) => {
    await api.put(`/cheques/restore/${cheque._id}`);
    fetchDeletedCheques();
  };

  const handlePermanentDelete = async (cheque: any) => {
    if (!confirm("¿Eliminar permanentemente este cheque?")) return;
    await api.delete(`/cheques/permanent/${cheque._id}`);
    fetchDeletedCheques();
  };

  const verificarPassword = () => {
    if (passwordInput === ADMIN_PASSWORD && chequeSeleccionado) {
      handleRestore(chequeSeleccionado);
      setShowPasswordModal(false);
      setChequeSeleccionado(null);
      setPasswordInput("");
    } else {
      alert("Contraseña incorrecta");
    }
  };

  if (!isAdmin) return <p className="text-danger">Solo administradores pueden ver los cheques eliminados.</p>;

  return (
    <div>
      {loading ? (
        <Spinner animation="border" variant="dark" />
      ) : deletedCheques.length === 0 ? (
        <p>No hay cheques eliminados.</p>
      ) : (
        <Table hover className="align-middle mb-0">
          <thead className="bg-dark text-white">
            <tr>
              <th>Número</th>
              <th>Banco</th>
              <th>Beneficiario</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {deletedCheques.map((c) => (
              <tr key={c._id}>
                <td>{c.numero}</td>
                <td>{c.banco}</td>
                <td>{c.beneficiario}</td>
                <td>{c.notas}</td>
                <td>${Number(c.monto).toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
                <td><Badge bg="danger">Eliminado</Badge></td>
                <td>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      setChequeSeleccionado(c);
                      setShowPasswordModal(true);
                    }}
                  >
                    Restaurar
                  </Button>{" "}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handlePermanentDelete(c)}
                  >
                    Eliminar Permanentemente
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

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
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={verificarPassword}>Aceptar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
