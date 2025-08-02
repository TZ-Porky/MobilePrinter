/* eslint-disable no-bitwise */
// ==========================================
// PrinterCommands.js
// ==========================================

export const PRINTER_COMMANDS = {
  INIT: '\x1B\x40', // Initialiser l'imprimante
  FEED: '\x1B\x64\x03', // Avancer le papier (3 lignes)
  CUT: '\x1D\x56\x00', // Couper le papier (si supporté)
  STATUS_CHECK: '\x10\x04\x01', // Vérifier le statut de l'imprimante
  ALIGN_LEFT: '\x1B\x61\x00',
  ALIGN_CENTER: '\x1B\x61\x01',
  ALIGN_RIGHT: '\x1B\x61\x02',
  BOLD_ON: '\x1B\x45\x01',
  BOLD_OFF: '\x1B\x45\x00',
  SIZE_NORMAL: '\x1D\x21\x00',
  SIZE_DOUBLE: '\x1D\x21\x11',
  SIZE_LARGE: '\x1D\x21\x22',

  // ==========================================
  // COMMANDES QR CODE (ESC/POS)
  // ==========================================
  QR_CODE_MODEL_1: '\x1D\x28\x6B\x04\x00\x31\x41\x31\x00', // Modèle 1
  QR_CODE_MODEL_2: '\x1D\x28\x6B\x04\x00\x31\x41\x32\x00', // Modèle 2 (plus courant)

  QR_CODE_SIZE_N: (n) => `\x1D\x28\x6B\x03\x00\x31\x43${String.fromCharCode(n)}`,

  QR_CODE_ERROR_CORRECTION_L: '\x1D\x28\x6B\x03\x00\x31\x45\x48', // L (7%)
  QR_CODE_ERROR_CORRECTION_M: '\x1D\x28\x6B\x03\x00\x31\x45\x49', // M (15%) - Bonne valeur par défaut
  QR_CODE_ERROR_CORRECTION_Q: '\x1D\x28\x6B\x03\x00\x31\x45\x50', // Q (25%)
  QR_CODE_ERROR_CORRECTION_H: '\x1D\x28\x6B\x03\x00\x31\x45\x51', // H (30%)

  QR_CODE_STORE_DATA: (data) => {
    const dataLength = data.length + 3; // +3 pour 0x31 0x50 0x30
    const pL = String.fromCharCode(dataLength & 0xff);
    const pH = String.fromCharCode((dataLength >> 8) & 0xff);
    return `\x1D\x28\x6B${pL}${pH}\x31\x50\x30${data}`;
  },

  QR_CODE_PRINT: '\x1D\x28\x6B\x03\x00\x31\x51\x30',

  QR_CODE_CANCEL: '\x1D\x28\x6B\x03\x00\x31\x41\x30',
};

// Commandes alternatives pour certaines imprimantes chinoises
export const ALT_PRINTER_COMMANDS = {
  CUT: '\x1D\x56\x01', // Coupe partielle
  FEED: '\x0A\x0A\x0A', // Simple line feed
  INIT: '\x1B\x40\x1B\x74\x00', // Init + codepage
  STATUS_CHECK: '\x1D\x72\x01', // Status alternatif
};
