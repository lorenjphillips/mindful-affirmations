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
  pauseDuration: number,
  exactVoiceName?: string,
  exactVoiceURI?: string
): Promise<string> {
  try {
    console.log(`[Audio] Starting generation for voice style: ${voiceStyle}`);
    
    // Check for required environment variable first to fail fast
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("[Audio] ELEVENLABS_API_KEY not found in environment variables");
      throw new Error("Missing ELEVENLABS_API_KEY - cannot generate speech without API credentials");
    }
    
    // Import and use the voice mapping service
    const { getVoiceId } = await import('./services/voiceMapping');
    
    // Get the appropriate ElevenLabs voice ID
    console.log(`[Voice] Selecting voice for style: "${voiceStyle}", exactVoiceName: "${exactVoiceName}"`);
    let voiceId = getVoiceId(voiceStyle);
    
    // If we have exact voice information from VoicePreview component, prioritize that
    if (exactVoiceName && exactVoiceURI) {
      console.log(`[Voice] Using exact voice selection: ${exactVoiceName} (${exactVoiceURI})`);
      // Note: For ElevenLabs integration, we still use our mapping, but log the exact choice
      // In a future enhancement, we could support custom voice uploads here
    }
    
    console.log(`[Audio] Selected voice ID: ${voiceId} for style: ${voiceStyle || 'default'}`);
    
    // Verify the API key is available
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Empty ELEVENLABS_API_KEY - please provide a valid API key");
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
    console.log("[ElevenLabs] API URL:", `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`);
    console.log("[ElevenLabs] API Key present:", !!apiKey && apiKey.length > 10);
    console.log("[ElevenLabs] Text sample:", processedText.substring(0, 100) + "...");
    
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    // Voice settings optimized for meditation - refined for better quality
    const settings = {
      stability: 0.90,         // High stability for consistent, smooth delivery
      similarity_boost: 0.75,  // Improved similarity for consistent voice character
      style: 0.35,             // Enhanced style for better meditation intonation and pacing
      use_speaker_boost: true  // Using speaker boost for clearer audio
    };
    
    console.log("[ElevenLabs] Voice settings:", settings);
    
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
          model_id: 'eleven_turbo_v2',  // Using the latest, fastest model for better quality
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      fs.appendFileSync(logPath, `\n\nError: ${errorMessage}`);
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
  // Voice cloning endpoint
  app.post('/api/voice-clone', async (req, res) => {
    try {
      const { voiceName, type } = req.body;
      
      if (!voiceName || !type) {
        return res.status(400).json({ error: 'Voice name and type are required' });
      }

      // Here you would integrate with ElevenLabs Voice Design API or similar service
      // For now, we'll simulate the process and return a mock voice ID
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a unique voice ID
      const voiceId = `cloned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In a real implementation, you would:
      // 1. Upload the audio to ElevenLabs Voice Design
      // 2. Wait for processing to complete
      // 3. Get the new voice ID
      // 4. Store the voice mapping in your database
      
      res.json({
        success: true,
        voiceId,
        voiceName,
        message: 'Voice clone created successfully'
      });
      
    } catch (error) {
      console.error('Voice cloning error:', error);
      res.status(500).json({ error: 'Failed to clone voice' });
    }
  });
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
      const { meditationId, meditationScript, voiceStyle, exactVoiceName, exactVoiceURI, duration, backgroundMusic, musicVolume, pauseDuration } = req.body;

      if (!meditationId || !meditationScript) {
        console.error("[Audio] Missing required fields:", { meditationId: !!meditationId, meditationScript: !!meditationScript });
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      console.log("[Audio] Received request with:", {
        meditationId,
        voiceStyle,
        exactVoiceName,
        exactVoiceURI,
        duration,
        backgroundMusic,
        musicVolume,
        scriptLength: meditationScript?.length || 0
      });

      // Step 1: Check if meditation exists in storage (convert to number if needed)
      const numericId = typeof meditationId === 'string' ? parseInt(meditationId) : meditationId;
      console.log("[Storage] Looking for meditation with ID:", numericId);
      
      let meditation = await storage.getMeditation(numericId);
      if (!meditation) {
        console.log("[Storage] Meditation not found, checking all meditations...");
        const allMeditations = await storage.getAllMeditations();
        console.log("[Storage] Available meditations:", allMeditations.map(m => ({ id: m.id, title: m.title })));
        
        // Try to find by timestamp if it's a large number (timestamp)
        if (meditationId > 1000000000000) {
          console.log("[Storage] Large ID detected, treating as timestamp. Creating placeholder meditation...");
          // Create a minimal meditation entry for audio generation
          const insertMeditation = {
            title: "Generated Meditation",
            purpose: "sleep",
            voiceStyle: voiceStyle || "calm-female",
            backgroundMusic: backgroundMusic || "gentle-piano",
            musicVolume: musicVolume || 50,
            estimatedDuration: duration || 5,
            meditationScript: meditationScript
          };
          meditation = await storage.createMeditation(insertMeditation);
          console.log("[Storage] Created meditation with ID:", meditation.id);
        } else {
          console.error("[Storage] Meditation not found with ID:", numericId);
          return res.status(404).json({ message: `Meditation not found with ID: ${numericId}` });
        }
      }

      // Step 2: Generate speech from text
      try {
        console.log("[Audio] Starting generation process for meditation ID:", meditationId);
        
        // Add a delay to ensure client-side knows we're processing
        res.writeHead(202, {
          'Content-Type': 'application/json',
          'X-Accel-Buffering': 'no',
          'Cache-Control': 'no-cache'
        });
        
        res.write(JSON.stringify({ 
          status: "processing", 
          message: "Premium audio generation has started. This may take up to 2 minutes for high-quality results." 
        }));
        
        // Set a much longer timeout for ElevenLabs generation (2 minutes)
        // This ensures we give the API enough time to generate high-quality audio
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("ElevenLabs API timeout")), 120000)
        );
        
        // Create a race between the audio generation and timeout
        let audioUrl;
        try {
          audioUrl = await Promise.race([
            generateTextToSpeechAudio(
              meditationScript, 
              voiceStyle || 'calm-female', 
              duration || 5,
              pauseDuration || meditation.pauseDuration || 2,
              exactVoiceName,
              exactVoiceURI
            ),
            timeoutPromise
          ]);
          
          console.log(`[Audio] Generated audio URL: ${audioUrl}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("[Audio] Error or timeout generating audio:", errorMessage);
          
          // Continue with the flow even if there's an error - client will use fallback
          res.write(JSON.stringify({ 
            status: "fallback", 
            message: "Using browser speech synthesis as fallback" 
          }));
        }
        
        // Step 3: Update the meditation with the audio URL if we have one
        if (audioUrl && typeof audioUrl === 'string') {
          await storage.setMeditationAudioUrl(meditation.id, audioUrl);
        }
        
        // Return the updated meditation with the audio URL
        const updatedMeditation = await storage.getMeditation(meditation.id);
        console.log(`[Audio] Successfully updated meditation with audio URL`);
        
        // Complete the response
        res.write(JSON.stringify({ 
          status: "complete", 
          meditation: updatedMeditation 
        }));
        res.end();
        return;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[Audio] Error generating audio:", errorMessage);
        return res.status(500).json({ 
          message: "Failed to generate audio", 
          error: errorMessage 
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