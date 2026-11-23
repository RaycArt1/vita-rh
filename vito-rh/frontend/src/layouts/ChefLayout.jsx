import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function ChefLayout() {
  return (
    <div className="chef-layout-wrapper" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar único y exclusivo para el Chef */}
      <Sidebar />

      {/* Contenedor principal de las vistas del Chef */}
      <div className="chef-content-area" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <main style={{ flex: 1, padding: "20px", background: "#f8f9fa" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}