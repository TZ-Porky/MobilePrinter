import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useBluetoothContext } from '../hooks/useBluetoothContext';

const QRCodePrintScreen = ({ navigation }) => {
  // ==================== Variables ====================== //
  const [qrData, setQrData] = useState('');
  const [qrSize, setQrSize] = useState('200');
  const [errorCorrection, setErrorCorrection] = useState('M'); // Niveau de correction d'erreur (L, M, Q, H)
  const [isProcessing, setIsProcessing] = useState(false);
  const qrRef = useRef(null);

  const { printText, isConnected, printQRCode } = useBluetoothContext();

  // ==================== Données Prédéfinies ====================== //
  // Types de données prédéfinies
  const dataTemplates = [
    { label: 'URL', placeholder: 'https://example.com', prefix: '' },
    { label: 'Email', placeholder: 'email@example.com', prefix: 'mailto:' },
    { label: 'Téléphone', placeholder: '+237123456789', prefix: 'tel:' },
    { label: 'SMS', placeholder: '+237123456789', prefix: 'sms:' },
    {
      label: 'WiFi',
      placeholder: 'SSID;PASSWORD;WPA',
      prefix: 'WIFI:T:WPA;S:',
    },
    { label: 'Texte simple', placeholder: 'Votre texte ici', prefix: '' },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState(dataTemplates[0]);

  // ==================== Fonctionnalités du QRCode ====================== //
  // Génère les données QR selon le template sélectionné
  const generateQRData = () => {
    if (!qrData.trim()) return '';

    if (selectedTemplate.label === 'WiFi') {
      // Format WiFi: WIFI:T:WPA;S:SSID;P:PASSWORD;;
      const parts = qrData.split(';');
      if (parts.length >= 2) {
        return `WIFI:T:WPA;S:${parts[0]};P:${parts[1]};;`;
      }
      return qrData;
    }

    return selectedTemplate.prefix + qrData;
  };

  // Convertit le QR code en données imprimables
  const HandlePrintQRCode = async () => {
    if (!qrData.trim()) {
      Alert.alert('Attention', 'Veuillez saisir des données pour le QR code');
      return;
    }

    if (!isConnected()) {
      Alert.alert('Erreur', 'Aucune imprimante connectée');
      return;
    }

    setIsProcessing(true);

    try {
      const success = await printQRCode(qrData, {
        size: qrSize,
        errorCorrection: errorCorrection,
        align: 'center', // Vous pouvez choisir 'left', 'center', 'right'
      });
      if (success) {
        Alert.alert('Succès', "Code QR envoyé à l'imprimante.");
      } else {
        Alert.alert('Erreur', "Échec de l'impression du code QR.");
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression du QR Code:', error);
      Alert.alert('Erreur', `Une erreur est survenue lors de l'impression: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Imprime le QR code avec les informations
  const printQRCodeData = async base64Data => {
    try {
      const qrCodeData = generateQRData();

      // Impression du header
      await printText('QR CODE', {
        align: 'center',
        bold: true,
        size: 'large',
      });
      await printText('================================', {});

      // Impression du type de données
      await printText(`Type: ${selectedTemplate.label}`, {});

      // Impression des données
      if (qrCodeData.length > 30) {
        // Si les données sont longues, les couper en plusieurs lignes
        const chunks = qrCodeData.match(/.{1,30}/g) || [];
        await printText('Données:', {});
        for (const chunk of chunks) {
          await printText(chunk, {});
        }
      } else {
        await printText(`Données: ${qrCodeData}`, {});
      }

      await printText('--------------------------------', {});

      // Note: Pour imprimer l'image QR code réelle, vous auriez besoin
      // d'une fonction spéciale dans votre service Bluetooth qui peut
      // traiter les images. Pour l'instant, on imprime juste un placeholder.
      await printText('[QR CODE IMAGE]', { align: 'center' });
      await printText('(Taille: ' + qrSize + 'px)', { align: 'center' });

      await printText('--------------------------------', {});
      await printText('Scannez ce code avec votre', { align: 'center' });
      await printText('application QR préférée', { align: 'center' });
      await printText('================================', {});

      // Avancer le papier
      await new Promise(resolve => setTimeout(resolve, 500));

      Alert.alert('Succès', 'QR Code imprimé avec succès!');
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de l'impression du QR code");
    } finally {
      setIsProcessing(false);
    }
  };

  // Imprime seulement les informations du QR code (sans l'image)
  const printQRInfo = async () => {
    if (!qrData.trim()) {
      Alert.alert('Attention', 'Veuillez saisir des données pour le QR code');
      return;
    }

    setIsProcessing(true);
    await printQRCodeData(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Impression QR Code</Text>
      </View>

      <View style={styles.content}>
        {/* Sélection du type de données */}
        <Text style={styles.sectionTitle}>Type de données :</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.templateContainer}
        >
          {dataTemplates.map((template, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.templateButton,
                selectedTemplate.label === template.label &&
                  styles.selectedTemplate,
              ]}
              onPress={() => {
                setSelectedTemplate(template);
                setQrData(''); // Reset data when changing template
              }}
            >
              <Text
                style={[
                  styles.templateText,
                  selectedTemplate.label === template.label &&
                    styles.selectedTemplateText,
                ]}
              >
                {template.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Saisie des données */}
        <Text style={styles.sectionTitle}>Données à encoder :</Text>
        <TextInput
          style={styles.textInput}
          value={qrData}
          onChangeText={setQrData}
          placeholder={selectedTemplate.placeholder}
          multiline={selectedTemplate.label === 'Texte simple'}
          editable={!isProcessing}
        />

        {/* Configuration de la taille */}
        <Text style={styles.sectionTitle}>Taille du QR Code :</Text>
        <View style={styles.sizeContainer}>
          {['150', '200', '250'].map(size => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeButton,
                qrSize === size && styles.selectedSize,
              ]}
              onPress={() => setQrSize(size)}
            >
              <Text
                style={[
                  styles.sizeText,
                  qrSize === size && styles.selectedSizeText,
                ]}
              >
                {size}px
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Aperçu du QR Code */}
        {qrData.trim() && (
          <View style={styles.previewContainer}>
            <Text style={styles.sectionTitle}>Aperçu :</Text>
            <View style={styles.qrContainer}>
              <QRCode
                ref={qrRef}
                value={generateQRData()}
                size={parseInt(qrSize, 10)}
                color="black"
                backgroundColor="white"
              />
            </View>
            <Text style={styles.dataPreview}>
              Données encodées : {generateQRData()}
            </Text>
          </View>
        )}

        {/* Boutons d'action */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.printButton,
              (isProcessing || !isConnected() || !qrData.trim()) &&
                styles.disabledButton,
            ]}
            onPress={printQRInfo}
            disabled={isProcessing || !isConnected() || !qrData.trim()}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.printButtonText}>Imprimer Infos QR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.printButton,
              styles.secondaryButton,
              (isProcessing || !isConnected() || !qrData.trim()) &&
                styles.disabledButton,
            ]}
            onPress={HandlePrintQRCode}
            disabled={isProcessing || !isConnected() || !qrData.trim()}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <Text
                style={[styles.printButtonText, styles.secondaryButtonText]}
              >
                Imprimer QR Complet
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Avertissement si déconnecté */}
        {!isConnected() && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Imprimante déconnectée. Connectez-vous d'abord à une
              imprimante.
            </Text>
          </View>
        )}

        {/* Guide d'utilisation */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Guide d'utilisation :</Text>
          <Text style={styles.helpText}>
            • URL : Saisissez une adresse web complète{'\n'}• Email : Saisissez
            une adresse email{'\n'}• Téléphone : Saisissez un numéro avec
            indicatif{'\n'}• WiFi : Format SSID;MOT_DE_PASSE{'\n'}• Texte :
            N'importe quel texte libre
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#333',
  },
  templateContainer: {
    marginBottom: 10,
  },
  templateButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedTemplate: {
    backgroundColor: '#2196F3',
  },
  templateText: {
    color: '#666',
    fontSize: 14,
  },
  selectedTemplateText: {
    color: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectedSize: {
    backgroundColor: '#2196F3',
  },
  sizeText: {
    color: '#666',
    fontSize: 14,
  },
  selectedSizeText: {
    color: '#fff',
  },
  previewContainer: {
    marginTop: 20,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  dataPreview: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 30,
    gap: 15,
  },
  printButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  printButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
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
  helpContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  helpTitle: {
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  helpText: {
    color: '#1976D2',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default QRCodePrintScreen;
