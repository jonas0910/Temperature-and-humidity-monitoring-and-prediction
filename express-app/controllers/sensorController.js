const moment = require("moment-timezone");
const { supabaseClient } = require("../config/supabase");

const convertToPeruTimezone = (utcDate) => {
  return moment.utc(utcDate).tz("America/Lima").format("YYYY-MM-DD HH:mm:ss");
};

// Obtener datos entre fechas con límite
exports.getData = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const maxLimit = 30000; // Máximo permitido
    const requestedLimit = parseInt(limit) || maxLimit;

    // Obtener datos desde Supabase
    const { data, error } = await supabaseClient
      .from("sensor_data")
      .select("*")
      .gte("time", startDate)
      .lt("time", endDate)
      .order("time", { ascending: true })
      .limit(Math.min(requestedLimit, maxLimit));

    if (error) throw error;

    // Convertir las fechas a la zona horaria de Perú
    const reducedData = data.map((item) => ({
      ...item,
      time: convertToPeruTimezone(item.time),
    }));

    res.json(reducedData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data", message: error.message });
  }
};

// Obtener promedios horarios de temperatura y humedad
exports.getHourlyAverages = async (req, res) => {
  try {
    const { day } = req.params;

    // Definir el rango de fechas con zona horaria de Perú
    const startDate = new Date(`${day}T00:00:00-05:00`).toISOString();
    const endDate = new Date(`${day}T23:59:59-05:00`).toISOString();

    // Obtener datos de Supabase
    const { data, error } = await supabaseClient
      .from("sensor_data")
      .select("time, temperature, humidity")
      .gte("time", startDate)
      .lt("time", endDate);

    if (error) throw error;

    // Agrupar por hora
    const hourlyData = {};
    data.forEach((item) => {
      const hour = moment(item.time).tz("America/Lima").hour();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { sumTemp: 0, sumHum: 0, count: 0 };
      }
      hourlyData[hour].sumTemp += item.temperature;
      hourlyData[hour].sumHum += item.humidity;
      hourlyData[hour].count += 1;
    });

    // Formatear resultados con 24 horas aseguradas
    const formattedData = Array.from({ length: 24 }, (_, hour) => {
      const entry = hourlyData[hour];
      return {
        hour,
        avgTemperature: entry ? entry.sumTemp / entry.count : null,
        avgHumidity: entry ? entry.sumHum / entry.count : null,
      };
    });

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching average data", message: error.message });
  }
};
