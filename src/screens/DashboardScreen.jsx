/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  BackHandler,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import DashboardScreenStyle from './DashboardScreenStyle';
import BottomModal from '../components/BottomModal';
import { useBluetoothContext } from '../hooks/useBluetoothContext';

const DashboardScreen = ({ navigation }) => {
  // ==================== Variables ==================== //
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [customText, setCustomText] = useState('Bonjour React Native');
  const [isProcessing, setIsProcessing] = useState(false);

  // ==================== Hooks ==================== //
  // Hook Bluetooth
  const {
    connectedDevice,
    deviceInfo,
    disconnect,
    printText,
    feedPaper,
    isConnected,
  } = useBluetoothContext();

  // ==================== Retour Physique ==================== //
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

  // ==================== Surveillance de la déconnexion ==================== //
  useEffect(() => {
    let connectionCheckInterval;

    const checkConnection = async () => {
      try {
        if (connectedDevice) {
          // Tenter de vérifier si l'appareil est toujours connecté
          const stillConnected = await connectedDevice.isConnected();

          if (!stillConnected) {
            console.log('Connexion perdue détectée');
            // Forcer la déconnexion dans le service
            await disconnect();

            Alert.alert(
              'Connexion perdue',
              "L'imprimante a été déconnectée.",
              [
                {
                  text: 'OK',
                  onPress: () => navigation.replace('Home'),
                },
              ],
            );
          }
        } else if (!isConnected()) {
          // Si plus de device connecté du tout
          navigation.replace('Home');
        }
      } catch (error) {
        console.log('Erreur lors de la vérification de connexion:', error);
        // En cas d'erreur, considérer comme déconnecté
        await disconnect();
        Alert.alert(
          'Connexion perdue',
          "Impossible de communiquer avec l'imprimante.",
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Home'),
            },
          ],
        );
      }
    };

    // Vérifier toutes les 3 secondes
    connectionCheckInterval = setInterval(checkConnection, 3000);

    return () => {
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    };
  }, [connectedDevice, isConnected, navigation, disconnect]);

  // ==================== Fonctionnalités du menu ==================== //
  // Ouvre le menu
  const openMenu = () => {
    setIsMenuVisible(true);
  };

  // Ferme le menu
  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  // Déconnecte de l'appareil
  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {

      // Tenter la déconnexion normale
      await disconnect();

      // Même en cas d'échec de la déconnexion, forcer le retour à l'accueil
      Alert.alert('Info', "Déconnecté de l'imprimante", [
        { text: 'OK', onPress: () => navigation.replace('Home') },
      ]);

    } catch (error) {
      console.log('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, forcer le retour à l'accueil
      Alert.alert('Info', 'Déconnexion forcée - Retour à l\'accueil', [
        { text: 'OK', onPress: () => navigation.replace('Home') }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigation vers scan QR (fonctionnalité future)
  const handleQRPrint = () => {
    navigation.navigate('CodePrint');
    setIsMenuVisible(false);
  };

  // Déconnexion d'urgence (bouton de secours)
  const handleEmergencyDisconnect = () => {
    Alert.alert(
      'Déconnexion forcée',
      'Forcer la déconnexion et retourner à l\'accueil ? Utilisez ceci si l\'imprimante ne répond plus.',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Forcer',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              // Nettoyer l'état de connexion
              await disconnect();
            } catch (error) {
              console.log('Erreur lors de la déconnexion forcée:', error);
            } finally {
              setIsProcessing(false);
              navigation.replace('Home');
            }
          }
        }
      ]
    );
  };

  // Menu des options
  const menuOptions = [
    {
      label: "Déconnecter l'imprimante " + connectedDevice?.name,
      onPress: handleDisconnect,
    },
    { label: 'Imprimer un Code QR', onPress: handleQRPrint },
    {
      label: "Dépanner l'imprimante",
      onPress: () =>
        Alert.alert('Comming Next Udpate', "En attente d'implémentation"),
    },
    { label: 'Déconnexion (Urgence)', onPress: handleEmergencyDisconnect },
  ];

  // ==================== Fonctionnalités de l'imprimante ==================== //
  // Imprime le texte saisi
  const handlePrintText = async () => {
    if (!customText.trim()) {
      Alert.alert('Attention', 'Veuillez saisir un texte à imprimer');
      return;
    }

    if (!isConnected()) {
      Alert.alert(
        'Déconnecté',
        "Aucune connection a l'imprimante n'a été détectée.",
      );
      return;
    }

    setIsProcessing(true);
    try {
      const success = await printText(customText);
      if (success) {
        Alert.alert('Succès', 'Texte imprimé avec succès!');
      } else {
        Alert.alert('Erreur', "Erreur lors de l'impression");
      }
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de l'impression");
    } finally {
      setIsProcessing(false);
    }
  };

  // == Imprime le texte centré et en gras ==
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
        size: 'large',
      });
      if (success) {
        Alert.alert('Succès', 'Texte formaté imprimé avec succès!');
        setCustomText('');
      } else {
        Alert.alert('Erreur', "Erreur lors de l'impression");
      }
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de l'impression");
    } finally {
      setIsProcessing(false);
    }
  };

  // == Imprime un ticket de test ==
  const handlePrintTestTicket = async () => {
    setIsProcessing(true);
    try {
      const ticketLines = [
        {
          text: 'TICKET DE TEST',
          options: { align: 'center', bold: true, size: 'large' },
        },
        { text: '================================', options: {} },
        {
          text: 'Date: ' + new Date().toLocaleDateString('fr-FR'),
          options: {},
        },
        {
          text: 'Heure: ' + new Date().toLocaleTimeString('fr-FR'),
          options: {},
        },
        { text: '--------------------------------', options: {} },
        { text: 'Article 1..................1000 FCFA', options: {} },
        { text: 'Article 2..................1550 FCFA', options: {} },
        { text: 'Article 3...................875 FCFA', options: {} },
        { text: '================================', options: {} },
        {
          text: 'TOTAL:....................3425 FCFA',
          options: { bold: true },
        },
        { text: '================================', options: {} },
        { text: 'Merci de votre visite!', options: { align: 'center' } },
        { text: 'À bientôt!', options: { align: 'center' } },
      ];

      for (const line of ticketLines) {
        const success = await printText(line.text, line.options);
        if (!success) {
          throw new Error("Erreur lors de l'impression d'une ligne");
        }
        // Petit délai entre chaque ligne
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await feedPaper();
      Alert.alert('Succès', 'Ticket de test imprimé!');
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de l'impression du ticket");
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
        Alert.alert('Erreur', "Erreur lors de l'avancement du papier");
      }
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de l'avancement du papier");
    } finally {
      setIsProcessing(false);
    }
  };

  // ==================== Rendu principal ==================== //
  return (
    <View style={DashboardScreenStyle.container}>
      {/* En-tête */}
      <View style={DashboardScreenStyle.headerBar}>
        <View style={DashboardScreenStyle.headerTop}>
          <View style={DashboardScreenStyle.logo}>
            <Image
              source={require('../assets/images/Logo.png')}
              style={DashboardScreenStyle.logoImage}
            />
            <Text style={DashboardScreenStyle.logoText}>
              MOBILE{'\n'}PRINTER
            </Text>
          </View>
          <TouchableOpacity onPress={openMenu}>
            <Image source={require('../assets/images/Settings.png')} />
          </TouchableOpacity>
        </View>

        <View style={DashboardScreenStyle.headerBottom}>
          {/* Statut de l'appareil */}
          <View
            style={[
              DashboardScreenStyle.indicator,
              { backgroundColor: isConnected() ? '#0BCE22' : '#F44336' },
            ]}
          />
          <Text style={DashboardScreenStyle.deviceLabel}>
            {isConnected() ? (
              <>
                Connecté à{' '}
                <Text style={DashboardScreenStyle.deviceName}>
                  {deviceInfo?.name ||
                    connectedDevice?.name ||
                    'Appareil Bluetooth'}
                </Text>
              </>
            ) : (
              <Text style={DashboardScreenStyle.deviceName}>Déconnecté</Text>
            )}
          </Text>
        </View>
      </View>

      {/* Corps */}
      <ScrollView style={DashboardScreenStyle.content}>
        <View style={DashboardScreenStyle.section}>
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
                (isProcessing || !isConnected()) &&
                  DashboardScreenStyle.disabledButton,
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
                (isProcessing || !isConnected()) &&
                  DashboardScreenStyle.disabledButton,
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
                (isProcessing || !isConnected()) &&
                  DashboardScreenStyle.disabledButton,
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
                (isProcessing || !isConnected()) &&
                  DashboardScreenStyle.disabledButton,
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
            <View style={DashboardScreenStyle.warningContainer}>
              <Text style={DashboardScreenStyle.warningText}>
                ⚠️ Imprimante déconnectée. Les fonctions d'impression sont
                désactivées.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Menu des options */}
      <BottomModal
        isVisible={isMenuVisible}
        onClose={closeMenu}
        options={menuOptions}
      />
    </View>
  );
};

export default DashboardScreen;
