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
};

// Commandes alternatives pour certaines imprimantes chinoises
export const ALT_PRINTER_COMMANDS = {
  CUT: '\x1D\x56\x01', // Coupe partielle
  FEED: '\x0A\x0A\x0A', // Simple line feed
  INIT: '\x1B\x40\x1B\x74\x00', // Init + codepage
  STATUS_CHECK: '\x1D\x72\x01', // Status alternatif
};
