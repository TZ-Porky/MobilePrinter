import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import BluetoothProvider from './src/providers/BluetoothProvider';

const App = () => {
  return (
    <BluetoothProvider>
      <AppNavigator />
    </BluetoothProvider>
  )
}

export default App