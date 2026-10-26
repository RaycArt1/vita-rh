import "./Calendar.css";

export default function DayCard({ day, onClick }) {

    if (!day) {
        return <div className="day-card empty"></div>;
    }

    // Datos simulados (luego vendrán del backend)
    const trabajando = day % 7 === 3 ? 0 : 1;
    const descansando = day % 7 === 3 ? 1 : 0;
    const vacaciones = 0;

    return (

        <div
            className="day-card"
            onClick={() => onClick(day)}
        >

            <div className="day-number">

                {day}

            </div>

            <div className="day-info">

                <div className="info-row">

                    <span>Trabajan</span>

                    <strong className="text-success">

                        {trabajando}

                    </strong>

                </div>

                <div className="info-row">

                    <span>Descansan</span>

                    <strong className="text-danger">

                        {descansando}

                    </strong>

                </div>

                <div className="info-row">

                    <span>Vacaciones</span>

                    <strong className="text-warning">

                        {vacaciones}

                    </strong>

                </div>

            </div>

        </div>

    );

}