import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function manejarEnvio(event) {
    event.preventDefault();
    setError("");
    setMensaje("");

    const correoLimpio = correo.trim();

    if (!correoLimpio) {
      setError("Introduce tu correo.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await api.post("/auth/recuperar", { correo: correoLimpio });
      setMensaje(respuesta.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo procesar la solicitud.");
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
          style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }}
          />
          </div>
          <div>
            <strong>GestRH</strong>
            <span>Vita Pizzería</span>
          </div>
        </header>
        <div className="login-brand-message">
          <span className="login-eyebrow">Recuperación de acceso</span>
          <h1>¿Olvidaste tu<br />contraseña?</h1>
          <p>Te enviaremos un enlace al correo registrado en tu cuenta.</p>
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
          <h2>Recuperar contraseña</h2>
          <p className="login-subtitle">Escribe el correo con el que accedes al sistema.</p>

          <form onSubmit={manejarEnvio}>
            <div className="login-field">
              <label htmlFor="recuperar-correo">CORREO ELECTRÓNICO</label>
              <input
                id="recuperar-correo"
                type="email"
                autoComplete="email"
                placeholder="Ingresa tu correo"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                disabled={cargando}
                required
              />
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}
            {mensaje && <div className="login-error" role="status">{mensaje}</div>}

            <button className="login-submit" type="submit" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>

          <p className="login-demo-note">
            <Link to="/login">← Volver al inicio de sesión</Link>
          </p>
        </div>
      </section>
    </main>
  );
}