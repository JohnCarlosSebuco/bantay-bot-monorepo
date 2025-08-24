# Required Arduino Libraries for BantayBot

Install these libraries in Arduino IDE via Library Manager (Sketch -> Include Library -> Manage Libraries):

## Required Libraries:

1. **Adafruit PWM Servo Driver Library** by Adafruit
   - For controlling servos via PWM

2. **DHT sensor library** by Adafruit
   - For DHT11 temperature and humidity sensor

3. **Adafruit Unified Sensor** by Adafruit
   - Required dependency for DHT library

4. **WebSockets** by Markus Sattler
   - Version 2.3.0 or higher
   - For WebSocket server functionality

5. **ArduinoJson** by Benoit Blanchon
   - Version 6.x or higher
   - For JSON parsing and creation

6. **ESPAsyncWebServer** by Me-No-Dev
   - For HTTP server functionality
   - Install from: https://github.com/me-no-dev/ESPAsyncWebServer
   
7. **AsyncTCP** by Me-No-Dev (ESP32 dependency)
   - Required for ESPAsyncWebServer
   - Install from: https://github.com/me-no-dev/AsyncTCP

## Installation Steps:

### For libraries available in Library Manager:
1. Open Arduino IDE
2. Go to Sketch -> Include Library -> Manage Libraries
3. Search for each library name
4. Click Install

### For ESPAsyncWebServer and AsyncTCP:
1. Download ZIP files from GitHub links above
2. In Arduino IDE: Sketch -> Include Library -> Add .ZIP Library
3. Select the downloaded ZIP files

## Board Configuration:
- Board: ESP32 Dev Module
- Upload Speed: 115200
- CPU Frequency: 240MHz (WiFi/BT)
- Flash Frequency: 80MHz
- Flash Mode: QIO
- Flash Size: 4MB (32Mb)
- Partition Scheme: Default 4MB with spiffs

## Important Notes:
- Make sure ESP32 board package is installed (Tools -> Board -> Boards Manager -> Search "ESP32")
- Update WiFi credentials in the code before uploading
- After upload, open Serial Monitor at 115200 baud to see the ESP32's IP address