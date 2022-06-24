const MQTT_PORT = "1883";
const MQTT_HOST = "94.101.186.116";
const MQTT_URL = `mqtt://${MQTT_HOST}:${MQTT_PORT}`;
const HTTP_PORT = 8000;
const TOPICS = {
  temperature: "temperature",
  board: "board",
};

module.exports = {
  MQTT_PORT,
  MQTT_HOST,
  MQTT_URL,
  HTTP_PORT,
  TOPICS,
};
