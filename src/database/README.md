# Database Abstraction Layer

This directory now contains a trimmed database abstraction layer targeting a single provider: Supabase. Legacy localStorage/Firebase implementations were removed to simplify logic and avoid divergence from production behavior.

## Architecture

### BaseDatabase
- Abstract base class defining the interface for all database implementations
- Contains all CRUD operations and analytics methods
- Throws errors for unimplemented methods

### Database Implementation
- **SupabaseDatabase**: Uses Supabase for persistence (auth + PostgREST tables)

### DatabaseFactory
- Factory pattern (now Supabase-only) that validates required environment variables and returns a singleton instance.

## Usage

### Basic Usage

```javascript
import { DatabaseFactory } from './database/DatabaseFactory.js';

// Create Supabase database
const supabaseDb = DatabaseFactory.createSupabase({
  supabaseUrl: 'your-url',
  supabaseKey: 'your-key'
});
```

### Environment-Based Configuration

The system requires Supabase environment variables:

```javascript
import { EnvironmentDatabaseFactory } from './database/DatabaseFactory.js';

const db = EnvironmentDatabaseFactory.getDatabase();
```

Required environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (anon/public key)

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

### To Supabase

1. Install Supabase: `npm install @supabase/supabase-js`
2. Set environment variables:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. The application will automatically use Supabase

### Manual Database Selection
Currently not needed—only Supabase is supported. The factory will throw if variables are missing.

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

1. **Lean Surface**: Only the production path exists; fewer divergent code paths.
2. **Consistent Data Shapes**: Central normalization retains camelCase expectations in UI.
3. **Error Transparency**: Initialization errors are surfaced early (no silent fallback).
4. **Performance**: Single client instance, lazy Supabase client import inside implementation.
5. **Extensible**: Base interface remains; future providers can be re-added if required.

## Reintroducing Another Provider (Optional Future)

1. Restore or create implementation extending `BaseDatabase`.
2. Add its type to `DatabaseFactory.DATABASE_TYPES`.
3. Add creation logic in `DatabaseFactory.getDatabase` and environment selection.
4. Add normalization adjustments if schema differs.
