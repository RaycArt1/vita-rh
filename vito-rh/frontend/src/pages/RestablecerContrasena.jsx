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
          <div className="login-brand-logo">VH</div>
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
          <div className="login-card-logo">VH</div>
          <h2>Restablecer contraseña</h2>
          <p className="login-subtitle">Escribe tu nueva contraseña dos veces.</p>

          <form onSubmit={manejarEnvio}>
            <div className="login-field">
              <label htmlFor="nueva-password">NUEVA CONTRASEÑA</label>
              <input
                id="nueva-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={cargando}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="confirmar-password">CONFIRMAR CONTRASEÑA</label>
              <input
                id="confirmar-password"
                type="password"
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                value={confirmar}
                onChange={(event) => setConfirmar(event.target.value)}
                disabled={cargando}
                required
              />
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