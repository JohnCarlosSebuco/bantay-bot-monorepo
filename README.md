# BantayBot Mobile App & Arduino Integration

A React Native mobile app for monitoring and controlling the BantayBot solar-powered automated scarecrow system with integrated sensors.

## Project Structure

```
bantay-bot3/
├── bantay-bot/          # Main app with real Arduino connection
├── bantay-bot-demo/     # Demo version with simulated data
└── arduino/             # Arduino ESP32 code
    ├── BantayBot_WebSocket.ino
    └── LIBRARIES_REQUIRED.md
```

## Features

### Mobile App Features
- **Real-time Sensor Monitoring**
  - Motion detection status
  - Distance measurement (ultrasonic sensor)
  - Temperature & humidity readings
  - Soil moisture levels
  
- **Remote Control**
  - Move servo arms
  - Rotate head
  - Sound alarm/buzzer
  - System reset
  - Sensor calibration

- **Settings**
  - Configure ESP32 IP address
  - Adjust WebSocket port
  - Set update intervals

### Arduino Features
- WebSocket server for real-time communication
- HTTP server for status checking
- Automatic motion detection and response
- Servo control for arms and head movement
- Sensor data broadcasting
- Command processing from mobile app

## Setup Instructions

### 1. Arduino Setup

#### Hardware Requirements
- ESP32 Development Board
- Adafruit PWM Servo Driver
- DHT11 Temperature/Humidity Sensor
- HC-SR04 Ultrasonic Sensor
- PIR Motion Sensor
- Soil Moisture Sensor
- Buzzer
- 3 Servo Motors

#### Wiring Connections
```
ESP32 Pin    ->  Component
GPIO 18      ->  Ultrasonic TRIG
GPIO 19      ->  Ultrasonic ECHO
GPIO 14      ->  PIR Sensor
GPIO 13      ->  Buzzer
GPIO 34      ->  Soil Moisture (Analog)
GPIO 23      ->  DHT11 Data
I2C (21,22)  ->  PWM Servo Driver
```

#### Software Setup
1. Install Arduino IDE
2. Install required libraries (see arduino/LIBRARIES_REQUIRED.md)
3. Open `BantayBot_WebSocket.ino`
4. Update WiFi credentials:
   ```cpp
   const char* ssid = "Your_WiFi_Name";
   const char* password = "Your_WiFi_Password";
   ```
5. Upload to ESP32
6. Open Serial Monitor (115200 baud) to see IP address

### 2. Mobile App Setup

#### Prerequisites
- Node.js (v14 or higher)
- Expo Go app on mobile device
- Mobile device and computer on same WiFi network

#### Installation

**For Real Arduino Connection (bantay-bot):**
```bash
cd bantay-bot3/bantay-bot
npm install
npx expo start
```

**For Demo Mode (bantay-bot-demo):**
```bash
cd bantay-bot3/bantay-bot-demo
npm install
npx expo start
```

#### Configuration
1. Note the ESP32's IP address from Serial Monitor
2. Open the app on Expo Go
3. Go to Settings tab
4. Enter ESP32 IP address (e.g., 192.168.1.100)
5. Save settings

## How to Connect Arduino to Mobile App

### Step 1: Power Up Arduino
1. Connect ESP32 to power
2. Wait for WiFi connection (check Serial Monitor)
3. Note the displayed IP address

### Step 2: Configure Mobile App
1. Launch the app on your phone via Expo Go
2. Navigate to Settings tab
3. Enter the ESP32's IP address
4. Keep WebSocket port as 81
5. Save settings

### Step 3: Test Connection
1. Go back to Dashboard tab
2. Toggle Demo Mode OFF (if using bantay-bot version)
3. Connection status should show "Connected"
4. Sensor data should start updating

### Step 4: Test Controls
1. Navigate to Controls tab
2. Try "Test Buzzer" - you should hear a beep
3. Try "Move Arms" - servos should move
4. Check Dashboard for real-time sensor updates

## Troubleshooting

### App won't connect to Arduino
- Ensure both devices are on same WiFi network
- Check ESP32 IP address is correct
- Verify WebSocket port is 81
- Try accessing http://[ESP32_IP]:80 in browser
- Check Serial Monitor for connection attempts

### Expo Go issues
- Clear Expo cache: `npx expo start --clear`
- Ensure Expo Go version is compatible (2.33.21)
- Try tunnel mode: `npx expo start --tunnel`

### Permission errors on Windows
```cmd
# Run as Administrator
cd E:\bantay-bot3\bantay-bot
clean.bat
npm install
```

### Sensor readings are incorrect
- Check wiring connections
- Verify sensor power supply (3.3V or 5V)
- Calibrate sensors via Controls tab
- Check Serial Monitor for error messages

## API Documentation

### WebSocket Messages

**From Arduino to App:**
```json
{
  "motion": 0,
  "distance": 45,
  "temperature": 25.5,
  "humidity": 60.2,
  "soilMoisture": 512,
  "timestamp": 123456
}
```

**From App to Arduino:**
```json
{
  "command": "MOVE_ARMS",
  "timestamp": 1234567890
}
```

### Available Commands
- `MOVE_ARMS` - Perform arm movement sequence
- `ROTATE_HEAD` - Rotate head servo
- `STOP_MOVEMENT` - Stop all servo movements
- `SOUND_ALARM` - Trigger buzzer alarm
- `TEST_BUZZER` - Quick buzzer test
- `RESET_SYSTEM` - Restart ESP32
- `CALIBRATE_SENSORS` - Calibrate sensor readings

### HTTP Endpoints
- `GET http://[ESP32_IP]:80/` - Server status
- `GET http://[ESP32_IP]:80/status` - Current sensor data (JSON)

## Development Notes

### Switching Between Demo and Real Mode
- **bantay-bot**: Has toggle switch for demo/real mode
- **bantay-bot-demo**: Always runs in demo mode (no Arduino needed)

### Modifying Sensor Thresholds
Edit `src/config/config.js`:
```javascript
export const SENSOR_THRESHOLDS = {
  MOTION_ALERT_DISTANCE: 20,  // cm
  SOIL_MOISTURE_LOW: 300,
  SOIL_MOISTURE_HIGH: 700,
  TEMP_HIGH: 35,  // Celsius
  TEMP_LOW: 10,
  HUMIDITY_HIGH: 80,  // Percentage
  HUMIDITY_LOW: 30
};
```

## Project Team
- Danseco, Prince Vincent
- Folloso, John Alexis B.
- Poblete, Jules M.
- Sebuco, John Carlos G.
- Seguerra, Errol A.

## License
This project is part of the Capstone Project for Bachelor of Science in Information Technology at Polytechnic University of the Philippines, Lopez, Quezon.