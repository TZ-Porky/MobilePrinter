// ==========================================
// BluetoothService.js - VERSION AVEC LOGS CONSOLE
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

    // Surveillance de la connexion
    this.connectionWatcher = null;
    this.lastConnectionCheck = Date.now();
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
      console.log(`📡 Envoi de la valeur actuelle pour le listener '${type}'`);
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
      console.error(`❌ Erreur lors de l'envoi de la valeur actuelle de '${type}':`, error);
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
          console.log(`🔔 Notification de type '${type}' avec les données:`, data);
          listener(type === 'devices' ? [...data] : data);
        } catch (error) {
          console.error(`❌ Erreur dans un listener de type '${type}':`, error);
        }
      });
      this.notifyTimeouts[type] = null;
    }, 50); // Délai de 50ms
  }

  // ==========================================
  // SURVEILLANCE DE LA CONNEXION - NOUVEAU
  // ==========================================

  startConnectionWatcher() {
    if (this.connectionWatcher) {
      clearInterval(this.connectionWatcher);
    }

    this.connectionWatcher = setInterval(async () => {
      await this.checkConnectionHealth();
    }, 5000); // Vérifier toutes les 5 secondes

    logService.addLog('🔍 Surveillance de connexion activée', 'info');
    console.log('Surveillance de connexion activée');
  }

  stopConnectionWatcher() {
    if (this.connectionWatcher) {
      clearInterval(this.connectionWatcher);
      this.connectionWatcher = null;
      logService.addLog('⏹️ Surveillance de connexion arrêtée', 'info');
      console.log('Surveillance de connexion désactivée');
    }
  }

  async checkConnectionHealth() {
    if (!this.connectedDevice) return true;

    try {
      // Vérifier si l'appareil est toujours connecté
      const isStillConnected = await this.connectedDevice.isConnected();
      
      if (!isStillConnected) {
        logService.addLog('❌ Connexion perdue détectée', 'warning');
        console.log('Connexion à l\'imprimante perdu...');
        await this.handleConnectionLoss();
        return false;
      }

      // Test de communication simple (optionnel)
      const now = Date.now();
      if (now - this.lastConnectionCheck > 30000) { // Test toutes les 30 secondes
        try {
          await this.connectedDevice.write(PRINTER_COMMANDS.FEED);
          this.lastConnectionCheck = now;
          logService.addLog('✅ Test de connexion réussi', 'success');
          console.log('Test de connexion réussie...');
        } catch (error) {
          logService.addLog('⚠️ Test de connexion échoué', 'warning');
          console.warn('Test de connexion échoué...');
          await this.handleConnectionLoss();
          return false;
        }
      }

      return true;
    } catch (error) {
      logService.addLog(`❌ Erreur vérification connexion: ${error.message}`, 'error');
      console.error('❌ Erreur vérification connexion: ', error);
      await this.handleConnectionLoss();
      return false;
    }
  }

  async handleConnectionLoss() {
    logService.addLog('🔄 Gestion de la perte de connexion...', 'warning');
    
    // Nettoyer l'état
    this.connectedDevice = null;
    this.connectionStatus = 'Connexion perdue';
    this.deviceInfo = null;

    // Arrêter la surveillance
    this.stopConnectionWatcher();

    // Notifier les listeners
    this.notify('connection', null);
    this.notify('status', this.connectionStatus);
    this.notify('deviceInfo', null);

    logService.addLog('❌ Connexion perdue - État nettoyé', 'error');
    console.error('❌ Connexion perdue - État nettoyé');
  }

  // ==========================================
  // GESTION DES PERMISSIONS - SIMPLIFIÉE
  // ==========================================

  async checkPermissions() {
    try {
      logService.addLog('🔍 Vérification des permissions...', 'info');
      console.log('🔍 Vérification des permissions...');

      const requiredPermissions = [
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
        console.log('✅ Toutes les permissions accordées.');
        logService.addLog('✅ Toutes les permissions accordées', 'success')
        return true;
      }

      console.warn('📱 Demande des permissions manquantes...');
      logService.addLog('📱 Demande des permissions manquantes...', 'warning');
      const granted = await PermissionsAndroid.requestMultiple(requiredPermissions);

      const finalPermissions = {};
      for (const [permission, result] of Object.entries(granted)) {
        finalPermissions[permission] = result === PermissionsAndroid.RESULTS.GRANTED;
      }

      this.permissions = finalPermissions;
      // eslint-disable-next-line no-shadow
      const finalResult = Object.values(finalPermissions).every(granted => granted);
      
      if (finalResult) {
        console.log('✅ Permissions obtenues.');
        logService.addLog('✅ Permissions obtenues', 'success');
      } else {
        console.error('❌ Certaines permissions refusées.');
        logService.addLog('❌ Certaines permissions refusées', 'error');
      }

      return finalResult;
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification des permissions: ${error.message}`);
      logService.addLog(`❌ Erreur permissions: ${error.message}`, 'error');
      return false;
    }
  }

  // ==========================================
  // GESTION DU BLUETOOTH - OPTIMISÉE
  // ==========================================

  async checkBluetoothStatus() {
    try {
      console.log('📶 Vérification du statut Bluetooth...');
      logService.addLog('📶 Vérification Bluetooth...', 'info');

      const [isAvailable, isEnabled] = await Promise.all([
        RNBluetoothClassic.isBluetoothAvailable(),
        RNBluetoothClassic.isBluetoothEnabled()
      ]);
      console.log(`Bluetooth disponible: ${isAvailable}, Bluetooth activé: ${isEnabled}`);

      if (!isAvailable) {
        console.error('❌ Bluetooth non disponible sur cet appareil.');
        logService.addLog('❌ Bluetooth non disponible', 'error');
        return false;
      }

      logService.addLog(`📶 Bluetooth: ${isEnabled ? 'Activé' : 'Désactivé'}`, 
        isEnabled ? 'success' : 'warning');

      if (!isEnabled) {
        console.warn('🔄 Le Bluetooth est désactivé, tentative d\'activation...');
        logService.addLog('🔄 Activation du Bluetooth...', 'warning');
        const enabled = await RNBluetoothClassic.requestEnable();
        this.bluetoothEnabled = enabled;
        
        if (enabled) {
          console.log('✅ Bluetooth activé avec succès.');
        } else {
          console.error('❌ L\'activation du Bluetooth a échoué.');
        }

        logService.addLog(`📶 ${enabled ? 'Bluetooth activé' : 'Activation échouée'}`, 
          enabled ? 'success' : 'error');
        return enabled;
      }

      console.log('✅ Le Bluetooth est déjà activé.');
      this.bluetoothEnabled = true;
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification du statut Bluetooth: ${error.message}`);
      return false;
    }
  }

  async initializeBluetooth() {
    try {
      console.log('🚀 Démarrage de l\'initialisation du service Bluetooth...');
      logService.addLog('🚀 Initialisation...', 'info');

      const hasPermissions = await this.checkPermissions();
      if (!hasPermissions) {
        logService.addLog('❌ Permissions insuffisantes', 'error');
        console.error('❌ Initialisation annulée : permissions insuffisantes.');
        return false;
      }

      const bluetoothReady = await this.checkBluetoothStatus();
      if (!bluetoothReady) {
        console.error('❌ Initialisation annulée : le Bluetooth n\'est pas prêt.');
        logService.addLog('❌ Bluetooth non prêt', 'error');
        return false;
      }

      await this.loadPairedDevices();
      console.log('✅ Initialisation terminée avec succès.');
      logService.addLog('✅ Initialisation terminée', 'success');
      return true;
    } catch (error) {
      logService.addLog(`❌ Erreur initialisation: ${error.message}`, 'error');
      console.error(`❌ Erreur lors de l'initialisation du service: ${error.message}`);
      return false;
    }
  }

  // ==========================================
  // GESTION DES APPAREILS - OPTIMISÉE
  // ==========================================

  async loadPairedDevices() {
    if (this.isScanning) {
      console.warn('⚠️ Un scan est déjà en cours. Opération annulée.');
      logService.addLog('⚠️ Scan déjà en cours', 'warning');
      return this.devices;
    }

    try {
      this.isScanning = true;
      this.notify('scanning', true);
      console.log('🔍 Recherche des appareils appairés...');
      logService.addLog('🔍 Recherche appareils...', 'info');

      const bonded = await RNBluetoothClassic.getBondedDevices();
      this.devices = bonded || [];
      this.notify('devices', this.devices);

      console.log(`📱 ${this.devices.length} appareils appairés trouvés.`);
      logService.addLog(`📱 ${this.devices.length} appareils trouvés`, 'success');
      
      return this.devices;
    } catch (error) {
      console.error(`❌ Erreur lors du scan des appareils: ${error.message}`);
      logService.addLog(`❌ Erreur scan: ${error.message}`, 'error');
      return [];
    } finally {
      this.isScanning = false;
      this.notify('scanning', false);
      console.log('Scan terminé.');
    }
  }

  async connectToDevice(device) {
    try {
      if (!device) {
        console.error('❌ Aucun appareil spécifié pour la connexion.');
        return false;
      }
      
      const deviceName = device.name || device.address;
      console.log(`🔄 Tentative de connexion à l'appareil: ${deviceName}...`);
      logService.addLog(`🔄 Connexion à ${device.name || device.address}...`, 'info');
      
      this.connectionStatus = 'Connexion...';
      this.notify('status', this.connectionStatus);

      // Déconnecter l'appareil précédent
      if (this.connectedDevice) {
        console.log(`Déconnexion de l'appareil précédent: ${this.connectedDevice.name}`);
        await this.disconnect();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Vérifier si déjà connecté
      const isConnected = await device.isConnected();
      if (isConnected) {
        console.warn('⚠️ L\'appareil semble déjà connecté. Déconnexion de la session précédente...');
        logService.addLog('⚠️ Déconnexion session précédente...', 'warning');
        await device.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Connexion avec timeout
      const connectionTimeout = 15000;
      console.log(`Connexion avec un timeout de ${connectionTimeout}ms.`);
      const connected = await Promise.race([
        device.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de connexion')), connectionTimeout)
        )
      ]);

      if (connected) {
        this.connectedDevice = device;
        this.connectionStatus = `Connecté à ${deviceName}`;
        this.deviceInfo = {
          name: device.name,
          address: device.address,
          type: device.type,
          class: device.class,
        };

        this.notify('connection', this.connectedDevice);
        this.notify('status', this.connectionStatus);
        this.notify('deviceInfo', this.deviceInfo);

        console.log(`✅ Connexion réussie à ${deviceName}.`);
        console.log(`✅ Informations sur l'appareil connecté ${this.deviceInfo}.`);
        logService.addLog('✅ Connexion réussie', 'success');
        
        // Test de communication
        setTimeout(() => this.testCommunication(), 500);
        
        return true;
      }

      throw new Error('La connexion a échoué pour une raison inconnue.');
    } catch (error) {
      this.connectionStatus = 'Erreur de connexion';
      this.notify('status', this.connectionStatus);
      console.error(`❌ Échec de la connexion à l'appareil: ${error.message}`);
      logService.addLog(`❌ Erreur: ${error.message}`, 'error');
      return false;
    }
  }

  // Déconnecte l'appareil bluetooth
  async disconnect() {
    try {

      logService.addLog('🔄 Déconnexion...', 'info');

      // Arrêter la surveillance
      this.stopConnectionWatcher();

      if (this.connectedDevice) {
        const deviceName = this.connectedDevice.name || this.connectedDevice.address;
        console.log(`🔄 Déconnexion de l'appareil: ${deviceName}...`);
        
        await this.connectedDevice.disconnect();
        this.connectedDevice = null;
        this.connectionStatus = 'Déconnecté';
        this.deviceInfo = null;

        this.notify('connection', null);
        this.notify('status', this.connectionStatus);
        this.notify('deviceInfo', null);

        console.log('✅ Déconnexion réussie.');
        return true;
      }

      console.warn('⚠️ Aucune connexion active à déconnecter.');
      return false;
    } catch (error) {
      console.error(`❌ Erreur lors de la déconnexion: ${error.message}`);
      logService.addLog(`⚠️ Erreur lors de la déconnexion: ${error.message}`, 'warning');
      
      // Forcer le nettoyage même en cas d'erreur
      this.connectedDevice = null;
      this.connectionStatus = 'Déconnecté';
      this.deviceInfo = null;
      this.stopConnectionWatcher();

      this.notify('connection', null);
      this.notify('status', this.connectionStatus);
      this.notify('deviceInfo', null);

      // Retourner true car on a au moins nettoyé l'état
      return true;
    }
  }

  // ==========================================
  // GESTION DES IMPRIMANTES
  // ==========================================

  // Teste la communication avec l'imprimante
  async testCommunication() {
    if (!this.connectedDevice) {
      console.error('❌ Communication annulée : aucun appareil n\'est connecté.');
      return false;
    }

    try {
      console.log('🧪 Envoi d\'un test de communication...');
      
      await this.connectedDevice.write(PRINTER_COMMANDS.INIT);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const testData = PRINTER_COMMANDS.INIT + 
                      'TEST CONNEXION\n' +
                      new Date().toLocaleTimeString('fr-FR') + '\n' +
                      PRINTER_COMMANDS.FEED;
      
      await this.connectedDevice.write(testData);
      console.log('✅ Le test de communication a réussi.');
      return true;
    } catch (error) {
      console.error(`❌ Le test de communication a échoué: ${error.message}`);
      return false;
    }
  }

  // Imprime un texte
  async printText(text, options = {}) {
    if (!this.connectedDevice) {
      console.error('❌ Impression annulée : aucune imprimante connectée.');
      logService.addLog('❌ Aucune imprimante connectée', 'error');
      return false;
    }

    try {
      console.log(`🖨️ Préparation de l'impression pour le texte: "${text.substring(0, 20)}..."`);
      let printData = PRINTER_COMMANDS.INIT;
      
      if (options.align === 'center') printData += PRINTER_COMMANDS.ALIGN_CENTER;
      if (options.bold) printData += PRINTER_COMMANDS.BOLD_ON;
      if (options.size === 'large') printData += PRINTER_COMMANDS.SIZE_LARGE;
      
      printData += text + '\n';
      
      if (options.bold) printData += PRINTER_COMMANDS.BOLD_OFF;
      if (options.size) printData += PRINTER_COMMANDS.SIZE_NORMAL;
      printData += PRINTER_COMMANDS.ALIGN_LEFT + PRINTER_COMMANDS.FEED;

      await this.connectedDevice.write(printData);
      this.lastConnectionCheck = Date.now();
      console.log(`✅ Impression envoyée avec succès.`);
      logService.addLog(`✅ Impression: "${text.substring(0, 20)}..."`, 'success');
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'impression: ${error.message}`);
      logService.addLog(`❌ Erreur impression: ${error.message}`, 'error');
      await this.handleConnectionLoss();
      return false;
    }
  }

  // Recharger le papier
  async feedPaper() {
    if (!this.connectedDevice) {
      console.error('❌ Avance papier annulée : aucune imprimante connectée.');
      return false;
    }

    try {
      console.log('📄 Avance du papier en cours...');
      await this.connectedDevice.write(PRINTER_COMMANDS.FEED);
      this.lastConnectionCheck = Date.now();
      console.log('✅ Papier avancé avec succès.');
      logService.addLog('✅ Papier avancé', 'success');
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'avance du papier: ${error.message}`);
      logService.addLog(`❌ Erreur feed: ${error.message}`, 'error');
      await this.handleConnectionLoss();
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

  // ==========================================
  // NETTOYAGE
  // ==========================================
  
  cleanup() {
    this.stopConnectionWatcher();
    if (this.connectedDevice) {
      this.disconnect();
    }
    // Nettoyer les timeouts
    Object.values(this.notifyTimeouts).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
  }
}

export const bluetoothService = new BluetoothService();
