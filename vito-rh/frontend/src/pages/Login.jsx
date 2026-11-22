import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

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

      sessionStorage.setItem("gestRH_token", resultado.token);
      sessionStorage.setItem(
        "gestRH_usuario",
        JSON.stringify(resultado.usuario)
      );

      const rol = resultado.usuario.rol;

      if (rol === "CHEF") {
        navigate("/chef/dashboard", { replace: true });
      } else if (rol === "EMPLEADO") {
        navigate("/resumen", { replace: true });
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
          <img
            src="/vita.jpeg"
            alt="Logo Vito Pizzería"
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />

          <div>
            <strong>GestRH</strong>
            <span>Vita Pizzería</span>
          </div>
        </header>

        <div className="login-brand-message">
          <h1>
            "Mas que comida,
            <br />
            es alta cocina"
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
          <div className="text-center mb-3">
            <img
              src="/vita.jpeg"
              alt="Logo Vito Pizzería"
              style={{
                width: 44,
                height: 44,
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </div>

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
        </div>
      </section>
    </main>
  );
}