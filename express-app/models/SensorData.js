const mongoose = require("mongoose");

const sensorDataSchema = new mongoose.Schema(
  {
    temperature: Number,
    humidity: Number,
    time: { type: Date, default: Date.now },
  },
  { collection: "data_temp_hum" }
);

module.exports = mongoose.model("SensorData", sensorDataSchema);
