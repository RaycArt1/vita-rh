import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ModalNuevoReporte({ reportes = [], onClose, onSuccess }) {
  const [empleados, setEmpleados] = useState([]);
  const [formData, setFormData] = useState({
    empleado: '',
    tipo: 'Escrito',
    gravedad: 'Leve',
    descripcion: '',
    supervisor: '',
    fecha: '',
  });

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const res = await api.get('/empleados');
        setEmpleados(Array.isArray(res.data) ? res.data : res.data.empleados || []);
      } catch (err) {
        console.error("Error al cargar empleados:", err);
      }
    };
    cargarEmpleados();
  }, []);

  // 1. Extraemos los nombres de empleados que ya tienen reporte
  const nombresConReporte = reportes.map(r => r.empleado);

  // 2. Filtramos la lista eliminando los empleados que ya tienen reporte
  const empleadosDisponibles = empleados.filter(emp => {
    const nombreCompleto = emp.nombre || `${emp.nombres || ''} ${emp.apellidos || ''}`.trim();
    return !nombresConReporte.includes(nombreCompleto);
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reportes', formData);
      onSuccess();
    } catch (err) {
      console.error("Error al crear reporte:", err);
      alert("Hubo un error al guardar el reporte.");
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Nuevo Reporte</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              
              {/* SELECTOR DE EMPLEADOS DISPONIBLES */}
              <div className="mb-3">
                <label className="form-label small fw-bold">EMPLEADO</label>
                <select 
                  className="form-select" 
                  name="empleado" 
                  value={formData.empleado} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Selecciona un empleado...</option>
                  {empleadosDisponibles.map((emp, index) => {
                    const nombreCompleto = emp.nombre || `${emp.nombres || ''} ${emp.apellidos || ''}`.trim();
                    return (
                      <option key={index} value={nombreCompleto}>
                        {nombreCompleto}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">TIPO</label>
                <select className="form-select" name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="Escrito">Escrito</option>
                  <option value="Verbal">Verbal</option>
                  <option value="Informativo">Informativo</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">GRAVEDAD</label>
                <select className="form-select" name="gravedad" value={formData.gravedad} onChange={handleChange}>
                  <option value="Leve">Leve</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Grave">Grave</option>
                </select>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label small fw-bold">SUPERVISOR</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="supervisor" 
                    placeholder="Nombre del supervisor" 
                    value={formData.supervisor} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="col">
                  <label className="form-label small fw-bold">FECHA</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    name="fecha" 
                    value={formData.fecha} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">DESCRIPCIÓN</label>
                <textarea 
                  className="form-control" 
                  name="descripcion" 
                  rows="3" 
                  placeholder="Detalle de la incidencia..." 
                  value={formData.descripcion} 
                  onChange={handleChange} 
                  required
                ></textarea>
              </div>

            </div>
            
            <div className="modal-footer border-0">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar Reporte</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}