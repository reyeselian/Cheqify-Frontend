import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Card,
  Row,
  Col,
  Button,
  Spinner,
  Container,
} from "react-bootstrap";
import { FaFileExcel, FaFilePdf, FaChartPie } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
} from "recharts";

export default function Reportes() {
  const [cheques, setCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheques();
  }, []);

  const fetchCheques = async () => {
    try {
      const { data } = await api.get("/cheques");
      setCheques(data);
    } catch (error) {
      console.error("Error al cargar cheques:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📊 Datos calculados
  const pendientes = cheques.filter((c) => c.estado === "pendiente");
  const cobrados = cheques.filter((c) => c.estado === "cobrado");
  const devueltos = cheques.filter((c) => c.estado === "devuelto");

  const montoPendiente = pendientes.reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const montoCobrados = cobrados.reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const montoDevueltos = devueltos.reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const montoTotal = montoPendiente + montoCobrados + montoDevueltos;

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    });

  // 📗 Exportar a Excel
  const exportToExcel = () => {
    const data = cheques.map((c) => ({
      "No. Cheque": c.numero,
      Banco: c.banco,
      Beneficiario: c.beneficiario,
      Monto: c.monto,
      Estado: c.estado,
      "Fecha Cheque": c.fechaCheque
        ? new Date(c.fechaCheque).toLocaleDateString()
        : "No registrada",
      "Fecha Depósito": c.fechaDeposito
        ? new Date(c.fechaDeposito).toLocaleDateString()
        : "No registrada",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cheques");
    XLSX.writeFile(workbook, "Reporte_Cheques.xlsx");
  };

  // 📄 Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Reporte de Cheques - Cheqify", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["No. Cheque", "Banco", "Beneficiario", "Monto", "Estado", "Fecha Depósito"]],
      body: cheques.map((c) => [
        c.numero,
        c.banco,
        c.beneficiario,
        formatCurrency(Number(c.monto)),
        c.estado,
        c.fechaDeposito
          ? new Date(c.fechaDeposito).toLocaleDateString()
          : "No registrada",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [33, 37, 41] },
    });

    doc.save("Reporte_Cheques.pdf");
  };

  // 🎨 Colores para los gráficos
  const COLORS = ["#ffc107", "#198754", "#6c757d"];

  const pieData = [
    { name: "Pendientes", value: pendientes.length },
    { name: "Cobrados", value: cobrados.length },
    { name: "Devueltos", value: devueltos.length },
  ];

  const barData = [
    { name: "Pendientes", monto: montoPendiente },
    { name: "Cobrados", monto: montoCobrados },
    { name: "Devueltos", monto: montoDevueltos },
  ];

  return (
    <Container className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">📊 Reportes de Cheques</h3>

        <div className="d-flex gap-2">
          <Button
            variant="success"
            className="fw-bold d-flex align-items-center gap-2"
            onClick={exportToExcel}
          >
            <FaFileExcel /> Exportar Excel
          </Button>
          <Button
            variant="danger"
            className="fw-bold d-flex align-items-center gap-2"
            onClick={exportToPDF}
          >
            <FaFilePdf /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* TARJETAS RESUMEN */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : (
        <Row className="g-3 mb-4">
          {[
            { label: "Total", count: cheques.length, monto: montoTotal, color: "primary" },
            { label: "Pendientes", count: pendientes.length, monto: montoPendiente, color: "warning" },
            { label: "Cobrados", count: cobrados.length, monto: montoCobrados, color: "success" },
            { label: "Devueltos", count: devueltos.length, monto: montoDevueltos, color: "secondary" },
          ].map((item, idx) => (
            <Col key={idx} xs={12} md={6} lg={3}>
              <Card
                className="text-center border-0 rounded-4 shadow-sm"
                style={{
                  background: `linear-gradient(145deg, var(--bs-${item.color}) 10%, #fff)`,
                  color: item.color === "warning" ? "#000" : "#fff",
                }}
              >
                <Card.Body>
                  <h6 className="fw-bold">{item.label}</h6>
                  <h4 className="fw-bold">{item.count}</h4>
                  <small>{formatCurrency(item.monto)}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* GRÁFICOS */}
      {!loading && (
        <>
          <h5 className="fw-bold mb-3">
            <FaChartPie className="me-2" /> Distribución de Cheques
          </h5>
          <Row className="g-3">
            <Col lg={6} md={12}>
              <Card className="p-3 shadow-sm rounded-4">
                <h6 className="text-center mb-3">Cantidad de Cheques</h6>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={110}
                      label
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col lg={6} md={12}>
              <Card className="p-3 shadow-sm rounded-4">
                <h6 className="text-center mb-3">Monto Total por Estado</h6>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="monto" fill="#0d6efd" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}
