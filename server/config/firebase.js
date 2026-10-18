import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { initialProducts } from '../data/initialProducts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_STORE_FILE = path.join(__dirname, '../data/store.json');
const potentialCredPaths = [
  path.join(process.cwd(), 'credentials.json'),
  path.join(__dirname, '../../credentials.json'),
  path.join(__dirname, '../credentials.json'),
  path.join(__dirname, 'credentials.json'),
];
const CREDENTIALS_FILE = potentialCredPaths.find((p) => fs.existsSync(p)) || potentialCredPaths[0];

let db = null;
let isMockStore = false;

// Ensure server/data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper to load/persist local fallback data
function loadLocalStore() {
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[Store] Could not read local store, resetting:', err.message);
  }

  // Initial seed
  const seed = {
    products: initialProducts.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {}),
    companyDetails: {},
    inquiries: {},
  };
  fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(seed, null, 2), 'utf8');
  return seed;
}

let writeQueue = Promise.resolve();

function saveLocalStore(storeData) {
  writeQueue = writeQueue.then(async () => {
    try {
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(storeData, null, 2), 'utf8');
    } catch (err) {
      console.error('[Store] Failed to write local store:', err.message);
    }
  });
  return writeQueue;
}

// In-memory fallback Firestore implementation
function createMockFirestore() {
  const store = loadLocalStore();

  const getCollectionRef = (collName) => {
    if (!store[collName]) {
      store[collName] = {};
      saveLocalStore(store);
    }

    return {
      get: async () => {
        const collection = store[collName] || {};
        const docs = Object.entries(collection).map(([id, data]) => ({
          id,
          exists: true,
          data: () => data,
          ...data,
        }));
        return {
          docs,
          empty: docs.length === 0,
          size: docs.length,
          forEach: (cb) => docs.forEach(cb),
        };
      },
      doc: (docId) => {
        const targetId = docId || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        return {
          id: targetId,
          get: async () => {
            const data = (store[collName] && store[collName][targetId]) || null;
            return {
              id: targetId,
              exists: !!data,
              data: () => data || {},
            };
          },
          set: async (data, options = {}) => {
            if (!store[collName]) store[collName] = {};
            if (options.merge && store[collName][targetId]) {
              store[collName][targetId] = { ...store[collName][targetId], ...data, id: targetId };
            } else {
              store[collName][targetId] = { ...data, id: targetId };
            }
            saveLocalStore(store);
            return { id: targetId };
          },
          update: async (data) => {
            if (!store[collName]) store[collName] = {};
            const existing = store[collName][targetId] || {};
            store[collName][targetId] = { ...existing, ...data, id: targetId };
            saveLocalStore(store);
            return { id: targetId };
          },
          delete: async () => {
            if (store[collName] && store[collName][targetId]) {
              delete store[collName][targetId];
              saveLocalStore(store);
            }
            return { success: true };
          },
        };
      },
      add: async (data) => {
        const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        if (!store[collName]) store[collName] = {};
        store[collName][newId] = { id: newId, ...data };
        saveLocalStore(store);
        return {
          id: newId,
          get: async () => ({
            id: newId,
            exists: true,
            data: () => store[collName][newId],
          }),
        };
      },
      where: (field, op, val) => {
        const base = getCollectionRef(collName);
        return {
          ...base,
          get: async () => {
            const res = await base.get();
            const filtered = res.docs.filter((d) => {
              const item = d.data();
              if (op === '==') return item[field] === val;
              if (op === '!=') return item[field] !== val;
              if (op === 'array-contains') return Array.isArray(item[field]) && item[field].includes(val);
              return true;
            });
            return {
              docs: filtered,
              empty: filtered.length === 0,
              size: filtered.length,
              forEach: (cb) => filtered.forEach(cb),
            };
          },
        };
      },
      orderBy: (field, direction = 'asc') => {
        const base = getCollectionRef(collName);
        return {
          ...base,
          get: async () => {
            const res = await base.get();
            const sorted = [...res.docs].sort((a, b) => {
              const valA = a.data()[field] ?? '';
              const valB = b.data()[field] ?? '';
              if (direction === 'desc') {
                return valA > valB ? -1 : valA < valB ? 1 : 0;
              }
              return valA < valB ? -1 : valA > valB ? 1 : 0;
            });
            return {
              docs: sorted,
              empty: sorted.length === 0,
              size: sorted.length,
              forEach: (cb) => sorted.forEach(cb),
            };
          },
        };
      },
    };
  };

  return {
    collection: (name) => getCollectionRef(name),
  };
}

// Resilient wrapper: routes to Cloud Firestore, but automatically falls back to local store if Firestore API is disabled/permission denied
function createResilientFirestore(realDb) {
  let mockDb = null;
  const getFallbackMock = () => {
    if (!mockDb) mockDb = createMockFirestore();
    return mockDb;
  };
  let firestoreFailed = false;

  return {
    collection: (name) => {
      if (firestoreFailed) {
        return getFallbackMock().collection(name);
      }
      const realCol = realDb.collection(name);
      return {
        get: async () => {
          try {
            return await realCol.get();
          } catch (err) {
            if (err.code === 7 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('firestore.googleapis.com')) {
              console.warn(`[Firebase] Firestore API disabled on Google Cloud project. Automatically falling back to resilient local JSON store.`);
              firestoreFailed = true;
              isMockStore = true;
              return getFallbackMock().collection(name).get();
            }
            throw err;
          }
        },
        doc: (docId) => {
          if (firestoreFailed) return getFallbackMock().collection(name).doc(docId);
          const realDoc = realCol.doc(docId);
          return {
            id: realDoc.id,
            get: async () => {
              try {
                return await realDoc.get();
              } catch (err) {
                if (err.code === 7 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('firestore.googleapis.com')) {
                  firestoreFailed = true;
                  isMockStore = true;
                  return getFallbackMock().collection(name).doc(docId).get();
                }
                throw err;
              }
            },
            set: async (data, options) => {
              try {
                return await realDoc.set(data, options);
              } catch (err) {
                if (err.code === 7 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('firestore.googleapis.com')) {
                  firestoreFailed = true;
                  isMockStore = true;
                  return getFallbackMock().collection(name).doc(docId).set(data, options);
                }
                throw err;
              }
            },
            update: async (data) => {
              try {
                return await realDoc.update(data);
              } catch (err) {
                if (err.code === 7 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('firestore.googleapis.com')) {
                  firestoreFailed = true;
                  isMockStore = true;
                  return getFallbackMock().collection(name).doc(docId).update(data);
                }
                throw err;
              }
            },
            delete: async () => {
              try {
                return await realDoc.delete();
              } catch (err) {
                if (err.code === 7 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('firestore.googleapis.com')) {
                  firestoreFailed = true;
                  isMockStore = true;
                  return getFallbackMock().collection(name).doc(docId).delete();
                }
                throw err;
              }
            },
          };
        },
        add: async (data) => {
          try {
            return await realCol.add(data);
          } catch (err) {
            if (err.code === 7 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('firestore.googleapis.com')) {
              firestoreFailed = true;
              isMockStore = true;
              return getFallbackMock().collection(name).add(data);
            }
            throw err;
          }
        },
      };
    },
  };
}

export function initFirebase() {
  if (db) return db;

  let serviceAccount = null;

  // 1. Try credentials.json if exists
  if (fs.existsSync(CREDENTIALS_FILE)) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
      console.log('Found local Firebase credentials.json file.');
    } catch (err) {
      console.warn('Could not read credentials.json:', err.message);
    }
  }

  // 2. Try environment variables
  if (!serviceAccount && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
    if (privateKey && !privateKey.includes('YOUR_PRIVATE_KEY_HERE') && privateKey.length > 50) {
      privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      };
    }
  }

  const hasCreds =
    serviceAccount &&
    (serviceAccount.project_id || serviceAccount.projectId) &&
    (serviceAccount.private_key || serviceAccount.privateKey);

  if (hasCreds) {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
      const realDb = admin.firestore();
      const projId = serviceAccount.project_id || serviceAccount.projectId;
      console.log(`[Firebase] Initialized Firestore connected to: ${projId}`);
      db = createResilientFirestore(realDb);
      isMockStore = false;
      return db;
    } catch (err) {
      console.warn('[Firebase] Initialization error, falling back to local persistent store:', err.message);
    }
  }

  // 3. Fallback to resilient local JSON store
  console.log('[Firebase] Operating with resilient local JSON store (auto-seeds initial catalog).');
  db = createMockFirestore();
  isMockStore = true;
  return db;
}

export function getDb() {
  if (!db) {
    return initFirebase();
  }
  return db;
}

export const isUsingMock = () => isMockStore;

export default { getDb, initFirebase, isUsingMock };
