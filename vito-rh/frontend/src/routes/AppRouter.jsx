import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Empleados from "../pages/Empleados";
import Horarios from "../pages/Horarios";
import Solicitudes from "../pages/Solicitudes";
import Expedientes from "../pages/Expedientes";
import Usuarios from "../pages/Usuarios";
import Reclutamiento from "../pages/Reclutamiento";
import ChefDashboard from "../pages/Chef/ChefDashboard";
import RecuperarContrasena from "../pages/RecuperarContrasena";
import RestablecerContrasena from "../pages/RestablecerContrasena";
import Mantenimiento from "../pages/Mantenimiento";
import ReportesPage from "../pages/ReportesPage";
import Bitacora from "../pages/Bitacora";
import Planillas from "../pages/Planillas";

import MiResumen from "../pages/empleado/MiResumen";
import MisSolicitudes from "../pages/empleado/MisSolicitudes";
import MisLlamados from "../pages/empleado/MisLlamados";
import MiPerfil from "../pages/empleado/MiPerfil";

function RutaPrivada({ children }) {
  const token = sessionStorage.getItem("gestRH_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/recuperar" element={<RecuperarContrasena />} />
      <Route path="/restablecer/:token" element={<RestablecerContrasena />} />

      {/* Rutas del Panel Administrador */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/empleados" element={<Empleados />} />
      <Route path="/horarios" element={<Horarios />} />
      <Route path="/solicitudes" element={<Solicitudes />} />
      <Route path="/expedientes" element={<Expedientes />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route
        path="/reclutamiento"
        element={
          <RutaPrivada>
            <Reclutamiento />
          </RutaPrivada>
        }
      />
      <Route path="/mantenimiento" element={<Mantenimiento />} />
      <Route path="/reportes" element={<ReportesPage />} />
      <Route path="/bitacora" element={<Bitacora />} />
      <Route path="/planillas" element={<Planillas />} />

      {/* Rutas del Panel del Chef (Directas, sin layouts intermedios que dupliquen menús) */}
      <Route path="/chef/dashboard" element={<ChefDashboard />} />
      <Route path="/chef/empleados" element={<Empleados modoChef={true} />} />
      <Route path="/chef/horarios" element={<Horarios modoChef={true} />} />
      <Route path="/chef/solicitudes" element={<Solicitudes modoChef={true} />} />
      <Route path="/chef/reclutamiento" element={<Reclutamiento modoChef={true} />} />
      <Route path="/chef/reportes" element={<ReportesPage modoChef={true} />} />
      <Route path="/chef/bitacora" element={<Bitacora modoChef={true} />} />
      <Route path="/chef/mantenimiento" element={<Mantenimiento modoChef={true} />} />

      {/* Rutas del Panel de Empleado */}
      <Route path="/resumen" element={<MiResumen />} />
      <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
      <Route path="/mis-llamados" element={<MisLlamados />} />
      <Route path="/mi-perfil" element={<MiPerfil />} />
    </Routes>
  );
}