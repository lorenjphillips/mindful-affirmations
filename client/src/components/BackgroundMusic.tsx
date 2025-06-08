import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { musicOptions } from "@shared/schema";

interface BackgroundMusicProps {
  music: string;
  volume: number;
  isPlaying: boolean;
  fadeOut?: boolean;
}

export default function BackgroundMusic({ music, volume, isPlaying, fadeOut = false }: BackgroundMusicProps) {
  const soundRef = useRef<Howl | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // URLs for the music tracks (would come from server in a real implementation)
  const getMusicUrl = (musicId: string) => {
    // In a real implementation, these would be actual URLs to audio files
    const musicUrls: Record<string, string> = {
      "gentle-piano": "https://example.com/audio/gentle-piano.mp3",
      "nature-sounds": "https://example.com/audio/nature-sounds.mp3",
      "ambient": "https://example.com/audio/ambient.mp3",
      "singing-bowls": "https://example.com/audio/singing-bowls.mp3",
      "rain": "https://example.com/audio/rain.mp3",
    };

    return musicUrls[musicId] || "";
  };

  useEffect(() => {
    // Don't load music if "none" is selected
    if (music === "none") {
      return;
    }

    const url = getMusicUrl(music);
    
    // Create and configure the Howl instance
    soundRef.current = new Howl({
      src: [url],
      loop: true,
      volume: volume / 100,
      onload: () => {
        setIsLoaded(true);
        if (isPlaying) {
          soundRef.current?.play();
        }
      },
      onloaderror: (id, error) => {
        console.error("Error loading audio:", error);
      }
    });

    // Cleanup function
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
      }
    };
  }, [music]);

  // Handle volume changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume / 100);
    }
  }, [volume]);

  // Handle play/pause
  useEffect(() => {
    if (!soundRef.current || !isLoaded) return;

    if (isPlaying) {
      soundRef.current.play();
    } else {
      if (fadeOut) {
        // Fade out over 2 seconds
        soundRef.current.fade(soundRef.current.volume(), 0, 2000);
        setTimeout(() => {
          soundRef.current?.pause();
        }, 2000);
      } else {
        soundRef.current.pause();
      }
    }
  }, [isPlaying, fadeOut, isLoaded]);

  // This is a non-visual component that just handles audio
  return null;
}
