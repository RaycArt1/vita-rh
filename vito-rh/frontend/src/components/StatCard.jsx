
import { Card } from "react-bootstrap";

export default function StatCard({
  titulo,
  valor,
  icono,
  color,
  detalle,
}) {
  return (
    <Card className={`dashboard-stat-card stat-${color} h-100`}>
      <Card.Body>
        <div className="stat-card-top">
          <div className={`stat-icon stat-icon-${color}`}>
            {icono}
          </div>

          {detalle && (
            <span className={`stat-detail stat-detail-${color}`}>
              {detalle}
            </span>
          )}
        </div>

        <div className="stat-value">{valor}</div>
        <div className="stat-title">{titulo}</div>
      </Card.Body>
    </Card>
  );
}
