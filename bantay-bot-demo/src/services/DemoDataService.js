class DemoDataService {
  constructor() {
    this.interval = null;
    this.listeners = {};
    this.isRunning = false;
  }

  generateSensorData() {
    return {
      motion: Math.random() > 0.95 ? 1 : 0,
      distance: Math.floor(Math.random() * 90) + 10, // 10-99 cm
      temperature: Math.round((25 + Math.random() * 10) * 10) / 10, // 25-35°C, 1 decimal
      humidity: Math.round((50 + Math.random() * 30) * 10) / 10, // 50-80%, 1 decimal
      soilMoisture: Math.floor(Math.random() * 1024),
      timestamp: new Date().toISOString()
    };
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.emit('connected', true);
    
    // Send initial data immediately
    const initialData = this.generateSensorData();
    this.emit('data', initialData);
    
    this.interval = setInterval(() => {
      const data = this.generateSensorData();
      this.emit('data', data);
      
      if (data.motion === 1) {
        this.emit('alert', { type: 'motion', message: 'Motion detected!' });
      }
      
      if (data.distance < 20) {
        this.emit('alert', { type: 'proximity', message: 'Object too close!' });
      }
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      this.emit('connected', false);
    }
  }

  send(message) {
    console.log('Demo mode - Command sent:', message);
    this.emit('command', message);
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

export default new DemoDataService();