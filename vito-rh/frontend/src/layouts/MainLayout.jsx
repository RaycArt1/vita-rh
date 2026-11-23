import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  // Detecta si estamos en el panel de chef según la URL actual
  const esChef = window.location.pathname.includes("/chef");

  return (
    <div className="app-shell d-flex vh-100">
      <Sidebar />

      <div className="app-main flex-grow-1 d-flex flex-column">
        <Navbar />

        <main className="app-content flex-grow-1 bg-light p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}