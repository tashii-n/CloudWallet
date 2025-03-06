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

const storeAuthData = async (
  accessToken: string,
  secretKey: string,
  expiresIn: number
) => {
  const encryptionKey = CONFIG.ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.error("Encryption key is not defined in the config.");
    return null;
  }

  const encryptedAccessToken = await encryptData(accessToken, encryptionKey);
  const encryptedSecretKey = await encryptData(secretKey, encryptionKey);
  const expirationTime = new Date().getTime() + expiresIn * 1000;

  sessionStorage.setItem("accessToken", encryptedAccessToken);
  sessionStorage.setItem("secretKey", encryptedSecretKey);
  sessionStorage.setItem("expirationTime", expirationTime.toString());
};

const retrieveAuthData = async () => {
  const encryptedAccessToken = sessionStorage.getItem("accessToken");
  const encryptedSecretKey = sessionStorage.getItem("secretKey");

  const expirationTime = parseInt(
    sessionStorage.getItem("expirationTime") || "0",
    10
  );

  if (new Date().getTime() > expirationTime) {
    clearAuthData();
    return null; // Token expired
  }

  const encryptionKey = CONFIG.ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.error("Encryption key is not defined in the config.");
    return null; // Handle missing encryption key
  }

  if (encryptedAccessToken && encryptedSecretKey) {
    const decryptedAccessToken = await decryptData(
      encryptedAccessToken,
      encryptionKey
    );
    const decryptedSecretKey = await decryptData(
      encryptedSecretKey,
      encryptionKey
    );

    return { accessToken: decryptedAccessToken, secretKey: decryptedSecretKey };
  }

  return null; // No valid data found
};

const clearAuthData = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("secretKey");
  sessionStorage.removeItem("expirationTime");
};

// GENERAL STORAGE

const secureStore = async (key: string, data: string) => {
  const encryptionKey = CONFIG.ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.error("Encryption key is not defined in the config.");
    return;
  }

  // Encrypt the data
  const encryptedData = await encryptData(data, encryptionKey);
  const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;

  sessionStorage.setItem(key, encryptedData);
  sessionStorage.setItem(`${key}_expirationTime`, expirationTime.toString());
};

const secureGet = async (key: string) => {
  const encryptedData = sessionStorage.getItem(key);
  const expirationTime = parseInt(
    sessionStorage.getItem(`${key}_expirationTime`) || "0",
    10
  );

  if (new Date().getTime() > expirationTime) {
    secureClear(key);
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

  return null;
};

const secureClear = (key: string) => {
  sessionStorage.removeItem(key);
  sessionStorage.removeItem(`${key}_expirationTime`);
};

export {
  storeAuthData,
  retrieveAuthData,
  clearAuthData,
  secureClear,
  secureStore,
  secureGet,
};
