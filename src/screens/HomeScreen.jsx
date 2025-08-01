/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import React, { useState } from 'react';
import DeviceCard from '../components/DeviceCard';

function HomeScreen({navigation}) {
  const [isVisible, setIsVisible] = useState(false);

  // Ouvre le menu
  const openMenu = () => {
    setIsVisible(true);
  };

  // Ferme le menu
  const closeMenu = () => {
    setIsVisible(false);
  };

  // Connecte l'appareil
  const connectDevice = () => {
    navigation.navigate("Connexion")
  }

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
        <DeviceCard onPress={connectDevice}/>
      </ScrollView>

      {/* Menu des options */}
      <Modal transparent={true} visible={isVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={{color:'#3BC2E8'}}>Activer le Bluetooth</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={{color:'#3BC2E8'}}>Actualiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={closeMenu}>
              <Text>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    height: '80',
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
    height: '33',
    width: '33',
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

  // ==================== Menu ====================== //
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    height: '200',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default HomeScreen;
