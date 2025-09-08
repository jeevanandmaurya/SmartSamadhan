import { SupabaseDatabase } from './SupabaseDatabase.js'
import { supabase as existingSupabase } from '../supabaseClient.js';

/**
 * Database Factory
 * Creates and manages localStorage database instances
 */
export class DatabaseFactory {
  static DATABASE_TYPES = {
  SUPABASE: 'supabase'
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
      case this.DATABASE_TYPES.SUPABASE: {
        // ALWAYS reuse existing shared client if present to prevent multiple GoTrueClient instances.
        if (existingSupabase) {
          database = new SupabaseDatabase({
            supabaseUrl: config.supabaseUrl || 'injected',
            supabaseKey: config.supabaseKey || 'injected',
            client: existingSupabase
          });
        } else {
          if (!config.supabaseUrl || !config.supabaseKey) {
            throw new Error('Supabase configuration requires supabaseUrl and supabaseKey');
          }
          database = new SupabaseDatabase({
            supabaseUrl: config.supabaseUrl,
            supabaseKey: config.supabaseKey
          });
        }
        break;
      }
      default: {
        throw new Error(`Unsupported database type: ${type}. Supported types: SUPABASE`);
      }
    }

    this.instances.set(key, database);
    return database;
  }

  /**
   * Create a localStorage database instance
   * @param {object} config - Configuration options
   * @returns {LocalStorageDatabase}
   */
  /**
   * Create a Supabase database instance
   * @param {object} config - { supabaseUrl, supabaseKey }
   * @returns {SupabaseDatabase}
   */
  static createSupabase(config = {}) {
    return this.getDatabase(this.DATABASE_TYPES.SUPABASE, config);
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
    return [this.DATABASE_TYPES.SUPABASE];
  }
}

/**
 * Environment-based database configuration
 * Always uses localStorage for simplicity
 */
export class EnvironmentDatabaseFactory {
  static getDatabase() {
    const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL;
    const supabaseKey = import.meta?.env?.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    if (!supabaseUrl || !supabaseKey) {
      if (existingSupabase) {
        // Reuse already-created client (supabaseClient.js succeeded)
        return new SupabaseDatabase({ supabaseUrl: 'injected', supabaseKey: 'injected', client: existingSupabase });
      }
      return null; // signal missing config and no injected client
    }
    return DatabaseFactory.createSupabase({ supabaseUrl, supabaseKey });
  }

  static getDatabaseType() {
  return DatabaseFactory.DATABASE_TYPES.SUPABASE;
  }
}
