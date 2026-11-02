import { useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

const FORMULARIO_INICIAL = {
  empleadoId: "",
  tipo: "VACACION",
  desde: "",
  hasta: "",
  motivo: "",
};

const ETIQUETA_ESTADO = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
};

const COLOR_ESTADO = {
  PENDIENTE: "warning",
  APROBADA: "success",
  RECHAZADA: "danger",
};

const ETIQUETA_TIPO = {
  VACACION: "Vacaciones",
  PERMISO: "Permiso",
  INCAPACIDAD: "Incapacidad",
};

function adaptarSolicitud(s) {
  const dias =
    Math.round((new Date(s.fechaFin) - new Date(s.fechaInicio)) / 86400000) + 1;

  return {
    id: s.id,
    nombre: `${s.empleado.nombres} ${s.empleado.apellidos}`,
    puesto: s.empleado.puesto?.nombre ?? "",
    estado: s.estado,
    tipo: s.tipoSolicitud,
    desde: s.fechaInicio.slice(0, 10),
    hasta: s.fechaFin.slice(0, 10),
    dias,
    motivo: s.motivo ?? "",
    comentarioGerente: s.comentarioGerente ?? "",
    fechaSolicitud: s.fechaSolicitud?.slice(0, 10) ?? "",
  };
}

function mensajeError(err, alternativo) {
  return err.response?.data?.mensaje || alternativo;
}

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [vistaEmpleado, setVistaEmpleado] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [solicitudEditando, setSolicitudEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  const [detalle, setDetalle] = useState(null);

  async function cargarSolicitudes() {
    const respuesta = await api.get("/solicitudes");
    setSolicitudes(respuesta.data.map(adaptarSolicitud));
  }

  async function cargarDatos() {
    setCargando(true);
    setError("");

    try {
      const [respSolicitudes, respEmpleados] = await Promise.all([
        api.get("/solicitudes"),
        api.get("/empleados"),
      ]);
      setSolicitudes(respSolicitudes.data.map(adaptarSolicitud));
      setEmpleados(respEmpleados.data);
    } catch (err) {
      console.error(err);
      setError(mensajeError(err, "No se pudieron cargar las solicitudes."));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Vista empleado: temporal, hasta conectar el usuario logueado
  const base = vistaEmpleado
    ? solicitudes.filter((s) => s.nombre === "Juan Pérez")
    : solicitudes;

  const pendientes = base.filter((s) => s.estado === "PENDIENTE").length;
  const aprobadas = base.filter((s) => s.estado === "APROBADA").length;
  const rechazadas = base.filter((s) => s.estado === "RECHAZADA").length;

  const termino = busqueda.trim().toLowerCase();
  const filtradas = base.filter((s) => {
    const coincideBusqueda =
      s.nombre.toLowerCase().includes(termino) ||
      s.puesto.toLowerCase().includes(termino) ||
      ETIQUETA_TIPO[s.tipo].toLowerCase().includes(termino);

    const coincideEstado = filtroEstado === "Todos" || s.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  async function cambiarEstado(id, estado) {
    setError("");
    setAviso("");

    try {
      await api.patch(`/solicitudes/${id}/estado`, { estado });
      setAviso(estado === "APROBADA" ? "Solicitud aprobada." : "Solicitud rechazada.");
      await cargarSolicitudes();
    } catch (err) {
      console.error(err);
      setError(mensajeError(err, "No se pudo actualizar la solicitud."));
    }
  }

  function abrirNuevo() {
    setSolicitudEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setErrorFormulario("");
    setAviso("");
    setMostrarModal(true);
  }

  function abrirEdicion(s) {
    setSolicitudEditando(s);
    setFormulario({
      empleadoId: "",
      tipo: s.tipo,
      desde: s.desde,
      hasta: s.hasta,
      motivo: s.motivo,
    });
    setErrorFormulario("");
    setMostrarModal(true);
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  }

  async function guardarSolicitud(evento) {
    evento.preventDefault();
    setErrorFormulario("");
    if (formulario.desde && formulario.hasta && formulario.hasta < formulario.desde) {
    setErrorFormulario("La fecha de inicio no puede ser posterior a la fecha de fin. Revisa las fechas.");
    return;
  }
    setGuardando(true);

    const datos = {
      tipoSolicitud: formulario.tipo,
      fechaInicio: formulario.desde,
      fechaFin: formulario.hasta,
      motivo: formulario.motivo.trim() || null,
    };

    try {
      if (solicitudEditando) {
        await api.put(`/solicitudes/${solicitudEditando.id}`, datos);
        setAviso("Solicitud actualizada correctamente.");
      } else {
        await api.post("/solicitudes", {
          ...datos,
          empleadoId: Number(formulario.empleadoId),
        });
        setAviso("Solicitud registrada correctamente.");
      }

      setMostrarModal(false);
      setSolicitudEditando(null);
      await cargarSolicitudes();
    } catch (err) {
      console.error(err);
      setErrorFormulario(mensajeError(err, "No se pudo guardar la solicitud."));
    } finally {
      setGuardando(false);
    }
  }

  const tarjetas = [
    { etiqueta: "Pendientes", valor: pendientes, color: "warning" },
    { etiqueta: "Aprobadas", valor: aprobadas, color: "success" },
    { etiqueta: "Rechazadas", valor: rechazadas, color: "danger" },
    { etiqueta: "Total", valor: base.length, color: "secondary" },
  ];

  return (
    <MainLayout>
      <div>
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div>
            <small className="text-muted">Gestión de Solicitudes — Vito Pizzería</small>
            <h3 className="fw-bold mt-1 mb-0">Vacaciones y Permisos</h3>
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={() => setVistaEmpleado(!vistaEmpleado)}>
              {vistaEmpleado ? "← Vista administrador" : "Vista empleado"}
            </Button>
            <Button variant="danger" onClick={abrirNuevo}>
              + Nueva solicitud
            </Button>
          </div>
        </div>

        <div className="row g-3 mt-2">
          {tarjetas.map((t) => (
            <div className="col-6 col-md-3" key={t.etiqueta}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className={`text-${t.color} small fw-semibold`}>{t.etiqueta}</div>
                  <div className="fs-2 fw-bold mt-1">{t.valor}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {aviso && (
          <Alert variant="success" dismissible className="mt-3" onClose={() => setAviso("")}>
            {aviso}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" dismissible className="mt-3" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <div style={{ marginTop: 30 }}>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Form.Control
              style={{ width: 280, maxWidth: "100%" }}
              type="search"
              placeholder="Buscar empleado, puesto o tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <Form.Select
              style={{ width: 220, maxWidth: "100%" }}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="Todos">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADA">Aprobadas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </Form.Select>
          </div>

          {cargando ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
              <div className="text-muted mt-2">Cargando solicitudes...</div>
            </div>
          ) : (
            <div style={{ marginTop: 24 }}>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>EMPLEADO</th>
                    <th>TIPO</th>
                    <th>FECHAS</th>
                    <th>DÍAS</th>
                    <th>ESTADO</th>
                    <th>MOTIVO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {filtradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No se encontraron solicitudes.
                      </td>
                    </tr>
                  ) : (
                    filtradas.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="fw-semibold">{s.nombre}</div>
                          <small className="text-muted">{s.puesto}</small>
                        </td>

                        <td>{ETIQUETA_TIPO[s.tipo]}</td>

                        <td>
                          <small className="font-monospace">
                            {s.desde} → {s.hasta}
                          </small>
                        </td>

                        <td>{s.dias}</td>

                        <td>
                          <Badge bg={COLOR_ESTADO[s.estado]} className="rounded-pill">
                            {ETIQUETA_ESTADO[s.estado]}
                          </Badge>
                        </td>

                        <td>
                          <small className="text-muted">{s.motivo || "—"}</small>
                        </td>

                        <td>
                          {!vistaEmpleado && (
                            <div className="d-flex gap-2 flex-wrap">
                              <Button size="sm" variant="outline-primary" onClick={() => setDetalle(s)}>
                                Ver
                              </Button>
                              {s.estado === "PENDIENTE" && (
                                <>
                                  <Button size="sm" variant="outline-secondary" onClick={() => abrirEdicion(s)}>
                                    Editar
                                  </Button>
                                  <Button size="sm" variant="outline-success" onClick={() => cambiarEstado(s.id, "APROBADA")}>
                                    Aprobar
                                  </Button>
                                  <Button size="sm" variant="outline-danger" onClick={() => cambiarEstado(s.id, "RECHAZADA")}>
                                    Rechazar
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Modal show={mostrarModal} onHide={() => !guardando && setMostrarModal(false)} centered>
        <Form onSubmit={guardarSolicitud}>
          
          <Modal.Header closeButton={!guardando}>
            <Modal.Title>{solicitudEditando ? "Editar solicitud" : "Nueva solicitud"}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {errorFormulario && <Alert variant="danger">{errorFormulario}</Alert>}

            <div className="row g-3">
              {!solicitudEditando && (
                <Form.Group className="col-12">
                  <Form.Label>Empleado *</Form.Label>
                  <Form.Select name="empleadoId" value={formulario.empleadoId} onChange={cambiarCampo} required>
                    <option value="">Selecciona un empleado</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombres} {emp.apellidos}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              <Form.Group className="col-12">
                <Form.Label>Tipo *</Form.Label>
                <Form.Select name="tipo" value={formulario.tipo} onChange={cambiarCampo} required>
                  <option value="VACACION">Vacaciones</option>
                  <option value="PERMISO">Permiso</option>
                  <option value="INCAPACIDAD">Incapacidad</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Desde *</Form.Label>
                <Form.Control name="desde" type="date" value={formulario.desde} onChange={cambiarCampo} required />
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Hasta *</Form.Label>
                <Form.Control name="hasta" type="date" value={formulario.hasta} onChange={cambiarCampo} required />
              </Form.Group>

              <Form.Group className="col-12">
                <Form.Label>Observación</Form.Label>
                <Form.Control
                  name="motivo"
                  as="textarea"
                  rows={3}
                  value={formulario.motivo}
                  onChange={cambiarCampo}
                  maxLength={500}
                />
              </Form.Group>
            </div>

            <small className="d-block text-muted mt-3">
              Los campos marcados con * son obligatorios. Las vacaciones deben solicitarse con al menos una semana de anticipación.
            </small>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setMostrarModal(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" disabled={guardando}>
              {guardando ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Guardando...
                </>
              ) : solicitudEditando ? (
                "Guardar cambios"
              ) : (
                "Registrar solicitud"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={Boolean(detalle)} onHide={() => setDetalle(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalle de la solicitud</Modal.Title>
        </Modal.Header>
        {detalle && (
          <Modal.Body>
            <dl className="row mb-0">
              <dt className="col-sm-4">Empleado</dt>
              <dd className="col-sm-8">{detalle.nombre}</dd>
              <dt className="col-sm-4">Puesto</dt>
              <dd className="col-sm-8">{detalle.puesto || "—"}</dd>
              <dt className="col-sm-4">Tipo</dt>
              <dd className="col-sm-8">{ETIQUETA_TIPO[detalle.tipo]}</dd>
              <dt className="col-sm-4">Fechas</dt>
              <dd className="col-sm-8 font-monospace">{detalle.desde} → {detalle.hasta}</dd>
              <dt className="col-sm-4">Días</dt>
              <dd className="col-sm-8">{detalle.dias}</dd>
              <dt className="col-sm-4">Estado</dt>
              <dd className="col-sm-8">
                <Badge bg={COLOR_ESTADO[detalle.estado]} className="rounded-pill">
                  {ETIQUETA_ESTADO[detalle.estado]}
                </Badge>
              </dd>
              <dt className="col-sm-4">Registrada</dt>
              <dd className="col-sm-8">{detalle.fechaSolicitud || "—"}</dd>
              <dt className="col-sm-4">Motivo</dt>
              <dd className="col-sm-8">{detalle.motivo || "—"}</dd>
              <dt className="col-sm-4">Comentario</dt>
              <dd className="col-sm-8">{detalle.comentarioGerente || "—"}</dd>
            </dl>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDetalle(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </MainLayout>
  );
}