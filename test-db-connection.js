#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Run with: node test-db-connection.js
 */

import { neon } from '@neondatabase/serverless';
import fs from 'fs';

// Load environment variables from .env file
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
} catch (error) {
  console.log('⚠️  Could not load .env file');
}

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in environment variables');
    console.log('Make sure your .env file contains the correct DATABASE_URL');
    return;
  }

  console.log('📍 Database URL:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@'));

  try {
    console.log('🔗 Attempting to connect to database...');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test basic query
    const result = await sql`SELECT version() as version, now() as current_time`;
    
    console.log('✅ Database connection successful!');
    console.log('📋 Database version:', result[0].version);
    console.log('🕐 Current time:', result[0].current_time);
    
    // Test if we can list tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📊 Tables in database:', tables.length);
    if (tables.length > 0) {
      console.log('   Tables:', tables.map(t => t.table_name).join(', '));
    } else {
      console.log('   No tables found - this is normal for a new database');
    }
    
    console.log('\n🎉 Database connection test passed!');
    console.log('💡 You can now run: npm run db:push');
    
  } catch (error) {
    console.log('❌ Database connection failed!');
    console.log('Error details:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 SOLUTION: The database hostname cannot be resolved.');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Find your project → Settings → Database');
      console.log('3. Copy the "Connection string" (Direct connection)');
      console.log('4. Update your .env file with the new DATABASE_URL');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 SOLUTION: Password authentication failed.');
      console.log('1. Check your database password in Supabase Settings');
      console.log('2. Update the password in your DATABASE_URL');
    } else {
      console.log('\n🔧 SOLUTION: Check your DATABASE_URL format:');
      console.log('Should be: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres');
    }
  }
}

testDatabaseConnection().catch(console.error); 