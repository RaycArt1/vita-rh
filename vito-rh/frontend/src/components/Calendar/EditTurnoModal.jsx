
import { Modal, Button, Form, Card, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";

export default function EditTurnoModal({
  show,
  onHide,
  empleado,
  fecha,
  onSave,
}) {
  const [horaFin, setHoraFin] = useState("20:00");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;

    setError("");
    setHoraFin(
      empleado?.turno === "T12_22" ||
        empleado?.horaFin === "22:00"
        ? "22:00"
        : "20:00"
    );
  }, [show, empleado, fecha]);

  async function guardar() {
    if (!empleado || !fecha) {
      setError("Seleccioná un empleado y una fecha.");
      return;
    }

    const empleadoId = Number(
      empleado.empleadoId ?? empleado.id
    );

    const areaId = Number(
      empleado.areaId ?? empleado.area?.id
    );

    if (!Number.isInteger(empleadoId) || empleadoId <= 0) {
      setError(
        "No se encontró el ID del empleado. Seleccioná un empleado registrado."
      );
      return;
    }

    if (!Number.isInteger(areaId) || areaId <= 0) {
      setError(
        "No se encontró el ID del área. Verificá el área asignada al empleado."
      );
      return;
    }

    setError("");

    try {
      await onSave({
        empleadoId,
        areaId,
        fecha,
        horaInicio: "12:00",
        horaFin,
        turno: horaFin === "22:00" ? "T12_22" : "T12_20",
      });
    } catch (err) {
      setError(err.message || "No se pudo guardar el turno.");
    }
  }

  const nombreEmpleado =
    empleado?.nombreCompleto ??
    empleado?.nombre ??
    empleado?.nombres ??
    empleado?.empleado?.nombreCompleto ??
    empleado?.empleado?.nombre ??
    "Empleado";

  const nombreArea =
    typeof empleado?.area === "string"
      ? empleado.area
      : empleado?.area?.nombre ??
        empleado?.puesto?.area?.nombre ??
        "Área no disponible";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Asignar turno</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Card className="mb-4">
          <Card.Body>
            <h5>{nombreEmpleado}</h5>
            <div>{nombreArea}</div>
            <small className="text-muted">
              Fecha: {fecha ?? "No seleccionada"}
            </small>
          </Card.Body>
        </Card>

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        <Form.Group>
          <Form.Label>Horario de trabajo</Form.Label>

          <Form.Select
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
          >
            <option value="20:00">
              12:00 p. m. – 8:00 p. m.
            </option>
            <option value="22:00">
              12:00 p. m. – 10:00 p. m.
            </option>
          </Form.Select>

          <Form.Text className="text-muted">
            El turno se asignará al empleado seleccionado para la fecha indicada.
          </Form.Text>
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>

        <Button
          variant="primary"
          onClick={guardar}
          disabled={!empleado || !fecha}
        >
          Guardar turno
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
