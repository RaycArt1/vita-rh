import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="d-flex vh-100">
      <Sidebar />

      <div className="flex-grow-1 d-flex flex-column">

        <Navbar />

        <main className="flex-grow-1 bg-light p-4">
          {children}
        </main>

      </div>
    </div>
  );
}