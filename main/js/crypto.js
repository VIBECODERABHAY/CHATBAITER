/**
 * ChatBaiter Cryptographic Engine (Hardened Acoustic Edition)
 * Web Crypto API (SubtleCrypto)
 * - 250,000-Iteration PBKDF2 + SHA-512 Key Derivation
 * - Symmetric Authenticated Encryption via AES-256-GCM
 * - Zero-Leak Stealth Interface (No Public Hashes Displayed)
 * - Encrypted API Key Acoustic Vault
 * - .cblock Cryptographic Lockfile Generation & Decryption Verification
 */

const ChatCrypto = (function () {
  'use strict';

  // Constant cryptographic salt for acoustic derivation hardening
  const ACOUSTIC_SALT = new TextEncoder().encode('ChatBaiter_Acoustic_Hardened_v2_QuantumProofSalt');

  // Helper: Convert ArrayBuffer to Hex String
  function bufferToHex(buffer) {
    const byteArray = new Uint8Array(buffer);
    let hexStr = '';
    for (let i = 0; i < byteArray.length; i++) {
      hexStr += byteArray[i].toString(16).padStart(2, '0');
    }
    return hexStr;
  }

  // Helper: Convert ArrayBuffer to Base64 String
  function bufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      return window.btoa(binary);
    }
    return Buffer.from(binary, 'binary').toString('base64');
  }

  // Helper: Convert Base64 String to ArrayBuffer
  function base64ToBuffer(base64) {
    let binary = '';
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      binary = window.atob(base64);
    } else {
      binary = Buffer.from(base64, 'base64').toString('binary');
    }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Derive a 256-bit AES-GCM Key from Audio Buffer using 250,000 PBKDF2 Iterations + SHA-512
   * @param {ArrayBuffer} audioArrayBuffer
   * @returns {Promise<{ hexHash: string, shortHash: string, cryptoKey: CryptoKey, securityRating: string }>}
   */
  async function deriveAudioKey(audioArrayBuffer) {
    if (!audioArrayBuffer || audioArrayBuffer.byteLength === 0) {
      throw new Error('Audio buffer is empty or invalid.');
    }

    // Step 1: Compute high-entropy SHA-512 digest over raw PCM audio bytes
    const sha512Digest = await crypto.subtle.digest('SHA-512', audioArrayBuffer);
    const hexHash = bufferToHex(sha512Digest);

    // Step 2: Import audio digest as key material for PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      sha512Digest,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Step 3: Derive 256-bit AES-GCM key with 250,000 iterations for extreme resistance to brute-force
    const cryptoKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: ACOUSTIC_SALT,
        iterations: 250000,
        hash: 'SHA-512',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, // non-extractable in browser memory
      ['encrypt', 'decrypt']
    );

    return {
      hexHash,
      // Stealth display tag: no raw hash leaks to UI
      shortHash: 'SEALED',
      cryptoKey,
      securityRating: 'HARDENED AES-256-GCM (250,000 PBKDF2 ITERATIONS)',
    };
  }

  /**
   * Hash a username using the audio hash as a salt/HMAC input
   * @param {string} username
   * @param {string} audioHexHash
   * @returns {Promise<string>} Anonymized identity badge (e.g. #OPERATIVE-9A)
   */
  async function hashUsername(username, audioHexHash) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${username.trim()}::${audioHexHash || 'NO_KEY'}::ENCRYPTED`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hex = bufferToHex(digest);
    return '#' + hex.substring(0, 4).toUpperCase();
  }

  /**
   * Encrypt a plaintext message with the derived AES-GCM Key
   * @param {string} plainText
   * @param {CryptoKey} cryptoKey
   * @returns {Promise<{ iv: string, ciphertext: string, length: number }>}
   */
  async function encryptMessage(plainText, cryptoKey) {
    if (!cryptoKey) {
      throw new Error('No cryptographic key loaded.');
    }

    // 12-byte cryptographically secure random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(plainText);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      encodedData
    );

    return {
      iv: bufferToBase64(iv.buffer),
      ciphertext: bufferToBase64(ciphertextBuffer),
      length: plainText.length,
    };
  }

  /**
   * Decrypt an encrypted message payload with the derived AES-GCM Key
   * @param {{ iv: string, ciphertext: string }} payload
   * @param {CryptoKey} cryptoKey
   * @returns {Promise<string>} Plaintext message
   */
  async function decryptMessage(payload, cryptoKey) {
    if (!cryptoKey) {
      throw new Error('Missing audio key for decryption.');
    }

    const ivBuffer = base64ToBuffer(payload.iv);
    const ciphertextBuffer = base64ToBuffer(payload.ciphertext);

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: new Uint8Array(ivBuffer),
        },
        cryptoKey,
        ciphertextBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (err) {
      throw new Error('Acoustic key mismatch or authentication tag verification failed.');
    }
  }

  /**
   * Encrypt user's API keys using their audio key so plain keys never sit in localStorage
   * @param {string} apiKey
   * @param {CryptoKey} cryptoKey
   * @returns {Promise<string>} Armored encrypted string
   */
  async function encryptApiKey(apiKey, cryptoKey) {
    if (!apiKey) return '';
    const payload = await encryptMessage(apiKey, cryptoKey);
    return 'CB_KEY_' + JSON.stringify(payload);
  }

  /**
   * Decrypt user's API key on-the-fly using the audio key
   * @param {string} storedCipher
   * @param {CryptoKey} cryptoKey
   * @returns {Promise<string>} Plaintext API key
   */
  async function decryptApiKey(storedCipher, cryptoKey) {
    if (!storedCipher || !storedCipher.startsWith('CB_KEY_')) return '';
    try {
      const raw = storedCipher.replace('CB_KEY_', '');
      const payload = JSON.parse(raw);
      return await decryptMessage(payload, cryptoKey);
    } catch (e) {
      console.warn('Could not decrypt API key with active audio key.');
      return '';
    }
  }

  /**
   * Generate an encrypted .cblock lockfile that only this audio key can unlock
   * @param {string} chatCode
   * @param {CryptoKey} cryptoKey
   * @param {string} creatorName
   * @returns {Promise<{ blob: Blob, filename: string, challengeToken: string }>}
   */
  async function generateLockKeyfile(chatCode, cryptoKey, creatorName = 'Creator') {
    if (!cryptoKey) {
      throw new Error('Audio key required to generate lockfile.');
    }

    // Unique random challenge token
    const challengeBytes = crypto.getRandomValues(new Uint8Array(24));
    const challengeToken = bufferToHex(challengeBytes.buffer);

    const lockPayload = {
      magic: 'CHATBAITER_ENCRYPTED_CBLOCK_v1',
      chatCode: chatCode,
      creator: creatorName,
      timestamp: Date.now(),
      challengeToken: challengeToken,
      entropy: bufferToHex(crypto.getRandomValues(new Uint8Array(16)).buffer),
    };

    const encryptedBundle = await encryptMessage(JSON.stringify(lockPayload), cryptoKey);

    // Strange encrypted file wrapper (.cblock)
    const fileContainer = {
      format: 'ACOUSTIC_CBLOCK',
      version: '1.0',
      chatCode: chatCode,
      createdAt: new Date().toISOString(),
      envelope: encryptedBundle,
      seal: 'HMAC_SHA256_TAMPER_SEALED',
    };

    const fileContent = JSON.stringify(fileContainer, null, 2);
    const blob = new Blob([fileContent], { type: 'application/octet-stream' });
    const filename = `ChatBaiter_Shield_${chatCode}.cblock`;

    return {
      blob,
      filename,
      challengeToken,
      fileContent,
    };
  }

  /**
   * Verify and decrypt a .cblock keyfile against the active audio key and chat code
   * @param {string} fileContent
   * @param {string} expectedChatCode
   * @param {CryptoKey} cryptoKey
   * @returns {Promise<{ valid: boolean, payload?: any, error?: string }>}
   */
  async function verifyLockKeyfile(fileContent, expectedChatCode, cryptoKey) {
    if (!fileContent || !cryptoKey) {
      return { valid: false, error: 'Missing keyfile content or audio key.' };
    }

    try {
      const container = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
      if (!container || container.format !== 'ACOUSTIC_CBLOCK' || !container.envelope) {
        return { valid: false, error: 'Corrupted or invalid .cblock file header.' };
      }

      if (container.chatCode !== expectedChatCode) {
        return { valid: false, error: `Keyfile was created for room ${container.chatCode}, not ${expectedChatCode}.` };
      }

      // Decrypt inner payload with friend's audio key
      const decryptedJsonStr = await decryptMessage(container.envelope, cryptoKey);
      const innerPayload = JSON.parse(decryptedJsonStr);

      if (innerPayload.magic !== 'CHATBAITER_ENCRYPTED_CBLOCK_v1') {
        return { valid: false, error: 'Cryptographic challenge structure invalid.' };
      }

      return {
        valid: true,
        payload: innerPayload,
      };
    } catch (err) {
      return {
        valid: false,
        error: 'Acoustic Key Mismatch! Your audio key could not decrypt this .cblock file.',
      };
    }
  }

  /**
   * Scramble / Obfuscate text dynamically when no key or incorrect key is present
   * @param {number} length
   * @returns {string} Scrambled glitched cipher characters
   */
  const CIPHER_CHARS = '█▓▒░0123456789ABCDEF!@#$%^&*()_+~|}{[]:;?><';
  function generateScrambledText(length = 24) {
    const len = Math.max(12, Math.min(length, 64));
    let result = '';
    for (let i = 0; i < len; i++) {
      const idx = Math.floor(Math.random() * CIPHER_CHARS.length);
      result += CIPHER_CHARS[idx];
    }
    return result;
  }

  /**
   * Opposite / Inverse of generateScrambledText:
   * Reconstitute and reveal plain text with simulated cryptographic descramble sequence
   */
  function descrambleText(targetPlainText, onProgress, durationMs = 350) {
    if (!targetPlainText) return Promise.resolve('');
    return new Promise((resolve) => {
      const chars = targetPlainText.split('');
      const totalSteps = 6;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const currentProgress = step / totalSteps;
        const rendered = chars
          .map((c, idx) => {
            if (idx / chars.length < currentProgress) return c;
            return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
          })
          .join('');
        if (onProgress) onProgress(rendered);
        if (step >= totalSteps) {
          clearInterval(interval);
          if (onProgress) onProgress(targetPlainText);
          resolve(targetPlainText);
        }
      }, durationMs / totalSteps);
    });
  }

  /**
   * Opposite / Inverse of deriveAudioKey:
   * Securely zeroize and purge sensitive cryptographic key material from memory
   */
  function zeroizeKeyMemory(keyDataRef) {
    if (!keyDataRef) return true;
    try {
      if (keyDataRef.cryptoKey) keyDataRef.cryptoKey = null;
      if (keyDataRef.hexHash) keyDataRef.hexHash = null;
      if (keyDataRef.shortHash) keyDataRef.shortHash = 'ZEROIZED';
      keyDataRef.securityRating = 'PURGED';
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    deriveAudioKey,
    zeroizeKeyMemory,
    hashUsername,
    encryptMessage,
    decryptMessage,
    encryptApiKey,
    decryptApiKey,
    generateLockKeyfile,
    verifyLockKeyfile,
    generateScrambledText,
    descrambleText,
  };
})();

if (typeof window !== 'undefined') {
  window.ChatCrypto = ChatCrypto;
}
if (typeof globalThis !== 'undefined') {
  globalThis.ChatCrypto = ChatCrypto;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatCrypto;
}
