import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CONFIG } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SettingsScreen = () => {
  const [esp32IP, setEsp32IP] = useState(CONFIG.ESP32_IP);
  const [wsPort, setWsPort] = useState(CONFIG.WEBSOCKET_PORT.toString());
  const [updateInterval, setUpdateInterval] = useState(CONFIG.UPDATE_INTERVAL.toString());
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not tested');
  
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadSettings();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadSettings = async () => {
    try {
      const savedIP = await AsyncStorage.getItem('esp32_ip');
      const savedPort = await AsyncStorage.getItem('ws_port');
      const savedInterval = await AsyncStorage.getItem('update_interval');
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedDarkMode = await AsyncStorage.getItem('dark_mode');
      const savedAutoReconnect = await AsyncStorage.getItem('auto_reconnect');

      if (savedIP) setEsp32IP(savedIP);
      if (savedPort) setWsPort(savedPort);
      if (savedInterval) setUpdateInterval(savedInterval);
      if (savedNotifications !== null) setNotifications(JSON.parse(savedNotifications));
      if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
      if (savedAutoReconnect !== null) setAutoReconnect(JSON.parse(savedAutoReconnect));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.multiSet([
        ['esp32_ip', esp32IP],
        ['ws_port', wsPort],
        ['update_interval', updateInterval],
        ['notifications', JSON.stringify(notifications)],
        ['dark_mode', JSON.stringify(darkMode)],
        ['auto_reconnect', JSON.stringify(autoReconnect)]
      ]);
      
      CONFIG.ESP32_IP = esp32IP;
      CONFIG.WEBSOCKET_PORT = parseInt(wsPort);
      CONFIG.UPDATE_INTERVAL = parseInt(updateInterval);
      
      Alert.alert(
        '✅ Settings Saved',
        'Your settings have been saved successfully!',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        '❌ Save Failed',
        'Failed to save settings. Please try again.',
        [{ text: 'OK', style: 'destructive' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('Testing...');
    
    try {
      const response = await fetch(`http://${esp32IP}:80/status`, {
        timeout: 5000
      });
      
      if (response.ok) {
        setConnectionStatus('✅ Connected');
        Alert.alert(
          '🎉 Connection Success',
          'Successfully connected to BantayBot!',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      setConnectionStatus('❌ Failed');
      Alert.alert(
        '🚫 Connection Failed',
        `Could not connect to ${esp32IP}. Please check:\n• ESP32 is powered on\n• Both devices are on same WiFi\n• IP address is correct`,
        [{ text: 'OK', style: 'destructive' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setEsp32IP('192.168.1.100');
            setWsPort('81');
            setUpdateInterval('1000');
            setNotifications(true);
            setDarkMode(false);
            setAutoReconnect(true);
            setConnectionStatus('Not tested');
          }
        }
      ]
    );
  };

  const InputCard = ({ title, value, onChangeText, placeholder, keyboardType = 'default', description }) => (
    <View style={styles.inputCard}>
      <Text style={styles.inputLabel}>{title}</Text>
      {description && <Text style={styles.inputDescription}>{description}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
    </View>
  );

  const ToggleCard = ({ title, value, onValueChange, description, icon }) => (
    <View style={styles.toggleCard}>
      <View style={styles.toggleContent}>
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleIcon}>{icon}</Text>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>{title}</Text>
            {description && <Text style={styles.toggleDescription}>{description}</Text>}
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E0E0E0', true: '#667eea' }}
          thumbColor={value ? '#ffffff' : '#ffffff'}
          style={styles.switch}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Modern Header matching Dashboard and Controls */}
        <View style={styles.header}>
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <View style={styles.titleSection}>
                <View style={styles.brandContainer}>
                  <View style={styles.logoIcon}>
                    <View style={styles.settingsGear} />
                    <View style={styles.settingsTooth1} />
                    <View style={styles.settingsTooth2} />
                    <View style={styles.settingsTooth3} />
                    <View style={styles.settingsTooth4} />
                  </View>
                  <View style={styles.titleInfo}>
                    <Text style={styles.appTitle}>Settings</Text>
                    <Text style={styles.appSubtitle}>System Configuration</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Animated.View style={{ opacity: fadeAnim }}>
          {/* Connection Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📡 Connection Settings</Text>
            
            <InputCard
              title="ESP32 IP Address"
              value={esp32IP}
              onChangeText={setEsp32IP}
              placeholder="192.168.1.100"
              keyboardType="numeric"
              description="The IP address of your BantayBot ESP32"
            />

            <InputCard
              title="WebSocket Port"
              value={wsPort}
              onChangeText={setWsPort}
              placeholder="81"
              keyboardType="numeric"
              description="Port for real-time communication"
            />

            <InputCard
              title="Update Interval (ms)"
              value={updateInterval}
              onChangeText={setUpdateInterval}
              placeholder="1000"
              keyboardType="numeric"
              description="How often to request sensor updates"
            />

            {/* Connection Test */}
            <View style={styles.connectionTestCard}>
              <View style={styles.connectionHeader}>
                <Text style={styles.connectionTitle}>🔍 Connection Test</Text>
                <Text style={[styles.connectionStatus, {
                  color: connectionStatus.includes('✅') ? '#51CF66' : 
                        connectionStatus.includes('❌') ? '#FF6B6B' : '#666'
                }]}>
                  {connectionStatus}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.testButton, isLoading && styles.buttonDisabled]}
                onPress={testConnection}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={styles.testButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.testButtonText}>
                    {isLoading ? 'Testing...' : 'Test Connection'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 App Preferences</Text>
            
            <ToggleCard
              title="Push Notifications"
              value={notifications}
              onValueChange={setNotifications}
              description="Receive alerts when motion is detected"
              icon="🔔"
            />

            <ToggleCard
              title="Dark Mode"
              value={darkMode}
              onValueChange={setDarkMode}
              description="Switch to dark theme (Coming Soon)"
              icon="🌙"
            />

            <ToggleCard
              title="Auto Reconnect"
              value={autoReconnect}
              onValueChange={setAutoReconnect}
              description="Automatically try to reconnect when connection is lost"
              icon="🔄"
            />
          </View>

          {/* System Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ System Information</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>App Version</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Build Type</Text>
                <Text style={styles.infoValue}>Demo</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>Today</Text>
              </View>
            </View>

            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>🤖 About BantayBot</Text>
              <Text style={styles.aboutText}>
                A solar-powered automated scarecrow with integrated sensors and mobile monitoring for crop protection.
              </Text>
              <Text style={styles.teamText}>
                Developed by PUP-Lopez BSIT Students
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={saveSettings}
              disabled={isLoading}
            >
              <View style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetToDefaults}
            >
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#10B981',
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
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  settingsGear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  settingsTooth1: {
    position: 'absolute',
    width: 4,
    height: 8,
    backgroundColor: '#FFFFFF',
    top: 4,
    left: 22,
  },
  settingsTooth2: {
    position: 'absolute',
    width: 4,
    height: 8,
    backgroundColor: '#FFFFFF',
    bottom: 4,
    left: 22,
  },
  settingsTooth3: {
    position: 'absolute',
    width: 8,
    height: 4,
    backgroundColor: '#FFFFFF',
    left: 4,
    top: 22,
  },
  settingsTooth4: {
    position: 'absolute',
    width: 8,
    height: 4,
    backgroundColor: '#FFFFFF',
    right: 4,
    top: 22,
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 110,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  toggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  connectionTestCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4facfe',
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  connectionStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  testButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  testButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  aboutCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  teamText: {
    fontSize: 12,
    color: '#4facfe',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtons: {
    padding: 15,
    paddingBottom: 10,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resetButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default SettingsScreen;