// Test Supabase connection
// Run with: node test-supabase.js

import { supabase, assertSupabase } from './src/supabaseClient.js';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  // Test 1: Check if client is created
  console.log('1. Checking client creation:');
  if (supabase) {
    console.log('   ✅ Supabase client created successfully');
    console.log(`   📍 URL: ${supabase.supabaseUrl}`);
  } else {
    console.log('   ❌ Supabase client is null - check environment variables');
    return;
  }
  
  // Test 2: Test basic connection
  console.log('\n2. Testing connection:');
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`   ⚠️  Connection test failed: ${error.message}`);
      if (error.message.includes('does not exist')) {
        console.log('   💡 This is expected if you haven\'t run the schema yet');
      }
    } else {
      console.log('   ✅ Successfully connected to Supabase');
    }
  } catch (err) {
    console.log(`   ❌ Connection error: ${err.message}`);
  }
  
  // Test 3: Check auth
  console.log('\n3. Testing auth state:');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log(`   📝 Current session: ${session ? 'Logged in' : 'Not logged in'}`);
  } catch (err) {
    console.log(`   ❌ Auth check failed: ${err.message}`);
  }
  
  // Test 4: Check DatabaseFactory selection
  console.log('\n4. Testing DatabaseFactory selection:');
  try {
    const { createDatabase } = await import('./src/database/DatabaseFactory.js');
    const db = createDatabase();
    console.log(`   📊 Database type selected: ${db.constructor.name}`);
  } catch (err) {
    console.log(`   ❌ DatabaseFactory error: ${err.message}`);
  }
  
  console.log('\n🎯 Test complete!');
  console.log('\nNext steps:');
  console.log('1. Run the SQL schema in Supabase dashboard');
  console.log('2. Test signup/login in the app');
  console.log('3. Try creating a complaint');
}

testSupabaseConnection().catch(console.error);
