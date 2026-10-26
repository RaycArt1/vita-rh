
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Modal,
  Spinner,
  Table,
} from "react-bootstrap";

import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

const FORMULARIO_INICIAL = {
  nombres: "",
  apellidos: "",
  identidad: "",
  telefono: "",
  correo: "",
  fechaIngreso: "",
  areaId: "",
  puestoId: "",
  salarioBase: "",
};

function fechaParaInput(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
}

function mensajeError(error, alternativo) {
  return error.response?.data?.mensaje || alternativo;
}

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [areas, setAreas] = useState([]);
  const [puestos, setPuestos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroPuesto, setFiltroPuesto] = useState("Todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  const [empleadoDesactivando, setEmpleadoDesactivando] = useState(null);
  const [motivoBaja, setMotivoBaja] = useState("");
  const [procesandoBaja, setProcesandoBaja] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    setError("");

    try {
      const [respuestaEmpleados, respuestaAreas, respuestaPuestos] =
        await Promise.all([
          api.get("/empleados"),
          api.get("/empleados/catalogos/areas"),
          api.get("/empleados/catalogos/puestos"),
        ]);

      setEmpleados(respuestaEmpleados.data);
      setAreas(respuestaAreas.data);
      setPuestos(respuestaPuestos.data);
    } catch (err) {
      console.error(err);
      setError(
        mensajeError(err, "No se pudieron cargar empleados, áreas o puestos.")
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const puestosDisponibles = useMemo(() => {
    if (!formulario.areaId) return [];
    return puestos.filter(
      (puesto) => Number(puesto.areaId) === Number(formulario.areaId)
    );
  }, [puestos, formulario.areaId]);

  const puestosFiltro = useMemo(
    () => [
      "Todos",
      ...new Set(
        empleados
          .map((empleado) => empleado.puesto?.nombre)
          .filter(Boolean)
      ),
    ],
    [empleados]
  );

  const empleadosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return empleados.filter((empleado) => {
      const nombre =
        `${empleado.nombres ?? ""} ${empleado.apellidos ?? ""}`.toLowerCase();
      const puesto = empleado.puesto?.nombre ?? "";
      const correo = empleado.correo ?? "";
      const identidad = empleado.identidad ?? "";

      const coincideBusqueda =
        nombre.includes(termino) ||
        puesto.toLowerCase().includes(termino) ||
        correo.toLowerCase().includes(termino) ||
        identidad.toLowerCase().includes(termino);

      const coincidePuesto =
        filtroPuesto === "Todos" || puesto === filtroPuesto;

      return coincideBusqueda && coincidePuesto;
    });
  }, [empleados, busqueda, filtroPuesto]);

  function abrirNuevo() {
    setEmpleadoEditando(null);
    setFormulario(FORMULARIO_INICIAL);
    setErrorFormulario("");
    setAviso("");
    setMostrarModal(true);
  }

  function abrirEdicion(empleado) {
    setEmpleadoEditando(empleado);
    setFormulario({
      nombres: empleado.nombres ?? "",
      apellidos: empleado.apellidos ?? "",
      identidad: empleado.identidad ?? "",
      telefono: empleado.telefono ?? "",
      correo: empleado.correo ?? "",
      fechaIngreso: fechaParaInput(empleado.fechaIngreso),
      areaId: String(empleado.areaId ?? empleado.puesto?.areaId ?? ""),
      puestoId: String(empleado.puestoId ?? ""),
      salarioBase: String(empleado.salarioBase ?? ""),
    });
    setErrorFormulario("");
    setAviso("");
    setMostrarModal(true);
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((actual) => {
      if (name === "areaId") {
        return { ...actual, areaId: value, puestoId: "" };
      }
      return { ...actual, [name]: value };
    });
  }

  async function guardarEmpleado(evento) {
    evento.preventDefault();
    setErrorFormulario("");
    setAviso("");

    if (!formulario.areaId || !formulario.puestoId) {
      setErrorFormulario("Selecciona un área y un puesto.");
      return;
    }

    const salario = Number(formulario.salarioBase);
    if (!Number.isFinite(salario) || salario <= 0) {
      setErrorFormulario("El salario base debe ser mayor que cero.");
      return;
    }

    const puestoSeleccionado = puestos.find(
      (puesto) => Number(puesto.id) === Number(formulario.puestoId)
    );

    if (
      !puestoSeleccionado ||
      Number(puestoSeleccionado.areaId) !== Number(formulario.areaId)
    ) {
      setErrorFormulario("El puesto debe pertenecer al área seleccionada.");
      return;
    }

    const datos = {
      nombres: formulario.nombres.trim(),
      apellidos: formulario.apellidos.trim(),
      identidad: formulario.identidad.trim(),
      telefono: formulario.telefono.trim(),
      correo: formulario.correo.trim(),
      fechaIngreso: formulario.fechaIngreso,
      areaId: Number(formulario.areaId),
      puestoId: Number(formulario.puestoId),
      salarioBase: salario,
    };

    setGuardando(true);

    try {
      if (empleadoEditando) {
        await api.put(`/empleados/${empleadoEditando.id}`, datos);
        setAviso("Empleado actualizado correctamente.");
      } else {
        await api.post("/empleados", datos);
        setAviso("Empleado registrado correctamente.");
      }

      setMostrarModal(false);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setErrorFormulario(
        mensajeError(err, "No se pudo guardar el empleado.")
      );
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarDesactivacion() {
    if (!empleadoDesactivando) return;

    setProcesandoBaja(true);
    setError("");
    setAviso("");

    try {
      await api.patch(
        `/empleados/${empleadoDesactivando.id}/desactivar`,
        { motivoBaja: motivoBaja.trim() }
      );

      setEmpleadoDesactivando(null);
      setMotivoBaja("");
      setAviso("Empleado desactivado correctamente.");
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(mensajeError(err, "No se pudo desactivar el empleado."));
    } finally {
      setProcesandoBaja(false);
    }
  }

  const activos = empleados.filter((e) => e.estado === "ACTIVO").length;

  return (
    <MainLayout>
      <div className="empleados-pagina">
        <div className="empleados-encabezado d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div>
            <small className="text-muted">
              {activos} activos · {empleados.length} total — Vito Pizzería
            </small>
            <h3 className="fw-bold mt-1 mb-0">Empleados</h3>
          </div>

          <Button variant="danger" onClick={abrirNuevo}>
            + Nuevo empleado
          </Button>
        </div>

        {aviso && (
          <Alert
            variant="success"
            dismissible
            className="mt-3"
            onClose={() => setAviso("")}
          >
            {aviso}
          </Alert>
        )}

        {error && (
          <Alert
            variant="danger"
            dismissible
            className="mt-3"
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <div className="empleados-contenido" style={{ marginTop: 30 }}>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Form.Control
              style={{ width: 280, maxWidth: "100%" }}
              type="search"
              placeholder="Buscar empleado, correo o puesto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <Form.Select
              style={{ width: 220, maxWidth: "100%" }}
              value={filtroPuesto}
              onChange={(e) => setFiltroPuesto(e.target.value)}
              aria-label="Filtrar por puesto"
            >
              {puestosFiltro.map((puesto) => (
                <option key={puesto} value={puesto}>
                  {puesto === "Todos" ? "Todos los puestos" : puesto}
                </option>
              ))}
            </Form.Select>
          </div>

          {cargando ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
              <div className="text-muted mt-2">Cargando empleados...</div>
            </div>
          ) : (
            <div style={{ marginTop: 24 }}>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>EMPLEADO</th>
                    <th>PUESTO / ÁREA</th>
                    <th>FECHA INGRESO</th>
                    <th>ESTADO</th>
                    <th>CONTACTO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {empleadosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No se encontraron empleados.
                      </td>
                    </tr>
                  ) : (
                    empleadosFiltrados.map((empleado) => (
                      <tr key={empleado.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                              style={{
                                width: 36,
                                height: 36,
                                fontSize: 12,
                              }}
                            >
                              {empleado.nombres?.charAt(0).toUpperCase()}
                              {empleado.apellidos?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-semibold">
                                {empleado.nombres} {empleado.apellidos}
                              </div>
                              <small className="text-muted">
                                {empleado.identidad}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div>{empleado.puesto?.nombre || "Sin puesto"}</div>
                          <small className="text-muted">
                            {empleado.area?.nombre ||
                              empleado.puesto?.area?.nombre ||
                              "Sin área"}
                          </small>
                        </td>

                        <td>{fechaParaInput(empleado.fechaIngreso) || "—"}</td>

                        <td>
                          <span
                            className={`badge rounded-pill ${
                              empleado.estado === "ACTIVO"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {empleado.estado === "ACTIVO"
                              ? "Activo"
                              : "Inactivo"}
                          </span>
                        </td>

                        <td>
                          <div>{empleado.telefono || "Sin teléfono"}</div>
                          <small className="text-muted">
                            {empleado.correo}
                          </small>
                        </td>

                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => abrirEdicion(empleado)}
                              disabled={empleado.estado !== "ACTIVO"}
                            >
                              Editar
                            </Button>

                            {empleado.estado === "ACTIVO" && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => {
                                  setEmpleadoDesactivando(empleado);
                                  setMotivoBaja("");
                                }}
                              >
                                Desactivar
                              </Button>
                            )}
                          </div>
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

      <Modal
        show={mostrarModal}
        onHide={() => !guardando && setMostrarModal(false)}
        centered
        size="lg"
      >
        <Form onSubmit={guardarEmpleado}>
          <Modal.Header closeButton={!guardando}>
            <Modal.Title>
              {empleadoEditando ? "Editar empleado" : "Nuevo empleado"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {errorFormulario && (
              <Alert variant="danger">{errorFormulario}</Alert>
            )}

            <div className="row g-3">
              <Form.Group className="col-md-6">
                <Form.Label>Nombres *</Form.Label>
                <Form.Control
                  name="nombres"
                  value={formulario.nombres}
                  onChange={cambiarCampo}
                  required
                  maxLength={100}
                />
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Apellidos *</Form.Label>
                <Form.Control
                  name="apellidos"
                  value={formulario.apellidos}
                  onChange={cambiarCampo}
                  required
                  maxLength={100}
                />
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Identidad *</Form.Label>
                <Form.Control
                  name="identidad"
                  value={formulario.identidad}
                  onChange={cambiarCampo}
                  required
                />
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Teléfono *</Form.Label>
                <Form.Control
                  name="telefono"
                  value={formulario.telefono}
                  onChange={cambiarCampo}
                  required
                  type="tel"
                />
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Correo *</Form.Label>
                <Form.Control
                  name="correo"
                  value={formulario.correo}
                  onChange={cambiarCampo}
                  required
                  type="email"
                />
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Fecha de ingreso *</Form.Label>
                <Form.Control
                  name="fechaIngreso"
                  value={formulario.fechaIngreso}
                  onChange={cambiarCampo}
                  required
                  type="date"
                  max={fechaParaInput(new Date())}
                />
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Área *</Form.Label>
                <Form.Select
                  name="areaId"
                  value={formulario.areaId}
                  onChange={cambiarCampo}
                  required
                >
                  <option value="">Selecciona un área</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Puesto *</Form.Label>
                <Form.Select
                  name="puestoId"
                  value={formulario.puestoId}
                  onChange={cambiarCampo}
                  required
                  disabled={!formulario.areaId}
                >
                  <option value="">Selecciona un puesto</option>
                  {puestosDisponibles.map((puesto) => (
                    <option key={puesto.id} value={puesto.id}>
                      {puesto.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="col-md-6">
                <Form.Label>Salario base *</Form.Label>
                <Form.Control
                  name="salarioBase"
                  value={formulario.salarioBase}
                  onChange={cambiarCampo}
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                />
              </Form.Group>
            </div>

            <small className="d-block text-muted mt-3">
              Los campos marcados con * son obligatorios.
            </small>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setMostrarModal(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="danger" disabled={guardando}>
              {guardando ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Guardando...
                </>
              ) : empleadoEditando ? (
                "Guardar cambios"
              ) : (
                "Registrar empleado"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={Boolean(empleadoDesactivando)}
        onHide={() => !procesandoBaja && setEmpleadoDesactivando(null)}
        centered
      >
        <Modal.Header closeButton={!procesandoBaja}>
          <Modal.Title>Desactivar empleado</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            ¿Deseas desactivar a{" "}
            <strong>
              {empleadoDesactivando?.nombres} {empleadoDesactivando?.apellidos}
            </strong>
            ?
          </p>
          <p className="text-muted small">
            El registro se conservará en el sistema.
          </p>

          <Form.Group>
            <Form.Label>Motivo de baja (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={motivoBaja}
              onChange={(e) => setMotivoBaja(e.target.value)}
              maxLength={500}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setEmpleadoDesactivando(null)}
            disabled={procesandoBaja}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmarDesactivacion}
            disabled={procesandoBaja}
          >
            {procesandoBaja ? "Desactivando..." : "Confirmar desactivación"}
          </Button>
        </Modal.Footer>
      </Modal>
    </MainLayout>
  );
}
