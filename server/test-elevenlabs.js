import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/**
 * Simple test script to verify ElevenLabs API is working
 * Run with: node server/test-elevenlabs.js
 */
async function testElevenLabsAPI() {
  try {
    console.log('Starting ElevenLabs API test...');
    
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('❌ ERROR: ELEVENLABS_API_KEY not found in environment variables');
      console.error('Please make sure the API key is properly set up');
      return;
    }

    console.log('✅ API key found in environment variables');
    
    // Create output directory
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
      console.log(`✅ Created audio directory: ${audioDir}`);
    } else {
      console.log(`✅ Audio directory exists: ${audioDir}`);
    }
    
    // Sample text for testing
    const testText = "This is a test of the ElevenLabs text to speech API for our meditation app.";
    
    // ElevenLabs voice ID for Charlotte (calm female)
    const voiceId = 'EXAVITQu4vr4xnSDxMaL';
    
    // API URL
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    // Voice settings for meditation
    const settings = {
      stability: 0.8,
      similarity_boost: 0.7,
      style: 0.0,
      use_speaker_boost: true
    };
    
    console.log(`Sending request to ElevenLabs API for voice ${voiceId}...`);
    
    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: testText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: settings
      })
    });
    
    // Check for errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ElevenLabs API error: ${response.status}`);
      console.error(errorText);
      return;
    }
    
    console.log('✅ ElevenLabs API request successful');
    
    // Save the audio file
    const timestamp = Date.now();
    const outputPath = path.join(audioDir, `test_${timestamp}.mp3`);
    
    // Get the audio data as a buffer
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    
    console.log(`✅ Audio file saved to: ${outputPath}`);
    console.log(`Audio file size: ${Buffer.from(buffer).length} bytes`);
    
    // Check if the file exists
    if (fs.existsSync(outputPath)) {
      console.log(`✅ Verified file exists: ${outputPath}`);
      const stats = fs.statSync(outputPath);
      console.log(`File size: ${stats.size} bytes`);
    } else {
      console.error(`❌ ERROR: File was not saved successfully: ${outputPath}`);
    }
    
    console.log('Test completed successfully ✨');
    
  } catch (error) {
    console.error('❌ Error testing ElevenLabs API:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testElevenLabsAPI();