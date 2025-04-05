import React, { useState, useEffect, useRef } from "react";
import mqtt from "mqtt";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";
import { WiThermometer } from "react-icons/wi";

const MQTT_BROKER = process.env.REACT_APP_MQTT_BROKER;
const MQTT_USERNAME = process.env.REACT_APP_MQTT_USERNAME;
const MQTT_PASSWORD = process.env.REACT_APP_MQTT_PASSWORD;
const MQTT_TOPIC = process.env.REACT_APP_MQTT_TOPIC || "sensor/dht11";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DataRealTime = () => {
  const [data, setData] = useState([]);
  const clientRef = useRef(null);

  const fetchHistoricalData = async () => {
    try {
      const url = new URL(`${API_URL}/data`);
      url.searchParams.append("limit", 100); // Obtener los últimos 100 datos
      const response = await fetch(url);
      const rawData = await response.json();

      const formattedData = rawData.map((item) => ({
        ...item,
        time: new Date(item.time).toLocaleString("es-PE", {
          hour: "2-digit",
          minute: "2-digit"
        }),
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  useEffect(() => {
    fetchHistoricalData();

    const options = {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      reconnectPeriod: 5000,
    };

    const client = mqtt.connect(MQTT_BROKER, options);
    clientRef.current = client;

    client.on("connect", () => {
      console.log("✅ Conectado a MQTT");
      client.subscribe(MQTT_TOPIC, (err) => {
        if (!err) console.log(`📡 Suscrito a ${MQTT_TOPIC}`);
      });
    });

    client.on("message", (topic, message) => {
      try {
        const parsedData = JSON.parse(message.toString());
        const newDataPoint = {
          time: dayjs().format("hh:mm A"),
          temperature: parsedData.temperature,
          humidity: parsedData.humidity,
        };

        // Mantener solo los 100 últimos datos
        setData((prevData) => {
          const updatedData = [...prevData, newDataPoint];
          return updatedData.slice(-100);  // Mantener solo los últimos 100 datos
        });
      } catch (error) {
        console.error("❌ Error al procesar el mensaje MQTT:", error);
      }
    });

    client.on("error", (err) => console.error("🚨 Error en MQTT:", err));

    return () => {
      client.end();
      console.log("🔌 Desconectado de MQTT");
    };
  }, []);

  return (
    <div className="w-full max-w-5xl bg-white p-6 rounded-2xl shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <WiThermometer className="text-blue-500 text-3xl" />
        <h2 className="text-xl font-semibold text-gray-800">
          Gráfico en Tiempo Real
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={[...data].reverse()}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "none",
              color: "#fff",
            }}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Temperatura (°C)"
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="Humedad (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataRealTime;
