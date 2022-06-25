const mqtt = require("mqtt");
const sqlite3 = require("sqlite3");
const { MQTT_URL, TOPICS } = require("./config");

const db = new sqlite3.Database("./iot.db", (err) => {
  if (err) {
    console.error("Erro opening database " + err.message);
  }
});

let lastTemp = 0;

const insertTemperature = (temperature) => {
  if (+lastTemp !== +temperature) {
    lastTemp = temperature;
  } else {
    return;
  }
  console.log("Inserting", temperature);
  let insert =
    "INSERT INTO temperatures (value, date_added)\
           VALUES (?, datetime('now','localtime'))";

  db.run(insert, [temperature], (err) => {
    if (err) {
      console.log("Error inserting temperature", err);
    }
  });
};

const client = mqtt.connect(MQTT_URL, {
  clientId: "listener",
  username: "backend",
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

client.on("connect", () => {
  console.log("Connected to ", MQTT_URL);
  client.subscribe(TOPICS.temperature, () => {
    console.log(`Subscribed to topic '${TOPICS.temperature}'`);
  });
});

client.on("message", (topic, payload) => {
  // console.log("Received Message:", topic, payload.toString());
  if (topic === "temperature") {
    insertTemperature(payload.toString());
  }
});
