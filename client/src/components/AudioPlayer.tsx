import { useState, useEffect, useRef } from 'react';
import { Meditation } from '@shared/schema';
import { cn } from '@/lib/utils';

// Function to add intelligent pauses for breathing and meditation instructions
function addIntelligentPauses(script: string): string {
  if (!script) return script;
  
  // Define pause patterns with their corresponding pause durations
  const pausePatterns = [
    // Breathing instructions with explicit counting
    { pattern: /(breathe in|inhale)/gi, replacement: '$1 for four counts... one... two... three... four...' },
    { pattern: /(breathe out|exhale)/gi, replacement: '$1 for six counts... one... two... three... four... five... six...' },
    { pattern: /(hold your breath|hold the breath)/gi, replacement: '$1 for four counts... one... two... three... four... now' },
    { pattern: /(take a deep breath)/gi, replacement: '$1... breathing in for four... one... two... three... four... now hold for four... one... two... three... four... now exhale for six... one... two... three... four... five... six...' },
    { pattern: /(pause here)/gi, replacement: '$1 for a moment... taking time to settle...' },
    
    // Transition phrases with natural pauses
    { pattern: /(now,|now let's|moving on|next,)/gi, replacement: '$1... ' },
    { pattern: /(imagine|visualize|picture)/gi, replacement: '$1... taking time to see this clearly...' },
    { pattern: /(feel the|notice the|sense the)/gi, replacement: '$1... allowing yourself to truly experience...' },
    { pattern: /(allow yourself|let yourself)/gi, replacement: '$1... giving yourself permission...' },
    
    // Meditation cues with reflective pauses
    { pattern: /(relax\.)/gi, replacement: '$1... feeling the relaxation spread...' },
    { pattern: /(calm\.)/gi, replacement: '$1... embracing this peaceful state...' },
    { pattern: /(peaceful\.)/gi, replacement: '$1... resting in this tranquility...' },
    { pattern: /(center\.|grounded\.|present\.)/gi, replacement: '$1... anchored in this moment...' },
    
    // Affirmation repetitions with space for reflection
    { pattern: /(I am\s+[^.!?]*[.!?])/gi, replacement: '$1... feeling this truth resonate...' },
    { pattern: /(I can\s+[^.!?]*[.!?])/gi, replacement: '$1... believing in this possibility...' },
    { pattern: /(I will\s+[^.!?]*[.!?])/gi, replacement: '$1... committing to this intention...' },
  ];
  
  let processedScript = script;
  
  // Apply pause patterns
  pausePatterns.forEach(({ pattern, replacement }) => {
    processedScript = processedScript.replace(pattern, replacement);
  });
  
  // Add natural breathing spaces after section breaks
  processedScript = processedScript.replace(/Introduction:/gi, 'Introduction:... settling into this practice...');
  processedScript = processedScript.replace(/Middle Section:/gi, 'Middle Section:... deepening our focus...');
  processedScript = processedScript.replace(/Conclusion:/gi, 'Conclusion:... bringing this practice to a gentle close...');
  
  // Add gentle pauses after periods in general meditation content
  processedScript = processedScript.replace(/\.\s+/g, '... ');
  processedScript = processedScript.replace(/,\s+/g, ', ... ');
  
  return processedScript;
}

interface AudioPlayerProps {
  meditation: Meditation | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onMeditationComplete?: () => void;
  isGenerating?: boolean;
}

export default function AudioPlayer({ meditation, isPlaying, setIsPlaying, onMeditationComplete, isGenerating = false }: AudioPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'pending' | 'generating' | 'ready' | 'failed'>('pending');
  
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Format time in MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Initialize when meditation changes
  useEffect(() => {
    if (!meditation) {
      setGenerationStatus('pending');
      setAudioReady(false);
      return;
    }
    
    // Stop existing speech synthesis if it's active
    if (speechSynthRef.current) {
      window.speechSynthesis.cancel();
      speechSynthRef.current = null;
    }
    
    // Reset state
    setProgress(0);
    setCurrentTime(0);
    setAudioReady(false);
    
    // Check if we have audio ready or need to generate
    if (meditation.audioUrl && meditation.audioUrl.includes('/api/audio/')) {
      setGenerationStatus('ready');
      setAudioReady(true);
    } else if (meditation.meditationScript) {
      setGenerationStatus('ready');
      setAudioReady(true);
    } else {
      setGenerationStatus('pending');
    }
    
    // Calculate estimated duration (roughly 0.5 seconds per word for meditation)
    const wordCount = meditation.meditationScript?.split(/\s+/).length || 0;
    const estimatedDuration = Math.max((meditation.estimatedDuration || meditation.duration || 5) * 60, wordCount * 0.5);
    setDuration(estimatedDuration);
    
    // Clean up on unmount
    return () => {
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
        speechSynthRef.current = null;
      }
      
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [meditation]);

  // Handle generation status changes
  useEffect(() => {
    if (isGenerating) {
      setGenerationStatus('generating');
      setAudioReady(false);
    } else if (meditation?.meditationScript || meditation?.audioUrl) {
      setGenerationStatus('ready');
      setAudioReady(true);
    }
  }, [isGenerating, meditation]);
  
  // Create background audio element for music
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  
  // Set up background music based on selection
  useEffect(() => {
    if (!meditation) return;
    
    // Create or get background music element
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio();
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.3; // Default volume
    }
    
    // Set up music source from our server-side music library
    if (meditation.backgroundMusic && meditation.backgroundMusic !== 'none') {
      // Construct API URL to get the background music from our server
      const musicUrl = `/api/background-music/${meditation.backgroundMusic}`;
      
      try {
        // Use preloaded URLs directly from our library instead of the server
        // This is more reliable and avoids unnecessary server requests
        const musicLibrary: Record<string, string> = {
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
        
        const directMusicUrl = musicLibrary[meditation.backgroundMusic] || musicLibrary['gentle-piano'];
        
        if (directMusicUrl) {
          bgMusicRef.current.src = directMusicUrl;
          bgMusicRef.current.load();
          console.log(`Loading background music: ${meditation.backgroundMusic}`);
          
          bgMusicRef.current.oncanplaythrough = () => {
            console.log("Background music loaded successfully and can play");
          };
          
          bgMusicRef.current.onerror = (e) => {
            console.warn("Error loading background music from direct URL, trying fallback:", e);
            // Try alternate CDN if the primary source fails
            bgMusicRef.current!.src = musicUrl;
            bgMusicRef.current!.load();
          };
          
          // Set volume based on user preference
          if (meditation.musicVolume !== undefined) {
            bgMusicRef.current.volume = Math.min(1, Math.max(0, meditation.musicVolume / 100));
            console.log(`Setting music volume to ${bgMusicRef.current.volume}`);
          }
        }
      } catch (err) {
        console.warn("Error setting up background music, falling back to server API:", err);
        // Fallback to server API if client-side library fails
        bgMusicRef.current.src = musicUrl;
        bgMusicRef.current.load();
      }
    }
    
    // Clean up
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.src = '';
      }
    };
  }, [meditation]);
  
    // Handle play/pause state
  useEffect(() => {
    if (!meditation || !meditation.meditationScript) return;
    if (!audioReady || generationStatus !== 'ready') {
      console.log('Audio not ready for playback:', { audioReady, generationStatus });
      return;
    }

    if (isPlaying) {
      // Check if we have a premium audio URL from ElevenLabs first
      if (meditation.audioUrl && meditation.audioUrl.includes('/api/audio/')) {
        console.log('Using premium ElevenLabs audio:', meditation.audioUrl);
        
        // Create audio element for ElevenLabs audio
        const audioElement = new Audio(meditation.audioUrl);
        audioElement.onloadeddata = () => {
          console.log('Premium audio loaded, starting playback');
          audioElement.play().catch(err => {
            console.error('Error playing premium audio:', err);
            // Fallback to speech synthesis
            startSpeechSynthesis();
          });
        };
        
        audioElement.onended = () => {
          setIsPlaying(false);
          if (onMeditationComplete) {
            onMeditationComplete();
          }
        };
        
        audioElement.onerror = () => {
          console.log('Premium audio failed to load, falling back to speech synthesis');
          startSpeechSynthesis();
        };
        
        // Store reference for pause/play control
        speechSynthRef.current = audioElement as any;
        return;
      }
      
      // Fallback to speech synthesis if no premium audio
      startSpeechSynthesis();
      
      function startSpeechSynthesis() {
        console.log('Using speech synthesis fallback');
        
        // Start background music with a simple backup approach
        if (bgMusicRef.current) {
        // Set a simple direct URL as a last resort if all else fails
        let musicType = meditation.backgroundMusic || 'gentle-piano';
        
        // Use self-hosted audio files from our public directory
        // This prevents CORS issues with external CDNs
        const simpleMusicMap: Record<string, string> = {
          'gentle-piano': '/audio/gentle-piano.mp3',
          'nature-sounds': '/audio/nature-sounds.mp3',
          'singing-bowls': '/audio/singing-bowls.mp3',
          'ambient': '/audio/gentle-piano.mp3', // Fallback to piano for now
          'rain': '/audio/nature-sounds.mp3', // Fallback to nature for now
          'delta-waves': '/audio/singing-bowls.mp3', // Fallback to singing bowls
          'theta-waves': '/audio/singing-bowls.mp3', // Fallback to singing bowls
          'alpha-waves': '/audio/singing-bowls.mp3', // Fallback to singing bowls
          '432hz': '/audio/singing-bowls.mp3', 
          '528hz': '/audio/528hz.mp3',
          'freq-432hz': '/audio/singing-bowls.mp3',
          'freq-528hz': '/audio/528hz.mp3',
        };
        
        // Use our simplified map for more reliable playback
        const musicUrl = simpleMusicMap[musicType] || simpleMusicMap['gentle-piano'];
        
        // Set the source and try to play
        bgMusicRef.current.src = musicUrl;
        bgMusicRef.current.load();
        console.log(`Using direct FreeSoundorg for ${meditation.backgroundMusic}`);
        
        // Set volume based on user preference
        if (meditation.musicVolume !== undefined) {
          bgMusicRef.current.volume = Math.min(1, Math.max(0, meditation.musicVolume / 100));
        }
        
        // Try to play
        bgMusicRef.current.play().catch(err => {
          console.error("Error playing background music:", err);
          // If we still can't play, try one last approach - use a super-simple audio source
          bgMusicRef.current!.src = 'https://upload.wikimedia.org/wikipedia/commons/2/28/Brahms_Lullaby_%28Wiegenlied%29_for_Music_Box.ogg';
          bgMusicRef.current!.load();
          bgMusicRef.current!.play().catch(e => console.warn("Final fallback also failed:", e));
        });
      }
      
      // Use Web Speech API for reliable audio playback
      if (window.speechSynthesis) {
        // If we're already speaking, don't restart
        if (window.speechSynthesis.speaking && speechSynthRef.current) {
          window.speechSynthesis.resume();
          return;
        }
        
        // Process the script to add intelligent pauses for breathing and meditation instructions
        const processedScript = addIntelligentPauses(meditation.meditationScript);
        console.log('Original script length:', meditation.meditationScript.length);
        console.log('Processed script length:', processedScript.length);
        console.log('Script preview:', processedScript.substring(0, 200) + '...');
        
        const utterance = new SpeechSynthesisUtterance(processedScript);
        
        // Initialize voices
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          // If voices aren't loaded yet, wait for them
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              setVoiceAndSpeak();
            }
          };
        } else {
          setVoiceAndSpeak();
        }
        
        function setVoiceAndSpeak() {
          // Use a more reliable voice selection method
          const voices = window.speechSynthesis.getVoices();
          
          // Log available voices for debugging
          console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
          
          // Start with null selected voice
          let selectedVoice = null;
          
          // IMPORTANT DEBUG INFORMATION - log key details for voice selection issues
          console.log("Voice selection details:");
          console.log("- Meditation voice style:", meditation?.voiceStyle);
          console.log("- Exact voice URI specified:", meditation?.exactVoiceURI);
          console.log("- Exact voice name specified:", meditation?.exactVoiceName);
          
          // First, check if we have an exact voice URI to use (most reliable)
          if (meditation?.exactVoiceURI) {
            console.log(`Using exact voice URI: ${meditation.exactVoiceURI}`);
            const exactVoice = voices.find(v => v.voiceURI === meditation.exactVoiceURI);
            if (exactVoice) {
              console.log(`Found exact voice match: ${exactVoice.name}`);
              selectedVoice = exactVoice;
            } else {
              console.log(`Exact voice URI not found in available voices, falling back to style-based selection`);
            }
          }
          
          // If we don't have an exact match, use the style-based approach as fallback
          if (!selectedVoice && meditation?.voiceStyle) {
            // Default to English voices first
            const englishVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));
            console.log(`Found ${englishVoices.length} English voices`);
            
            // Determine if user wants male or female voice
            const wantsFemaleVoice = !meditation.voiceStyle.includes('male');
            console.log(`User requested ${wantsFemaleVoice ? 'female' : 'male'} voice`);
            
            // SPECIFIC VOICE SELECTION - Hard-coded reliable options for different browsers
            // These are common voice names across Chrome, Safari, Firefox, etc.
            if (wantsFemaleVoice) {
              // Try find these female voices in order of preference
              const femaleVoiceNames = [
                'Samantha', 'Google UK English Female', 'Microsoft Zira', 
                'Karen', 'Victoria', 'Alice', 'Fiona', 'Moira', 'Tessa', 'Monica',
                'Female', 'woman'
              ];
              
              // Try each name in our priority list
              for (const voiceName of femaleVoiceNames) {
                const match = englishVoices.find(v => 
                  v.name.includes(voiceName) || v.name.toLowerCase().includes(voiceName.toLowerCase())
                );
                if (match) {
                  selectedVoice = match;
                  console.log(`Found specific female voice match: ${match.name}`);
                  break;
                }
              }
              
              // If no specific match, try any voice with "female" in the name
              if (!selectedVoice) {
                const anyFemale = englishVoices.find(v => 
                  v.name.toLowerCase().includes('female') || 
                  v.name.toLowerCase().includes('woman')
                );
                if (anyFemale) {
                  selectedVoice = anyFemale;
                  console.log(`Found generic female voice: ${anyFemale.name}`);
                }
              }
              
              // Last resort for female - if browser provides no gender info, use first female-sounding name
              if (!selectedVoice && englishVoices.length > 0) {
                // Look for voices with typically female names
                const femalePatterns = ['a', 'ie', 'en', 'in', 'el', 'an'];
                const possibleFemale = englishVoices.find(v => {
                  const nameLower = v.name.toLowerCase();
                  return femalePatterns.some(pattern => nameLower.endsWith(pattern)) &&
                    !nameLower.includes('male') && !nameLower.includes('david');
                });
                
                if (possibleFemale) {
                  selectedVoice = possibleFemale;
                  console.log(`Using likely female voice based on name pattern: ${possibleFemale.name}`);
                }
              }
            } else {
              // Try find these male voices in order of preference
              const maleVoiceNames = [
                'Daniel', 'Google UK English Male', 'Microsoft David',
                'Alex', 'Fred', 'Ralph', 'Thomas', 'Guy', 'James', 'John',
                'Male', 'man'
              ];
              
              // Try each name in our priority list
              for (const voiceName of maleVoiceNames) {
                const match = englishVoices.find(v => 
                  v.name.includes(voiceName) || v.name.toLowerCase().includes(voiceName.toLowerCase())
                );
                if (match) {
                  selectedVoice = match;
                  console.log(`Found specific male voice match: ${match.name}`);
                  break;
                }
              }
              
              // If no specific match, try any voice with "male" in the name
              if (!selectedVoice) {
                const anyMale = englishVoices.find(v => 
                  v.name.toLowerCase().includes('male') || 
                  v.name.toLowerCase().includes('man')
                );
                if (anyMale) {
                  selectedVoice = anyMale;
                  console.log(`Found generic male voice: ${anyMale.name}`);
                }
              }
            }
            
            // If we still don't have a voice, use any English voice as last resort
            if (!selectedVoice && englishVoices.length > 0) {
              selectedVoice = englishVoices[0];
              console.log(`No gender match found, using first English voice: ${englishVoices[0].name}`);
            }
          }
          
          // If no English voice available, use any available voice
          if (!selectedVoice && voices.length > 0) {
            selectedVoice = voices[0];
            console.log(`No English voice found, using first available: ${voices[0].name}`);
          }
          
          // Set the selected voice if available
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`Final voice selection: ${selectedVoice.name} (${selectedVoice.lang})`);
          } else {
            console.log("No voices available at all, using browser default");
          }
          
          // Adjust speech parameters for meditation - slower and more calming
          if (meditation.voiceStyle) {
            if (meditation.voiceStyle.includes('whisper')) {
              utterance.volume = 0.7;
              utterance.rate = 0.6; // Much slower for whisper meditation
              utterance.pitch = 0.9; // Lower pitch for whisper
            } else if (meditation.voiceStyle.includes('motivational')) {
              utterance.volume = 0.9;
              utterance.rate = 0.7; // Slower even for motivational
              utterance.pitch = 1.05; // Slightly higher for motivational
            } else {
              // Calm voice (default) - very slow and peaceful
              utterance.volume = 0.8;
              utterance.rate = 0.6; // Very slow for meditation
              utterance.pitch = 0.95; // Slightly lower for calming effect
            }
          } else {
            // Default meditation settings - prioritize calmness
            utterance.volume = 0.8;
            utterance.rate = 0.6; // Very slow speech
            utterance.pitch = 0.95;
          }
          
          // Set up events
          utterance.onend = () => {
            setIsPlaying(false);
            speechSynthRef.current = null;
            
            // Also stop background music
            if (bgMusicRef.current) {
              // Fade out music
              const fadeOut = setInterval(() => {
                if (bgMusicRef.current && bgMusicRef.current.volume > 0.02) {
                  bgMusicRef.current.volume -= 0.02;
                } else {
                  clearInterval(fadeOut);
                  if (bgMusicRef.current) {
                    bgMusicRef.current.pause();
                  }
                }
              }, 100);
            }
            
            // Reset progress
            setProgress(0);
            setCurrentTime(0);
            
            // Clear timer
            if (progressTimerRef.current) {
              window.clearInterval(progressTimerRef.current);
              progressTimerRef.current = null;
            }
            
            // Trigger post-meditation mood check-in
            if (onMeditationComplete) {
              onMeditationComplete();
            }
          };
          
          // Start speech
          speechSynthRef.current = utterance;
          startTimeRef.current = Date.now();
          window.speechSynthesis.speak(utterance);
        }
        
        // Start progress timer to simulate progress bar
        if (progressTimerRef.current) {
          window.clearInterval(progressTimerRef.current);
        }
        
        startTimeRef.current = Date.now();
        progressTimerRef.current = window.setInterval(() => {
          const elapsed = (Date.now() - startTimeRef.current) / 1000;
          setCurrentTime(elapsed);
          
          // Calculate progress as percentage
          const percent = Math.min(100, (elapsed / duration) * 100);
          setProgress(percent);
          
          // Stop timer if we reach 100%
          if (percent >= 100) {
            if (progressTimerRef.current) {
              window.clearInterval(progressTimerRef.current);
              progressTimerRef.current = null;
            }
          }
        }, 100);
        }
      }
    } else {
      // Pause speech synthesis
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
      }
      
      // Pause progress timer
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }
    
    // Clean up on unmount
    return () => {
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
        speechSynthRef.current = null;
      }
    };
  }, [isPlaying, meditation, duration, setIsPlaying]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioReady || generationStatus !== 'ready') {
      console.log('Cannot play: audio not ready');
      return;
    }
    setIsPlaying(!isPlaying);
  };

  // If no meditation, show nothing
  if (!meditation) {
    return null;
  }

  // Get status message based on generation state
  const getStatusMessage = () => {
    switch (generationStatus) {
      case 'pending':
        return 'Click Generate to create your meditation';
      case 'generating':
        return 'Generating your personalized meditation...';
      case 'ready':
        return audioReady ? 'Ready to play' : 'Preparing audio...';
      case 'failed':
        return 'Generation failed - using browser voice';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">{meditation.title}</h3>
          <p className="text-sm text-gray-600">{getStatusMessage()}</p>
        </div>
        
        {/* Waveform Visualization */}
        <div className="w-full h-32 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center overflow-hidden relative shadow-inner">
          {generationStatus === 'generating' ? (
            /* Loading Animation */
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 h-8 bg-gradient-to-t from-purple-400 to-purple-600 rounded-full animate-pulse"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
              <span className="text-purple-600 font-medium ml-4">Generating...</span>
            </div>
          ) : generationStatus === 'pending' ? (
            /* Waiting State */
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-sm">Create your meditation first</p>
            </div>
          ) : (
            /* Waveform */
            <div className="w-full h-full flex items-center justify-center relative">
              <div className={cn(
                "flex items-end space-x-1 h-full w-full px-6 transition-all duration-300",
                isPlaying ? "opacity-100" : "opacity-70"
              )}>
                {Array.from({ length: 40 }).map((_, i) => {
                  const baseHeight = 8 + Math.sin(i * 0.3) * 6;
                  const height = isPlaying 
                    ? baseHeight + Math.sin(i * 0.4 + currentTime * 3) * 15 + Math.random() * 8
                    : baseHeight;
                  
                  const opacity = isPlaying 
                    ? 0.7 + Math.sin(i * 0.2 + currentTime * 2) * 0.3
                    : 0.5;
                  
                  return (
                    <div 
                      key={i}
                      style={{ 
                        height: `${Math.max(4, height)}px`,
                        opacity,
                        transition: 'height 0.15s ease-out, opacity 0.1s ease'
                      }}
                      className={cn(
                        "flex-1 rounded-full",
                        isPlaying 
                          ? "bg-gradient-to-t from-purple-500 via-purple-400 to-blue-400" 
                          : "bg-gradient-to-t from-gray-400 to-gray-300"
                      )}
                    />
                  );
                })}
              </div>
              
              {/* Play/Pause Overlay */}
              {!isPlaying && audioReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 transition-all duration-200"
                    onClick={togglePlayPause} 
                    aria-label="Play meditation"
                  >
                    <svg className="w-7 h-7 text-purple-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Disabled Overlay */}
              {!audioReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Not ready</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {audioReady && (
          <div className="w-full flex items-center space-x-3">
            <span className="text-sm text-gray-500 font-mono w-12 text-right">
              {formatTime(isNaN(currentTime) ? 0 : currentTime)}
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${isNaN(progress) ? 0 : progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 font-mono w-12">
              {formatTime(isNaN(duration) ? 0 : duration)}
            </span>
          </div>
        )}
        
        {/* Control Panel */}
        <div className="w-full flex items-center justify-between">
          {/* Main Play/Pause Button */}
          <button 
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg",
              audioReady && generationStatus === 'ready'
                ? isPlaying 
                  ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-purple-200" 
                  : "bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-purple-200"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
            onClick={togglePlayPause}
            disabled={!audioReady || generationStatus !== 'ready'}
            aria-label={isPlaying ? 'Pause meditation' : 'Play meditation'}
          >
            {isPlaying ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          {/* Meditation Info */}
          <div className="flex-1 ml-4">
            <div className="text-right">
              <div className="font-medium text-gray-800">
                {meditation?.exactVoiceName || meditation?.voiceStyle || 'Default Voice'}
              </div>
              <div className="text-sm text-gray-500 space-x-2">
                {meditation?.backgroundMusic && meditation.backgroundMusic !== 'none' && (
                  <span className="inline-flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    {meditation.backgroundMusic.replace('-', ' ')}
                  </span>
                )}
                <span className="inline-flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {meditation?.estimatedDuration || meditation?.duration || 5} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}