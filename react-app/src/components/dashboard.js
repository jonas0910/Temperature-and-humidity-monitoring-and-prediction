import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async (startDate, endDate) => {
    try {
      setLoading(true);
      const url = new URL("http://192.168.0.104:3000/data");
      if (startDate && endDate) {
        url.searchParams.append("startDate", startDate);
        url.searchParams.append("endDate", endDate);
      }

      const response = await fetch(url);
      const rawData = await response.json();

      // Transformar las fechas en un formato legible
      const formattedData = rawData.map((item) => ({
        ...item,
        time: new Date(item.time).toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  return (
    <div className="p-4 flex flex-col items-center bg-gray-100">
      <h1 className="text-2xl mb-4">Sensor Dashboard</h1>

      {/* Inputs para seleccionar fechas */}
      <div className="mb-4 flex gap-4">
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="p-2 border rounded"
        />
        <button
          onClick={() => fetchData(startDate, endDate)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Filtrar
        </button>
      </div>

      {/* Mostrar un mensaje de carga si los datos están siendo solicitados */}
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="mx-auto">
          <LineChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
            <Line type="monotone" dataKey="humidity" stroke="#82ca9d" />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
