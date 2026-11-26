import { useEffect, useState } from "react";
import {
  FaUtensils,
  FaBed,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaUserTimes,
} from "react-icons/fa";

import Sidebar from "../../components/Sidebar";
import "./ChefDashboard.css";

function parsearFechaLocal(fechaInput) {
  if (!fechaInput) return new Date(NaN);
  if (fechaInput instanceof Date) {
    return new Date(
      fechaInput.getFullYear(),
      fechaInput.getMonth(),
      fechaInput.getDate()
    );
  }
  const str = String(fechaInput).trim();
  const matchIso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchIso) {
    return new Date(
      Number(matchIso[1]),
      Number(matchIso[2]) - 1,
      Number(matchIso[3])
    );
  }
  const d = new Date(str);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function inicioDelDia(fechaInput) {
  const d = parsearFechaLocal(fechaInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function finDelDia(fechaInput) {
  const d = parsearFechaLocal(fechaInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function capitalizarPalabras(texto = "") {
  return String(texto)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function normalizarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function obtenerIniciales(nombreCompleto = "") {
  const partes = String(nombreCompleto).trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "EM";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function formatearTurno(turno) {
  if (!turno) return "12:00-20:00";
  if (turno === "T12_20") return "12:00-20:00";
  if (turno === "T12_22") return "12:00-22:00";
  return String(turno);
}

function calcularEstadoHoy(turnoStr, ahoraDate) {
  const limpio = formatearTurno(turnoStr).replace("–", "-");
  const partes = limpio.split("-");
  if (partes.length !== 2) return "En turno";

  const [hIniStr, mIniStr = "0"] = partes[0].trim().split(":");
  const [hFinStr, mFinStr = "0"] = partes[1].trim().split(":");

  const hIni = Number(hIniStr);
  const mIni = Number(mIniStr);
  const hFin = Number(hFinStr);
  const mFin = Number(mFinStr);

  if ([hIni, mIni, hFin, mFin].some(Number.isNaN)) return "En turno";

  const minutosActuales = ahoraDate.getHours() * 60 + ahoraDate.getMinutes();
  const minutosInicio = hIni * 60 + mIni;
  const minutosFin = hFin * 60 + mFin;

  if (minutosActuales < minutosInicio) return "Próximo turno";
  if (minutosActuales <= minutosFin) return "En turno";
  return "Turno finalizado";
}

function normalizarGravedad(valor = "") {
  const upper = String(valor).trim().toUpperCase();
  if (upper.includes("GRAV") || upper.includes("ALTA")) return "GRAVE";
  if (upper.includes("MOD") || upper.includes("MEDIA")) return "MODERADA";
  return "LEVE";
}

function detectarGrupoArea(item) {
  const areaNombre = normalizarTexto(
    item?.area?.nombre ||
      item?.empleado?.area?.nombre ||
      item?.empleado_rel?.area?.nombre ||
      item?.areaNombre ||
      ""
  );

  const puestoNombre = normalizarTexto(
    item?.empleado?.puesto?.nombre ||
      item?.empleado_rel?.puesto?.nombre ||
      item?.puesto?.nombre ||
      item?.puestoNombre ||
      item?.puesto ||
      ""
  );

  const areaId = Number(
    item?.area?.id ?? item?.empleado?.area?.id ?? item?.areaId ?? 0
  );
  const puestoId = Number(
    item?.empleado?.puesto?.id ?? item?.empleado?.puestoId ?? item?.puestoId ?? 0
  );

  if (
    areaNombre.includes("cocina") ||
    areaId === 2 ||
    puestoId === 7 ||
    ["chef", "pizzero", "cocinero", "auxiliar de cocina"].some((p) =>
      puestoNombre.includes(p)
    )
  ) {
    return "Cocina";
  }

  if (
    areaNombre.includes("mesero") ||
    areaNombre.includes("salon") ||
    areaNombre.includes("servicio al cliente") ||
    areaId === 3 ||
    puestoId === 9 ||
    ["mesero", "mesera", "mesero/a", "capitan"].some((p) =>
      puestoNombre.includes(p)
    )
  ) {
    return "Meseros";
  }

  if (
    areaNombre.includes("caja") ||
    areaNombre.includes("tesorer") ||
    ["cajero", "cajera", "cajero/a"].some((p) => puestoNombre.includes(p))
  ) {
    return "Caja";
  }

  return null;
}

function obtenerDetalleRol(item, fallback = null) {
  const grupo = detectarGrupoArea(item) || fallback?.grupo || "Personal";
  const puestoNombre =
    item?.empleado?.puesto?.nombre ||
    item?.empleado_rel?.puesto?.nombre ||
    item?.puesto?.nombre ||
    item?.puestoNombre ||
    item?.puesto ||
    fallback?.puesto ||
    "";

  if (puestoNombre) {
    return `${grupo} · ${capitalizarPalabras(puestoNombre)}`;
  }
  return grupo;
}

function obtenerNombreRaw(item, idx = 0) {
  if (item?.empleado) {
    const full = `${item.empleado.nombres || ""} ${item.empleado.apellidos || ""}`.trim();
    if (full) return full;
  }
  if (item?.empleado_rel) {
    const full = `${item.empleado_rel.nombres || ""} ${item.empleado_rel.apellidos || ""}`.trim();
    if (full) return full;
  }
  if (typeof item?.empleado === "string" && item.empleado.trim()) {
    return item.empleado.trim();
  }
  if (item?.empleadoNombre) return String(item.empleadoNombre).trim();
  return `Integrante ${idx + 1}`;
}

function obtenerClaveEmpleado(item, idx = 0) {
  const id = item?.empleadoId ?? item?.empleado?.id ?? item?.empleado_rel?.id;
  if (id !== undefined && id !== null && String(id).trim() !== "") {
    return `id-${Number(id)}`;
  }

  const nombreNorm = normalizarTexto(obtenerNombreRaw(item, idx));
  if (nombreNorm) return `nom-${nombreNorm}`;
  return `idx-${idx}`;
}

function calcularRangoFinDeSemana(baseDate = new Date()) {
  const hoy = inicioDelDia(baseDate);
  const diaSemana = hoy.getDay(); // 0 = Dom, 6 = Sáb
  const diffSabado = diaSemana === 0 ? -1 : 6 - diaSemana;

  const sabado = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate() + diffSabado,
    0,
    0,
    0,
    0
  );
  const domingo = new Date(
    sabado.getFullYear(),
    sabado.getMonth(),
    sabado.getDate() + 1,
    0,
    0,
    0,
    0
  );

  return { sabado, domingo };
}

async function fetchArregloSeguro(url, headers) {
  try {
    const resp = await fetch(url, { headers });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.reportes)) return data.reportes;
    if (Array.isArray(data?.incidencias)) return data.incidencias;
    return [];
  } catch {
    return [];
  }
}

export default function ChefDashboard() {
  const [ahora, setAhora] = useState(() => new Date());
  const [equipoHoy, setEquipoHoy] = useState([]);
  const [equipoDescansoHoy, setEquipoDescansoHoy] = useState([]);
  const [equipoManana, setEquipoManana] = useState([]);
  const [turnosSabado, setTurnosSabado] = useState([]);
  const [turnosDomingo, setTurnosDomingo] = useState([]);
  const [faltas, setFaltas] = useState([]);
  const [ajustesPendientes, setAjustesPendientes] = useState(0);
  const [cargando, setCargando] = useState(true);

  const manana = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate() + 1
  );
  const { sabado, domingo } = calcularRangoFinDeSemana(ahora);

  const fechaEncabezado = new Intl.DateTimeFormat("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ahora);

  const diaHoyTexto = capitalizarPalabras(
    new Intl.DateTimeFormat("es-HN", { weekday: "long" }).format(ahora)
  );
  const fechaHoyCorta = new Intl.DateTimeFormat("es-HN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(ahora);

  const diaMananaTexto = capitalizarPalabras(
    new Intl.DateTimeFormat("es-HN", { weekday: "long" }).format(manana)
  );
  const fechaMananaCorta = new Intl.DateTimeFormat("es-HN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(manana);

  const fechaSabadoCorta = new Intl.DateTimeFormat("es-HN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(sabado);

  const fechaDomingoCorta = new Intl.DateTimeFormat("es-HN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(domingo);

  useEffect(() => {
    const timer = setInterval(() => {
      setAhora(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let activo = true;

    async function cargarDatosMeserosCocinaCaja() {
      setCargando(true);
      const apiBase =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const [horariosData, solicitudesData, reportesData] =
          await Promise.all([
            fetchArregloSeguro(`${apiBase}/horarios`, headers),
            fetchArregloSeguro(`${apiBase}/solicitudes`, headers),
            fetchArregloSeguro(`${apiBase}/reportes`, headers),
          ]);

        if (!activo) return;

        const fechaReferencia = new Date();
        const mananaRef = new Date(
          fechaReferencia.getFullYear(),
          fechaReferencia.getMonth(),
          fechaReferencia.getDate() + 1
        );
        const rangoFinde = calcularRangoFinDeSemana(fechaReferencia);

        const infoEmpleadoPorClave = new Map();
        const clavePorNombreNorm = new Map();

        horariosData.forEach((h, idx) => {
          const empActivo =
            !h.empleado?.estado ||
            String(h.empleado.estado).toUpperCase() === "ACTIVO";
          if (!empActivo) return;

          const grupo = detectarGrupoArea(h);
          if (!grupo) return;

          const nombre = capitalizarPalabras(obtenerNombreRaw(h, idx));
          const nombreNorm = normalizarTexto(nombre);
          const puesto =
            h.empleado?.puesto?.nombre ||
            h.puesto?.nombre ||
            h.puestoNombre ||
            h.puesto ||
            "";

          const claveExistentePorNombre = clavePorNombreNorm.get(nombreNorm);
          const clave = claveExistentePorNombre || obtenerClaveEmpleado(h, idx);

          if (!infoEmpleadoPorClave.has(clave)) {
            infoEmpleadoPorClave.set(clave, {
              claveEmp: clave,
              nombre,
              nombreNorm,
              grupo,
              puesto,
            });
          } else {
            const actual = infoEmpleadoPorClave.get(clave);
            if (!actual.puesto && puesto) actual.puesto = puesto;
            if (!actual.grupo && grupo) actual.grupo = grupo;
          }

          if (nombreNorm && !clavePorNombreNorm.has(nombreNorm)) {
            clavePorNombreNorm.set(nombreNorm, clave);
          }
        });

        const resolverClaveCanonica = (item, idx = 0) => {
          const nombreNorm = normalizarTexto(obtenerNombreRaw(item, idx));
          if (nombreNorm && clavePorNombreNorm.has(nombreNorm)) {
            return clavePorNombreNorm.get(nombreNorm);
          }
          return obtenerClaveEmpleado(item, idx);
        };

        const obtenerGrupoRegistro = (item, idx = 0) => {
          const directo = detectarGrupoArea(item);
          if (directo) return directo;
          const clave = resolverClaveCanonica(item, idx);
          return infoEmpleadoPorClave.get(clave)?.grupo || null;
        };

        const horariosFiltrados = horariosData.filter((h, idx) => {
          const estadoOk = ["ACTIVO", "MODIFICADO"].includes(
            String(h.estado || "").toUpperCase()
          );
          const empActivo =
            !h.empleado?.estado ||
            String(h.empleado.estado).toUpperCase() === "ACTIVO";
          return estadoOk && empActivo && obtenerGrupoRegistro(h, idx) !== null;
        });

        const pendientes = horariosData.filter(
          (h, idx) =>
            obtenerGrupoRegistro(h, idx) !== null &&
            String(h.estado || "").toUpperCase() === "MODIFICADO"
        ).length;
        setAjustesPendientes(pendientes);

        const obtenerClavesConPermisoAprobado = (diaObjetivo) => {
          const iniObj = inicioDelDia(diaObjetivo);
          const claves = new Set();

          solicitudesData.forEach((s, idx) => {
            if (String(s.estado).toUpperCase() !== "APROBADA") return;
            const iniSol = inicioDelDia(s.fechaInicio);
            const finSol = finDelDia(s.fechaFin);
            if (iniObj >= iniSol && iniObj <= finSol) {
              claves.add(resolverClaveCanonica(s, idx));
            }
          });

          return claves;
        };

        const obtenerAsignacionesParaDia = (diaObjetivo, esHoy) => {
          const iniDia = inicioDelDia(diaObjetivo);
          const finDia = finDelDia(diaObjetivo);
          const diaNombre = capitalizarPalabras(
            new Intl.DateTimeFormat("es-HN", { weekday: "long" }).format(
              iniDia
            )
          );
          const fechaStr = new Intl.DateTimeFormat("es-HN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(iniDia);

          const clavesConPermiso = obtenerClavesConPermisoAprobado(iniDia);

          return horariosFiltrados
            .filter((h, idx) => {
              const iniH = inicioDelDia(h.fechaInicio);
              const finH = finDelDia(h.fechaFin);
              const cubreDia = iniH <= finDia && finH >= iniDia;
              const claveEmp = resolverClaveCanonica(h, idx);
              return cubreDia && !clavesConPermiso.has(claveEmp);
            })
            .map((h, idx) => {
              const claveEmp = resolverClaveCanonica(h, idx);
              const ficha = infoEmpleadoPorClave.get(claveEmp);
              const nombre =
                ficha?.nombre || capitalizarPalabras(obtenerNombreRaw(h, idx));
              const grupo = ficha?.grupo || obtenerGrupoRegistro(h, idx);
              const detalleRol = obtenerDetalleRol(h, ficha);
              const horario = formatearTurno(h.turno);

              return {
                id: `${h.id || idx + 1}-${iniDia.toISOString().slice(0, 10)}`,
                claveEmp,
                iniciales: obtenerIniciales(nombre),
                nombre,
                grupo,
                detalleRol,
                diaTexto: diaNombre,
                fechaCorta: fechaStr,
                horario,
                estado: esHoy
                  ? calcularEstadoHoy(horario, fechaReferencia)
                  : "Programado",
                estiloAvatar:
                  grupo === "Meseros"
                    ? "avatar-verde"
                    : grupo === "Caja"
                    ? "avatar-ambar"
                    : "",
              };
            });
        };

        const obtenerTurnosFinDeSemanaDia = (
          diaObjetivo,
          etiquetaDia,
          etiquetaLarga
        ) => {
          const iniDia = inicioDelDia(diaObjetivo);
          const finDia = finDelDia(diaObjetivo);
          const fechaStr = new Intl.DateTimeFormat("es-HN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(iniDia);

          const clavesConPermiso = obtenerClavesConPermisoAprobado(iniDia);

          return horariosFiltrados
            .filter((h, i) => {
              const iniH = inicioDelDia(h.fechaInicio);
              const finH = finDelDia(h.fechaFin);
              const cubreDia = iniH <= finDia && finH >= iniDia;
              const claveEmp = resolverClaveCanonica(h, i);
              return cubreDia && !clavesConPermiso.has(claveEmp);
            })
            .map((h, i) => {
              const claveEmp = resolverClaveCanonica(h, i);
              const ficha = infoEmpleadoPorClave.get(claveEmp);
              const nombre =
                ficha?.nombre || capitalizarPalabras(obtenerNombreRaw(h, i));
              const grupo = ficha?.grupo || obtenerGrupoRegistro(h, i);
              const detalleRol = obtenerDetalleRol(h, ficha);

              return {
                id: `${h.id || i}-${etiquetaDia}-${iniDia.toISOString().slice(0, 10)}`,
                dia: etiquetaDia,
                numero: String(iniDia.getDate()).padStart(2, "0"),
                fechaCorta: fechaStr,
                fechaCompleta: `${etiquetaLarga} ${iniDia.getDate()} de ${new Intl.DateTimeFormat(
                  "es-HN",
                  { month: "long" }
                ).format(iniDia)}`,
                nombre,
                grupo,
                detalleRol,
                horario: formatearTurno(h.turno),
              };
            });
        };

        const listaHoy = obtenerAsignacionesParaDia(fechaReferencia, true);
        setEquipoHoy(listaHoy);

        const clavesLaborandoHoy = new Set(listaHoy.map((p) => p.claveEmp));
        const descansoHoyLista = [];

        infoEmpleadoPorClave.forEach((emp, i) => {
          if (!clavesLaborandoHoy.has(emp.claveEmp)) {
            const detalleRol = emp.puesto
              ? `${emp.grupo} · ${capitalizarPalabras(emp.puesto)}`
              : emp.grupo;

            descansoHoyLista.push({
              id: `descanso-${emp.claveEmp}-${i}`,
              iniciales: obtenerIniciales(emp.nombre),
              nombre: emp.nombre,
              grupo: emp.grupo,
              detalleRol,
              diaTexto: diaHoyTexto,
              fechaCorta: fechaHoyCorta,
              estado: "En descanso",
              estiloAvatar:
                emp.grupo === "Meseros"
                  ? "avatar-verde"
                  : emp.grupo === "Caja"
                  ? "avatar-ambar"
                  : "",
            });
          }
        });

        setEquipoDescansoHoy(descansoHoyLista);

        setEquipoManana(obtenerAsignacionesParaDia(mananaRef, false));
        setTurnosSabado(
          obtenerTurnosFinDeSemanaDia(rangoFinde.sabado, "SÁB", "Sábado")
        );
        setTurnosDomingo(
          obtenerTurnosFinDeSemanaDia(rangoFinde.domingo, "DOM", "Domingo")
        );

        const faltasCombinadas = [];

        reportesData.forEach((r, idx) => {
          const areaEmp =
            r.empleado_rel?.area?.nombre || r.empleado?.area?.nombre || "";
          const puestoEmp =
            r.empleado_rel?.puesto?.nombre || r.empleado?.puesto?.nombre || "";
          const grupoDetectado = obtenerGrupoRegistro(r, idx);

          if ((areaEmp || puestoEmp) && !grupoDetectado) return;

          const nombreEmp = capitalizarPalabras(obtenerNombreRaw(r, idx));
          const clave = resolverClaveCanonica(r, idx);
          const infoFallback = infoEmpleadoPorClave.get(clave) || null;
          const grupoFinal = grupoDetectado || infoFallback?.grupo || "Cocina";

          faltasCombinadas.push({
            id: `rep-${r.id || idx}`,
            empleado: nombreEmp,
            grupo: grupoFinal,
            detalleRol: obtenerDetalleRol(r, infoFallback),
            tipo: r.tipo || "Reporte de falta",
            gravedad: normalizarGravedad(r.gravedad),
            fecha: r.fecha || fechaHoyCorta,
            descripcion: r.descripcion || "Sin detalle adicional",
            supervisor: r.supervisor || "",
          });
        });

        setFaltas(faltasCombinadas);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDatosMeserosCocinaCaja();

    return () => {
      activo = false;
    };
  }, [fechaHoyCorta, diaHoyTexto]);

  const activosHoy = equipoHoy.length;
  const personasEnDescanso = equipoDescansoHoy.length;
  const totalTurnosFinDeSemana = turnosSabado.length + turnosDomingo.length;

  const faltasGraves = faltas.filter((f) => f.gravedad === "GRAVE").length;
  const faltasModeradas = faltas.filter((f) => f.gravedad === "MODERADA").length;
  const faltasLeves = faltas.filter((f) => f.gravedad === "LEVE").length;

  const faltasMeseros = faltas.filter((f) => f.grupo === "Meseros").length;
  const faltasCocina = faltas.filter((f) => f.grupo === "Cocina").length;
  const faltasCaja = faltas.filter((f) => f.grupo === "Caja").length;

  return (
    <div className="chef-layout">
      <Sidebar />

      <main className="chef-main">
        <header className="chef-heading">
          <p>{capitalizarPalabras(fechaEncabezado)} — Vito Pizzería</p>
          <h1>Dashboard del Chef</h1>
        </header>

        <section className="chef-stats">
          <article className="chef-stat-card stat-rojo">
            <div className="chef-stat-top">
              <span className="chef-badge">Laborando hoy</span>
              <span className="chef-stat-icon">
                <FaUtensils />
              </span>
            </div>

            <strong>{activosHoy}</strong>
            <p>
              Meseros, Cocina y Caja · {fechaHoyCorta}
            </p>
          </article>

          <article className="chef-stat-card stat-verde">
            <div className="chef-stat-top">
              <span className="chef-badge badge-verde">En descanso</span>
              <span className="chef-stat-icon">
                <FaBed />
              </span>
            </div>

            <strong>{personasEnDescanso}</strong>
            <p>
              Meseros, Cocina y Caja hoy ({fechaHoyCorta})
            </p>
          </article>

          <article className="chef-stat-card stat-ambar">
            <div className="chef-stat-top">
              <span className="chef-badge badge-ambar">Fin de semana</span>
              <span className="chef-stat-icon">
                <FaCalendarAlt />
              </span>
            </div>

            <strong>{totalTurnosFinDeSemana}</strong>
            <p>
              Sáb ({turnosSabado.length}) · Dom ({turnosDomingo.length})
            </p>
          </article>
        </section>

        <div className="chef-dashboard-grid">
          <div className="chef-side-stack">
            <section className="chef-team-card">
              <div className="chef-panel-header">
                <h2>
                  <FaUtensils /> Quiénes están laborando ({diaHoyTexto}{" "}
                  {fechaHoyCorta})
                </h2>

                <span className="chef-live-pill">{fechaHoyCorta}</span>
              </div>

              <div className="chef-team-list">
                {cargando ? (
                  <p>Cargando turnos de hoy...</p>
                ) : equipoHoy.length === 0 ? (
                  <p>
                    No hay personal de Meseros, Cocina o Caja laborando hoy (
                    {fechaHoyCorta}).
                  </p>
                ) : (
                  equipoHoy.map((empleado) => (
                    <article className="chef-team-member" key={empleado.id}>
                      <div className={`chef-avatar ${empleado.estiloAvatar || ""}`}>
                        {empleado.iniciales}
                      </div>

                      <div className="chef-member-info">
                        <strong>{empleado.nombre}</strong>
                        <span>
                          {empleado.detalleRol} · {empleado.diaTexto}{" "}
                          {empleado.fechaCorta}
                        </span>
                      </div>

                      <div className="chef-member-shift">
                        <span className="chef-shift-time">
                          {empleado.horario}
                        </span>

                        <span
                          className={`chef-shift-status ${
                            empleado.estado === "En turno" ? "" : "proximo"
                          }`}
                        >
                          {empleado.estado}
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="chef-team-card">
              <div className="chef-panel-header">
                <h2>
                  <FaBed /> Personas en descanso ({diaHoyTexto}{" "}
                  {fechaHoyCorta})
                </h2>

                <span className="chef-live-pill">{fechaHoyCorta}</span>
              </div>

              <div className="chef-team-list">
                {cargando ? (
                  <p>Cargando descansos de hoy...</p>
                ) : equipoDescansoHoy.length === 0 ? (
                  <p>
                    No hay personal de Meseros, Cocina o Caja en descanso hoy (
                    {fechaHoyCorta}).
                  </p>
                ) : (
                  equipoDescansoHoy.map((persona) => (
                    <article className="chef-team-member" key={persona.id}>
                      <div className={`chef-avatar ${persona.estiloAvatar || ""}`}>
                        {persona.iniciales}
                      </div>

                      <div className="chef-member-info">
                        <strong>{persona.nombre}</strong>
                        <span>
                          {persona.detalleRol} · {persona.diaTexto}{" "}
                          {persona.fechaCorta}
                        </span>
                      </div>

                      <div className="chef-member-shift">
                        <span className="chef-shift-status proximo">
                          {persona.estado}
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="chef-team-card">
              <div className="chef-panel-header">
                <h2>
                  <FaCalendarAlt /> Personas laborando mañana ({diaMananaTexto}{" "}
                  {fechaMananaCorta})
                </h2>

                <span className="chef-live-pill">{fechaMananaCorta}</span>
              </div>

              <div className="chef-team-list">
                {cargando ? (
                  <p>Cargando turnos de mañana...</p>
                ) : equipoManana.length === 0 ? (
                  <p>
                    No hay personal de Meseros, Cocina o Caja programado para
                    mañana ({fechaMananaCorta}).
                  </p>
                ) : (
                  equipoManana.map((empleado) => (
                    <article className="chef-team-member" key={empleado.id}>
                      <div className={`chef-avatar ${empleado.estiloAvatar || ""}`}>
                        {empleado.iniciales}
                      </div>

                      <div className="chef-member-info">
                        <strong>{empleado.nombre}</strong>
                        <span>
                          {empleado.detalleRol} · {empleado.diaTexto}{" "}
                          {empleado.fechaCorta}
                        </span>
                      </div>

                      <div className="chef-member-shift">
                        <span className="chef-shift-time">
                          {empleado.horario}
                        </span>

                        <span className="chef-shift-status proximo">
                          {empleado.estado}
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="chef-side-stack">
            <section className="chef-panel-card">
              <div className="chef-panel-header">
                <h2>Personal en fin de semana</h2>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <strong>Sábado ({fechaSabadoCorta})</strong>
                {cargando ? (
                  <p>Cargando turnos del sábado...</p>
                ) : turnosSabado.length === 0 ? (
                  <p>
                    Sin turnos de Meseros, Cocina o Caja para el sábado (
                    {fechaSabadoCorta}).
                  </p>
                ) : (
                  turnosSabado.map((turnoSab) => (
                    <div className="chef-event-row" key={turnoSab.id}>
                      <div className="chef-event-box">
                        <span>{turnoSab.dia}</span>
                        <strong>{turnoSab.numero}</strong>
                      </div>

                      <div className="chef-event-info">
                        <strong>{turnoSab.nombre}</strong>
                        <span>
                          {turnoSab.detalleRol} · {turnoSab.fechaCompleta} · Turno{" "}
                          {turnoSab.horario}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <strong>Domingo ({fechaDomingoCorta})</strong>
                {cargando ? (
                  <p>Cargando turnos del domingo...</p>
                ) : turnosDomingo.length === 0 ? (
                  <p>
                    Sin turnos de Meseros, Cocina o Caja para el domingo (
                    {fechaDomingoCorta}).
                  </p>
                ) : (
                  turnosDomingo.map((turnoDom) => (
                    <div className="chef-event-row" key={turnoDom.id}>
                      <div className="chef-event-box">
                        <span>{turnoDom.dia}</span>
                        <strong>{turnoDom.numero}</strong>
                      </div>

                      <div className="chef-event-info">
                        <strong>{turnoDom.nombre}</strong>
                        <span>
                          {turnoDom.detalleRol} · {turnoDom.fechaCompleta} · Turno{" "}
                          {turnoDom.horario}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="chef-panel-card">
              <div className="chef-panel-header">
                <h2>Métricas de faltas</h2>
              </div>

              <div className="chef-metric-row">
                <div>
                  <span>Faltas graves</span>
                  <strong>{faltasGraves}</strong>
                </div>

                <span className="chef-metric-pill grave">
                  <FaExclamationTriangle /> Graves
                </span>
              </div>

              <div className="chef-metric-row">
                <div>
                  <span>Faltas moderadas</span>
                  <strong>{faltasModeradas}</strong>
                </div>

                <span className="chef-metric-pill moderado">Moderadas</span>
              </div>

              <div className="chef-metric-row">
                <div>
                  <span>Faltas leves / Total ({faltas.length})</span>
                  <strong>{faltasLeves}</strong>
                </div>

                <span className="chef-metric-pill ok">
                  <FaUserTimes /> Leves
                </span>
              </div>

              <div className="chef-metric-row">
                <div>
                  <span>Por área (Meseros / Cocina / Caja)</span>
                  <strong>
                    {faltasMeseros} / {faltasCocina} / {faltasCaja}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <strong>Detalle de faltas</strong>
                {cargando ? (
                  <p>Cargando faltas...</p>
                ) : faltas.length === 0 ? (
                  <p>Sin faltas registradas en Meseros, Cocina o Caja.</p>
                ) : (
                  faltas.map((falta) => (
                    <div className="chef-event-row" key={falta.id}>
                      <div className="chef-event-info">
                        <strong>
                          {falta.empleado} ({falta.detalleRol}) — {falta.tipo} (
                          {falta.gravedad})
                        </strong>
                        <span>
                          Fecha: {falta.fecha} · {falta.descripcion}
                          {falta.supervisor ? ` · Sup: ${falta.supervisor}` : ""}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        <p className="chef-disclaimer">
          Vista exclusiva de Meseros, Cocina y Caja — Vito RH · Vito Pizzería ·
          Ajustes pendientes: {ajustesPendientes}.
        </p>
      </main>
    </div>
  );
}