
import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Card,
  Row,
  Col,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";

import api from "../../services/api";

function obtenerLista(datos) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.data)) return datos.data;
  if (Array.isArray(datos?.empleados)) return datos.empleados;
  if (Array.isArray(datos?.data?.empleados)) return datos.data.empleados;
  return [];
}

function nombreEmpleado(emp) {
  const nombre =
    emp.nombreCompleto ??
    emp.nombre ??
    [emp.nombres, emp.apellidos].filter(Boolean).join(" ") ??
    [emp.primerNombre, emp.primerApellido].filter(Boolean).join(" ");

  return nombre || `Empleado #${emp.id}`;
}

function areaEmpleado(emp) {
  const area = emp.area ?? emp.puesto?.area;

  return typeof area === "string"
    ? area
    : area?.nombre ?? emp.puesto?.nombre ?? "Área no disponible";
}

function idAreaEmpleado(emp) {
  return Number(
    emp.areaId ??
    emp.area?.id ??
    emp.puesto?.areaId ??
    emp.puesto?.area?.id
  );
}

function fechaHorario(horario) {
  const fecha = horario.fechaInicio;

  if (!fecha) return "";

  const valor =
    typeof fecha === "string"
      ? fecha.slice(0, 10)
      : new Date(fecha).toISOString().slice(0, 10);

  return valor;
}

function etiquetaTurno(turno) {
  if (turno === "T12_22") return "12:00 p. m. – 10:00 p. m.";
  if (turno === "T12_20") return "12:00 p. m. – 8:00 p. m.";
  return "Turno no identificado";
}

export default function DayDetailsModal({
  show,
  onHide,
  day,
  onEdit,
  horarios = [],
}) {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;

    let activo = true;

    async function cargarEmpleados() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await api.get("/empleados");
        const lista = obtenerLista(respuesta.data);

        if (!Array.isArray(lista)) {
          throw new Error("La API no devolvió una lista válida.");
        }

        if (activo) {
          setEmpleados(lista);
        }
      } catch (err) {
        if (activo) {
          setError(
            err.response?.data?.mensaje ??
            err.response?.data?.message ??
            "No se pudieron cargar los empleados. Revisá la conexión con el backend."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarEmpleados();

    return () => {
      activo = false;
    };
  }, [show]);

  const empleadosActivos = empleados.filter(
    (emp) => emp.estado !== "INACTIVO" && emp.estado !== "Inactivo"
  );

  const horariosDelDia = horarios.filter(
    (horario) =>
      fechaHorario(horario) === day &&
      horario.estado !== "MODIFICADO"
  );

  function horarioDelEmpleado(id) {
    return horariosDelDia.find(
      (horario) => Number(horario.empleadoId) === Number(id)
    );
  }

  function gestionarEmpleado(emp) {
    const horarioExistente = horarioDelEmpleado(emp.id);

    onEdit({
      ...emp,
      id: Number(emp.id),
      empleadoId: Number(emp.id),
      areaId: idAreaEmpleado(emp),
      nombre: nombreEmpleado(emp),
      area: areaEmpleado(emp),
      turno: horarioExistente?.turno ?? null,
      horaFin:
        horarioExistente?.turno === "T12_22" ? "22:00" : "20:00",
      horarioId: horarioExistente?.id ?? null,
    });
  }

  const asignados = empleadosActivos.filter(
    (emp) => horarioDelEmpleado(emp.id)
  );

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Gestión de turnos · {day}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="mb-4">
          <Col>
            <Card bg="success" text="white">
              <Card.Body>
                <h5>Con turno</h5>
                <h2>{asignados.length}</h2>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card bg="secondary" text="white">
              <Card.Body>
                <h5>Sin turno</h5>
                <h2>{empleadosActivos.length - asignados.length}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {cargando && (
          <div className="text-center my-4">
            <Spinner animation="border" className="me-2" />
            Cargando empleados...
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!cargando && !error && empleadosActivos.length === 0 && (
          <Alert variant="warning">
            No se encontraron empleados activos en la respuesta de la API.
          </Alert>
        )}

        {!cargando && !error && empleadosActivos.map((emp) => {
          const horario = horarioDelEmpleado(emp.id);

          return (
            <Card key={emp.id} className="mb-3 shadow-sm">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <h5>{nombreEmpleado(emp)}</h5>
                    <div>{areaEmpleado(emp)}</div>

                    {horario ? (
                      <>
                        <div className="mt-1">
                          {etiquetaTurno(horario.turno)}
                        </div>
                        <Badge bg="success" className="mt-2">
                          Turno asignado
                        </Badge>
                      </>
                    ) : (
                      <Badge bg="secondary" className="mt-2">
                        Sin turno asignado
                      </Badge>
                    )}

                    {!idAreaEmpleado(emp) && (
                      <div className="text-danger small mt-2">
                        No se encontró el área asociada a este empleado.
                      </div>
                    )}
                  </Col>

                  <Col
                    md={4}
                    className="text-end mt-3 mt-md-0"
                  >
                    <Button
                      variant="primary"
                      onClick={() => gestionarEmpleado(emp)}
                      disabled={!idAreaEmpleado(emp)}
                    >
                      {horario ? "Gestionar turno" : "Asignar turno"}
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
