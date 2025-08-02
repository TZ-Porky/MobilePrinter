/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import DeviceCard from '../components/DeviceCard';
import BottomModal from '../components/BottomModal';
import { useBluetoothContext } from '../hooks/useBluetoothContext';

function HomeScreen({ navigation }) {

  // ==================== Variables ====================== //
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // ==================== Hooks ====================== //
  // Hook Bluetooth
  const {
    devices,
    isScanning,
    initializeBluetooth,
    loadPairedDevices,
    isBluetoothEnabled,
    isConnected,
    disconnect,
  } = useBluetoothContext();

  // ==================== Initialisation ====================== //
  // Initialisation au chargement du composant
  useEffect(() => {
    const initialize = async () => {
      const success = await initializeBluetooth();
      if (success) {
        await loadPairedDevices();
      }
    };

    initialize();
  }, [initializeBluetooth, loadPairedDevices]);

  // Déconnect l'appareil connecté
  useEffect(() => {
    const disconnectDevice = async () => {
      if (isConnected()) {
        await disconnect();
        console.log("Appareil déconnecté");
      }
    }

    disconnectDevice();
  }, [isConnected, disconnect])

  // ==================== Fonctionnalités du Menu ====================== //
  // Ouvre le menu
  const openMenu = () => {
    setIsMenuVisible(true);
  };

  // Ferme le menu
  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  // Active le Bluetooth
  const handleEnableBluetooth = async () => {
    closeMenu();
    try {
      const success = await initializeBluetooth();
      if (success) {
        Alert.alert('Succès', 'Bluetooth activé');
        await loadPairedDevices();
      } else {
        Alert.alert('Erreur', "Impossible d'activer le Bluetooth");
      }
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de l'activation du Bluetooth");
    }
  };

  // Actualise la liste des appareils
  const handleRefresh = async () => {
    closeMenu();
    try {
      if (isBluetoothEnabled()) {
        await loadPairedDevices();
      }
      Alert.alert('Info', 'Liste des appareils actualisée');
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de l'actualisation");
    }
  };

  // Menu des options
  const menuOptions = [
    { label: isBluetoothEnabled ? "Activer le bluetooth" : "Reinitialiser le bluetooth", onPress: handleEnableBluetooth},
    { label: "Actualiser", onPress: handleRefresh},
    { label: "Reconnexion Automatique", onPress: ()=>Alert.alert("Comming Next Udpate","Reconnexion automatique disponible prochainement")},
  ]

  // ==================== Fonctionnalités de connexion ====================== //
  // Connecte un appareil
  const handleConnectDevice = async device => {
    if (!device) {
      Alert.alert('Erreur', 'Aucun appareil sélectionné');
      return;
    }

    try {
      setIsConnecting(true);

      // Simuler l'écran de connexion
      navigation.navigate('Connexion', {
        device: device,
        onConnectionResult: success => {
          setIsConnecting(false);
          if (success) {
            navigation.navigate('Dashboard');
          }
        },
      });
    } catch (error) {
      setIsConnecting(false);
      Alert.alert('Erreur', 'Erreur lors de la connexion');
    }
  };

  // ==================== Rendu des composants ====================== //
  // Rendu d'un appareil dans la liste
  const renderDevice = ({ item }) => (
    <View style={styles.deviceContainer}>
      <DeviceCard
        name={item.name || 'Appareil sans nom'}
        state={item.address ? 'Jumelé' : 'Non jumelé'}
        onPress={() => handleConnectDevice(item)}
        isActive={!isConnecting && isBluetoothEnabled()}
      />
      <View style={styles.deviceDetails}>
        <Text style={styles.deviceAddress}>{item.address}</Text>
        {item.type && (
          <Text style={styles.deviceType}>
            Type: {item.type} | Classe: {item.class || 'Inconnue'}
          </Text>
        )}
      </View>
    </View>
  );

  // ==================== Rendu Principal ====================== //
  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.headerBar}>
        <View style={styles.logo}>
          <Image
            source={require('../assets/images/Logo.png')}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>MOBILE{'\n'}PRINTER</Text>
        </View>
        <TouchableOpacity onPress={openMenu}>
          <Image source={require('../assets/images/Settings.png')} />
        </TouchableOpacity>
      </View>

      {/* Corps */}
      <ScrollView style={styles.content}>
        {/* Statut Bluetooth */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: isBluetoothEnabled() ? '#4CAF50' : '#F44336',
                },
              ]}
            />
            <Text style={styles.statusText}>
              Bluetooth: {isBluetoothEnabled() ? 'Activé' : 'Désactivé'}
            </Text>
          </View>
        </View>

        {/* | ====================| Liste des appareils |==================| */}
        <View style={styles.devicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Appareils jumelés</Text>
            {isScanning && <ActivityIndicator size="small" color="#2196F3" />}
          </View>

          {!isBluetoothEnabled() ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Veuillez activer le Bluetooth pour voir les appareils
              </Text>
            </View>
          ) : devices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun appareil jumelé trouvé</Text>
              <Text style={styles.emptySubText}>
                Jumelez d'abord votre imprimante dans les paramètres Bluetooth
              </Text>
            </View>
          ) : (
            <FlatList
              data={devices}
              keyExtractor={item => item.address}
              renderItem={isBluetoothEnabled() ? renderDevice : null}
              horizontal={false}
              numColumns={2}
              columnWrapperStyle={styles.deviceRow}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {/* ============= Menu des options ============ */}
      <BottomModal 
        isVisible={isMenuVisible}
        onClose={closeMenu}
        options={menuOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  // ==================== En tête ====================== //
  headerBar: {
    height: 80,
    backgroundColor: '#2196F3',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 5,
  },

  // ==================== Logo ====================== //
  logo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  logoImage: {
    height: 33,
    width: 33,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },

  // ==================== Corps ====================== //
  content: {
    flex: 1,
    padding: 20,
  },

  // ==================== Statut ====================== //
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  connectionStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },

  // ==================== Appareils ====================== //
  devicesSection: {
    flex: 1,
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
  deviceRow: {
    justifyContent: 'flex-start',
    gap: 10,
  },
  deviceContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  deviceDetails: {
    marginTop: 5,
    alignItems: 'center',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  deviceType: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },

  // ==================== États vides ====================== //
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // ==================== Connexion rapide ====================== //
  quickConnectSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  quickConnectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  quickConnectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // ==================== États ====================== //
  disabledButton: {
    opacity: 0.5,
  },
});

export default HomeScreen;
