import { Card } from "react-bootstrap";
import { useState } from "react";

import "./Calendar.css";
import DayCard from "./DayCard";
import DayDetailsModal from "./DayDetailsModal";

import EditTurnoModal from "./EditTurnoModal";

export default function Calendar() {

    const [showDetails, setShowDetails] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);

    const diasDelMes = 31;
    const primerDia = 2;

    const dias = [];

    // Espacios vacíos antes del día 1
    for (let i = 0; i < primerDia; i++) {
        dias.push(null);
    }

    // Días del mes
    for (let i = 1; i <= diasDelMes; i++) {
        dias.push(i);
    }

    // Completar hasta 42 casillas
    while (dias.length < 42) {
        dias.push(null);
    }

    function abrirDetalle(day) {

        setSelectedDay(day);
        setShowDetails(true);

    }

    function cerrarDetalle() {

        setShowDetails(false);
        setSelectedDay(null);

    }

    function abrirEdicion(empleado) {

    setSelectedEmpleado(empleado);

    setShowEdit(true);

}

function cerrarEdicion() {

    setShowEdit(false);

    setSelectedEmpleado(null);

}

    return (

        <>

            <Card className="shadow-sm">

                <Card.Header>

                    <h3 className="mb-0">

                        Calendario Laboral

                    </h3>

                </Card.Header>

                <Card.Body>

                    <div className="calendar-header">

                        <button className="btn btn-outline-primary">

                            ←

                        </button>

                        <h4 className="m-0">

                            Julio 2026

                        </h4>

                        <button className="btn btn-outline-primary">

                            →

                        </button>

                    </div>

                    <div className="calendar-weekdays">

                        <div>Lun</div>
                        <div>Mar</div>
                        <div>Mié</div>
                        <div>Jue</div>
                        <div>Vie</div>
                        <div>Sáb</div>
                        <div>Dom</div>

                    </div>

                    <div className="calendar-grid">

                        {

                            dias.map((dia, index) => (

                                <DayCard

                                    key={index}

                                    day={dia}

                                    onClick={abrirDetalle}

                                />

                            ))

                        }

                    </div>

                </Card.Body>

            </Card>

            <DayDetailsModal

    show={showDetails}

    onHide={cerrarDetalle}

    day={selectedDay}

    onEdit={abrirEdicion}

/>

<EditTurnoModal

    show={showEdit}

    onHide={cerrarEdicion}

    empleado={selectedEmpleado}

    fecha={selectedDay}

    onSave={(datos)=>{

        console.log("Guardado", datos);

        cerrarEdicion();

    }}

/>
        </>

    );

}