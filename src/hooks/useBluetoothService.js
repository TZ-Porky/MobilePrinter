// ==========================================
// Hook React pour utiliser le service Bluetooth
// Version mise à jour avec support QR Code
// ==========================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { bluetoothService } from '../services/BluetoothService';
import { logService } from '../services/LogService';

// ==========================================
// Hook React OPTIMISÉ avec QR Code
// ==========================================

export const useBluetoothService = () => {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Déconnecté');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // Refs pour éviter les re-créations inutiles
  const unsubscribesRef = useRef([]);

  // Callbacks mémorisés pour éviter les re-renders
  const handleDevicesChange = useCallback((newDevices) => {
    setDevices(newDevices);
  }, []);

  const handleConnectionChange = useCallback((device) => {
    setConnectedDevice(device);
  }, []);

  const handleStatusChange = useCallback((status) => {
    setConnectionStatus(status);
  }, []);

  const handleDeviceInfoChange = useCallback((info) => {
    setDeviceInfo(info);
  }, []);

  const handleScanningChange = useCallback((scanning) => {
    setIsScanning(scanning);
  }, []);

  const handleLogsChange = useCallback((newLogs) => {
    setLogs(newLogs);
  }, []);
  
  // ==================== FONCTIONS D'IMPRESSION ====================== //
  
  // Impression de texte
  const printText = useCallback(async (text, options = {}) => {
    return await bluetoothService.printText(text, options);
  }, []);

  // Impression de QR Code - NOUVELLE FONCTION
  const printQRCode = useCallback(async (data, options = {}) => {
    return await bluetoothService.printQRCode(data, options);
  }, []);

  // Avance du papier
  const feedPaper = useCallback(async () => {
    return await bluetoothService.feedPaper();
  }, []);

  // ==================== GESTION DES APPAREILS ====================== //
  
  // Initialisation du Bluetooth
  const initializeBluetooth = useCallback(async () => {
    return await bluetoothService.initializeBluetooth();
  }, []);

  // Chargement des appareils appairés
  const loadPairedDevices = useCallback(async () => {
    return await bluetoothService.loadPairedDevices();
  }, []);

  // Connexion à un appareil
  const connectToDevice = useCallback(async (device) => {
    return await bluetoothService.connectToDevice(device);
  }, []);

  // Déconnexion
  const disconnect = useCallback(async () => {
    return await bluetoothService.disconnect();
  }, []);

  // ==================== FONCTIONS D'ÉTAT ====================== //
  
  // Vérifier si connecté
  const isConnected = useCallback(() => {
    return bluetoothService.isConnected();
  }, []);

  // Vérifier si Bluetooth activé
  const isBluetoothEnabled = useCallback(() => {
    return bluetoothService.isBluetoothEnabled();
  }, []);

  // ==================== GESTION DES LOGS ====================== //
  
  // Nettoyer les logs
  const clearLogs = useCallback(() => {
    return logService.clearLogs();
  }, []);

  // ==================== DIAGNOSTICS ====================== //
  
  const runFullDiagnostic = useCallback(async () => {
    return await bluetoothService.runFullDiagnostic();
  }, []);
  
  const checkPrinterStatus = useCallback(async () => {
    return await bluetoothService.checkPrinterStatus();
  }, []);
  
  const checkPaperStatus = useCallback(async () => {
    return await bluetoothService.checkPaperStatus();
  }, []);
  
  const attemptPrinterRecovery = useCallback(async () => {
    return await bluetoothService.attemptPrinterRecovery();
  }, []);
  
  const forcePrintTest = useCallback(async () => {
    return await bluetoothService.forcePrintTest();
  }, []);
  
  const emergencyReset = useCallback(async () => {
    return await bluetoothService.emergencyReset();
  }, []);

  // ==================== EFFET D'INITIALISATION ====================== //

  useEffect(() => {
    // S'abonner aux services au montage
    const unsubscribes = [
      bluetoothService.subscribe('devices', handleDevicesChange),
      bluetoothService.subscribe('connection', handleConnectionChange),
      bluetoothService.subscribe('status', handleStatusChange),
      bluetoothService.subscribe('deviceInfo', handleDeviceInfoChange),
      bluetoothService.subscribe('scanning', handleScanningChange),
      logService.subscribe(handleLogsChange),
    ];

    unsubscribesRef.current = unsubscribes;

    // Initialisation et chargement des appareils au démarrage de l'application
    const initialize = async () => {
      const success = await bluetoothService.initializeBluetooth();
      if (success) {
        await bluetoothService.loadPairedDevices();
      }
    };
    initialize();

    // Initialiser les données actuelles
    setDevices(bluetoothService.getDevices());
    setConnectedDevice(bluetoothService.getConnectedDevice());
    setConnectionStatus(bluetoothService.getConnectionStatus());
    setDeviceInfo(bluetoothService.getDeviceInfo());
    setIsScanning(bluetoothService.getScanningStatus());
    setLogs(logService.getLogs());

    return () => {
      unsubscribesRef.current.forEach(unsubscribe => unsubscribe());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== RETURN DU HOOK ====================== //

  return {
    // État
    devices,
    connectedDevice,
    connectionStatus,
    deviceInfo,
    isScanning,
    logs,
    
    // Actions d'impression
    printText,
    printQRCode,        // ← NOUVELLE FONCTION AJOUTÉE
    feedPaper,
    
    // Actions Bluetooth
    initializeBluetooth,
    loadPairedDevices,
    connectToDevice,
    disconnect,
    
    // État et vérifications
    isConnected,
    isBluetoothEnabled,
    
    // Gestion des logs
    clearLogs,
    
    // Actions de diagnostic
    runFullDiagnostic,
    checkPrinterStatus,
    checkPaperStatus,
    attemptPrinterRecovery,
    forcePrintTest,
    emergencyReset,
  };
};