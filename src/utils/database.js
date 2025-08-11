// IndexedDB utility for Kirtan database
import { enhancedSulekhToUnicode, enhancedSulekhToGujlish, gujUnicodeToHindi } from './enhancedConverter';
const DB_NAME = 'KirtanDatabase';
const DB_VERSION = 1;
const STORE_NAME = 'kirtans';

class KirtanDatabase {
  constructor() {
    this.db = null;
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Create indexes for searching
          objectStore.createIndex('sulekhTitle', 'sulekhTitle', { unique: false });
          objectStore.createIndex('unicodeTitle', 'unicodeTitle', { unique: false });
          objectStore.createIndex('englishTitle', 'englishTitle', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  // Add a new kirtan
  async addKirtan(kirtan) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const unicodeContent = enhancedSulekhToUnicode(kirtan.sulekhContent);
      const englishContent = enhancedSulekhToGujlish(kirtan.sulekhContent);
      const hindiContent = gujUnicodeToHindi(unicodeContent);

      const kirtanData = {
        ...kirtan,
        unicodeContent,
        englishContent,
        hindiContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const request = store.add(kirtanData);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to add kirtan'));
      };
    });
  }

  // Update an existing kirtan
  async updateKirtan(id, kirtan) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const unicodeContent = enhancedSulekhToUnicode(kirtan.sulekhContent);
      const englishContent = enhancedSulekhToGujlish(kirtan.sulekhContent);
      const hindiContent = gujUnicodeToHindi(unicodeContent);

      const kirtanData = {
        ...kirtan,
        unicodeContent,
        englishContent,
        hindiContent,
        id,
        updatedAt: new Date().toISOString()
      };
      
      const request = store.put(kirtanData);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to update kirtan'));
      };
    });
  }

  // Delete a kirtan
  async deleteKirtan(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Failed to delete kirtan'));
      };
    });
  }

  // Get a single kirtan by ID
  async getKirtan(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get kirtan'));
      };
    });
  }

  // Get all kirtans
  async getAllKirtans() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to get kirtans'));
      };
    });
  }

  // Search kirtans
  async searchKirtans(query) {
    if (!query || query.trim() === '') {
      return this.getAllKirtans();
    }

    const allKirtans = await this.getAllKirtans();
    const searchTerm = query.toLowerCase();
    
    // Search in all fields
    return allKirtans.filter(kirtan => {
      return (
        (kirtan.sulekhTitle && kirtan.sulekhTitle.toLowerCase().includes(searchTerm)) ||
        (kirtan.unicodeTitle && kirtan.unicodeTitle.toLowerCase().includes(searchTerm)) ||
        (kirtan.englishTitle && kirtan.englishTitle.toLowerCase().includes(searchTerm)) ||
        (kirtan.sulekhContent && kirtan.sulekhContent.toLowerCase().includes(searchTerm)) ||
        (kirtan.unicodeContent && kirtan.unicodeContent.toLowerCase().includes(searchTerm)) ||
        (kirtan.englishContent && kirtan.englishContent.toLowerCase().includes(searchTerm))
      );
    });
  }

  // Export database to JSON
  async exportToJSON() {
    const kirtans = await this.getAllKirtans();
    return JSON.stringify(kirtans, null, 2);
  }

  // Import database from JSON
  async importFromJSON(jsonString) {
    try {
      const kirtans = JSON.parse(jsonString);
      
      if (!Array.isArray(kirtans)) {
        throw new Error('Invalid JSON format');
      }
      
      // Clear existing data
      await this.clearDatabase();
      
      // Add all kirtans
      for (const kirtan of kirtans) {
        // Remove id to let IndexedDB auto-generate new ones
        const { id, ...kirtanData } = kirtan;
        await this.addKirtan(kirtanData);
      }
      
      return kirtans.length;
    } catch (error) {
      throw new Error('Failed to import JSON: ' + error.message);
    }
  }

  // Clear all data
  async clearDatabase() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Failed to clear database'));
      };
    });
  }
}

// Create singleton instance
const kirtanDB = new KirtanDatabase();

export default kirtanDB;