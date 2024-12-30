const express = require("express");
const mqtt = require("mqtt");
const mongoose = require("mongoose");
const cors = require("cors");
const moment = require("moment-timezone");

const app = express();
app.use(cors());

// Conexión a MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/temperature_humidity_db", {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Esquema de los datos de sensores
const sensorDataSchema = new mongoose.Schema(
  {
    temperature: Number,
    humidity: Number,
    time: { type: Date, default: Date.now },
  },
  { collection: "data_temp_hum" }
);

const SensorData = mongoose.model("SensorData", sensorDataSchema);

// Conexión MQTT y suscripción
const mqttClient = mqtt.connect("mqtt://192.168.0.104:1883");
mqttClient.subscribe("sensor/dht11");

mqttClient.on("message", async (topic, message) => {
  try {
    console.log("Message received:", message.toString());
    const data = JSON.parse(message.toString());
    const sensorData = new SensorData(data);
    await sensorData.save();
    console.log("Data saved:", data);
  } catch (error) {
    console.error("Error saving data:", error);
  }
});

// Función para convertir fecha UTC a hora de Perú
const convertToPeruTimezone = (utcDate) => {
  return moment.utc(utcDate).tz('America/Lima').format('YYYY-MM-DD HH:mm:ss'); // Formato de fecha y hora en Perú
};
// Endpoint para obtener los datos con un rango de fechas
app.get("/data", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Verificar que las fechas sean válidas
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Verificar la longitud del rango de fechas
    const dateDiffInDays = (end - start) / (1000 * 3600 * 24);

    // Si el rango es mayor a 7 días, reducir los datos
    let limit = 30000;
    

    // Obtener los datos filtrados por el rango de fechas
    const data = await SensorData.find({
      time: { $gte: start, $lt: end },
    })
      .sort("time") // Ordenar por tiempo ascendente
      .limit(limit); // Limitar la cantidad de registros según el rango

    // Filtrar para reducir la cantidad de puntos (e.g., 1 de cada 100 si es muy largo el rango)
    const reducedData = data
      .filter((_, index) => index % (dateDiffInDays > 1 ? 100 : 1) === 0) // Si el rango es mayor a 1 día, reducir los puntos
      .map((item) => {
        // Convertir el campo `time` de UTC a la zona horaria de Perú
        item.time = convertToPeruTimezone(item.time); // Convertir el `time` a la zona horaria de Perú
        return item;
      });

    res.json(reducedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});
// Endpoint para obtener los promedios de temperatura y humedad por hora en un día específico
app.get("/data/average/:day", async (req, res) => {
  try {
    const { day } = req.params; // Obtener el día desde los parámetros de la ruta
    const startDate = new Date(day);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1); // Incrementar un día para obtener el rango completo

    const data = await SensorData.aggregate([
      {
        $match: {
          time: { $gte: startDate, $lt: endDate }, // Filtrar por rango de fecha
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$time" }, // Agrupar por hora del campo `time`
          },
          avgTemperature: { $avg: "$temperature" }, // Promedio de temperatura
          avgHumidity: { $avg: "$humidity" }, // Promedio de humedad
        },
      },
      {
        $sort: { "_id.hour": 1 }, // Ordenar por hora ascendente
      },
    ]);

    // Convertir las horas de UTC a la zona horaria de Perú (GMT-5)
    const formattedData = data.map((item) => {
      // Convertir la hora UTC a la hora de Perú
      let hourInPeru = moment.utc().set({ hour: item._id.hour }).tz('America/Lima').hour();
      
      // Si la hora convertida en Perú es menor que 0 (por ejemplo, si es una hora en la tarde UTC)
      // debemos ajustarla para que sea una hora válida dentro del rango de 0-23 horas
      if (hourInPeru < 0) {
        hourInPeru += 24;
      }

      return {
        hour: hourInPeru, // Convertir la hora a la zona horaria de Perú
        avgTemperature: item.avgTemperature,
        avgHumidity: item.avgHumidity,
      };
    });

    // Asegurarse de que se muestren todas las 24 horas
    const hoursInPeru = Array.from({ length: 24 }, (_, index) => index); // Crear un array con las 24 horas
    const completeData = hoursInPeru.map((hour) => {
      const dataForHour = formattedData.find(item => item.hour === hour);
      return dataForHour || { hour, avgTemperature: null, avgHumidity: null }; // Si no hay datos para esa hora, agregar valores null
    });

    res.json(completeData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching average data" });
  }
});

// Iniciar servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
