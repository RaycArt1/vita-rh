import { useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Spinner, Table } from "react-bootstrap";
import MainLayout from "../../layouts/MainLayout";
import api from "../../services/api";

const COLOR_GRAVEDAD = { Leve: "secondary", Moderado: "warning", Grave: "danger", Informativo: "info" };

export default function MisLlamados() {
  const [llamados, setLlamados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [rechazandoId, setRechazandoId] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    const r = await api.get("/resumen/llamados");
    setLlamados(r.data);
  }

  useEffect(() => {
    cargar()
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudieron cargar tus llamados."))
      .finally(() => setCargando(false));
  }, []);

  async function responder(id, decision, observacion = "") {
    setError("");
    setEnviando(true);
    try {
      await api.patch(`/resumen/llamados/${id}/responder`, { decision, observacion });
      setRechazandoId(null);
      setMotivo("");
      await cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo registrar tu respuesta.");
    } finally {
      setEnviando(false);
    }
  }

  function confirmarRechazo(id) {
    if (!motivo.trim()) {
      setError("Debes escribir el motivo del rechazo.");
      return;
    }
    responder(id, "RECHAZADO", motivo.trim());
  }

  return (
    <MainLayout>
      <div>
        <small className="text-muted">Portal del empleado — Vito Pizzería</small>
        <h3 className="fw-bold mt-1 mb-3">Mis llamados de atención</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        {cargando ? (
          <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>N.º LLAMADO</th>
                <th>FECHA</th>
                <th>TIPO</th>
                <th>DESCRIPCIÓN</th>
                <th>EMITIDO POR</th>
                <th>RESPUESTA</th>
              </tr>
            </thead>
            <tbody>
              {llamados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No tienes llamados de atención registrados.
                  </td>
                </tr>
              ) : (
                llamados.map((l) => (
                  <tr key={l.id}>
                    <td><Badge bg="dark">{l.numeroLlamado} de 4</Badge></td>
                    <td><small className="font-monospace">{l.fecha.slice(0, 10)}</small></td>
                    <td><Badge bg={COLOR_GRAVEDAD[l.tipoFalta] ?? "secondary"}>{l.tipoFalta}</Badge></td>
                    <td><small className="text-muted">{l.descripcionFalta}</small></td>
                    <td>{l.emisor?.username ?? "—"}</td>
                    <td>
                      {l.decision === "ACEPTADO" && (
                        <small className="text-success">Aceptado {l.fechaFirma?.slice(0, 10)}</small>
                      )}
                      {l.decision === "RECHAZADO" && (
                        <div>
                          <small className="text-danger d-block">Rechazado {l.fechaFirma?.slice(0, 10)}</small>
                          <small className="text-muted">Motivo: {l.observacionEmpleado}</small>
                        </div>
                      )}
                      {!l.decision && rechazandoId !== l.id && (
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="outline-success" disabled={enviando} onClick={() => responder(l.id, "ACEPTADO")}>
                            Aceptar
                          </Button>
                          <Button size="sm" variant="outline-danger" disabled={enviando} onClick={() => { setRechazandoId(l.id); setMotivo(""); setError(""); }}>
                            Rechazar
                          </Button>
                        </div>
                      )}
                      {!l.decision && rechazandoId === l.id && (
                        <div style={{ minWidth: 260 }}>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Escribe por qué no estás de acuerdo con este llamado (obligatorio)"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            maxLength={500}
                          />
                          <div className="d-flex gap-2 mt-2">
                            <Button size="sm" variant="danger" disabled={enviando} onClick={() => confirmarRechazo(l.id)}>
                              {enviando ? "Enviando..." : "Confirmar rechazo"}
                            </Button>
                            <Button size="sm" variant="outline-secondary" disabled={enviando} onClick={() => { setRechazandoId(null); setMotivo(""); }}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}

        {llamados.length >= 3 && (
          <Alert variant="warning" className="mt-3">
            Tienes {llamados.length} llamados de atención. Al llegar a 4 se permite el despido justificado.
          </Alert>
        )}
      </div>
    </MainLayout>
  );
}