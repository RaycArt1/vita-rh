import React, { useState, useEffect } from 'react';
import { registrarEmpleadoAPI, actualizarEmpleadoAPI } from '../services/empleadoService';

export const EmpleadoForm = ({ empleadoAEditar, alGuardarExitoso, alCancelar }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    identidad: '',
    telefono: '',
    correo: '',
    fechaIngreso: '',
    puestoId: ''
  });

  // Opciones fijas de puestos
  const puestosFijos = [
    { id: 1, nombre: 'Cocinero' },
    { id: 2, nombre: 'Mesero' }
  ];

  const [alerta, setAlerta] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (empleadoAEditar) {
      setFormData({
        nombres: empleadoAEditar.nombres || '',
        apellidos: empleadoAEditar.apellidos || '',
        identidad: empleadoAEditar.identidad || '',
        telefono: empleadoAEditar.telefono || '',
        correo: empleadoAEditar.correo || '',
        fechaIngreso: empleadoAEditar.fechaIngreso
          ? new Date(empleadoAEditar.fechaIngreso).toISOString().split('T')[0]
          : '',
        puestoId: empleadoAEditar.puestoId || ''
      });
    } else {
      limpiarFormulario();
    }
  }, [empleadoAEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const limpiarFormulario = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      identidad: '',
      telefono: '',
      correo: '',
      fechaIngreso: '',
      puestoId: ''
    });
    setAlerta({ texto: '', tipo: '' });
  };

  const validarCampos = () => {
    if (
      !formData.nombres.trim() ||
      !formData.apellidos.trim() ||
      !formData.identidad.trim() ||
      !formData.telefono.trim() ||
      !formData.correo.trim() ||
      !formData.fechaIngreso ||
      !formData.puestoId
    ) {
      setAlerta({ texto: 'Por favor completa todos los campos obligatorios.', tipo: 'danger' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    setCargando(true);
    setAlerta({ texto: '', tipo: '' });

    const payload = {
      ...formData,
      puestoId: Number(formData.puestoId),
      fechaIngreso: new Date(formData.fechaIngreso).toISOString()
    };

    try {
      if (empleadoAEditar && empleadoAEditar.id) {
        await actualizarEmpleadoAPI(empleadoAEditar.id, payload);
        setAlerta({ texto: '¡Empleado actualizado con éxito!', tipo: 'success' });
      } else {
        await registrarEmpleadoAPI(payload);
        setAlerta({ texto: '¡Empleado registrado con éxito!', tipo: 'success' });
      }

      setTimeout(() => {
        limpiarFormulario();
        if (alGuardarExitoso) alGuardarExitoso();
      }, 1000);

    } catch (errorMensaje) {
      setAlerta({ texto: errorMensaje, tipo: 'danger' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {alerta.texto && (
        <div className={`alert alert-${alerta.tipo} py-2 mb-3`} role="alert">
          {alerta.texto}
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Nombres *</label>
          <input type="text" className="form-control" name="nombres" value={formData.nombres} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Apellidos *</label>
          <input type="text" className="form-control" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Identidad *</label>
          <input type="text" className="form-control" name="identidad" value={formData.identidad} onChange={handleChange} placeholder="08011999..." required />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Teléfono *</label>
          <input type="text" className="form-control" name="telefono" value={formData.telefono} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Correo Electrónico *</label>
          <input type="email" className="form-control" name="correo" value={formData.correo} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Fecha de Ingreso *</label>
          <input type="date" className="form-control" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} required />
        </div>

        <div className="col-md-12">
          <label className="form-label fw-semibold">Puesto *</label>
          <select className="form-select" name="puestoId" value={formData.puestoId} onChange={handleChange} required>
            <option value="">-- Seleccione un puesto --</option>
            {puestosFijos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => { limpiarFormulario(); if (alCancelar) alCancelar(); }}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary px-4" disabled={cargando}>
          {cargando ? 'Guardando...' : empleadoAEditar ? 'Guardar Cambios' : 'Registrar'}
        </button>
      </div>
    </form>
  );
};

