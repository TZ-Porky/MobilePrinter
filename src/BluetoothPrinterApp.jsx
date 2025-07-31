import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

// Import du hook personnalisé
import { useBluetoothService } from './hooks/useBluetoothService';

export default function BluetoothPrinterApp() {
  const [customText, setCustomText] = useState('Bonjour depuis React Native!');

  // Utilisation du hook qui gère tout l'état Bluetooth
  const {
    // État
    devices,
    // eslint-disable-next-line no-unused-vars
    connectedDevice,
    connectionStatus,
    deviceInfo,
    isScanning,
    logs,
    
    // Actions
    initializeBluetooth,
    loadPairedDevices,
    connectToDevice,
    disconnect,
    printText,
    feedPaper,
    clearLogs,
    
    // Getters
    isConnected,
  } = useBluetoothService();

  useEffect(() => {
    // Initialisation automatique au démarrage
    initializeBluetooth();
  }, [initializeBluetooth]);

  const handleConnect = async (device) => {
    const success = await connectToDevice(device);
    if (success) {
      Alert.alert('Succès', `Connecté à ${device.name || device.address}`);
    } else {
      Alert.alert('Erreur', 'Impossible de se connecter à l\'imprimante');
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnect();
    if (success) {
      Alert.alert('Info', 'Déconnecté de l\'imprimante');
    }
  };

  const handlePrintText = async () => {
    const success = await printText(customText);
    if (success) {
      Alert.alert('Succès', 'Impression envoyée!');
    } else {
      Alert.alert('Erreur', 'Erreur lors de l\'impression');
    }
  };

  const handlePrintFormatted = async () => {
    const success = await printText(customText, { 
      align: 'center', 
      bold: true, 
      size: 'large' 
    });
    if (success) {
      Alert.alert('Succès', 'Impression formatée envoyée!');
    } else {
      Alert.alert('Erreur', 'Erreur lors de l\'impression');
    }
  };

  const printTicket = async () => {
    const ticketLines = [
      { text: 'TICKET DE CAISSE', options: { align: 'center', bold: true, size: 'large' }},
      { text: '================================', options: {} },
      { text: 'Date: ' + new Date().toLocaleDateString('fr-FR'), options: {} },
      { text: 'Heure: ' + new Date().toLocaleTimeString('fr-FR'), options: {} },
      { text: '--------------------------------', options: {} },
      { text: 'Article 1..................10,00€', options: {} },
      { text: 'Article 2..................15,50€', options: {} },
      { text: 'Article 3...................8,75€', options: {} },
      { text: '================================', options: {} },
      { text: 'TOTAL:....................34,25€', options: { bold: true } },
      { text: '================================', options: {} },
      { text: 'Merci de votre visite!', options: { align: 'center' } },
      { text: 'À bientôt!', options: { align: 'center' } },
    ];

    try {
      for (const line of ticketLines) {
        const success = await printText(line.text, line.options);
        if (!success) {
          Alert.alert('Erreur', 'Erreur lors de l\'impression du ticket');
          return;
        }
        // Petit délai entre chaque ligne pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Avancer le papier à la fin
      await feedPaper();
      Alert.alert('Succès', 'Ticket imprimé!');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'impression du ticket');
    }
  };

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleConnect(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>
          {item.name || 'Appareil sans nom'}
        </Text>
        <Text style={styles.deviceAddress}>{item.address}</Text>
        {item.type && (
          <Text style={styles.deviceType}>
            Type: {item.type} | Classe: {item.class || 'Inconnue'}
          </Text>
        )}
      </View>
      <View style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connecter</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLog = ({ item }) => (
    <View style={[styles.logItem, styles[`log${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`]]}>
      <Text style={styles.logTimestamp}>{item.timestamp}</Text>
      <Text style={styles.logMessage}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Imprimante Bluetooth</Text>
        <Text style={styles.statusText}>{connectionStatus}</Text>
        <View style={styles.statusIndicators}>
          <Text style={[styles.indicator, isConnected() && styles.indicatorActive]}>
            🔗 {isConnected() ? 'Connecté' : 'Déconnecté'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Section Informations Appareil */}
        {deviceInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Appareil</Text>
            <Text style={styles.infoText}>Classe: {deviceInfo.class || 'Non définie'}</Text>
          </View>
        )}

        {/* Section Appareils */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appareils jumelés</Text>
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
                Aucun appareil jumelé trouvé
              </Text>
            }
            style={styles.deviceList}
          />
        </View>

        {/* Section Contrôles d'impression */}
        {isConnected() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contrôles d'impression</Text>
            
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
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
                onPress={handlePrintText}
              >
                <Text style={styles.actionButtonText}>📄 Imprimer Texte</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePrintFormatted}
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

        {/* Section Logs de diagnostic */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Logs de Diagnostic</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearLogs}
            >
              <Text style={styles.clearButtonText}>Effacer</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={logs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLog}
            style={styles.logsList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucun log disponible</Text>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '500',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    height: '130',
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
    marginBottom: 10,
  },
  statusIndicators: {
    flexDirection: 'row',
    gap: 10,
  },
  indicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    color: 'white',
    fontSize: 12,
  },
  indicatorActive: {
    backgroundColor: '#4CAF50',
  },
  content: {
    height: '130',
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
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#FF9800',
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
    marginBottom: 3,
  },
  deviceAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  deviceType: {
    fontSize: 12,
    color: '#999',
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
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  logsList: {
    maxHeight: 400,
  },
  logItem: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    borderLeftWidth: 4,
  },
  logInfo: {
    backgroundColor: '#f8f9fa',
    borderLeftColor: '#2196F3',
  },
  logSuccess: {
    backgroundColor: '#f1f8e9',
    borderLeftColor: '#4CAF50',
  },
  logError: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#f44336',
  },
  logWarning: {
    backgroundColor: '#fff8e1',
    borderLeftColor: '#FF9800',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
})
