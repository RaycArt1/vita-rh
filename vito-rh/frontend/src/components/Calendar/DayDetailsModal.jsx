import {
    Modal,
    Button,
    Card,
    Row,
    Col,
    Badge
} from "react-bootstrap";

export default function DayDetailsModal({

    show,

    onHide,

    day,

    onEdit

}) {

    // DATOS SIMULADOS
    // Luego vendrán del backend

    const trabajando = [

        {

            id:1,

            nombre:"Juan Pérez",

            area:"Administración",

            horario:"12:00 PM - 8:00 PM"

        },

        {

            id:2,

            nombre:"María López",

            area:"Cocina",

            horario:"12:00 PM - 8:00 PM"

        }

    ];

    const descansando = [

        {

            id:3,

            nombre:"Carlos Ruiz",

            area:"Cocina"

        }

    ];

    const vacaciones = [

        {

            id:4,

            nombre:"Ana Torres",

            area:"Administración"

        }

    ];

    return (

        <Modal

            show={show}

            onHide={onHide}

            size="xl"

            centered

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    Gestión de Turnos • Día {day}

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <Row className="mb-4">

                    <Col>

                        <Card
                            bg="success"
                            text="white"
                        >

                            <Card.Body>

                                <h5>

                                    Trabajando

                                </h5>

                                <h2>

                                    {trabajando.length}

                                </h2>

                            </Card.Body>

                        </Card>

                    </Col>

                    <Col>

                        <Card
                            bg="danger"
                            text="white"
                        >

                            <Card.Body>

                                <h5>

                                    Descansando

                                </h5>

                                <h2>

                                    {descansando.length}

                                </h2>

                            </Card.Body>

                        </Card>

                    </Col>

                    <Col>

                        <Card
                            bg="warning"
                        >

                            <Card.Body>

                                <h5>

                                    Vacaciones

                                </h5>

                                <h2>

                                    {vacaciones.length}

                                </h2>

                            </Card.Body>

                        </Card>

                    </Col>

                </Row>

                <h5 className="mb-3">

                    Trabajando

                </h5>

                {

                    trabajando.map(emp=>(

                        <Card
                            key={emp.id}
                            className="mb-3 shadow-sm"
                        >

                            <Card.Body>

                                <Row>

                                    <Col md={8}>

                                        <h5>

                                            {emp.nombre}

                                        </h5>

                                        <div>

                                            {emp.area}

                                        </div>

                                        <div>

                                            {emp.horario}

                                        </div>

                                        <Badge
                                            bg="success"
                                            className="mt-2"
                                        >

                                            Trabajando

                                        </Badge>

                                    </Col>

                                    <Col
                                        md={4}
                                        className="text-end d-flex align-items-center justify-content-end"
                                    >

                                        <Button

                                            onClick={()=>onEdit(emp)}

                                        >

                                            ⚙ Gestionar

                                        </Button>

                                    </Col>

                                </Row>

                            </Card.Body>

                        </Card>

                    ))

                }

                <hr />

                <h5 className="mb-3">

                    Descansando

                </h5>

                {

                    descansando.map(emp=>(

                        <Card
                            key={emp.id}
                            className="mb-3 shadow-sm"
                        >

                            <Card.Body>

                                <Row>

                                    <Col md={8}>

                                        <h5>

                                            {emp.nombre}

                                        </h5>

                                        <div>

                                            {emp.area}

                                        </div>

                                        <Badge
                                            bg="danger"
                                            className="mt-2"
                                        >

                                            Día Libre

                                        </Badge>

                                    </Col>

                                    <Col
                                        md={4}
                                        className="text-end d-flex align-items-center justify-content-end"
                                    >

                                        <Button
                                            variant="outline-primary"
                                            onClick={()=>onEdit(emp)}
                                        >

                                            Asignar Turno

                                        </Button>

                                    </Col>

                                </Row>

                            </Card.Body>

                        </Card>

                    ))

                }

                <hr />

                <h5 className="mb-3">

                    Vacaciones

                </h5>

                {

                    vacaciones.map(emp=>(

                        <Card
                            key={emp.id}
                            className="mb-3 shadow-sm"
                        >

                            <Card.Body>

                                <Row>

                                    <Col>

                                        <h5>

                                            {emp.nombre}

                                        </h5>

                                        <div>

                                            {emp.area}

                                        </div>

                                        <Badge
                                            bg="warning"
                                            text="dark"
                                            className="mt-2"
                                        >

                                            Vacaciones

                                        </Badge>

                                    </Col>

                                </Row>

                            </Card.Body>

                        </Card>

                    ))

                }

            </Modal.Body>

            <Modal.Footer>

                <Button
                    variant="secondary"
                    onClick={onHide}
                >

                    Cerrar

                </Button>

            </Modal.Footer>

        </Modal>

    );

}