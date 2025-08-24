import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { CONFIG } from '../config/config';
import WebSocketService from '../services/WebSocketService';
import DemoDataService from '../services/DemoDataService';

const ControlsScreen = () => {
  const [isDemoMode] = useState(CONFIG.DEMO_MODE);
  
  const sendCommand = (command) => {
    const service = isDemoMode ? DemoDataService : WebSocketService;
    service.send({ command, timestamp: Date.now() });
    Alert.alert('Command Sent', `${command} command sent to BantayBot`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BantayBot Controls</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Movement Controls</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => sendCommand('MOVE_ARMS')}
          >
            <Text style={styles.buttonText}>Move Arms</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => sendCommand('ROTATE_HEAD')}
          >
            <Text style={styles.buttonText}>Rotate Head</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => sendCommand('STOP_MOVEMENT')}
          >
            <Text style={styles.buttonText}>Stop Movement</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Controls</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={[styles.button, styles.alertButton]}
            onPress={() => sendCommand('SOUND_ALARM')}
          >
            <Text style={styles.buttonText}>Sound Alarm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.alertButton]}
            onPress={() => sendCommand('TEST_BUZZER')}
          >
            <Text style={styles.buttonText}>Test Buzzer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Controls</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={[styles.button, styles.systemButton]}
            onPress={() => sendCommand('RESET_SYSTEM')}
          >
            <Text style={styles.buttonText}>Reset System</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.systemButton]}
            onPress={() => sendCommand('CALIBRATE_SENSORS')}
          >
            <Text style={styles.buttonText}>Calibrate Sensors</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  alertButton: {
    backgroundColor: '#FF9800',
  },
  systemButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ControlsScreen;