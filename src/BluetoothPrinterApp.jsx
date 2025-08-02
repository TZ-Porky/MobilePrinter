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
// Import du nouveau panneau de diagnostic
import DiagnosticPanel from './components/DiagnosticPanel';

export default function BluetoothPrinterApp() {
  const [customText, setCustomText] = useState('Bonjour depuis React Native!');
  const [showDiagnosticPanel, setShowDiagnosticPanel] = useState(false);

  // Utilisation du hook qui gère tout l'état Bluetooth
  const {
    // État
    devices,
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
      Alert.alert('Succès', 'Déconnecté de l\'imprimante');
    } else {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  const handlePrint = async () => {
    if (!isConnected()) {
      Alert.alert('Erreur', 'Aucune imprimante connectée');
      return;
    }
    const success = await printText(customText);
    if (success) {
      // Le log est déjà géré par le service
    } else {
      Alert.alert('Erreur', 'Échec de l\'impression');
    }
  };
  
  const handleOpenDiagnostic = () => {
    setShowDiagnosticPanel(true);
  };
  
  const handleCloseDiagnostic = () => {
    setShowDiagnosticPanel(false);
  };
  
  const renderLogItem = ({ item }) => {
    const logStyle = item.type === 'success' ? styles.logSuccess :
                     item.type === 'error' ? styles.logError :
                     item.type === 'warning' ? styles.logWarning : styles.logInfo;
    
    const logIcon = item.type === 'success' ? '✅' :
                    item.type === 'error' ? '❌' :
                    item.type === 'warning' ? '⚠️' : 'ℹ️';

    return (
      <View style={[styles.logItem, logStyle]}>
        <Text style={styles.logText}>
          <Text style={{ fontWeight: 'bold' }}>{logIcon} {item.timestamp}:</Text> {item.message}
        </Text>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Titre et statut */}
      <View style={styles.header}>
        <Text style={styles.title}>Bluetooth Printer App</Text>
        <Text style={styles.statusText}>
          Statut : <Text style={isConnected() ? styles.connectedText : styles.disconnectedText}>{connectionStatus}</Text>
        </Text>
      </View>

      {/* Liste des appareils */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appareils couplés</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: '#FF5722' }]}
            onPress={loadPairedDevices}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.smallButtonText}>Rechercher</Text>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.listContainer}>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.address}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.deviceItem, connectedDevice?.address === item.address && styles.connectedDeviceItem]}
                onPress={() => handleConnect(item)}
              >
                <View>
                  <Text style={styles.deviceName}>{item.name || 'Nom Inconnu'}</Text>
                  <Text style={styles.deviceAddress}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => <Text style={styles.noDeviceText}>Aucun appareil trouvé</Text>}
          />
        </ScrollView>
      </View>

      {/* Actions de l'imprimante */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions de l'imprimante</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={setCustomText}
          value={customText}
          placeholder="Texte à imprimer"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePrint} disabled={!isConnected()}>
            <Text style={styles.actionButtonText}>Imprimer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.feedButton} onPress={feedPaper} disabled={!isConnected()}>
            <Text style={styles.feedButtonText}>Avancer le papier</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.ticketButton} onPress={() => { /* TODO: Implement ticket printing */ }} disabled={!isConnected()}>
            <Text style={styles.ticketButtonText}>Imprimer un ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDisconnect} disabled={!isConnected()}>
            <Text style={styles.actionButtonText}>Déconnecter</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.diagnosticButton} onPress={handleOpenDiagnostic}>
            <Text style={styles.diagnosticButtonText}>Diagnostic</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearLogsButton} onPress={clearLogs}>
            <Text style={styles.clearLogsButtonText}>Effacer les logs</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Logs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Logs</Text>
        <ScrollView style={styles.logsList}>
          {logs.slice().reverse().map((log, index) => renderLogItem({ item: log, index }))}
        </ScrollView>
      </View>

      {/* Modal de diagnostic */}
      <DiagnosticPanel visible={showDiagnosticPanel} onClose={handleCloseDiagnostic} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    color: '#555',
  },
  connectedText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  disconnectedText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    maxHeight: 150,
  },
  deviceItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  connectedDeviceItem: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#777',
  },
  noDeviceText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    color: '#333',
  },
  actionButton: {
    flex: 0.48,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  diagnosticButton: {
    flex: 0.48,
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  diagnosticButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clearLogsButton: {
    flex: 0.48,
    backgroundColor: '#607D8B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clearLogsButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  logsList: {
    maxHeight: 250,
  },
  logItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  logText: {
    fontSize: 12,
    color: '#333',
  },
  logSuccess: {
    backgroundColor: '#e8f5e9',
    borderLeftColor: '#4CAF50',
  },
  logError: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#F44336',
  },
  logWarning: {
    backgroundColor: '#fffde7',
    borderLeftColor: '#FFC107',
  },
  logInfo: {
    backgroundColor: '#e3f2fd',
    borderLeftColor: '#2196F3',
  },
});
