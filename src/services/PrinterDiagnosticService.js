// ==========================================
// PrinterDiagnostics.js - Diagnostic d'imprimante
// ==========================================

import { PRINTER_COMMANDS } from '../constants/PrinterCommands';
import { logService } from './LogService';

export class PrinterDiagnostics {
  constructor(bluetoothService) {
    this.bluetoothService = bluetoothService;
    this.lastStatusCheck = null;
    this.printerStatus = {
      isOnline: false,
      hasPaper: true,
      isReady: false,
      temperature: 'normal',
      lastResponse: null,
      errorCode: null,
      batteryLevel: null,
    };
  }

  // ==========================================
  // COMMANDES DE DIAGNOSTIC ÉTENDUES
  // ==========================================

  getExtendedCommands() {
    return {
      // Commandes de statut standard ESC/POS
      STATUS_PRINTER: '\x10\x04\x01',      // Statut imprimante
      STATUS_OFFLINE: '\x10\x04\x02',      // Statut offline
      STATUS_ERROR: '\x10\x04\x03',        // Statut erreur
      STATUS_PAPER: '\x10\x04\x04',        // Statut papier
      
      // Commandes alternatives chinoises
      STATUS_REAL_TIME: '\x1D\x72\x01',    // Statut temps réel
      STATUS_TRANSMIT: '\x1D\x72\x02',     // Transmission statut
      
      // Commandes de récupération
      SOFT_RESET: '\x1B\x40',              // Reset logiciel
      HARD_RESET: '\x1B\x3F\x0A\x00',      // Reset matériel
      CLEAR_BUFFER: '\x18',                 // Vider buffer
      
      // Commandes de réveil
      WAKE_UP: '\x1B\x3D\x01',             // Réveil imprimante
      INITIALIZE: '\x1B\x40\x1B\x74\x00',  // Init complète
      
      // Tests de communication
      ECHO_TEST: 'ECHO_TEST\n',            // Test écho
      PING: '\x05',                         // Ping
    };
  }

  // ==========================================
  // DIAGNOSTIC COMPLET
  // ==========================================

  async runFullDiagnostic() {
    logService.addLog('🔍 Démarrage diagnostic complet...', 'info');
    
    const device = this.bluetoothService.getConnectedDevice();
    if (!device) {
      logService.addLog('❌ Aucune imprimante connectée', 'error');
      return { success: false, error: 'No device connected' };
    }

    const results = {
      connection: false,
      communication: false,
      status: null,
      paperStatus: null,
      errorStatus: null,
      recovery: false,
      recommendations: [],
    };

    try {
      // 1. Test de connexion
      results.connection = await this.testConnection(device);
      
      // 2. Test de communication basique
      results.communication = await this.testBasicCommunication(device);
      
      // 3. Vérification du statut
      results.status = await this.checkPrinterStatus(device);
      
      // 4. Test du papier
      results.paperStatus = await this.checkPaperStatus(device);
      
      // 5. Vérification des erreurs
      results.errorStatus = await this.checkErrorStatus(device);
      
      // 6. Tentative de récupération si nécessaire
      if (!results.communication || results.errorStatus) {
        results.recovery = await this.attemptRecovery(device);
      }
      
      // 7. Générer des recommandations
      results.recommendations = this.generateRecommendations(results);
      
      logService.addLog('✅ Diagnostic terminé', 'success');
      return { success: true, results };
      
    } catch (error) {
      logService.addLog(`❌ Erreur diagnostic: ${error.message}`, 'error');
      return { success: false, error: error.message, results };
    }
  }

  // ==========================================
  // TESTS INDIVIDUELS
  // ==========================================

  async testConnection(device) {
    try {
      logService.addLog('🔗 Test connexion...', 'info');
      
      const isConnected = await device.isConnected();
      if (isConnected) {
        logService.addLog('✅ Connexion active', 'success');
        return true;
      } else {
        logService.addLog('❌ Connexion inactive', 'error');
        return false;
      }
    } catch (error) {
      logService.addLog(`❌ Erreur test connexion: ${error.message}`, 'error');
      return false;
    }
  }

  async testBasicCommunication(device) {
    try {
      logService.addLog('💬 Test communication basique...', 'info');
      
      const commands = this.getExtendedCommands();
      
      // Test avec différentes commandes
      const tests = [
        { name: 'ECHO', command: commands.ECHO_TEST },
        { name: 'PING', command: commands.PING },
        { name: 'INIT', command: commands.INITIALIZE },
      ];

      for (const test of tests) {
        try {
          await device.write(test.command);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Essayer de lire une réponse (si disponible)
          try {
            const response = await Promise.race([
              device.read(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), 1000)
              )
            ]);
            
            if (response) {
              logService.addLog(`✅ ${test.name}: Réponse reçue`, 'success');
              return true;
            }
          } catch (readError) {
            // Pas de réponse, mais pas forcément une erreur
            logService.addLog(`⚠️ ${test.name}: Envoyé, pas de réponse`, 'warning');
          }
          
        } catch (writeError) {
          logService.addLog(`❌ ${test.name}: Erreur envoi`, 'error');
        }
      }
      
      // Si on arrive ici, au moins l'envoi fonctionne
      return true;
      
    } catch (error) {
      logService.addLog(`❌ Communication échouée: ${error.message}`, 'error');
      return false;
    }
  }

  async checkPrinterStatus(device) {
    try {
      logService.addLog('📊 Vérification statut imprimante...', 'info');
      
      const commands = this.getExtendedCommands();
      
      const statusCommands = [
        { name: 'STATUS_PRINTER', command: commands.STATUS_PRINTER },
        { name: 'STATUS_REAL_TIME', command: commands.STATUS_REAL_TIME },
        { name: 'STATUS_TRANSMIT', command: commands.STATUS_TRANSMIT },
      ];

      for (const statusCmd of statusCommands) {
        try {
          await device.write(statusCmd.command);
          await new Promise(resolve => setTimeout(resolve, 300));
          
          try {
            const response = await Promise.race([
              device.read(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), 1500)
              )
            ]);
            
            if (response) {
              const status = this.parseStatusResponse(response);
              logService.addLog(`📊 ${statusCmd.name}: ${JSON.stringify(status)}`, 'info');
              return status;
            }
          } catch (readError) {
            logService.addLog(`⚠️ ${statusCmd.name}: Pas de réponse statut`, 'warning');
          }
          
        } catch (writeError) {
          logService.addLog(`❌ ${statusCmd.name}: Erreur envoi`, 'error');
        }
      }
      
      return null;
    } catch (error) {
      logService.addLog(`❌ Erreur statut: ${error.message}`, 'error');
      return null;
    }
  }

  async checkPaperStatus(device) {
    try {
      logService.addLog('📄 Vérification papier...', 'info');
      
      const commands = this.getExtendedCommands();
      await device.write(commands.STATUS_PAPER);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        const response = await Promise.race([
          device.read(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 1000)
          )
        ]);
        
        if (response) {
          const paperStatus = this.parsePaperStatus(response);
          logService.addLog(`📄 Statut papier: ${JSON.stringify(paperStatus)}`, 'info');
          return paperStatus;
        }
      } catch (readError) {
        logService.addLog('⚠️ Pas de réponse statut papier', 'warning');
      }
      
      return null;
    } catch (error) {
      logService.addLog(`❌ Erreur papier: ${error.message}`, 'error');
      return null;
    }
  }

  async checkErrorStatus(device) {
    try {
      logService.addLog('🚨 Vérification erreurs...', 'info');
      
      const commands = this.getExtendedCommands();
      await device.write(commands.STATUS_ERROR);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        const response = await Promise.race([
          device.read(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 1000)
          )
        ]);
        
        if (response) {
          const errorStatus = this.parseErrorStatus(response);
          logService.addLog(`🚨 Statut erreur: ${JSON.stringify(errorStatus)}`, 
                           errorStatus.hasError ? 'error' : 'success');
          return errorStatus;
        }
      } catch (readError) {
        logService.addLog('⚠️ Pas de réponse statut erreur', 'warning');
      }
      
      return null;
    } catch (error) {
      logService.addLog(`❌ Erreur vérification: ${error.message}`, 'error');
      return null;
    }
  }

  // ==========================================
  // RÉCUPÉRATION ET RÉPARATION
  // ==========================================

  async attemptRecovery(device) {
    try {
      logService.addLog('🔧 Tentative de récupération...', 'info');
      
      const commands = this.getExtendedCommands();
      const recoverySteps = [
        { name: 'Clear Buffer', command: commands.CLEAR_BUFFER },
        { name: 'Soft Reset', command: commands.SOFT_RESET },
        { name: 'Wake Up', command: commands.WAKE_UP },
        { name: 'Initialize', command: commands.INITIALIZE },
      ];

      for (const step of recoverySteps) {
        try {
          logService.addLog(`🔧 ${step.name}...`, 'info');
          await device.write(step.command);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Test basique après chaque étape
          const testSuccess = await this.quickCommunicationTest(device);
          if (testSuccess) {
            logService.addLog(`✅ Récupération réussie avec: ${step.name}`, 'success');
            return true;
          }
          
        } catch (stepError) {
          logService.addLog(`❌ ${step.name} échoué: ${stepError.message}`, 'error');
        }
      }
      
      logService.addLog('❌ Récupération échouée', 'error');
      return false;
      
    } catch (error) {
      logService.addLog(`❌ Erreur récupération: ${error.message}`, 'error');
      return false;
    }
  }

  async quickCommunicationTest(device) {
    try {
      await device.write(PRINTER_COMMANDS.INIT + 'TEST\n');
      await new Promise(resolve => setTimeout(resolve, 300));
      return true;
    } catch (error) {
      return false;
    }
  }

  // ==========================================
  // ANALYSEURS DE RÉPONSE
  // ==========================================

  parseStatusResponse(response) {
    if (!response) return null;
    
    // Convertir en bytes si c'est une string
    const bytes = typeof response === 'string' 
      ? Array.from(response).map(c => c.charCodeAt(0))
      : Array.from(response);
    
    if (bytes.length === 0) return null;
    
    const status = {
      raw: bytes,
      online: true,
      paper: true,
      error: false,
      temperature: 'normal',
    };
    
    // Analyse basique du premier byte (ESC/POS standard)
    if (bytes.length > 0) {
      const statusByte = bytes[0];
      status.online = (statusByte & 0x08) === 0;
      status.paper = (statusByte & 0x60) === 0;
      status.error = (statusByte & 0x40) !== 0;
    }
    
    return status;
  }

  parsePaperStatus(response) {
    if (!response) return null;
    
    const bytes = typeof response === 'string' 
      ? Array.from(response).map(c => c.charCodeAt(0))
      : Array.from(response);
    
    return {
      raw: bytes,
      hasPaper: bytes.length > 0 ? (bytes[0] & 0x60) === 0 : true,
      nearEnd: bytes.length > 0 ? (bytes[0] & 0x30) !== 0 : false,
    };
  }

  parseErrorStatus(response) {
    if (!response) return null;
    
    const bytes = typeof response === 'string' 
      ? Array.from(response).map(c => c.charCodeAt(0))
      : Array.from(response);
    
    return {
      raw: bytes,
      hasError: bytes.length > 0 ? (bytes[0] & 0x40) !== 0 : false,
      errorCode: bytes.length > 0 ? bytes[0] : null,
    };
  }

  // ==========================================
  // RECOMMANDATIONS
  // ==========================================

  generateRecommendations(results) {
    const recommendations = [];
    
    if (!results.connection) {
      recommendations.push({
        level: 'critical',
        message: 'Problème de connexion - Vérifiez que l\'imprimante est allumée et proche',
        action: 'Redémarrer l\'imprimante et reconnecter'
      });
    }
    
    if (!results.communication) {
      recommendations.push({
        level: 'error',
        message: 'Communication impossible - L\'imprimante ne répond pas',
        action: 'Essayer les commandes de récupération ou redémarrer l\'imprimante'
      });
    }
    
    if (results.paperStatus && !results.paperStatus.hasPaper) {
      recommendations.push({
        level: 'warning',
        message: 'Papier manquant ou mal inséré',
        action: 'Vérifier et réinsérer le papier correctement'
      });
    }
    
    if (results.errorStatus && results.errorStatus.hasError) {
      recommendations.push({
        level: 'error',
        message: `Erreur imprimante détectée (Code: ${results.errorStatus.errorCode})`,
        action: 'Redémarrer l\'imprimante et vérifier les composants'
      });
    }
    
    if (results.communication && results.status) {
      recommendations.push({
        level: 'success',
        message: 'Imprimante fonctionnelle',
        action: 'Aucune action requise'
      });
    }
    
    return recommendations;
  }

  // ==========================================
  // COMMANDES RAPIDES DE MAINTENANCE
  // ==========================================

  async forcePrintTest(device) {
    try {
      logService.addLog('🖨️ Test d\'impression forcé...', 'info');
      
      const testData = PRINTER_COMMANDS.INIT +
                      PRINTER_COMMANDS.ALIGN_CENTER +
                      PRINTER_COMMANDS.BOLD_ON +
                      'TEST DE DIAGNOSTIC\n' +
                      PRINTER_COMMANDS.BOLD_OFF +
                      PRINTER_COMMANDS.ALIGN_LEFT +
                      '================================\n' +
                      'Date: ' + new Date().toLocaleString('fr-FR') + '\n' +
                      'Statut: Communication OK\n' +
                      '================================\n' +
                      PRINTER_COMMANDS.FEED;
      
      await device.write(testData);
      logService.addLog('✅ Test d\'impression envoyé', 'success');
      return true;
      
    } catch (error) {
      logService.addLog(`❌ Test impression échoué: ${error.message}`, 'error');
      return false;
    }
  }

  async emergencyReset(device) {
    try {
      logService.addLog('🚨 Reset d\'urgence...', 'warning');
      
      const commands = this.getExtendedCommands();
      
      // Séquence de reset d'urgence
      await device.write(commands.CLEAR_BUFFER);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await device.write(commands.HARD_RESET);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await device.write(commands.INITIALIZE);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logService.addLog('✅ Reset d\'urgence terminé', 'success');
      return true;
      
    } catch (error) {
      logService.addLog(`❌ Reset échoué: ${error.message}`, 'error');
      return false;
    }
  }
}

export const createPrinterDiagnostics = (bluetoothService) => {
  return new PrinterDiagnostics(bluetoothService);
};