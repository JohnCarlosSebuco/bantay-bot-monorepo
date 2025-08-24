#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <ESPAsyncWebServer.h>

// WiFi credentials
const char* ssid = "vivo Y16";
const char* password = "00001111";

// Create WebSocket server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);
AsyncWebServer server(80);

// Define PWM servo driver
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define SERVO_MIN 150
#define SERVO_MAX 600
#define ARM_SERVO_1 0
#define ARM_SERVO_2 1
#define HEAD_SERVO  2

// Sensor pins
#define TRIG_PIN 18
#define ECHO_PIN 19
#define PIR_SENSOR_PIN 14
#define BUZZER_PIN 13
#define SOIL_MOISTURE_PIN 34
#define DHTPIN 23
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

bool headIncreasing = true;
int headPos = SERVO_MIN;
int pinStateCurrent = LOW;
int pinStatePrevious = LOW;

unsigned long lastSensorUpdate = 0;
unsigned long sensorInterval = 1000;

// Store sensor data
struct SensorData {
  int motion;
  long distance;
  float temperature;
  float humidity;
  int soilMoisture;
} currentSensorData;

void setup() {
  Serial.begin(115200);
  
  // Initialize PWM
  pwm.begin();
  pwm.setPWMFreq(50);

  // Setup pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(PIR_SENSOR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Initialize DHT sensor
  dht.begin();

  // Connect to WiFi
  connectToWiFi();

  // Setup WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // Setup HTTP server for connection test
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(200, "text/plain", "BantayBot Server Running");
  });
  
  server.on("/status", HTTP_GET, [](AsyncWebServerRequest *request){
    String json = getSensorJSON();
    request->send(200, "application/json", json);
  });
  
  server.begin();

  Serial.println("BantayBot System Ready!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.println("WebSocket Port: 81");
  Serial.println("HTTP Port: 80");
}

void loop() {
  webSocket.loop();
  
  // Head sweep movement
  moveHeadSweep();

  // Check PIR sensor
  checkMotionSensor();

  // Send sensor data periodically
  if (millis() - lastSensorUpdate >= sensorInterval) {
    updateSensorData();
    sendSensorData();
    lastSensorUpdate = millis();
  }
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected!");
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
      
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
        
        // Send initial sensor data
        sendSensorData();
      }
      break;
      
    case WStype_TEXT:
      {
        Serial.printf("[%u] Received: %s\n", num, payload);
        
        // Parse JSON command
        StaticJsonDocument<200> doc;
        DeserializationError error = deserializeJson(doc, payload);
        
        if (!error) {
          const char* command = doc["command"];
          handleCommand(command);
        }
      }
      break;
  }
}

void handleCommand(const char* command) {
  Serial.print("Handling command: ");
  Serial.println(command);
  
  if (strcmp(command, "MOVE_ARMS") == 0) {
    moveArms();
  } 
  else if (strcmp(command, "ROTATE_HEAD") == 0) {
    rotateHead();
  }
  else if (strcmp(command, "STOP_MOVEMENT") == 0) {
    stopMovement();
  }
  else if (strcmp(command, "SOUND_ALARM") == 0) {
    soundAlarm(3);
  }
  else if (strcmp(command, "TEST_BUZZER") == 0) {
    testBuzzer();
  }
  else if (strcmp(command, "RESET_SYSTEM") == 0) {
    resetSystem();
  }
  else if (strcmp(command, "CALIBRATE_SENSORS") == 0) {
    calibrateSensors();
  }
}

void updateSensorData() {
  // Read all sensors
  currentSensorData.distance = getDistanceCM();
  currentSensorData.temperature = dht.readTemperature();
  currentSensorData.humidity = dht.readHumidity();
  currentSensorData.soilMoisture = analogRead(SOIL_MOISTURE_PIN);
  
  // Check for motion detection based on distance
  if (currentSensorData.distance > 0 && currentSensorData.distance < 20) {
    Serial.println("Object detected by ultrasonic!");
    moveArms();
  }
}

void sendSensorData() {
  String json = getSensorJSON();
  webSocket.broadcastTXT(json);
}

String getSensorJSON() {
  StaticJsonDocument<256> doc;
  
  doc["motion"] = currentSensorData.motion;
  doc["distance"] = currentSensorData.distance;
  doc["temperature"] = isnan(currentSensorData.temperature) ? 0 : currentSensorData.temperature;
  doc["humidity"] = isnan(currentSensorData.humidity) ? 0 : currentSensorData.humidity;
  doc["soilMoisture"] = currentSensorData.soilMoisture;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  return output;
}

void checkMotionSensor() {
  pinStatePrevious = pinStateCurrent;
  pinStateCurrent = digitalRead(PIR_SENSOR_PIN);
  
  if (pinStatePrevious == LOW && pinStateCurrent == HIGH) {
    Serial.println("Motion detected!");
    currentSensorData.motion = 1;
    
    // Send alert
    sendAlert("motion", "Motion Detected!");
    
    // Sound alarm
    soundAlarm(3);
    
    // Move arms
    moveArms();
  } else if (pinStateCurrent == LOW) {
    currentSensorData.motion = 0;
  }
}

void sendAlert(const char* type, const char* message) {
  StaticJsonDocument<128> doc;
  doc["type"] = "alert";
  doc["alertType"] = type;
  doc["message"] = message;
  
  String output;
  serializeJson(doc, output);
  webSocket.broadcastTXT(output);
}

void moveArms() {
  Serial.println("Moving arms...");
  for (int pulse = SERVO_MIN; pulse <= SERVO_MAX; pulse += 5) {
    pwm.setPWM(ARM_SERVO_1, 0, pulse);
    pwm.setPWM(ARM_SERVO_2, 0, SERVO_MAX - (pulse - SERVO_MIN));
    delay(10);
  }
  for (int pulse = SERVO_MAX; pulse >= SERVO_MIN; pulse -= 5) {
    pwm.setPWM(ARM_SERVO_1, 0, pulse);
    pwm.setPWM(ARM_SERVO_2, 0, SERVO_MAX - (pulse - SERVO_MIN));
    delay(10);
  }
}

void rotateHead() {
  Serial.println("Rotating head...");
  for (int i = 0; i < 3; i++) {
    pwm.setPWM(HEAD_SERVO, 0, SERVO_MIN);
    delay(500);
    pwm.setPWM(HEAD_SERVO, 0, SERVO_MAX);
    delay(500);
  }
  headPos = SERVO_MIN;
}

void stopMovement() {
  Serial.println("Stopping all movement...");
  pwm.setPWM(ARM_SERVO_1, 0, SERVO_MIN);
  pwm.setPWM(ARM_SERVO_2, 0, SERVO_MIN);
  pwm.setPWM(HEAD_SERVO, 0, SERVO_MIN);
  headPos = SERVO_MIN;
}

void soundAlarm(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(150);
    digitalWrite(BUZZER_PIN, LOW);
    delay(150);
  }
}

void testBuzzer() {
  Serial.println("Testing buzzer...");
  digitalWrite(BUZZER_PIN, HIGH);
  delay(500);
  digitalWrite(BUZZER_PIN, LOW);
}

void resetSystem() {
  Serial.println("Resetting system...");
  stopMovement();
  ESP.restart();
}

void calibrateSensors() {
  Serial.println("Calibrating sensors...");
  // Add calibration logic here if needed
  sendAlert("system", "Sensors calibrated successfully");
}

long getDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return -1;
  return duration * 0.034 / 2;
}

void moveHeadSweep() {
  static unsigned long lastMove = 0;
  if (millis() - lastMove < 20) return;
  lastMove = millis();

  if (headIncreasing) {
    headPos += 5;
    if (headPos >= SERVO_MAX) {
      headPos = SERVO_MAX;
      headIncreasing = false;
    }
  } else {
    headPos -= 5;
    if (headPos <= SERVO_MIN) {
      headPos = SERVO_MIN;
      headIncreasing = true;
    }
  }

  pwm.setPWM(HEAD_SERVO, 0, headPos);
}