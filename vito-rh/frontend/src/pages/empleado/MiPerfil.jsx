import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import MainLayout from "../../layouts/MainLayout";
import api from "../../services/api";

const ETIQUETA_ESTADO = { ACTIVO: "Activo", INACTIVO: "Inactivo" };
const REGEX_ESPECIAL = /[.\-!@#$%^&*(),?":{}|<>/]/;
const FORMULARIO_PASSWORD = { actual: "", nueva: "", confirmar: "" };

function Dato({ etiqueta, valor }) {
  return (
    <div className="mb-3">
      <div className="text-muted small">{etiqueta}</div>
      <div className="fw-semibold">{valor || "—"}</div>
    </div>
  );
}

export default function MiPerfil() {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formPassword, setFormPassword] = useState(FORMULARIO_PASSWORD);
  const [errorPassword, setErrorPassword] = useState("");
  const [avisoPassword, setAvisoPassword] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  useEffect(() => {
    api
      .get("/resumen/perfil")
      .then((r) => setPerfil(r.data))
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo cargar tu perfil."))
      .finally(() => setCargando(false));
  }, []);

  function abrirCambioPassword() {
    setFormPassword(FORMULARIO_PASSWORD);
    setErrorPassword("");
    setVerActual(false);
    setVerNueva(false);
    setVerConfirmar(false);
    setMostrarPassword(true);
  }

  function cambiarCampoPassword(e) {
    const { name, value } = e.target;
    setFormPassword((actual) => ({ ...actual, [name]: value }));
  }

  async function guardarPassword(e) {
    e.preventDefault();
    setErrorPassword("");

    if (formPassword.nueva.length < 8) {
      setErrorPassword("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!REGEX_ESPECIAL.test(formPassword.nueva)) {
      setErrorPassword("La nueva contraseña debe contener al menos un carácter especial (ej. @, $, !, %).");
      return;
    }
    if (formPassword.nueva !== formPassword.confirmar) {
      setErrorPassword("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    setGuardandoPassword(true);
    try {
      await api.put("/resumen/password", {
        actual: formPassword.actual,
        nueva: formPassword.nueva,
      });
      setMostrarPassword(false);
      setAvisoPassword("Tu contraseña fue actualizada correctamente.");
    } catch (err) {
      setErrorPassword(err.response?.data?.mensaje || "No se pudo cambiar la contraseña.");
    } finally {
      setGuardandoPassword(false);
    }
  }

  return (
    <MainLayout>
      <div>
        <small className="text-muted">Portal del empleado — Vito Pizzería</small>
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mt-1 mb-3">
          <h3 className="fw-bold mb-0">Mi perfil</h3>
          <Button variant="outline-danger" onClick={abrirCambioPassword}>
            Cambiar contraseña
          </Button>
        </div>

        {avisoPassword && (
          <Alert variant="success" dismissible onClose={() => setAvisoPassword("")}>
            {avisoPassword}
          </Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}

        {cargando ? (
          <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
        ) : perfil && (
          <Row className="g-3">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3">Datos personales</h6>
                  <Dato etiqueta="Nombres" valor={perfil.nombres} />
                  <Dato etiqueta="Apellidos" valor={perfil.apellidos} />
                  <Dato etiqueta="Identidad" valor={perfil.identidad} />
                  <Dato etiqueta="Teléfono" valor={perfil.telefono} />
                  <Dato etiqueta="Correo" valor={perfil.correo} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3">Datos laborales</h6>
                  <Dato etiqueta="Puesto" valor={perfil.puesto?.nombre} />
                  <Dato etiqueta="Área" valor={perfil.area?.nombre} />
                  <Dato etiqueta="Fecha de ingreso" valor={perfil.fechaIngreso?.slice(0, 10)} />
                  <Dato etiqueta="Estado" valor={ETIQUETA_ESTADO[perfil.estado]} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      <Modal show={mostrarPassword} onHide={() => !guardandoPassword && setMostrarPassword(false)} centered>
        <Form onSubmit={guardarPassword}>
          <Modal.Header closeButton={!guardandoPassword}>
            <Modal.Title>Cambiar contraseña</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {errorPassword && <Alert variant="danger">{errorPassword}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Contraseña actual *</Form.Label>
              <div className="input-group">
                <Form.Control
                  name="actual"
                  type={verActual ? "text" : "password"}
                  autoComplete="current-password"
                  value={formPassword.actual}
                  onChange={cambiarCampoPassword}
                  required
                />
                <Button variant="outline-secondary" onClick={() => setVerActual(!verActual)}>
                  {verActual ? "Ocultar" : "Ver"}
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nueva contraseña *</Form.Label>
              <div className="input-group">
                <Form.Control
                  name="nueva"
                  type={verNueva ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres y un carácter especial"
                  value={formPassword.nueva}
                  onChange={cambiarCampoPassword}
                  required
                />
                <Button variant="outline-secondary" onClick={() => setVerNueva(!verNueva)}>
                  {verNueva ? "Ocultar" : "Ver"}
                </Button>
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label>Confirmar nueva contraseña *</Form.Label>
              <div className="input-group">
                <Form.Control
                  name="confirmar"
                  type={verConfirmar ? "text" : "password"}
                  autoComplete="new-password"
                  value={formPassword.confirmar}
                  onChange={cambiarCampoPassword}
                  required
                />
                <Button variant="outline-secondary" onClick={() => setVerConfirmar(!verConfirmar)}>
                  {verConfirmar ? "Ocultar" : "Ver"}
                </Button>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setMostrarPassword(false)} disabled={guardandoPassword}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" disabled={guardandoPassword}>
              {guardandoPassword ? "Guardando..." : "Guardar contraseña"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </MainLayout>
  );
}