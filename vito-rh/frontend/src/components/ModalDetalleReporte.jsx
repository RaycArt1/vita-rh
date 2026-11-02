import React from 'react';

export default function ModalDetalleReporte({ reporte, onClose }) {
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="modal-title fw-bold">Detalle del Reporte</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="d-flex gap-2 mb-3">
            <span className="badge bg-danger-subtle text-danger">{reporte.tipo}</span>
            <span className="badge bg-warning-subtle text-warning-emphasis">{reporte.gravedad}</span>
          </div>

          <small className="text-muted d-block">Empleado</small>
          <h4 className="fw-bold mb-3">{reporte.empleado}</h4>

          <div className="p-3 bg-light rounded mb-3">
            <small className="text-muted d-block mb-1">Descripción</small>
            <p className="m-0 text-secondary">{reporte.descripcion}</p>
          </div>

          {reporte.seguimiento && (
            <div className="p-3 bg-success-subtle rounded mb-3">
              <small className="text-success fw-bold d-block mb-1">Seguimiento</small>
              <p className="m-0 text-success">{reporte.seguimiento}</p>
            </div>
          )}

          <div className="d-flex justify-content-between text-muted small mt-2">
            <span>Supervisor: <strong>{reporte.supervisor}</strong></span>
            <span>{reporte.fecha}</span>
          </div>
        </div>
      </div>
    </div>
  );
}