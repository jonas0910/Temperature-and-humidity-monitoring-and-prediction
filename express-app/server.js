require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const sensorRoutes = require("./routes/sensorRoutes");
require("./config/mqttClient");

const app = express();
app.use(cors());

connectDB();


// Rutas
app.use("/api", sensorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
