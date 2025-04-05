require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const connectDB = require("./config/database");
const sensorRoutes = require("./routes/sensorRoutes");
require("./config/mqttClient");

const app = express();
app.use(cors({
    origin: ["http://localhost:3000", "https://tu-frontend.vercel.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    
    next();
});

// Rutas
app.use("/api", sensorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
