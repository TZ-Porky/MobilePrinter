import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useBluetoothService } from '../hooks/useBluetoothService';

const DiagnosticPanel = ({ visible, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const {
    isConnected,
    runFullDiagnostic,
    checkPrinterStatus,
    checkPaperStatus,
    attemptPrinterRecovery,
    forcePrintTest,
    emergencyReset,
    logs,
  } = useBluetoothService();

  useEffect(() => {
    if (visible && isConnected()) {
      // Exécuter un diagnostic rapide à l'ouverture
      handleQuickDiagnostic();
    }
  }, [visible, isConnected, handleQuickDiagnostic]);

  const handleFullDiagnostic = async () => {
    if (!isConnected()) {
      Alert.alert('Erreur', 'Aucune imprimante connectée');
      return;
    }

    setIsRunning(true);
    try {
      const result = await runFullDiagnostic();
      setDiagnosticResult(result);
      setLastUpdate(new Date());
      
      if (result.success) {
        Alert.alert('Diagnostic terminé', 'Consultez les résultats ci-dessous');
      } else {
        Alert.alert('Diagnostic incomplet', result.error || 'Erreur inconnue');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du diagnostic');
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuickDiagnostic = useCallback(async () => {
    if (!isConnected()) return;

    setIsRunning(true);
    try {
      const [status, paper] = await Promise.all([
        checkPrinterStatus(),
        checkPaperStatus(),
      ]);

      setDiagnosticResult({
        success: true,
        results: {
          connection: true,
          communication: status !== null,
          status,
          paperStatus: paper,
          recommendations: generateQuickRecommendations(status, paper),
        }
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur diagnostic rapide:', error);
    } finally {
      setIsRunning(false);
    }
  }, [checkPaperStatus, checkPrinterStatus, isConnected]);

  const generateQuickRecommendations = (status, paper) => {
    const recs = [];
    
    if (status === null) {
      recs.push({
        level: 'warning',
        message: 'Impossible de lire le statut de l\'imprimante',
        action: 'Essayer un diagnostic complet ou redémarrer l\'imprimante'
      });
    }
    
    if (paper === null) {
      recs.push({
        level: 'warning',
        message: 'Statut du papier non disponible',
        action: 'Vérifier manuellement le papier'
      });
    } else if (paper && !paper.hasPaper) {
      recs.push({
        level: 'error',
        message: 'Papier manquant ou mal inséré',
        action: 'Réinsérer le papier correctement'
      });
    }

    if (status && paper && paper.hasPaper) {
      recs.push({
        level: 'success',
        message: 'Imprimante semble fonctionnelle',
        action: 'Prête pour l\'impression'
      });
    }
    
    return recs;
  };

  const handleRecovery = async () => {
    Alert.alert(
      'Récupération d\'imprimante',
      'Cette action va tenter de réparer les problèmes de communication. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Récupérer', onPress: async () => {
          setIsRunning(true);
          try {
            const success = await attemptPrinterRecovery();
            if (success) {
              Alert.alert('Succès', 'La récupération a réussi. Ré-essayez l\'impression.');
            } else {
              Alert.alert('Échec', 'La récupération a échoué. Essayez le reset d\'urgence.');
            }
          } catch (error) {
            Alert.alert('Erreur', 'Erreur lors de la tentative de récupération');
          } finally {
            setIsRunning(false);
          }
        }},
      ],
      { cancelable: true }
    );
  };
  
  const handleEmergencyReset = async () => {
    Alert.alert(
      'Reset d\'urgence',
      'Ceci est un reset agressif. Il peut résoudre des problèmes majeurs mais doit être utilisé avec prudence. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Reset', onPress: async () => {
          setIsRunning(true);
          try {
            const success = await emergencyReset();
            if (success) {
              Alert.alert('Succès', 'Reset d\'urgence réussi. Ré-essayez l\'impression.');
            } else {
              Alert.alert('Échec', 'Le reset d\'urgence a échoué.');
            }
          } catch (error) {
            Alert.alert('Erreur', 'Erreur lors du reset d\'urgence');
          } finally {
            setIsRunning(false);
          }
        }},
      ],
      { cancelable: true }
    );
  };

  const handlePrintTest = async () => {
    Alert.alert(
      'Test d\'impression forcé',
      'Un test d\'impression sera envoyé directement. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Imprimer', onPress: async () => {
          setIsRunning(true);
          try {
            const success = await forcePrintTest();
            if (success) {
              Alert.alert('Succès', 'Test d\'impression envoyé.');
            } else {
              Alert.alert('Échec', 'Le test d\'impression a échoué.');
            }
          } catch (error) {
            Alert.alert('Erreur', 'Erreur lors de l\'impression de test');
          } finally {
            setIsRunning(false);
          }
        }},
      ],
      { cancelable: true }
    );
  };

  const renderRecommendation = (rec, index) => {
    const icon = rec.level === 'success' ? '✅' :
                 rec.level === 'warning' ? '⚠️' :
                 rec.level === 'error' ? '❌' : 'ℹ️';

    const style = rec.level === 'success' ? styles.recSuccess :
                  rec.level === 'warning' ? styles.recWarning :
                  rec.level === 'error' ? styles.recError : styles.recInfo;

    return (
      <View key={index} style={[styles.recommendation, style]}>
        <Text style={styles.recIcon}>{icon}</Text>
        <View style={styles.recContent}>
          <Text style={styles.recMessage}>{rec.message}</Text>
          <Text style={styles.recAction}>{rec.action}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Diagnostique de l'imprimante</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>État de la connexion</Text>
          <Text style={styles.statusText}>
            {isConnected() ? (
              <Text style={styles.connectedText}>✅ Connecté</Text>
            ) : (
              <Text style={styles.disconnectedText}>❌ Déconnecté</Text>
            )}
          </Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFullDiagnostic}
            disabled={isRunning || !isConnected()}
          >
            {isRunning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Diagnostic Complet</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {diagnosticResult && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              Résultats du dernier diagnostic ({lastUpdate.toLocaleTimeString('fr-FR')})
            </Text>
            {diagnosticResult.results.recommendations.map(renderRecommendation)}
            
            {/* Boutons d'action basés sur les résultats */}
            <View style={styles.recoveryButtons}>
              {diagnosticResult.results.communication === false && (
                <TouchableOpacity style={styles.recoveryButton} onPress={handleRecovery} disabled={isRunning}>
                  <Text style={styles.recoveryButtonText}>Tenter Récupération</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyReset} disabled={isRunning}>
                <Text style={styles.emergencyButtonText}>Reset d'urgence</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.testPrintButton} onPress={handlePrintTest} disabled={isRunning}>
                <Text style={styles.testPrintButtonText}>Test d'impression</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.logsContainer}>
          <Text style={styles.logsTitle}>Logs</Text>
          <ScrollView style={styles.logsList}>
            {logs.slice().reverse().map((log, index) => {
              const logStyle = log.type === 'success' ? styles.logSuccess :
                               log.type === 'error' ? styles.logError :
                               log.type === 'warning' ? styles.logWarning : styles.logInfo;
              
              const logIcon = log.type === 'success' ? '✅' :
                              log.type === 'error' ? '❌' :
                              log.type === 'warning' ? '⚠️' : 'ℹ️';

              return (
                <View key={index} style={[styles.logItem, logStyle]}>
                  <Text style={styles.logText}>
                    <Text style={{ fontWeight: 'bold' }}>{logIcon} {log.timestamp}:</Text> {log.message}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  connectedText: {
    color: '#4CAF50',
  },
  disconnectedText: {
    color: '#F44336',
  },
  actionSection: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#007BFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recommendation: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  recSuccess: {
    backgroundColor: '#e8f5e9',
    borderLeftColor: '#4CAF50',
  },
  recWarning: {
    backgroundColor: '#fffde7',
    borderLeftColor: '#FFC107',
  },
  recError: {
    backgroundColor: '#ffebee',
    borderLeftColor: '#F44336',
  },
  recInfo: {
    backgroundColor: '#e3f2fd',
    borderLeftColor: '#2196F3',
  },
  recIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  recContent: {
    flex: 1,
  },
  recMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  recAction: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  recoveryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  recoveryButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  recoveryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emergencyButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  testPrintButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  testPrintButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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

export default DiagnosticPanel;
