import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function RestablecerContrasena() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  async function manejarEnvio(event) {
    event.preventDefault();
    setError("");
    setMensaje("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await api.post("/auth/restablecer", { token, password });
      setMensaje(respuesta.data.message);
      setPassword("");
      setConfirmar("");
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo restablecer la contraseña.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <header className="login-brand">
          <div className="text-center mb-3">
            <img
            src="/vita.jpeg"
            alt="Logo Vito Pizzería"
            style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }}/>
          </div>
          <div>
            <strong>GestRH</strong>
            <span>Vita Pizzería</span>
          </div>
        </header>
        <div className="login-brand-message">
          <span className="login-eyebrow">Nueva contraseña</span>
          <h1>Crea una<br />contraseña nueva.</h1>
          <p>Usa al menos 8 caracteres. El enlace expira en 10 minutos.</p>
        </div>
        <footer className="login-brand-footer">Acceso protegido · Vito Pizzería 2026</footer>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          <div className="text-center mb-3">
          <img
            src="/vita.jpeg"
            alt="Logo Vito Pizzería"
            style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8 }}
            />
          </div>
          <h2>Restablecer contraseña</h2>
          <p className="login-subtitle">Escribe tu nueva contraseña dos veces.</p>

          <form onSubmit={manejarEnvio}>
            <div className="login-field">
              <label htmlFor="nueva-password">NUEVA CONTRASEÑA</label>
              <div className="login-password-wrapper">
                <input
                  id="nueva-password"
                  type={mostrarPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={cargando}
                  required
                />
                <button
                  className="login-show-password"
                  type="button"
                  onClick={() => setMostrarPassword((actual) => !actual)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="confirmar-password">CONFIRMAR CONTRASEÑA</label>
              <div className="login-password-wrapper">
                <input
                  id="confirmar-password"
                  type={mostrarConfirmar ? "text" : "password"} 
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  value={confirmar}
                  onChange={(event) => setConfirmar(event.target.value)}
                  disabled={cargando}
                  required
                />
                <button
                  className="login-show-password"
                  type="button"
                  onClick={() => setMostrarConfirmar((actual) => !actual)}
                  aria-label={mostrarConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarConfirmar ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}
            {mensaje && <div className="login-error" role="status">{mensaje}</div>}

            <button className="login-submit" type="submit" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>

          <p className="login-demo-note">
            <Link to="/login">Ir al inicio de sesión</Link>
          </p>
        </div>
      </section>
    </main>
  );
}