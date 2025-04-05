import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaThermometerHalf, FaTint } from "react-icons/fa"; // Íconos para temperatura y humedad
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TemperatureHumidityReport = ({ day }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(process.env.REACT_APP_API_URL);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/data/average/${day}`);

        // Formatear las horas para que se muestren correctamente
        // const formattedData = response.data.map((item) => ({
        //   ...item,
        //   hour: new Date(2024, 0, 1, item.hour).toLocaleString("es-ES", {
        //     hour: "2-digit",
        //     minute: "2-digit",
        //     hour12: false, // Usar formato de 24 horas
        //   }),
        // }));
        const formattedData = response.data.map((item) => ({
          ...item,
          hour: dayjs()
            .set("hour", item.hour)
            .set("minute", 0)
            .set("second", 0)
            .tz("America/Lima")
            .format("HH:mm"),
        }));  

        setData(formattedData);
        setLoading(false);
      } catch (err) {
        setError("Error fetching data" + err);

        setLoading(false);
      }
    };

    fetchData();
  }, [day]);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reporte de Temperatura y Humedad - {day}</h2>
      <div style={styles.grid}>
        {data.map((item, index) => (
          <div key={index} style={styles.card}>
            <h3 style={styles.hour}>{item.hour}</h3>
            <div style={styles.iconRow}>
              <FaThermometerHalf style={styles.icon} />
              <p style={styles.temperature}>{item.avgTemperature?.toFixed(2)}°C</p>
            </div>
            <div style={styles.iconRow}>
              <FaTint style={styles.icon} />
              <p style={styles.humidity}>{item.avgHumidity?.toFixed(2)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  hour: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
  },
  iconRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "10px 0",
  },
  icon: {
    fontSize: "24px",
    color: "#007BFF",
    marginRight: "10px",
  },
  temperature: {
    fontSize: "16px",
    color: "#FF5733",
  },
  humidity: {
    fontSize: "16px",
    color: "#1D84B5",
  },
};

export default TemperatureHumidityReport;
