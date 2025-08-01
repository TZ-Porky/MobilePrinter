/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  BackHandler,
  Alert,
  TextInput
} from 'react-native';
import React, { useState, useEffect } from 'react';
import DashboardScreenStyle from './DashboardScreenStyle';

const DashboardScreen = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Déconnecter l'appareil ?",
        "Quitter cet écran déconnectera l'appareil connecté, êtes-vous sûre ?",
        [
          {
            text: 'Annuler',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Oui',
            onPress: () => navigation.replace('Home'),
          },
        ],
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Ouvre le menu
  const openMenu = () => {
    setIsVisible(true);
  };

  // Ferme le menu
  const closeMenu = () => {
    setIsVisible(false);
  };

  // Déconnecte de l'appareil
  const disconnect = () => {
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.headerBar}>
        <View style={styles.headerTop}>
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

        <View style={styles.headerBottom}>
          {/* Statut de l'appareil */}
          <View style={styles.indicator} />
          <Text style={styles.deviceLabel}>
            Connecté à <Text style={styles.deviceName}>Appareil Bluetooth</Text>
          </Text>
        </View>
      </View>

      {/* Corps */}
      <ScrollView style={styles.content}>
        <View style={styles.section}>

          <TextInput
            style={DashboardScreenStyle.textInput}
            value={customText}
            onChangeText={setCustomText}
            placeholder="Texte à imprimer..."
            multiline
          />

          <View style={DashboardScreenStyle.buttonRow}>
            <TouchableOpacity
              style={DashboardScreenStyle.actionButton}
              onPress={() => {}}
            >
              <Text style={DashboardScreenStyle.actionButtonText}>Imprimer le texte saisie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={DashboardScreenStyle.actionButton}
              onPress={() => {}}
            >
              <Text style={DashboardScreenStyle.actionButtonText}>Imprimer le texte Centré et en Gras</Text>
            </TouchableOpacity>
          </View>

          <View style={DashboardScreenStyle.buttonRow}>
            <TouchableOpacity style={DashboardScreenStyle.ticketButton} onPress={() => {}}>
              <Text style={DashboardScreenStyle.ticketButtonText}>Imprimer Ticket de Test</Text>
            </TouchableOpacity>

            <TouchableOpacity style={DashboardScreenStyle.feedButton} onPress={() => {}}>
              <Text style={DashboardScreenStyle.feedButtonText}>Faire avancer le papier</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Menu des options */}
      <Modal transparent={true} visible={isVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={disconnect}>
              <Text style={{ color: '#F06317' }}>Déconnecter l'appareil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text>Imprimer par code QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={closeMenu}>
              <Text>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  // ==================== En tête ====================== //
  headerBar: {
    height: '100',
    backgroundColor: '#2196F3',
    display: 'flex',
    gap: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 20,
    elevation: 5,
  },
  headerTop: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBottom: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
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
  indicator: {
    height: 8,
    width: 8,
    backgroundColor: '#0BCE22',
    borderRadius: '50%',
  },
  deviceLabel: {
    fontSize: 15,
    color: '#fff',
  },
  deviceName: {
    fontWeight: 'bold',
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

export default DashboardScreen;
