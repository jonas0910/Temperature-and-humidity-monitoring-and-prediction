import React, { useState, useEffect } from "react";
import mqtt from "mqtt";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MQTT_BROKER = "ws://localhost:9001"; // Cambia por la URL de tu servidor Mosquitto
const MQTT_TOPIC = "sensor/dht11"; // Cambia por el tema MQTT al que te suscribirás

export const RealTimeGrafic = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Conectar al servidor MQTT
    const client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {
      console.log("Conectado a MQTT");
      client.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
          console.log(`Suscrito al tema: ${MQTT_TOPIC}`);
        }
      });
    });

    client.on("message", (topic, message) => {
      try {
        const parsedData = JSON.parse(message.toString());

        // Estructura del dato esperado: { time: "HH:mm:ss", value: 25.5 }
        const newDataPoint = {
          time: new Date().toLocaleTimeString(), // Hora actual
          value: parsedData.value, // Valor del sensor
        };

        setData((prevData) => [...prevData.slice(-20), newDataPoint]); // Mantiene solo los últimos 20 datos
      } catch (error) {
        console.error("Error al procesar el mensaje MQTT:", error);
      }
    });

    return () => {
      client.end(); // Desconectar MQTT al desmontar el componente
    };
  }, []);

  return (
    <div className="w-full h-80 bg-white p-4 shadow-lg rounded-lg">
      <h2 className="text-lg font-bold mb-2">Gráfico en Tiempo Real</h2>
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
