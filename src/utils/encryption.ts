import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'mission-visual-secret-key-2026';

export const encryptPassword = (password: string): string => {
  return CryptoJS.PBKDF2(password, ENCRYPTION_KEY, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
};

export const generateHash = (input: string): string => {
  return CryptoJS.SHA256(input).toString();
};

export const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decrypt = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const verifyOTP = (stored: string, provided: string): boolean => {
  return stored === provided;
};
