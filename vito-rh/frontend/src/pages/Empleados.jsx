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

      <div className="empleados-pagina">

        <div className="empleados-encabezado d-flex justify-content-between align-items-center">
  
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


        <div className="empleados-contenido" style={{ marginTop: "30px" }}>
          <div
  className="empleados-filtros"
  style={{
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    gap: "10px",
    width: "100%"
  }}
>
  <input
  style={{ width: "230px", minWidth: "180px", flexShrink: 0 }}
    type="text"
    className="form-control empleados-buscador"
    placeholder="Buscar empleado o puesto..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
  />
<div
  className="empleados-puestos"
  style={{
    display: "flex",
    flexWrap: "nowrap",
    gap: "4px",
    flex: 1,
    minWidth: 0,
    overflowX: "auto"
  }}
>

  
    {puestos.map((puesto) => (
      <button
  key={puesto}
  type="button"
  className={`btn ${filtroPuesto === puesto ? "btn-danger" : "btn-outline-secondary"}`}
  style={{
    fontSize: "10px",
    padding: "6px 7px",
    whiteSpace: "nowrap",
    flexShrink: 0
  }}
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
          <div style={{ marginTop: "24px" }}>
  <Table hover responsive className="align-middle">

            <thead>
  <tr>
    <th style={{ color: "#6b7280", fontSize: "12px" }}>EMPLEADO</th>
    <th style={{ color: "#6b7280",fontSize: "12px"  }}>PUESTO</th>
    <th style={{ color: "#6b7280", fontSize: "12px"  }}>FECHA INGRESO</th>
    <th style={{ color: "#6b7280", fontSize: "12px"  }}>ESTADO</th>
    <th style={{ color: "#6b7280", fontSize: "12px" }}>CONTACTO</th>
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
        <div className="fw-semibold" style={{ fontSize: "13px" }}>
  {empleado.nombres} {empleado.apellidos}
</div>
        <small className="text-muted">{empleado.correo}</small>
      </div>
    </div>
  </td>

  <td>
    <span
  className="badge bg-light"
  style={{
  fontSize: "11px",
  fontWeight: 400,
  color: "#000000"
}}
>
  {empleado.puesto?.nombre || "Sin puesto"}
</span>
  </td>

  <td>
  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
  {empleado.fechaIngreso
    ? new Date(empleado.fechaIngreso).toISOString().slice(0, 10)
    : "Sin fecha"}
</span>
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

  <td>
  <span style={{ fontSize: "12px", color: "#9ca3af" }}>
    {empleado.telefono || "Sin teléfono"}
  </span>
</td>
</tr>

              ))}

            </tbody>

          </Table>
          </div>

        </div>


      </div>
      

    </MainLayout>
  );
}