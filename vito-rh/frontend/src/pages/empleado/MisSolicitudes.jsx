import { useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import MainLayout from "../../layouts/MainLayout";
import api from "../../services/api";

const FORMULARIO_INICIAL = {
  tipo: "VACACION",
  desde: "",
  hasta: "",
  motivo: "",
};

const ETIQUETA_ESTADO = { PENDIENTE: "Pendiente", APROBADA: "Aprobada", RECHAZADA: "Rechazada" };
const COLOR_ESTADO = { PENDIENTE: "warning", APROBADA: "success", RECHAZADA: "danger" };
const ETIQUETA_TIPO = { VACACION: "Vacaciones", PERMISO: "Permiso", INCAPACIDAD: "Incapacidad" };

function mensajeError(err, alternativo) {
  return err.response?.data?.mensaje || alternativo;
}

export default function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  async function cargar() {
    try {
      const respuesta = await api.get("/solicitudes/empleado");
      setSolicitudes(respuesta.data);
      setError("");
    } catch (err) {
      setError(mensajeError(err, "No se pudieron cargar tus solicitudes."));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNueva() {
    setEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setErrorFormulario("");
    setMostrarModal(true);
  }

  function abrirEdicion(s) {
    setEditando(s);
    setFormulario({
      tipo: s.tipoSolicitud,
      desde: s.fechaInicio.slice(0, 10),
      hasta: s.fechaFin.slice(0, 10),
      motivo: s.motivo ?? "",
    });
    setErrorFormulario("");
    setMostrarModal(true);
  }

  function cambiarCampo(e) {
    const { name, value } = e.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  }

  async function guardar(e) {
    e.preventDefault();
    setErrorFormulario("");

    if (formulario.hasta < formulario.desde) {
      setErrorFormulario("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    const datos = {
      tipoSolicitud: formulario.tipo,
      fechaInicio: formulario.desde,
      fechaFin: formulario.hasta,
      motivo: formulario.motivo.trim() || null,
    };

    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/solicitudes/${editando.id}`, datos);
        setAviso("Solicitud actualizada correctamente.");
      } else {
        await api.post("/solicitudes", datos);
        setAviso("Solicitud enviada correctamente.");
      }
      setMostrarModal(false);
      await cargar();
    } catch (err) {
      setErrorFormulario(mensajeError(err, "No se pudo guardar la solicitud."));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <MainLayout>
      <div>
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div>
            <small className="text-muted">Portal del empleado — Vito Pizzería</small>
            <h3 className="fw-bold mt-1 mb-0">Mis solicitudes</h3>
          </div>
          <Button variant="danger" onClick={abrirNueva}>+ Nueva solicitud</Button>
        </div>

        {aviso && (
          <Alert variant="success" dismissible className="mt-3" onClose={() => setAviso("")}>{aviso}</Alert>
        )}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        <div style={{ marginTop: 30 }}>
          {cargando ? (
            <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
          ) : (
            <Table hover responsive className="align-middle">
              <thead>
                <tr>
                  <th>TIPO</th>
                  <th>FECHAS</th>
                  <th>DÍAS</th>
                  <th>ESTADO</th>
                  <th>MOTIVO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Aún no has enviado solicitudes.
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((s) => {
                    const dias = Math.round((new Date(s.fechaFin) - new Date(s.fechaInicio)) / 86400000) + 1;
                    return (
                      <tr key={s.id}>
                        <td>{ETIQUETA_TIPO[s.tipoSolicitud]}</td>
                        <td><small className="font-monospace">{s.fechaInicio.slice(0, 10)} → {s.fechaFin.slice(0, 10)}</small></td>
                        <td>{dias}</td>
                        <td>
                          <Badge bg={COLOR_ESTADO[s.estado]} className="rounded-pill">{ETIQUETA_ESTADO[s.estado]}</Badge>
                        </td>
                        <td><small className="text-muted">{s.motivo || "—"}</small></td>
                        <td>
                          {s.estado === "PENDIENTE" ? (
                            <Button size="sm" variant="outline-secondary" onClick={() => abrirEdicion(s)}>Editar</Button>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      <Modal show={mostrarModal} onHide={() => !guardando && setMostrarModal(false)} centered>
        <Form onSubmit={guardar}>
          <Modal.Header closeButton={!guardando}>
            <Modal.Title>{editando ? "Editar solicitud" : "Nueva solicitud"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {errorFormulario && <Alert variant="danger">{errorFormulario}</Alert>}
            <div className="row g-3">
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
                <Form.Control name="motivo" as="textarea" rows={3} value={formulario.motivo} onChange={cambiarCampo} maxLength={500} />
              </Form.Group>
            </div>
            <small className="d-block text-muted mt-3">
              Las vacaciones deben solicitarse con al menos una semana de anticipación.
            </small>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setMostrarModal(false)} disabled={guardando}>Cancelar</Button>
            <Button type="submit" variant="danger" disabled={guardando}>
              {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Enviar solicitud"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </MainLayout>
  );
}