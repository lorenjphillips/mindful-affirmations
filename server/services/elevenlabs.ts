import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Use persistent storage for audio files on Replit
const AUDIO_DIR = '/mnt/data/audio';

// Create audio directory if it doesn't exist
if (!fs.existsSync(AUDIO_DIR)) {
  try {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    console.log(`Created persistent audio directory at ${AUDIO_DIR}`);
  } catch (err) {
    console.error(`Error creating persistent directory: ${err.message}`);
    // Fallback to workspace directory if /mnt/data is not available
    const fallbackDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    console.log(`Using fallback directory: ${fallbackDir}`);
  }
}

/**
 * Generate text-to-speech audio using ElevenLabs API
 * @param text Text to convert to speech
 * @param voiceId Voice ID to use
 * @returns Path to the generated audio file
 */
export async function generateSpeech(
  text: string, 
  voiceId: string = 'pNInz6obpgDQGcFmaJgB' // Adam voice by default
): Promise<string> {
  try {
    console.log(`Starting ElevenLabs API request for voice ${voiceId}`);
    
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY not found in environment variables');
      throw new Error('ELEVENLABS_API_KEY not found in environment variables');
    }

    console.log('ElevenLabs API key found, proceeding with request');
    
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    // Voice settings optimized for meditation with the turbo v2 model
    const settings = {
      stability: 0.88,         // Increased for smoother delivery
      similarity_boost: 0.70,  // Better voice consistency
      style: 0.30,            // More expressive style for meditation
      use_speaker_boost: true
    };

    console.log(`Sending request to ElevenLabs with ${text.length} characters of text`);
    
    // Setup API request with longer timeout for higher quality audio generation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120-second timeout
    
    // Setup API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: settings
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error response: ${response.status} ${errorText}`);
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }
    
    console.log('Successfully received audio data from ElevenLabs');

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `meditation_${timestamp}.mp3`;
    const filepath = path.join(AUDIO_DIR, filename);

    // Save the audio file
    const buffer = await response.arrayBuffer();
    await fsPromises.writeFile(filepath, Buffer.from(buffer));

    console.log(`Generated audio saved to ${filepath}`);
    
    // Return the path relative to public directory for client access
    return `/audio/${filename}`;
  } catch (error) {
    console.error('Error generating speech with ElevenLabs:', error);
    throw error;
  }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getVoices() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error("ELEVENLABS_API_KEY not found in environment variables");
      throw new Error('ELEVENLABS_API_KEY not found in environment variables');
    }

    console.log("Fetching available voices from ElevenLabs...");
    const url = 'https://api.elevenlabs.io/v1/voices';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${response.status} ${errorText}`);
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as { voices: any[] };
    console.log(`Successfully retrieved ${data.voices?.length || 0} voices from ElevenLabs`);
    return data.voices;
  } catch (error) {
    console.error('Error fetching ElevenLabs voices:', error);
    throw error;
  }
}

/**
 * List of recommended voice IDs based on their characteristics
 */
export const recommendedVoices = {
  'male-calm': 'pNInz6obpgDQGcFmaJgB', // Adam
  'female-calm': '21m00Tcm4TlvDq8ikWAM', // Rachel
  'male-deep': 'TxGEqnHWrfWFTfGW9XjX', // Josh
  'female-soft': 'EXAVITQu4vr4xnSDxMaL', // Bella
  'child-friendly': 'XB0fDUnXU5powFXDhCwa', // Charlie
  'male-warm': 'ODq5zmih8GrVes37Dizd', // Sam
  'female-warm': 'D38z5RcWu1voky8WS1ja' // Elli
};