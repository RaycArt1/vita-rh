
import { useEffect, useState } from "react";
import { Card, Alert, Spinner } from "react-bootstrap";

import api from "../../services/api";
import "./Calendar.css";
import DayCard from "./DayCard";
import DayDetailsModal from "./DayDetailsModal";
import EditTurnoModal from "./EditTurnoModal";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DIAS_SEMANA = [
  "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom",
];

export default function Calendar() {
  const [mesActual, setMesActual] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });

  const [horarios, setHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(true);
  const [errorHorarios, setErrorHorarios] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [showDetails, setShowDetails] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);

  async function cargarHorarios() {
    try {
      setCargandoHorarios(true);
      setErrorHorarios("");

      const respuesta = await api.get("/horarios");

      if (!Array.isArray(respuesta.data)) {
        throw new Error("La API devolvió un formato de horarios inesperado.");
      }

      setHorarios(respuesta.data);
    } catch (error) {
      setErrorHorarios(
        error.response?.data?.mensaje ||
          error.message ||
          "No se pudieron cargar los horarios."
      );
    } finally {
      setCargandoHorarios(false);
    }
  }

  useEffect(() => {
    cargarHorarios();
  }, []);

  const anio = mesActual.getFullYear();
  const mes = mesActual.getMonth();

  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();

  const dias = [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: diasDelMes }, (_, i) => i + 1),
  ];

  while (dias.length % 7 !== 0) {
    dias.push(null);
  }

  function cambiarMes(cantidad) {
    setMesActual((actual) =>
      new Date(actual.getFullYear(), actual.getMonth() + cantidad, 1)
    );
  }

  function abrirDetalle(dia) {
    if (!dia) return;

    const fecha = [
      anio,
      String(mes + 1).padStart(2, "0"),
      String(dia).padStart(2, "0"),
    ].join("-");

    setSelectedDay(fecha);
    setShowDetails(true);
  }

  function cerrarDetalle() {
    setShowDetails(false);
  }

  function abrirEdicion(empleado) {
    setSelectedEmpleado(empleado);
    setShowEdit(true);
  }

  function cerrarEdicion() {
    setShowEdit(false);
    setSelectedEmpleado(null);
  }

  async function guardarHorario(datos) {
    if (guardando) return;

    const empleadoId = Number(datos.empleadoId ?? datos.id);
    const areaId = Number(datos.areaId ?? datos.area?.id);
    const turno = datos.turno;

    if (!selectedDay) {
      alert("Seleccioná primero un día del calendario.");
      return;
    }

    if (!Number.isInteger(empleadoId) || empleadoId <= 0) {
      alert("No se identificó correctamente al empleado. Revisá el formulario.");
      return;
    }

    if (!Number.isInteger(areaId) || areaId <= 0) {
      alert("No se identificó el área del empleado.");
      return;
    }

    if (!["T12_20", "T12_22"].includes(turno)) {
      alert("Seleccioná un turno válido antes de guardar.");
      return;
    }

    try {
      setGuardando(true);

      await api.post("/horarios", {
        empleadoId,
        areaId,
        fechaInicio: `${selectedDay}T12:00:00`,
        fechaFin: `${selectedDay}T12:00:00`,
        turno,
      });

      await cargarHorarios();

      cerrarEdicion();
      cerrarDetalle();

      alert("¡Turno guardado correctamente en la base de datos!");
    } catch (error) {
      console.error(
        "Error al guardar el horario:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.mensaje ||
          "No se pudo guardar el turno. Revisá los datos y la conexión con el backend."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header>
          <h3 className="mb-0">Calendario Laboral</h3>
        </Card.Header>

        <Card.Body>
          <div className="calendar-header">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => cambiarMes(-1)}
              aria-label="Mes anterior"
            >
              ←
            </button>

            <h4 className="m-0">
              {MESES[mes]} {anio}
            </h4>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => cambiarMes(1)}
              aria-label="Mes siguiente"
            >
              →
            </button>
          </div>

          {cargandoHorarios && (
            <div className="my-3" role="status">
              <Spinner animation="border" size="sm" className="me-2" />
              Cargando horarios...
            </div>
          )}

          {errorHorarios && (
            <Alert variant="danger" className="my-3">
              {errorHorarios}
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={cargarHorarios}
                >
                  Volver a intentar
                </button>
              </div>
            </Alert>
          )}

          {!cargandoHorarios && !errorHorarios && (
            <p className="text-muted my-3">
              Horarios registrados: {horarios.length}
            </p>
          )}

          <div className="calendar-weekdays">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia}>{dia}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {dias.map((dia, index) => (
              <DayCard
                key={`${anio}-${mes}-${index}`}
                day={dia}
                anio={anio}
                mes={mes}
                horarios={horarios}
                onClick={abrirDetalle}
              />
            ))}
          </div>
        </Card.Body>
      </Card>

      <DayDetailsModal
        show={showDetails}
        onHide={cerrarDetalle}
        day={selectedDay}
        horarios={horarios}
        onEdit={abrirEdicion}
      />

      <EditTurnoModal
        show={showEdit}
        onHide={cerrarEdicion}
        empleado={selectedEmpleado}
        fecha={selectedDay}
        onSave={guardarHorario}
      />

      {guardando && (
        <div className="text-center mt-3" role="status">
          <Spinner animation="border" size="sm" className="me-2" />
          Guardando turno...
        </div>
      )}
    </>
  );
}
