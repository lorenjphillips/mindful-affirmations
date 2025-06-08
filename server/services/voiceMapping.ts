/**
 * Voice mapping service to ensure correct voice selection
 * Maps user-friendly voice style names to ElevenLabs voice IDs
 */

// Voice ID mapping for different styles
export const voiceIdMapping: Record<string, string> = {
  // Female voices
  'calm-female': 'EXAVITQu4vr4xnSDxMaL', // Charlotte - calm female
  'whisper-female': '21m00Tcm4TlvDq8ikWAM', // Rachel - soft, gentle female  
  'motivational-female': 'yoZ06aMxZJJ28mfd3POQ', // Bella - energetic female
  
  // Male voices
  'calm-male': 'VR6AewLTigWG4xSOukaG', // Sam - calm male
  'whisper-male': 'pNInz6obpgDQGcFmaJgB', // Adam - versatile male
  'motivational-male': 'ErXwobaYiN019PkySvjV', // Antoni - strong male
  
  // Child-friendly voices
  'friendly-wizard': 'ODq5zmih8GrVes37Dizd', // Special character voice
  'fairy-godmother': 'D38z5RcWu1voky8WS1ja', // Magical female voice
  'superhero': 'TxGEqnHWrfWFTfGW9XjX', // Strong superhero voice
  
  // Default fallback
  'default': 'pNInz6obpgDQGcFmaJgB' // Adam - versatile male
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