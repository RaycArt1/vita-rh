import {
    Modal,
    Button,
    Form,
    Card
} from "react-bootstrap";

import { useState } from "react";

export default function EditTurnoModal({

    show,

    onHide,

    empleado,

    fecha,

    onSave

}) {

    const [estado, setEstado] = useState("Trabaja");

    const [horaInicio, setHoraInicio] = useState("12:00 PM");

    const [horaFin, setHoraFin] = useState("8:00 PM");

    function guardar(){

        onSave({

            ...empleado,

            estado,

            horaInicio,

            horaFin

        });

    }

    return(

        <Modal

            show={show}

            onHide={onHide}

            centered

        >

            <Modal.Header closeButton>

                <Modal.Title>

                    Modificar Turno

                </Modal.Title>

            </Modal.Header>

            <Modal.Body>

                <Card className="mb-4">

                    <Card.Body>

                        <h5>

                            {empleado?.nombre}

                        </h5>

                        <div>

                            {empleado?.area}

                        </div>

                        <small className="text-muted">

                            Día {fecha}

                        </small>

                    </Card.Body>

                </Card>

                <Form>

                    <Form.Group className="mb-4">

                        <Form.Label>

                            Estado

                        </Form.Label>

                        <Form.Check

                            type="radio"

                            label="Trabaja"

                            checked={estado==="Trabaja"}

                            onChange={()=>setEstado("Trabaja")}

                        />

                        <Form.Check

                            type="radio"

                            label="Descansa"

                            checked={estado==="Descansa"}

                            onChange={()=>setEstado("Descansa")}

                        />

                    </Form.Group>

                    {

                        estado==="Trabaja" &&

                        <>

                            <Form.Group className="mb-3">

                                <Form.Label>

                                    Hora Inicio

                                </Form.Label>

                                <Form.Select

                                    value={horaInicio}

                                    onChange={(e)=>setHoraInicio(e.target.value)}

                                >

                                    <option>

                                        12:00 PM

                                    </option>

                                </Form.Select>

                            </Form.Group>

                            <Form.Group>

                                <Form.Label>

                                    Hora Fin

                                </Form.Label>

                                <Form.Select

                                    value={horaFin}

                                    onChange={(e)=>setHoraFin(e.target.value)}

                                >

                                    <option>

                                        8:00 PM

                                    </option>

                                    <option>

                                        10:00 PM

                                    </option>

                                </Form.Select>

                            </Form.Group>

                        </>

                    }

                    {

                        estado==="Descansa" &&

                        <Card
                            bg="light"
                            className="mt-3"
                        >

                            <Card.Body>

                                🛌 Este empleado tendrá día libre.

                            </Card.Body>

                        </Card>

                    }

                </Form>

            </Modal.Body>

            <Modal.Footer>

                <Button

                    variant="secondary"

                    onClick={onHide}

                >

                    Cancelar

                </Button>

                <Button

                    onClick={guardar}

                >

                    Guardar Cambios

                </Button>

            </Modal.Footer>

        </Modal>

    );

}