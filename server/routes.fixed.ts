import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMeditationSchema, affirmationOptions } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";

// Create persistent storage directory for Replit
const AUDIO_DIR = '/mnt/data/audio';
try {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    console.log(`Created persistent audio directory at ${AUDIO_DIR}`);
  }
} catch (err) {
  console.error(`Error creating persistent directory: ${err.message}`);
  // Fallback to workspace directory
  const fallbackDir = path.join(process.cwd(), 'public', 'audio');
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  console.log(`Using fallback directory: ${fallbackDir}`);
}

// Fixed implementation for TTS using ElevenLabs API
async function generateTextToSpeechAudio(
  text: string, 
  voiceStyle: string, 
  duration: number, 
  pauseDuration: number
): Promise<string> {
  try {
    console.log(`[Audio] Starting generation for voice style: ${voiceStyle}`);
    
    // Map voice style to appropriate ElevenLabs voice ID
    let voiceId = 'pNInz6obpgDQGcFmaJgB'; // Default voice (Adam)
    
    // Improved voice mapping based on style keywords
    if (voiceStyle.includes('female')) {
      if (voiceStyle.includes('calm')) {
        voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Charlotte - calm female
      } else if (voiceStyle.includes('whisper')) {
        voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel - soft, gentle female
      } else if (voiceStyle.includes('motivational')) {
        voiceId = 'yoZ06aMxZJJ28mfd3POQ'; // Bella - energetic female
      } else {
        voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default female - Charlotte
      }
    } else {
      // Male voices
      if (voiceStyle.includes('calm')) {
        voiceId = 'VR6AewLTigWG4xSOukaG'; // Sam - calm male
      } else if (voiceStyle.includes('whisper')) {
        voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam - versatile male
      } else if (voiceStyle.includes('motivational')) {
        voiceId = 'ErXwobaYiN019PkySvjV'; // Antoni - strong male
      } else {
        voiceId = 'pNInz6obpgDQGcFmaJgB'; // Default male - Adam
      }
    }
    
    console.log(`[Audio] Selected voice ID: ${voiceId} for style: ${voiceStyle}`);
    
    // Check for required environment variable
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("[Audio] ELEVENLABS_API_KEY not found in environment variables");
      throw new Error("Missing ELEVENLABS_API_KEY - cannot generate speech without API credentials");
    }
    
    // Add appropriate pauses based on the pauseDuration parameter
    const processedText = addPausesToText(text, pauseDuration);
    
    // Generate the speech using ElevenLabs API
    const timestamp = Date.now();
    const outputFilename = `meditation_${timestamp}.mp3`;
    const outputPath = path.join(AUDIO_DIR, outputFilename);
    
    // Log request details
    const logPath = path.join(AUDIO_DIR, `request_${timestamp}.log`);
    fs.writeFileSync(logPath, 
      `Request Time: ${new Date().toISOString()}
      Voice Style: ${voiceStyle}
      Voice ID: ${voiceId}
      Text Length: ${text.length} characters
      
      Sample Text:
      ${text.substring(0, 200)}...
      `
    );
    
    console.log("[Audio] Sending request to ElevenLabs API");
    
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    // Voice settings optimized for meditation
    const settings = {
      stability: 0.85,         // Increased for smoother delivery
      similarity_boost: 0.65,  // Slightly reduced for more natural sound
      style: 0.2,              // Adding some style for better intonation
      use_speaker_boost: true
    };
    
    // Set up API request with longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
    
    try {
      // Make the request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: processedText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: settings
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check if the request was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Audio] ElevenLabs API error: ${response.status} ${errorText}`);
        fs.appendFileSync(logPath, 
          `\n\nAPI Error:
          Status: ${response.status}
          Message: ${errorText}
          `
        );
        throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
      }
      
      // Get the audio data from the response
      const audioBuffer = await response.arrayBuffer();
      console.log(`[Audio] Received ${audioBuffer.byteLength} bytes from ElevenLabs API`);
      
      // Write the audio file
      fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
      
      // Verify the file was written
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`[Audio] Successfully wrote file ${outputPath} (${stats.size} bytes)`);
        fs.appendFileSync(logPath, 
          `\n\nFile Written:
          Path: ${outputPath}
          Size: ${stats.size} bytes
          `
        );
      } else {
        console.error(`[Audio] File was not created: ${outputPath}`);
        fs.appendFileSync(logPath, `\n\nERROR: File was not created after write operation`);
        throw new Error("Failed to create audio file");
      }
      
      // Return the relative URL path for the client
      return `/api/audio/${outputFilename}`;
      
    } catch (error) {
      console.error('[Audio] Error in API request:', error);
      fs.appendFileSync(logPath, `\n\nError: ${error.message}`);
      throw error;
    }
  } catch (error) {
    console.error('Error generating text-to-speech audio:', error);
    throw error;
  }
}

// Helper function to add pauses to text for better meditation pacing
function addPausesToText(text: string, pauseDuration: number): string {
  // Convert pause duration to pause markers for ElevenLabs
  // ElevenLabs uses <break time="Xs"/> for pauses
  const pauseMarker = `<break time="${pauseDuration}s"/>`;
  
  // Split text by periods and insert pauses
  return text
    .split('.')
    .filter(sentence => sentence.trim().length > 0)
    .map(sentence => sentence.trim() + '.' + pauseMarker)
    .join(' ');
}

// Simplified audio mixing function for predictable results
function getMixedAudioUrl(speechUrl: string, backgroundMusic: string): string {
  // In a production system, this would use ffmpeg to mix the audio
  // For now, we'll just return the speech URL since we don't need actual mixing for testing
  console.log(`[Audio] Using background music: ${backgroundMusic}`);
  return speechUrl;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from both persistent and workspace directories
  app.use('/api/audio', (req, res, next) => {
    const filename = req.path.split('/').pop();
    
    // First, try to serve from persistent storage
    const persistentPath = path.join(AUDIO_DIR, filename);
    if (fs.existsSync(persistentPath)) {
      console.log(`[Audio] Serving file from persistent storage: ${persistentPath}`);
      return res.sendFile(persistentPath);
    }
    
    // Fallback to workspace directory
    const workspacePath = path.join(process.cwd(), 'public', 'audio', filename);
    if (fs.existsSync(workspacePath)) {
      console.log(`[Audio] Serving file from workspace: ${workspacePath}`);
      return res.sendFile(workspacePath);
    }
    
    // If file doesn't exist, log it and continue to next middleware
    console.log(`[Audio] File not found: ${filename}`);
    next();
  });
  
  // Also serve files from the regular static directory as fallback
  app.use('/api/audio', express.static(path.join(process.cwd(), 'public', 'audio')));
  
  // Get all meditations endpoint
  app.get("/api/meditations", async (req, res) => {
    try {
      const meditations = await storage.getAllMeditations();
      res.json(meditations);
    } catch (error) {
      console.error("Error fetching meditations:", error);
      res.status(500).json({ message: "Error fetching meditations" });
    }
  });
  
  // Create new meditation endpoint
  app.post("/api/meditations", async (req, res) => {
    try {
      const validatedData = insertMeditationSchema.parse(req.body);
      const meditation = await storage.createMeditation(validatedData);
      res.status(201).json(meditation);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating meditation" });
    }
  });
  
  // Generate meditation audio endpoint (improved for reliability)
  app.post("/api/meditations/generate-audio", async (req, res) => {
    try {
      const { meditationId, meditationScript, voiceStyle, duration, backgroundMusic, musicVolume } = req.body;

      if (!meditationId || !meditationScript) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Step 1: Get the meditation from storage
      const meditation = await storage.getMeditation(parseInt(meditationId));
      if (!meditation) {
        return res.status(404).json({ message: "Meditation not found" });
      }

      // Step 2: Generate speech from text
      try {
        console.log("[Audio] Starting generation process for meditation ID:", meditationId);
        
        // Convert the text to speech with appropriate pauses
        const audioUrl = await generateTextToSpeechAudio(
          meditationScript, 
          voiceStyle || 'calm-female', 
          duration || 5,
          2 // Standard pause duration
        );
        
        console.log(`[Audio] Generated audio URL: ${audioUrl}`);
        
        // Step 3: Update the meditation with the audio URL
        await storage.setMeditationAudioUrl(meditation.id, audioUrl);
        
        // Return the updated meditation with the audio URL
        const updatedMeditation = await storage.getMeditation(meditation.id);
        console.log(`[Audio] Successfully updated meditation with audio URL`);
        
        return res.json(updatedMeditation);
        
      } catch (error) {
        console.error("[Audio] Error generating audio:", error);
        return res.status(500).json({ 
          message: "Failed to generate audio", 
          error: error.message 
        });
      }
    } catch (error) {
      console.error("Error processing audio generation request:", error);
      res.status(500).json({ message: "Server error generating audio" });
    }
  });
  
  // Create a server instance
  const server = createServer(app);
  
  // Return the server instance so it can be used elsewhere
  return server;
}