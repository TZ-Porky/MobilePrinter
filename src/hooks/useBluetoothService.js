// ==========================================
// Hook React pour utiliser le service
// ==========================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { bluetoothService } from '../services/BluetoothService';
import { logService } from '../services/LogService';

// ==========================================
// Hook React OPTIMISÉ
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
  
  // ==========================================
  // DIAGNOSTICS
  // ==========================================
  const runFullDiagnostic = async () => {
    return await bluetoothService.runFullDiagnostic();
  };
  
  const checkPrinterStatus = async () => {
    return await bluetoothService.checkPrinterStatus();
  };
  
  const checkPaperStatus = async () => {
    return await bluetoothService.checkPaperStatus();
  };
  
  const attemptPrinterRecovery = async () => {
    return await bluetoothService.attemptPrinterRecovery();
  };
  
  const forcePrintTest = async () => {
    return await bluetoothService.forcePrintTest();
  };
  
  const emergencyReset = async () => {
    return await bluetoothService.emergencyReset();
  };


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

  // Actions mémorisées
  const actions = useRef({
    initializeBluetooth: () => bluetoothService.initializeBluetooth(),
    loadPairedDevices: () => bluetoothService.loadPairedDevices(),
    connectToDevice: (device) => bluetoothService.connectToDevice(device),
    disconnect: () => bluetoothService.disconnect(),
    printText: (text, options) => bluetoothService.printText(text, options),
    feedPaper: () => bluetoothService.feedPaper(),
    clearLogs: () => logService.clearLogs(),
    isConnected: () => bluetoothService.isConnected(),
    isBluetoothEnabled: () => bluetoothService.isBluetoothEnabled(),
    
    // Actions de diagnostic
    runFullDiagnostic,
    checkPrinterStatus,
    checkPaperStatus,
    attemptPrinterRecovery,
    forcePrintTest,
    emergencyReset,
  });

  return {
    // État
    devices,
    connectedDevice,
    connectionStatus,
    deviceInfo,
    isScanning,
    logs,
    
    // Actions
    ...actions.current,
  };
};
