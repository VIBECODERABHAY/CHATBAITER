/**
 * ChatBaiter Main Application Coordinator (Experiment Edition)
 * - Role Management (Creator-Frnd vs Frnd)
 * - Acoustic Key Extraction & Cryptographic Flow (Hardened 250k PBKDF2)
 * - Room Generation, Invite Link Handling & Visitor Presence Ledger
 * - Real-Time Encrypted Message Stream & Scrambler Animations
 * - Dual-AI Synapse (OpenAI, Claude, Gemini, DeepSeek, Groq, Mistral, xAI, etc.)
 * - AI Colosseum Debate Mode (Autonomous AI-vs-AI Debate Arena)
 * - Audio-Key Encrypted API Key Vault
 * - .cblock Cryptographic Lockfile Generation & Decryption Verification Flow
 * - Catastrophe Lockout Screen for unauthorized intruders
 */

(function () {
  'use strict';

  // State Management
  const state = {
    role: 'creator', // 'creator' | 'frnd'
    userName: '',
    userHash: '',
    chatCode: '',
    audioBlob: null,
    audioArrayBuffer: null,
    audioKeyData: null, // { hexHash, shortHash, cryptoKey, securityRating }
    audioDuration: 0,
    isRecording: false,
    hasAudioKey: false,
    activeRoomData: null,
    allMessages: [],
    // New Feature State: Lockfile & Live Verification
    uploadedLockfileContent: null,
    uploadedLockfileName: '',
    isRoomHashLocked: false,
    lockChallengeToken: null,
    activeLockfileBlob: null,
  };

  // DOM Elements
  const el = {
    // Top App Bar
    btnHeaderBackendPill: document.getElementById('btnHeaderBackendPill'),
    headerBackendDot: document.getElementById('headerBackendDot'),
    headerBackendLabel: document.getElementById('headerBackendLabel'),
    headerStatusGroup: document.getElementById('headerStatusGroup'),
    headerRoomCode: document.getElementById('headerRoomCode'),
    headerKeyIndicator: document.getElementById('headerKeyIndicator'),
    headerKeyStatusText: document.getElementById('headerKeyStatusText'),
    btnAudioSlotTrigger: document.getElementById('btnAudioSlotTrigger'),
    btnShareInvite: document.getElementById('btnShareInvite'),
    btnToggleAiColosseum: document.getElementById('btnToggleAiColosseum'),
    btnSettingsTrigger: document.getElementById('btnSettingsTrigger'),
    btnLeaveRoom: document.getElementById('btnLeaveRoom'),

    // Views
    onboardingView: document.getElementById('onboardingView'),
    chatView: document.getElementById('chatView'),

    // Onboarding Form
    btnRoleCreator: document.getElementById('btnRoleCreator'),
    btnRoleFrnd: document.getElementById('btnRoleFrnd'),
    inputUserName: document.getElementById('inputUserName'),
    blockRoomCode: document.getElementById('blockRoomCode'),
    inputRoomCode: document.getElementById('inputRoomCode'),
    audioMandatoryTag: document.getElementById('audioMandatoryTag'),
    deckStatusTag: document.getElementById('deckStatusTag'),

    // Lockfile Verification Elements (Dynamic on code input)
    blockLockfileUpload: document.getElementById('blockLockfileUpload'),
    inputLockfile: document.getElementById('inputLockfile'),
    lockfileDropZone: document.getElementById('lockfileDropZone'),
    btnBrowseLockfile: document.getElementById('btnBrowseLockfile'),
    lockfileStatusTitle: document.getElementById('lockfileStatusTitle'),
    lockfileDropTitle: document.getElementById('lockfileDropTitle'),
    lockfileDropSub: document.getElementById('lockfileDropSub'),
    btnRemoveLockfile: document.getElementById('btnRemoveLockfile'),

    // Cassette Deck
    cassetteUnit: document.getElementById('cassetteUnit'),
    leftSpool: document.getElementById('leftSpool'),
    rightSpool: document.getElementById('rightSpool'),
    recLed: document.getElementById('recLed'),
    tapeTimer: document.getElementById('tapeTimer'),
    tapeHash: document.getElementById('tapeHash'),
    audioFileInput: document.getElementById('audioFileInput'),
    btnUploadAudio: document.getElementById('btnUploadAudio'),
    btnRecordAudio: document.getElementById('btnRecordAudio'),
    recordBtnText: document.getElementById('recordBtnText'),
    btnSynthAudio: document.getElementById('btnSynthAudio'),
    btnPlayAudio: document.getElementById('btnPlayAudio'),
    playAudioLabel: document.getElementById('playAudioLabel'),
    btnDownloadAudio: document.getElementById('btnDownloadAudio'),
    audioDropZone: document.getElementById('audioDropZone'),

    // Console Actions
    btnSubmitConsole: document.getElementById('btnSubmitConsole'),
    btnSubmitConsoleLabel: document.getElementById('btnSubmitConsoleLabel'),
    btnJoinWithoutAudio: document.getElementById('btnJoinWithoutAudio'),

    // Chat View
    chatRoomCodeBadge: document.getElementById('chatRoomCodeBadge'),
    badgeRoomCodeDisplay: document.getElementById('badgeRoomCodeDisplay'),
    btnCopyInviteLink: document.getElementById('btnCopyInviteLink'),
    slotLed: document.getElementById('slotLed'),
    slotStatusHeadline: document.getElementById('slotStatusHeadline'),
    slotStatusSub: document.getElementById('slotStatusSub'),
    btnDockDownloadKey: document.getElementById('btnDockDownloadKey'),
    btnDockUploadKey: document.getElementById('btnDockUploadKey'),
    btnDockEjectKey: document.getElementById('btnDockEjectKey'),
    btnDockPurgeMessages: document.getElementById('btnDockPurgeMessages'),
    messagesList: document.getElementById('messagesList'),
    messagesDeck: document.getElementById('messagesDeck'),
    composerForm: document.getElementById('composerForm'),
    inputChatMessage: document.getElementById('inputChatMessage'),
    btnComposerDualAi: document.getElementById('btnComposerDualAi'),
    btnComposerSoloAi: document.getElementById('btnComposerSoloAi'),
    btnComposerDebate: document.getElementById('btnComposerDebate'),

    // Settings Modal (BYOB, Visitor Ledger, Hash Lock)
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    tabSettingsBackend: document.getElementById('tabSettingsBackend'),
    tabSettingsVisitors: document.getElementById('tabSettingsVisitors'),
    tabSettingsHashLock: document.getElementById('tabSettingsHashLock'),
    panelSettingsBackend: document.getElementById('panelSettingsBackend'),
    panelSettingsVisitors: document.getElementById('panelSettingsVisitors'),
    panelSettingsHashLock: document.getElementById('panelSettingsHashLock'),
    settingsModalFooter: document.getElementById('settingsModalFooter'),
    inputFirebaseConfig: document.getElementById('inputFirebaseConfig'),
    connectionTestStrip: document.getElementById('connectionTestStrip'),
    testIcon: document.getElementById('testIcon'),
    testMsg: document.getElementById('testMsg'),
    firebaseStatusBox: document.getElementById('firebaseStatusBox'),
    statusDot: document.getElementById('statusDot'),
    firebaseStatusText: document.getElementById('firebaseStatusText'),
    firebaseStatusSub: document.getElementById('firebaseStatusSub'),
    btnTestFirebasePing: document.getElementById('btnTestFirebasePing'),
    testBtnLabel: document.getElementById('testBtnLabel'),
    btnRevertServerDefault: document.getElementById('btnRevertServerDefault'),
    btnOfflineSync: document.getElementById('btnOfflineSync'),
    btnDeleteServerApi: document.getElementById('btnDeleteServerApi'),
    btnSaveFirebaseConfig: document.getElementById('btnSaveFirebaseConfig'),
    visitorLedgerList: document.getElementById('visitorLedgerList'),
    visitorCountTag: document.getElementById('visitorCountTag'),
    btnPurgeVisitorLedger: document.getElementById('btnPurgeVisitorLedger'),
    toggleLockChatWithHash: document.getElementById('toggleLockChatWithHash'),
    hashLockActiveBox: document.getElementById('hashLockActiveBox'),
    btnDownloadLockKeyfile: document.getElementById('btnDownloadLockKeyfile'),
    toastContainer: document.getElementById('toastContainer'),

    // Dual-AI Colosseum Modal
    aiColosseumModal: document.getElementById('aiColosseumModal'),
    btnCloseAiColosseum: document.getElementById('btnCloseAiColosseum'),
    btnCancelAiColosseum: document.getElementById('btnCancelAiColosseum'),
    selectAiModel1: document.getElementById('selectAiModel1'),
    selectAiModel2: document.getElementById('selectAiModel2'),
    badgeModel1: document.getElementById('badgeModel1'),
    badgeModel2: document.getElementById('badgeModel2'),
    btnSwapGladiators: document.getElementById('btnSwapGladiators'),
    tabColosseumDebate: document.getElementById('tabColosseumDebate'),
    tabColosseumVault: document.getElementById('tabColosseumVault'),
    panelColosseumDebate: document.getElementById('panelColosseumDebate'),
    panelColosseumVault: document.getElementById('panelColosseumVault'),
    inputDebateTopic: document.getElementById('inputDebateTopic'),
    selectDebateRounds: document.getElementById('selectDebateRounds'),
    checkBroadcastDebate: document.getElementById('checkBroadcastDebate'),
    debateStatusBanner: document.getElementById('debateStatusBanner'),
    debateStatusText: document.getElementById('debateStatusText'),
    btnStartDebate: document.getElementById('btnStartDebate'),
    btnStopDebate: document.getElementById('btnStopDebate'),
    btnResetDebate: document.getElementById('btnResetDebate'),
    selectVaultProvider: document.getElementById('selectVaultProvider'),
    inputVaultApiKey: document.getElementById('inputVaultApiKey'),
    btnSaveVaultKey: document.getElementById('btnSaveVaultKey'),
    btnDeleteVaultKey: document.getElementById('btnDeleteVaultKey'),
    btnPurgeAllVaultKeys: document.getElementById('btnPurgeAllVaultKeys'),
    vaultKeyStatusText: document.getElementById('vaultKeyStatusText'),

    // Catastrophe Modal
    catastropheModal: document.getElementById('catastropheModal'),
    btnCloseCatastrophe: document.getElementById('btnCloseCatastrophe'),
    btnRetryCatastrophe: document.getElementById('btnRetryCatastrophe'),
    catastropheMsg: document.getElementById('catastropheMsg'),

    // Audio Key Modal (3 Options: Record, Upload, MyInstants)
    audioKeyModal: document.getElementById('audioKeyModal'),
    btnCloseAudioKeyModal: document.getElementById('btnCloseAudioKeyModal'),
    btnCancelAudioKeyModal: document.getElementById('btnCancelAudioKeyModal'),
    tabOptRecord: document.getElementById('tabOptRecord'),
    tabOptUpload: document.getElementById('tabOptUpload'),
    tabOptMyInstants: document.getElementById('tabOptMyInstants'),
    panelOptRecord: document.getElementById('panelOptRecord'),
    panelOptUpload: document.getElementById('panelOptUpload'),
    panelOptMyInstants: document.getElementById('panelOptMyInstants'),
    modalRecTimer: document.getElementById('modalRecTimer'),
    modalRecStatus: document.getElementById('modalRecStatus'),
    btnModalRecord: document.getElementById('btnModalRecord'),
    modalRecordLabel: document.getElementById('modalRecordLabel'),
    modalAudioDropZone: document.getElementById('modalAudioDropZone'),
    btnModalBrowseAudio: document.getElementById('btnModalBrowseAudio'),
    inputMyInstantsUrl: document.getElementById('inputMyInstantsUrl'),
    btnLoadMyInstantsUrl: document.getElementById('btnLoadMyInstantsUrl'),
  };

  /**
   * Initialize Application
   */
  async function init() {
    setupEventListeners();
    ChatAudio.drawIdleWaveform();
    parseUrlParameters();
    updateUiForRole();
    populateAiModelDropdowns();

    // Securely fetch environment config from Vercel / serverless environment
    await ChatSync.fetchEnvConfig();
    updateBackendStatusUi();
  }

  /**
   * Check for '?room=CB-XXXX-XX' in URL
   */
  function parseUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
      setRole('frnd');
      el.inputRoomCode.value = roomFromUrl.toUpperCase();
      handleRoomCodeLiveCheck(roomFromUrl.toUpperCase());
      showToast(`Joined via invite link for Room ${roomFromUrl}`, 'success');
    }
  }

  /**
   * Set Active Role
   */
  function setRole(role) {
    state.role = role;
    if (role === 'creator') {
      el.btnRoleCreator.classList.add('active');
      el.btnRoleFrnd.classList.remove('active');
      el.blockRoomCode.style.display = 'none';
      if (el.blockLockfileUpload) el.blockLockfileUpload.style.display = 'none';
      el.audioMandatoryTag.textContent = 'REQUIRED FOR CREATOR';
      el.audioMandatoryTag.className = 'badge-recommended';
      el.btnSubmitConsoleLabel.textContent = 'INITIALIZE ENCRYPTED CHAMBER';
      el.btnJoinWithoutAudio.style.display = 'none';
    } else {
      el.btnRoleCreator.classList.remove('active');
      el.btnRoleFrnd.classList.add('active');
      el.blockRoomCode.style.display = 'block';
      el.audioMandatoryTag.textContent = 'OPTIONAL (SCRAMBLED IF EMPTY)';
      el.audioMandatoryTag.className = 'badge-recommended';
      el.btnSubmitConsoleLabel.textContent = state.isRoomHashLocked ? 'VERIFY .CBLOCK & ENTER CHAMBER' : 'ENTER CHAT WITH AUDIO KEY';
      el.btnJoinWithoutAudio.style.display = 'block';
      if (el.inputRoomCode.value) {
        handleRoomCodeLiveCheck(el.inputRoomCode.value.trim().toUpperCase());
      }
    }
  }

  function updateUiForRole() {
    setRole(state.role);
  }

  /**
   * Event Listeners Registration
   */
  function setupEventListeners() {
    // Role switchers
    el.btnRoleCreator.addEventListener('click', () => setRole('creator'));
    el.btnRoleFrnd.addEventListener('click', () => setRole('frnd'));

    // Real-time lock status fetch on code entry ("fetch everytime when inputed")
    let codeCheckTimeout = null;
    el.inputRoomCode.addEventListener('input', (e) => {
      clearTimeout(codeCheckTimeout);
      const val = e.target.value.trim().toUpperCase();
      codeCheckTimeout = setTimeout(() => handleRoomCodeLiveCheck(val), 280);
    });

    // Lockfile file picker & dropzone
    if (el.btnBrowseLockfile && el.inputLockfile) {
      el.btnBrowseLockfile.addEventListener('click', () => el.inputLockfile.click());
      el.inputLockfile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          processIncomingLockfile(e.target.files[0]);
        }
      });
    }

    if (el.lockfileDropZone) {
      ['dragenter', 'dragover'].forEach((eventName) => {
        el.lockfileDropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          el.lockfileDropZone.classList.add('drag-active');
        });
      });
      ['dragleave', 'drop'].forEach((eventName) => {
        el.lockfileDropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          el.lockfileDropZone.classList.remove('drag-active');
        });
      });
      el.lockfileDropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processIncomingLockfile(e.dataTransfer.files[0]);
        }
      });
    }

    // Audio upload trigger
    el.btnUploadAudio.addEventListener('click', () => el.audioFileInput.click());
    el.audioFileInput.addEventListener('change', handleAudioFileSelection);

    // Audio Synthesizer
    el.btnSynthAudio.addEventListener('click', handleSynthesizeAudioKey);

    // Audio Mic Recorder
    el.btnRecordAudio.addEventListener('click', handleToggleRecording);

    // Play/Pause Audio Key
    el.btnPlayAudio.addEventListener('click', handleTogglePlayAudio);

    // Download Audio Key
    el.btnDownloadAudio.addEventListener('click', handleDownloadAudioKey);
    el.btnDockDownloadKey.addEventListener('click', handleDownloadAudioKey);

    // Drag and Drop Audio
    ['dragenter', 'dragover'].forEach((eventName) => {
      el.audioDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.audioDropZone.classList.add('drag-active');
      });
    });
    ['dragleave', 'drop'].forEach((eventName) => {
      el.audioDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.audioDropZone.classList.remove('drag-active');
      });
    });
    el.audioDropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processIncomingAudioFile(e.dataTransfer.files[0]);
      }
    });

    // Console Submission
    el.btnSubmitConsole.addEventListener('click', handleConsoleSubmit);
    el.btnJoinWithoutAudio.addEventListener('click', () => handleConsoleSubmit(true));

    // Chat Actions
    el.composerForm.addEventListener('submit', handleSendMessage);
    el.chatRoomCodeBadge.addEventListener('click', copyRoomCodeToClipboard);
    el.btnCopyInviteLink.addEventListener('click', copyInviteLinkToClipboard);
    el.btnShareInvite.addEventListener('click', copyInviteLinkToClipboard);
    el.btnAudioSlotTrigger.addEventListener('click', promptChangeAudioKey);
    el.btnDockUploadKey.addEventListener('click', promptChangeAudioKey);
    el.btnDockEjectKey.addEventListener('click', handleEjectAudioKey);
    el.btnLeaveRoom.addEventListener('click', handleLeaveRoom);

    // Dual-AI & Solo-AI & Debate triggers in composer
    if (el.btnComposerDualAi) el.btnComposerDualAi.addEventListener('click', handleComposerDualAiPrompt);
    if (el.btnComposerSoloAi) el.btnComposerSoloAi.addEventListener('click', handleComposerSoloAiPrompt);
    if (el.btnComposerDebate) el.btnComposerDebate.addEventListener('click', openAiColosseumModal);
    if (el.btnToggleAiColosseum) el.btnToggleAiColosseum.addEventListener('click', openAiColosseumModal);
    if (el.btnDockPurgeMessages) el.btnDockPurgeMessages.addEventListener('click', handleDockPurgeMessages);
    if (el.btnRemoveLockfile) el.btnRemoveLockfile.addEventListener('click', handleRemoveLockfile);

    // Header Backend Pill
    if (el.btnHeaderBackendPill) {
      el.btnHeaderBackendPill.addEventListener('click', openSettingsModal);
    }

    // Settings Modal Tabs & Triggers
    el.btnSettingsTrigger.addEventListener('click', openSettingsModal);
    el.btnCloseSettings.addEventListener('click', closeSettingsModal);
    if (el.tabSettingsBackend) el.tabSettingsBackend.addEventListener('click', () => switchSettingsTab('backend'));
    if (el.tabSettingsVisitors) el.tabSettingsVisitors.addEventListener('click', () => switchSettingsTab('visitors'));
    if (el.tabSettingsHashLock) el.tabSettingsHashLock.addEventListener('click', () => switchSettingsTab('hashlock'));
    if (el.btnPurgeVisitorLedger) el.btnPurgeVisitorLedger.addEventListener('click', handlePurgeVisitorLedger);

    if (el.toggleLockChatWithHash) el.toggleLockChatWithHash.addEventListener('change', handleToggleHashLock);
    if (el.btnDownloadLockKeyfile) el.btnDownloadLockKeyfile.addEventListener('click', handleDownloadLockKeyfile);

    el.btnTestFirebasePing.addEventListener('click', handleTestFirebaseConnection);
    el.btnSaveFirebaseConfig.addEventListener('click', handleSaveFirebaseConfig);
    el.btnRevertServerDefault.addEventListener('click', handleRevertServerDefault);
    el.btnOfflineSync.addEventListener('click', handleOfflineSync);
    if (el.btnDeleteServerApi) el.btnDeleteServerApi.addEventListener('click', handleDeleteServerApi);

    // AI Colosseum Modal
    if (el.btnCloseAiColosseum) el.btnCloseAiColosseum.addEventListener('click', closeAiColosseumModal);
    if (el.btnCancelAiColosseum) el.btnCancelAiColosseum.addEventListener('click', closeAiColosseumModal);
    if (el.tabColosseumDebate) el.tabColosseumDebate.addEventListener('click', () => switchColosseumTab('debate'));
    if (el.tabColosseumVault) el.tabColosseumVault.addEventListener('click', () => switchColosseumTab('vault'));
    if (el.selectAiModel1) el.selectAiModel1.addEventListener('change', handleAiModel1Change);
    if (el.selectAiModel2) el.selectAiModel2.addEventListener('change', handleAiModel2Change);
    if (el.btnSwapGladiators) el.btnSwapGladiators.addEventListener('click', handleSwapGladiators);
    if (el.selectVaultProvider) el.selectVaultProvider.addEventListener('change', updateVaultKeyStatus);
    if (el.btnSaveVaultKey) el.btnSaveVaultKey.addEventListener('click', handleSaveVaultKey);
    if (el.btnDeleteVaultKey) el.btnDeleteVaultKey.addEventListener('click', handleDeleteVaultKey);
    if (el.btnPurgeAllVaultKeys) el.btnPurgeAllVaultKeys.addEventListener('click', handlePurgeAllVaultKeys);
    if (el.btnStartDebate) el.btnStartDebate.addEventListener('click', handleLaunchDebate);
    if (el.btnStopDebate) el.btnStopDebate.addEventListener('click', handleStopDebate);
    if (el.btnResetDebate) el.btnResetDebate.addEventListener('click', handleResetDebate);

    // Catastrophe Modal
    if (el.btnCloseCatastrophe) {
      el.btnCloseCatastrophe.addEventListener('click', () => {
        el.catastropheModal.style.display = 'none';
        el.catastropheModal.classList.remove('modal-active');
      });
    }
    if (el.btnRetryCatastrophe) el.btnRetryCatastrophe.addEventListener('click', handleRetryCatastrophe);

    // Audio Key Modal (3 Options: Record, Upload, MyInstants)
    el.btnCloseAudioKeyModal.addEventListener('click', closeAudioKeyModal);
    el.btnCancelAudioKeyModal.addEventListener('click', closeAudioKeyModal);
    el.tabOptRecord.addEventListener('click', () => switchAudioKeyTab('record'));
    el.tabOptUpload.addEventListener('click', () => switchAudioKeyTab('upload'));
    el.tabOptMyInstants.addEventListener('click', () => switchAudioKeyTab('myinstants'));
    el.btnModalRecord.addEventListener('click', handleToggleModalRecording);
    el.btnModalBrowseAudio.addEventListener('click', () => el.audioFileInput.click());

    // Modal Dropzone
    ['dragenter', 'dragover'].forEach((eventName) => {
      el.modalAudioDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.modalAudioDropZone.classList.add('drag-active');
      });
    });
    ['dragleave', 'drop'].forEach((eventName) => {
      el.modalAudioDropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        el.modalAudioDropZone.classList.remove('drag-active');
      });
    });
    el.modalAudioDropZone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processIncomingAudioFile(e.dataTransfer.files[0]);
        closeAudioKeyModal();
      }
    });

    // MyInstants Soundboard Presets
    document.querySelectorAll('.tactile-instant-card').forEach((card) => {
      card.addEventListener('click', () => handleInstantPresetClick(card.dataset.sound));
    });

    // MyInstants Custom URL Loader
    el.btnLoadMyInstantsUrl.addEventListener('click', handleLoadMyInstantsUrl);
  }

  /**
   * Live Check Room Lock Status ("fetch everytime when inputed")
   */
  async function handleRoomCodeLiveCheck(roomCode) {
    if (!roomCode || roomCode.length < 4) {
      if (el.blockLockfileUpload) el.blockLockfileUpload.style.display = 'none';
      state.isRoomHashLocked = false;
      return;
    }

    try {
      const lockStatus = await ChatSync.checkRoomLockStatus(roomCode);
      if (lockStatus.isHashLocked) {
        state.isRoomHashLocked = true;
        state.lockChallengeToken = lockStatus.challengeToken;
        if (el.blockLockfileUpload) {
          el.blockLockfileUpload.style.display = 'block';
          el.lockfileStatusTitle.textContent = `ROOM ${roomCode} IS CIPHER-LOCKED`;
        }
        if (el.btnSubmitConsoleLabel && state.role === 'frnd') {
          el.btnSubmitConsoleLabel.textContent = 'VERIFY .CBLOCK & ENTER CHAMBER';
        }
      } else {
        state.isRoomHashLocked = false;
        state.lockChallengeToken = null;
        if (el.blockLockfileUpload) el.blockLockfileUpload.style.display = 'none';
        if (el.btnSubmitConsoleLabel && state.role === 'frnd') {
          el.btnSubmitConsoleLabel.textContent = 'ENTER CHAT WITH AUDIO KEY';
        }
      }
    } catch (e) {
      console.warn('Error checking room lock status:', e);
    }
  }

  /**
   * Process uploaded .cblock security file
   */
  async function processIncomingLockfile(file) {
    if (!file.name.endsWith('.cblock') && !file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
      showToast('Please upload a valid .cblock security keyfile!', 'error');
      return;
    }

    try {
      const text = await file.text();
      state.uploadedLockfileContent = text;
      state.uploadedLockfileName = file.name;
      el.lockfileDropZone.classList.add('verified-file');
      el.lockfileDropTitle.textContent = `Keyfile Staged: ${file.name}`;
      el.lockfileDropSub.textContent = `Ready to decrypt using loaded Audio Key (${(file.size / 1024).toFixed(1)} KB)`;
      if (el.btnRemoveLockfile) el.btnRemoveLockfile.style.display = 'inline-block';
      showToast(`Keyfile ${file.name} staged for decryption verification!`, 'info');
    } catch (err) {
      showToast('Could not read keyfile: ' + err.message, 'error');
    }
  }

  /**
   * Opposite / Inverse of uploading a lockfile:
   * Remove, detach and unstage the uploaded .cblock file
   */
  function handleRemoveLockfile() {
    state.uploadedLockfileContent = null;
    state.uploadedLockfileName = '';
    if (el.inputLockfile) el.inputLockfile.value = '';
    if (el.lockfileDropZone) el.lockfileDropZone.classList.remove('verified-file');
    if (el.lockfileDropTitle) el.lockfileDropTitle.textContent = 'Click to Browse or Drag .cblock Keyfile Here';
    if (el.lockfileDropSub) el.lockfileDropSub.textContent = 'Mandatory: Will be decrypted and verified using your Audio Key';
    if (el.btnRemoveLockfile) el.btnRemoveLockfile.style.display = 'none';
    showToast('Removed and detached .cblock keyfile.', 'info');
  }

  /**
   * Opposite / Emergency Recovery for Lockout Catastrophe Screen:
   * Dismiss catastrophe screen and reset gate so friend can retry with another key/file
   */
  function handleRetryCatastrophe() {
    if (el.catastropheModal) {
      el.catastropheModal.style.display = 'none';
      el.catastropheModal.classList.remove('modal-active');
    }
    handleRemoveLockfile();
    if (el.blockLockfileUpload) {
      el.blockLockfileUpload.scrollIntoView({ behavior: 'smooth' });
    }
    showToast('Authentication gate reset. Re-attach your keyfile or load the correct audio key.', 'info');
  }

  /**
   * Dramatic Lockout Catastrophe Screen
   */
  function triggerCatastropheLockout(errorMessage) {
    if (el.catastropheMsg) {
      el.catastropheMsg.textContent = errorMessage || 'The audio key failed to decrypt the .cblock security token! Access denied.';
    }
    el.catastropheModal.style.display = 'flex';
    requestAnimationFrame(() => {
      el.catastropheModal.classList.add('modal-active');
    });
    showToast('CRITICAL: Authentication catastrophe! Access Denied.', 'error');
  }

  /**
   * Handle Audio File Selected from Disk
   */
  function handleAudioFileSelection(e) {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingAudioFile(e.target.files[0]);
    }
  }

  /**
   * Process and Hash Incoming Audio File (Hardened 250k PBKDF2)
   */
  async function processIncomingAudioFile(file) {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|webm|flac)$/i.test(file.name)) {
      showToast('Please upload a valid audio file (.wav, .mp3, .ogg, .m4a)', 'error');
      return;
    }

    try {
      showToast(`Loading audio key: ${file.name}...`, 'info');
      spinSpools(true);
      el.deckStatusTag.textContent = 'DERIVING 250K PBKDF2...';

      const arrayBuffer = await file.arrayBuffer();
      await applyAudioBufferAsKey(arrayBuffer, file.name, 0, file);

      showToast(`Audio key verified! Hardened 256-bit symmetric cipher active.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to process audio file: ' + err.message, 'error');
      el.deckStatusTag.textContent = 'KEY ERROR';
    } finally {
      spinSpools(false);
    }
  }

  /**
   * Synthesize Clean 12s Audio Sample Key
   */
  async function handleSynthesizeAudioKey() {
    try {
      showToast('Synthesizing 12s acoustic ambient key...', 'info');
      spinSpools(true);
      el.deckStatusTag.textContent = 'SYNTHESIZING...';

      const synthResult = await ChatAudio.synthesizeSampleKey();
      await applyAudioBufferAsKey(synthResult.arrayBuffer, synthResult.name, synthResult.duration, synthResult.blob);

      showToast('Acoustic harmonic key generated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Synthesis failed: ' + err.message, 'error');
    } finally {
      spinSpools(false);
    }
  }

  /**
   * Start / Stop Microphone Voice Recording
   */
  function handleToggleRecording() {
    if (state.isRecording) {
      ChatAudio.stopRecording();
      state.isRecording = false;
      el.recLed.classList.remove('recording');
      el.btnRecordAudio.classList.remove('active-recording');
      el.recordBtnText.textContent = 'Record Mic (15s)';
      spinSpools(false);
      return;
    }

    state.isRecording = true;
    el.recLed.classList.add('recording');
    el.btnRecordAudio.classList.add('active-recording');
    el.deckStatusTag.textContent = 'RECORDING LIVE...';
    spinSpools(true);

    ChatAudio.startRecording(
      (elapsedSec) => {
        el.tapeTimer.textContent = formatTimer(elapsedSec);
        el.recordBtnText.textContent = `Stop (${Math.ceil(15 - elapsedSec)}s)`;
      },
      async (result) => {
        state.isRecording = false;
        el.recLed.classList.remove('recording');
        el.btnRecordAudio.classList.remove('active-recording');
        el.recordBtnText.textContent = 'Record Mic (15s)';
        spinSpools(false);

        await applyAudioBufferAsKey(result.arrayBuffer, result.name, result.duration, result.blob);
        showToast('Voice memo captured as WAV and derived as hardened 256-bit key!', 'success');
      },
      (err) => {
        state.isRecording = false;
        el.recLed.classList.remove('recording');
        el.btnRecordAudio.classList.remove('active-recording');
        el.recordBtnText.textContent = 'Record Mic (15s)';
        spinSpools(false);
        showToast('Microphone access denied: ' + err.message, 'error');
      }
    );
  }

  /**
   * Apply ArrayBuffer as Active Audio Key & Compute Hardened Key (Zero Hash Leaked)
   */
  async function applyAudioBufferAsKey(arrayBuffer, filename = 'audio_sample.wav', durationHint = 0, blob = null) {
    state.audioArrayBuffer = arrayBuffer;
    state.audioBlob = blob || new Blob([arrayBuffer], { type: 'audio/wav' });
    state.audioFileName = filename;
    state.hasAudioKey = true;

    // Derive 256-bit AES-GCM Key via 250,000 PBKDF2 rounds
    state.audioKeyData = await ChatCrypto.deriveAudioKey(arrayBuffer);

    // Decode for waveform visualizer & playback
    const ctx = ChatAudio.getAudioContext();
    try {
      const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
      ChatAudio.setLoadedBuffer(decoded);
      ChatAudio.drawDecodedWaveform(decoded);
      state.audioDuration = decoded.duration;
      el.tapeTimer.textContent = formatTimer(decoded.duration);
    } catch (e) {
      if (durationHint) {
        state.audioDuration = durationHint;
        el.tapeTimer.textContent = formatTimer(durationHint);
      }
    }

    // Stealth UI: No raw hashes displayed openly!
    el.deckStatusTag.textContent = 'SEALED & READY';
    el.deckStatusTag.style.color = '#10b981';
    el.tapeHash.textContent = 'ACOUSTIC CIPHER: SEALED 🛡️';
    el.btnPlayAudio.style.display = 'inline-flex';
    el.btnDownloadAudio.style.display = 'inline-flex';

    if (state.chatCode) {
      updateChatHeaderKeyUi(true);
      reRenderAllMessages();
    }
  }

  /**
   * Trigger Download of Active Audio Key (.wav)
   */
  function handleDownloadAudioKey() {
    if (!state.audioArrayBuffer) {
      showToast('No audio key loaded to download.', 'error');
      return;
    }

    const blobToDownload = state.audioBlob || new Blob([state.audioArrayBuffer], { type: 'audio/wav' });
    const filename = `ChatBaiter_AudioKey_Sealed.wav`;

    ChatAudio.downloadAudioFile(blobToDownload, filename);
    showToast(`Audio key downloaded (${filename})! Send this file to your friend so they can decrypt.`, 'success');
  }

  /**
   * Play / Pause Audio
   */
  function handleTogglePlayAudio() {
    if (!state.audioArrayBuffer) return;

    ChatAudio.togglePlayAudio(state.audioArrayBuffer, (isPlaying) => {
      spinSpools(isPlaying);
      el.playAudioLabel.textContent = isPlaying ? 'Stop Audio' : 'Play Key';
    });
  }

  /**
   * Submit Console (Join or Create Room with .cblock Verification)
   */
  async function handleConsoleSubmit(skipAudio = false) {
    const name = el.inputUserName.value.trim();
    if (!name) {
      showToast('Please enter your name.', 'error');
      el.inputUserName.focus();
      return;
    }
    state.userName = name;

    // Creator Flow
    if (state.role === 'creator') {
      if (!state.hasAudioKey || !state.audioKeyData) {
        showToast('Creator must upload, synthesize, or record an audio key!', 'error');
        return;
      }

      const chatCode = generateChatCode();
      state.chatCode = chatCode;

      state.userHash = await ChatCrypto.hashUsername(name, state.audioKeyData.hexHash);

      showToast(`Creating encrypted room ${chatCode}...`, 'info');

      await ChatSync.createRoom({
        chatCode: chatCode,
        audioHash: state.audioKeyData.hexHash,
        userHash: state.userHash,
        creatorName: name,
      });

      // Log creator as first entry in visitor ledger
      await ChatSync.logVisitorPresence(chatCode, { name, userHash: state.userHash });

      enterChatRoom(chatCode);
      showToast(`Room ${chatCode} initialized! Invite link ready.`, 'success');
      return;
    }

    // Frnd Flow (With Real-Time .cblock Verification)
    if (state.role === 'frnd') {
      const roomCode = el.inputRoomCode.value.trim().toUpperCase();
      if (!roomCode) {
        showToast('Please enter the Chat Code.', 'error');
        el.inputRoomCode.focus();
        return;
      }
      state.chatCode = roomCode;

      // 1. Fetch live lock status
      const lockStatus = await ChatSync.checkRoomLockStatus(roomCode);
      if (lockStatus.isHashLocked) {
        // If room is locked, friend MUST have uploaded .cblock file
        if (!state.uploadedLockfileContent) {
          showToast('This room is sealed with a .cblock keyfile! You must upload the .cblock file provided by the creator.', 'error');
          if (el.blockLockfileUpload) {
            el.blockLockfileUpload.style.display = 'block';
            el.lockfileDropZone.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }

        if (!state.hasAudioKey || !state.audioKeyData) {
          showToast('You must load your Audio Key to decrypt and verify the .cblock keyfile!', 'error');
          return;
        }

        // Verify .cblock file against audio key
        const verification = await ChatCrypto.verifyLockKeyfile(
          state.uploadedLockfileContent,
          roomCode,
          state.audioKeyData.cryptoKey
        );

        if (!verification.valid) {
          // Authentication failure! Lockout catastrophe
          triggerCatastropheLockout(
            verification.error || 'The audio key failed to decrypt the .cblock security token! Intrusion recorded.'
          );
          return;
        }

        showToast('Voila! .cblock Cryptographic seal verified! Access granted.', 'success');
      }

      // Calculate user hash
      const audioHash = state.hasAudioKey && state.audioKeyData ? state.audioKeyData.hexHash : 'NO_AUDIO_KEY';
      state.userHash = await ChatCrypto.hashUsername(name, audioHash);

      // Log visitor in presence ledger
      await ChatSync.logVisitorPresence(roomCode, { name, userHash: state.userHash });

      if (skipAudio) {
        state.hasAudioKey = false;
        state.audioKeyData = null;
        showToast(`Entering room in Scrambled View (No Audio Key)...`, 'info');
      } else if (!state.hasAudioKey) {
        showToast('No audio key loaded. You will enter in Scrambled View.', 'info');
      }

      enterChatRoom(roomCode);
    }
  }

  /**
   * Enter Chat Room Interface
   */
  async function enterChatRoom(chatCode) {
    el.onboardingView.classList.add('view-morph-out');

    setTimeout(() => {
      el.onboardingView.style.display = 'none';
      el.onboardingView.classList.remove('view-morph-out');

      el.chatView.style.display = 'flex';
      el.chatView.classList.add('view-morph-in');
      el.headerStatusGroup.style.display = 'flex';

      el.headerRoomCode.textContent = chatCode;
      el.badgeRoomCodeDisplay.textContent = chatCode;

      updateChatHeaderKeyUi(state.hasAudioKey);

      el.messagesList.innerHTML = '';
      state.allMessages = [];

      ChatSync.subscribeRoom(chatCode, (newMsg) => {
        appendMessageToChat(newMsg);
      });

      const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?room=' + chatCode;
      window.history.replaceState({ path: newUrl }, '', newUrl);

      scrollChatToBottom();

      setTimeout(() => el.chatView.classList.remove('view-morph-in'), 480);
    }, 280);
  }

  /**
   * Update Key UI in Chat Header & Tape Dock (Zero Hash Leaks)
   */
  function updateChatHeaderKeyUi(hasKey) {
    if (hasKey && state.audioKeyData) {
      el.headerKeyIndicator.className = 'key-indicator key-active';
      el.headerKeyStatusText.textContent = 'KEY: SEALED 🛡️';

      el.slotLed.className = 'slot-led unlocked';
      el.slotStatusHeadline.textContent = 'AUDIO KEY VERIFIED & ACTIVE';
      el.slotStatusSub.textContent = `Acoustic Cipher: Sealed • 250,000 PBKDF2 Rounds`;
      el.btnDockEjectKey.style.display = 'inline-block';
      el.btnDockDownloadKey.style.display = 'inline-block';
    } else {
      el.headerKeyIndicator.className = 'key-indicator key-missing';
      el.headerKeyStatusText.textContent = 'NO AUDIO KEY (SCRAMBLED)';

      el.slotLed.className = 'slot-led scrambled';
      el.slotStatusHeadline.textContent = 'SCRAMBLED MODE (NO KEY)';
      el.slotStatusSub.textContent = 'Upload matching 10–15s audio key to unscramble messages';
      el.btnDockEjectKey.style.display = 'none';
      el.btnDockDownloadKey.style.display = 'none';
    }
  }

  /**
   * Send Encrypted Message
   */
  async function handleSendMessage(e) {
    e.preventDefault();
    const text = el.inputChatMessage.value.trim();
    if (!text) return;

    if (!state.hasAudioKey || !state.audioKeyData) {
      showToast('Cannot send message: You must load an audio encryption key first!', 'error');
      promptChangeAudioKey();
      return;
    }

    try {
      const encryptedPayload = await ChatCrypto.encryptMessage(text, state.audioKeyData.cryptoKey);

      await ChatSync.sendMessage(state.chatCode, {
        senderName: state.userName,
        senderHash: state.userHash,
        encrypted: encryptedPayload,
      });

      el.inputChatMessage.value = '';
    } catch (err) {
      console.error(err);
      showToast('Encryption failed: ' + err.message, 'error');
    }
  }

  /**
   * Render or Append a Message in the Chat Deck
   */
  async function appendMessageToChat(msg) {
    state.allMessages.push(msg);

    const isOwn = msg.senderName === state.userName;
    const isAi = Boolean(msg.isAiMessage || msg.senderName.startsWith('🤖'));

    const row = document.createElement('div');
    row.className = `msg-row ${isOwn ? 'own-msg' : 'peer-msg'} ${isAi ? 'ai-msg-row' : ''}`;
    row.dataset.msgId = msg.id;

    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Header meta
    const meta = document.createElement('div');
    meta.className = 'msg-header-meta';
    if (isAi) {
      meta.innerHTML = `<span class="msg-sender" style="color: ${msg.aiColor || 'var(--accent-cyan)'}; font-weight: 700;">${escapeHtml(msg.senderName)}</span> <span>${escapeHtml(msg.senderHash || '#AI')}</span> • <span>${timeStr}</span>`;
    } else {
      meta.innerHTML = `<span class="msg-sender">${escapeHtml(msg.senderName)}</span> <span>${escapeHtml(msg.senderHash || '')}</span> • <span>${timeStr}</span>`;
    }
    row.appendChild(meta);

    // Message Card Body
    const card = document.createElement('div');
    card.className = `msg-card ${isAi ? 'ai-dual-card' : ''}`;
    if (isAi && msg.aiColor) {
      card.style.borderLeftColor = msg.aiColor;
    }
    row.appendChild(card);

    await renderCardContent(card, msg);

    el.messagesList.appendChild(row);
    scrollChatToBottom();
  }

  /**
   * Character-by-Character Morph & Dissolve Animation
   */
  function animateMorphDissolveUnscramble(cardElement, targetText, duration = 460) {
    cardElement.className = 'msg-card unlocked-card morph-decrypting';
    setTimeout(() => cardElement.classList.remove('morph-decrypting'), 700);

    const chars = '█▓▒░#$!%&01ABCDEF';
    const totalChars = targetText.length;
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const resolvedCount = Math.floor(progress * totalChars);

      let html = '';
      for (let i = 0; i < totalChars; i++) {
        const char = targetText[i];
        if (char === ' ') {
          html += ' ';
        } else if (i < resolvedCount) {
          html += `<span class="char-resolving">${escapeHtml(char)}</span>`;
        } else if (i === resolvedCount) {
          const glyph = chars[Math.floor(Math.random() * chars.length)];
          html += `<span class="char-resolving char-glitch">${glyph}</span>`;
        } else {
          const glyph = chars[Math.floor(Math.random() * chars.length)];
          html += `<span class="char-resolving" style="opacity: 0.55;">${glyph}</span>`;
        }
      }

      cardElement.innerHTML = `<div class="msg-text">${html}</div>`;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        cardElement.innerHTML = `<div class="msg-text">${escapeHtml(targetText)}</div>`;
      }
    }

    requestAnimationFrame(frame);
  }

  /**
   * Scramble Glitch Morph & Dissolve
   */
  function animateMorphDissolveScramble(cardElement, length = 24) {
    cardElement.className = 'msg-card scrambled-card morph-scrambling';
    setTimeout(() => cardElement.classList.remove('morph-scrambling'), 600);

    const scrambled = ChatCrypto.generateScrambledText(length);
    cardElement.innerHTML = `
      <div class="scrambled-text-box">${scrambled}</div>
      <div class="scrambled-badge">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span>Encrypted with Audio Key • Locked</span>
      </div>
    `;
  }

  /**
   * Render Card Content (Decrypted or Scrambled)
   */
  async function renderCardContent(cardElement, msg, isLiveTransition = false) {
    if (state.hasAudioKey && state.audioKeyData) {
      try {
        const decryptedText = await ChatCrypto.decryptMessage(msg.encrypted, state.audioKeyData.cryptoKey);
        const wasScrambled = cardElement.classList.contains('scrambled-card');

        if (wasScrambled || isLiveTransition) {
          animateMorphDissolveUnscramble(cardElement, decryptedText);
        } else {
          cardElement.className = `msg-card unlocked-card ${msg.isAiMessage ? 'ai-dual-card' : ''}`;
          if (msg.isAiMessage && msg.aiColor) {
            cardElement.style.borderLeftColor = msg.aiColor;
          }
          cardElement.innerHTML = `<div class="msg-text">${escapeHtml(decryptedText)}</div>`;
        }
        return;
      } catch (err) {
        // Wrong audio key
      }
    }

    // Scrambled view
    const wasUnlocked = cardElement.classList.contains('unlocked-card');
    if (wasUnlocked || isLiveTransition) {
      animateMorphDissolveScramble(cardElement, msg.encrypted ? msg.encrypted.length : 24);
    } else {
      cardElement.className = 'msg-card scrambled-card';
      const scrambled = ChatCrypto.generateScrambledText(msg.encrypted ? msg.encrypted.length : 24);
      cardElement.innerHTML = `
        <div class="scrambled-text-box">${scrambled}</div>
        <div class="scrambled-badge">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Encrypted with Audio Key • Locked</span>
        </div>
      `;
    }
  }

  /**
   * Re-render all messages with live morph animations
   */
  async function reRenderAllMessages(isLiveTransition = true) {
    const cards = el.messagesList.querySelectorAll('.msg-row');
    for (const row of cards) {
      const msgId = row.dataset.msgId;
      const msg = state.allMessages.find((m) => m.id === msgId);
      if (msg) {
        const card = row.querySelector('.msg-card');
        if (card) {
          await renderCardContent(card, msg, isLiveTransition);
        }
      }
    }
    scrollChatToBottom();
  }

  /**
   * Eject Audio Key
   */
  function handleEjectAudioKey() {
    if (state.audioKeyData) {
      ChatCrypto.zeroizeKeyMemory(state.audioKeyData);
    }
    state.hasAudioKey = false;
    state.audioKeyData = null;
    updateChatHeaderKeyUi(false);
    reRenderAllMessages();
    showToast('Audio key ejected & memory zeroized. Terminal switched to Scrambled View.', 'info');
  }

  function promptChangeAudioKey() {
    openAudioKeyModal();
  }

  function openAudioKeyModal() {
    switchAudioKeyTab('record');
    el.audioKeyModal.style.display = 'flex';
    requestAnimationFrame(() => {
      el.audioKeyModal.classList.add('modal-active');
    });
  }

  function closeAudioKeyModal() {
    if (state.isModalRecording) {
      ChatAudio.stopRecording();
      state.isModalRecording = false;
      el.modalRecordLabel.textContent = 'Start 15s Recording';
      el.modalRecStatus.textContent = 'READY TO RECORD';
    }
    el.audioKeyModal.classList.remove('modal-active');
    setTimeout(() => {
      el.audioKeyModal.style.display = 'none';
    }, 280);
  }

  function switchAudioKeyTab(tabName) {
    el.tabOptRecord.classList.remove('active');
    el.tabOptUpload.classList.remove('active');
    el.tabOptMyInstants.classList.remove('active');

    el.panelOptRecord.style.display = 'none';
    el.panelOptUpload.style.display = 'none';
    el.panelOptMyInstants.style.display = 'none';

    if (tabName === 'record') {
      el.tabOptRecord.classList.add('active');
      el.panelOptRecord.style.display = 'block';
    } else if (tabName === 'upload') {
      el.tabOptUpload.classList.add('active');
      el.panelOptUpload.style.display = 'block';
    } else if (tabName === 'myinstants') {
      el.tabOptMyInstants.classList.add('active');
      el.panelOptMyInstants.style.display = 'block';
    }
  }

  function handleToggleModalRecording() {
    if (state.isModalRecording) {
      ChatAudio.stopRecording();
      state.isModalRecording = false;
      el.modalRecordLabel.textContent = 'Start 15s Recording';
      el.modalRecStatus.textContent = 'STOPPED';
      spinSpools(false);
      return;
    }

    state.isModalRecording = true;
    el.modalRecordLabel.textContent = 'Stop Recording';
    el.modalRecStatus.textContent = 'RECORDING LIVE MIC...';
    spinSpools(true);

    ChatAudio.startRecording(
      (elapsedSec) => {
        el.modalRecTimer.textContent = formatTimer(elapsedSec);
        el.modalRecordLabel.textContent = `Stop (${Math.ceil(15 - elapsedSec)}s)`;
      },
      async (result) => {
        state.isModalRecording = false;
        el.modalRecordLabel.textContent = 'Start 15s Recording';
        el.modalRecStatus.textContent = 'RECORDING COMPLETE';
        spinSpools(false);

        await applyAudioBufferAsKey(result.arrayBuffer, result.name, result.duration, result.blob);
        closeAudioKeyModal();
        showToast('Voice memo captured and derived as 256-bit key!', 'success');
      },
      (err) => {
        state.isModalRecording = false;
        el.modalRecordLabel.textContent = 'Start 15s Recording';
        el.modalRecStatus.textContent = 'ERROR';
        spinSpools(false);
        showToast('Microphone access denied: ' + err.message, 'error');
      }
    );
  }

  async function handleInstantPresetClick(soundType) {
    try {
      showToast(`Loading MyInstants ${soundType.toUpperCase()} sound key...`, 'info');
      spinSpools(true);

      const soundResult = await ChatAudio.synthesizeMemePreset(soundType);
      await applyAudioBufferAsKey(soundResult.arrayBuffer, soundResult.name, soundResult.duration, soundResult.blob);

      closeAudioKeyModal();
      showToast(`MyInstants '${soundType.toUpperCase()}' active! Messages decrypted.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to synthesize instant sound: ' + err.message, 'error');
    } finally {
      spinSpools(false);
    }
  }

  async function handleLoadMyInstantsUrl() {
    const url = el.inputMyInstantsUrl.value.trim();
    if (!url) {
      showToast('Please enter an audio or MP3 URL.', 'error');
      return;
    }

    try {
      showToast('Fetching audio from URL...', 'info');
      spinSpools(true);

      const result = await ChatAudio.fetchAudioFromUrl(url);
      await applyAudioBufferAsKey(result.arrayBuffer, result.name, 0, result.blob);

      closeAudioKeyModal();
      showToast('MyInstants audio key loaded and verified!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not load URL directly (CORS). Download the MP3 from MyInstants and drag it into Upload tab!', 'error');
    } finally {
      spinSpools(false);
    }
  }

  function handleLeaveRoom() {
    ChatSync.unsubscribe();
    state.chatCode = '';
    state.allMessages = [];

    el.chatView.classList.add('view-morph-out');

    setTimeout(() => {
      el.chatView.style.display = 'none';
      el.chatView.classList.remove('view-morph-out');
      el.headerStatusGroup.style.display = 'none';

      el.onboardingView.style.display = 'block';
      el.onboardingView.classList.add('view-morph-in');

      const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

      setTimeout(() => el.onboardingView.classList.remove('view-morph-in'), 480);
      showToast('Exited chat room.', 'info');
    }, 280);
  }

  function copyRoomCodeToClipboard() {
    if (!state.chatCode) return;
    navigator.clipboard.writeText(state.chatCode).then(() => {
      showToast(`Chat Code ${state.chatCode} copied to clipboard!`, 'success');
    });
  }

  function copyInviteLinkToClipboard() {
    if (!state.chatCode) return;
    const inviteUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?room=' + state.chatCode;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      showToast(`Invite link copied to clipboard! Share with your friend.`, 'success');
    });
  }

  function spinSpools(active) {
    if (active) {
      el.leftSpool.classList.add('spinning');
      el.rightSpool.classList.add('spinning');
    } else {
      el.leftSpool.classList.remove('spinning');
      el.rightSpool.classList.remove('spinning');
    }
  }

  function formatTimer(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    const ms = Math.floor((sec % 1) * 10);
    return `${m}:${s}.${ms}`;
  }

  function generateChatCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CB-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    code += '-';
    for (let i = 0; i < 2; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function scrollChatToBottom() {
    setTimeout(() => {
      el.messagesDeck.scrollTop = el.messagesDeck.scrollHeight;
    }, 50);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /* ======================================================== */
  /* SETTINGS MODAL: BYOB, VISITOR LEDGER & HASH PASSWORD LOCK */
  /* ======================================================== */
  function openSettingsModal() {
    const info = ChatSync.getBackendInfo();

    if (el.connectionTestStrip) {
      el.connectionTestStrip.style.display = 'none';
      el.connectionTestStrip.className = 'connection-test-strip';
    }

    if (info.isCustom && info.activeConfig) {
      el.inputFirebaseConfig.value = JSON.stringify(info.activeConfig, null, 2);
    } else if (info.isServer) {
      el.inputFirebaseConfig.value =
        '// Currently connected to Server Default Firebase (Cloud Firestore 🔒)\n// To take 100% private data control, paste your Firebase snippet below and click "Save & Connect":\n// const firebaseConfig = { apiKey: "AIzaSy...", projectId: "..." };';
    } else {
      el.inputFirebaseConfig.value =
        '// Currently in Offline P2P Mode (Zero Cloud Connections)\n// Paste your private Firebase snippet below to connect:\n// const firebaseConfig = { apiKey: "AIzaSy...", projectId: "..." };';
    }

    updateBackendStatusUi();
    switchSettingsTab('backend');

    el.settingsModal.style.display = 'flex';
    requestAnimationFrame(() => {
      el.settingsModal.classList.add('modal-active');
    });
  }

  function closeSettingsModal() {
    el.settingsModal.classList.remove('modal-active');
    setTimeout(() => {
      el.settingsModal.style.display = 'none';
    }, 280);
  }

  function switchSettingsTab(tab) {
    if (el.tabSettingsBackend) el.tabSettingsBackend.classList.toggle('active', tab === 'backend');
    if (el.tabSettingsVisitors) el.tabSettingsVisitors.classList.toggle('active', tab === 'visitors');
    if (el.tabSettingsHashLock) el.tabSettingsHashLock.classList.toggle('active', tab === 'hashlock');

    if (el.panelSettingsBackend) el.panelSettingsBackend.style.display = tab === 'backend' ? 'block' : 'none';
    if (el.panelSettingsVisitors) el.panelSettingsVisitors.style.display = tab === 'visitors' ? 'block' : 'none';
    if (el.panelSettingsHashLock) el.panelSettingsHashLock.style.display = tab === 'hashlock' ? 'block' : 'none';
    if (el.settingsModalFooter) el.settingsModalFooter.style.display = tab === 'backend' ? 'flex' : 'none';

    if (tab === 'visitors') {
      renderVisitorLedger();
    } else if (tab === 'hashlock') {
      syncHashLockUi();
    }
  }

  async function renderVisitorLedger() {
    if (!state.chatCode) {
      el.visitorLedgerList.innerHTML = '<div class="empty-ledger-state">Join or initialize a room to audit active operative presence.</div>';
      el.visitorCountTag.textContent = '0 Visitors';
      return;
    }

    el.visitorLedgerList.innerHTML = '<div class="empty-ledger-state">Auditing presence from Firestore...</div>';
    const visitors = await ChatSync.getRoomVisitors(state.chatCode);
    el.visitorCountTag.textContent = `${visitors.length} Visitor${visitors.length === 1 ? '' : 's'}`;

    if (visitors.length === 0) {
      el.visitorLedgerList.innerHTML = '<div class="empty-ledger-state">No other operatives detected yet.</div>';
      return;
    }

    el.visitorLedgerList.innerHTML = '';
    visitors.forEach((v) => {
      const card = document.createElement('div');
      card.className = 'visitor-card';
      const timeStr = new Date(v.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isYou = v.name === state.userName;

      card.innerHTML = `
        <div class="visitor-left">
          <div class="visitor-avatar">${v.name.charAt(0).toUpperCase()}</div>
          <div class="visitor-meta">
            <span class="visitor-name">
              ${escapeHtml(v.name)} ${isYou ? '<strong style="color: var(--accent-emerald); font-size: 0.65rem;">(YOU)</strong>' : ''}
              <span class="visitor-hash-badge">${escapeHtml(v.userHash || '')}</span>
            </span>
            <span class="visitor-time">First entered at ${timeStr}</span>
          </div>
        </div>
        <span class="visitor-status-tag" style="font-size: 0.65rem; color: #34d399; font-family: var(--font-mono);">VERIFIED</span>
      `;
      el.visitorLedgerList.appendChild(card);
    });
  }

  async function syncHashLockUi() {
    if (!state.chatCode) {
      el.toggleLockChatWithHash.disabled = true;
      el.hashLockActiveBox.style.display = 'none';
      return;
    }

    const lockStatus = await ChatSync.checkRoomLockStatus(state.chatCode);
    el.toggleLockChatWithHash.checked = lockStatus.isHashLocked;
    el.hashLockActiveBox.style.display = lockStatus.isHashLocked ? 'flex' : 'none';

    if (state.role !== 'creator') {
      el.toggleLockChatWithHash.disabled = true;
      el.toggleLockChatWithHash.title = 'Only the room creator can alter the hash password lock.';
    } else {
      el.toggleLockChatWithHash.disabled = false;
    }
  }

  async function handleToggleHashLock(e) {
    if (state.role !== 'creator') {
      showToast('Only the room creator can lock or unlock this chamber with a hash!', 'error');
      e.target.checked = !e.target.checked;
      return;
    }

    if (!state.hasAudioKey || !state.audioKeyData) {
      showToast('You must load your Audio Key to generate the cryptographic .cblock file!', 'error');
      e.target.checked = false;
      return;
    }

    const shouldLock = e.target.checked;

    if (shouldLock) {
      showToast('Generating encrypted .cblock lockfile with 256-bit audio seal...', 'info');
      try {
        const lockfileData = await ChatCrypto.generateLockKeyfile(
          state.chatCode,
          state.audioKeyData.cryptoKey,
          state.userName
        );

        state.activeLockfileBlob = lockfileData.blob;

        await ChatSync.setRoomHashLock(state.chatCode, true, lockfileData.challengeToken);

        // Instant automatic download of .cblock file for the creator!
        ChatAudio.downloadAudioFile(lockfileData.blob, lockfileData.filename);

        el.hashLockActiveBox.style.display = 'flex';
        showToast(`Room ${state.chatCode} is now locked with Hash! Downloaded ${lockfileData.filename}.`, 'success');
      } catch (err) {
        showToast('Failed to lock room: ' + err.message, 'error');
        e.target.checked = false;
      }
    } else {
      await ChatSync.setRoomHashLock(state.chatCode, false, null);
      state.activeLockfileBlob = null;
      el.hashLockActiveBox.style.display = 'none';
      showToast(`Hash lock removed. Room ${state.chatCode} is now open to any matching audio key.`, 'info');
    }
  }

  function handleDownloadLockKeyfile() {
    if (!state.activeLockfileBlob) {
      if (state.hasAudioKey && state.audioKeyData && state.chatCode) {
        ChatCrypto.generateLockKeyfile(state.chatCode, state.audioKeyData.cryptoKey, state.userName).then((res) => {
          state.activeLockfileBlob = res.blob;
          ChatAudio.downloadAudioFile(res.blob, res.filename);
          showToast(`Downloaded ${res.filename}!`, 'success');
        });
        return;
      }
      showToast('No active .cblock file available to download.', 'error');
      return;
    }
    const filename = `ChatBaiter_Shield_${state.chatCode}.cblock`;
    ChatAudio.downloadAudioFile(state.activeLockfileBlob, filename);
    showToast(`Keyfile downloaded: ${filename}`, 'success');
  }

  function updateBackendStatusUi() {
    const info = ChatSync.getBackendInfo();

    if (el.headerBackendDot && el.headerBackendLabel) {
      if (info.isCustom) {
        el.headerBackendDot.className = 'backend-status-dot custom';
        el.headerBackendLabel.textContent = `BYOB: ${info.projectId ? info.projectId.toUpperCase() : 'CUSTOM'}`;
        if (el.btnHeaderBackendPill) {
          el.btnHeaderBackendPill.title = `Active: Custom Firebase (${info.projectId}) — 100% Private Data Sovereignty. Click to manage.`;
        }
      } else if (info.isServer && info.isFirebaseActive) {
        el.headerBackendDot.className = 'backend-status-dot online';
        el.headerBackendLabel.textContent = 'CLOUD: LIVE';
        if (el.btnHeaderBackendPill) {
          el.btnHeaderBackendPill.title = `Active: Server Default Firebase (${info.projectId}). Click to connect your own private backend.`;
        }
      } else {
        el.headerBackendDot.className = 'backend-status-dot offline';
        el.headerBackendLabel.textContent = 'OFFLINE: P2P';
        if (el.btnHeaderBackendPill) {
          el.btnHeaderBackendPill.title = 'Active: Local Offline P2P Sync (Zero Cloud). Click to connect Firebase.';
        }
      }
    }

    if (el.statusDot && el.firebaseStatusText && el.firebaseStatusSub) {
      if (info.isCustom) {
        el.statusDot.className = 'status-indicator-dot custom';
        el.firebaseStatusText.textContent = 'Active Mode: Custom Firebase (BYOB) — 100% Private 🔒';
        el.firebaseStatusSub.textContent = `Project: ${info.projectId} • Ciphertexts bypass server author completely`;
      } else if (info.isServer && info.isFirebaseActive) {
        el.statusDot.className = 'status-indicator-dot online';
        el.firebaseStatusText.textContent = 'Active Mode: Server Default Firebase (Vercel Cloud ☁️)';
        el.firebaseStatusSub.textContent = `Project: ${info.projectId || 'Server Env'} • Encrypted Cloud Sync Active`;
      } else {
        el.statusDot.className = 'status-indicator-dot offline';
        el.firebaseStatusText.textContent = 'Active Mode: Local Multi-Window P2P Sync (Zero Cloud ⚡)';
        el.firebaseStatusSub.textContent = 'BroadcastChannel & LocalStorage • No external server requests';
      }
    }
  }

  function showTestResult(type, message) {
    if (!el.connectionTestStrip) return;
    el.connectionTestStrip.style.display = 'flex';
    el.connectionTestStrip.className = `connection-test-strip ${type}`;

    if (el.testIcon) {
      if (type === 'success') el.testIcon.textContent = '✓';
      else if (type === 'error') el.testIcon.textContent = '✕';
      else el.testIcon.textContent = '⏳';
    }
    if (el.testMsg) {
      el.testMsg.textContent = message;
    }
  }

  async function handleTestFirebaseConnection() {
    const raw = el.inputFirebaseConfig.value.trim();
    if (!raw) {
      showTestResult('error', 'Please paste a Firebase configuration snippet or JSON to test.');
      showToast('Please enter a Firebase snippet to test.', 'error');
      return;
    }

    let candidate = null;
    try {
      candidate = ChatSync.parseFirebaseConfigInput(raw);
    } catch (err) {
      showTestResult('error', 'Syntax error: ' + err.message);
      showToast(err.message, 'error');
      return;
    }

    showTestResult('testing', `Pinging Firebase project '${candidate.projectId}' on Cloud Firestore...`);
    el.btnTestFirebasePing.disabled = true;
    if (el.testBtnLabel) el.testBtnLabel.textContent = 'Testing...';

    try {
      const result = await ChatSync.testFirebaseConnection(candidate);
      if (result.success) {
        const warningSuffix = result.warning ? ` (${result.warning})` : '';
        showTestResult('success', `Connected to '${result.projectId}' in ${result.latencyMs}ms! Verified.${warningSuffix}`);
        showToast(`Firebase ping verified! (${result.latencyMs}ms latency)`, 'success');
      } else {
        showTestResult('error', `Connection failed: ${result.error}`);
        showToast(`Connection test failed: ${result.error}`, 'error');
      }
    } catch (e) {
      showTestResult('error', `Unexpected error: ${e.message}`);
      showToast('Connection test error: ' + e.message, 'error');
    } finally {
      el.btnTestFirebasePing.disabled = false;
      if (el.testBtnLabel) el.testBtnLabel.textContent = 'Test Connection';
    }
  }

  async function handleSaveFirebaseConfig() {
    const raw = el.inputFirebaseConfig.value.trim();
    if (!raw) {
      showToast('Please paste your Firebase snippet, or select "Use Default" or "Offline P2P".', 'error');
      return;
    }

    let candidate = null;
    try {
      candidate = ChatSync.parseFirebaseConfigInput(raw);
    } catch (err) {
      showTestResult('error', 'Invalid config: ' + err.message);
      showToast(err.message, 'error');
      return;
    }

    showToast(`Connecting to your private Firebase '${candidate.projectId}'...`, 'info');
    showTestResult('testing', `Connecting to '${candidate.projectId}'...`);

    const ok = await ChatSync.applyCustomConfig(candidate);
    if (ok) {
      updateBackendStatusUi();
      showToast(`Data Sovereignty Enabled: Connected to private project '${candidate.projectId}'!`, 'success');
      setTimeout(closeSettingsModal, 350);
    } else {
      showTestResult('error', 'Could not initialize Firebase project with provided credentials.');
      showToast('Failed to initialize Firebase with candidate config.', 'error');
    }
  }

  async function handleRevertServerDefault() {
    showToast('Reverting to host server default Firebase...', 'info');
    const ok = await ChatSync.revertToServerDefault();
    updateBackendStatusUi();

    if (ok) {
      const info = ChatSync.getBackendInfo();
      showToast(`Connected to Server Default Firebase (${info.projectId || 'Live Cloud'})!`, 'success');
    } else {
      showToast('No server default credentials available. Switched to Offline P2P mode.', 'info');
    }
    setTimeout(closeSettingsModal, 300);
  }

  async function handleOfflineSync() {
    showToast('Switching to 100% Offline Multi-Tab P2P mode...', 'info');
    await ChatSync.disconnectToOffline();
    updateBackendStatusUi();
    showToast('Offline Mode: Zero Cloud Connections. Local Multi-Tab active.', 'info');
    setTimeout(closeSettingsModal, 300);
  }

  async function handleDeleteServerApi() {
    const confirmed = window.confirm(
      '⚠️ PERMANENT SERVER DELETION:\n\nAre you sure you want to permanently delete and wipe all API credentials from the server? This cannot be undone.'
    );
    if (!confirmed) return;

    showToast('Permanently deleting API credentials from server...', 'info');
    showTestResult('testing', 'Wiping and zeroizing API credentials from server...');

    try {
      await ChatSync.deleteApiConfigFromServer();
      updateBackendStatusUi();
      showTestResult('success', 'API credentials permanently erased and zeroized from server.');
      showToast('API credentials permanently eradicated from server! Zero traces left.', 'success');
      el.inputFirebaseConfig.value =
        '// API credentials have been permanently deleted from this server.\n// Zero server footprint active.';
    } catch (err) {
      showTestResult('error', 'Failed to delete from server: ' + err.message);
      showToast('Server deletion error: ' + err.message, 'error');
    }
  }

  /* ======================================================== */
  /* DUAL-AI SYNAPSE & COLOSSEUM DEBATE ARENA */
  /* ======================================================== */
  function populateAiModelDropdowns() {
    if (!el.selectAiModel1 || !el.selectAiModel2) return;
    const models = ChatAI.getModelsList();
    const families = [...new Set(models.map((m) => m.family))];

    el.selectAiModel1.innerHTML = '';
    el.selectAiModel2.innerHTML = '';

    families.forEach((family) => {
      const g1 = document.createElement('optgroup');
      g1.label = family;
      const g2 = document.createElement('optgroup');
      g2.label = family;

      models
        .filter((m) => m.family === family)
        .forEach((m) => {
          const opt1 = document.createElement('option');
          opt1.value = m.id;
          opt1.textContent = `${m.name} (${m.badge})`;
          g1.appendChild(opt1);

          const opt2 = document.createElement('option');
          opt2.value = m.id;
          opt2.textContent = `${m.name} (${m.badge})`;
          g2.appendChild(opt2);
        });

      el.selectAiModel1.appendChild(g1);
      el.selectAiModel2.appendChild(g2);
    });

    el.selectAiModel1.value = 'openai/gpt-4o';
    el.selectAiModel2.value = 'anthropic/claude-3-5-sonnet';
    handleAiModel1Change();
    handleAiModel2Change();
  }

  function handleAiModel1Change() {
    const m = ChatAI.getModelById(el.selectAiModel1.value);
    if (m && el.badgeModel1) {
      el.badgeModel1.textContent = m.badge;
      el.badgeModel1.style.color = m.color;
      ChatAI.setSelectedModels(el.selectAiModel1.value, el.selectAiModel2.value);
    }
  }

  function handleAiModel2Change() {
    const m = ChatAI.getModelById(el.selectAiModel2.value);
    if (m && el.badgeModel2) {
      el.badgeModel2.textContent = m.badge;
      el.badgeModel2.style.color = m.color;
      ChatAI.setSelectedModels(el.selectAiModel1.value, el.selectAiModel2.value);
    }
  }

  function openAiColosseumModal() {
    populateAiModelDropdowns();
    updateVaultKeyStatus();
    switchColosseumTab('debate');
    el.aiColosseumModal.style.display = 'flex';
    requestAnimationFrame(() => {
      el.aiColosseumModal.classList.add('modal-active');
    });
  }

  function closeAiColosseumModal() {
    el.aiColosseumModal.classList.remove('modal-active');
    setTimeout(() => {
      el.aiColosseumModal.style.display = 'none';
    }, 280);
  }

  function switchColosseumTab(tab) {
    if (el.tabColosseumDebate) el.tabColosseumDebate.classList.toggle('active', tab === 'debate');
    if (el.tabColosseumVault) el.tabColosseumVault.classList.toggle('active', tab === 'vault');
    if (el.panelColosseumDebate) el.panelColosseumDebate.style.display = tab === 'debate' ? 'block' : 'none';
    if (el.panelColosseumVault) el.panelColosseumVault.style.display = tab === 'vault' ? 'block' : 'none';
  }

  async function handleSaveVaultKey() {
    const provider = el.selectVaultProvider.value;
    const key = el.inputVaultApiKey.value.trim();
    if (!key) {
      await ChatAI.saveEncryptedApiKey(provider, '', null);
      updateVaultKeyStatus();
      showToast(`Removed custom API key for ${provider.toUpperCase()}.`, 'info');
      return;
    }

    if (!state.hasAudioKey || !state.audioKeyData) {
      showToast('You must load or synthesize an Audio Cassette Key first to encrypt your API key!', 'error');
      promptChangeAudioKey();
      return;
    }

    try {
      await ChatAI.saveEncryptedApiKey(provider, key, state.audioKeyData.cryptoKey);
      el.inputVaultApiKey.value = '';
      updateVaultKeyStatus();
      showToast(`API Key for ${provider.toUpperCase()} encrypted with 256-bit audio key and stored safely! 🔒`, 'success');
    } catch (err) {
      showToast('Encryption failed: ' + err.message, 'error');
    }
  }

  function updateVaultKeyStatus() {
    const provider = el.selectVaultProvider.value;
    const hasKey = ChatAI.hasKeyForProvider(provider);
    if (hasKey) {
      el.vaultKeyStatusText.textContent = `Custom API Key Active (Encrypted via Audio Cassette Key 🔒)`;
      el.vaultKeyStatusText.style.color = '#34d399';
    } else {
      el.vaultKeyStatusText.textContent = `No custom key stored (Using Intelligent Simulation Cognition)`;
      el.vaultKeyStatusText.style.color = 'var(--text-subtle)';
    }
  }

  async function handleLaunchDebate() {
    let topic = el.inputDebateTopic.value.trim();
    if (!topic) {
      topic = 'Will Artificial General Intelligence transcend biological cognition, or are synthetic limits immutable?';
      el.inputDebateTopic.value = topic;
    }

    const rounds = parseInt(el.selectDebateRounds.value, 10) || 2;
    const broadcast = el.checkBroadcastDebate.checked;

    el.btnStartDebate.style.display = 'none';
    el.btnStopDebate.style.display = 'inline-block';
    el.debateStatusBanner.style.display = 'flex';
    el.debateStatusText.textContent = 'Arena initializing... Gladiators reasoning...';

    showToast(`Launching Colosseum Debate between ${el.badgeModel1.textContent} vs ${el.badgeModel2.textContent}...`, 'info');

    if (broadcast && state.chatCode) {
      setTimeout(closeAiColosseumModal, 800);
    }

    await ChatAI.runAiDebate({
      topic,
      cryptoKey: state.audioKeyData?.cryptoKey,
      rounds,
      onDebateTurn: async (turn) => {
        if (turn.isThinking) {
          el.debateStatusText.textContent = `${turn.speaker.name} is formulating ${turn.role}...`;
        } else {
          el.debateStatusText.textContent = `${turn.speaker.name} delivered ${turn.role}!`;
          if (broadcast && state.chatCode) {
            await handleSendAiMessage(turn.speaker.name, turn.text, turn.speaker.color, turn.role);
          }
        }
      },
      onDebateFinish: (res) => {
        el.btnStartDebate.style.display = 'inline-block';
        el.btnStopDebate.style.display = 'none';
        if (el.btnResetDebate) el.btnResetDebate.style.display = 'inline-block';
        el.debateStatusBanner.style.display = 'none';
        if (res.completed) {
          showToast('Colosseum AI Debate concluded successfully! ⚔️', 'success');
        } else if (res.error) {
          showToast('Debate stopped: ' + res.error, 'info');
        }
      },
    });
  }

  function handleStopDebate() {
    ChatAI.stopDebate();
    el.btnStartDebate.style.display = 'inline-block';
    el.btnStopDebate.style.display = 'none';
    if (el.btnResetDebate) el.btnResetDebate.style.display = 'inline-block';
    el.debateStatusBanner.style.display = 'none';
    showToast('Debate stopped by user.', 'info');
  }

  async function handleComposerDualAiPrompt() {
    const text = el.inputChatMessage.value.trim();
    if (!text) {
      showToast('Type a prompt in the message input first!', 'info');
      el.inputChatMessage.focus();
      return;
    }

    if (!state.hasAudioKey || !state.audioKeyData) {
      showToast('You must load an Audio Key first to encrypt and communicate with AIs!', 'error');
      promptChangeAudioKey();
      return;
    }

    el.inputChatMessage.value = '';

    try {
      const userEncrypted = await ChatCrypto.encryptMessage(text, state.audioKeyData.cryptoKey);
      await ChatSync.sendMessage(state.chatCode, {
        senderName: state.userName,
        senderHash: state.userHash,
        encrypted: userEncrypted,
      });
    } catch (e) {}

    showToast(`Dual-AI Prompting: Querying ${el.badgeModel1?.textContent || 'AI 1'} & ${el.badgeModel2?.textContent || 'AI 2'} simultaneously...`, 'info');

    ChatAI.queryBothAis(
      text,
      state.audioKeyData.cryptoKey,
      async (res1) => {
        await handleSendAiMessage(res1.model.name, res1.text, res1.model.color, 'DUAL RESPONSE #1');
      },
      async (res2) => {
        await handleSendAiMessage(res2.model.name, res2.text, res2.model.color, 'DUAL RESPONSE #2');
      }
    );
  }

  async function handleSendAiMessage(aiName, text, color, roleTag = 'AI') {
    if (!state.hasAudioKey || !state.audioKeyData || !state.chatCode) return;
    try {
      const encrypted = await ChatCrypto.encryptMessage(text, state.audioKeyData.cryptoKey);
      await ChatSync.sendMessage(state.chatCode, {
        senderName: `🤖 ${aiName}`,
        senderHash: `#${roleTag}`,
        encrypted: encrypted,
        isAiMessage: true,
        aiColor: color,
      });
    } catch (err) {
      console.error('Failed to send encrypted AI message:', err);
    }
  }

  /**
   * Swap Gladiators (Vice-Versa): Invert Model 1 and Model 2 roles
   */
  function handleSwapGladiators() {
    const pair = ChatAI.swapGladiators();
    if (el.selectAiModel1 && el.selectAiModel2) {
      el.selectAiModel1.value = pair.model1.id;
      el.selectAiModel2.value = pair.model2.id;
      handleAiModel1Change();
      handleAiModel2Change();
    }
    showToast(`Gladiators Inverted: ${pair.model1.badge} (Proposition) ⇄ ${pair.model2.badge} (Opposition)`, 'success');
  }

  /**
   * Opposite / Inverse of saveEncryptedApiKey:
   * Remove and wipe key for active provider
   */
  async function handleDeleteVaultKey() {
    const provider = el.selectVaultProvider.value;
    await ChatAI.removeEncryptedApiKey(provider);
    updateVaultKeyStatus();
    showToast(`Removed and purged custom API key for ${provider.toUpperCase()}.`, 'info');
  }

  /**
   * Opposite / Purge all keys:
   * Wipe all custom API keys across all providers
   */
  async function handlePurgeAllVaultKeys() {
    const confirmed = window.confirm('Wipe all saved API keys across all providers?');
    if (!confirmed) return;
    await ChatAI.purgeAllApiKeys();
    updateVaultKeyStatus();
    showToast('All custom API keys purged from storage across all providers!', 'info');
  }

  /**
   * Opposite / Reset function for debate arena
   */
  function handleResetDebate() {
    ChatAI.resetDebateArena();
    if (el.btnStartDebate) el.btnStartDebate.style.display = 'inline-block';
    if (el.btnStopDebate) el.btnStopDebate.style.display = 'none';
    if (el.btnResetDebate) el.btnResetDebate.style.display = 'none';
    if (el.debateStatusBanner) el.debateStatusBanner.style.display = 'none';
    showToast('AI Colosseum Arena reset and cleared.', 'info');
  }

  /**
   * Opposite of Dual-AI Prompting:
   * Solo-AI Prompting (Query only Gladiator 1)
   */
  async function handleComposerSoloAiPrompt() {
    const text = el.inputChatMessage.value.trim();
    if (!text) {
      showToast('Type a prompt in the message input first!', 'info');
      el.inputChatMessage.focus();
      return;
    }

    if (!state.hasAudioKey || !state.audioKeyData) {
      showToast('You must load an Audio Key first to encrypt and communicate with AIs!', 'error');
      promptChangeAudioKey();
      return;
    }

    el.inputChatMessage.value = '';

    try {
      const userEncrypted = await ChatCrypto.encryptMessage(text, state.audioKeyData.cryptoKey);
      await ChatSync.sendMessage(state.chatCode, {
        senderName: state.userName,
        senderHash: state.userHash,
        encrypted: userEncrypted,
      });
    } catch (e) {}

    const selected = ChatAI.getSelectedModels();
    showToast(`Solo AI Prompting: Querying ${selected.model1.name}...`, 'info');

    try {
      const soloResult = await ChatAI.querySoloAi(selected.model1.id, text, state.audioKeyData.cryptoKey);
      await handleSendAiMessage(soloResult.model.name, soloResult.text, soloResult.model.color, 'SOLO RESPONSE');
    } catch (err) {
      console.error(err);
      showToast('Solo AI error: ' + err.message, 'error');
    }
  }

  /**
   * Opposite / Inverse of sending messages:
   * "Burn Chamber" — Purges all messages in the room (Creator Only)
   */
  async function handleDockPurgeMessages() {
    if (state.role !== 'creator') {
      showToast('Only the room creator can burn and purge chamber messages!', 'error');
      return;
    }
    const confirmed = window.confirm('⚠️ BURN CHAMBER: Are you sure you want to permanently erase ALL messages in this room for everyone?');
    if (!confirmed) return;

    showToast('Incinerating chamber messages...', 'info');
    await ChatSync.purgeRoomMessages(state.chatCode);
    state.allMessages = [];
    if (el.messagesList) el.messagesList.innerHTML = '';
    showToast('Chamber purged! All messages incinerated.', 'success');
  }

  /**
   * Opposite / Purge function for Visitor Presence Ledger:
   * Clears the visitor audit log for zero-trace privacy (Creator Only)
   */
  async function handlePurgeVisitorLedger() {
    if (state.role !== 'creator') {
      showToast('Only the room creator can purge the visitor ledger!', 'error');
      return;
    }
    const confirmed = window.confirm('Clear all recorded visitor entries for this room (Zero-Trace Mode)?');
    if (!confirmed) return;

    await ChatSync.clearVisitorLedger(state.chatCode);
    if (el.visitorLedgerList) {
      el.visitorLedgerList.innerHTML = `
        <div class="empty-ledger-state">
          <span>Visitor audit log purged. Zero trace active.</span>
        </div>
      `;
    }
    if (el.visitorCountTag) el.visitorCountTag.textContent = '0 Visitors';
    showToast('Visitor ledger purged. Zero-trace mode active.', 'success');
  }

  /**
   * Opposite / Inverse of entering a room:
   * Leave room, log departure, wipe active keys from memory, and return to onboarding console
   */
  async function handleLeaveRoom() {
    if (state.chatCode && state.userName) {
      await ChatSync.logVisitorDeparture(state.chatCode, state.userName);
    }
    ChatSync.unsubscribe();
    if (state.audioKeyData) {
      ChatCrypto.zeroizeKeyMemory(state.audioKeyData);
    }
    state.chatCode = '';
    state.allMessages = [];
    state.hasAudioKey = false;
    state.audioKeyData = null;
    if (el.messagesList) el.messagesList.innerHTML = '';
    if (el.chatView) el.chatView.style.display = 'none';
    if (el.onboardingView) el.onboardingView.style.display = 'block';
    showToast('Departed chamber. Session cleared & key memory zeroized.', 'info');
  }

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
