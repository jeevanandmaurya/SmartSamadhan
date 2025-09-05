import { LocalStorageDatabase } from './LocalStorageDatabase.js';

/**
 * Database Factory
 * Creates and manages localStorage database instances
 */
export class DatabaseFactory {
  static DATABASE_TYPES = {
    LOCAL_STORAGE: 'localStorage'
  };

  static instances = new Map();

  /**
   * Get or create a database instance
   * @param {string} type - Database type (only localStorage supported)
   * @param {object} config - Database configuration
   * @returns {LocalStorageDatabase} Database instance
   */
  static getDatabase(type = this.DATABASE_TYPES.LOCAL_STORAGE, config = {}) {
    const key = `${type}-${JSON.stringify(config)}`;

    if (this.instances.has(key)) {
      return this.instances.get(key);
    }

    let database;

    switch (type) {
      case this.DATABASE_TYPES.LOCAL_STORAGE:
        database = new LocalStorageDatabase(config);
        break;

      default:
        throw new Error(`Unsupported database type: ${type}. Only localStorage is supported.`);
    }

    this.instances.set(key, database);
    return database;
  }

  /**
   * Create a localStorage database instance
   * @param {object} config - Configuration options
   * @returns {LocalStorageDatabase}
   */
  static createLocalStorage(config = {}) {
    return this.getDatabase(this.DATABASE_TYPES.LOCAL_STORAGE, config);
  }

  /**
   * Clear all cached instances
   */
  static clearInstances() {
    this.instances.clear();
  }

  /**
   * Get all available database types
   * @returns {string[]}
   */
  static getAvailableTypes() {
    return Object.values(this.DATABASE_TYPES);
  }
}

/**
 * Environment-based database configuration
 * Always uses localStorage for simplicity
 */
export class EnvironmentDatabaseFactory {
  static getDatabase() {
    return DatabaseFactory.createLocalStorage();
  }

  static getDatabaseType() {
    return DatabaseFactory.DATABASE_TYPES.LOCAL_STORAGE;
  }
}
