import { StyleSheet } from 'react-native';

const DashboardScreenStyle = StyleSheet.create({
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
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
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
  connectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: '500',
  },
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
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

export default DashboardScreenStyle;
