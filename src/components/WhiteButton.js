import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';

const WhiteButton = ({ text, isActive = true, onPress }) => {
  return (
    <TouchableOpacity
      style={isActive ? styles.buttonActive : styles.buttonInactive}
      onPress={onPress}
    >
      <Text style={styles.buttonLabel}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonActive: {
    height: '50',
    width: '90%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  buttonInactive: {
    height: '50',
    width: '90%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#A1A1A1',
    borderRadius: 5,
  },
  buttonLabel: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default WhiteButton;
