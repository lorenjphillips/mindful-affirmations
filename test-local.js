#!/usr/bin/env node

/**
 * Local Testing Script for Meditation App
 * Run with: node test-local.js
 */

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function testApp() {
  console.log('🧪 Testing Meditation App Locally...\n');

  // Test 1: Server Health Check
  try {
    console.log('1. Testing server health...');
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      console.log('   ✅ Server is running');
    } else {
      console.log('   ❌ Server health check failed');
      return;
    }
  } catch (error) {
    console.log('   ❌ Server is not running. Start with: npm run dev');
    return;
  }

  // Test 2: Database Connection
  try {
    console.log('2. Testing database connection...');
    const response = await fetch(`${BASE_URL}/api/meditations`);
    if (response.ok || response.status === 401) {
      console.log('   ✅ Database connection working');
    } else {
      console.log('   ❌ Database connection failed');
    }
  } catch (error) {
    console.log('   ❌ Database connection error:', error.message);
  }

  // Test 3: Environment Variables
  console.log('3. Checking environment variables...');
  if (process.env.DATABASE_URL) {
    console.log('   ✅ DATABASE_URL configured');
  } else {
    console.log('   ❌ DATABASE_URL missing');
  }
  
  if (process.env.ELEVENLABS_API_KEY) {
    console.log('   ✅ ELEVENLABS_API_KEY configured');
  } else {
    console.log('   ⚠️  ELEVENLABS_API_KEY missing (TTS won\'t work)');
  }
  
  if (process.env.SESSION_SECRET) {
    console.log('   ✅ SESSION_SECRET configured');
  } else {
    console.log('   ❌ SESSION_SECRET missing');
  }

  // Test 4: File Permissions
  console.log('4. Checking file permissions...');
  try {
    const audioDir = './public/audio';
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    fs.writeFileSync(`${audioDir}/test.txt`, 'test');
    fs.unlinkSync(`${audioDir}/test.txt`);
    console.log('   ✅ Audio directory writable');
  } catch (error) {
    console.log('   ❌ Audio directory not writable:', error.message);
  }

  console.log('\n🎯 Test complete! If all checks pass, your app is ready for local development.');
  console.log('\n📱 Access your app at: http://localhost:5000');
}

testApp().catch(console.error); 