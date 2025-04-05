import React, { useState, useEffect, useRef } from "react";
import mqtt from "mqtt";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

const MQTT_BROKER = "wss://07706de4d2c444f8b58edc3ad5eca384.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_TOPIC = "sensor/dht11";

export const RealTimeGrafic = () => {
  const [data, setData] = useState(() => {
    // Recuperar datos guardados en localStorage al cargar el componente
    const savedData = localStorage.getItem("sensorData");
    return savedData ? JSON.parse(savedData) : [];
  });

  const clientRef = useRef(null); // Mantener referencia al cliente MQTT

  useEffect(() => {
    // Conectar al broker MQTT con opciones
    const options = {
      username: "jonathan",  // Si es necesario
      password: "PASSword123",
      reconnectPeriod: 5000,  // Reintentar cada 5s en caso de fallo
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
          time: dayjs().format("HH:mm:ss"),
          value: parsedData.temperature,
        };

        setData((prevData) => {
          const updatedData = [...prevData.slice(-49), newDataPoint];

          // Guardar en localStorage después de actualizar el estado
          localStorage.setItem("sensorData", JSON.stringify(updatedData));

          return updatedData;
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
    <div className="w-full h-80 bg-white p-4 shadow-lg rounded-lg">
      <h2 className="text-lg font-bold mb-2">📊 Gráfico en Tiempo Real</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
