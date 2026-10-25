/**
 * ChatBaiter Main Application Coordinator
 * - Role Management (Creator-Frnd vs Frnd)
 * - Audio Key Extraction & Cryptographic Flow
 * - Room Generation & Invite Link Handling
 * - Real-Time Encrypted Message Stream & Scrambler Animations
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
    audioKeyData: null, // { hexHash, shortHash, cryptoKey }
    audioDuration: 0,
    isRecording: false,
    hasAudioKey: false,
    activeRoomData: null,
    allMessages: [],
  };

  // DOM Elements
  const el = {
    // Top App Bar
    headerStatusGroup: document.getElementById('headerStatusGroup'),
    headerRoomCode: document.getElementById('headerRoomCode'),
    headerKeyIndicator: document.getElementById('headerKeyIndicator'),
    headerKeyStatusText: document.getElementById('headerKeyStatusText'),
    btnAudioSlotTrigger: document.getElementById('btnAudioSlotTrigger'),
    btnShareInvite: document.getElementById('btnShareInvite'),
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
    messagesList: document.getElementById('messagesList'),
    messagesDeck: document.getElementById('messagesDeck'),
    composerForm: document.getElementById('composerForm'),
    inputChatMessage: document.getElementById('inputChatMessage'),

    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    inputFirebaseConfig: document.getElementById('inputFirebaseConfig'),
    btnSaveFirebaseConfig: document.getElementById('btnSaveFirebaseConfig'),
    btnResetFirebaseConfig: document.getElementById('btnResetFirebaseConfig'),
    firebaseStatusText: document.getElementById('firebaseStatusText'),
    toastContainer: document.getElementById('toastContainer'),

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

    // Securely fetch environment config from Vercel / serverless environment
    await ChatSync.fetchEnvConfig();
    updateFirebaseStatusText();
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
      el.btnSubmitConsoleLabel.textContent = 'ENTER CHAT WITH AUDIO KEY';
      el.btnJoinWithoutAudio.style.display = 'block';
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

    // Firebase Settings Modal
    el.btnSettingsTrigger.addEventListener('click', openSettingsModal);
    el.btnCloseSettings.addEventListener('click', closeSettingsModal);
    el.btnSaveFirebaseConfig.addEventListener('click', handleSaveFirebaseConfig);
    el.btnResetFirebaseConfig.addEventListener('click', handleResetFirebaseConfig);

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
   * Handle Audio File Selected from Disk
   */
  function handleAudioFileSelection(e) {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingAudioFile(e.target.files[0]);
    }
  }

  /**
   * Process and Hash Incoming Audio File
   */
  async function processIncomingAudioFile(file) {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|webm|flac)$/i.test(file.name)) {
      showToast('Please upload a valid audio file (.wav, .mp3, .ogg, .m4a)', 'error');
      return;
    }

    try {
      showToast(`Loading audio key: ${file.name}...`, 'info');
      spinSpools(true);
      el.deckStatusTag.textContent = 'READING TAPE...';

      const arrayBuffer = await file.arrayBuffer();
      await applyAudioBufferAsKey(arrayBuffer, file.name, 0, file);

      showToast(`Audio key verified! 256-bit encryption ready.`, 'success');
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

    // Start recording
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
        showToast('Voice memo captured as WAV and derived as 256-bit key!', 'success');
      },
      (err) => {
        state.isRecording = false;
        el.recLed.classList.remove('recording');
        el.btnRecordAudio.classList.remove('active-recording');
        el.recordBtnText.textContent = 'Record Mic (15s)';
        spinSpools(false);
        showToast('Microphone access denied or unavailable: ' + err.message, 'error');
      }
    );
  }

  /**
   * Apply ArrayBuffer as Active Audio Key & Compute SHA-256 Hash
   */
  async function applyAudioBufferAsKey(arrayBuffer, filename = 'audio_sample.wav', durationHint = 0, blob = null) {
    state.audioArrayBuffer = arrayBuffer;
    state.audioBlob = blob || new Blob([arrayBuffer], { type: 'audio/wav' });
    state.audioFileName = filename;
    state.hasAudioKey = true;

    // Derive 256-bit AES-GCM Key + SHA-256 Hash
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

    // Update UI Elements
    el.deckStatusTag.textContent = 'KEY LOADED';
    el.deckStatusTag.style.color = '#10b981';
    el.tapeHash.textContent = `HASH: ${state.audioKeyData.shortHash} (${state.audioKeyData.hexHash.substring(0, 10)}...)`;
    el.btnPlayAudio.style.display = 'inline-flex';
    el.btnDownloadAudio.style.display = 'inline-flex';

    // If already in chat, re-render all messages with the new key!
    if (state.chatCode) {
      updateChatHeaderKeyUi(true);
      reRenderAllMessages();
    }
  }

  /**
   * Trigger Download of the Active Audio Key (.wav)
   */
  function handleDownloadAudioKey() {
    if (!state.audioArrayBuffer) {
      showToast('No audio key loaded to download.', 'error');
      return;
    }

    const blobToDownload = state.audioBlob || new Blob([state.audioArrayBuffer], { type: 'audio/wav' });
    const shortTag = state.audioKeyData ? state.audioKeyData.shortHash.replace('0x', '') : 'KEY';
    const filename = `ChatBaiter_AudioKey_${shortTag}.wav`;

    ChatAudio.downloadAudioFile(blobToDownload, filename);
    showToast(`Audio key downloaded (${filename})! Send this file to your friend so they can decrypt.`, 'success');
  }

  /**
   * Play / Pause Loaded Key Audio
   */
  function handleTogglePlayAudio() {
    if (!state.audioArrayBuffer) return;

    ChatAudio.togglePlayAudio(state.audioArrayBuffer, (isPlaying) => {
      spinSpools(isPlaying);
      el.playAudioLabel.textContent = isPlaying ? 'Stop Audio' : 'Play Key';
    });
  }

  /**
   * Submit Console (Join or Create Room)
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

      // Generate Room Code (e.g., CB-7341-XJ)
      const chatCode = generateChatCode();
      state.chatCode = chatCode;

      // Hash username salted with audio hash
      state.userHash = await ChatCrypto.hashUsername(name, state.audioKeyData.hexHash);

      showToast(`Creating encrypted room ${chatCode}...`, 'info');

      await ChatSync.createRoom({
        chatCode: chatCode,
        audioHash: state.audioKeyData.hexHash,
        userHash: state.userHash,
        creatorName: name,
      });

      enterChatRoom(chatCode);
      showToast(`Room ${chatCode} initialized! Invite link ready.`, 'success');
      return;
    }

    // Frnd Flow
    if (state.role === 'frnd') {
      const roomCode = el.inputRoomCode.value.trim().toUpperCase();
      if (!roomCode) {
        showToast('Please enter the Chat Code.', 'error');
        el.inputRoomCode.focus();
        return;
      }
      state.chatCode = roomCode;

      // Calculate user hash
      const audioHash = (state.hasAudioKey && state.audioKeyData) ? state.audioKeyData.hexHash : 'NO_AUDIO_KEY';
      state.userHash = await ChatCrypto.hashUsername(name, audioHash);

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
   * Enter the Chat Room Interface with Connected Morph & Dissolve Transitions
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

      // Update Top Key Indicator
      updateChatHeaderKeyUi(state.hasAudioKey);

      // Subscribe to real-time messages
      el.messagesList.innerHTML = '';
      state.allMessages = [];

      ChatSync.subscribeRoom(chatCode, (newMsg) => {
        appendMessageToChat(newMsg);
      });

      // Update URL without reloading for easy bookmark/refresh
      const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?room=' + chatCode;
      window.history.replaceState({ path: newUrl }, '', newUrl);

      scrollChatToBottom();

      setTimeout(() => el.chatView.classList.remove('view-morph-in'), 480);
    }, 280);
  }

  /**
   * Update Key UI in Chat Header & Tape Dock
   */
  function updateChatHeaderKeyUi(hasKey) {
    if (hasKey && state.audioKeyData) {
      el.headerKeyIndicator.className = 'key-indicator key-active';
      el.headerKeyStatusText.textContent = `KEY: ${state.audioKeyData.shortHash}`;
      
      el.slotLed.className = 'slot-led unlocked';
      el.slotStatusHeadline.textContent = 'AUDIO KEY VERIFIED';
      el.slotStatusSub.textContent = `Key Hash: ${state.audioKeyData.shortHash} • ${state.audioDuration ? Math.round(state.audioDuration) + 's' : 'Active'}`;
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
    const row = document.createElement('div');
    row.className = `msg-row ${isOwn ? 'own-msg' : 'peer-msg'}`;
    row.dataset.msgId = msg.id;

    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Header meta
    const meta = document.createElement('div');
    meta.className = 'msg-header-meta';
    meta.innerHTML = `<span class="msg-sender">${escapeHtml(msg.senderName)}</span> <span>${escapeHtml(msg.senderHash || '')}</span> • <span>${timeStr}</span>`;
    row.appendChild(meta);

    // Message Card Body
    const card = document.createElement('div');
    card.className = 'msg-card';
    row.appendChild(card);

    // Try Decrypting or Show Scrambled
    await renderCardContent(card, msg);

    el.messagesList.appendChild(row);
    scrollChatToBottom();
  }

  /**
   * Character-by-Character Morph & Dissolve Animation
   * Morphs scrambled matrix characters smoothly into the real decrypted text!
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
   * Render Card Content (Decrypted or Scrambled) with Connected Morphing
   */
  async function renderCardContent(cardElement, msg, isLiveTransition = false) {
    if (state.hasAudioKey && state.audioKeyData) {
      try {
        const decryptedText = await ChatCrypto.decryptMessage(msg.encrypted, state.audioKeyData.cryptoKey);
        const wasScrambled = cardElement.classList.contains('scrambled-card');
        
        if (wasScrambled || isLiveTransition) {
          animateMorphDissolveUnscramble(cardElement, decryptedText);
        } else {
          cardElement.className = 'msg-card unlocked-card';
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
   * Re-render all messages with live connected morph animations
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
   * Eject Audio Key (Simulate viewing without key)
   */
  function handleEjectAudioKey() {
    state.hasAudioKey = false;
    state.audioKeyData = null;
    updateChatHeaderKeyUi(false);
    reRenderAllMessages();
    showToast('Audio key ejected. Terminal switched to Scrambled View.', 'info');
  }

  /**
   * Prompt to Change / Insert Audio Key (Opens 3-Option Modal: Record, Upload, MyInstants)
   */
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

  /**
   * Modal 15s Mic Recording Controller
   */
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

  /**
   * Handle Click on MyInstants Preset Soundboard Buttons
   */
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

  /**
   * Handle Loading Audio from MyInstants URL
   */
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

  /**
   * Leave Chat Room & Return to Console with Morph & Dissolve
   */
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

      // Clear URL query
      const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

      setTimeout(() => el.onboardingView.classList.remove('view-morph-in'), 480);
      showToast('Exited chat room.', 'info');
    }, 280);
  }

  /**
   * Copy Room Code
   */
  function copyRoomCodeToClipboard() {
    if (!state.chatCode) return;
    navigator.clipboard.writeText(state.chatCode).then(() => {
      showToast(`Chat Code ${state.chatCode} copied to clipboard!`, 'success');
    });
  }

  /**
   * Copy Full Invite Link
   */
  function copyInviteLinkToClipboard() {
    if (!state.chatCode) return;
    const inviteUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?room=' + state.chatCode;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      showToast(`Invite link copied to clipboard! Share with your friend.`, 'success');
    });
  }

  /**
   * Spin Cassette Spools Animation
   */
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

  /**
   * Toast Notifications
   */
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

  /**
   * Firebase Settings Modal with Morph & Dissolve
   */
  function openSettingsModal() {
    const manualConfig = localStorage.getItem('cb_firebase_config');
    if (manualConfig) {
      el.inputFirebaseConfig.value = manualConfig;
    } else if (ChatSync.isEnvConfigured()) {
      el.inputFirebaseConfig.value = '// Configured securely via Vercel Environment Variables (Secured 🔒)\n// To override, enter custom JSON below or click Reset.';
    } else {
      el.inputFirebaseConfig.value = '';
    }
    updateFirebaseStatusText();
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

  function updateFirebaseStatusText() {
    if (ChatSync.isFirebaseActive()) {
      if (ChatSync.isEnvConfigured()) {
        el.firebaseStatusText.textContent = 'Active Mode: Live Cloud Firestore Connected (Secured via Vercel Env 🔒)';
      } else {
        el.firebaseStatusText.textContent = 'Active Mode: Live Cloud Firestore Connected (Manual Config 🔒)';
      }
    } else {
      el.firebaseStatusText.textContent = 'Active Mode: Local Multi-Window P2P Sync (Zero Config)';
    }
  }

  function handleSaveFirebaseConfig() {
    const raw = el.inputFirebaseConfig.value.trim();
    if (!raw) {
      ChatSync.saveFirebaseConfig(null);
      showToast('Switched to Local Multi-Window P2P Sync.', 'info');
      closeSettingsModal();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      ChatSync.saveFirebaseConfig(parsed);
      const ok = ChatSync.initFirebase(parsed);
      if (ok) {
        showToast('Connected to live Firebase!', 'success');
      } else {
        showToast('Firebase config saved, but could not connect immediately.', 'info');
      }
      closeSettingsModal();
    } catch (e) {
      showToast('Invalid JSON in Firebase configuration.', 'error');
    }
  }

  function handleResetFirebaseConfig() {
    ChatSync.saveFirebaseConfig(null);
    el.inputFirebaseConfig.value = '';
    showToast('Reset to Local Multi-Tab P2P mode.', 'info');
    closeSettingsModal();
  }

  // Launch on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
