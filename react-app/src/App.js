import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./modules/login/login";
import PrivateRoute from "./routes/private-routes";
import DataRange from "./modules/data-range/components/data-range";
import DataRealTime from "./modules/data-real-time/components/data-real-time";
import ReportDay from "./modules/report-day/components/report-day";
import Dashboard from "./modules/dashboard/components/dashboard";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Ruta Pública */}

          {/* Ruta de Login (Pública) */}
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<ReportDay />} />
            {/* Ruta Privada: Solo visible si el usuario está autenticado */}
            <Route path="/data-range" element={<DataRange />} />
            <Route path="/data-real-time" element={<DataRealTime />} />
            <Route path="/report-day" element={<ReportDay />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
