// Crypto utilities for secure API key storage
// Uses Web Crypto API for client-side encryption

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

export interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
}

/**
 * Derive a key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(data: string, password: string): Promise<EncryptedData> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const key = await deriveKey(password, salt);
  const encodedData = new TextEncoder().encode(data);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    encodedData
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt))
  };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(encryptedData: EncryptedData, password: string): Promise<string> {
  try {
    const salt = new Uint8Array(atob(encryptedData.salt).split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(encryptedData.iv).split('').map(c => c.charCodeAt(0)));
    const encrypted = new Uint8Array(atob(encryptedData.encrypted).split('').map(c => c.charCodeAt(0)));
    
    const key = await deriveKey(password, iv);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt data. Check your password.');
  }
}

/**
 * Generate a secure random string for API key IDs
 */
export function generateSecureId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
