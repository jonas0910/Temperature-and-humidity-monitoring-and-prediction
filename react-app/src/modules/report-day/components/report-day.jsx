import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaThermometerHalf, FaTint } from "react-icons/fa";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const ReportDay = ({ day = dayjs().format("YYYY-MM-DD") }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/data/average/${day}`
        );

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
        setError("Error fetching data: " + err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [day]);

  if (loading) return <p style={styles.loading}>Cargando datos...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reporte del {day}</h2>
      <div style={styles.grid}>
        {data.map((item, index) => (
          <div key={index} style={styles.card}>
            <h3 style={styles.hour}>{item.hour}</h3>
            <div style={styles.row}>
              <FaThermometerHalf style={{ ...styles.icon, color: "#EF4444" }} />
              <span style={styles.value}>
                {item.avgTemperature?.toFixed(2)}°C
              </span>
            </div>
            <div style={styles.row}>
              <FaTint style={{ ...styles.icon, color: "#3B82F6" }} />
              <span style={styles.value}>
                {item.avgHumidity?.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    fontFamily: "system-ui, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    fontSize: "1.75rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "1.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "1.25rem",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    padding: "1rem",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    textAlign: "center",
    cursor: "default",
  },
  hour: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.75rem",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  icon: {
    fontSize: "1.5rem",
  },
  value: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#111827",
  },
  loading: {
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#6B7280",
  },
  error: {
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#DC2626",
  },
};

export default ReportDay;
