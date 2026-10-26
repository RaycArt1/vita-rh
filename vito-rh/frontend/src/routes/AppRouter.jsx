import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Empleados from "../pages/Empleados";
import Horarios from "../pages/Horarios";
import Vacaciones from "../pages/Vacaciones";
import Expedientes from "../pages/Expedientes";
import Usuarios from "../pages/Usuarios";
import ChefDashboard from "../pages/Chef/ChefDashboard";
import RecuperarContrasena from "../pages/RecuperarContrasena";
import RestablecerContrasena from "../pages/RestablecerContrasena";

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
      <Route path="/vacaciones" element={<Vacaciones />} />
      <Route path="/expedientes" element={<Expedientes />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/chef/dashboard" element={<ChefDashboard />} />
    </Routes>
  );
}