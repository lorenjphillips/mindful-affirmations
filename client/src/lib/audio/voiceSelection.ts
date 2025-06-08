/**
 * Helper functions for voice selection and voice-related functionality
 */

// Cache for available voices
let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Get all available voices from the Web Speech API
 * @returns Array of available voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (cachedVoices.length > 0) return cachedVoices;
  
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported in this browser");
    return [];
  }
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
    return voices;
  }
  
  return [];
}

/**
 * Get voices that match a specific language
 * @param language The language code to match (e.g., 'en', 'en-US')
 * @returns Array of matching voices
 */
export function getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
  const voices = getAvailableVoices();
  return voices.filter(voice => voice.lang.startsWith(language));
}

/**
 * Get English language voices (for meditation, we generally want English voices)
 * @returns Array of English voices
 */
export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return getVoicesByLanguage('en');
}

/**
 * Attempt to determine if a voice is male or female based on name
 * This is a best-effort approach since the Web Speech API doesn't provide gender info
 * @param voice The voice to analyze
 * @returns 'male', 'female', or 'unknown'
 */
export function determineVoiceGender(voice: SpeechSynthesisVoice): 'male' | 'female' | 'unknown' {
  const name = voice.name.toLowerCase();
  
  // Common male name indicators
  const maleIndicators = [
    'male', 'man', 'guy', 'boy', 'daniel', 'david', 'james', 'john', 'robert',
    'michael', 'william', 'richard', 'joseph', 'thomas', 'alex', 'bruce', 'guy',
    'tom', 'tony', 'reed', 'mark'
  ];
  
  // Common female name indicators
  const femaleIndicators = [
    'female', 'woman', 'girl', 'lady', 'alice', 'alison', 'amy', 'anna', 'bella',
    'claire', 'elizabeth', 'emily', 'emma', 'fiona', 'grace', 'hannah', 'helen',
    'jane', 'karen', 'kathy', 'katie', 'lisa', 'mary', 'monica', 'olivia', 'queen',
    'rachel', 'rose', 'samantha', 'sarah', 'sofia', 'stephanie', 'susan', 'tina',
    'tracy', 'victoria', 'vicki', 'zoe', 'kate', 'victoria', 'veena'
  ];
  
  // Check for male indicators
  for (const indicator of maleIndicators) {
    if (name.includes(indicator)) {
      return 'male';
    }
  }
  
  // Check for female indicators
  for (const indicator of femaleIndicators) {
    if (name.includes(indicator)) {
      return 'female';
    }
  }
  
  // Some voice names follow patterns
  if (name.includes('(en-us, guy')) return 'male';
  if (name.includes('(en-us, girl')) return 'female';
  
  return 'unknown';
}

/**
 * Get voices grouped by gender
 * @returns Object with male, female, and unknown voice arrays
 */
export function getVoicesByGender(): { 
  male: SpeechSynthesisVoice[],
  female: SpeechSynthesisVoice[],
  unknown: SpeechSynthesisVoice[] 
} {
  const voices = getEnglishVoices();
  
  return {
    male: voices.filter(voice => determineVoiceGender(voice) === 'male'),
    female: voices.filter(voice => determineVoiceGender(voice) === 'female'),
    unknown: voices.filter(voice => determineVoiceGender(voice) === 'unknown')
  };
}

/**
 * Get the best voice for a given gender preference
 * @param preferredGender The preferred gender ('male', 'female', or undefined)
 * @returns The best matching voice or null if none found
 */
export function getBestVoiceForGender(preferredGender?: 'male' | 'female'): SpeechSynthesisVoice | null {
  if (!preferredGender) return null;
  
  const voicesByGender = getVoicesByGender();
  const voices = voicesByGender[preferredGender];
  
  if (voices.length === 0) {
    console.warn(`No ${preferredGender} voices found, using any available voice`);
    const allVoices = getEnglishVoices();
    return allVoices.length > 0 ? allVoices[0] : null;
  }
  
  return voices[0];
}

/**
 * Test a specific voice by speaking a sample phrase
 * @param voice The voice to test
 * @param text The text to speak (defaults to a standard test phrase)
 * @returns Promise that resolves when speech is complete
 */
export function testVoice(voice: SpeechSynthesisVoice, text: string = "This is a test of the selected voice."): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.rate = 0.9; // Slightly slower for meditation
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get voice selection for a meditation
 * @param preferredVoiceStyle The voice style from the meditation
 * @param exactVoiceURI The exact voiceURI if one was selected
 * @returns The best matching voice or null if none found
 */
export function getVoiceForMeditation(
  preferredVoiceStyle?: string,
  exactVoiceURI?: string
): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  
  // If we have an exact voice URI, use that (most reliable)
  if (exactVoiceURI) {
    const exactVoice = voices.find(v => v.voiceURI === exactVoiceURI);
    if (exactVoice) {
      console.log(`Found exact voice match: ${exactVoice.name}`);
      return exactVoice;
    }
    console.log(`Exact voice URI not found in available voices, falling back to style-based selection`);
  }
  
  // If we have a preferred style, parse it for gender preference
  if (preferredVoiceStyle) {
    const wantsFemaleVoice = !preferredVoiceStyle.includes('male');
    const preferredGender = wantsFemaleVoice ? 'female' : 'male';
    
    // Get the best voice for the preferred gender
    return getBestVoiceForGender(preferredGender);
  }
  
  // If we have no preferences, return the first English voice
  const englishVoices = getEnglishVoices();
  return englishVoices.length > 0 ? englishVoices[0] : null;
}