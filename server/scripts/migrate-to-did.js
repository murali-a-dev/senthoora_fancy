import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getDb } from '../config/firebase.js';

dotenv.config();

/**
 * Validates if an ID is a native 20-character Firestore auto-generated ID
 * (e.g. 'VtFSYfH5nMPCsurTMUYc')
 */
function isFirestoreAutoId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9]{20}$/.test(id) && !id.startsWith('prod_');
}

/**
 * Migrates a collection so that every document has a native Firestore auto-generated ID
 * (like 'VtFSYfH5nMPCsurTMUYc') and its 'did' field matches that ID.
 */
async function migrateCollectionToAutoDid(collectionName, idMapping = {}) {
  console.log(`\n========================================`);
  console.log(`Migrating collection '${collectionName}' to Firestore Auto-IDs`);
  console.log(`========================================`);

  const db = getDb();
  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`No documents found in '${collectionName}'.`);
    return { total: 0, converted: 0, unchanged: 0 };
  }

  console.log(`Found ${snapshot.size} document(s) in '${collectionName}'.`);
  let convertedCount = 0;
  let unchangedCount = 0;

  for (const doc of snapshot.docs) {
    const oldId = doc.id;
    const data = doc.data();

    // Remove legacy 'id' field if present
    delete data.id;

    if (!isFirestoreAutoId(oldId)) {
      // Generate a new 20-character Firestore auto-ID (e.g. 'VtFSYfH5nMPCsurTMUYc')
      const newDocRef = db.collection(collectionName).doc();
      const newAutoId = newDocRef.id;

      // Track mapping for foreign references (e.g. productId in inquiries)
      idMapping[oldId] = newAutoId;

      const updatedData = {
        ...data,
        did: newAutoId,
      };

      // Create new document with auto-ID
      await newDocRef.set(updatedData);

      // Delete the old custom ID document (e.g. 'prod_001')
      await doc.ref.delete();

      console.log(`  ✓ Converted: [${oldId}] ➔ [${newAutoId}] (did: '${newAutoId}')`);
      convertedCount++;
    } else {
      // Document already has a native Firestore auto-ID (e.g. 'VtFSYfH5nMPCsurTMUYc')
      if (data.did !== oldId || Object.prototype.hasOwnProperty.call(doc.data(), 'id')) {
        await doc.ref.update({
          did: oldId,
          id: admin.firestore.FieldValue.delete(),
        });
        console.log(`  ✓ Updated fields on [${oldId}] (did: '${oldId}')`);
        convertedCount++;
      } else {
        console.log(`  - [${oldId}] is already a valid auto-ID with did='${oldId}'`);
        unchangedCount++;
      }
    }
  }

  console.log(`Finished '${collectionName}': ${convertedCount} converted/updated, ${unchangedCount} unchanged.`);
  return { total: snapshot.size, converted: convertedCount, unchanged: unchangedCount };
}

/**
 * Updates any inquiries that reference an old product ID
 */
async function updateInquiryProductReferences(idMapping) {
  if (Object.keys(idMapping).length === 0) return;

  console.log(`\nUpdating inquiries that reference migrated product IDs...`);
  const db = getDb();
  const snapshot = await db.collection('inquiries').get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.productId && idMapping[data.productId]) {
      const newPid = idMapping[data.productId];
      await doc.ref.update({ productId: newPid });
      console.log(`  ✓ Inquiry [${doc.id}]: updated productId from '${data.productId}' ➔ '${newPid}'`);
    }
  }
}

async function run() {
  try {
    console.log('🚀 Starting Migration: Convert all documents to 20-char Firestore Auto-IDs (like "VtFSYfH5nMPCsurTMUYc")');
    const productIdMapping = {};

    const productStats = await migrateCollectionToAutoDid('products', productIdMapping);
    await updateInquiryProductReferences(productIdMapping);
    const inquiryStats = await migrateCollectionToAutoDid('inquiries');

    console.log('\n========================================');
    console.log('FINAL MIGRATION SUMMARY');
    console.log('========================================');
    console.log(`Products:   ${productStats.converted} converted to Auto-IDs / ${productStats.total} total`);
    console.log(`Inquiries:  ${inquiryStats.converted} converted to Auto-IDs / ${inquiryStats.total} total`);
    console.log('✅ All products and inquiries now have native Firestore auto-generated Dids (e.g. "VtFSYfH5nMPCsurTMUYc")!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  }
}

run();
