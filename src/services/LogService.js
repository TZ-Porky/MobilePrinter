// ==========================================
// LogService.js - VERSION CORRIGÉE
// ==========================================

class LogService {
  constructor() {
    this.logs = [];
    this.listeners = [];
    this.maxLogs = 50;
  }

  addLog(message, type = 'info') {
    // Éviter les doublons récents (même message dans les 2 dernières secondes)
    const now = Date.now();
    const recentLog = this.logs.find(log => 
      log.message === message && 
      log.type === type && 
      (now - new Date(log.timestamp).getTime()) < 2000
    );
    
    if (recentLog) {
      return recentLog; // Ne pas ajouter le doublon
    }

    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const newLog = {
      id: now, // Utiliser timestamp comme ID unique
      timestamp,
      message,
      type,
    };

    this.logs = [newLog, ...this.logs.slice(0, this.maxLogs - 1)];
    
    // Notifier les listeners de manière throttled
    this.notifyListeners();
    
    return newLog;
  }

  notifyListeners() {
    // Throttle les notifications pour éviter les updates trop fréquents
    if (!this.notifyTimeout) {
      this.notifyTimeout = setTimeout(() => {
        this.listeners.forEach(listener => {
          try {
            listener([...this.logs]); // Copie pour éviter les mutations
          } catch (error) {
            console.error('Erreur dans listener de log:', error);
          }
        });
        this.notifyTimeout = null;
      }, 100); // Délai de 100ms entre les notifications
    }
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      console.error('Le listener doit être une fonction');
      return () => {};
    }

    this.listeners.push(listener);
    
    // Envoyer immédiatement les logs actuels
    setTimeout(() => {
      try {
        listener([...this.logs]);
      } catch (error) {
        console.error('Erreur lors de l\'envoi initial des logs:', error);
      }
    }, 0);
    
    // Retourner une fonction de désabonnement
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getLogs() {
    return [...this.logs]; // Retourner une copie
  }

  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }
}

export const logService = new LogService();
