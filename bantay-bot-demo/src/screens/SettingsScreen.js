import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { CONFIG } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [esp32IP, setEsp32IP] = useState(CONFIG.ESP32_IP);
  const [wsPort, setWsPort] = useState(CONFIG.WEBSOCKET_PORT.toString());
  const [updateInterval, setUpdateInterval] = useState(CONFIG.UPDATE_INTERVAL.toString());

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('esp32_ip', esp32IP);
      await AsyncStorage.setItem('ws_port', wsPort);
      await AsyncStorage.setItem('update_interval', updateInterval);
      
      CONFIG.ESP32_IP = esp32IP;
      CONFIG.WEBSOCKET_PORT = parseInt(wsPort);
      CONFIG.UPDATE_INTERVAL = parseInt(updateInterval);
      
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Settings</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>ESP32 IP Address</Text>
          <TextInput
            style={styles.input}
            value={esp32IP}
            onChangeText={setEsp32IP}
            placeholder="192.168.1.100"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>WebSocket Port</Text>
          <TextInput
            style={styles.input}
            value={wsPort}
            onChangeText={setWsPort}
            placeholder="81"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Update Interval (ms)</Text>
          <TextInput
            style={styles.input}
            value={updateInterval}
            onChangeText={setUpdateInterval}
            placeholder="1000"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>BantayBot Mobile App</Text>
          <Text style={styles.aboutSubtext}>Version 1.0.0</Text>
          <Text style={styles.aboutDescription}>
            A solar-powered automated scarecrow with integrated sensors and mobile monitoring for crop protection.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  aboutCard: {
    padding: 10,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  aboutSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SettingsScreen;