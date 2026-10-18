
import logoVito from "../assets/vito-logo-dark.png";
import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-label="Cargando GestRH">
      <div className="loading-content">
        <img
          src={logoVito}
          alt="Vito Pizzería"
          className="loading-logo"
        />

        <div className="loading-brand">GestRH</div>

        <p>Preparando tu espacio de trabajo...</p>

        <div className="loading-progress">
          <div className="loading-progress-bar" />
        </div>

        <span className="loading-caption">GESTIÓN DE RECURSOS HUMANOS</span>
      </div>
    </div>
  );
}
