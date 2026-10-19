import { useEffect, useState } from "react";
import { Table, Card } from "react-bootstrap";

import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  
const [busqueda, setBusqueda] = useState("");
const [filtroPuesto, setFiltroPuesto] = useState("Todos");
const [cargando, setCargando] = useState(true);
const [error, setError] = useState("");

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  async function obtenerEmpleados() {
  setCargando(true);
  setError("");

  try {
    const respuesta = await api.get("/empleados");
    setEmpleados(respuesta.data);
  } catch (err) {
    console.error(err);
    setError("No se pudieron cargar los empleados.");
  } finally {
    setCargando(false);
  }
  
}

const puestos = [
  "Todos",
  "Administrador",
  "Supervisor",
  "Pizzero",
  "Cocinero",
  "Auxiliar de cocina",
  "Cajera",
  "Mesera",
  "Domiciliario",
  "Personal de limpieza",
];

const empleadosFiltrados = empleados.filter((empleado) => {
  const nombreCompleto =
    `${empleado.nombres ?? ""} ${empleado.apellidos ?? ""}`.toLowerCase();

  const puesto = empleado.puesto?.nombre ?? "";

  const coincideBusqueda =
    nombreCompleto.includes(busqueda.toLowerCase()) ||
    puesto.toLowerCase().includes(busqueda.toLowerCase());

  const coincidePuesto =
    filtroPuesto === "Todos" || puesto === filtroPuesto;

  return coincideBusqueda && coincidePuesto;
});

  return (
    <MainLayout>

      <Card className="shadow-sm">

        <Card.Header className="bg-white border-0 p-4">
  <div className="d-flex justify-content-between align-items-center">
    <div>
      <small className="text-muted">
        {empleados.filter((e) => e.estado === "ACTIVO").length} activos · {empleados.length} total — Vito Pizzería
      </small>

      <h3 className="fw-bold mt-1 mb-0">Empleados</h3>
    </div>

    <button
      type="button"
      className="btn btn-danger"
      onClick={() => alert("Formulario de nuevo empleado pendiente de implementar")}
    >
      + Nuevo Empleado
    </button>
  </div>
</Card.Header>

        <Card.Body>
          <div className="mb-4">
  <input
    type="text"
    className="form-control mb-3"
    placeholder="Buscar empleado o puesto..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
  />

  <div className="d-flex flex-wrap gap-2">
    {puestos.map((puesto) => (
      <button
        key={puesto}
        type="button"
        className={`btn ${
          filtroPuesto === puesto
            ? "btn-danger"
            : "btn-outline-secondary"
        }`}
        onClick={() => setFiltroPuesto(puesto)}
      >
        {puesto}
      </button>
    ))}
  </div>
</div>
{cargando && (
  <div className="alert alert-info text-center">
    Cargando empleados...
  </div>
)}

{error && (
  <div className="alert alert-danger text-center">
    {error}
  </div>
)}
          <Table striped bordered hover responsive>

            <thead>
  <tr>
    <th>EMPLEADO</th>
    <th>PUESTO</th>
    <th>FECHA INGRESO</th>
    <th>ESTADO</th>
    <th>CONTACTO</th>
  </tr>
</thead>

              

          

            <tbody>
{!cargando && !error && empleadosFiltrados.length === 0 && (
  <tr>
    <td colSpan={5} className="text-center text-muted py-4">
      No se encontraron empleados.
    </td>
  </tr>
)}
              {empleadosFiltrados.map((empleado) => (

                <tr key={empleado.id}>
  <td>
    <div className="d-flex align-items-center gap-2">
      <div
  className="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
  style={{ width: "36px", height: "36px", minWidth: "36px", fontSize: "12px" }}
>
  {empleado.nombres?.charAt(0).toUpperCase()}
  {empleado.apellidos?.charAt(0).toUpperCase()}
</div>

      <div>
        <div className="fw-semibold">
          {empleado.nombres} {empleado.apellidos}
        </div>
        <small className="text-muted">{empleado.correo}</small>
      </div>
    </div>
  </td>

  <td>
    <span className="badge bg-light text-dark">
      {empleado.puesto?.nombre || "Sin puesto"}
    </span>
  </td>

  <td>
    {empleado.fechaIngreso
      ? new Date(empleado.fechaIngreso).toLocaleDateString("es-HN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "UTC",
        })
      : "Sin fecha"}
  </td>

  <td>
    <span
      className={`badge rounded-pill ${
        empleado.estado === "ACTIVO"
          ? "bg-success"
          : "bg-secondary"
      }`}
    >
      ● {empleado.estado === "ACTIVO" ? "activo" : "inactivo"}
    </span>
  </td>

  <td>{empleado.telefono || "Sin teléfono"}</td>
</tr>

              ))}

            </tbody>

          </Table>

        </Card.Body>

      </Card>

    </MainLayout>
  );
}