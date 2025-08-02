/* eslint-disable react-native/no-inline-styles */
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import React from 'react';

const BottomModal = ({ isVisible = false, onClose, options = [] }) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <View
            style={styles.menuContainer}
            onStartShouldSetResponder={() => true}
          >
            {options.map((option, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={() => {
                option.onPress();
            }}>
                {option.icon && option.icon}
                <Text style={styles.menuItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.menuItem} onPress={onClose}>
              <Text style={[styles.menuItemText, {color: 'red'}]}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ==================== Overlay ====================== //
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  // ==================== Container ====================== //
  modalContainer: {
    justifyContent: 'flex-end',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    backgroundColor: '#fff',
    padding: 15,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingBottom: 30,
  },
  // ==================== Item ====================== //
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  }
});

export default BottomModal;
