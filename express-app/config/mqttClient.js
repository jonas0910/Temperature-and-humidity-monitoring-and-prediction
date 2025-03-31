const mqtt = require("mqtt");
const { supabaseClient } = require("./supabase");

const mqttUsername = process.env.MQTT_USERNAME;
const mqttPassword = process.env.MQTT_PASSWORD;

const options = {
  username: mqttUsername,  // Si es necesario
  password: mqttPassword,
  reconnectPeriod: 5000,  // Reintentar cada 5s en caso de fallo
};

const mqttClient = mqtt.connect(process.env.MQTT_BROKER, options);
mqttClient.on("error", (error) => {
  console.error("❌ MQTT connection error:", error.message);
});
mqttClient.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  mqttClient.subscribe(process.env.MQTT_TOPIC);
});

mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // Insertar en Supabase
    const { error } = await supabaseClient.from("sensor_data").insert([
      {
        temperature: data.temperature,
        humidity: data.humidity,
        time: new Date().toISOString(), // Guardamos en formato UTC
      },
    ]);

    if (error) throw error;
    console.log("📩 Data saved to Supabase:", data);
  } catch (error) {
    console.error("❌ Error saving data to Supabase:", error.message);
  }
});

module.exports = mqttClient;
