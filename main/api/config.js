const fs = require('fs');
const path = require('path');

let serverOverrideConfig = null;
let isPermanentlyDeleted = false;

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle DELETE: Permanently erase and wipe API configuration from the server
  if (req.method === 'DELETE') {
    serverOverrideConfig = null;
    isPermanentlyDeleted = true;

    // 1. Zeroize in-memory environment variables
    const keysToWipe = [
      'FIREBASE_API_KEY',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID',
      'FIREBASE_MEASUREMENT_ID',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'GEMINI_API_KEY',
      'DEEPSEEK_API_KEY',
      'GROQ_API_KEY',
    ];

    keysToWipe.forEach((k) => {
      if (process.env[k]) {
        process.env[k] = '';
        delete process.env[k];
      }
    });

    // 2. If running locally with .env file, wipe the file content permanently
    try {
      const envPath = path.resolve(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, '# Server API Keys permanently deleted\n', 'utf8');
      }
    } catch (e) {
      console.warn('Could not wipe local .env file:', e);
    }

    return res.status(200).json({
      success: true,
      deleted: true,
      message: 'API configuration and keys permanently deleted from server. Zero server footprint active.',
    });
  }

  // Handle POST: Add or update API configuration on the server
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    if (!body && typeof req.on === 'function') {
      body = await new Promise((resolve) => {
        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            resolve({});
          }
        });
      });
    }

    if (body && (body.apiKey || body.projectId)) {
      serverOverrideConfig = {
        apiKey: body.apiKey || '',
        projectId: body.projectId || '',
        authDomain: body.authDomain || (body.projectId ? `${body.projectId}.firebaseapp.com` : ''),
        storageBucket: body.storageBucket || (body.projectId ? `${body.projectId}.appspot.com` : ''),
        messagingSenderId: body.messagingSenderId || '',
        appId: body.appId || '',
        measurementId: body.measurementId || '',
      };
      isPermanentlyDeleted = false;

      // Update in-memory environment variables
      process.env.FIREBASE_API_KEY = serverOverrideConfig.apiKey;
      process.env.FIREBASE_PROJECT_ID = serverOverrideConfig.projectId;

      return res.status(200).json({
        success: true,
        configured: true,
        message: 'API configuration stored on server.',
        config: serverOverrideConfig,
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid API configuration payload.' });
  }

  // Handle GET: Retrieve active server configuration
  if (isPermanentlyDeleted) {
    return res.status(200).json({
      configured: false,
      permanentlyDeleted: true,
      message: 'API credentials have been permanently deleted from this server.',
    });
  }

  const active = serverOverrideConfig || {
    apiKey: process.env.FIREBASE_API_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
    authDomain:
      process.env.FIREBASE_AUTH_DOMAIN ||
      (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com` : ''),
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.appspot.com` : ''),
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
  };

  if (!active.apiKey || !active.projectId) {
    return res.status(200).json({
      configured: false,
      message: 'Environment variables not configured on server.',
    });
  }

  return res.status(200).json({
    configured: true,
    config: active,
  });
};
