import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";

import { Row, Col, Card, ListGroup } from "react-bootstrap";

import {
  FaUsers,
  FaCalendarAlt,
  FaUmbrellaBeach,
  FaFolderOpen,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function Dashboard() {
  return (
    <MainLayout>

      <h2 className="mb-4 fw-bold">
        Dashboard
      </h2>

      <Row className="g-4">

        <Col md={4}>
          <StatCard
            titulo="Empleados"
            valor="12"
            icono={<FaUsers />}
            color="primary"
          />
        </Col>

        <Col md={4}>
          <StatCard
            titulo="Horarios"
            valor="7"
            icono={<FaCalendarAlt />}
            color="success"
          />
        </Col>

        <Col md={4}>
          <StatCard
            titulo="Vacaciones"
            valor="3"
            icono={<FaUmbrellaBeach />}
            color="warning"
          />
        </Col>

        <Col md={6}>
          <StatCard
            titulo="Expedientes"
            valor="8"
            icono={<FaFolderOpen />}
            color="secondary"
          />
        </Col>

        <Col md={6}>
          <StatCard
            titulo="Llamados de Atención"
            valor="2"
            icono={<FaExclamationTriangle />}
            color="danger"
          />
        </Col>

      </Row>

      <Card className="mt-5 shadow-sm border-0">

        <Card.Header className="fw-bold">
          Actividad reciente
        </Card.Header>

        <ListGroup variant="flush">

          <ListGroup.Item>
            Juan Pérez solicitó vacaciones.
          </ListGroup.Item>

          <ListGroup.Item>
            Ana López fue asignada al turno de mañana.
          </ListGroup.Item>

          <ListGroup.Item>
            Carlos Ramírez recibió un llamado de atención.
          </ListGroup.Item>

          <ListGroup.Item>
            Se registró un nuevo empleado.
          </ListGroup.Item>

        </ListGroup>

      </Card>

    </MainLayout>
  );
}