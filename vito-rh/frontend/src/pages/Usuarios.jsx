import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

const ROLES_FIJOS = [
  { value: "ADMINISTRADOR", label: "Administrador" },
  { value: "CHEF", label: "Chef de cocina" },
  { value: "EMPLEADO", label: "Empleado" },
  { value: "CLIENTE", label: "Cliente" },
];

const formularioInicial = {
  username: "",
  password: "",
  confirmPassword: "",
  rol: "EMPLEADO",
  empleadoId: "",
};

const formularioRolInicial = {
  nombre: "",
  descripcion: "",
};

function nombreCompleto(usuario) {
  const empleado = usuario.empleado;
  return empleado
    ? `${empleado.nombres} ${empleado.apellidos}`
    : "Sin empleado asociado";
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [rolesDinamicos, setRolesDinamicos] = useState(ROLES_FIJOS);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardandoRol, setGuardandoRol] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  
  // Control de modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalRolAbierto, setModalRolAbierto] = useState(false);
  
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [formularioRol, setFormularioRol] = useState(formularioRolInicial);

  // Estados para ver u ocultar las contraseñas
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    setError("");

    try {
      const [respuestaUsuarios, respuestaEmpleados] = await Promise.all([
        api.get("/usuarios"),
        api.get("/usuarios/empleados-disponibles"),
      ]);

      setUsuarios(respuestaUsuarios.data);
      setEmpleados(respuestaEmpleados.data);

      // Intentar cargar roles dinámicos si existe la ruta de roles en el backend
      try {
        const respuestaRoles = await api.get("/roles");
        if (respuestaRoles.data && respuestaRoles.data.length > 0) {
          const rolesMapeados = respuestaRoles.data.map(r => ({
            value: r.nombre.toUpperCase(),
            label: r.nombre
          }));
          setRolesDinamicos(rolesMapeados);
        }
      } catch (errRol) {
        // Si no existe la ruta de roles aún, se mantienen los roles por defecto
      }

    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudieron cargar los usuarios. Verifica que el backend esté funcionando."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const empleado = nombreCompleto(usuario).toLowerCase();

      return (
        usuario.username.toLowerCase().includes(texto) ||
        empleado.includes(texto) ||
        usuario.rol.toLowerCase().includes(texto)
      );
    });
  }, [usuarios, busqueda]);

  const activos = usuarios.filter((usuario) => usuario.activo).length;

  function abrirCrear() {
    setEditando(null);
    setFormulario({ ...formularioInicial });
    setMostrarPassword(false);
    setMostrarConfirmPassword(false);
    setError("");
    setExito("");
    setModalAbierto(true);
  }

  function abrirCrearRol() {
    setFormularioRol(formularioRolInicial);
    setError("");
    setExito("");
    setModalRolAbierto(true);
  }

  function abrirEditar(usuario) {
    setEditando(usuario);
    setFormulario({
      username: usuario.username,
      password: "",
      confirmPassword: "",
      rol: usuario.rol,
      empleadoId: String(usuario.empleadoId),
    });
    setMostrarPassword(false);
    setMostrarConfirmPassword(false);
    setError("");
    setExito("");
    setModalAbierto(true);
  }

  // Manejo de cambios con autogeneración de username al seleccionar empleado
  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    if (name === "empleadoId") {
      if (value) {
        const empSel = empleados.find((e) => e.id === Number(value));
        if (empSel) {
          const primerNombre = empSel.nombres.trim().charAt(0).toLowerCase();
          const primerApellido = empSel.apellidos.trim().split(" ")[0].toLowerCase();
          const usernameGenerado = `${primerNombre}${primerApellido}`;

          setFormulario((anterior) => ({
            ...anterior,
            empleadoId: value,
            username: usernameGenerado,
          }));
          return;
        }
      }
      setFormulario((anterior) => ({
        ...anterior,
        empleadoId: "",
        username: "",
      }));
      return;
    }

    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  }

  function cambiarCampoRol(evento) {
    const { name, value } = evento.target;
    setFormularioRol((anterior) => ({ ...anterior, [name]: value }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError("");
    setExito("");

    try {
      if (editando) {
        const cambios = {
          username: formulario.username.trim(),
          rol: formulario.rol,
        };

        if (formulario.password) {
          cambios.password = formulario.password;
          cambios.confirmPassword = formulario.confirmPassword;
        }

        await api.put(`/usuarios/${editando.id}`, cambios);
        setExito("Usuario actualizado correctamente.");
      } else {
        await api.post("/usuarios", {
          ...formulario,
          username: formulario.username.trim(),
          empleadoId: Number(formulario.empleadoId),
        });
        setExito("Usuario creado correctamente.");
      }

      setModalAbierto(false);
      await cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudo guardar el usuario."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function guardarRol(evento) {
    evento.preventDefault();
    setGuardandoRol(true);
    setError("");
    setExito("");

    try {
      await api.post("/roles", {
        nombre: formularioRol.nombre.trim(),
        descripcion: formularioRol.descripcion.trim(),
      });

      setExito("Rol creado correctamente.");
      setModalRolAbierto(false);
      await cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudo crear el rol. Verifica la ruta en el backend."
      );
    } finally {
      setGuardandoRol(false);
    }
  }

  async function cambiarEstado(usuario) {
    const accion = usuario.activo ? "desactivar" : "activar";

    if (!window.confirm(`¿Deseas ${accion} la cuenta ${usuario.username}?`)) {
      return;
    }

    setError("");
    setExito("");

    try {
      await api.put(`/usuarios/${usuario.id}`, {
        activo: !usuario.activo,
      });

      setExito(
        `Cuenta ${usuario.activo ? "desactivada" : "activada"} correctamente.`
      );

      await cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudo cambiar el estado."
      );
    }
  }

  function etiquetaRol(rol) {
    return rolesDinamicos.find((item) => item.value === rol)?.label || rol;
  }

  return (
    <MainLayout>
      <div className="container-fluid py-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1">Usuarios y Roles</h2>
            <p className="text-secondary mb-0">
              Administra las cuentas y sus permisos dentro de Vito RH.
            </p>
          </div>

          {/* Botones de acción principales */}
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={abrirCrearRol}>
              <i className="bi bi-shield-plus me-2" />
              Nuevo rol
            </button>
            <button className="btn btn-primary" onClick={abrirCrear}>
              <i className="bi bi-person-plus me-2" />
              Nuevo usuario
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {exito && (
          <div className="alert alert-success" role="status">
            {exito}
          </div>
        )}

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle bg-primary-subtle text-primary p-3">
                  <i className="bi bi-people fs-4" />
                </div>
                <div>
                  <div className="text-secondary small">Total de cuentas</div>
                  <div className="fs-3 fw-bold">{usuarios.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle bg-success-subtle text-success p-3">
                  <i className="bi bi-person-check fs-4" />
                </div>
                <div>
                  <div className="text-secondary small">Cuentas activas</div>
                  <div className="fs-3 fw-bold">{activos}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle bg-warning-subtle text-warning p-3">
                  <i className="bi bi-shield-lock fs-4" />
                </div>
                <div>
                  <div className="text-secondary small">Roles disponibles</div>
                  <div className="fs-3 fw-bold">{rolesDinamicos.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-7 col-lg-5">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search" />
                  </span>
                  <input
                    className="form-control"
                    placeholder="Buscar usuario, empleado o rol..."
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                  />
                </div>
              </div>

              <div className="col text-md-end text-secondary small align-self-center">
                {usuariosFiltrados.length} resultado(s)
              </div>
            </div>

            {cargando ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-secondary mt-2 mb-0">
                  Cargando usuarios...
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Usuario</th>
                      <th>Empleado</th>
                      <th>Área / puesto</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id}>
                        <td>
                          <div className="fw-semibold">{usuario.username}</div>
                          <small className="text-secondary">
                            ID: {usuario.id}
                          </small>
                        </td>

                        <td>
                          <div>{nombreCompleto(usuario)}</div>
                          <small className="text-secondary">
                            {usuario.empleado?.correo || "—"}
                          </small>
                        </td>

                        <td>
                          <div>{usuario.empleado?.puesto?.nombre || "—"}</div>
                          <small className="text-secondary">
                            {usuario.empleado?.area?.nombre || "—"}
                          </small>
                        </td>

                        <td>
                          <span className="badge text-bg-primary">
                            {etiquetaRol(usuario.rol)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              usuario.activo
                                ? "text-bg-success"
                                : "text-bg-secondary"
                            }`}
                          >
                            {usuario.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              title="Editar usuario"
                              onClick={() => abrirEditar(usuario)}
                            >
                              <i className="bi bi-pencil" />
                            </button>

                            <button
                              className={`btn ${
                                usuario.activo
                                  ? "btn-outline-danger"
                                  : "btn-outline-success"
                              }`}
                              title={usuario.activo ? "Desactivar" : "Activar"}
                              onClick={() => cambiarEstado(usuario)}
                            >
                              <i
                                className={`bi ${
                                  usuario.activo
                                    ? "bi-person-x"
                                    : "bi-person-check"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {usuariosFiltrados.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-5 text-secondary"
                        >
                          No se encontraron usuarios.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* MODAL CREAR / EDITAR USUARIO */}
        {modalAbierto && (
          <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,.45)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <form onSubmit={guardar}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editando ? "Editar usuario" : "Crear usuario"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Cerrar"
                      onClick={() => setModalAbierto(false)}
                    />
                  </div>

                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger">{error}</div>
                    )}

                    {!editando && (
                      <div className="mb-3">
                        <label className="form-label">Empleado asociado</label>
                        <select
                          className="form-select"
                          name="empleadoId"
                          value={formulario.empleadoId}
                          onChange={cambiarCampo}
                          required
                        >
                          <option value="">Selecciona un empleado</option>
                          {empleados.map((empleado) => (
                            <option key={empleado.id} value={empleado.id}>
                              {empleado.nombres} {empleado.apellidos} —{" "}
                              {empleado.correo}
                            </option>
                          ))}
                        </select>

                        {empleados.length === 0 && (
                          <small className="text-warning">
                            No hay empleados activos sin cuenta disponible.
                          </small>
                        )}
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Nombre de usuario</label>
                      <input
                        className="form-control"
                        name="username"
                        value={formulario.username}
                        onChange={cambiarCampo}
                        minLength={3}
                        required
                        placeholder="Se autogenera al elegir empleado"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Contraseña
                        {editando && " (vacía para conservar la actual)"}
                      </label>
                      <div className="input-group">
                        <input
                          className="form-control"
                          type={mostrarPassword ? "text" : "password"}
                          name="password"
                          value={formulario.password}
                          onChange={cambiarCampo}
                          minLength={8}
                          required={!editando}
                          autoComplete="new-password"
                          placeholder="Mínimo 8 caracteres y 1 carácter especial"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setMostrarPassword(!mostrarPassword)}
                          title={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          <i className={`bi ${mostrarPassword ? "bi-eye-slash" : "bi-eye"}`} />
                        </button>
                      </div>
                      {!editando && (
                        <small className="text-secondary d-block mt-1">
                          Debe incluir al menos un símbolo especial (ej. @, $, !, %).
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Confirmar contraseña</label>
                      <div className="input-group">
                        <input
                          className="form-control"
                          type={mostrarConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formulario.confirmPassword}
                          onChange={cambiarCampo}
                          minLength={8}
                          required={!editando || formulario.password !== ""}
                          placeholder="Repite la contraseña"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                          title={mostrarConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          <i className={`bi ${mostrarConfirmPassword ? "bi-eye-slash" : "bi-eye"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Rol</label>
                      <select
                        className="form-select"
                        name="rol"
                        value={formulario.rol}
                        onChange={cambiarCampo}
                        required
                      >
                        {rolesDinamicos.map((rol) => (
                          <option key={rol.value} value={rol.value}>
                            {rol.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setModalAbierto(false)}
                      disabled={guardando}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        guardando || (!editando && empleados.length === 0)
                      }
                    >
                      {guardando ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CREAR NUEVO ROL */}
        {modalRolAbierto && (
          <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,.45)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <form onSubmit={guardarRol}>
                  <div className="modal-header">
                    <h5 className="modal-title">Crear nuevo rol</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Cerrar"
                      onClick={() => setModalRolAbierto(false)}
                    />
                  </div>

                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger">{error}</div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Nombre del rol</label>
                      <input
                        className="form-control"
                        name="nombre"
                        value={formularioRol.nombre}
                        onChange={cambiarCampoRol}
                        required
                        placeholder="Ej. SUPERVISOR"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        name="descripcion"
                        value={formularioRol.descripcion}
                        onChange={cambiarCampoRol}
                        rows={3}
                        placeholder="Breve descripción del rol..."
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setModalRolAbierto(false)}
                      disabled={guardandoRol}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={guardandoRol}
                    >
                      {guardandoRol ? "Guardando..." : "Guardar rol"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}