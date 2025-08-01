import { View, Text, StyleSheet, Image } from 'react-native'
import React, { useEffect } from 'react'
import WhiteButton from '../components/WhiteButton'

const ConnexionScreen = ({navigation}) => {

  useEffect(() =>{
    const timer = setTimeout(() => {
      if (navigation) {
        navigation.replace('Dashboard');
      }
    }, 2000);

    return () => clearTimeout(timer); 
  },[navigation])

  const cancelConnection = () => {
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.statutTitle}>Connexion en cours...</Text>
      <Text style={styles.statutLabel}>Veuillez à ne pas éteindre le bluetooth de l'appareil ni celui de l'imprimante.</Text>
      <View style={styles.loadingAnimation}>
        <View style={styles.blueDisk}>
          <View style={styles.whiteDisk}>
            <Image source={require('../assets/images/Printer.png')} />
          </View>
        </View>
      </View>
      <WhiteButton text={'Annuler'} onPress={cancelConnection}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    justifyContent: 'center',
    alignItems:'center',
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
  },
  loadingAnimation: {
    height: '320',
    width: '320',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:'50%',
    backgroundColor:'#3F96E8',
  },
  blueDisk: {
    height: '280',
    width: '280',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#79B5EF',
    borderRadius:'50%',
  },
  whiteDisk: {
    height: '250',
    width: '250',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#fff',
    borderRadius:'50%',
  }
})

export default ConnexionScreen