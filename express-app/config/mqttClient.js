const mqtt = require("mqtt");
const SensorData = require("../models/SensorData");

const mqttClient = mqtt.connect(process.env.MQTT_BROKER);

mqttClient.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  mqttClient.subscribe(process.env.MQTT_TOPIC);
});

mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const sensorData = new SensorData(data);
    await sensorData.save();
    console.log("📩 Data saved:", data);
  } catch (error) {
    console.error("❌ Error saving data:", error);
  }
});

module.exports = mqttClient;
