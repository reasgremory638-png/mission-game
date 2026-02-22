const STORAGE_PREFIX = 'mission_visual_';

export const storageKeys = {
  users: `${STORAGE_PREFIX}users`,
  currentUser: `${STORAGE_PREFIX}current_user`,
  challenges: `${STORAGE_PREFIX}challenges`,
  settings: `${STORAGE_PREFIX}settings`,
  notifications: `${STORAGE_PREFIX}notifications`,
  otpSessions: `${STORAGE_PREFIX}otp_sessions`,
};

export const setItem = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to set item in localStorage:', error);
  }
};

export const getItem = <T = unknown>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to get item from localStorage:', error);
    return null;
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove item from localStorage:', error);
  }
};

export const clearAllData = (): void => {
  try {
    Object.values(storageKeys).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};
