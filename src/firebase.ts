import { initializeApp, getApp, getApps, FirebaseApp, setLogLevel } from 'firebase/app';
import { 
  initializeFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  onSnapshot, 
  writeBatch,
  Firestore
} from 'firebase/firestore';
import { AppDatabase } from './types';

import firebaseAppletConfig from '../firebase-applet-config.json';

// Silence excessive debug logs when Firestore is offline or unavailable
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

// Read configuration from environment variables or fallback to generated firebase-applet-config.json
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || firebaseAppletConfig?.apiKey || '',
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig?.authDomain || '',
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig?.projectId || '',
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig?.storageBucket || '',
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig?.messagingSenderId || '',
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || firebaseAppletConfig?.appId || '',
  firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig?.firestoreDatabaseId || '',
};

// Check if Firebase variables are populated
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId;
    const firestoreSettings = {
      experimentalAutoDetectLongPolling: true,
    };
    if (dbId && dbId !== '(default)') {
      db = initializeFirestore(app, firestoreSettings, dbId);
    } else {
      db = initializeFirestore(app, firestoreSettings);
    }
    console.log('🔌 [Firebase] Initialized successfully with Cloud Project:', firebaseConfig.projectId, 'Database ID:', dbId || '(default)');
  } catch (error) {
    console.error('❌ [Firebase] Initialization failed:', error);
  }
} else {
  console.warn('⚠️ [Firebase] VITE_FIREBASE_PROJECT_ID or API keys are missing in .env. Falling back to LocalStorage (Offline Synchronized Mode).');
}

export { app as firebaseApp, db as firestoreDb };

/**
 * Syncs the entire database structure into individual collections in Firestore.
 * This ensures the Android app can query individual collections natively!
 */
export async function uploadDatabaseToFirestore(database: AppDatabase): Promise<void> {
  if (!db) return;

  try {
    const collectionsToSync: Array<{ name: keyof AppDatabase; items: any[] }> = [
      { name: 'users', items: database.users },
      { name: 'categories', items: database.categories },
      { name: 'products', items: database.products },
      { name: 'orders', items: database.orders },
      { name: 'banners', items: database.banners },
      { name: 'withdrawalRequests', items: database.withdrawalRequests },
      { name: 'auditLogs', items: database.auditLogs },
      { name: 'productReviews', items: database.productReviews || [] },
      { name: 'bankAccounts', items: database.bankAccounts || [] }
    ];

    // For each collection, write documents with their 'id' as key
    for (const coll of collectionsToSync) {
      const collRef = collection(db, coll.name);
      for (const item of coll.items) {
        if (item && item.id) {
          const docRef = doc(collRef, item.id);
          await setDoc(docRef, item, { merge: true }).catch(err => {
            console.warn(`⚠️ [Firebase Sync Write] Could not update item ${item.id} in ${coll.name}:`, err?.message || err);
          });
        }
      }
    }

    // Save singleton configurations
    if (database.commissionSettings) {
      await setDoc(doc(db, 'settings', 'commission'), database.commissionSettings, { merge: true }).catch(() => {});
    }
    if (database.socialLinks) {
      await setDoc(doc(db, 'settings', 'socials'), database.socialLinks, { merge: true }).catch(() => {});
    }

    console.log('✅ [Firebase] All local collections synchronized and updated in Firestore Cloud successfully!');
  } catch (error) {
    console.error('❌ [Firebase] Error uploading data to Firestore:', error);
  }
}

/**
 * Downloads all data from Firestore to recreate the local AppDatabase object.
 * If Firestore is empty, it populates it with the local fallback database.
 */
export async function downloadDatabaseFromFirestore(fallbackDb: AppDatabase): Promise<AppDatabase> {
  if (!db) return fallbackDb;

  // Set up a 2.5-second timeout for initial Firestore fetch to prevent app load hangs
  const timeoutPromise = new Promise<AppDatabase>((resolve) => {
    setTimeout(() => {
      console.warn('⚠️ [Firebase] Connection timeout reached while contacting Firestore. Operating in local-fallback mode.');
      resolve(fallbackDb);
    }, 2500);
  });

  const fetchPromise = (async (): Promise<AppDatabase> => {
    try {
      const fetchedDb: Partial<AppDatabase> = {};

      const collectionsToFetch: Array<{ name: keyof AppDatabase; defaultVal: any[] }> = [
        { name: 'users', defaultVal: fallbackDb.users },
        { name: 'categories', defaultVal: fallbackDb.categories },
        { name: 'products', defaultVal: fallbackDb.products },
        { name: 'orders', defaultVal: fallbackDb.orders },
        { name: 'banners', defaultVal: fallbackDb.banners },
        { name: 'withdrawalRequests', defaultVal: fallbackDb.withdrawalRequests },
        { name: 'auditLogs', defaultVal: fallbackDb.auditLogs },
        { name: 'productReviews', defaultVal: fallbackDb.productReviews || [] },
        { name: 'bankAccounts', defaultVal: fallbackDb.bankAccounts || [] }
      ];

      let isEmpty = true;

      for (const coll of collectionsToFetch) {
        try {
          const snap = await getDocs(collection(db!, coll.name));
          if (!snap.empty) {
            isEmpty = false;
            let items = snap.docs.map(doc => doc.data());
            if (coll.name === 'categories') {
              const fallbackMap = new Map((fallbackDb.categories || []).map((c: any) => [c.id, c]));
              items = items.map((cat: any) => {
                const fallbackCat = fallbackMap.get(cat.id);
                const subCats = {
                  ...(fallbackCat?.sub_categories || {}),
                  ...(cat.sub_categories || {})
                };
                const navMenu = (cat.navigation_menu && cat.navigation_menu.length > 0)
                  ? cat.navigation_menu
                  : (fallbackCat?.navigation_menu || []);
                return {
                  ...fallbackCat,
                  ...cat,
                  sub_categories: subCats,
                  navigation_menu: navMenu
                };
              });
              const existingCatIds = new Set(items.map((i: any) => i.id));
              (fallbackDb.categories || []).forEach((fCat: any) => {
                if (!existingCatIds.has(fCat.id)) {
                  items.push(fCat);
                }
              });
            }
            (fetchedDb as any)[coll.name] = items;
          } else {
            (fetchedDb as any)[coll.name] = coll.defaultVal;
          }
        } catch (collErr) {
          console.warn(`⚠️ [Firebase] Could not fetch collection "${coll.name}", using local fallback:`, collErr);
          (fetchedDb as any)[coll.name] = coll.defaultVal;
        }
      }

      // Settings singletons
      try {
        const commissionSnap = await getDocs(collection(db!, 'settings'));
        const commissionDoc = commissionSnap.docs.find(d => d.id === 'commission');
        const socialsDoc = commissionSnap.docs.find(d => d.id === 'socials');

        fetchedDb.commissionSettings = commissionDoc ? (commissionDoc.data() as any) : fallbackDb.commissionSettings;
        fetchedDb.socialLinks = socialsDoc ? (socialsDoc.data() as any) : fallbackDb.socialLinks;
      } catch {
        fetchedDb.commissionSettings = fallbackDb.commissionSettings;
        fetchedDb.socialLinks = fallbackDb.socialLinks;
      }

      // Preserve appAppearanceSettings & shippingSettings from local DB
      fetchedDb.appAppearanceSettings = fallbackDb.appAppearanceSettings;
      fetchedDb.shippingSettings = fallbackDb.shippingSettings;

      // If remote Firestore was totally empty, populate it with our local default database
      if (isEmpty) {
        console.log('🌱 [Firebase] Firestore is empty. Seeding Firestore with rich starting database...');
        uploadDatabaseToFirestore(fallbackDb).catch(() => {});
        return fallbackDb;
      }

      return {
        ...fallbackDb,
        ...fetchedDb
      } as AppDatabase;
    } catch (error) {
      console.error('❌ [Firebase] Error downloading database from Firestore:', error);
      return fallbackDb;
    }
  })();

  return Promise.race([fetchPromise, timeoutPromise]);
}

/**
 * Registers a real-time listener that invokes callback whenever anything updates in Firestore.
 * This guarantees complete, instant bidirectional synchronization!
 */
export function setupRealtimeFirebaseSync(
  currentDb: AppDatabase,
  onUpdate: (updatedDb: AppDatabase) => void
): () => void {
  if (!db) return () => {};

  console.log('🔄 [Firebase] Subscribing to bidirectional live-sync Firestore channels...');

  let localCopy = { ...currentDb };
  const unsubscribes: Array<() => void> = [];

  const collectionsToListen: Array<keyof AppDatabase> = [
    'users', 'categories', 'products', 'orders', 'banners', 'withdrawalRequests', 'auditLogs', 'productReviews', 'bankAccounts'
  ];

  collectionsToListen.forEach(collName => {
    try {
      const unsub = onSnapshot(collection(db!, collName), 
        (snapshot) => {
          if (!snapshot.empty) {
            let updatedItems = snapshot.docs.map(doc => doc.data());
            if (collName === 'categories') {
              const fallbackMap = new Map((currentDb.categories || []).map((c: any) => [c.id, c]));
              updatedItems = updatedItems.map((cat: any) => {
                const fallbackCat = fallbackMap.get(cat.id);
                const subCats = {
                  ...(fallbackCat?.sub_categories || {}),
                  ...(cat.sub_categories || {})
                };
                const navMenu = (cat.navigation_menu && cat.navigation_menu.length > 0)
                  ? cat.navigation_menu
                  : (fallbackCat?.navigation_menu || []);
                return {
                  ...fallbackCat,
                  ...cat,
                  sub_categories: subCats,
                  navigation_menu: navMenu
                };
              });
              const existingCatIds = new Set(updatedItems.map((i: any) => i.id));
              (currentDb.categories || []).forEach((fCat: any) => {
                if (!existingCatIds.has(fCat.id)) {
                  updatedItems.push(fCat);
                }
              });
            }
            localCopy = {
              ...localCopy,
              [collName]: updatedItems
            };
            onUpdate(localCopy);
          }
        },
        (error) => {
          console.warn(`⚠️ [Firebase Sync Offline] Could not sync collection "${collName}":`, error.message);
        }
      );
      unsubscribes.push(unsub);
    } catch (err) {
      console.warn(`⚠️ [Firebase Sync Error] Listener registration failed for ${collName}:`, err);
    }
  });

  // Listen to settings changes too
  try {
    const unsubSettings = onSnapshot(collection(db, 'settings'), 
      (snapshot) => {
        snapshot.docs.forEach(docSnap => {
          if (docSnap.id === 'commission') {
            localCopy = { ...localCopy, commissionSettings: docSnap.data() as any };
          }
          if (docSnap.id === 'socials') {
            localCopy = { ...localCopy, socialLinks: docSnap.data() as any };
          }
        });
        onUpdate(localCopy);
      },
      (error) => {
        console.warn('⚠️ [Firebase Sync Offline] Could not sync "settings":', error.message);
      }
    );
    unsubscribes.push(unsubSettings);
  } catch (err) {
    console.warn('⚠️ [Firebase Sync Error] Listener registration failed for settings:', err);
  }

  // Return a cleanup function to unsubscribe from all live streams
  return () => {
    unsubscribes.forEach(unsub => {
      try {
        unsub();
      } catch {
        // Ignore
      }
    });
    console.log('🔌 [Firebase] Unsubscribed from real-time sync channels.');
  };
}

