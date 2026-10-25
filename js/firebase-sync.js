/**
 * ChatBaiter Firebase & Multi-Tab Synchronization Engine
 * - Cloud Firestore and Realtime Database dual-support for global cloud messaging
 * - Seamless automatic BroadcastChannel / LocalStorage fallback for instant multi-window local testing
 * - Room creation, user verification, and message streaming
 */

const ChatSync = (function () {
  'use strict';

  // Default Firebase configuration provided for ChatBaiter
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyBLjrgDGpKr512WB21gK0eVLtgYGcpXRTU",
    authDomain: "chatbaiter.firebaseapp.com",
    projectId: "chatbaiter",
    storageBucket: "chatbaiter.firebasestorage.app",
    messagingSenderId: "1098646721797",
    appId: "1:1098646721797:web:644df2b5c873c4c9bb536c",
    measurementId: "G-3DYWBT6XEY"
  };

  let firebaseApp = null;
  let firestoreDb = null;
  let rtdb = null;
  let isFirebaseActive = false;
  let currentRoomCode = null;
  let broadcastChannel = null;
  let messageListeners = [];
  let storageKeyPrefix = 'cb_room_';
  let activeFirestoreUnsubscribe = null;

  // Load custom Firebase config from localStorage if saved, or use default
  function getSavedFirebaseConfig() {
    try {
      const raw = localStorage.getItem('cb_firebase_config');
      return raw ? JSON.parse(raw) : DEFAULT_FIREBASE_CONFIG;
    } catch (e) {
      return DEFAULT_FIREBASE_CONFIG;
    }
  }

  function saveFirebaseConfig(configObj) {
    if (configObj) {
      localStorage.setItem('cb_firebase_config', JSON.stringify(configObj));
    } else {
      localStorage.removeItem('cb_firebase_config');
    }
  }

  /**
   * Initialize Firebase SDK (Supports Cloud Firestore or Realtime Database)
   */
  function initFirebase(config) {
    const activeConfig = config || DEFAULT_FIREBASE_CONFIG;
    if (!activeConfig || !activeConfig.apiKey || !activeConfig.projectId) {
      isFirebaseActive = false;
      return false;
    }

    try {
      if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
        firebaseApp = window.firebase.apps[0];
      } else if (window.firebase) {
        firebaseApp = window.firebase.initializeApp(activeConfig);
      }

      // Initialize Firestore
      if (window.firebase && window.firebase.firestore) {
        firestoreDb = window.firebase.firestore();
      }

      // Initialize Realtime DB if databaseURL is provided
      if (activeConfig.databaseURL && window.firebase && window.firebase.database) {
        rtdb = window.firebase.database();
      }

      isFirebaseActive = true;
      console.log('ChatBaiter: Live Cloud Firestore connected successfully.');
      return true;
    } catch (err) {
      console.warn('Firebase init error, using local fallback:', err);
      isFirebaseActive = false;
      return false;
    }
  }

  // Auto-init on script evaluation
  initFirebase(getSavedFirebaseConfig());

  /**
   * Create a new room in Cloud Firestore or Realtime Database
   * @param {{ chatCode: string, audioHash: string, userHash: string, creatorName: string }} data
   */
  async function createRoom(data) {
    const roomRecord = {
      chatCode: data.chatCode,
      audioHash: data.audioHash,
      creatorHash: data.userHash,
      createdAt: Date.now(),
    };

    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection('rooms').doc(data.chatCode).set(roomRecord);
        console.log(`Room ${data.chatCode} synced to Cloud Firestore.`);
      } catch (err) {
        console.error('Firestore createRoom error:', err);
      }
    } else if (isFirebaseActive && rtdb) {
      try {
        await rtdb.ref('rooms/' + data.chatCode).set(roomRecord);
      } catch (err) {
        console.error('RTDB createRoom error:', err);
      }
    }

    // Always mirror to localStorage for offline / multi-tab fallback
    localStorage.setItem(storageKeyPrefix + data.chatCode, JSON.stringify({ ...roomRecord, messages: {} }));
    return roomRecord;
  }

  /**
   * Fetch room data
   * @param {string} chatCode
   * @returns {Promise<any>}
   */
  async function getRoom(chatCode) {
    if (isFirebaseActive && firestoreDb) {
      try {
        const doc = await firestoreDb.collection('rooms').doc(chatCode).get();
        if (doc.exists) {
          return doc.data();
        }
      } catch (err) {
        console.warn('Firestore getRoom fallback to local:', err);
      }
    } else if (isFirebaseActive && rtdb) {
      try {
        const snapshot = await rtdb.ref('rooms/' + chatCode).once('value');
        if (snapshot.exists()) return snapshot.val();
      } catch (err) {
        console.warn('RTDB getRoom fallback to local:', err);
      }
    }

    const localData = localStorage.getItem(storageKeyPrefix + chatCode);
    return localData ? JSON.parse(localData) : null;
  }

  /**
   * Send an encrypted message to the active room
   * @param {string} chatCode
   * @param {{ senderName: string, senderHash: string, encrypted: { iv: string, ciphertext: string, length: number } }} messageData
   */
  async function sendMessage(chatCode, messageData) {
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const payload = {
      id: messageId,
      senderName: messageData.senderName,
      senderHash: messageData.senderHash,
      encrypted: messageData.encrypted,
      timestamp: Date.now(),
    };

    // 1. Send to Cloud Firestore
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb
          .collection('rooms')
          .doc(chatCode)
          .collection('messages')
          .doc(messageId)
          .set(payload);
      } catch (err) {
        console.error('Firestore sendMessage error:', err);
      }
    } else if (isFirebaseActive && rtdb) {
      try {
        await rtdb.ref('rooms/' + chatCode + '/messages').push(payload);
      } catch (err) {
        console.error('RTDB sendMessage error:', err);
      }
    }

    // 2. LocalStorage & BroadcastChannel Sync
    let room = JSON.parse(localStorage.getItem(storageKeyPrefix + chatCode) || '{"messages":{}}');
    if (!room.messages) room.messages = {};
    room.messages[messageId] = payload;
    localStorage.setItem(storageKeyPrefix + chatCode, JSON.stringify(room));

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'NEW_MESSAGE',
        chatCode: chatCode,
        message: payload,
      });
    }

    // Trigger local listeners
    notifyListeners(payload);

    return payload;
  }

  /**
   * Subscribe to real-time messages in a room
   * @param {string} chatCode
   * @param {Function} callback
   */
  function subscribeRoom(chatCode, callback) {
    currentRoomCode = chatCode;
    messageListeners.push(callback);

    // 1. Setup BroadcastChannel for instant local cross-tab communication
    if (window.BroadcastChannel) {
      if (broadcastChannel) broadcastChannel.close();
      broadcastChannel = new BroadcastChannel('chatbaiter_' + chatCode);
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_MESSAGE' && event.data.chatCode === chatCode) {
          notifyListeners(event.data.message);
        }
      };
    }

    // 2. Setup Cloud Firestore real-time listener
    if (isFirebaseActive && firestoreDb) {
      if (activeFirestoreUnsubscribe) activeFirestoreUnsubscribe();
      activeFirestoreUnsubscribe = firestoreDb
        .collection('rooms')
        .doc(chatCode)
        .collection('messages')
        .onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                notifyListeners(change.doc.data());
              }
            });
          },
          (err) => console.warn('Firestore onSnapshot error:', err)
        );
    } else if (isFirebaseActive && rtdb) {
      const messagesRef = rtdb.ref('rooms/' + chatCode + '/messages');
      messagesRef.off();
      messagesRef.limitToLast(50).on('child_added', (snapshot) => {
        notifyListeners(snapshot.val());
      });
    }

    // 3. Load existing local history immediately
    const existing = localStorage.getItem(storageKeyPrefix + chatCode);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed.messages) {
          Object.values(parsed.messages)
            .sort((a, b) => a.timestamp - b.timestamp)
            .forEach((msg) => notifyListeners(msg));
        }
      } catch (e) {}
    }
  }

  const seenMessageIds = new Set();
  function notifyListeners(message) {
    if (!message || !message.id) return;
    if (seenMessageIds.has(message.id)) return;
    seenMessageIds.add(message.id);

    messageListeners.forEach((fn) => {
      try {
        fn(message);
      } catch (e) {
        console.error('Error in message listener', e);
      }
    });
  }

  function unsubscribe() {
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
    if (activeFirestoreUnsubscribe) {
      activeFirestoreUnsubscribe();
      activeFirestoreUnsubscribe = null;
    }
    if (isFirebaseActive && rtdb && currentRoomCode) {
      rtdb.ref('rooms/' + currentRoomCode + '/messages').off();
    }
    messageListeners = [];
    seenMessageIds.clear();
    currentRoomCode = null;
  }

  return {
    initFirebase,
    getSavedFirebaseConfig,
    saveFirebaseConfig,
    isFirebaseActive: () => isFirebaseActive,
    createRoom,
    getRoom,
    sendMessage,
    subscribeRoom,
    unsubscribe,
    DEFAULT_FIREBASE_CONFIG,
  };
})();
