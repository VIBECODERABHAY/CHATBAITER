# ChatBaiter 🎙️🔐

> **Acoustic-Key Encrypted Covert Chat Application**  
> *Skeuomorphic + Minimalist Hybrid Aesthetic*

---

## 🌟 Overview

ChatBaiter uses **10–15 second audio samples** as symmetric cryptographic keys. The audio file itself is hashed into a 256-bit AES-GCM key (`audio_hash`). Messages are encrypted end-to-end; participants holding the matching audio file can decrypt the conversation into clean text, while anyone without the audio file can still enter the room but will only see **scrambled, obfuscated cipher text**.

---

## 🎨 UI Architecture: Skeuomorphic-Minimalism

1. **Tactile Role Switcher:**
   - **`CREATOR-FRND`:** Creates a new encrypted room, derives the audio key, registers the room code (e.g., `CB-7341-XJ`), and receives an invite link.
   - **`FRND`:** Joins an existing chat either directly via the invite link (`?room=CB-...`) or by entering the room code manually.
2. **Audio Cassette Chamber:**
   - Skeuomorphic cassette deck with spinning reels, LED indicators, real-time waveform visualizer, and tape timer.
   - Supports:
     - **Upload 10–15s Audio** (`.wav`, `.mp3`, `.ogg`, `.m4a`)
     - **Record Mic (15s)** with live circular timer
     - **Synthesize Sample Key:** 1-click generation of a 12s ambient harmonic sound key using the Web Audio API.
3. **Encrypted Chat View:**
   - **Stamped Metallic Chat Code Badge:** Click to copy.
   - **Invite Link Generator:** Click to share.
   - **Dynamic Scramble / Unscramble:**
     - **With Audio Key:** Clean, unlocked message cards.
     - **Without Audio Key:** Scrambled, glitched cipher matrix cards.
     - **Live Eject / Insert:** Eject the audio key anytime to simulate scrambled mode, or insert the key to instantly unscramble all past and future messages!

---

## 🚀 Running Locally

The local server is already running at:
```bash
http://localhost:3000
```

To run manually at any time:
```bash
node server.js
```

---

## ☁️ Firebase Connection

ChatBaiter includes a **dual-backend synchronization engine**:
1. **Zero-Config Local Multi-Tab Engine (Active by default):** Uses the browser's `BroadcastChannel` and `localStorage` to simulate real-time multi-party chat across different tabs/windows on your machine with zero configuration.
2. **Live Cloud Firebase:** Click the **Settings (gear)** icon in the top header and paste your Firebase Realtime Database configuration. ChatBaiter will automatically switch to global cloud synchronization.
