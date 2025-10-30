import { useEffect, useState } from "react";
import { Table, Button, Spinner, Badge, Modal } from "react-bootstrap";
import { api } from "../services/api";
import { toast } from "react-toastify";

export default function DeletedCheques() {
  const [deletedCheques, setDeletedCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [chequeSeleccionado, setChequeSeleccionado] = useState<any>(null);
  const [passwordInput, setPasswordInput] = useState("");

  const ADMIN_PASSWORD = "1234";

  useEffect(() => {
    fetchDeletedCheques();
  }, []);

  const fetchDeletedCheques = () => {
    setLoading(true);
    api
      .get("/cheques/deleted/all")
      .then((res) => setDeletedCheques(res.data))
      .finally(() => setLoading(false));
  };

  const handleRestore = async (cheque: any) => {
    await api.put(`/cheques/restore/${cheque._id}`);
    toast.success("♻️ Cheque restaurado correctamente.", {
      style: { background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)", color: "#e6e6e6" },
    });
    fetchDeletedCheques();
  };

  const handlePermanentDelete = async (cheque: any) => {
    if (!confirm("¿Eliminar permanentemente este cheque?")) return;
    await api.delete(`/cheques/permanent/${cheque._id}`);
    toast.error("🗑️ Cheque eliminado permanentemente.", {
      style: { background: "linear-gradient(135deg, #3a0000, #8b0000)", color: "#fff" },
    });
    fetchDeletedCheques();
  };

  const verificarPassword = () => {
    if (passwordInput === ADMIN_PASSWORD && chequeSeleccionado) {
      handleRestore(chequeSeleccionado);
      setShowPasswordModal(false);
      setChequeSeleccionado(null);
      setPasswordInput("");
    } else {
      toast.error("Contraseña incorrecta.");
    }
  };

  return (
    <div className="p-3">
      <h3 className="fw-bold mb-4">Cheques Eliminados</h3>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : deletedCheques.length === 0 ? (
        <p className="text-center text-muted mt-5">No hay cheques eliminados.</p>
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
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {deletedCheques.map((c) => (
                <tr key={c._id}>
                  <td>{c.numero}</td>
                  <td>{c.banco}</td>
                  <td>{c.beneficiario}</td>
                  <td>
                    {Number(c.monto).toLocaleString("es-DO", {
                      style: "currency",
                      currency: "DOP",
                    })}
                  </td>
                  <td>
                    <Badge bg="danger" className="px-3 py-2">
                      Eliminado
                    </Badge>
                  </td>
                  <td className="text-center d-flex justify-content-center gap-2">
                    <Button
                      size="sm"
                      className="border-0 fw-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #198754, #2ecc71)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                      }}
                      onClick={() => {
                        setChequeSeleccionado(c);
                        setShowPasswordModal(true);
                      }}
                    >
                      Restaurar
                    </Button>
                    <Button
                      size="sm"
                      className="border-0 fw-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #6a0000, #a00000)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                      }}
                      onClick={() => handlePermanentDelete(c)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal de contraseña */}
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
