// Browser-based Supabase connection test
// Add this as a temporary page in your React app to test Supabase

import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient.js';

const SupabaseTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const addResult = (test, status, message) => {
    setResults(prev => [...prev, { test, status, message }]);
  };

  useEffect(() => {
    const runTests = async () => {
      setResults([]);
      
      // Test 1: Check client creation
      if (supabase) {
        addResult('Client Creation', 'success', `✅ Supabase client created (${supabase.supabaseUrl})`);
      } else {
        addResult('Client Creation', 'error', '❌ Supabase client is null - check .env variables');
        setLoading(false);
        return;
      }

      // Test 2: Test connection to tables
      try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) {
          if (error.message.includes('does not exist')) {
            addResult('Database Connection', 'warning', '⚠️ Connected but tables don\'t exist yet. Run the schema!');
          } else {
            addResult('Database Connection', 'error', `❌ ${error.message}`);
          }
        } else {
          addResult('Database Connection', 'success', '✅ Successfully connected to database');
        }
      } catch (err) {
        addResult('Database Connection', 'error', `❌ ${err.message}`);
      }

      // Test 3: Auth state
      try {
        const { data: { session } } = await supabase.auth.getSession();
        addResult('Auth State', 'info', `📝 Session: ${session ? 'Logged in' : 'Not logged in'}`);
      } catch (err) {
        addResult('Auth State', 'error', `❌ ${err.message}`);
      }

      // Test 4: Environment variables
      const hasUrl = Boolean(import.meta.env.VITE_SUPABASE_URL);
      const hasKey = Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY);
      addResult('Environment', 'info', `📊 URL: ${hasUrl ? '✅' : '❌'}, Key: ${hasKey ? '✅' : '❌'}`);

      setLoading(false);
    };

    runTests();
  }, []);

  const testSignup = async () => {
    const email = 'test@example.com';
    const password = 'testpass123';
    
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        addResult('Test Signup', 'error', `❌ ${error.message}`);
      } else {
        addResult('Test Signup', 'success', `✅ Signup successful! Check ${email} for confirmation.`);
      }
    } catch (err) {
      addResult('Test Signup', 'error', `❌ ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Supabase Connection Test</h1>
      
      {loading && <p>Running tests...</p>}
      
      <div style={{ marginBottom: '20px' }}>
        {results.map((result, index) => (
          <div 
            key={index}
            style={{ 
              padding: '8px',
              margin: '4px 0',
              backgroundColor: '#f5f5f5',
              borderLeft: `4px solid ${getStatusColor(result.status)}`
            }}
          >
            <strong>{result.test}:</strong> {result.message}
          </div>
        ))}
      </div>

      {!loading && (
        <div>
          <button onClick={testSignup} style={{ padding: '8px 16px', marginRight: '8px' }}>
            Test Signup
          </button>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px' }}>
            Rerun Tests
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#e5f3ff' }}>
        <h3>Next Steps:</h3>
        <ol>
          <li>If tables don't exist: Run the SQL in <code>supabase-schema.sql</code> in your Supabase dashboard</li>
          <li>Test signup/login through your app's normal UI</li>
          <li>Try creating a complaint to test CRUD operations</li>
          <li>Check RLS policies are working correctly</li>
        </ol>
      </div>
    </div>
  );
};

export default SupabaseTest;
