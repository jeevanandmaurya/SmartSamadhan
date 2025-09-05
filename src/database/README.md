# Database Abstraction Layer

This directory contains a modular database abstraction layer that allows easy migration between different database providers (localStorage, Firebase, Supabase) without changing application code.

## Architecture

### BaseDatabase
- Abstract base class defining the interface for all database implementations
- Contains all CRUD operations and analytics methods
- Throws errors for unimplemented methods

### Database Implementations
- **LocalStorageDatabase**: Uses browser localStorage for data persistence
- **FirebaseDatabase**: Uses Firebase Firestore for cloud database
- **SupabaseDatabase**: Uses Supabase for cloud database

### DatabaseFactory
- Factory pattern for creating database instances
- Supports environment-based automatic configuration
- Caches instances to prevent multiple initializations

## Usage

### Basic Usage

```javascript
import { DatabaseFactory } from './database/DatabaseFactory.js';

// Create localStorage database
const db = DatabaseFactory.createLocalStorage();

// Create Firebase database
const firebaseDb = DatabaseFactory.createFirebase({
  firebaseConfig: { /* your config */ }
});

// Create Supabase database
const supabaseDb = DatabaseFactory.createSupabase({
  supabaseUrl: 'your-url',
  supabaseKey: 'your-key'
});
```

### Environment-Based Configuration

The system automatically selects the database based on environment variables:

```javascript
import { EnvironmentDatabaseFactory } from './database/DatabaseFactory.js';

const db = EnvironmentDatabaseFactory.getDatabase();
```

Environment variables:
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` → Supabase
- `VITE_FIREBASE_CONFIG` (JSON string) → Firebase
- Default → localStorage

### Database Context Integration

The DatabaseContext automatically uses the abstraction layer:

```javascript
import { useDatabase } from './DatabaseContext.jsx';

function MyComponent() {
  const { getAllComplaints, databaseType } = useDatabase();

  // Use database functions normally
  const complaints = await getAllComplaints();

  return (
    <div>
      <p>Using: {databaseType}</p>
      {/* render complaints */}
    </div>
  );
}
```

## Migration Guide

### To Firebase

1. Install Firebase: `npm install firebase`
2. Set environment variable:
   ```env
   VITE_FIREBASE_CONFIG={"apiKey":"...","projectId":"..."}
   ```
3. The application will automatically use Firebase

### To Supabase

1. Install Supabase: `npm install @supabase/supabase-js`
2. Set environment variables:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. The application will automatically use Supabase

### Manual Database Selection

```javascript
import { DatabaseFactory } from './database/DatabaseFactory.js';

// Force specific database
const db = DatabaseFactory.getDatabase('firebase', {
  firebaseConfig: { /* config */ }
});
```

## Database Methods

All database implementations support these methods:

### User Operations
- `getUser(username)`
- `getUserById(userId)`
- `getAllUsers()`
- `addUser(userData)`
- `updateUser(userId, changes)`
- `deleteUser(userId)`

### Admin Operations
- `getAdmin(username)`
- `getAllAdmins()`
- `getAdminsByLevel(level)`
- `addAdmin(adminData)`
- `updateAdmin(adminId, changes)`
- `deleteAdmin(adminId)`

### Complaint Operations
- `getAllComplaints()`
- `getComplaintById(complaintId)`
- `getComplaintByRegNumber(regNumber)`
- `getUserComplaints(userId)`
- `addComplaint(userId, complaintData)`
- `updateComplaint(complaintId, changes)`
- `updateComplaintStatus(complaintId, newStatus, note)`
- `deleteComplaint(complaintId)`

### Analytics Operations
- `getComplaintStats(filters)`
- `getDepartmentStats()`
- `getPriorityStats()`

### Utility Operations
- `initialize()`
- `clearAll()`
- `exportData()`
- `importData(jsonData)`

## Benefits

1. **Easy Migration**: Switch databases without code changes
2. **Environment-Based**: Automatic configuration based on environment
3. **Backward Compatible**: Existing code continues to work
4. **Type Safety**: Consistent interface across all implementations
5. **Error Handling**: Comprehensive error handling and fallbacks
6. **Performance**: Lazy loading and caching of database instances
7. **Extensible**: Easy to add new database providers

## Adding New Database Providers

1. Create a new class extending `BaseDatabase`
2. Implement all required methods
3. Add to `DatabaseFactory.DATABASE_TYPES`
4. Update factory creation logic

```javascript
export class MyCustomDatabase extends BaseDatabase {
  // Implement all methods from BaseDatabase
}
