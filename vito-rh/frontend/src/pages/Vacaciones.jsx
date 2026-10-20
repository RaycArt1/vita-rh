import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "./Vacaciones.css";

const ESTADOS = ["TODAS", "PENDIENTE", "APROBADA", "RECHAZADA"];

const ETIQUETA_ESTADO = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
};

const CLASE_ESTADO = { PENDIENTE: "p", APROBADA: "a", RECHAZADA: "x" };

// Tipos del esquema (TipoSolicitud)
const CLASE_TIPO = { VACACION: "t-v", PERMISO: "t-p", INCAPACIDAD: "t-m" };
const ETIQUETA_TIPO = {
  VACACION: "Vacaciones anuales",
  PERMISO: "Permiso personal",
  INCAPACIDAD: "Incapacidad",
};

const COLORES_AVATAR = [
  { bg: "#fdf2f8", fg: "#be185d", borde: "#fce7f3" },
  { bg: "#fef9c3", fg: "#92400e", borde: "#fef3c7" },
  { bg: "#fef2f2", fg: "#991b1b", borde: "#fee2e2" },
  { bg: "#ecfeff", fg: "#155e75", borde: "#cffafe" },
];

// Datos de ejemplo. Luego se reemplazan por GET /api/solicitudes
const SOLICITUDES_INICIALES = [
  { id: 1, nombre: "Juan Pérez", rol: "Administrador", estado: "PENDIENTE", tipo: "VACACION", desde: "2026-08-12", hasta: "2026-08-18", dias: 6, nota: "Vacaciones familiares programadas", usados: 6, total: 15 },
  { id: 2, nombre: "Ana Torres", rol: "Mesera", estado: "APROBADA", tipo: "VACACION", desde: "2026-08-04", hasta: "2026-08-10", dias: 6, nota: "", usados: 6, total: 10 },
  { id: 3, nombre: "Carlos Ruiz", rol: "Cocinero", estado: "PENDIENTE", tipo: "PERMISO", desde: "2026-08-20", hasta: "2026-08-20", dias: 1, nota: "Trámite personal", usados: 2, total: 5 },
  { id: 4, nombre: "María López", rol: "Cajera", estado: "APROBADA", tipo: "INCAPACIDAD", desde: "2026-08-06", hasta: "2026-08-06", dias: 1, nota: "Cita médica", usados: 1, total: 5 },
];

const FORM_VACIO = { nombre: "", desde: "", hasta: "", tipo: "VACACION", nota: "" };

const iniciales = (nombre) =>
  nombre.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export default function Vacaciones() {
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES_INICIALES);
  const [filtro, setFiltro] = useState("TODAS");
  const [vista, setVista] = useState("administracion");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);

  const esAdmin = vista === "administracion";

  // En vista empleado solo se muestran sus propias solicitudes
  const base = esAdmin ? solicitudes : solicitudes.filter((s) => s.nombre === "Juan Pérez");

  const pendientes = base.filter((s) => s.estado === "PENDIENTE").length;
  const aprobadas = base.filter((s) => s.estado === "APROBADA");
  const diasAprobados = aprobadas.reduce((total, s) => total + s.dias, 0);
  const total = base.length || 1;

  const visibles = base.filter((s) => filtro === "TODAS" || s.estado === filtro);

  const cambiarEstado = (id, nuevoEstado) =>
    setSolicitudes((lista) => lista.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s)));

  const abrirModal = () => {
    setForm({ ...FORM_VACIO, nombre: esAdmin ? "" : "Juan Pérez" });
    setMostrarModal(true);
  };

  const agregarSolicitud = () => {
    if (!form.nombre || !form.desde || !form.hasta) return;
    const dias = Math.max(1, Math.round((new Date(form.hasta) - new Date(form.desde)) / 86400000) + 1);
    setSolicitudes((lista) => [
      {
        id: Date.now(),
        nombre: form.nombre,
        rol: "Empleado",
        estado: "PENDIENTE",
        tipo: form.tipo,
        desde: form.desde,
        hasta: form.hasta,
        dias,
        nota: form.nota,
        usados: 0,
        total: 10,
      },
      ...lista,
    ]);
    setMostrarModal(false);
  };

  return (
    <MainLayout>
      <div className="vac-page">
        <div className="vac-top">
          <div>
            <p>{esAdmin ? "Gestión de ausencias — Vito Pizzería" : "Portal del empleado — Juan Pérez"}</p>
            <h1>Vacaciones y Permisos</h1>
          </div>
          <div className="vac-btns">
            <button className="vac-btn w" onClick={() => setVista(esAdmin ? "empleado" : "administracion")}>
              {esAdmin ? "Vista empleado" : "← Vista administrador"}
            </button>
            <button className="vac-btn r" onClick={abrirModal}>+ Nueva Solicitud</button>
          </div>
        </div>

        <section className="vac-stats">
          <div className="vac-stat">
            <div className="vac-ico" style={{ background: "#fef3c7" }}>⏳</div>
            <div className="vac-stat-body">
              <small>Pendientes de aprobar</small>
              <strong style={{ color: "#92400e" }}>{pendientes}</strong>
              <div className="vac-bar"><i style={{ width: `${(pendientes / total) * 100}%`, background: "var(--vac-amber)" }} /></div>
            </div>
          </div>
          <div className="vac-stat">
            <div className="vac-ico" style={{ background: "#d1fae5", color: "#059669" }}>✓</div>
            <div className="vac-stat-body">
              <small>Aprobadas este mes</small>
              <strong style={{ color: "#065f46" }}>{aprobadas.length}</strong>
              <div className="vac-bar"><i style={{ width: `${(aprobadas.length / total) * 100}%`, background: "var(--vac-green)" }} /></div>
            </div>
          </div>
          <div className="vac-stat">
            <div className="vac-ico" style={{ background: "#fee2e2" }}>📅</div>
            <div className="vac-stat-body">
              <small>Días aprobados total</small>
              <strong style={{ color: "#991b1b" }}>{diasAprobados}</strong>
              <div className="vac-bar"><i style={{ width: `${Math.min(100, diasAprobados * 10)}%`, background: "var(--vac-red)" }} /></div>
            </div>
          </div>
        </section>

        <div className="vac-filters">
          {ESTADOS.map((e) => (
            <button key={e} className={`vac-chip ${filtro === e ? "on" : ""}`} onClick={() => setFiltro(e)}>
              {e === "TODAS" ? "Todas" : ETIQUETA_ESTADO[e]}
            </button>
          ))}
        </div>

        {visibles.length === 0 && <p className="vac-empty">No hay solicitudes en este estado.</p>}

        {visibles.map((s) => {
          const color = COLORES_AVATAR[(s.id - 1) % COLORES_AVATAR.length];
          return (
            <article key={s.id} className="vac-req">
              <div className="vac-av" style={{ background: color.bg, color: color.fg, borderColor: color.borde }}>
                {iniciales(s.nombre)}
              </div>

              <div className="vac-body">
                <div className="vac-row1">
                  <b>{s.nombre}</b>
                  <span className="vac-role">{s.rol}</span>
                  <span className={`vac-tag ${CLASE_ESTADO[s.estado]}`}>{ETIQUETA_ESTADO[s.estado]}</span>
                  <span className={`vac-type ${CLASE_TIPO[s.tipo]}`}>{ETIQUETA_TIPO[s.tipo]}</span>
                </div>
                <div className="vac-row2">
                  <span className="vac-date">{s.desde} → {s.hasta}</span>
                  <b>{s.dias} día{s.dias > 1 ? "s" : ""}</b>
                  {s.nota && <em>{s.nota}</em>}
                </div>
                <div className="vac-prog">
                  <div className="vac-bar">
                    <i style={{ width: `${(s.usados / s.total) * 100}%`, background: "linear-gradient(90deg, #c62828, #f87171)" }} />
                  </div>
                  <span>{s.usados}/{s.total} días disponibles</span>
                </div>
              </div>

              {esAdmin && s.estado === "PENDIENTE" && (
                <div className="vac-act">
                  <button className="vac-ok" onClick={() => cambiarEstado(s.id, "APROBADA")}>Aprobar</button>
                  <button className="vac-no" onClick={() => cambiarEstado(s.id, "RECHAZADA")}>Rechazar</button>
                </div>
              )}
            </article>
          );
        })}

        {mostrarModal && (
          <div className="vac-modal-bg" onClick={() => setMostrarModal(false)}>
            <div className="vac-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Nueva solicitud</h2>

              <label>
                Empleado
                <input
                  type="text"
                  value={form.nombre}
                  readOnly={!esAdmin}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre del empleado"
                />
              </label>

              <label>
                Tipo
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option value="VACACION">Vacaciones anuales</option>
                  <option value="PERMISO">Permiso personal</option>
                  <option value="INCAPACIDAD">Incapacidad</option>
                </select>
              </label>

              <div className="vac-modal-fechas">
                <label>
                  Desde
                  <input type="date" value={form.desde} onChange={(e) => setForm({ ...form, desde: e.target.value })} />
                </label>
                <label>
                  Hasta
                  <input type="date" value={form.hasta} onChange={(e) => setForm({ ...form, hasta: e.target.value })} />
                </label>
              </div>

              <label>
                Observación
                <textarea rows={3} value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} />
              </label>

              <div className="vac-modal-acciones">
                <button className="vac-btn w" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button className="vac-btn r" onClick={agregarSolicitud}>
                  {esAdmin ? "Registrar" : "Enviar solicitud"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}