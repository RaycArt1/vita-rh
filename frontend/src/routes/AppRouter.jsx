import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Empleados from "../pages/Empleados";
import Horarios from "../pages/Horarios";
import Vacaciones from "../pages/Vacaciones";
import Expedientes from "../pages/Expedientes";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/empleados" element={<Empleados />} />
      <Route path="/horarios" element={<Horarios />} />
      <Route path="/vacaciones" element={<Vacaciones />} />
      <Route path="/expedientes" element={<Expedientes />} />
    </Routes>
  );
}