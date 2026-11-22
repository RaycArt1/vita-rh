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
import ReportesPage from "../pages/ReportesPage"; // <--- Nueva importación para el módulo de reportes
import Bitacora from "../pages/Bitacora";
import MiResumen from "../pages/empleado/MiResumen";
import MisSolicitudes from "../pages/empleado/MisSolicitudes";
import MisLlamados from "../pages/empleado/MisLlamados";
import MiPerfil from "../pages/empleado/MiPerfil";
import MisHorarios from "../pages/empleado/MisHorarios";

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
      <Route path="/chef/dashboard" element={<ChefDashboard />} />
      <Route path="/mantenimiento" element={<Mantenimiento />} />
      <Route path="/reportes" element={<ReportesPage />} /> {/* <--- Nueva ruta para Reportes e Incidencias */}
      <Route path="/bitacora" element={<Bitacora />} />
      <Route path="/resumen" element={<MiResumen />} />
      <Route path="/mis-solicitudes" element={<MisSolicitudes />} />
      <Route path="/mis-llamados" element={<MisLlamados />} />
      <Route path="/mi-perfil" element={<MiPerfil />} />
      <Route path="/mis-horarios" element={<MisHorarios />} />
    </Routes>
  );
}
