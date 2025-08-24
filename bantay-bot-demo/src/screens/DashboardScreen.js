import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Animated,
  Dimensions,
  RefreshControl
} from 'react-native';
import { CONFIG } from '../config/config';
import WebSocketService from '../services/WebSocketService';
import DemoDataService from '../services/DemoDataService';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(CONFIG.DEMO_MODE);
  const [refreshing, setRefreshing] = useState(false);
  const [sensorData, setSensorData] = useState({
    motion: 0,
    distance: 50,
    temperature: 25.5,
    humidity: 65.0,
    soilMoisture: 450
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  useEffect(() => {
    const service = isDemoMode ? DemoDataService : WebSocketService;

    const handleConnection = (connected) => {
      setIsConnected(connected);
    };

    const handleData = (data) => {
      setSensorData(data);
      setLastUpdate(new Date());
    };

    const handleAlert = (alert) => {
      // Silent alert handling - no popup
      console.log('Alert:', alert);
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdate(new Date());
    }, 1000);
  }, []);

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  const getSoilMoistureData = (value) => {
    const val = value || 0;
    if (val < 300) return { status: 'Dry', color: '#FF6B6B', icon: '🏜️', level: (val / 300) * 100 };
    if (val < 700) return { status: 'Optimal', color: '#51CF66', icon: '🌱', level: ((val - 300) / 400) * 100 };
    return { status: 'Wet', color: '#339AF0', icon: '💧', level: 100 };
  };

  const getTemperatureColor = (temp) => {
    const temperature = temp || 0;
    if (temperature < 20) return '#2196F3';
    if (temperature < 30) return '#4CAF50';
    return '#F44336';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const soilData = getSoilMoistureData(sensorData.soilMoisture);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Modern Header with Gradient Background */}
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <View style={styles.brandContainer}>
                <View style={styles.logoIcon}>
                  <View style={styles.robotHead}>
                    <View style={[styles.robotEye, { left: 6 }]} />
                    <View style={[styles.robotEye, { right: 6 }]} />
                  </View>
                  <View style={styles.robotBody} />
                </View>
                <View style={styles.titleInfo}>
                  <Text style={styles.appTitle}>BantayBot</Text>
                  <Text style={styles.appSubtitle}>Smart Agricultural Guardian</Text>
                </View>
              </View>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, {
                  backgroundColor: isConnected ? '#10B981' : '#EF4444'
                }]}>
                  <View style={styles.statusPulse} />
                </View>
                <Text style={styles.statusText}>
                  {isConnected ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
            <Text style={styles.lastUpdateText}>
              Last sync: {lastUpdate ? formatTime(lastUpdate) : 'Never'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>

        {/* Sensor Overview Cards */}
        <View style={styles.sensorGrid}>
          {/* Motion Detection Card */}
          <View style={[styles.sensorCard, styles.motionCard, sensorData.motion && styles.motionAlert]}>
            <View style={styles.cardTop}>
              <View style={[styles.iconContainer, styles.motionIcon]}>
                <View style={[styles.motionDot, { 
                  backgroundColor: sensorData.motion ? '#EF4444' : '#10B981' 
                }]} />
              </View>
              <Text style={styles.cardLabel}>Motion</Text>
            </View>
            <View style={styles.cardBottom}>
              <Text style={[styles.cardStatus, {
                color: sensorData.motion ? '#EF4444' : '#10B981'
              }]}>
                {sensorData.motion ? 'Detected' : 'Clear'}
              </Text>
              <Text style={styles.cardType}>PIR Sensor</Text>
            </View>
          </View>

          {/* Distance Measurement Card */}
          <View style={[styles.sensorCard, styles.distanceCard]}>
            <View style={styles.cardTop}>
              <View style={[styles.iconContainer, styles.distanceIcon]}>
                <View style={styles.radarCircle} />
              </View>
              <Text style={styles.cardLabel}>Distance</Text>
            </View>
            <View style={styles.cardBottom}>
              <View style={styles.valueContainer}>
                <Text style={styles.cardValue}>{sensorData.distance || 0}</Text>
                <Text style={styles.cardUnit}>cm</Text>
              </View>
              <Text style={styles.cardType}>Ultrasonic</Text>
            </View>
          </View>

          {/* Temperature Card */}
          <View style={[styles.sensorCard, styles.temperatureCard]}>
            <View style={styles.cardTop}>
              <View style={[styles.iconContainer, styles.tempIcon]}>
                <View style={styles.tempCircle} />
              </View>
              <Text style={styles.cardLabel}>Temperature</Text>
            </View>
            <View style={styles.cardBottom}>
              <View style={styles.valueContainer}>
                <Text style={styles.cardValue}>
                  {sensorData.temperature ? sensorData.temperature.toFixed(1) : '0.0'}
                </Text>
                <Text style={styles.cardUnit}>°C</Text>
              </View>
              <Text style={styles.cardType}>DHT11</Text>
            </View>
          </View>

          {/* Humidity Card */}
          <View style={[styles.sensorCard, styles.humidityCard]}>
            <View style={styles.cardTop}>
              <View style={[styles.iconContainer, styles.humidityIcon]}>
                <View style={styles.dropCircle} />
              </View>
              <Text style={styles.cardLabel}>Humidity</Text>
            </View>
            <View style={styles.cardBottom}>
              <View style={styles.valueContainer}>
                <Text style={styles.cardValue}>
                  {sensorData.humidity ? sensorData.humidity.toFixed(1) : '0.0'}
                </Text>
                <Text style={styles.cardUnit}>%</Text>
              </View>
              <Text style={styles.cardType}>Air Moisture</Text>
            </View>
          </View>
        </View>


        {/* Soil Moisture - Landscape Layout */}
        <View style={styles.soilCard}>
          <View style={styles.soilHeader}>
            <View style={styles.soilIconContainer}>
              <View style={[styles.soilCircle, {
                backgroundColor: (sensorData.soilMoisture || 0) < 300 ? '#F59E0B' : 
                                (sensorData.soilMoisture || 0) < 700 ? '#10B981' : '#3B82F6'
              }]} />
            </View>
            <View style={styles.soilInfo}>
              <Text style={styles.soilTitle}>Soil Moisture</Text>
              <Text style={styles.soilSubtitle}>Agricultural Sensor</Text>
            </View>
            <View style={styles.soilStatusContainer}>
              <Text style={[styles.soilBadge, {
                backgroundColor: (sensorData.soilMoisture || 0) < 300 ? '#F59E0B' : 
                                (sensorData.soilMoisture || 0) < 700 ? '#10B981' : '#3B82F6'
              }]}>
                {(sensorData.soilMoisture || 0) < 300 ? 'DRY' : 
                 (sensorData.soilMoisture || 0) < 700 ? 'OPTIMAL' : 'WET'}
              </Text>
            </View>
          </View>
          <View style={styles.soilMetrics}>
            <View style={styles.soilValueSection}>
              <Text style={styles.soilValue}>{sensorData.soilMoisture || 0}</Text>
              <Text style={styles.soilUnit}>units</Text>
            </View>
            <View style={styles.soilProgressSection}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {
                  width: `${Math.min((sensorData.soilMoisture || 0) / 1023 * 100, 100)}%`,
                  backgroundColor: (sensorData.soilMoisture || 0) < 300 ? '#F59E0B' : 
                                   (sensorData.soilMoisture || 0) < 700 ? '#10B981' : '#3B82F6'
                }]} />
              </View>
              <Text style={styles.rangeText}>Range: 0-1023</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 10,
  },
  headerGradient: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerContent: {
    paddingTop: 10,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotHead: {
    width: 20,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginBottom: 4,
    position: 'relative',
  },
  robotBody: {
    width: 16,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    opacity: 0.9,
  },
  robotEye: {
    width: 3,
    height: 3,
    backgroundColor: '#667EEA',
    borderRadius: 2,
    position: 'absolute',
    top: 5,
  },
  titleInfo: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusPulse: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  lastUpdateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  demoBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  demoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  demoText: {
    fontSize: 14,
    color: '#A16207',
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  sensorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    width: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    minHeight: 110,
  },
  motionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  motionAlert: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  distanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  temperatureCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  humidityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
  },
  cardTop: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBottom: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  motionIcon: {
    backgroundColor: '#F0FDF4',
  },
  motionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  distanceIcon: {
    backgroundColor: '#EFF6FF',
  },
  radarCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  tempIcon: {
    backgroundColor: '#FFFBEB',
  },
  tempCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
  },
  humidityIcon: {
    backgroundColor: '#F0F9FF',
  },
  dropCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#06B6D4',
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginRight: 4,
  },
  cardUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  cardType: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  soilCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  soilHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  soilIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F0FDF4',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  soilCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  soilInfo: {
    flex: 1,
    marginRight: 12,
  },
  soilTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  soilSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  soilStatusContainer: {
    alignItems: 'flex-end',
  },
  soilBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textTransform: 'uppercase',
    minWidth: 50,
  },
  soilMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soilValueSection: {
    alignItems: 'center',
    minWidth: 80,
  },
  soilValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  soilUnit: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  soilProgressSection: {
    flex: 1,
    marginLeft: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  rangeText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DashboardScreen;