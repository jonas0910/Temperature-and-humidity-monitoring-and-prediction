const moment = require("moment-timezone");
const { supabaseClient } = require("../config/supabase");

const convertToPeruTimezone = (utcDate) => {
  return moment.utc(utcDate).tz("America/Lima").format("YYYY-MM-DD HH:mm:ss");
};

// Obtener datos entre fechas con límite
exports.getData = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;

    // Si no se envían startDate y endDate, devolver los últimos 100 datos
    if (!startDate && !endDate) {
      const maxLimit = 100; // Limite de 100 datos si no se especifican las fechas
      const requestedLimit = parseInt(limit) || maxLimit;

      // Obtener los últimos datos desde Supabase
      const { data, error } = await supabaseClient
        .from("sensor_data")
        .select("*")
        .order("time", { ascending: false }) // Ordenamos por tiempo descendente
        .limit(Math.min(requestedLimit, maxLimit)); // Usar el límite solicitado o el máximo permitido

      if (error) throw error;

      // Convertir las fechas a la zona horaria de Perú
      const reducedData = data.map((item) => ({
        ...item,
        time: convertToPeruTimezone(item.time),
      }));

      return res.json(reducedData);
    }

    // Si se envían startDate y endDate, usar esos valores
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const maxLimit = 30000; // Máximo permitido
    const requestedLimit = parseInt(limit) || maxLimit;

    // Obtener datos desde Supabase con rango de fechas
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
