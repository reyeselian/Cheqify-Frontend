import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface ConfirmPasswordModalProps {
  show: boolean;
  onConfirm: (password: string) => void;
  onClose: () => void;
}

const ConfirmPasswordModal: React.FC<ConfirmPasswordModalProps> = ({ show, onConfirm, onClose }) => {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    onConfirm(password);
    setPassword("");
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar acción</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Introduce tu contraseña para confirmar</Form.Label>
          <Form.Control
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmPasswordModal;
