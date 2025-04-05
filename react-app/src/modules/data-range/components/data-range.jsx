import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DataRange = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(1000);
  const [loading, setLoading] = useState(false);

  const fetchData = async (startDate, endDate, limit) => {
    try {
      setLoading(true);
      const url = new URL(process.env.REACT_APP_API_URL + "/data");

      if (startDate && endDate) {
        url.searchParams.append("startDate", startDate);
        url.searchParams.append("endDate", endDate);
      }

      if (limit) {
        url.searchParams.append("limit", limit);
      }

      const response = await fetch(url);
      const rawData = await response.json();

      const formattedData = rawData.map((item) => ({
        ...item,
        time: new Date(item.time).toLocaleString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleLimitChange = (e) => setLimit(e.target.value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-5xl">
        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
          📊 Reporte de Temperatura y Humedad
        </h1>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="p-2 border rounded-md shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Fecha fin</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="p-2 border rounded-md shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Límite</label>
            <input
              type="number"
              value={limit}
              onChange={handleLimitChange}
              className="p-2 border rounded-md shadow-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchData(startDate, endDate, limit)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition"
            >
              Filtrar
            </button>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-gray-50 rounded-xl shadow-inner p-4">
          {loading ? (
            <p className="text-center text-gray-500">Cargando datos...</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#1e3a8a"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataRange;
