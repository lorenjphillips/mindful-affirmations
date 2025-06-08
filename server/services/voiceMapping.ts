/**
 * Voice mapping service to ensure correct voice selection
 * Maps user-friendly voice style names to ElevenLabs voice IDs
 */

// Voice ID mapping for different styles (Updated with actual ElevenLabs voices)
export const voiceIdMapping: Record<string, string> = {
  // Female voices
  'calm-female': 'EXAVITQu4vr4xnSDxMaL', // Sarah - calm female (verified)
  'whisper-female': 'XB0fDUnXU5powFXDhCwa', // Charlotte - soft, gentle female  
  'motivational-female': '9BWtsMINqrJLrRacOk9x', // Aria - energetic female
  
  // Male voices
  'calm-male': 'JBFqnCBsd6RMkjVDRZzb', // George - calm male
  'whisper-male': 'TX3LPaxmHKxFdv7VOQHJ', // Liam - soft male
  'motivational-male': 'nPczCjzI2devNBz1zQrb', // Brian - strong male
  
  // Child-friendly voices
  'friendly-wizard': 'iP95p4xoKVk53GoZ742B', // Chris - friendly character voice
  'fairy-godmother': 'pFZP5JQG7iQjIQuC4Bku', // Lily - magical female voice
  'superhero': 'onwK4e9ZLuTAKqWW03F9', // Daniel - strong superhero voice
  
  // Additional options
  'neutral': 'SAz9YHcvj6GT2YYXdXww', // River - neutral voice
  'young-female': 'Xb7hH8MSUJpSbSDYk0k2', // Alice - younger female
  'mature-female': 'cgSgspJ2msm6clMCkdW9', // Jessica - mature female
  'mature-male': 'bIHbv24MWmeRgasZH58o', // Will - mature male
  
  // Default fallback
  'default': 'JBFqnCBsd6RMkjVDRZzb' // George - calm male
};

/**
 * Get the appropriate voice ID based on the style name
 * @param voiceStyle The human-readable voice style (e.g., 'calm-female')
 * @returns The ElevenLabs voice ID
 */
export function getVoiceId(voiceStyle: string): string {
  // If we have an exact match, use it
  if (voiceStyle in voiceIdMapping) {
    return voiceIdMapping[voiceStyle];
  }
  
  // Otherwise, try to find a partial match
  if (voiceStyle.includes('female')) {
    if (voiceStyle.includes('calm')) {
      return voiceIdMapping['calm-female'];
    } else if (voiceStyle.includes('whisper')) {
      return voiceIdMapping['whisper-female'];
    } else if (voiceStyle.includes('motivational')) {
      return voiceIdMapping['motivational-female'];
    }
    // Default female voice
    return voiceIdMapping['calm-female'];
  } 
  
  if (voiceStyle.includes('male')) {
    if (voiceStyle.includes('calm')) {
      return voiceIdMapping['calm-male'];
    } else if (voiceStyle.includes('whisper')) {
      return voiceIdMapping['whisper-male'];
    } else if (voiceStyle.includes('motivational')) {
      return voiceIdMapping['motivational-male'];
    }
    // Default male voice
    return voiceIdMapping['calm-male'];
  }
  
  // If all else fails, return the default voice
  return voiceIdMapping['default'];
}