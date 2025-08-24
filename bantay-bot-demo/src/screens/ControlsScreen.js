import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  Vibration,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CONFIG } from '../config/config';
import WebSocketService from '../services/WebSocketService';
import DemoDataService from '../services/DemoDataService';

const { width } = Dimensions.get('window');

const ControlsScreen = () => {
  const [isDemoMode] = useState(CONFIG.DEMO_MODE);
  const [loadingStates, setLoadingStates] = useState({});
  const [lastCommand, setLastCommand] = useState(null);
  
  // Animation refs for each button
  const buttonAnims = useRef({
    MOVE_ARMS: new Animated.Value(1),
    ROTATE_HEAD: new Animated.Value(1),
    STOP_MOVEMENT: new Animated.Value(1),
    SOUND_ALARM: new Animated.Value(1),
    TEST_BUZZER: new Animated.Value(1),
    RESET_SYSTEM: new Animated.Value(1),
    CALIBRATE_SENSORS: new Animated.Value(1),
  }).current;

  const animateButton = (command) => {
    const anim = buttonAnims[command];
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const setLoading = (command, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [command]: isLoading }));
  };

  const sendCommand = async (command, confirmationMessage = null) => {
    if (confirmationMessage) {
      Alert.alert(
        'Confirm Action',
        confirmationMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            style: 'default',
            onPress: () => executeCommand(command)
          }
        ]
      );
    } else {
      executeCommand(command);
    }
  };

  const executeCommand = async (command) => {
    animateButton(command);
    setLoading(command, true);
    setLastCommand({ command, timestamp: new Date() });

    // Haptic feedback
    Vibration.vibrate(100);

    const service = isDemoMode ? DemoDataService : WebSocketService;
    
    try {
      service.send({ command, timestamp: Date.now() });
      
      // Simulate command execution delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        '✅ Command Executed',
        `${getCommandDisplayName(command)} completed successfully!`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        '❌ Command Failed',
        `Failed to execute ${getCommandDisplayName(command)}. Please try again.`,
        [{ text: 'OK', style: 'destructive' }]
      );
    } finally {
      setLoading(command, false);
    }
  };

  const getCommandDisplayName = (command) => {
    const names = {
      MOVE_ARMS: 'Arm Movement',
      ROTATE_HEAD: 'Head Rotation',
      STOP_MOVEMENT: 'Stop Movement',
      SOUND_ALARM: 'Sound Alarm',
      TEST_BUZZER: 'Buzzer Test',
      RESET_SYSTEM: 'System Reset',
      CALIBRATE_SENSORS: 'Sensor Calibration'
    };
    return names[command] || command;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit'
    });
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Modern Header matching Dashboard */}
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <View style={styles.brandContainer}>
                <View style={styles.logoIcon}>
                  <View style={styles.controllerIcon} />
                  <View style={styles.controllerButton1} />
                  <View style={styles.controllerButton2} />
                </View>
                <View style={styles.titleInfo}>
                  <Text style={styles.appTitle}>Remote Controls</Text>
                  <Text style={styles.appSubtitle}>Command Interface</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Last Command Status */}
        {lastCommand && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Last Command</Text>
            <Text style={styles.statusCommand}>
              {getCommandDisplayName(lastCommand.command)}
            </Text>
            <Text style={styles.statusTime}>
              {formatTime(lastCommand.timestamp)}
            </Text>
          </View>
        )}

        {/* Camera Monitoring */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Camera Monitoring</Text>
          <View style={styles.cameraPlaceholder}>
            <View style={styles.cameraBlur}>
              <View style={styles.cameraLoadingIcon} />
              <Text style={styles.cameraWaitingText}>Waiting for camera component to connect...</Text>
            </View>
          </View>
        </View>

        {/* Robot Power Controls */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Robot Power</Text>
          <View style={styles.robotGrid}>
            <View style={styles.robotCard}>
              <View style={styles.robotHeader}>
                <View style={styles.robotIcon} />
                <Text style={styles.robotName}>Robot #1</Text>
                <View style={[styles.powerIndicator, styles.powerOn]} />
              </View>
              <TouchableOpacity style={styles.powerButton}>
                <Text style={styles.powerButtonText}>POWER ON</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.robotCard}>
              <View style={styles.robotHeader}>
                <View style={styles.robotIcon} />
                <Text style={styles.robotName}>Robot #2</Text>
                <View style={[styles.powerIndicator, styles.powerOff]} />
              </View>
              <TouchableOpacity style={[styles.powerButton, styles.powerButtonOff]}>
                <Text style={[styles.powerButtonText, styles.powerButtonTextOff]}>POWER OFF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Component Activation */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Component Controls</Text>
          <View style={styles.componentGrid}>
            <TouchableOpacity style={[styles.componentCard, styles.componentActive]}>
              <View style={styles.componentHeader}>
                <Text style={styles.componentLabel}>Sensors</Text>
                <Switch 
                  value={true} 
                  thumbColor="#FFFFFF"
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                />
              </View>
              <View style={styles.componentInfo}>
                <View style={styles.componentDot} />
                <Text style={styles.componentStatus}>PIR, Ultrasonic, DHT11</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.componentCard}>
              <View style={styles.componentHeader}>
                <Text style={styles.componentLabel}>Motors</Text>
                <Switch 
                  value={false} 
                  thumbColor="#FFFFFF"
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                />
              </View>
              <View style={styles.componentInfo}>
                <View style={[styles.componentDot, styles.componentDotOff]} />
                <Text style={styles.componentStatus}>Servo, DC Motors</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.componentCard, styles.componentActive]}>
              <View style={styles.componentHeader}>
                <Text style={styles.componentLabel}>Speaker</Text>
                <Switch 
                  value={true} 
                  thumbColor="#FFFFFF"
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                />
              </View>
              <View style={styles.componentInfo}>
                <View style={styles.componentDot} />
                <Text style={styles.componentStatus}>Audio Output Ready</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.componentCard}>
              <View style={styles.componentHeader}>
                <Text style={styles.componentLabel}>Camera</Text>
                <Switch 
                  value={false} 
                  thumbColor="#FFFFFF"
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                />
              </View>
              <View style={styles.componentInfo}>
                <View style={[styles.componentDot, styles.componentDotOff]} />
                <Text style={styles.componentStatus}>ESP32-CAM</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sound Management */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sound Management</Text>
          <View style={styles.soundContainer}>
            <View style={styles.soundControls}>
              <TouchableOpacity style={[styles.soundModeButton, styles.soundModeActive]}>
                <Text style={styles.soundModeTextActive}>Sequential</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.soundModeButton}>
                <Text style={styles.soundModeText}>Random</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.soundModeButton}>
                <Text style={styles.soundModeText}>Custom</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.soundList}>
              <View style={styles.soundItem}>
                <View style={styles.soundItemLeft}>
                  <View style={styles.soundPlayIcon} />
                  <View>
                    <Text style={styles.soundName}>Alert_Sound_01.mp3</Text>
                    <Text style={styles.soundDuration}>0:03</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.soundItemAction}>
                  <Text style={styles.soundActionText}>▶</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.soundItem}>
                <View style={styles.soundItemLeft}>
                  <View style={styles.soundPlayIcon} />
                  <View>
                    <Text style={styles.soundName}>Warning_Beep.mp3</Text>
                    <Text style={styles.soundDuration}>0:02</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.soundItemAction}>
                  <Text style={styles.soundActionText}>▶</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.soundItem}>
                <View style={styles.soundItemLeft}>
                  <View style={styles.soundPlayIcon} />
                  <View>
                    <Text style={styles.soundName}>Motion_Detected.mp3</Text>
                    <Text style={styles.soundDuration}>0:05</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.soundItemAction}>
                  <Text style={styles.soundActionText}>▶</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>+ Upload New Sound</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Robot Actions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Robot Actions</Text>
          <View style={styles.actionGrid}>
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => sendCommand('MOVE_ARMS')}
                disabled={loadingStates['MOVE_ARMS']}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
                  <View style={styles.armIcon} />
                </View>
                <Text style={styles.actionText}>Move Arms</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => sendCommand('ROTATE_HEAD')}
                disabled={loadingStates['ROTATE_HEAD']}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <View style={styles.rotateIconNew} />
                </View>
                <Text style={styles.actionText}>Rotate Head</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => sendCommand('SOUND_ALARM')}
                disabled={loadingStates['SOUND_ALARM']}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#EF4444' }]}>
                  <View style={styles.alarmIcon} />
                </View>
                <Text style={styles.actionText}>Sound Alarm</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => sendCommand('TEST_BUZZER')}
                disabled={loadingStates['TEST_BUZZER']}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
                  <View style={styles.buzzerIconNew} />
                </View>
                <Text style={styles.actionText}>Test Buzzer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* System Controls */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>System Controls</Text>
          <View style={styles.systemButtonsContainer}>
            <TouchableOpacity 
              style={styles.systemButton}
              onPress={() => sendCommand('CALIBRATE_SENSORS')}
              disabled={loadingStates['CALIBRATE_SENSORS']}
            >
              <View style={styles.systemButtonIcon}>
                <View style={styles.calibrateIconNew} />
              </View>
              <View style={styles.systemButtonContent}>
                <Text style={styles.systemButtonTitle}>Calibrate Sensors</Text>
                <Text style={styles.systemButtonDesc}>Recalibrate all sensor readings</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.systemButton}
              onPress={() => sendCommand('RESET_SYSTEM', 'This will restart the entire BantayBot system. Are you sure?')}
              disabled={loadingStates['RESET_SYSTEM']}
            >
              <View style={styles.systemButtonIcon}>
                <View style={styles.resetIcon} />
              </View>
              <View style={styles.systemButtonContent}>
                <Text style={styles.systemButtonTitle}>Reset System</Text>
                <Text style={styles.systemButtonDesc}>Restart all components</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.systemButton, styles.emergencyButtonNew]}
              onPress={() => sendCommand('STOP_MOVEMENT', 'This will immediately stop all BantayBot operations. Continue?')}
              disabled={loadingStates['STOP_MOVEMENT']}
            >
              <View style={[styles.systemButtonIcon, styles.emergencyIcon]}>
                <View style={styles.stopIconNew} />
              </View>
              <View style={styles.systemButtonContent}>
                <Text style={[styles.systemButtonTitle, styles.emergencyText]}>Emergency Stop</Text>
                <Text style={[styles.systemButtonDesc, styles.emergencyTextSub]}>Stop all operations immediately</Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: '#8B5CF6',
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
  controllerIcon: {
    width: 24,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  controllerButton1: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    top: 14,
    left: 10,
  },
  controllerButton2: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    top: 14,
    right: 10,
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
    padding: 24,
    paddingBottom: 110,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  statusCommand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // New section styles
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitleStandalone: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  // Camera styles
  cameraPlaceholder: {
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  cameraBlur: {
    flex: 1,
    backgroundColor: 'rgba(243, 244, 246, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLoadingIcon: {
    width: 40,
    height: 30,
    backgroundColor: '#9CA3AF',
    borderRadius: 8,
    marginBottom: 12,
  },
  cameraWaitingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Robot power styles
  robotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  robotCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  robotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  robotIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    marginRight: 8,
  },
  robotName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    minWidth: 70,
  },
  powerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  powerOn: {
    backgroundColor: '#10B981',
  },
  powerOff: {
    backgroundColor: '#EF4444',
  },
  powerButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  powerButtonOff: {
    backgroundColor: '#6B7280',
  },
  powerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  powerButtonTextOff: {
    color: '#FFFFFF',
  },
  // Component styles
  componentGrid: {
    gap: 12,
  },
  componentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  componentActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  componentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  componentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  componentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  componentDotOff: {
    backgroundColor: '#EF4444',
  },
  componentStatus: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Sound management styles
  soundContainer: {
    gap: 12,
  },
  soundControls: {
    flexDirection: 'row',
    gap: 8,
  },
  soundModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  soundModeActive: {
    backgroundColor: '#3B82F6',
  },
  soundModeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  soundModeTextActive: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  soundList: {
    gap: 8,
  },
  soundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  soundItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundPlayIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    marginRight: 12,
  },
  soundName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  soundDuration: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  soundItemAction: {
    width: 32,
    height: 32,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundActionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  // Robot Actions styles
  actionGrid: {
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  armIcon: {
    width: 24,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  rotateIconNew: {
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    borderTopColor: 'transparent',
  },
  alarmIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  buzzerIconNew: {
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  // System Controls styles
  systemButtonsContainer: {
    gap: 12,
  },
  systemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  systemButtonIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  calibrateIconNew: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#6B7280',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  resetIcon: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#6B7280',
    borderRadius: 9,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    transform: [{ rotate: '45deg' }],
  },
  stopIconNew: {
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
  },
  systemButtonContent: {
    flex: 1,
  },
  systemButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  systemButtonDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  emergencyButtonNew: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  emergencyIcon: {
    backgroundColor: '#EF4444',
  },
  emergencyText: {
    color: '#DC2626',
  },
  emergencyTextSub: {
    color: '#EF4444',
  },
});

export default ControlsScreen;