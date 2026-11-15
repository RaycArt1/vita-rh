import { useEffect, useState } from "react";
import { Alert, Badge, Card, Col, Row, Spinner } from "react-bootstrap";
import MainLayout from "../../layouts/MainLayout";
import api from "../../services/api";

const COLOR_ESTADO = { PENDIENTE: "warning", APROBADA: "success", RECHAZADA: "danger" };
const ETIQUETA_TURNO = { T12_20: "12:00 PM – 8:00 PM", T12_22: "12:00 PM – 10:00 PM",};
const ETIQUETA_ESTADO = { PENDIENTE: "Pendiente", APROBADA: "Aprobada", RECHAZADA: "Rechazada" };
const ETIQUETA_TIPO = { VACACION: "Vacaciones", PERMISO: "Permiso", INCAPACIDAD: "Incapacidad" };

export default function MiResumen() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    try {
      const respuesta = await api.get("/resumen/empleado");
      setResumen(respuesta.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "No se pudo cargar tu resumen.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const tarjetas = [
    { etiqueta: "Solicitudes Pendientes", valor: resumen?.pendientes ?? 0, color: "warning" },
    { etiqueta: "Solicitudes Aprobadas", valor: resumen?.aprobadas ?? 0, color: "success" },
    { etiqueta: "Solicitudes Rechazadas", valor: resumen?.rechazadas ?? 0, color: "danger" },
    
  ];

  
  const turno = resumen?.proximoTurno;

  return (
    <MainLayout>
      <div>
        <h3 className="fw-bold mt-1 mb-3">Mi resumen</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        {cargando ? (
          <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
        ) : (
          <>
            <Row className="g-3 mb-4">
              {tarjetas.map((t) => (
                <Col xs={6} md={3} key={t.etiqueta}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="text-center">
                      <div className={`text-${t.color} small fw-semibold`}>{t.etiqueta}</div>
                      <div className="fs-2 fw-bold mt-1">{t.valor}</div>
                    </Card.Body>
                    
                  </Card>
                </Col>

                
              ))}

                <Col xs={6} md={3} className="d-flex">
                  <div className="border-start ps-3 w-100 d-flex">
                  <Card className="border-0 shadow-sm w-100">
                    <Card.Body className="text-center">
                      <div className="text-secondary small fw-semibold">Llamados de atención</div>
                      <div className="fs-2 fw-bold mt-1">{resumen?.llamados ?? 0}</div>
                      <small className="text-muted">Registrados a tu nombre</small>
                    </Card.Body>
                  </Card>
                  </div>
              </Col>
            </Row>
              
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h6 className="fw-bold">Próximo turno</h6>
                {turno ? (
                  
                  <p className="mb-0 font-monospace">
                     {new Date(turno.fechaInicio).toLocaleDateString()} · {ETIQUETA_TURNO[turno.turno] ?? turno.turno}
                  </p>
                ) : (
                  <p className="mb-0 text-muted">No tienes turnos programados.</p>
                )}
              </Card.Body>
            </Card>
                

            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="fw-bold">Mis últimas solicitudes</h6>
                {resumen?.ultimasSolicitudes?.length ? (
                  resumen.ultimasSolicitudes.map((s) => (
                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <div>
                        <div className="fw-semibold small">{ETIQUETA_TIPO[s.tipoSolicitud]}</div>
                        <div className="font-monospace small text-muted">
                        {s.fechaInicio.slice(0, 10)} → {s.fechaFin.slice(0, 10)}
                      </div>
                    </div>
                        <Badge bg={COLOR_ESTADO[s.estado]} className="rounded-pill">
                      {ETIQUETA_ESTADO[s.estado]}
                    </Badge>
                  </div>
                  ))
                ) : (
                  <p className="mb-0 text-muted">Aún no has enviado solicitudes.</p>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}