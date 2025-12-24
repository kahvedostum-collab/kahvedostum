import * as signalR from '@microsoft/signalr';

const SIGNALR_BASE = 'http://91.241.50.213:5051';

/**
 * Receipt Hub bağlantısı oluşturur
 * Fiş işleme durumunu takip etmek için kullanılır
 * Token dinamik olarak localStorage'dan alınır (her bağlantı/reconnect'te güncel token kullanılır)
 * @returns {signalR.HubConnection}
 */
export const createReceiptConnection = () => {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${SIGNALR_BASE}/hubs/receipts`, {
      accessTokenFactory: () => localStorage.getItem('accessToken')
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Reconnect intervals
    .build();
};

/**
 * Cafe Hub bağlantısı oluşturur
 * Aktif kafe kullanıcılarını takip etmek için kullanılır
 * Token dinamik olarak localStorage'dan alınır (her bağlantı/reconnect'te güncel token kullanılır)
 * @returns {signalR.HubConnection}
 */
export const createCafeConnection = () => {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${SIGNALR_BASE}/hubs/cafe`, {
      accessTokenFactory: () => localStorage.getItem('accessToken')
    })
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .build();
};

/**
 * SignalR bağlantı durumlarını kontrol eder
 */
export const ConnectionState = signalR.HubConnectionState;

// ============================================
// Global Cafe Connection Manager (Singleton)
// ============================================

let cafeConnection = null;
let cafeStore = null;
let cafeActions = null;
let currentCafeId = null; // Reconnect için cafeId'yi sakla

/**
 * Bağlantının tamamlanmasını bekler (race condition önleme)
 * @param {signalR.HubConnection} connection - SignalR bağlantısı
 * @param {number} timeout - Maksimum bekleme süresi (ms)
 * @returns {Promise<void>}
 */
const waitForConnection = (connection, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkState = () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        resolve();
      } else if (connection.state === signalR.HubConnectionState.Disconnected) {
        reject(new Error('Connection failed'));
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Connection timeout'));
      } else {
        setTimeout(checkState, 100);
      }
    };

    checkState();
  });
};

/**
 * Redux store'u inject eder (App başlangıcında çağrılmalı)
 * @param {Object} store - Redux store instance
 * @param {Object} actions - Cafe action creators { setCafeConnected, setCafeUsers }
 */
export const injectCafeStore = (store, actions) => {
  cafeStore = store;
  cafeActions = actions;
};

/**
 * Global cafe bağlantısını başlatır veya mevcut bağlantıyı döndürür
 * @param {number} cafeId - Katılınacak cafe ID
 * @returns {Promise<signalR.HubConnection>}
 */
export const connectToCafe = async (cafeId) => {
  // Token varlığı kontrolü - bağlantı başlamadan önce hata vermek için
  if (!localStorage.getItem('accessToken')) {
    throw new Error('No access token available');
  }

  // cafeId geçerliliği kontrolü
  if (!cafeId || typeof cafeId !== 'number' || cafeId <= 0) {
    throw new Error('Invalid cafe ID');
  }

  // cafeId'yi global olarak sakla (reconnect için)
  currentCafeId = cafeId;

  // Mevcut bağlantı varsa, durumuna göre işlem yap
  if (cafeConnection) {
    const state = cafeConnection.state;

    // Zaten bağlıysa, direkt döndür
    if (state === signalR.HubConnectionState.Connected) {
      return cafeConnection;
    }

    // Bağlanıyor ise, bağlantının tamamlanmasını bekle (race condition önleme)
    if (state === signalR.HubConnectionState.Connecting) {
      console.log('CafeHub: Connection already in progress, waiting...');
      try {
        await waitForConnection(cafeConnection);
        console.log('CafeHub: Existing connection completed');
        return cafeConnection;
      } catch (e) {
        console.warn('CafeHub: Waiting for connection failed:', e.message);
        // Bağlantı başarısız olduysa, yeni bağlantı oluştur
        cafeConnection = null;
      }
    }

    // Disconnected, Disconnecting veya Reconnecting durumunda, kapat
    if (cafeConnection) {
      try {
        await cafeConnection.stop();
      } catch (e) {
        console.warn('Error stopping previous connection:', e);
      }
      cafeConnection = null;
    }
  }

  // Yeni bağlantı oluştur (token dinamik olarak alınacak)
  cafeConnection = createCafeConnection();

  // Event listener'ları ekle
  cafeConnection.on('CafeActiveUsers', (users) => {
    console.log('CafeActiveUsers received:', users);
    if (cafeStore && cafeActions) {
      cafeStore.dispatch(cafeActions.setCafeUsers(users || []));
    }
  });

  cafeConnection.onclose((err) => {
    console.log('CafeHub connection closed:', err);
    if (cafeStore && cafeActions) {
      cafeStore.dispatch(cafeActions.setCafeConnected(false));
    }
  });

  cafeConnection.onreconnecting((err) => {
    console.log('CafeHub reconnecting:', err);
    if (cafeStore && cafeActions) {
      cafeStore.dispatch(cafeActions.setCafeConnected(false));
    }
  });

  cafeConnection.onreconnected(async (connectionId) => {
    console.log('CafeHub reconnected:', connectionId);
    if (cafeStore && cafeActions) {
      cafeStore.dispatch(cafeActions.setCafeConnected(true));
    }
    // Cafe'ye tekrar katıl - global currentCafeId kullan
    if (currentCafeId) {
      try {
        await cafeConnection.invoke('JoinCafe', parseInt(currentCafeId, 10));
        console.log('Rejoined cafe:', currentCafeId);
      } catch (e) {
        console.error('Failed to rejoin cafe:', e);
      }
    }
  });

  // Bağlantıyı başlat
  await cafeConnection.start();
  console.log('CafeHub connected');

  // Cafe'ye katıl
  await cafeConnection.invoke('JoinCafe', parseInt(cafeId, 10));
  console.log('Joined cafe:', cafeId);

  // Bağlantı durumunu güncelle
  if (cafeStore && cafeActions) {
    cafeStore.dispatch(cafeActions.setCafeConnected(true));
  }

  return cafeConnection;
};

/**
 * Global cafe bağlantısını kapatır
 */
export const disconnectFromCafe = async () => {
  if (cafeConnection) {
    try {
      await cafeConnection.stop();
      console.log('CafeHub disconnected');
    } catch (e) {
      console.warn('Error disconnecting from cafe:', e);
    }
    cafeConnection = null;
  }

  // Global cafeId'yi temizle
  currentCafeId = null;

  if (cafeStore && cafeActions) {
    cafeStore.dispatch(cafeActions.setCafeConnected(false));
    cafeStore.dispatch(cafeActions.setCafeUsers([]));
  }
};

/**
 * Mevcut cafe bağlantısını döndürür
 * @returns {signalR.HubConnection|null}
 */
export const getCafeConnection = () => cafeConnection;

/**
 * Cafe bağlantısının durumunu kontrol eder
 * @returns {boolean}
 */
export const isCafeConnected = () => {
  return cafeConnection?.state === signalR.HubConnectionState.Connected;
};

export default {
  createReceiptConnection,
  createCafeConnection,
  ConnectionState,
  // Global cafe connection functions
  injectCafeStore,
  connectToCafe,
  disconnectFromCafe,
  getCafeConnection,
  isCafeConnected,
};
