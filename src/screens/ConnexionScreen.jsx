/* eslint-disable no-unused-vars */
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Alert,
  Animated,
  Easing 
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import WhiteButton from '../components/WhiteButton';
import { useBluetoothContext } from '../hooks/useBluetoothContext';

const ConnexionScreen = ({ navigation, route }) => {
  // ==================== Variables ==================== //
  const hasNotified = useRef(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionMessage, setConnectionMessage] = useState('Connexion en cours...');
  const [isConnecting, setIsConnecting] = useState(true);
  
  // Animation
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Récupération des paramètres de navigation
  const device = route?.params?.device;
  const onConnectionResult = route?.params?.onConnectionResult;

  // ==================== Hooks ==================== //
  // Hook Bluetooth
  const {
    connectToDevice,
    connectionStatus,
    isConnected,
    connectedDevice,
  } = useBluetoothContext();

  // ==================== Animations ==================== //
  // Animation de rotation continue
  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    if (isConnecting) {
      rotateAnimation.start();
      pulseAnimation.start();
    } else {
      rotateAnimation.stop();
      pulseAnimation.stop();
    }

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
    };
  }, [isConnecting, rotateValue, pulseValue]);

  // ==================== Fonctionnalité de Connexion ==================== //
  // Logique de connexion
  useEffect(() => {
    let connectionTimer;
    let timeoutTimer;

    const attemptConnection = async () => {
      if (!device) {
        Alert.alert('Erreur', 'Aucun appareil spécifié pour la connexion');
        navigation.goBack();
        return;
      }

      if (isConnected()) {
        console.log("Déjà connecté, on annule la tentative.");
        return;
      }

      const success = await connectToDevice(device);

      try {
        setConnectionMessage(`Tentative de connexion à ${device.name || device.address}...`);
        setConnectionAttempts(prev => prev + 1);
        
        if (success) {
          setConnectionMessage('Connexion réussie !');
          setIsConnecting(false);
          
          // Notifier le résultat si callback fourni
          if (onConnectionResult && !hasNotified.current) {
            hasNotified.current = true;
            onConnectionResult(true);
          }          

          // Délai avant redirection
          setTimeout(() => {
            navigation.replace('Dashboard');
          }, 1500);
        } else {
          throw new Error('Échec de la connexion');
        }
      } catch (error) {
        console.log('Erreur de connexion:', error);
        
        if (connectionAttempts < 2) {
          setConnectionMessage(`Échec de la tentative ${connectionAttempts}. Nouvelle tentative...`);
          // Réessayer après 2 secondes
          connectionTimer = setTimeout(attemptConnection, 2000);
        } else {
          setConnectionMessage('Connexion échouée');
          setIsConnecting(false);
          
          Alert.alert(
            'Connexion échouée',
            `Impossible de se connecter à ${device.name || device.address}. Veuillez vérifier que l'imprimante est allumée et à proximité.`,
            [
              {
                text: 'Réessayer',
                onPress: () => {
                  setConnectionAttempts(0);
                  setIsConnecting(true);
                  attemptConnection();
                }
              },
              {
                text: 'Annuler',
                onPress: () => {
                  if (onConnectionResult) {
                    onConnectionResult(false);
                  }
                  navigation.goBack();
                }
              }
            ]
          );
        }
      }
    };

    // ==================== Initialisation de connexion ==================== //
    // Démarrer la connexion si un device est fourni
    if (device && isConnecting) {
      // Délai initial pour l'effet visuel
      connectionTimer = setTimeout(attemptConnection, 1000);
    } else if (!device) {
      console.log("No device connected");
    }

    // Timeout global de sécurité (30 secondes)
    const globalTimeout = setTimeout(() => {
      if (isConnecting) {
        setConnectionMessage('Timeout de connexion');
        setIsConnecting(false);
        Alert.alert(
          'Timeout',
          'La connexion prend trop de temps. Veuillez réessayer.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onConnectionResult) {
                  onConnectionResult(false);
                }
                navigation.goBack();
              }
            }
          ]
        );
      }
    }, 30000);

    return () => {
      if (connectionTimer) clearTimeout(connectionTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      clearTimeout(globalTimeout);
    };
  }, [device, connectToDevice, navigation, onConnectionResult, connectionAttempts, isConnecting, isConnected]);

  // ==================== Détection de changements ==================== //
  // Surveiller les changements de statut de connexion
  useEffect(() => {
    if (isConnected() && connectedDevice && isConnecting) {
      setConnectionMessage('Connexion établie !');
      setIsConnecting(false);
      
      setTimeout(() => {
        if (onConnectionResult && !hasNotified.current) {
          hasNotified.current = true;
          onConnectionResult(true);
        }        
      }, 1500);
    }
  }, [isConnected, connectedDevice, onConnectionResult, isConnecting]);

  // ==================== Fonctionnalité de déconnexion ==================== //
  const cancelConnection = () => {
    Alert.alert(
      'Annuler la connexion',
      'Êtes-vous sûr de vouloir annuler la connexion ?',
      [
        {
          text: 'Non',
          style: 'cancel'
        },
        {
          text: 'Oui',
          onPress: () => {
            if (onConnectionResult) {
              onConnectionResult(false);
            }
            navigation.goBack();
          }
        }
      ]
    );
  };

  // Style d'animation
  const animatedStyle = {
    transform: [
      { scale: pulseValue }
    ],
  };

  // ==================== Rendu Principal ==================== //
  return (
    <View style={styles.container}>
      
      <Text style={styles.statutLabel}>
        {device ? (
          `Connexion à ${device.name || device.address}.`
        ) : (
          'Veuillez ne pas éteindre le bluetooth de l\'appareil ni celui de l\'imprimante.'
        )}
      </Text>

      {/* Affichage des tentatives */}
      {connectionAttempts > 0 && (
        <Text style={styles.attemptsText}>
          Tentative {connectionAttempts}/3
        </Text>
      )}

      {/* Animation de connexion */}
      <View style={styles.loadingAnimation}>
        <Animated.View style={[styles.blueDisk, animatedStyle]}>
          <View style={styles.whiteDisk}>
            <Image source={require('../assets/images/Printer.png')} />
          </View>
        </Animated.View>
      </View>

      {/* Statut de la connexion */}
      <Text style={styles.statusText}>
        {connectionStatus}
      </Text>

      <WhiteButton 
        text={isConnecting ? 'Annuler' : 'Retour'} 
        onPress={cancelConnection}
        isActive={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statutTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statutLabel: {
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  attemptsText: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    fontWeight: '500',
  },
  statusText: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingAnimation: {
    height: 320,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 160,
    backgroundColor: '#3F96E8',
  },
  blueDisk: {
    height: 280,
    width: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#79B5EF',
    borderRadius: 140,
  },
  whiteDisk: {
    height: 250,
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 125,
  },
});

export default ConnexionScreen;