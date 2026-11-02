import React, { useState, useEffect } from 'react';
import api, { fetchReportes } from '../services/api';
import ModalNuevoReporte from '../components/ModalNuevoReporte';
import ModalDetalleReporte from '../components/ModalDetalleReporte';
import MainLayout from '../layouts/MainLayout';

export default function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  const cargarReportes = async () => {
    try {
      const data = await fetchReportes();
      setReportes(Array.isArray(data) ? data : data.reportes || []);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const handleEliminar = async (e, reporteItem) => {
    e.stopPropagation();
    const idReal = reporteItem.id || reporteItem._id;
    
    if (!idReal) {
      alert("Error: No se encontró un ID válido para este reporte.");
      return;
    }

    if (window.confirm("¿Estás segura de que deseas eliminar este reporte?")) {
      try {
        await api.delete(`/reportes/${idReal}`);
        setReportes(reportes.filter((r) => (r.id || r._id) !== idReal));
      } catch (err) {
        console.error("Error al eliminar el reporte en el servidor:", err);
        alert("Hubo un error al intentar eliminar el reporte. Revisa la consola.");
      }
    }
  };

  const reportesFiltrados = reportes.filter(r => {
    const cumpleFiltro = filtro === 'Todos' || 
      r.tipo?.toLowerCase() === filtro.toLowerCase() || 
      r.gravedad?.toLowerCase() === filtro.toLowerCase();
    
    const cumpleBusqueda = (r.empleado?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
      (r.descripcion?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
      (r.supervisor?.toLowerCase() || '').includes(busqueda.toLowerCase());

    return cumpleFiltro && cumpleBusqueda;
  });

  const graves = reportes.filter(r => r.gravedad?.toLowerCase() === 'grave').length;
  const moderados = reportes.filter(r => r.gravedad?.toLowerCase() === 'moderado').length;
  const informativos = reportes.filter(r => r.gravedad?.toLowerCase() === 'informativo' || r.gravedad?.toLowerCase() === 'leve').length;

  return (
    <MainLayout>
      <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Reportes e Incidencias</h2>
            <p className="text-muted mb-0">Administra los reportes e incidencias del personal en Vito Pizzería.</p>
          </div>
          <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2" onClick={() => setShowModalNuevo(true)}>
            + Nuevo Reporte
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center">
              <div className="bg-danger-subtle text-danger p-3 rounded-circle me-3 fs-4">⚠️</div>
              <div>
                <span className="text-muted small d-block">Reportes Graves</span>
                <h3 className="fw-bold mb-0">{graves}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center">
              <div className="bg-warning-subtle text-warning-emphasis p-3 rounded-circle me-3 fs-4">⚡</div>
              <div>
                <span className="text-muted small d-block">Reportes Moderados</span>
                <h3 className="fw-bold mb-0">{moderados}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center">
              <div className="bg-info-subtle text-info p-3 rounded-circle me-3 fs-4">ℹ️</div>
              <div>
                <span className="text-muted small d-block">Informativos / Leves</span>
                <h3 className="fw-bold mb-0">{informativos}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4">
          <div className="row align-items-center mb-4 g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">🔍</span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Buscar por empleado, supervisor o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            {/* SE CAMBIÓ EL MAPEO DE BOTONES POR UN SELECT DESPLEGABLE */}
            <div className="col-md-7 d-flex justify-content-md-end">
              <div className="input-group" style={{ maxWidth: '250px' }}>
                <label className="input-group-text bg-white text-muted small">Filtrar:</label>
                <select 
                  className="form-select form-select-sm"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Escrito">Escrito</option>
                  <option value="Verbal">Verbal</option>
                  <option value="Informativo">Informativo</option>
                  <option value="Leve">Leve</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Grave">Grave</option>
                </select>
              </div>
            </div>
          </div>

          <div className="text-muted small mb-3">
            {reportesFiltrados.length} resultado(s) encontrado(s)
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light text-uppercase small text-muted">
                <tr>
                  <th>Empleado</th>
                  <th>Tipo</th>
                  <th>Gravedad</th>
                  <th>Descripción</th>
                  <th>Supervisor</th>
                  <th>Fecha</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reportesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No hay reportes registrados o que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  reportesFiltrados.map(item => {
                    const idUnico = item.id || item._id;
                    return (
                      <tr key={idUnico} style={{ cursor: 'pointer' }} onClick={() => setReporteSeleccionado(item)}>
                        <td className="fw-bold">{item.empleado}</td>
                        <td>
                          <span className="badge bg-light text-dark border">{item.tipo}</span>
                        </td>
                        <td>
                          <span className={`badge ${
                            item.gravedad?.toLowerCase() === 'grave' ? 'bg-danger' : 
                            item.gravedad?.toLowerCase() === 'moderado' ? 'bg-warning text-dark' : 'bg-secondary'
                          }`}>
                            {item.gravedad}
                          </span>
                        </td>
                        <td className="text-truncate" style={{ maxWidth: '250px' }}>{item.descripcion}</td>
                        <td>{item.supervisor}</td>
                        <td>{item.fecha}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={(e) => { e.stopPropagation(); setReporteSeleccionado(item); }}
                            >
                              Ver Detalle
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={(e) => handleEliminar(e, item)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModalNuevo && (
          <ModalNuevoReporte 
            reportes={reportes}
            onClose={() => setShowModalNuevo(false)} 
            onSuccess={() => { setShowModalNuevo(false); cargarReportes(); }} 
          />
        )}

        {reporteSeleccionado && (
          <ModalDetalleReporte 
            reporte={reporteSeleccionado} 
            onClose={() => setReporteSeleccionado(null)} 
          />
        )}
      </div>
    </MainLayout>
  );
}