const mqtt = require("mqtt");

const sqlite3 = require("sqlite3");
const express = require("express");
var cors = require("cors");

let lastSyncedInfo = null;

const { HTTP_PORT, MQTT_URL, TOPICS } = require("./config");

var app = express();

app.use(express.json());
app.use(cors());
app.listen(HTTP_PORT, () => {
  console.log("Server is listening on port " + HTTP_PORT);
});

const client = mqtt.connect(MQTT_URL, {
  clientId: "test",
  username: "backend",
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

const serializeInfo = ({
  is_manual,
  is_active,
  is_fan_active,
  timer_length,
}) => {
  return JSON.stringify(
    `${is_manual},${is_active},${is_fan_active},${timer_length}`
  );
};

client.on("connect", () => {
  console.log("Connected to ", MQTT_URL);
  client.subscribe(TOPICS.board, () => {
    console.log(`Subscribed to topic '${TOPICS.board}'`);
  });
});

client.on("message", (topic) => {
  console.log("got a message from", topic);
  console.log("lastinfo", lastSyncedInfo);
  if (topic === "board" && lastSyncedInfo) {
    client.publish("info", serializeInfo(lastSyncedInfo), {
      qos: 1,
    });
  }
});

const db = new sqlite3.Database("./iot.db", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  }
  console.log("Database opened");
});

const insertIntoInfo = ({
  is_manual,
  timer_updated,
  timer_length,
  is_active,
  is_fan_active,
  updateTimer = false,
}) => {
  return new Promise((resolve, reject) => {
    console.log("insert", updateTimer);

    let insert =
      "INSERT INTO info \
            (is_manual, is_active, is_fan_active, timer_updated, timer_length, updated_at)\
            VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))";

    if (updateTimer) {
      insert =
        "INSERT INTO info \
            (is_manual, is_active, is_fan_active, timer_updated, timer_length, updated_at)\
            VALUES (?, ?, ?, datetime('now','localtime'), ?, datetime('now','localtime'))";

      db.run(
        insert,
        [is_manual, is_active, is_fan_active, timer_length],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          db.all(
            "SELECT * FROM info ORDER BY updated_at DESC LIMIT 1",
            [],
            (err, rows) => {
              if (err) {
                reject(err);
                return;
              }

              console.log(rows);

              resolve(rows[0]);
            }
          );
        }
      );
    } else {
      db.run(
        insert,
        [is_manual, is_active, is_fan_active, timer_updated, timer_length],
        (err) => {
          if (err) {
            reject(err);
            return;
          }

          db.all(
            "SELECT * FROM info ORDER BY updated_at DESC",
            [],
            (err, rows) => {
              if (err) {
                reject(err);
                return;
              }

              resolve(rows[0]);
            }
          );
        }
      );
    }
  });
};

app.get("/info", async (req, res) => {
  await db.all(
    "SELECT * FROM info ORDER BY updated_at DESC LIMIT 1",
    [],
    (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      const info = rows[0];

      console.log("get", info);

      let remainingTime = info.timer_length;

      if (+info.timer_length !== -1) {
        remainingTime = Math.floor(
          (+Date.parse(info.timer_updated) +
            +info.timer_length * 1000 -
            +Date.now()) /
            1000
        );

        if (remainingTime < -1) {
          info.timer_length = 0;
        } else {
          info.timer_length = remainingTime;
        }
      }

      // info.timer_length = (Date.parse(info.timer_updated) - Date.now()) / 1000;

      res.status(200).json(info);
    }
  );
});

app.post("/info", async (req, res) => {
  let is_manual = req.body.is_manual;
  let timer_length = req.body.timer_length;
  let is_active = req.body.is_active;
  let is_fan_active = req.body.is_fan_active;
  let lastInfo = {};

  await db.all(
    "SELECT * FROM info ORDER BY updated_at DESC",
    [],
    (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      lastInfo = rows[0];
      const newInfo = { ...lastInfo };

      if (is_manual != undefined) {
        newInfo.is_manual = is_manual;
      }

      if (timer_length != undefined) {
        console.log("adding");
        newInfo.timer_length = timer_length;
        newInfo.updateTimer = true;
      }

      if (is_active != undefined) {
        newInfo.is_active = is_active;
      }

      if (is_fan_active != undefined) {
        newInfo.is_fan_active = is_fan_active;
      }

      insertIntoInfo(newInfo).then((info) => {
        let remainingTime = info.timer_length;

        const temp = { ...info };

        if (info.timer_length !== -1) {
          remainingTime = Math.floor(
            (+Date.parse(info.timer_updated) +
              +info.timer_length * 1000 -
              +Date.now()) /
              1000
          );

          if (timer_length == undefined) {
            if (remainingTime < 0) {
              temp.timer_length = 0;
            } else {
              temp.timer_length = remainingTime;
            }
          } else {
            temp.timer_length = timer_length;
          }
        } else {
          temp.timer_length = info.timer_length;
        }

        client.publish("info", serializeInfo(temp), {
          qos: 1,
        });
        lastSyncedInfo = { ...temp };
        res.status(200).json(temp);
      });
    }
  );
});

app.get("/temperatures", async (req, res) => {
  await db.all(
    "SELECT id, value , datetime(date_added, '+4 hours','+30 minutes') as date_added FROM temperatures ORDER BY date_added DESC LIMIT 30",
    [],
    (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      res.status(200).json(rows);
    }
  );
});
