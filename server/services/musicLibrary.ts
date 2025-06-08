/**
 * Music Library Service
 * This service provides a database of background music clips that can be reused and looped
 * instead of regenerating for each request
 */

// Define the music database with URLs that can be publicly accessed
export const musicLibrary = {
  // Nature sounds
  'nature-sounds': 'https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-loop-1231.mp3',
  'rain': 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loopable-ambience-1249.mp3',
  'ocean': 'https://assets.mixkit.co/sfx/preview/mixkit-beach-waves-loop-1200.mp3',
  'forest': 'https://assets.mixkit.co/sfx/preview/mixkit-morning-forest-birds-loop-1252.mp3',
  
  // Instrumental music
  'gentle-piano': 'https://assets.mixkit.co/music/preview/mixkit-serenity-s-call-124.mp3',
  'ambient': 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
  'singing-bowls': 'https://assets.mixkit.co/music/preview/mixkit-meditation-light-383.mp3',
  'deep-relaxation': 'https://assets.mixkit.co/music/preview/mixkit-comforting-piano-beat-548.mp3',
  'healing': 'https://assets.mixkit.co/music/preview/mixkit-tranquil-garden-light-background-225.mp3',
  
  // Brain wave frequencies
  'delta-waves': 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3',
  'theta-waves': 'https://assets.mixkit.co/music/preview/mixkit-cave-water-droplets-background-1240.mp3',
  'alpha-waves': 'https://assets.mixkit.co/music/preview/mixkit-ambient-piano-sleep-loop-1754.mp3',
  
  // Solfeggio frequencies
  '432hz': 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
  '528hz': 'https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-522.mp3',
  '639hz': 'https://assets.mixkit.co/music/preview/mixkit-a-very-happy-christmas-897.mp3',
  '741hz': 'https://assets.mixkit.co/music/preview/mixkit-valley-sunset-127.mp3',
  '852hz': 'https://assets.mixkit.co/music/preview/mixkit-life-is-a-dream-837.mp3',
  '963hz': 'https://assets.mixkit.co/music/preview/mixkit-space-planet-2167.mp3',
  
  // Binaural beats
  'binaural-theta': 'https://assets.mixkit.co/music/preview/mixkit-feeling-happy-5.mp3',
  'binaural-alpha': 'https://assets.mixkit.co/music/preview/mixkit-cool-feel-2882.mp3',
  'binaural-delta': 'https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3',
};

/**
 * Get the URL for a specific background music type
 * @param musicType The type of background music
 * @returns The URL to the music file
 */
export function getMusicUrl(musicType: string): string {
  // Return the URL from our library, or default to gentle piano if not found
  return musicLibrary[musicType as keyof typeof musicLibrary] || musicLibrary['gentle-piano'];
}

/**
 * Check if background music type is available
 * @param musicType The type of background music
 * @returns Boolean indicating if the music type exists
 */
export function isMusicTypeAvailable(musicType: string): boolean {
  return musicType in musicLibrary;
}