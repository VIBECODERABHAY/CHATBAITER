/**
 * ChatBaiter Firebase & Multi-Tab Synchronization Engine
 * - Cloud Firestore and Realtime Database dual-support for global cloud messaging
 * - Seamless automatic BroadcastChannel / LocalStorage fallback for instant multi-window local testing
 * - Room creation, user verification, and message streaming
 */

const ChatSync = (function () {
  'use strict';

  // Config is dynamically loaded from Vercel / local environment variables via /api/config
  let envLoadedConfig = null;
  let activeConfig = null;
  let currentBackendMode = 'offline'; // 'custom' | 'server' | 'offline'
  let firebaseApp = null;
  let firestoreDb = null;
  let rtdb = null;
  let isFirebaseActive = false;
  let currentRoomCode = null;
  let broadcastChannel = null;
  let messageListeners = [];
  let storageKeyPrefix = 'cb_room_';
  let activeFirestoreUnsubscribe = null;

  /**
   * Balanced brace extractor to isolate { ... } from code or variable declarations
   */
  function extractFirstBracedObject(str) {
    const start = str.indexOf('{');
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < str.length; i++) {
      if (str[i] === '{') depth++;
      else if (str[i] === '}') {
        depth--;
        if (depth === 0) {
          return str.substring(start, i + 1);
        }
      }
    }
    return null;
  }

  /**
   * Intelligently parse any Firebase configuration format:
   * 1. Standard JSON ({ "apiKey": ... })
   * 2. Full JS snippets (const firebaseConfig = { ... };)
   * 3. Relaxed JS object literals ({ apiKey: '...', })
   * 4. Direct regex extraction of key properties
   */
  function parseFirebaseConfigInput(rawText) {
    if (!rawText || !rawText.trim()) return null;
    let text = rawText.trim();

    // Extract first balanced { ... } block if surrounded by code
    const extracted = extractFirstBracedObject(text);
    if (extracted) {
      text = extracted;
    }

    // 1. Direct JSON parse
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && parsed.apiKey && (parsed.projectId || parsed.databaseURL)) {
        return parsed;
      }
    } catch (e) {}

    // 2. Relaxed JS Parser (strip comments, quote keys, convert single quotes)
    try {
      let clean = text.replace(/\/\*[\s\S]*?\*\//g, '');
      clean = clean
        .split('\n')
        .map((line) => {
          const idx = line.indexOf('//');
          return idx >= 0 ? line.substring(0, idx) : line;
        })
        .join('\n');

      clean = clean.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
      clean = clean.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
      clean = clean.replace(/,\s*([}\]])/g, '$1');

      const parsed = JSON.parse(clean);
      if (parsed && typeof parsed === 'object' && parsed.apiKey && (parsed.projectId || parsed.databaseURL)) {
        return parsed;
      }
    } catch (e) {}

    // 3. Fallback: Direct regex extraction of known Firebase properties
    try {
      const getKey = (keyName) => {
        const regex = new RegExp(`['"]?${keyName}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
        const m = rawText.match(regex);
        return m ? m[1].trim() : null;
      };

      const apiKey = getKey('apiKey');
      const projectId = getKey('projectId');
      if (apiKey && projectId) {
        const config = { apiKey, projectId };
        ['authDomain', 'databaseURL', 'storageBucket', 'messagingSenderId', 'appId'].forEach((k) => {
          const val = getKey(k);
          if (val) config[k] = val;
        });
        return config;
      }
    } catch (e) {}

    throw new Error('Config missing required "apiKey" or "projectId" fields.');
  }

  // Load custom Firebase config from localStorage if saved, or use environment config
  function getSavedFirebaseConfig() {
    if (localStorage.getItem('cb_force_offline') === 'true') {
      return null;
    }
    try {
      const raw = localStorage.getItem('cb_firebase_config');
      return raw ? JSON.parse(raw) : envLoadedConfig;
    } catch (e) {
      return envLoadedConfig;
    }
  }

  function saveFirebaseConfig(configObj) {
    if (configObj) {
      localStorage.setItem('cb_firebase_config', JSON.stringify(configObj));
      localStorage.removeItem('cb_force_offline');
      currentBackendMode = 'custom';
    } else {
      localStorage.removeItem('cb_firebase_config');
      currentBackendMode = envLoadedConfig ? 'server' : 'offline';
    }
  }

  /**
   * Delete existing default and named Firebase apps cleanly
   */
  async function cleanFirebaseApps() {
    if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
      const apps = [...window.firebase.apps];
      for (const app of apps) {
        try {
          await app.delete();
        } catch (e) {}
      }
    }
    firebaseApp = null;
    firestoreDb = null;
    rtdb = null;
  }

  /**
   * Live test a Firebase connection before applying
   */
  async function testFirebaseConnection(candidateConfig) {
    const startTime = performance.now();
    let testAppName = 'test_' + Date.now();
    let testApp = null;

    try {
      if (!candidateConfig.apiKey || !candidateConfig.projectId) {
        throw new Error('Missing apiKey or projectId in candidate configuration.');
      }

      if (!window.firebase) {
        throw new Error('Firebase SDK scripts not loaded.');
      }

      testApp = window.firebase.initializeApp(candidateConfig, testAppName);
      const testFs = testApp.firestore();

      // Test ping read on Firestore with a 6-second timeout
      const pingPromise = testFs.collection('_connection_ping').limit(1).get();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out. Check network or Firestore security status.')), 6000)
      );

      await Promise.race([pingPromise, timeoutPromise]);
      const latencyMs = Math.round(performance.now() - startTime);

      return {
        success: true,
        projectId: candidateConfig.projectId,
        latencyMs,
      };
    } catch (err) {
      // Permission denied proves the project exists and responded over the internet!
      if (err.code === 'permission-denied' || /permission/i.test(err.message)) {
        const latencyMs = Math.round(performance.now() - startTime);
        return {
          success: true,
          projectId: candidateConfig.projectId,
          latencyMs,
          warning: 'Connected! (Verify Firestore security rules allow read/write for /rooms)',
        };
      }
      return {
        success: false,
        error: err.message || 'Failed to connect to Firebase project.',
      };
    } finally {
      if (testApp) {
        try {
          await testApp.delete();
        } catch (e) {}
      }
    }
  }

  /**
   * Fetch configuration securely from Vercel / serverless environment
   */
  async function fetchEnvConfig() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.configured && data.config) {
          envLoadedConfig = data.config;
          const isOffline = localStorage.getItem('cb_force_offline') === 'true';
          const manual = localStorage.getItem('cb_firebase_config');
          if (!manual && !isOffline) {
            await initFirebase(envLoadedConfig);
            currentBackendMode = 'server';
          }
          return envLoadedConfig;
        }
      }
    } catch (e) {
      // Offline fallback
    }
    return null;
  }

  /**
   * Initialize Firebase SDK with clean instance recreation
   */
  async function initFirebase(config) {
    if (localStorage.getItem('cb_force_offline') === 'true') {
      await cleanFirebaseApps();
      isFirebaseActive = false;
      currentBackendMode = 'offline';
      activeConfig = null;
      return false;
    }

    const resolvedConfig = config || getSavedFirebaseConfig();
    if (!resolvedConfig || !resolvedConfig.apiKey || !resolvedConfig.projectId) {
      await cleanFirebaseApps();
      isFirebaseActive = false;
      currentBackendMode = 'offline';
      activeConfig = null;
      return false;
    }

    try {
      activeConfig = resolvedConfig;

      // Clean up previous app before initializing new default
      await cleanFirebaseApps();

      if (window.firebase) {
        firebaseApp = window.firebase.initializeApp(resolvedConfig);
      }

      // Initialize Firestore
      if (window.firebase && window.firebase.firestore) {
        firestoreDb = window.firebase.firestore();
      }

      // Initialize Realtime DB if databaseURL is provided
      if (resolvedConfig.databaseURL && window.firebase && window.firebase.database) {
        rtdb = window.firebase.database();
      }

      isFirebaseActive = true;
      currentBackendMode = localStorage.getItem('cb_firebase_config') ? 'custom' : 'server';
      console.log(`ChatBaiter: Active Backend -> [${currentBackendMode.toUpperCase()}] Project: ${resolvedConfig.projectId}`);
      return true;
    } catch (err) {
      console.warn('Firebase init error, using local fallback:', err);
      isFirebaseActive = false;
      currentBackendMode = 'offline';
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
      creatorName: data.creatorName || 'Creator',
      createdAt: Date.now(),
      isHashLocked: false,
      challengeToken: null,
      visitors: {},
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
   * Log visitor presence in the room ledger
   */
  async function logVisitorPresence(chatCode, visitor) {
    if (!chatCode || !visitor || !visitor.name) return null;
    const visitorId = 'v_' + window.btoa(encodeURIComponent(visitor.name)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    const visitorRecord = {
      id: visitorId,
      name: visitor.name,
      userHash: visitor.userHash || '',
      joinedAt: Date.now(),
      lastSeen: Date.now(),
    };

    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb
          .collection('rooms')
          .doc(chatCode)
          .collection('visitors')
          .doc(visitorId)
          .set(visitorRecord, { merge: true });
      } catch (err) {
        console.warn('Firestore visitor log error:', err);
      }
    }

    // Mirror to localStorage
    const local = JSON.parse(localStorage.getItem(storageKeyPrefix + chatCode) || '{}');
    if (!local.visitors) local.visitors = {};
    local.visitors[visitorId] = visitorRecord;
    localStorage.setItem(storageKeyPrefix + chatCode, JSON.stringify(local));

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'VISITOR_JOINED',
        chatCode,
        visitor: visitorRecord,
      });
    }

    return visitorRecord;
  }

  /**
   * Retrieve visitor list for the room ledger
   */
  async function getRoomVisitors(chatCode) {
    if (!chatCode) return [];
    const list = [];
    if (isFirebaseActive && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('rooms').doc(chatCode).collection('visitors').get();
        snap.forEach((doc) => list.push(doc.data()));
        if (list.length > 0) return list.sort((a, b) => a.joinedAt - b.joinedAt);
      } catch (e) {}
    }

    const local = JSON.parse(localStorage.getItem(storageKeyPrefix + chatCode) || '{}');
    if (local.visitors) {
      return Object.values(local.visitors).sort((a, b) => a.joinedAt - b.joinedAt);
    }
    return [];
  }

  /**
   * Toggle or set the room's hash password lock status (.cblock protection)
   */
  async function setRoomHashLock(chatCode, isLocked, challengeToken = null) {
    const updateData = {
      isHashLocked: Boolean(isLocked),
      challengeToken: isLocked ? challengeToken : null,
      lockedAt: isLocked ? Date.now() : null,
    };

    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection('rooms').doc(chatCode).set(updateData, { merge: true });
      } catch (err) {
        console.error('Firestore setRoomHashLock error:', err);
      }
    }

    const local = JSON.parse(localStorage.getItem(storageKeyPrefix + chatCode) || '{}');
    local.isHashLocked = Boolean(isLocked);
    local.challengeToken = isLocked ? challengeToken : null;
    local.lockedAt = isLocked ? Date.now() : null;
    localStorage.setItem(storageKeyPrefix + chatCode, JSON.stringify(local));

    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'LOCK_STATUS_CHANGED',
        chatCode,
        isHashLocked: Boolean(isLocked),
      });
    }

    return updateData;
  }

  /**
   * Check room lock status live on every input or visit
   */
  async function checkRoomLockStatus(chatCode) {
    if (!chatCode) return { isHashLocked: false, challengeToken: null };
    try {
      const room = await getRoom(chatCode);
      return {
        isHashLocked: Boolean(room?.isHashLocked),
        challengeToken: room?.challengeToken || null,
      };
    } catch (e) {
      return { isHashLocked: false, challengeToken: null };
    }
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

  /**
   * Resubscribe active room if switching backends during live chat
   */
  function resubscribeActiveRoom() {
    if (!currentRoomCode || messageListeners.length === 0) return;
    const roomCode = currentRoomCode;
    const callbacks = [...messageListeners];

    if (activeFirestoreUnsubscribe) {
      activeFirestoreUnsubscribe();
      activeFirestoreUnsubscribe = null;
    }
    if (rtdb && currentRoomCode) {
      rtdb.ref('rooms/' + currentRoomCode + '/messages').off();
    }
    messageListeners = [];
    callbacks.forEach((cb) => subscribeRoom(roomCode, cb));
  }

  /**
   * Apply user's custom BYOB Firebase config
   */
  async function applyCustomConfig(candidateConfig) {
    localStorage.removeItem('cb_force_offline');
    saveFirebaseConfig(candidateConfig);
    const ok = await initFirebase(candidateConfig);
    if (ok) {
      currentBackendMode = 'custom';
      resubscribeActiveRoom();
    }
    return ok;
  }

  /**
   * Revert to host's server default Firebase configuration
   */
  async function revertToServerDefault() {
    localStorage.removeItem('cb_force_offline');
    localStorage.removeItem('cb_firebase_config');
    if (envLoadedConfig) {
      await initFirebase(envLoadedConfig);
      currentBackendMode = 'server';
    } else {
      await cleanFirebaseApps();
      isFirebaseActive = false;
      currentBackendMode = 'offline';
      activeConfig = null;
    }
    resubscribeActiveRoom();
    return Boolean(envLoadedConfig);
  }

  /**
   * Disconnect all cloud connections and switch to offline local P2P sync
   */
  async function disconnectToOffline() {
    localStorage.setItem('cb_force_offline', 'true');
    localStorage.removeItem('cb_firebase_config');
    await cleanFirebaseApps();
    isFirebaseActive = false;
    currentBackendMode = 'offline';
    activeConfig = null;
    resubscribeActiveRoom();
    return true;
  }

  /**
   * Get detailed information on current backend mode and active project
   */
  function getBackendInfo() {
    const isCustom = currentBackendMode === 'custom';
    const isServer = currentBackendMode === 'server';
    const isOffline = currentBackendMode === 'offline';
    const activeProject = activeConfig ? activeConfig.projectId : (envLoadedConfig ? envLoadedConfig.projectId : null);

    return {
      mode: currentBackendMode, // 'custom' | 'server' | 'offline'
      projectId: activeProject,
      isFirebaseActive,
      isCustom,
      isServer,
      isOffline,
      hasServerDefault: Boolean(envLoadedConfig),
      activeConfig: activeConfig ? { ...activeConfig } : null,
    };
  }

  return {
    initFirebase,
    getSavedFirebaseConfig,
    saveFirebaseConfig,
    applyCustomConfig,
    revertToServerDefault,
    disconnectToOffline,
    getBackendInfo,
    fetchEnvConfig,
    parseFirebaseConfigInput,
    testFirebaseConnection,
    isEnvConfigured: () => Boolean(envLoadedConfig),
    isFirebaseActive: () => isFirebaseActive,
    createRoom,
    getRoom,
    logVisitorPresence,
    getRoomVisitors,
    setRoomHashLock,
    checkRoomLockStatus,
    sendMessage,
    subscribeRoom,
    unsubscribe,
  };
})();
