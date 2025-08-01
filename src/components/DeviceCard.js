import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';

const DeviceCard = ({name = "Non Identifié", state = 'Inconnu', onPress, isActive = false}) => {
  return (
    <View style={styles.container}>
        <Image
            source={require('../assets/images/Printer.png')}
            style={styles.deviceImage}
        />
      <Text style={styles.deviceName}>Nom de l'appareil</Text>
      <Text style={styles.deviceState}>Statut: <Text style={styles.state}>{state}</Text></Text>
      <TouchableOpacity style={isActive ? styles.buttonActive : styles.buttonInactive} onPress={onPress}>
        <Text style={styles.buttonLabel}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '160',
    height: '210',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  deviceImage: {
    height: '100',
    width: '100'
  },
  deviceName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  deviceState: {
    fontWeight: '400',
    fontSize: 13,
  },
  state: {
    color: '#FF9800',
  },
  buttonActive: {
    height: '30',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  buttonInactive: {
    height: '30',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#A1A1A1',
    borderRadius: 5,
  },
  buttonLabel: {
    fontWeight: 'bold',
    color: '#fff',
  }
});

export default DeviceCard;
