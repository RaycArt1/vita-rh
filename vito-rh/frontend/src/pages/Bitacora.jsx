import { useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Spinner, Table } from "react-bootstrap";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

const POR_PAGINA = 20;

const ACCIONES = [
  { valor: "", etiqueta: "Todas las acciones" },
  { valor: "INSERT", etiqueta: "Registro creado" },
  { valor: "UPDATE", etiqueta: "Cambio realizado" },
  { valor: "DELETE", etiqueta: "Registro eliminado" },
];

const TABLAS = [
  { valor: "", etiqueta: "Todos los módulos" },
  { valor: "Usuario", etiqueta: "Usuarios" },
  { valor: "Solicitud", etiqueta: "Solicitudes" },
  { valor: "Empleado", etiqueta: "Empleados" },
  { valor: "Role", etiqueta: "Roles" },
];

const COLOR_ACCION = { INSERT: "success", UPDATE: "warning", DELETE: "danger" };
const ETIQUETA_ACCION = {
  INSERT: "Registro creado",
  UPDATE: "Cambio realizado",
  DELETE: "Registro eliminado",
};
const ETIQUETA_TABLA = {
  Usuario: "Usuario",
  Solicitud: "Solicitud",
  Empleado: "Empleado",
  Role: "Rol",
};

const FILTROS_INICIALES = { desde: "", hasta: "", accion: "", tabla: "" };

export default function Bitacora() {
  const [registros, setRegistros] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargar(paginaActual = 1, filtrosActuales = FILTROS_INICIALES) {
    setCargando(true);
    setError("");

    try {
      const params = { pagina: paginaActual, porPagina: POR_PAGINA };
      Object.entries(filtrosActuales).forEach(([clave, valor]) => {
        if (valor) params[clave] = valor;
      });

      const respuesta = await api.get("/bitacora", { params });
      setRegistros(respuesta.data.registros);
      setTotal(respuesta.data.total);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "No se pudo cargar el historial.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar(1, FILTROS_INICIALES);
  }, []);

  function cambiarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros((actual) => ({ ...actual, [name]: value }));
  }

  function aplicarFiltros(evento) {
    evento.preventDefault();
    setPagina(1);
    cargar(1, filtros);
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES);
    setPagina(1);
    cargar(1, FILTROS_INICIALES);
  }

  function cambiarPagina(nueva) {
    setPagina(nueva);
    cargar(nueva, filtros);
  }

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <MainLayout>
      <div>
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div>
            <small className="text-muted">Registro de actividad — Vito Pizzería</small>
            <h3 className="fw-bold mt-1 mb-0">Historial de actividad</h3>
          </div>
          <Button variant="outline-secondary" onClick={() => cargar(pagina, filtros)}>
            Actualizar
          </Button>
        </div>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        <Form onSubmit={aplicarFiltros} className="d-flex gap-2 flex-wrap align-items-end mt-4 mb-3">
          <Form.Group>
            <Form.Label className="small mb-1">Desde</Form.Label>
            <Form.Control name="desde" type="date" value={filtros.desde} onChange={cambiarFiltro} />
          </Form.Group>
          <Form.Group>
            <Form.Label className="small mb-1">Hasta</Form.Label>
            <Form.Control name="hasta" type="date" value={filtros.hasta} onChange={cambiarFiltro} />
          </Form.Group>
          <Form.Group>
            <Form.Label className="small mb-1">Tipo de cambio</Form.Label>
            <Form.Select name="accion" value={filtros.accion} onChange={cambiarFiltro}>
              {ACCIONES.map((a) => (
                <option key={a.valor} value={a.valor}>{a.etiqueta}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label className="small mb-1">Módulo</Form.Label>
            <Form.Select name="tabla" value={filtros.tabla} onChange={cambiarFiltro}>
              {TABLAS.map((t) => (
                <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button type="submit" variant="danger">Filtrar</Button>
          <Button variant="outline-secondary" onClick={limpiarFiltros}>Limpiar</Button>
        </Form>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
          </div>
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>FECHA Y HORA</th>
                <th>USUARIO</th>
                <th>ACCIÓN</th>
                <th>MÓDULO</th>
                <th>REGISTRO</th>
                <th>DETALLE</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No hay actividad registrada.
                  </td>
                </tr>
              ) : (
                registros.map((r) => (
                  <tr key={r.id}>
                    <td><small>{new Date(r.fechaHora).toLocaleString()}</small></td>
                    <td>{r.usuario?.username ?? "—"}</td>
                    <td>
                      <Badge bg={COLOR_ACCION[r.accion]} className="rounded-pill">
                        {ETIQUETA_ACCION[r.accion] ?? r.accion}
                      </Badge>
                    </td>
                    <td>{ETIQUETA_TABLA[r.tablaAfectada] ?? r.tablaAfectada}</td>
                    <td>#{r.idRegistro}</td>
                    <td><small className="text-muted">{r.descripcion || "—"}</small></td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {total} registros · página {pagina} de {totalPaginas}
          </small>
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-secondary" disabled={pagina <= 1} onClick={() => cambiarPagina(pagina - 1)}>
              Anterior
            </Button>
            <Button size="sm" variant="outline-secondary" disabled={pagina >= totalPaginas} onClick={() => cambiarPagina(pagina + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}