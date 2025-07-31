// ==========================================
// BluetoothService.js - VERSION CORRIGÉE
// ==========================================

import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { PermissionsAndroid } from 'react-native';
import { PRINTER_COMMANDS } from '../constants/PrinterCommands';
import { logService } from './LogService';

class BluetoothService {
  constructor() {
    this.connectedDevice = null;
    this.devices = [];
    this.isScanning = false;
    this.bluetoothEnabled = false;
    this.permissions = {};
    this.deviceInfo = null;
    this.connectionStatus = 'Déconnecté';
    this.listeners = {
      devices: [],
      connection: [],
      status: [],
      deviceInfo: [],
      scanning: [],
    };
    
    // Éviter les notifications trop fréquentes
    this.notifyTimeouts = {};
  }

  // ==========================================
  // GESTION DES LISTENERS - OPTIMISÉE
  // ==========================================

  subscribe(type, listener) {
    if (!this.listeners[type] || typeof listener !== 'function') {
      console.error(`Type de listener invalide: ${type}`);
      return () => {};
    }

    this.listeners[type].push(listener);
    
    // Envoyer immédiatement la valeur actuelle
    setTimeout(() => {
      this.sendCurrentValue(type, listener);
    }, 0);
    
    return () => {
      if (this.listeners[type]) {
        this.listeners[type] = this.listeners[type].filter(l => l !== listener);
      }
    };
  }

  sendCurrentValue(type, listener) {
    try {
      switch (type) {
        case 'devices':
          listener([...this.devices]);
          break;
        case 'connection':
          listener(this.connectedDevice);
          break;
        case 'status':
          listener(this.connectionStatus);
          break;
        case 'deviceInfo':
          listener(this.deviceInfo);
          break;
        case 'scanning':
          listener(this.isScanning);
          break;
      }
    } catch (error) {
      console.error(`Erreur lors de l'envoi de ${type}:`, error);
    }
  }

  notify(type, data) {
    if (!this.listeners[type]) return;

    // Throttle les notifications pour éviter le spam
    if (this.notifyTimeouts[type]) {
      clearTimeout(this.notifyTimeouts[type]);
    }

    this.notifyTimeouts[type] = setTimeout(() => {
      this.listeners[type].forEach(listener => {
        try {
          listener(type === 'devices' ? [...data] : data);
        } catch (error) {
          console.error(`Erreur dans listener ${type}:`, error);
        }
      });
      this.notifyTimeouts[type] = null;
    }, 50); // Délai de 50ms
  }

  // ==========================================
  // GESTION DES PERMISSIONS - SIMPLIFIÉE
  // ==========================================

  async checkPermissions() {
    try {
      logService.addLog('🔍 Vérification des permissions...', 'info');

      const requiredPermissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      // Vérifier toutes les permissions en une fois
      const results = await Promise.all(
        requiredPermissions.map(permission => 
          PermissionsAndroid.check(permission)
        )
      );

      const currentPermissions = {};
      requiredPermissions.forEach((permission, index) => {
        currentPermissions[permission] = results[index];
      });

      this.permissions = currentPermissions;
      const allGranted = results.every(result => result);

      if (allGranted) {
        logService.addLog('✅ Toutes les permissions accordées', 'success');
        return true;
      }

      logService.addLog('📱 Demande des permissions manquantes...', 'warning');
      const granted = await PermissionsAndroid.requestMultiple(requiredPermissions);

      const finalPermissions = {};
      for (const [permission, result] of Object.entries(granted)) {
        finalPermissions[permission] = result === PermissionsAndroid.RESULTS.GRANTED;
      }

      this.permissions = finalPermissions;
      const finalResult = Object.values(finalPermissions).every(granted => granted);
      
      if (finalResult) {
        logService.addLog('✅ Permissions obtenues', 'success');
      } else {
        logService.addLog('❌ Certaines permissions refusées', 'error');
      }

      return finalResult;
    } catch (error) {
      logService.addLog(`❌ Erreur permissions: ${error.message}`, 'error');
      return false;
    }
  }

  // ==========================================
  // GESTION DU BLUETOOTH - OPTIMISÉE
  // ==========================================

  async checkBluetoothStatus() {
    try {
      logService.addLog('📶 Vérification Bluetooth...', 'info');

      const [isAvailable, isEnabled] = await Promise.all([
        RNBluetoothClassic.isBluetoothAvailable(),
        RNBluetoothClassic.isBluetoothEnabled()
      ]);

      if (!isAvailable) {
        logService.addLog('❌ Bluetooth non disponible', 'error');
        return false;
      }

      logService.addLog(`📶 Bluetooth: ${isEnabled ? 'Activé' : 'Désactivé'}`, 
                       isEnabled ? 'success' : 'warning');

      if (!isEnabled) {
        logService.addLog('🔄 Activation du Bluetooth...', 'warning');
        const enabled = await RNBluetoothClassic.requestEnable();
        this.bluetoothEnabled = enabled;
        
        logService.addLog(`📶 ${enabled ? 'Bluetooth activé' : 'Activation échouée'}`, 
                         enabled ? 'success' : 'error');
        return enabled;
      }

      this.bluetoothEnabled = true;
      return true;
    } catch (error) {
      logService.addLog(`❌ Erreur Bluetooth: ${error.message}`, 'error');
      return false;
    }
  }

  async initializeBluetooth() {
    try {
      logService.addLog('🚀 Initialisation...', 'info');

      const hasPermissions = await this.checkPermissions();
      if (!hasPermissions) {
        logService.addLog('❌ Permissions insuffisantes', 'error');
        return false;
      }

      const bluetoothReady = await this.checkBluetoothStatus();
      if (!bluetoothReady) {
        logService.addLog('❌ Bluetooth non prêt', 'error');
        return false;
      }

      await this.loadPairedDevices();
      logService.addLog('✅ Initialisation terminée', 'success');
      return true;
    } catch (error) {
      logService.addLog(`❌ Erreur initialisation: ${error.message}`, 'error');
      return false;
    }
  }

  // ==========================================
  // GESTION DES APPAREILS - OPTIMISÉE
  // ==========================================

  async loadPairedDevices() {
    if (this.isScanning) {
      logService.addLog('⚠️ Scan déjà en cours', 'warning');
      return this.devices;
    }

    try {
      this.isScanning = true;
      this.notify('scanning', true);
      logService.addLog('🔍 Recherche appareils...', 'info');

      const bonded = await RNBluetoothClassic.getBondedDevices();
      this.devices = bonded || [];
      this.notify('devices', this.devices);

      logService.addLog(`📱 ${this.devices.length} appareils trouvés`, 'success');
      
      return this.devices;
    } catch (error) {
      logService.addLog(`❌ Erreur scan: ${error.message}`, 'error');
      return [];
    } finally {
      this.isScanning = false;
      this.notify('scanning', false);
    }
  }

  async connectToDevice(device) {
    try {
      if (!device) {
        logService.addLog('❌ Aucun appareil spécifié', 'error');
        return false;
      }

      logService.addLog(`🔄 Connexion à ${device.name || device.address}...`, 'info');
      
      this.connectionStatus = 'Connexion...';
      this.notify('status', this.connectionStatus);

      // Déconnecter l'appareil précédent
      if (this.connectedDevice) {
        await this.disconnect();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Vérifier si déjà connecté
      const isConnected = await device.isConnected();
      if (isConnected) {
        logService.addLog('⚠️ Déconnexion session précédente...', 'warning');
        await device.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Connexion avec timeout
      const connectionTimeout = 15000;
      const connected = await Promise.race([
        device.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), connectionTimeout)
        )
      ]);

      if (connected) {
        this.connectedDevice = device;
        this.connectionStatus = `Connecté à ${device.name || device.address}`;
        this.deviceInfo = {
          name: device.name,
          address: device.address,
          type: device.type,
          class: device.class,
        };

        this.notify('connection', this.connectedDevice);
        this.notify('status', this.connectionStatus);
        this.notify('deviceInfo', this.deviceInfo);

        logService.addLog('✅ Connexion réussie', 'success');
        
        // Test de communication
        setTimeout(() => this.testCommunication(), 500);
        
        return true;
      }

      throw new Error('Connexion échouée');
    } catch (error) {
      this.connectionStatus = 'Erreur de connexion';
      this.notify('status', this.connectionStatus);
      logService.addLog(`❌ Erreur: ${error.message}`, 'error');
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.connectedDevice) {
        logService.addLog('🔄 Déconnexion...', 'info');
        
        await this.connectedDevice.disconnect();
        this.connectedDevice = null;
        this.connectionStatus = 'Déconnecté';
        this.deviceInfo = null;

        this.notify('connection', null);
        this.notify('status', this.connectionStatus);
        this.notify('deviceInfo', null);

        logService.addLog('✅ Déconnecté', 'success');
        return true;
      }
      return false;
    } catch (error) {
      logService.addLog(`❌ Erreur déconnexion: ${error.message}`, 'error');
      return false;
    }
  }

  async testCommunication() {
    if (!this.connectedDevice) return false;

    try {
      logService.addLog('🧪 Test communication...', 'info');
      
      await this.connectedDevice.write(PRINTER_COMMANDS.INIT);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const testData = PRINTER_COMMANDS.INIT + 
                      'TEST CONNEXION\n' +
                      new Date().toLocaleTimeString('fr-FR') + '\n' +
                      PRINTER_COMMANDS.FEED;
      
      await this.connectedDevice.write(testData);
      logService.addLog('✅ Communication OK', 'success');
      return true;
    } catch (error) {
      logService.addLog(`❌ Test échoué: ${error.message}`, 'error');
      return false;
    }
  }

  async printText(text, options = {}) {
    if (!this.connectedDevice) {
      logService.addLog('❌ Aucune imprimante connectée', 'error');
      return false;
    }

    try {
      let printData = PRINTER_COMMANDS.INIT;
      
      if (options.align === 'center') printData += PRINTER_COMMANDS.ALIGN_CENTER;
      if (options.bold) printData += PRINTER_COMMANDS.BOLD_ON;
      if (options.size === 'large') printData += PRINTER_COMMANDS.SIZE_LARGE;
      
      printData += text + '\n';
      
      if (options.bold) printData += PRINTER_COMMANDS.BOLD_OFF;
      if (options.size) printData += PRINTER_COMMANDS.SIZE_NORMAL;
      printData += PRINTER_COMMANDS.ALIGN_LEFT + PRINTER_COMMANDS.FEED;

      await this.connectedDevice.write(printData);
      logService.addLog(`✅ Impression: "${text.substring(0, 20)}..."`, 'success');
      return true;
    } catch (error) {
      logService.addLog(`❌ Erreur impression: ${error.message}`, 'error');
      return false;
    }
  }

  async feedPaper() {
    if (!this.connectedDevice) return false;

    try {
      await this.connectedDevice.write(PRINTER_COMMANDS.FEED);
      logService.addLog('✅ Papier avancé', 'success');
      return true;
    } catch (error) {
      logService.addLog(`❌ Erreur feed: ${error.message}`, 'error');
      return false;
    }
  }

  // ==========================================
  // GETTERS
  // ==========================================

  getDevices() { return [...this.devices]; }
  getConnectedDevice() { return this.connectedDevice; }
  getConnectionStatus() { return this.connectionStatus; }
  getDeviceInfo() { return this.deviceInfo; }
  isBluetoothEnabled() { return this.bluetoothEnabled; }
  getPermissions() { return { ...this.permissions }; }
  isConnected() { return this.connectedDevice !== null; }
  getScanningStatus() { return this.isScanning; }
}

export const bluetoothService = new BluetoothService();