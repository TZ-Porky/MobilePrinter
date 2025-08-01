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
  TextInput,
  ActivityIndicator
} from 'react-native';
import React, { useState, useEffect } from 'react';
import DashboardScreenStyle from './DashboardScreenStyle';
import { useBluetoothService } from '../hooks/useBluetoothService';

const DashboardScreen = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Hook Bluetooth
  const {
    connectedDevice,
    connectionStatus,
    deviceInfo,
    disconnect,
    printText,
    feedPaper,
    isConnected,
  } = useBluetoothService();

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
            onPress: async () => {
              await disconnect();
              navigation.replace('Home');
            },
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
  }, [navigation, disconnect]);

  // Vérifie si l'appareil est encore connecté
  useEffect(() => {
    if (!isConnected()) {
      // Si plus connecté, retourner à l'accueil
      navigation.replace('Home');
    }
  }, [isConnected, navigation]);

  // Ouvre le menu
  const openMenu = () => {
    setIsVisible(true);
  };

  // Ferme le menu
  const closeMenu = () => {
    setIsVisible(false);
  };

  // Déconnecte de l'appareil
  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {
      const success = await disconnect();
      if (success) {
        Alert.alert('Info', 'Déconnecté de l\'imprimante', [
          { text: 'OK', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        Alert.alert('Erreur', 'Erreur lors de la déconnexion');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la déconnexion');
    } finally {
      setIsProcessing(false);
    }
  };

  // Imprime le texte saisi
  const handlePrintText = async () => {
    if (!customText.trim()) {
      Alert.alert('Attention', 'Veuillez saisir un texte à imprimer');
      return;
    }

    setIsProcessing(true);
    try {
      const success = await printText(customText);
      if (success) {
        Alert.alert('Succès', 'Texte imprimé avec succès!');
        setCustomText(''); // Vider le champ après impression
      } else {
        Alert.alert('Erreur', 'Erreur lors de l\'impression');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'impression');
    } finally {
      setIsProcessing(false);
    }
  };

  // Imprime le texte centré et en gras
  const handlePrintFormattedText = async () => {
    if (!customText.trim()) {
      Alert.alert('Attention', 'Veuillez saisir un texte à imprimer');
      return;
    }

    setIsProcessing(true);
    try {
      const success = await printText(customText, { 
        align: 'center', 
        bold: true, 
        size: 'large' 
      });
      if (success) {
        Alert.alert('Succès', 'Texte formaté imprimé avec succès!');
        setCustomText('');
      } else {
        Alert.alert('Erreur', 'Erreur lors de l\'impression');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'impression');
    } finally {
      setIsProcessing(false);
    }
  };

  // Imprime un ticket de test
  const handlePrintTestTicket = async () => {
    setIsProcessing(true);
    try {
      const ticketLines = [
        { text: 'TICKET DE TEST', options: { align: 'center', bold: true, size: 'large' }},
        { text: '================================', options: {} },
        { text: 'Date: ' + new Date().toLocaleDateString('fr-FR'), options: {} },
        { text: 'Heure: ' + new Date().toLocaleTimeString('fr-FR'), options: {} },
        { text: '--------------------------------', options: {} },
        { text: 'Article 1..................1000 FCFA', options: {} },
        { text: 'Article 2..................1550 FCFA', options: {} },
        { text: 'Article 3...................875 FCFA', options: {} },
        { text: '================================', options: {} },
        { text: 'TOTAL:....................3425 FCFA', options: { bold: true } },
        { text: '================================', options: {} },
        { text: 'Merci de votre visite!', options: { align: 'center' } },
        { text: 'À bientôt!', options: { align: 'center' } },
      ];

      for (const line of ticketLines) {
        const success = await printText(line.text, line.options);
        if (!success) {
          throw new Error('Erreur lors de l\'impression d\'une ligne');
        }
        // Petit délai entre chaque ligne
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Avancer le papier à la fin
      await feedPaper();
      Alert.alert('Succès', 'Ticket de test imprimé!');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'impression du ticket');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fait avancer le papier
  const handleFeedPaper = async () => {
    setIsProcessing(true);
    try {
      const success = await feedPaper();
      if (success) {
        Alert.alert('Info', 'Papier avancé');
      } else {
        Alert.alert('Erreur', 'Erreur lors de l\'avancement du papier');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'avancement du papier');
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigation vers scan QR (fonctionnalité future)
  const handleQRPrint = () => {
    Alert.alert('Info', 'Fonctionnalité à venir', [
      { text: 'OK', onPress: closeMenu }
    ]);
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
          <View style={[styles.indicator, { backgroundColor: isConnected() ? '#0BCE22' : '#F44336' }]} />
          <Text style={styles.deviceLabel}>
            {isConnected() ? (
              <>Connecté à <Text style={styles.deviceName}>
                {deviceInfo?.name || connectedDevice?.name || 'Appareil Bluetooth'}
              </Text></>
            ) : (
              <Text style={styles.deviceName}>Déconnecté</Text>
            )}
          </Text>
        </View>
      </View>

      {/* Corps */}
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {/* Champ de texte */}
          <TextInput
            style={DashboardScreenStyle.textInput}
            value={customText}
            onChangeText={setCustomText}
            placeholder="Texte à imprimer..."
            multiline
            editable={!isProcessing}
          />

          {/* Boutons d'impression de texte */}
          <View style={DashboardScreenStyle.buttonRow}>
            <TouchableOpacity
              style={[
                DashboardScreenStyle.actionButton,
                (isProcessing || !isConnected()) && styles.disabledButton
              ]}
              onPress={handlePrintText}
              disabled={isProcessing || !isConnected()}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={DashboardScreenStyle.actionButtonText}>
                  Imprimer le texte saisi
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                DashboardScreenStyle.actionButton,
                (isProcessing || !isConnected()) && styles.disabledButton
              ]}
              onPress={handlePrintFormattedText}
              disabled={isProcessing || !isConnected()}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={DashboardScreenStyle.actionButtonText}>
                  Imprimer le texte Centré et en Gras
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Boutons ticket et avancement papier */}
          <View style={DashboardScreenStyle.buttonRow}>
            <TouchableOpacity 
              style={[
                DashboardScreenStyle.ticketButton,
                (isProcessing || !isConnected()) && styles.disabledButton
              ]} 
              onPress={handlePrintTestTicket}
              disabled={isProcessing || !isConnected()}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={DashboardScreenStyle.ticketButtonText}>
                  Imprimer Ticket de Test
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                DashboardScreenStyle.feedButton,
                (isProcessing || !isConnected()) && styles.disabledButton
              ]} 
              onPress={handleFeedPaper}
              disabled={isProcessing || !isConnected()}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={DashboardScreenStyle.feedButtonText}>
                  Faire avancer le papier
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Statut de connexion */}
          {!isConnected() && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Imprimante déconnectée. Les fonctions d'impression sont désactivées.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Menu des options */}
      <Modal transparent={true} visible={isVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleDisconnect}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#F06317" />
              ) : (
                <Text style={{ color: '#F06317' }}>Déconnecter l'appareil</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleQRPrint}>
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
    height: 100,
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
    height: 33,
    width: 33,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
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
  section: {
    flex: 1,
  },

  // ==================== États ====================== //
  disabledButton: {
    opacity: 0.5,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
  },

  // ==================== Menu ====================== //
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    height: 200,
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