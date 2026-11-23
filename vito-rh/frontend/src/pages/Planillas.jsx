import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";


function obtenerIniciales(nombres = "", apellidos = "") {
  try {
    const n = (nombres || "").trim().charAt(0).toUpperCase();
    const a = (apellidos || "").trim().charAt(0).toUpperCase();
    return `${n}${a}` || "EM";
  } catch {
    return "EM";
  }
}


function formatearMoneda(valor) {
  const numero = Number(valor || 0);
  return `L. ${numero.toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


export default function Planillas() {
  const [planillaActiva, setPlanillaActiva] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [periodo] = useState("Agosto 2026");


  async function cargarPlanilla() {
    setCargando(true);
    setError("");


    try {
      let listaDetalles = [];


      // 1. Intentamos leer la nómina existente desde el backend
      try {
        const respuesta = await api.get("/nomina");
        const dataPlanillas = Array.isArray(respuesta.data) ? respuesta.data : [];
        if (dataPlanillas.length > 0) {
          const actual = dataPlanillas[0];
          setPlanillaActiva(actual);
          listaDetalles = (actual.detalles || actual.empleados || []).map((item) => {
            const emp = item.empleado || {};
            const nombres = emp.nombres || item.nombres || "Empleado";
            const apellidos = emp.apellidos || item.apellidos || "";
            const salarioBase = Number(item.salarioBase ?? emp.salarioBase ?? 0);
            const deducciones = Number(item.deducciones ?? (salarioBase * 0.105).toFixed(2));
            const neto = Number(item.salarioNeto ?? item.neto ?? (salarioBase - deducciones));


            return {
              id: item.id,
              empleadoId: item.empleadoId || emp.id,
              empleado: `${nombres} ${apellidos}`.trim(),
              puesto: emp.puesto?.nombre || item.puesto || "Colaborador",
              iniciales: obtenerIniciales(nombres, apellidos),
              salarioBase,
              horasExtra: Number(item.horasExtra ?? 0),
              montoExtra: Number(item.montoHorasExtra ?? 0),
              bonoConcepto: Number(item.bonos ?? 0),
              detalleBono: item.conceptoBono || "Bono mensual",
              deducciones,
              neto,
              estado: item.estado || "Pendiente",
            };
          });
        }
      } catch (err) {
        console.log("Nómina vacía, cargando desde empleados...");
      }


      // 2. RESPALDO AUTOMÁTICO: Si la tabla Nomina está vacía, cargamos los empleados reales de Prisma
      if (listaDetalles.length === 0) {
        const resEmpleados = await api.get("/empleados");
        const empleadosDB = Array.isArray(resEmpleados.data) ? resEmpleados.data : [];


        listaDetalles = empleadosDB.map((emp) => {
          const salarioBase = Number(emp.salarioBase || emp.salario || 15000);
          const deducciones = Number((salarioBase * 0.105).toFixed(2));
          const neto = Number((salarioBase - deducciones).toFixed(2));


          return {
            id: emp.id,
            empleadoId: emp.id,
            empleado: `${emp.nombres || ""} ${emp.apellidos || ""}`.trim() || "Sin nombre",
            puesto: emp.puesto?.nombre || "Colaborador",
            iniciales: obtenerIniciales(emp.nombres, emp.apellidos),
            salarioBase,
            horasExtra: 0,
            montoExtra: 0,
            bonoConcepto: 0,
            detalleBono: "Sin bonos",
            deducciones,
            neto,
            estado: "Pendiente",
          };
        });
      }


      setDetalles(listaDetalles);
    } catch (err) {
      console.error("Error al cargar la nómina:", err);
      setError("No se pudieron cargar los datos.");
      setDetalles([]);
    } finally {
      setCargando(false);
    }
  }


  useEffect(() => {
    cargarPlanilla();
  }, []);


  const resumen = useMemo(() => {
    try {
      const totalBruto = detalles.reduce(
        (acc, item) => acc + item.salarioBase + item.montoExtra + item.bonoConcepto,
        0
      );
      const totalDeducciones = detalles.reduce((acc, item) => acc + item.deducciones, 0);
      const totalNeto = detalles.reduce((acc, item) => acc + item.neto, 0);
      const porProcesar = detalles.filter((item) => item.estado === "Pendiente").length;


      return { totalBruto, totalDeducciones, totalNeto, porProcesar };
    } catch {
      return { totalBruto: 0, totalDeducciones: 0, totalNeto: 0, porProcesar: 0 };
    }
  }, [detalles]);


  async function cambiarEstadoFila(id, nuevoEstado) {
    setError("");
    setExito("");


    try {
      await api.patch(`/nomina/detalles/${id}/estado`, { estado: nuevoEstado });
      setDetalles((prev) =>
        prev.map((item) => (item.id === id ? { ...item, estado: nuevoEstado } : item))
      );
      setExito(`Estado actualizado a ${nuevoEstado} correctamente.`);
    } catch (err) {
      // Cambio local si el registro aún es virtual desde empleados
      setDetalles((prev) =>
        prev.map((item) => (item.id === id ? { ...item, estado: nuevoEstado } : item))
      );
      setExito(`Estado cambiado a ${nuevoEstado} en la vista actual.`);
    }
  }


  async function procesarTodosLosPendientes() {
    if (!planillaActiva?.id) {
      setDetalles((prev) =>
        prev.map((item) => (item.estado === "Pendiente" ? { ...item, estado: "Procesado" } : item))
      );
      setExito("¡Todos los registros pendientes fueron procesados!");
      return;
    }


    setError("");
    setExito("");


    try {
      await api.post(`/nomina/${planillaActiva.id}/procesar-todos`);
      setExito("¡Todos los registros pendientes fueron procesados!");
      await cargarPlanilla();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo procesar la nómina.");
    }
  }


  return (
    <MainLayout>
      <div className="container-fluid py-4 px-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
       
        {/* ENCABEZADO */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span className="text-secondary small">Periodo: {periodo} — Vito Pizzería</span>
            <h2 className="fw-bold mb-0 text-dark">Nómina</h2>
          </div>


          <div className="d-flex gap-2">
            <button className="btn btn-danger text-white fw-semibold px-3 shadow-sm" onClick={cargarPlanilla}>
              + Sincronizar planilla
            </button>
            <button className="btn btn-light border bg-white fw-semibold px-3 shadow-sm text-secondary" onClick={() => window.print()}>
              Exportar PDF
            </button>
            <button
              className="btn btn-dark fw-semibold px-4 shadow-sm"
              onClick={procesarTodosLosPendientes}
              disabled={resumen.porProcesar === 0}
            >
              Procesar ({resumen.porProcesar})
            </button>
          </div>
        </div>


        {error && <div className="alert alert-danger">{error}</div>}
        {exito && <div className="alert alert-success">{exito}</div>}


        {/* TARJETAS DE RESUMEN SUPERIOR */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm text-white p-3 rounded-4 h-100" style={{ backgroundColor: "#dc3545" }}>
              <div className="mb-2">💵</div>
              <h3 className="fw-bold mb-1">{formatearMoneda(resumen.totalNeto)}</h3>
              <p className="small mb-0 opacity-75">Total Neto a Pagar</p>
            </div>
          </div>


          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm bg-white p-3 rounded-4 h-100">
              <div className="mb-2 text-success">📈</div>
              <h3 className="fw-bold mb-1 text-dark">{formatearMoneda(resumen.totalBruto)}</h3>
              <p className="small text-secondary mb-0">Total Bruto</p>
            </div>
          </div>


          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm bg-white p-3 rounded-4 h-100">
              <div className="mb-2 text-danger">📉</div>
              <h3 className="fw-bold mb-1 text-dark">{formatearMoneda(resumen.totalDeducciones)}</h3>
              <p className="small text-secondary mb-0">Deducciones</p>
            </div>
          </div>


          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm bg-white p-3 rounded-4 h-100">
              <div className="mb-2 text-warning">⏳</div>
              <h3 className="fw-bold mb-1 text-dark">{resumen.porProcesar}</h3>
              <p className="small text-secondary mb-0">Por Procesar</p>
            </div>
          </div>
        </div>


        {/* TABLA DE DETALLE */}
        <div className="card border-0 shadow-sm rounded-4 bg-white">
          <div className="card-body px-4 py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Detalle de Nómina — {periodo}</h5>
             
              <div className="d-flex align-items-center gap-3 small text-secondary">
                <span><i className="bi bi-circle-fill text-warning me-1" style={{fontSize: "8px"}}/> Pendiente</span>
                <span><i className="bi bi-circle-fill text-danger me-1" style={{fontSize: "8px"}}/> Procesado</span>
                <span><i className="bi bi-circle-fill text-success me-1" style={{fontSize: "8px"}}/> Pagado</span>
              </div>
            </div>


            {cargando ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status" />
                <p className="text-secondary mt-2 mb-0">Cargando nómina desde la base de datos...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="text-secondary small text-uppercase border-bottom">
                    <tr>
                      <th className="py-3 bg-transparent">Empleado</th>
                      <th className="py-3 bg-transparent">Salario Base</th>
                      <th className="py-3 bg-transparent">H. Extra</th>
                      <th className="py-3 bg-transparent">Bonos</th>
                      <th className="py-3 bg-transparent">Deducciones</th>
                      <th className="py-3 bg-transparent">Neto</th>
                      <th className="py-3 bg-transparent">Estado</th>
                      <th className="py-3 bg-transparent text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((item) => (
                      <tr key={item.id} className="border-bottom">
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center border" style={{ width: "38px", height: "38px", fontSize: "13px" }}>
                              {item.iniciales}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{item.empleado}</div>
                              <small className="text-secondary" style={{ fontSize: "12px" }}>{item.puesto}</small>
                            </div>
                          </div>
                        </td>


                        <td className="fw-semibold text-dark">{formatearMoneda(item.salarioBase)}</td>
                        <td>
                          <div className="fw-medium text-dark">{item.horasExtra > 0 ? `${item.horasExtra}h` : "—"}</div>
                          {item.montoExtra > 0 && <small className="text-secondary" style={{ fontSize: "11px" }}>{formatearMoneda(item.montoExtra)}</small>}
                        </td>
                        <td>
                          <div className="fw-semibold text-success">{item.bonoConcepto > 0 ? formatearMoneda(item.bonoConcepto) : "—"}</div>
                          {item.bonoConcepto > 0 && <small className="text-secondary" style={{ fontSize: "11px" }}>{item.detalleBono}</small>}
                        </td>
                        <td className="fw-semibold text-danger">-{formatearMoneda(item.deducciones)}</td>
                        <td className="fw-bold text-dark">{formatearMoneda(item.neto)}</td>


                        <td>
                          {item.estado === "Pendiente" && (
                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-pill">● Pendiente</span>
                          )}
                          {item.estado === "Procesado" && (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill">● Procesado</span>
                          )}
                          {item.estado === "Pagado" && (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">● Pagado</span>
                          )}
                        </td>


                        <td className="text-end">
                          {item.estado === "Pendiente" && (
                            <button
                              className="btn btn-outline-danger btn-sm px-2 py-1"
                              style={{ fontSize: "12px" }}
                              onClick={() => cambiarEstadoFila(item.id, "Procesado")}
                            >
                              Procesar
                            </button>
                          )}
                          {item.estado === "Procesado" && (
                            <button
                              className="btn btn-success btn-sm px-3 py-1 text-white fw-semibold"
                              style={{ fontSize: "12px", backgroundColor: "#20c997", border: "none" }}
                              onClick={() => cambiarEstadoFila(item.id, "Pagado")}
                            >
                              Pagar
                            </button>
                          )}
                          {item.estado === "Pagado" && <span className="text-muted small">—</span>}
                        </td>
                      </tr>
                    ))}


                    {detalles.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-secondary">
                          No hay registros de nómina disponibles.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>


      </div>
    </MainLayout>
  );
}
