// Key used for storing session data in local storage
const STORAGE_KEY = 'quadrathlon_session';

/**
 * Service for handling data persistence using browser's local storage
 */
class StorageService {
  /**
   * Save session data to local storage
   * @param {Object} sessionData - Current application state
   */
  saveSession(sessionData) {
    try {
      const serializedData = JSON.stringify(sessionData);
      localStorage.setItem(STORAGE_KEY, serializedData);
      return true;
    } catch (error) {
      console.error('Error saving session data:', error);
      return false;
    }
  }
  
  /**
   * Load session data from local storage
   * @returns {Object|null} The session data or null if none exists
   */
  loadSession() {
    try {
      const serializedData = localStorage.getItem(STORAGE_KEY);
      if (!serializedData) return null;
      
      const sessionData = JSON.parse(serializedData);
      return sessionData;
    } catch (error) {
      console.error('Error loading session data:', error);
      return null;
    }
  }
  
  /**
   * Clear session data from local storage
   */
  clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing session data:', error);
      return false;
    }
  }
  
  /**
   * Check if session data exists in local storage
   * @returns {boolean} True if session data exists
   */
  isSessionAvailable() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
}

// Create a singleton instance
const storageService = new StorageService();

export default storageService;
