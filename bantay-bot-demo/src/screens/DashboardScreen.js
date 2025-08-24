import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { CONFIG } from '../config/config';
import WebSocketService from '../services/WebSocketService';
import DemoDataService from '../services/DemoDataService';

const DashboardScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(CONFIG.DEMO_MODE);
  const [sensorData, setSensorData] = useState({
    motion: 0,
    distance: 0,
    temperature: 0,
    humidity: 0,
    soilMoisture: 0
  });

  useEffect(() => {
    const service = isDemoMode ? DemoDataService : WebSocketService;

    const handleConnection = (connected) => {
      setIsConnected(connected);
    };

    const handleData = (data) => {
      setSensorData(data);
    };

    const handleAlert = (alert) => {
      Alert.alert(alert.type, alert.message);
    };

    service.on('connected', handleConnection);
    service.on('data', handleData);
    service.on('alert', handleAlert);

    if (isDemoMode) {
      DemoDataService.start();
    } else {
      WebSocketService.connect();
    }

    return () => {
      service.off('connected', handleConnection);
      service.off('data', handleData);
      service.off('alert', handleAlert);
      
      if (isDemoMode) {
        DemoDataService.stop();
      } else {
        WebSocketService.disconnect();
      }
    };
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  const getSoilMoistureStatus = (value) => {
    if (value < 300) return { status: 'Dry', color: '#FF6B6B' };
    if (value < 700) return { status: 'Optimal', color: '#51CF66' };
    return { status: 'Wet', color: '#339AF0' };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BantayBot Monitor</Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#51CF66' : '#FF6B6B' }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      <View style={styles.modeToggle}>
        <Text style={styles.modeText}>Demo Mode</Text>
        <Switch
          value={isDemoMode}
          onValueChange={toggleDemoMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDemoMode ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      <View style={styles.sensorGrid}>
        <View style={styles.sensorCard}>
          <Text style={styles.sensorLabel}>Motion</Text>
          <Text style={[styles.sensorValue, { color: sensorData.motion ? '#FF6B6B' : '#51CF66' }]}>
            {sensorData.motion ? 'DETECTED' : 'Clear'}
          </Text>
        </View>

        <View style={styles.sensorCard}>
          <Text style={styles.sensorLabel}>Distance</Text>
          <Text style={styles.sensorValue}>{sensorData.distance} cm</Text>
        </View>

        <View style={styles.sensorCard}>
          <Text style={styles.sensorLabel}>Temperature</Text>
          <Text style={styles.sensorValue}>{sensorData.temperature?.toFixed(1)}°C</Text>
        </View>

        <View style={styles.sensorCard}>
          <Text style={styles.sensorLabel}>Humidity</Text>
          <Text style={styles.sensorValue}>{sensorData.humidity?.toFixed(1)}%</Text>
        </View>

        <View style={[styles.sensorCard, styles.fullWidth]}>
          <Text style={styles.sensorLabel}>Soil Moisture</Text>
          <Text style={[styles.sensorValue, { color: getSoilMoistureStatus(sensorData.soilMoisture).color }]}>
            {sensorData.soilMoisture} - {getSoilMoistureStatus(sensorData.soilMoisture).status}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },
  modeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  sensorCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    margin: '1%',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fullWidth: {
    width: '98%',
  },
  sensorLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default DashboardScreen;