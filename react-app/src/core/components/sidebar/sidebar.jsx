import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import supabase from "../../config/supabase-client";
import { useNavigate } from "react-router-dom";
import { FaDoorOpen } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener la ubicación actual
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Función para comprobar si el enlace es el actual
  const isActive = (path) => location.pathname === path;

  return (
    <div className="mr-72">
      <aside className="w-72 h-screen fixed top-0 left-0 bg-black shadow-xl text-gray-300 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-200">Menú</h1>
          <div>
            <button
              className="px-4 py-2 rounded-full flex gap-4 bg-gray-800 hover:bg-gray-700 transition-all"
              onClick={() => logout()}
            >
              <FaDoorOpen className="h-5 w-5" />
              Salir
            </button>
          </div>
        </div>

        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={`block py-2 px-4 text-gray-400 hover:text-white transition-all border-l-4 ${
                  isActive("/") ? "border-gray-500" : "border-transparent"
                }`}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                to="/data-range"
                className={`block py-2 px-4 text-gray-400 hover:text-white transition-all border-l-4 ${
                  isActive("/data-range") ? "border-gray-500" : "border-transparent"
                }`}
              >
                Datos por rango de fechas
              </Link>
            </li>
            <li>
              <Link
                to="/data-real-time"
                className={`block py-2 px-4 text-gray-400 hover:text-white transition-all border-l-4 ${
                  isActive("/data-real-time") ? "border-gray-500" : "border-transparent"
                }`}
              >
                Datos en tiempo real
              </Link>
            </li>
            <li>
              <Link
                to="/report-day"
                className={`block py-2 px-4 text-gray-400 hover:text-white transition-all border-l-4 ${
                  isActive("/report-day") ? "border-gray-500" : "border-transparent"
                }`}
              >
                Reporte diario
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
