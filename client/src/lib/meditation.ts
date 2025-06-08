import { Howl } from "howler";

// Format seconds to MM:SS
export function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Generate speech using the Web Speech API
 * @returns A Promise that resolves when speech is complete or rejects on error
 */
export function generateSpeech(text: string, voiceStyle: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      reject(new Error('Your browser does not support speech synthesis'));
      return;
    }
    
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech parameters
    // Find a voice that matches the requested style (male/female)
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices);
    
    if (voices.length > 0) {
      // Find a voice matching the style (default to first available)
      let selectedVoice;
      
      if (voiceStyle.includes('female')) {
        // Try to find a female voice
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.toLowerCase().includes('woman') ||
          (!voice.name.toLowerCase().includes('male') && !voice.name.toLowerCase().includes('man'))
        );
      } else if (voiceStyle.includes('child')) {
        // Try to find a child-like voice
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('child') || 
          voice.name.toLowerCase().includes('kid')
        );
      } else {
        // Try to find a male voice
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('male') || 
          voice.name.toLowerCase().includes('man')
        );
      }
      
      // If we found a matching voice, use it
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    // Set speech rate and pitch
    utterance.rate = 0.9; // Slightly slower for meditation
    utterance.pitch = 1.0;
    
    // Set event handlers
    utterance.onend = () => {
      console.log('Speech generation complete');
      resolve();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech generation error:', event);
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };
    
    // Start speech
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Helper to create audio from text using Web Speech API
 */
export async function createAudioFromText(
  text: string,
  voiceStyle: string,
  pauseDuration: number
): Promise<ArrayBuffer> {
  try {
    console.log(`Creating audio with voice ${voiceStyle} for text: ${text}`);
    console.log(`Using pause duration of ${pauseDuration} seconds`);
    
    // In a real production app, we'd record the audio output
    // For this demo, we'll use the Web Speech API to speak out loud
    await generateSpeech(text, voiceStyle);
    
    // Since we can't easily record the speech output, we'll just return a mock buffer
    return new ArrayBuffer(0);
  } catch (error) {
    console.error('Error creating audio from text:', error);
    return new ArrayBuffer(0);
  }
}

/**
 * Helper to mix speech with background music
 * In a real production app, we'd use Web Audio API for proper mixing
 * For the demo, we'll simulate it
 */
export function mixAudioWithBackground(
  speechBuffer: ArrayBuffer,
  backgroundMusic: string,
  musicVolume: number,
  fadeOut: boolean = false,
  duration: number = 10,
  isNap: boolean = false,
  wakeFadeIn: boolean = false
): Promise<Blob> {
  console.log(`Mixing speech with ${backgroundMusic} at volume ${musicVolume}%`);
  console.log(`Additional parameters: fadeOut=${fadeOut}, duration=${duration}, isNap=${isNap}, wakeFadeIn=${wakeFadeIn}`);
  
  // In production, we'd actually mix the audio here
  // For the demo, we'll just return a mock blob
  return Promise.resolve(new Blob([]));
}

/**
 * Play a meditation with Howler
 */
export function playMeditation(audioUrl: string, volume: number = 100, loop: boolean = false): Howl {
  console.log(`Playing meditation audio from: ${audioUrl}`);
  console.log(`Volume: ${volume}%, Loop: ${loop}`);
  
  const sound = new Howl({
    src: [audioUrl],
    volume: volume / 100,
    loop: loop,
    html5: true
  });
  
  sound.play();
  return sound;
}

/**
 * Generate a title based on purpose and affirmations
 */
export function generateTitle(purpose: string, affirmations: string): string {
  const purposeTitles: Record<string, string> = {
    sleep: "Sleep Affirmation",
    morning: "Morning Boost",
    focus: "Focus & Clarity",
    confidence: "Confidence Builder",
    stress: "Stress Relief",
    meeting: "Meeting Preparation",
    anxiety: "Anxiety Relief",
    gratitude: "Gratitude Practice",
    healing: "Healing Journey",
    creativity: "Creative Flow",
    relaxation: "Deep Relaxation",
    children: "Kid's Mindfulness"
  };
  
  const baseTitle = purposeTitles[purpose] || "Custom Affirmation";
  
  // Try to extract a theme from the first affirmation
  const firstAffirmation = affirmations.split('\n')[0] || '';
  if (firstAffirmation.length > 0) {
    // Extract keywords
    const keywords = ['peace', 'calm', 'strength', 'power', 'love', 'joy', 'abundance', 'success', 'health'];
    const foundKeyword = keywords.find(keyword => firstAffirmation.toLowerCase().includes(keyword));
    
    if (foundKeyword) {
      return `${baseTitle}: ${foundKeyword.charAt(0).toUpperCase() + foundKeyword.slice(1)}`;
    }
  }
  
  return baseTitle;
}
