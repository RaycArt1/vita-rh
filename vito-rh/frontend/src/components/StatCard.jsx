import { Card } from "react-bootstrap";

export default function StatCard({
  titulo,
  valor,
  icono,
  color,
}) {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body>

        <div className="d-flex justify-content-between align-items-center">

          <div>
            <h6 className="text-muted mb-2">
              {titulo}
            </h6>

            <h2 className="fw-bold">
              {valor}
            </h2>
          </div>

          <div className={`fs-1 text-${color}`}>
            {icono}
          </div>

        </div>

      </Card.Body>
    </Card>
  );
}