import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrarPostulante } from "../services/postulanteService";
import "./postulante/Postulante.css";

export default function RegistroPostulante() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState({ nombre: "", apellido: "", email: "", telefono: "", password: "", confirmar: "" });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const cambiar = (clave, valor) => setDatos((d) => ({ ...d, [clave]: valor }));
  async function registrar(e) {
    e.preventDefault(); setError("");
    if (datos.password !== datos.confirmar) return setError("Las contraseñas no coinciden.");
    if (datos.password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    setGuardando(true);
    try {
      await registrarPostulante(datos);
      navigate("/login", { replace: true, state: { aviso: "Cuenta de postulante creada. Inicia sesión con tu correo y contraseña." } });
    } catch (err) { setError(err.response?.data?.mensaje || "No fue posible registrarte. Comprueba tu conexión."); }
    finally { setGuardando(false); }
  }
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f5f6", padding: 22 }}>
    <div className="ps-tarjeta" style={{ width: "100%", maxWidth: 510 }}>
      <div className="ps-marca-icono" style={{ marginBottom: 12 }}>VH</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Crea tu cuenta de postulante</h1>
      <p style={{ marginBottom: 18 }}>Encuentra tu próxima oportunidad en Vita Pizzería.</p>
      {error && <div className="ps-alerta error" role="alert">{error}</div>}
      <form className="ps-form" onSubmit={registrar}>
        <label>Nombre *<input required maxLength={90} value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} /></label>
        <label>Apellido *<input required maxLength={90} value={datos.apellido} onChange={(e) => cambiar("apellido", e.target.value)} /></label>
        <label>Correo electrónico *<input required type="email" maxLength={190} autoComplete="email" value={datos.email} onChange={(e) => cambiar("email", e.target.value)} /></label>
        <label>Teléfono<input type="tel" maxLength={24} value={datos.telefono} onChange={(e) => cambiar("telefono", e.target.value)} /></label>
        <label>Contraseña *<input required type="password" autoComplete="new-password" minLength={8} maxLength={72} value={datos.password} onChange={(e) => cambiar("password", e.target.value)} /></label>
        <label>Confirmar contraseña *<input required type="password" autoComplete="new-password" minLength={8} maxLength={72} value={datos.confirmar} onChange={(e) => cambiar("confirmar", e.target.value)} /></label>
        <button className="ps-boton ancho" disabled={guardando}>{guardando ? "Creando cuenta…" : "Crear cuenta"}</button>
      </form>
      <p style={{ marginTop: 18, textAlign: "center" }}>¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </div>
  </main>;
}
