import { CONFIG } from "../constants";

// Encrypt function with Web Crypto API
const encryptData = async (data: string, secret: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate random salt (16 bytes)

  // Derive key using PBKDF2
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt, // Salt as Uint8Array
      iterations: 10000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // Generate a 12-byte IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV

  // Encrypt the data
  const encodedData = encoder.encode(data);
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv }, // IV here is of type Uint8Array
    derivedKey,
    encodedData
  );

  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const uint8Array = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...uint8Array));
  };

  const encryptedBase64 = arrayBufferToBase64(encryptedData);
  const ivBase64 = arrayBufferToBase64(iv.buffer); // Access the raw ArrayBuffer
  const saltBase64 = arrayBufferToBase64(salt.buffer);

  // Return encrypted data as a JSON string with salt, iv, and ciphertext
  const result = {
    salt: saltBase64,
    iv: ivBase64,
    ciphertext: encryptedBase64,
  };

  return JSON.stringify(result);
};

// Decrypt function with Web Crypto API
const decryptData = async (
  encrypted: string,
  secret: string
): Promise<string | null> => {
  try {
    const {
      salt,
      iv,
      ciphertext,
    }: { salt: string; iv: string; ciphertext: string } = JSON.parse(encrypted);

    // Convert base64 to ArrayBuffer
    const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
      const binaryString = atob(base64);
      const length = binaryString.length;
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    };

    const saltBuffer = base64ToArrayBuffer(salt);
    const ivBuffer = base64ToArrayBuffer(iv);
    const ciphertextBuffer = base64ToArrayBuffer(ciphertext);

    // Derive the key using PBKDF2
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBuffer, // Use the ArrayBuffer directly
        iterations: 10000,
        hash: "SHA-256",
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuffer }, // IV here is of type Uint8Array
      derivedKey,
      ciphertextBuffer
    );

    // Convert decrypted data to UTF-8 string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error("Failed to decrypt data:", error);
    return null; // Handle decryption failure
  }
};

// IndexedDB setup and helpers
const DB_NAME = "authStore";
const DB_VERSION = 1;
const AUTH_STORE = "auth";
const GENERAL_STORE = "general";
const TAB_TRACKING_KEY = "openTabsCount";

// Initialize and open the IndexedDB database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(AUTH_STORE)) {
        db.createObjectStore(AUTH_STORE);
      }

      if (!db.objectStoreNames.contains(GENERAL_STORE)) {
        db.createObjectStore(GENERAL_STORE);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Store a value in IndexedDB
const storeInDB = async (
  storeName: string,
  key: string,
  value: any
): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    // Close the database when the transaction completes
    transaction.oncomplete = () => db.close();
  });
};

// Get a value from IndexedDB
const getFromDB = async (storeName: string, key: string): Promise<any> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    // Close the database when the transaction completes
    transaction.oncomplete = () => db.close();
  });
};

// Remove a value from IndexedDB
const removeFromDB = async (storeName: string, key: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    // Close the database when the transaction completes
    transaction.oncomplete = () => db.close();
  });
};

// Function to delete all data from both IndexedDB and sessionStorage
const clearAllData = async (): Promise<void> => {
  try {
    // First clear all sessionStorage
    sessionStorage.clear();

    // Then delete the entire IndexedDB database
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);

      request.onsuccess = () => {
        console.log("All data cleared successfully");
        resolve();
      };

      request.onerror = (event) => {
        console.error(
          "Error deleting database:",
          (event.target as IDBOpenDBRequest).error
        );
        reject((event.target as IDBOpenDBRequest).error);
      };

      // Handle the case where there are open connections
      request.onblocked = () => {
        console.warn(
          "Database deletion blocked - close all other tabs using this app"
        );
        // Still resolve since we cleared sessionStorage
        resolve();
      };
    });
  } catch (error) {
    console.error("Failed to clear all data:", error);
    // Even if there's an error with IndexedDB, we've still cleared sessionStorage
  }
};

// Tab tracking functions
const initTabTracking = async (): Promise<void> => {
  try {
    // Get current tab count
    let tabCount = (await getFromDB(GENERAL_STORE, TAB_TRACKING_KEY)) || 0;

    // Increment for this tab
    tabCount = parseInt(tabCount, 10) + 1;

    // Save the new count
    await storeInDB(GENERAL_STORE, TAB_TRACKING_KEY, tabCount);

    // Set up tab closing handler
    window.addEventListener("beforeunload", handleTabClosing);

    // Handle visibility changes (mainly for mobile browsers)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        // Some mobile browsers don't reliably fire beforeunload
        // So we mark this tab as potentially closing
        handleTabClosing();
      }
    });

    console.log(`Tab tracking initialized. Current open tabs: ${tabCount}`);
  } catch (error) {
    console.error("Failed to initialize tab tracking:", error);
  }
};

const handleTabClosing = async (): Promise<void> => {
  try {
    // Get and decrement tab count
    let tabCount = (await getFromDB(GENERAL_STORE, TAB_TRACKING_KEY)) || 0;
    tabCount = Math.max(0, parseInt(tabCount, 10) - 1);

    if (tabCount <= 0) {
      // This was the last tab, clear everything
      await clearAllData();
      console.log("Last tab closed, all data cleared");
    } else {
      // Update the counter
      await storeInDB(GENERAL_STORE, TAB_TRACKING_KEY, tabCount);
      console.log(`Tab closed. Remaining tabs: ${tabCount}`);
    }
  } catch (error) {
    console.error("Error in tab closing handler:", error);
  }
};

// Store auth data in IndexedDB
const storeAuthData = async (
  accessToken: string,
  secretKey: string,
  expiresIn: number
) => {
  // Initialize tab tracking if not already done
  await initTabTracking();

  const encryptionKey = CONFIG.ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.error("Encryption key is not defined in the config.");
    return null;
  }

  const encryptedAccessToken = await encryptData(accessToken, encryptionKey);
  const encryptedSecretKey = await encryptData(secretKey, encryptionKey);
  const expirationTime = new Date().getTime() + expiresIn * 1000;

  // Store encrypted values in IndexedDB
  await storeInDB(AUTH_STORE, "accessToken", encryptedAccessToken);
  await storeInDB(AUTH_STORE, "secretKey", encryptedSecretKey);
  await storeInDB(AUTH_STORE, "expirationTime", expirationTime.toString());

  // Also store in sessionStorage as a fallback
  sessionStorage.setItem("accessToken", encryptedAccessToken);
  sessionStorage.setItem("secretKey", encryptedSecretKey);
  sessionStorage.setItem("expirationTime", expirationTime.toString());
};

// Retrieve auth data from IndexedDB
const retrieveAuthData = async () => {
  // Initialize tab tracking if not already done (in case this is called first)
  await initTabTracking();

  try {
    // Try to get from IndexedDB first
    const encryptedAccessToken = await getFromDB(AUTH_STORE, "accessToken");
    const encryptedSecretKey = await getFromDB(AUTH_STORE, "secretKey");
    const expirationTimeStr = await getFromDB(AUTH_STORE, "expirationTime");

    // If not found in IndexedDB, try sessionStorage as fallback
    const accessTokenFromSession = !encryptedAccessToken
      ? sessionStorage.getItem("accessToken")
      : null;
    const secretKeyFromSession = !encryptedSecretKey
      ? sessionStorage.getItem("secretKey")
      : null;
    const expirationTimeFromSession = !expirationTimeStr
      ? sessionStorage.getItem("expirationTime")
      : null;

    const finalAccessToken = encryptedAccessToken || accessTokenFromSession;
    const finalSecretKey = encryptedSecretKey || secretKeyFromSession;
    const finalExpirationTimeStr =
      expirationTimeStr || expirationTimeFromSession;

    const expirationTime = parseInt(finalExpirationTimeStr || "0", 10);

    if (new Date().getTime() > expirationTime) {
      clearAuthData();
      return null; // Token expired
    }

    const encryptionKey = CONFIG.ENCRYPTION_KEY;

    if (!encryptionKey) {
      console.error("Encryption key is not defined in the config.");
      return null; // Handle missing encryption key
    }

    if (finalAccessToken && finalSecretKey) {
      const decryptedAccessToken = await decryptData(
        finalAccessToken,
        encryptionKey
      );
      const decryptedSecretKey = await decryptData(
        finalSecretKey,
        encryptionKey
      );

      return {
        accessToken: decryptedAccessToken,
        secretKey: decryptedSecretKey,
      };
    }
  } catch (error) {
    console.error("Error retrieving auth data:", error);
  }

  return null; // No valid data found
};

// Clear auth data from both IndexedDB and sessionStorage
const clearAuthData = async () => {
  try {
    await removeFromDB(AUTH_STORE, "accessToken");
    await removeFromDB(AUTH_STORE, "secretKey");
    await removeFromDB(AUTH_STORE, "expirationTime");
  } catch (error) {
    console.error("Error clearing auth data from IndexedDB:", error);
  }

  // Also clear from sessionStorage
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("secretKey");
  sessionStorage.removeItem("expirationTime");
};

// GENERAL STORAGE

const secureStore = async (key: string, data: string) => {
  // Initialize tab tracking if not already done
  await initTabTracking();

  const encryptionKey = CONFIG.ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.error("Encryption key is not defined in the config.");
    return;
  }

  // Encrypt the data
  const encryptedData = await encryptData(data, encryptionKey);
  const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;

  // Store in IndexedDB
  await storeInDB(GENERAL_STORE, key, encryptedData);
  await storeInDB(
    GENERAL_STORE,
    `${key}_expirationTime`,
    expirationTime.toString()
  );

  // Also store in sessionStorage as fallback
  sessionStorage.setItem(key, encryptedData);
  sessionStorage.setItem(`${key}_expirationTime`, expirationTime.toString());
};

const secureGet = async (key: string) => {
  // Initialize tab tracking if not already done
  await initTabTracking();

  try {
    // Try IndexedDB first
    let encryptedData = await getFromDB(GENERAL_STORE, key);
    let expirationTimeStr = await getFromDB(
      GENERAL_STORE,
      `${key}_expirationTime`
    );

    // If not found in IndexedDB, try sessionStorage
    if (!encryptedData) {
      encryptedData = sessionStorage.getItem(key);
    }

    if (!expirationTimeStr) {
      expirationTimeStr = sessionStorage.getItem(`${key}_expirationTime`);
    }

    const expirationTime = parseInt(expirationTimeStr || "0", 10);

    if (new Date().getTime() > expirationTime) {
      await secureClear(key);
      return null;
    }

    const encryptionKey = CONFIG.ENCRYPTION_KEY;

    if (!encryptionKey) {
      console.error("Encryption key is not defined in the config.");
      return null;
    }

    if (encryptedData) {
      const decryptedData = await decryptData(encryptedData, encryptionKey);
      return decryptedData;
    }
  } catch (error) {
    console.error("Error retrieving secure data:", error);
  }

  return null;
};

const secureClear = async (key: string) => {
  try {
    await removeFromDB(GENERAL_STORE, key);
    await removeFromDB(GENERAL_STORE, `${key}_expirationTime`);
  } catch (error) {
    console.error("Error clearing secure data from IndexedDB:", error);
  }

  // Also clear from sessionStorage
  sessionStorage.removeItem(key);
  sessionStorage.removeItem(`${key}_expirationTime`);
};

// Initialize tab tracking (can be called in your app's entry point)
const setupTabTracking = () => {
  if (typeof window !== "undefined") {
    // Only run in browser environment
    initTabTracking();
  }
};

export {
  storeAuthData,
  retrieveAuthData,
  clearAuthData,
  secureClear,
  secureStore,
  secureGet,
  clearAllData,
  setupTabTracking, // Export the init function for manual initialization
};
