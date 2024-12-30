# **Aplicación Web para Visualización y Predicción de Datos con IoT y Machine Learning**

Este proyecto combina IoT, aprendizaje automático y desarrollo web para monitorear y predecir datos de temperatura y humedad en tiempo real. Utiliza un sensor DHT11, una placa NodeMCU ESP8266, y un servidor MQTT para la adquisición de datos, junto con un modelo LSTM para predicción de series temporales.

---

## **Características Principales**
- **Monitoreo en tiempo real:** Adquisición de datos de temperatura y humedad utilizando el sensor **DHT11** y transmisión mediante el protocolo **MQTT**.
- **Predicción con Machine Learning:** Modelo de aprendizaje profundo **LSTM** (Long Short-Term Memory) para analizar y predecir tendencias en series temporales.
- **Interfaz web moderna:** Desarrollada con **React.js**, permite la visualización intuitiva de los datos actuales y proyectados.
- **Arquitectura robusta:**
  - Backend en **Node.js** con **Express**.
  - Base de datos no relacional **MongoDB** para almacenar datos históricos.
- **Despliegue en la nube:** Optimizado para funcionar en servidores locales o servicios en la nube.

---

## **Tecnologías Utilizadas**
### **Hardware**
- **Sensor DHT11:** Recolección de datos de temperatura y humedad.
- **NodeMCU ESP8266:** Conectividad Wi-Fi para transmisión de datos.

### **Software**
- **Frontend:**  
  - **React.js**: Framework para una interfaz de usuario moderna y dinámica.  
  - **Chart.js** o **D3.js** (opcional): Visualización de datos en gráficos interactivos.
  
- **Backend:**  
  - **Node.js** y **Express.js**: API REST para la gestión de datos y predicciones.  
  - **MongoDB**: Almacenamiento de datos históricos.  
  - **Mosquitto MQTT Broker:** Comunicación en tiempo real entre los dispositivos y el servidor.

- **Machine Learning:**  
  - **Python**: Entrenamiento del modelo LSTM.  
  - **TensorFlow/Keras**: Implementación del modelo de predicción.  

---

## **Arquitectura del Proyecto**
1. **Adquisición de Datos:**
   - El sensor DHT11 recolecta datos de temperatura y humedad.
   - La placa NodeMCU ESP8266 transmite los datos al servidor MQTT.

2. **Visualización en Tiempo Real:**
   - Los datos son publicados en el servidor MQTT y consumidos por el frontend en React.
   - Gráficos interactivos muestran las métricas actuales en tiempo real.

3. **Predicción de Datos:**
   - Los datos históricos almacenados en MongoDB son usados para entrenar un modelo LSTM.
   - Las predicciones se actualizan periódicamente y se muestran en la interfaz.

4. **Almacenamiento y API REST:**
   - Node.js y Express gestionan el flujo de datos hacia MongoDB y exponen una API para el frontend.
