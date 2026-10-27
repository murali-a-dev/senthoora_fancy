import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

/**
 * Initialize Google Cloud Firestore.
 * Priority: environment variables first, credentials.json fallback (local dev only).
 * NEVER commit credentials.json to git — see SECURITY_NOTICE.md
 */
export function initFirebase() {
  if (db) return db;

  let serviceAccount = null;

  // 1. Try environment variables FIRST (preferred for production & CI)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
    if (privateKey && !privateKey.includes('YOUR_PRIVATE_KEY_HERE') && privateKey.length > 50) {
      privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
      serviceAccount = {
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      };
      console.log('[Firebase] Using credentials from environment variables');
    }
  }

  // 2. Fallback: credentials.json (local development only — never commit this file)
  if (!serviceAccount) {
    const potentialPaths = [
      path.join(process.cwd(), 'credentials.json'),
      path.join(__dirname, '../../credentials.json'),
    ];
    const credFile = potentialPaths.find((p) => fs.existsSync(p));
    if (credFile) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(credFile, 'utf8'));
        console.log('[Firebase] Loaded credentials from credentials.json (local dev only)');
      } catch (err) {
        console.warn('[Firebase] Could not read credentials.json:', err.message);
      }
    }
  }

  const hasCreds =
    serviceAccount &&
    (serviceAccount.project_id || serviceAccount.projectId) &&
    (serviceAccount.private_key || serviceAccount.privateKey);

  if (!hasCreds) {
    throw new Error(
      '[Firebase] Missing credentials.\n' +
      'For production: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env\n' +
      'For local dev: place credentials.json in project root (do NOT commit it)'
    );
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  const projId = serviceAccount.project_id || serviceAccount.projectId;
  console.log(`[Firebase] Connected to Cloud Firestore: ${projId}`);

  db = admin.firestore();
  return db;
}

export function getDb() {
  if (!db) return initFirebase();
  return db;
}

export default { getDb, initFirebase };
