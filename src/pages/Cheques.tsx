import { useEffect, useState } from "react";
import { Table, Spinner, Badge, Card, Button } from "react-bootstrap";
import { api } from "../services/api";
import { FaSyncAlt, FaMoneyBillWave, FaUndoAlt, FaExclamationCircle } from "react-icons/fa";

export default function Cheques() {
  const [cheques, setCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheques = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cheques");
      setCheques(res.data);
    } catch (error) {
      console.error("Error al obtener cheques:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheques();
  }, []);

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    });

  const getBadge = (estado: string) => {
    const map: Record<string, string> = {
      pendiente: "warning",
      cobrado: "success",
      devuelto: "secondary",
    };
    return <Badge bg={map[estado] || "dark"}>{estado.toUpperCase()}</Badge>;
  };

  // 🔹 Cálculos de totales
  const totalPendientes = cheques.filter((c) => c.estado === "pendiente");
  const totalCobrados = cheques.filter((c) => c.estado === "cobrado");
  const totalDevueltos = cheques.filter((c) => c.estado === "devuelto");

  const sum = (arr: any[]) =>
    arr.reduce((acc, c) => acc + (Number(c.monto) || 0), 0);

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
          📋 Gestión de Cheques
        </h3>
        <Button
          variant="dark"
          size="sm"
          className="fw-bold border-0 d-flex align-items-center gap-2"
          onClick={fetchCheques}
          style={{
            background: "linear-gradient(135deg, #1a1a1a, #3a3a3a)",
            borderRadius: "10px",
          }}
        >
          <FaSyncAlt /> Actualizar
        </Button>
      </div>

      {/* RESUMEN */}
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
        {[
          {
            label: "Pendientes",
            value: totalPendientes.length,
            monto: sum(totalPendientes),
            icon: <FaExclamationCircle size={22} />,
            color: "warning",
          },
          {
            label: "Cobrados",
            value: totalCobrados.length,
            monto: sum(totalCobrados),
            icon: <FaMoneyBillWave size={22} />,
            color: "success",
          },
          {
            label: "Devueltos",
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
              background: `linear-gradient(145deg, var(--bs-${item.color}) 20%, #fff)`,
              color: item.color === "warning" ? "#000" : "#fff",
              borderRadius: "12px",
            }}
          >
            <Card.Body>
              <div className="d-flex justify-content-center mb-2">
                {item.icon}
              </div>
              <h5 className="fw-bold mb-0">{item.label}</h5>
              <p className="mb-1">{item.value} cheques</p>
              <small className="fw-semibold">
                {formatCurrency(item.monto)}
              </small>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : cheques.length === 0 ? (
        <p className="text-center text-muted mt-5">
          No hay cheques registrados aún.
        </p>
      ) : (
        <div className="table-responsive shadow-sm rounded-4 border bg-white p-2">
          <Table hover className="align-middle mb-0">
            <thead
              className="text-white"
              style={{
                background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)",
              }}
            >
              <tr>
                <th>No. Cheque</th>
                <th>Banco</th>
                <th>Beneficiario</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha Cheque</th>
                <th>Fecha Depósito</th>
              </tr>
            </thead>
            <tbody>
              {cheques.map((c) => (
                <tr key={c._id}>
                  <td>{c.numero}</td>
                  <td>{c.banco}</td>
                  <td>{c.beneficiario}</td>
                  <td>{formatCurrency(Number(c.monto))}</td>
                  <td>{getBadge(c.estado)}</td>
                  <td>
                    {c.fechaCheque
                      ? new Date(c.fechaCheque).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {c.fechaDeposito
                      ? new Date(c.fechaDeposito).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
