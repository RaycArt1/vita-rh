
import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import MainLayout from "../../layouts/MainLayout";
import api from "../../services/api";

const TURNOS = {
  T12_20: "12:00 p. m. – 8:00 p. m.",
  T12_22: "12:00 p. m. – 10:00 p. m.",
};

function fechaLocal(fecha) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function formatoFecha(fecha) {
  return fecha.toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
  });
}

function obtenerLunes(fecha) {
  const lunes = new Date(fecha);
  const dia = lunes.getDay();
  lunes.setDate(lunes.getDate() - (dia === 0 ? 6 : dia - 1));
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

function fechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export default function MisHorarios() {
  const [semana, setSemana] = useState(() => obtenerLunes(new Date()));
  const [datos, setDatos] = useState({ horarios: [], descansos: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const dias = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(semana);
    fecha.setDate(fecha.getDate() + i);
    return fecha;
  });

  useEffect(() => {
    let activo = true;

    const inicio = fechaISO(dias[0]);
    const fin = fechaISO(dias[6]);

    setCargando(true);
    setError("");

    api
      .get("/horarios/mis-horarios", {
        params: { inicio, fin },
      })
      .then((respuesta) => {
        if (activo) setDatos(respuesta.data);
      })
      .catch((err) => {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudo cargar tu horario."
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [semana]);

  function cambiarSemana(cantidad) {
    setSemana((actual) => {
      const nueva = new Date(actual);
      nueva.setDate(nueva.getDate() + cantidad * 7);
      return nueva;
    });
  }

  function asignacionDelDia(fecha) {
    const fechaTexto = fechaISO(fecha);

    const descanso = datos.descansos.find(
      (d) => d.fecha.slice(0, 10) === fechaTexto
    );

    if (descanso) return { tipo: "descanso" };

    const horario = datos.horarios.find(
      (h) => h.fechaInicio.slice(0, 10) === fechaTexto
    );

    if (horario) return { tipo: "trabajo", horario };

    return { tipo: "sin", horario: null };
  }

  return (
    <MainLayout>
      <div>
        <small className="text-muted">
          Portal del empleado — Vito Pizzería
        </small>

        <h3 className="fw-bold mt-1 mb-3">Mi horario</h3>

        <Card className="border-0 shadow-sm mb-3">
          <Card.Body>
            <Row className="align-items-center">
              <Col xs={12} md={6}>
                <div className="text-muted small">
                  Semana correspondiente
                </div>
                <h5 className="fw-bold mb-0">
                  {formatoFecha(dias[0])} – {formatoFecha(dias[6])}
                </h5>
              </Col>

              <Col xs={12} md={6} className="text-md-end mt-3 mt-md-0">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => cambiarSemana(-1)}
                >
                  Anterior
                </Button>{" "}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSemana(obtenerLunes(new Date()))}
                >
                  Hoy
                </Button>{" "}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => cambiarSemana(1)}
                >
                  Siguiente
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {error && <Alert variant="danger">{error}</Alert>}

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : (
          <Row className="g-3">
            {dias.map((fecha) => {
              const asignacion = asignacionDelDia(fecha);
              const esHoy =
                fechaISO(fecha) === fechaISO(new Date());

              return (
                <Col xs={12} sm={6} lg={4} xl={3} key={fechaISO(fecha)}>
                  <Card
                    className={`border-0 shadow-sm h-100 ${
                      esHoy ? "border-start border-danger border-4" : ""
                    }`}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <div className="fw-bold">
                            {fecha.toLocaleDateString("es-HN", {
                              weekday: "long",
                            })}
                          </div>
                          <small className="text-muted">
                            {formatoFecha(fecha)}
                          </small>
                        </div>

                        {esHoy && (
                          <Badge bg="danger">Hoy</Badge>
                        )}
                      </div>

                      {asignacion.tipo === "descanso" ? (
                        <Badge bg="success">Día de descanso</Badge>
                      ) : asignacion.tipo === "trabajo" ? (
                        <>
                          <Badge bg="primary">Trabajo</Badge>
                          <div className="fw-semibold mt-2">
                            {TURNOS[asignacion.horario.turno] ||
                              asignacion.horario.turno}
                          </div>
                          <small className="text-muted">
                            {asignacion.horario.area?.nombre || ""}
                          </small>
                        </>
                      ) : (
                        <Badge bg="secondary">Sin asignar</Badge>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </MainLayout>
  );
}
