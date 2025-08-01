import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image,
    ActivityIndicator 
  } from 'react-native';
  import React from 'react';
  
  const DeviceCard = ({
    name = "Non Identifié", 
    address = "00:00:00:00:00:00",
    state = 'Inconnu', 
    type = null,
    deviceClass = null,
    onPress, 
    isActive = false,
    isConnecting = false,
    isConnected = false
  }) => {
    
    // Fonction pour obtenir l'icône basée sur le type d'appareil
    const getDeviceIcon = () => {
      if (type && type.toLowerCase().includes('printer')) {
        return require('../assets/images/Printer.png');
      }
      // Ajouter d'autres types d'appareils si nécessaire
      return require('../assets/images/Printer.png');
    };
  
    // Fonction pour formater le nom de l'appareil
    const getDisplayName = () => {
      if (name && name !== "Non Identifié") {
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
      }
      return "Appareil Bluetooth";
    };
  
    // Fonction pour obtenir le style du bouton basé sur l'état
    const getButtonStyle = () => {
      if (isConnected) return styles.buttonConnected;
      if (isConnecting) return styles.buttonConnecting;
      if (isActive) return styles.buttonActive;
      return styles.buttonInactive;
    };
  
    // Fonction pour obtenir le texte du bouton
    const getButtonText = () => {
      if (isConnected) return "Connecté";
      if (isConnecting) return "Connexion...";
      return "Se connecter";
    };
  
    // Fonction pour obtenir la couleur du statut
    const getStateColor = () => {
      switch (state.toLowerCase()) {
        case 'jumelé':
        case 'paired':
          return '#4CAF50';
        case 'connecté':
        case 'connected':
          return '#2196F3';
        case 'déconnecté':
        case 'disconnected':
          return '#FF9800';
        default:
          return '#FF9800';
      }
    };
  
    return (
      <View style={[styles.container, isConnected && styles.containerConnected]}>
        <View style={styles.deviceIconContainer}>
          <Image
            source={getDeviceIcon()}
            style={styles.deviceImage}
          />
          {isConnected && (
            <View style={styles.connectedIndicator}>
              <View style={styles.connectedDot} />
            </View>
          )}
        </View>
  
        <Text style={styles.deviceName} numberOfLines={2}>
          {getDisplayName()}
        </Text>
  
        <View style={styles.deviceInfoContainer}>
          <Text style={styles.deviceState}>
            Statut: <Text style={[styles.state, { color: getStateColor() }]}>
              {state}
            </Text>
          </Text>
          
          {address !== "00:00:00:00:00:00" && (
            <Text style={styles.deviceAddress} numberOfLines={1}>
              {address}
            </Text>
          )}
  
          {type && (
            <Text style={styles.deviceType} numberOfLines={1}>
              {type}
            </Text>
          )}
        </View>
  
        <TouchableOpacity 
          style={getButtonStyle()} 
          onPress={onPress}
          disabled={!isActive || isConnecting || isConnected}
        >
          {isConnecting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonLabel}>
              {getButtonText()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      width: 160,
      height: 200,
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#f0f0f0',
    },
    containerConnected: {
      borderColor: '#4CAF50',
      borderWidth: 2,
      shadowColor: '#4CAF50',
      shadowOpacity: 0.2,
    },
    deviceIconContainer: {
      position: 'relative',
      marginBottom: 1,
    },
    deviceImage: {
      height: 85,
      width: 85,
      resizeMode: 'contain',
    },
    connectedIndicator: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: '#fff',
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
    },
    connectedDot: {
      width: 12,
      height: 12,
      backgroundColor: '#4CAF50',
      borderRadius: 6,
    },
    deviceName: {
      fontWeight: 'bold',
      fontSize: 14,
      textAlign: 'center',
      color: '#333',
      minHeight: 32,
    },
    deviceInfoContainer: {
      alignItems: 'center',
      marginVertical: 4,
    },
    deviceState: {
      fontWeight: '400',
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 1,
    },
    state: {
      fontWeight: '600',
    },
    deviceAddress: {
      fontSize: 10,
      color: '#666',
      textAlign: 'center',
      fontFamily: 'monospace',
      marginBottom: 2,
    },
    deviceType: {
      fontSize: 10,
      color: '#999',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    buttonActive: {
      height: 32,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2196F3',
      borderRadius: 6,
    },
    buttonInactive: {
      height: 32,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#A1A1A1',
      borderRadius: 6,
    },
    buttonConnecting: {
      height: 32,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FF9800',
      borderRadius: 6,
    },
    buttonConnected: {
      height: 32,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4CAF50',
      borderRadius: 6,
    },
    buttonLabel: {
      fontWeight: 'bold',
      color: '#fff',
      fontSize: 12,
      textAlign: 'center',
    },
  });
  
  export default DeviceCard;