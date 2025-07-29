import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

const PRINTER_COMMANDS = {
  INIT: '\x1B\x40',
  FEED: '\x1B\x64\x03',
  CUT: '\x1D\x56\x00',
  ALIGN_LEFT: '\x1B\x61\x00',
  ALIGN_CENTER: '\x1B\x61\x01',
  ALIGN_RIGHT: '\x1B\x61\x02',
  BOLD_ON: '\x1B\x45\x01',
  BOLD_OFF: '\x1B\x45\x00',
  SIZE_NORMAL: '\x1D\x21\x00',
  SIZE_DOUBLE: '\x1D\x21\x11',
  SIZE_LARGE: '\x1D\x21\x22',
};

export default function BluetoothPrinterApp() {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [customText, setCustomText] = useState('Bonjour depuis React Native!');
  const [connectionStatus, setConnectionStatus] = useState('Déconnecté');

  useEffect(() => {
    initializeBluetooth();
  }, [initializeBluetooth]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initializeBluetooth = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      const allGranted = Object.values(granted).every(
        result => result === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert('Erreur', 'Les permissions Bluetooth sont requises');
        return;
      }

      const isEnabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!isEnabled) {
        const enabled = await RNBluetoothClassic.requestEnable();
        if (!enabled) {
          Alert.alert('Erreur', 'Bluetooth doit être activé');
          return;
        }
      }

      await loadPairedDevices();
    } catch (error) {
      console.error('Erreur d\'initialisation Bluetooth:', error);
      Alert.alert('Erreur', 'Impossible d\'initialiser Bluetooth');
    }
  };

  const loadPairedDevices = async () => {
    try {
      setIsScanning(true);
      const bonded = await RNBluetoothClassic.getBondedDevices();
      setDevices(bonded);
    } catch (error) {
      console.error('Erreur lors du chargement des appareils:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device) => {
    try {
      setConnectionStatus('Connexion...');
      
      // Déconnecter l'appareil précédent si nécessaire
      if (connectedDevice) {
        await connectedDevice.disconnect();
      }

      const connected = await device.connect();
      if (connected) {
        setConnectedDevice(device);
        setConnectionStatus(`Connecté à ${device.name || device.address}`);
        
        // Initialiser l'imprimante
        await device.write(PRINTER_COMMANDS.INIT);
        
        Alert.alert('Succès', `Connecté à ${device.name || device.address}`);
      } else {
        setConnectionStatus('Échec de connexion');
        Alert.alert('Erreur', 'Impossible de se connecter à l\'imprimante');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setConnectionStatus('Erreur de connexion');
      Alert.alert('Erreur', 'Erreur lors de la connexion: ' + error.message);
    }
  };

  const disconnect = async () => {
    try {
      if (connectedDevice) {
        await connectedDevice.disconnect();
        setConnectedDevice(null);
        setConnectionStatus('Déconnecté');
        Alert.alert('Info', 'Déconnecté de l\'imprimante');
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const printText = async (text, options = {}) => {
    if (!connectedDevice) {
      Alert.alert('Erreur', 'Aucune imprimante connectée');
      return;
    }

    try {
      let printData = PRINTER_COMMANDS.INIT;
      
      // Appliquer les options de formatage
      if (options.align === 'center') printData += PRINTER_COMMANDS.ALIGN_CENTER;
      if (options.align === 'right') printData += PRINTER_COMMANDS.ALIGN_RIGHT;
      if (options.bold) printData += PRINTER_COMMANDS.BOLD_ON;
      if (options.size === 'large') printData += PRINTER_COMMANDS.SIZE_LARGE;
      if (options.size === 'double') printData += PRINTER_COMMANDS.SIZE_DOUBLE;
      
      // Ajouter le texte
      printData += text + '\n';
      
      // Réinitialiser le formatage
      if (options.bold) printData += PRINTER_COMMANDS.BOLD_OFF;
      if (options.size) printData += PRINTER_COMMANDS.SIZE_NORMAL;
      printData += PRINTER_COMMANDS.ALIGN_LEFT;
      
      // Avancer le papier
      printData += PRINTER_COMMANDS.FEED;

      await connectedDevice.write(printData);
      Alert.alert('Succès', 'Impression envoyée!');
    } catch (error) {
      console.error('Erreur d\'impression:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'impression: ' + error.message);
    }
  };

  const printTicket = async () => {
    if (!connectedDevice) {
      Alert.alert('Erreur', 'Aucune imprimante connectée');
      return;
    }

    const ticketData = 
      PRINTER_COMMANDS.INIT +
      PRINTER_COMMANDS.ALIGN_CENTER +
      PRINTER_COMMANDS.SIZE_LARGE +
      PRINTER_COMMANDS.BOLD_ON +
      'TICKET DE CAISSE\n' +
      PRINTER_COMMANDS.BOLD_OFF +
      PRINTER_COMMANDS.SIZE_NORMAL +
      '================================\n' +
      PRINTER_COMMANDS.ALIGN_LEFT +
      'Date: ' + new Date().toLocaleDateString('fr-FR') + '\n' +
      'Heure: ' + new Date().toLocaleTimeString('fr-FR') + '\n' +
      '--------------------------------\n' +
      'Article 1..................10,00€\n' +
      'Article 2..................15,50€\n' +
      'Article 3...................8,75€\n' +
      '================================\n' +
      PRINTER_COMMANDS.BOLD_ON +
      'TOTAL:....................34,25€\n' +
      PRINTER_COMMANDS.BOLD_OFF +
      '================================\n' +
      PRINTER_COMMANDS.ALIGN_CENTER +
      'Merci de votre visite!\n' +
      'À bientôt!\n' +
      PRINTER_COMMANDS.FEED +
      PRINTER_COMMANDS.FEED;

    try {
      await connectedDevice.write(ticketData);
      Alert.alert('Succès', 'Ticket imprimé!');
    } catch (error) {
      console.error('Erreur d\'impression:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'impression du ticket');
    }
  };

  const feedPaper = async () => {
    if (!connectedDevice) {
      Alert.alert('Erreur', 'Aucune imprimante connectée');
      return;
    }

    try {
      await connectedDevice.write(PRINTER_COMMANDS.FEED);
    } catch (error) {
      console.error('Erreur d\'avancement papier:', error);
    }
  };

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>
          {item.name || 'Appareil sans nom'}
        </Text>
        <Text style={styles.deviceAddress}>{item.address}</Text>
      </View>
      <View style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connecter</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Imprimante Bluetooth</Text>
        <Text style={styles.statusText}>{connectionStatus}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Section Appareils */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Imprimantes disponibles</Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadPairedDevices}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color="#2196F3" />
              ) : (
                <Text style={styles.refreshButtonText}>Actualiser</Text>
              )}
            </TouchableOpacity>
          </View>

          <FlatList
            data={devices}
            keyExtractor={(item) => item.address}
            renderItem={renderDevice}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Aucune imprimante jumelée trouvée
              </Text>
            }
            style={styles.deviceList}
          />
        </View>

        {/* Section Contrôles */}
        {connectedDevice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contrôles d'impression</Text>
            
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={disconnect}
            >
              <Text style={styles.disconnectButtonText}>Se déconnecter</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              value={customText}
              onChangeText={setCustomText}
              placeholder="Texte à imprimer..."
              multiline
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => printText(customText)}
              >
                <Text style={styles.actionButtonText}>📄 Imprimer Texte</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => printText(customText, { align: 'center', bold: true })}
              >
                <Text style={styles.actionButtonText}>📄 Centré & Gras</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.ticketButton}
                onPress={printTicket}
              >
                <Text style={styles.ticketButtonText}>🎫 Imprimer Ticket</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.feedButton}
                onPress={feedPaper}
              >
                <Text style={styles.feedButtonText}>📃 Avancer Papier</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  deviceAddress: {
    fontSize: 14,
    color: '#666',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 0.48,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  ticketButton: {
    flex: 0.48,
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  ticketButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  feedButton: {
    flex: 0.48,
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
});