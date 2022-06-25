
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// const char *ssid = "FARZIN";
// const char *password = "13492281";

const char *ssid = "Mohseni";
const char *password = "Mohseniisnothere!@#$";

const char *mqtt_server = "94.101.186.116";

WiFiClient esp8266device;
PubSubClient client(esp8266device);

int outputpin = 0;

int isManualMode = 0;
int isFanActive = 0;
int isActive = 1;
int timerLength = 0;
int clientConnected = 0;

void setup_wifi() {
    delay(10);
    // We start by connecting to a WiFi network
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
    }
    Serial.println("");
    Serial.print("WiFi connected - ESP IP address: ");
    Serial.println(WiFi.localIP());
}

void callback(String topic, byte *message, unsigned int length) {
    if (topic == "info") {
        Serial.print("Message arrived on topic: ");
        Serial.println(topic);

        String info[4] = {"", "", "", ""};
        int index = 0;

        for (int i = 1; i < length - 1; i++) {
            if ((char)message[i] == ',') {
                index++;
            } else {
                info[index] += (char)message[i];
            }
        }

        // [`${is_manual},${is_active},${is_fan_active},${timer_length}`]
        isManualMode = atoi(info[0].c_str());
        isActive = atoi(info[1].c_str());
        isFanActive = atoi(info[2].c_str());
        timerLength = atoi(info[3].c_str());
    }
}

void reconnect() {
    while (!client.connected()) {
        //  Serial.print("Attempting MQTT connection...");
        if (client.connect("myBoard")) {
            // Serial.println("connected");
            digitalWrite(D3, LOW);
            client.subscribe("info");
            client.publish("board", "");
        } else {
            digitalWrite(D3, HIGH);
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            //  Wait 5 seconds before retrying
            delay(5000);
        }
    }
}

void setup() {
    Serial.begin(9600);

    setup_wifi();
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
    pinMode(D2, OUTPUT);  // main
    pinMode(D3, OUTPUT);  // connection status
    pinMode(D4, OUTPUT);  // timer
    pinMode(D5, OUTPUT);  // fan
}

void loop() {
    if (!client.connected()) {
        reconnect();
    }
    if (!client.loop()) {
        client.connect("myBoard");
    }

    int rawvoltage = analogRead(outputpin);
    float temperature = (rawvoltage / 1024.0) * 3300 / 10;

    char str[32];
    dtostrf(temperature, 8, 1, str);
    client.publish("temperature", str);

    if (isActive) {
        digitalWrite(D2, LOW);
    } else {
        digitalWrite(D2, HIGH);
        digitalWrite(D5, HIGH);
        digitalWrite(D4, HIGH);

        return;
    }

    Serial.print("timer:");
    Serial.println(timerLength);

    // Serial.print("isFanActive:");
    // Serial.println(isFanActive);

    // Serial.print("temperature:");
    // Serial.println(temperature);

    if (isManualMode) {
        digitalWrite(D5, !isFanActive ? HIGH : LOW);
    } else {
        if (temperature > 40) {
            digitalWrite(D5, LOW);
        } else {
            digitalWrite(D5, HIGH);
        }
    }
    if (timerLength == -1) {
        digitalWrite(D4, HIGH);
    } else {
        if (timerLength > 0) {
            digitalWrite(D4, timerLength % 2 == 0 ? HIGH : LOW);
            timerLength--;
        } else {
            digitalWrite(D2, HIGH);
        }
    }
    delay(1000);
}
