import { useEffect, useState } from "react";
import { Table, Card } from "react-bootstrap";

import MainLayout from "../layouts/MainLayout";
import api from "../services/api";

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  async function obtenerEmpleados() {
    try {
      const respuesta = await api.get("/empleados");
      setEmpleados(respuesta.data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <MainLayout>

      <Card className="shadow-sm">

        <Card.Header>
          <h4 className="mb-0">
            Empleados
          </h4>
        </Card.Header>

        <Card.Body>

          <Table striped bordered hover responsive>

            <thead>

              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Puesto</th>
                <th>Área</th>
                <th>Estado</th>
              </tr>

            </thead>

            <tbody>

              {empleados.map((empleado) => (

                <tr key={empleado.id}>

                  <td>{empleado.id}</td>

                  <td>{empleado.nombre}</td>

                  <td>{empleado.apellido}</td>

                  <td>{empleado.puesto?.nombre}</td>

                  <td>{empleado.area?.nombre}</td>

                  <td>{empleado.estado}</td>

                </tr>

              ))}

            </tbody>

          </Table>

        </Card.Body>

      </Card>

    </MainLayout>
  );
}