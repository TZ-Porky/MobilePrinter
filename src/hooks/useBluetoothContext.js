// ==========================================
// Hook React pour utiliser le context
// ==========================================

import { useContext } from "react";
import BluetoothContext from "../context/BluetoothContext";

export const useBluetoothContext = () => {
    return useContext(BluetoothContext);
}