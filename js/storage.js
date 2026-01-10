// storage.js - localStorage wrapper for persistence

const STORAGE_KEY = 'howMuchDidItCostMe';

/**
 * Save user data to localStorage
 * @param {object} data - Data to save
 */
function saveUserData(data) {
  try {
    const existing = loadUserData() || {};
    const merged = { ...existing, ...data, lastVisit: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

/**
 * Load user data from localStorage
 * @returns {object|null} Saved data or null if none exists
 */
function loadUserData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('Could not load from localStorage:', e);
    return null;
  }
}

/**
 * Clear all saved user data
 */
function clearUserData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
