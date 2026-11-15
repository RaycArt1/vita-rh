import { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Spinner } from "react-bootstrap";
import MainLayout from "../../layouts/MainLayout";
import api from "../../services/api";

const ETIQUETA_ESTADO = { ACTIVO: "Activo", INACTIVO: "Inactivo" };

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

  useEffect(() => {
    api
      .get("/resumen/perfil")
      .then((r) => setPerfil(r.data))
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo cargar tu perfil."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <MainLayout>
      <div>
        <small className="text-muted">Portal del empleado — Vito Pizzería</small>
        <h3 className="fw-bold mt-1 mb-3">Mi perfil</h3>

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
    </MainLayout>
  );
}