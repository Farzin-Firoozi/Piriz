const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("./iot.db", (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    db.run(
      "CREATE TABLE temperatures( \
              id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
              value REAL NOT NULL,\
              date_added TEXT NOT NULL\
          )",
      (err) => {
        if (err) {
          console.log("Table already exists.", err);
        }
      }
    );
    db.run(
      "CREATE TABLE info( \
                is_manual INTEGER NOT NULL,\
                is_active INTEGER NOT NULL,\
                is_fan_active INTEGER NOT NULL,\
                timer_updated TEXT NOT NULL,\
                timer_length TEXT NOT NULL,\
                updated_at TEXT NOT NULL\
            )",
      (err) => {
        if (err) {
          console.log("Table already exists.", err);
        }
        let insert =
          "INSERT INTO info\
           (is_manual, is_active, is_fan_active, timer_updated, timer_length, updated_at)\
           VALUES (?, ?, ?, datetime('now','localtime'),? , datetime('now','localtime') )";

        db.run(insert, [0, 1, 0, 0]);
      }
    );
  }
});
