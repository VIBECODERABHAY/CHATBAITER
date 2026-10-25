/**
 * ChatBaiter Cryptographic Engine
 * Web Crypto API (SubtleCrypto) Implementation
 * - Acoustic Key Derivation via SHA-256
 * - Symmetric Authenticated Encryption via AES-256-GCM
 * - Salted Username Hashing
 * - Dynamic Text Scrambling / Obfuscation
 */

const ChatCrypto = (function () {
  'use strict';

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
    return window.btoa(binary);
  }

  // Helper: Convert Base64 String to ArrayBuffer
  function base64ToBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Derive a 256-bit AES-GCM Key and Hash from an Audio File's ArrayBuffer
   * @param {ArrayBuffer} audioArrayBuffer
   * @returns {Promise<{ hexHash: string, shortHash: string, cryptoKey: CryptoKey }>}
   */
  async function deriveAudioKey(audioArrayBuffer) {
    if (!audioArrayBuffer || audioArrayBuffer.byteLength === 0) {
      throw new Error('Audio buffer is empty or invalid.');
    }

    // Step 1: Compute SHA-256 Digest of the raw audio bytes
    const hashBuffer = await crypto.subtle.digest('SHA-256', audioArrayBuffer);
    const hexHash = bufferToHex(hashBuffer);
    const shortHash = '0x' + hexHash.substring(0, 8).toUpperCase();

    // Step 2: Import the 256-bit hash as an AES-GCM CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false, // non-extractable for security
      ['encrypt', 'decrypt']
    );

    return {
      hexHash,
      shortHash,
      cryptoKey,
    };
  }

  /**
   * Hash a username using the audio hash as a salt/HMAC input
   * @param {string} username
   * @param {string} audioHexHash
   * @returns {Promise<string>} Short user identity hash (e.g., #A8F2)
   */
  async function hashUsername(username, audioHexHash) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${username.trim()}::${audioHexHash || 'NO_AUDIO_KEY'}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hex = bufferToHex(digest);
    return '#' + hex.substring(0, 6).toUpperCase();
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

    // Generate random 12-byte IV for AES-GCM
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
      throw new Error('Key mismatch or authentication tag verification failed.');
    }
  }

  /**
   * Scramble / Obfuscate text dynamically when no key or incorrect key is present
   * @param {string|number} seedOrLength
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

  return {
    deriveAudioKey,
    hashUsername,
    encryptMessage,
    decryptMessage,
    generateScrambledText,
  };
})();
