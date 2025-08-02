// ==========================================
// Provider pour accéder aux données Bluetooth et les fournir via le contexte
// ==========================================

import React from 'react'
import { useBluetoothService } from '../hooks/useBluetoothService'
import BluetoothContext from '../context/BluetoothContext';

const BluetoothProvider = ({children}) => {
    const bluetooth = useBluetoothService();
  return (
    <BluetoothContext.Provider value={bluetooth}>
        {children}
    </BluetoothContext.Provider>
  )
}

export default BluetoothProvider