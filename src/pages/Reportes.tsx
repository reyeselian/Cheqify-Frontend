import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
import { Chart, ArcElement, DoughnutController, Tooltip as CJTooltip } from "chart.js";

Chart.register(ArcElement, DoughnutController, CJTooltip);

export default function Reportes() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const isBlocked = user ? ["trial_expired", "payment_required", "blocked"].includes(user.status) : false;

  const [cheques, setCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const gaugeRef = useRef<HTMLCanvasElement>(null);
  const gaugeInstance = useRef<Chart | null>(null);

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
  const cobrados   = cheques.filter((c) => c.estado === "cobrado");
  const devueltos  = cheques.filter((c) => c.estado === "devuelto");

  const montoPendiente = pendientes.reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const montoCobrados  = cobrados.reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const montoDevueltos = devueltos.reduce((a, c) => a + (Number(c.monto) || 0), 0);
  const montoTotal     = montoPendiente + montoCobrados + montoDevueltos;

  const pctCobrado = cheques.length > 0 ? Math.round((cobrados.length / cheques.length) * 100) : 0;

  // Gauge — renderizar con Chart.js
  useEffect(() => {
    if (loading || !gaugeRef.current) return;

    if (gaugeInstance.current) {
      gaugeInstance.current.destroy();
      gaugeInstance.current = null;
    }

    const ctx = gaugeRef.current.getContext("2d");
    if (!ctx) return;

    gaugeInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [{
          data: [pctCobrado, 100 - pctCobrado],
          backgroundColor: ["#198754", "rgba(0,0,0,0.07)"],
          borderWidth: 0,
          circumference: 180,
          rotation: 270,
        } as any],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend:  { display: false },
          tooltip: { enabled: false },
        },
      },
      plugins: [{
        id: "gaugeText",
        afterDraw(chart: any) {
          const { ctx: c, chartArea: { top, width, height } } = chart;
          c.save();
          c.font = "bold 28px sans-serif";
          c.fillStyle = "#198754";
          c.textAlign = "center";
          c.fillText(`${pctCobrado}%`, width / 2, top + height * 0.72);
          c.font = "12px sans-serif";
          c.fillStyle = "#94a3b8";
          c.fillText("cheques cobrados", width / 2, top + height * 0.90);
          c.restore();
        },
      }],
    } as any);

    return () => {
      gaugeInstance.current?.destroy();
      gaugeInstance.current = null;
    };
  }, [loading, pctCobrado]);

  const formatCurrency = (value: number) =>
    value.toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
      minimumFractionDigits: 2,
    });

  // 📗 Exportar a Excel
  const exportToExcel = () => {
    const data = cheques.map((c) => ({
      "No. Cheque":    c.numero,
      Banco:           c.banco,
      Beneficiario:    c.beneficiario,
      Monto:           c.monto,
      Estado:          c.estado,
      "Fecha Cheque":  c.fechaCheque  ? new Date(c.fechaCheque).toLocaleDateString()  : "No registrada",
      "Fecha Depósito":c.fechaDeposito? new Date(c.fechaDeposito).toLocaleDateString(): "No registrada",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook  = XLSX.utils.book_new();
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
        c.fechaDeposito ? new Date(c.fechaDeposito).toLocaleDateString() : "No registrada",
      ]),
      styles:     { fontSize: 9 },
      headStyles: { fillColor: [33, 37, 41] },
    });

    doc.save("Reporte_Cheques.pdf");
  };

  const COLORS = ["#ffc107", "#198754", "#6c757d"];

  const pieData = [
    { name: "Pendientes", value: pendientes.length },
    { name: "Cobrados",   value: cobrados.length   },
    { name: "Devueltos",  value: devueltos.length  },
  ];

  const barData = [
    { name: "Pendientes", monto: montoPendiente },
    { name: "Cobrados",   monto: montoCobrados   },
    { name: "Devueltos",  monto: montoDevueltos  },
  ];

  // ── Pantalla de bloqueo ─────────────────────────────────
  if (isBlocked) {
    return (
      <Container className="p-3">
        <div style={{
          minHeight: "60vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center", gap: "1rem",
        }}>
          <div style={{ fontSize: "3.5rem" }}>🔒</div>
          <h4 style={{ fontWeight: 700, color: "#1a1d23", margin: 0 }}>
            {user?.status === "blocked" ? "Cuenta bloqueada" : "Prueba vencida"}
          </h4>
          <p style={{ color: "#6b7280", fontSize: "0.95rem", maxWidth: "360px", margin: 0 }}>
            {user?.status === "blocked"
              ? "Contacta al administrador para desbloquear tu cuenta."
              : "Actualiza tu plan para acceder a los reportes y estadísticas de tus cheques."}
          </p>
          {user?.status !== "blocked" && (
            <button
              onClick={() => navigate("/planes")}
              style={{
                background: "linear-gradient(135deg, #c58b2a, #e8c47a)",
                border: "none", borderRadius: "10px",
                color: "#111", fontWeight: 700, fontSize: "0.9rem",
                padding: "10px 24px", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(197,139,42,0.3)",
              }}
            >
              🚀 Ver Planes
            </button>
          )}
        </div>
      </Container>
    );
  }

  return (
    <Container className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">📊 Reportes de Cheques</h3>
        <div className="d-flex gap-2">
          <Button variant="success" className="fw-bold d-flex align-items-center gap-2" onClick={exportToExcel}>
            <FaFileExcel /> Exportar Excel
          </Button>
          <Button variant="danger" className="fw-bold d-flex align-items-center gap-2" onClick={exportToPDF}>
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
        <>
          <Row className="g-3 mb-4">
            {[
              { label: "Total",      count: cheques.length,   monto: montoTotal,       color: "primary"   },
              { label: "Pendientes", count: pendientes.length, monto: montoPendiente,   color: "warning"   },
              { label: "Cobrados",   count: cobrados.length,   monto: montoCobrados,    color: "success"   },
              { label: "Devueltos",  count: devueltos.length,  monto: montoDevueltos,   color: "secondary" },
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

          {/* GAUGE + GRÁFICOS */}
          <h5 className="fw-bold mb-3">
            <FaChartPie className="me-2" /> Distribución de Cheques
          </h5>

          <Row className="g-3 mb-3">
            {/* Gauge */}
            <Col lg={4} md={12}>
              <Card className="p-3 shadow-sm rounded-4 h-100 d-flex flex-column align-items-center justify-content-center">
                <h6 className="text-center mb-2">Tasa de Cobro</h6>
                <div style={{ position: "relative", width: "100%", height: "200px" }}>
                  <canvas
                    ref={gaugeRef}
                    role="img"
                    aria-label={`Gauge mostrando ${pctCobrado}% de cheques cobrados`}
                  />
                </div>
                <div className="d-flex justify-content-around w-100 mt-2">
                  <small className="text-muted">0%</small>
                  <small className="text-muted">50%</small>
                  <small className="text-muted">100%</small>
                </div>
              </Card>
            </Col>

            {/* Pie */}
            <Col lg={4} md={6}>
              <Card className="p-3 shadow-sm rounded-4">
                <h6 className="text-center mb-3">Cantidad de Cheques</h6>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
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

            {/* Bar */}
            <Col lg={4} md={6}>
              <Card className="p-3 shadow-sm rounded-4">
                <h6 className="text-center mb-3">Monto Total por Estado</h6>
                <ResponsiveContainer width="100%" height={230}>
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