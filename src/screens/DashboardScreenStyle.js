import { StyleSheet } from 'react-native';

const DashboardScreenStyle = StyleSheet.create({
  // ======================= Style par défaut =========================== //
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  // ======================= Bouton d'actualisation =========================== //
  refreshButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },

  // ======================= Bouton de Nettoyage =========================== //
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '500',
  },

  // ======================= Liste des appareils =========================== //
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  deviceType: {
    fontSize: 12,
    color: '#999',
  },

  // ======================= Bouton de déconnexion =========================== //
  disconnectButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },

  // ======================= Champs de saisie =========================== //
  textInput: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },

  // ======================= Bouton d'action =========================== //
  actionButton: {
    flex: 0.48,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // ======================= Bouton du ticket =========================== //
  ticketButton: {
    flex: 0.48,
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  ticketButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // ======================= Bouton de Feed =========================== //
  feedButton: {
    flex: 0.48,
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // ======================= Bouton d'information du texte =========================== //
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'monospace',
  },

  // ======================= Style Défini =========================== //
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  // ==================== En tête ====================== //
  headerBar: {
    height: 100,
    backgroundColor: '#2196F3',
    display: 'flex',
    gap: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 20,
    elevation: 5,
  },
  headerTop: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBottom: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  // ==================== Logo ====================== //
  logo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  logoImage: {
    height: 33,
    width: 33,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },
  deviceLabel: {
    fontSize: 15,
    color: '#fff',
  },
  deviceName: {
    fontWeight: 'bold',
  },

  // ==================== Corps ====================== //
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    flex: 1,
  },

  // ==================== États ====================== //
  disabledButton: {
    opacity: 0.5,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
  },

});

export default DashboardScreenStyle;
