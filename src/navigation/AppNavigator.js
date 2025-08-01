// Importations
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Ecrans
import ConnexionScreen from '../screens/ConnexionScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import PreviewScreen from '../screens/PreviewScreen';
import SplashScreen from '../screens/SplashScreen';
import QRCodePrintScreen from '../screens/QRCodePrintScreen';

// Pile
const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ animation:'fade' }} />
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Preview" component={PreviewScreen}/>
        <Stack.Screen name="Connexion" component={ConnexionScreen}/>
        <Stack.Screen name="CodePrint" component={QRCodePrintScreen} options={{ animation:'slide_from_right' }}/>
        <Stack.Screen name="Dashboard" component={DashboardScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
