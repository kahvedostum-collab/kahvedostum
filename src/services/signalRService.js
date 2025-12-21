import * as signalR from '@microsoft/signalr';

const SIGNALR_BASE = 'http://91.241.50.213:5051';

/**
 * Receipt Hub bağlantısı oluşturur
 * Fiş işleme durumunu takip etmek için kullanılır
 * @param {string} token - JWT access token
 * @returns {signalR.HubConnection}
 */
export const createReceiptConnection = (token) => {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${SIGNALR_BASE}/hubs/receipts`, {
      accessTokenFactory: () => token
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Reconnect intervals
    .build();
};

/**
 * Cafe Hub bağlantısı oluşturur
 * Aktif kafe kullanıcılarını takip etmek için kullanılır
 * @param {string} token - JWT access token
 * @returns {signalR.HubConnection}
 */
export const createCafeConnection = (token) => {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${SIGNALR_BASE}/hubs/cafe`, {
      accessTokenFactory: () => token
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .build();
};

/**
 * SignalR bağlantı durumlarını kontrol eder
 */
export const ConnectionState = signalR.HubConnectionState;

export default {
  createReceiptConnection,
  createCafeConnection,
  ConnectionState,
};
