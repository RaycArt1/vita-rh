
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

const accesosDemo = [
  { rol: "Administrador", usuario: "admin", correo: "admin@vito.com" },
  { rol: "Chef de cocina", usuario: "chef", correo: "chef@vito.com" },
  { rol: "Empleado", usuario: "empleado", correo: "empleado@vito.com" },
  {
    rol: "Postulante",
    usuario: "postulante",
    correo: "postulante@vito.com",
  },
];

export default function Login() {
  const navigate = useNavigate();

  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  function seleccionarAcceso(usuario) {
    setIdentificador(usuario);
    setPassword("");
    setError("");
  }

  async function manejarLogin(event) {
    event.preventDefault();
    setError("");

    const usuarioLimpio = identificador.trim();

    if (!usuarioLimpio || !password) {
      setError("Introduce tu usuario y contraseña.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await api.post("/auth/login", {
        username: usuarioLimpio,
        password,
      });

      const resultado = respuesta.data?.data;

      if (!resultado?.token || !resultado?.usuario) {
        throw new Error("El servidor devolvió una respuesta inesperada.");
      }

      // Guardamos la sesión para esta pestaña del navegador.
      sessionStorage.setItem("gestRH_token", resultado.token);
      sessionStorage.setItem(
        "gestRH_usuario",
        JSON.stringify(resultado.usuario)
      );

      const rol = resultado.usuario.rol;

  if (rol === "CHEF") {
  navigate("/chef/dashboard", { replace: true });
  } else {
  navigate("/dashboard", { replace: true });
  }
    } catch (err) {

      const mensaje =
        err.response?.data?.mensaje ||
        err.message ||
        "No se pudo iniciar sesión. Inténtalo nuevamente.";

      setError(
        err.response?.status === 401
          ? "Usuario o contraseña incorrectos."
          : mensaje
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <header className="login-brand">
          <div className="login-brand-logo">VH</div>

          <div>
            <strong>GestRH</strong>
            <span>Vita Pizzería</span>
          </div>
        </header>

        <div className="login-brand-message">
          <span className="login-eyebrow">Gestión de personas</span>

          <h1>
            El equipo detrás de
            <br />
            cada gran pizza.
          </h1>

          <p>
            Administra turnos, talento y bienestar con una experiencia segura
            para cada rol.
          </p>
        </div>

        <footer className="login-brand-footer">
          Acceso protegido · Vito Pizzería 2026
        </footer>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          <div className="login-card-logo">VH</div>

          <h2>Bienvenido</h2>
          <p className="login-subtitle">
            Inicia sesión para acceder a tu espacio de trabajo.
          </p>

          <form onSubmit={manejarLogin}>
            <div className="login-field">
              <label htmlFor="login-usuario">USUARIO O CORREO</label>

              <input
                id="login-usuario"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Ingresa tu usuario o correo"
                value={identificador}
                onChange={(event) => setIdentificador(event.target.value)}
                disabled={cargando}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">CONTRASEÑA</label>

              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  name="password"
                  type={mostrarPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={cargando}
                  required
                />

                <button
                  className="login-show-password"
                  type="button"
                  onClick={() => setMostrarPassword((actual) => !actual)}
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  disabled={cargando}
                >
                  {mostrarPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={cargando}
            >
              {cargando ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="login-demo-note">
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
          </p>

          <div className="login-demo">
            <p className="login-demo-title">ACCESOS DE DEMOSTRACIÓN</p>

            <div className="login-demo-grid">
              {accesosDemo.map((acceso) => (
                <button
                  className="login-demo-item"
                  key={acceso.rol}
                  type="button"
                  onClick={() => seleccionarAcceso(acceso.usuario)}
                  disabled={cargando}
                >
                  <strong>{acceso.rol}</strong>
                  <span>{acceso.correo}</span>
                </button>
              ))}
            </div>

            <p className="login-demo-note">
              Seleccionar un acceso rellena el usuario; necesitas su contraseña
              válida para ingresar.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
