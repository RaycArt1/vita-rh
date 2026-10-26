import { useEffect, useState } from "react";
import { Table, Card, Button, Modal } from "react-bootstrap";

import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import { EmpleadoForm } from "../components/EmpleadoForm";

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [empleadoAEditar, setEmpleadoAEditar] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  async function obtenerEmpleados() {
    try {
      const respuesta = await api.get("/empleados");
      setEmpleados(respuesta.data);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  }

  const handleGuardarExitoso = () => {
    setEmpleadoAEditar(null);
    setShowModal(false);
    obtenerEmpleados();
  };

  const handleCerrar = () => {
    setEmpleadoAEditar(null);
    setShowModal(false);
  };

  return (
    <MainLayout>
      <Card className="shadow-sm mt-3 border-0">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3 border-bottom">
          <h4 className="mb-0 fw-bold text-dark">Gestión de Empleados</h4>
          <Button 
            variant="primary" 
            size="sm"
            className="px-3 py-2 fw-semibold shadow-sm"
            onClick={() => {
              setEmpleadoAEditar(null);
              setShowModal(true);
            }}
          >
            + Registrar Empleado
          </Button>
        </Card.Header>

        <Card.Body className="p-0">
          <Table striped hover responsive className="align-middle mb-0 text-center">
            <thead className="table-light text-secondary" style={{ fontSize: '0.9rem' }}>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
                <th>Puesto</th>
                <th>Área</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.length > 0 ? (
                empleados.map((empleado) => (
                  <tr key={empleado.id}>
                    <td className="fw-semibold">{empleado.id}</td>
                    <td>{empleado.nombres || empleado.nombre}</td>
                    <td>{empleado.apellidos || empleado.apellido}</td>
                    <td>{empleado.telefono || 'N/A'}</td>
                    <td>{empleado.puesto?.nombre}</td>
                    <td>{empleado.puesto?.area?.nombre || empleado.area?.nombre}</td>
                    <td>
                      <span className={`badge bg-${empleado.estado === 'ACTIVO' ? 'success' : 'secondary'}`}>
                        {empleado.estado || 'ACTIVO'}
                      </span>
                    </td>
                    <td>
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        className="px-2 py-1"
                        onClick={() => {
                          setEmpleadoAEditar(empleado);
                          setShowModal(true);
                        }}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-5">
                    No hay empleados registrados todavía. Haz clic en el botón superior para agregar uno.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* MODAL PARA EL FORMULARIO FLOTANTE */}
      <Modal show={showModal} onHide={handleCerrar} centered backdrop="static">
        <Modal.Header closeButton className="bg-light py-2">
          <Modal.Title className="fw-bold" style={{ fontSize: '1.1rem' }}>
            {empleadoAEditar ? "Editar Empleado" : "Nuevo Empleado"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <EmpleadoForm 
            empleadoAEditar={empleadoAEditar}
            alGuardarExitoso={handleGuardarExitoso}
            alCancelar={handleCerrar}
          />
        </Modal.Body>
      </Modal>
    </MainLayout>
  );
}