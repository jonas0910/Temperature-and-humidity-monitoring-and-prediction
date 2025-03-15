const SensorData = require("../models/SensorData");
const moment = require("moment-timezone");

const convertToPeruTimezone = (utcDate) => {
  return moment.utc(utcDate).tz("America/Lima").format("YYYY-MM-DD HH:mm:ss");
};

// Obtener datos con rango de fechas
// exports.getData = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({ error: "startDate and endDate are required" });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (isNaN(start) || isNaN(end)) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }

//     const data = await SensorData.find({ time: { $gte: start, $lt: end } }).sort("time").limit(30000);

//     const reducedData = data
//       .filter((_, index) => index % (end - start > 86400000 ? 100 : 1) === 0)
//       .map((item) => ({ ...item._doc, time: convertToPeruTimezone(item.time) }));

//     res.json(reducedData);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching data" });
//   }
// };

exports.getData = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const maxLimit = 30000; // Máximo de datos permitidos
    const requestedLimit = parseInt(limit, 10) || maxLimit; // Convierte a número, si es inválido usa el máximo

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const data = await SensorData.find({ time: { $gte: start, $lt: end } })
      .sort("time")
      .limit(Math.min(requestedLimit, maxLimit)); // Limita a lo permitido

    // Reducción de datos si hay demasiados (según diferencia de fechas)
    const reducedData = data
      .filter((_, index) => index % (end - start > 86400000 ? 100 : 1) === 0)
      .map((item) => ({ ...item._doc, time: convertToPeruTimezone(item.time) }));

    res.json(reducedData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
};


// // Obtener promedios por hora
// exports.getHourlyAverages = async (req, res) => {
//   try {
//     const { day } = req.params;
//     const startDate = new Date(day);
//     const endDate = new Date(startDate);
//     endDate.setDate(startDate.getDate() + 1);

//     const data = await SensorData.aggregate([
//       { $match: { time: { $gte: startDate, $lt: endDate } } },
//       { $group: { _id: { hour: { $hour: "$time" } }, avgTemperature: { $avg: "$temperature" }, avgHumidity: { $avg: "$humidity" } } },
//       { $sort: { "_id.hour": 1 } },
//     ]);

//     const formattedData = Array.from({ length: 24 }, (_, hour) => {
//       const item = data.find(d => d._id.hour === hour);
//       return item ? { hour, avgTemperature: item.avgTemperature, avgHumidity: item.avgHumidity } : { hour, avgTemperature: null, avgHumidity: null };
//     });

//     res.json(formattedData);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching average data", message: error.message});

//   }
// };

exports.getHourlyAverages = async (req, res) => {
  try {
    const { day } = req.params;

    // Convertimos a la fecha exacta en hora de Perú
    const startDate = new Date(`${day}T00:00:00-05:00`);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const data = await SensorData.aggregate([
      { $match: { time: { $gte: startDate, $lt: endDate } } },
      { 
        $group: { 
          _id: { hour: { $hour: { date: "$time", timezone: "America/Lima" } } },
          avgTemperature: { $avg: "$temperature" },
          avgHumidity: { $avg: "$humidity" }
        }
      },
      { $sort: { "_id.hour": 1 } }
    ]);

    // Aseguramos que el array tenga 24 elementos
    const formattedData = Array.from({ length: 24 }, (_, hour) => {
      const item = data.find(d => d._id.hour === hour);
      return item ? { hour, avgTemperature: item.avgTemperature, avgHumidity: item.avgHumidity } : { hour, avgTemperature: null, avgHumidity: null };
    });

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching average data", message: error.message });
  }
};
