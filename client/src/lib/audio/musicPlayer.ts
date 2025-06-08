/**
 * Helper functions for music playback
 */

// Track current audio instance for single playback
let currentAudio: HTMLAudioElement | null = null;

/**
 * Play a music sample with volume control
 * @param musicType The type of music to play
 * @param volume Volume level (0-100)
 * @returns Function to stop playback
 */
export function playMusicSample(musicUrl: string, volume: number = 50): () => void {
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  
  // Create new audio element
  const audio = new Audio(musicUrl);
  currentAudio = audio;
  
  // Set volume (0-1 scale)
  audio.volume = volume / 100;
  
  // Enable looping for continuous playback
  audio.loop = true;
  
  // Play the audio
  audio.play().catch(error => {
    console.error('Error playing music sample:', error);
  });
  
  // Return function to stop playback
  return () => {
    if (audio) {
      audio.pause();
      audio.src = '';
      if (currentAudio === audio) {
        currentAudio = null;
      }
    }
  };
}

/**
 * Get a URL for a music sample
 * @param musicType The type of music
 * @returns URL to the music file
 */
export function getMusicSampleUrl(musicType: string): string {
  // Map of music types to URLs
  const musicUrls: Record<string, string> = {
    'gentle-piano': '/audio/gentle-piano.mp3',
    'nature-sounds': '/audio/nature-sounds.mp3',
    'singing-bowls': '/audio/singing-bowls.mp3',
    '528hz': '/audio/528hz.mp3',
    
    // Fallbacks for missing files - using API
    'rain': '/api/background-music/rain',
    'ocean': '/api/background-music/ocean',
    'forest': '/api/background-music/forest',
    'ambient': '/api/background-music/ambient',
    'deep-relaxation': '/api/background-music/deep-relaxation',
    'healing': '/api/background-music/healing',
    'delta-waves': '/api/background-music/delta-waves',
    'theta-waves': '/api/background-music/theta-waves',
    'alpha-waves': '/api/background-music/alpha-waves',
    '432hz': '/api/background-music/432hz',
    '639hz': '/api/background-music/639hz',
    '741hz': '/api/background-music/741hz',
    '852hz': '/api/background-music/852hz',
    '963hz': '/api/background-music/963hz',
    'binaural-theta': '/api/background-music/binaural-theta',
    'binaural-alpha': '/api/background-music/binaural-alpha',
    'binaural-delta': '/api/background-music/binaural-delta'
  };
  
  // Return URL for the music type, or default to gentle piano
  return musicUrls[musicType] || musicUrls['gentle-piano'];
}