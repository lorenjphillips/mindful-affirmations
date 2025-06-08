import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";
import { musicOptions } from "@shared/schema";

interface MusicPreviewProps {
  onMusicSelect: (musicType: string, volume: number) => void;
  defaultMusic?: string;
  defaultVolume?: number;
}

export default function MusicPreview({ 
  onMusicSelect, 
  defaultMusic = 'gentle-piano',
  defaultVolume = 50
}: MusicPreviewProps) {
  const [selectedMusic, setSelectedMusic] = useState<string>(defaultMusic);
  const [volume, setVolume] = useState<number>(defaultVolume);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Group music options by category
  const groupedOptions = musicOptions.reduce((acc, option) => {
    const category = option.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  }, {} as Record<string, typeof musicOptions>);

  // Play a sample of the selected music
  const playMusicSample = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    // If currently playing, stop first
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Use a default audio file for preview
    const audioFile = `/audio/${selectedMusic}.mp3`;
    
    try {
      // Set new source and volume
      audioRef.current.src = audioFile;
      audioRef.current.volume = volume / 100;
      
      // Play with promise handling
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        
        // Auto-stop after 10 seconds
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
          }
        }, 10000);
        
        // Handle when audio ends
        audioRef.current!.onended = () => {
          setIsPlaying(false);
        };
      }).catch((error) => {
        console.warn("Could not play audio preview:", error);
        setIsPlaying(false);
      });
    } catch (error) {
      console.warn("Error setting up audio preview:", error);
      setIsPlaying(false);
    }
  };

  const handleMusicChange = (musicId: string) => {
    setSelectedMusic(musicId);
    onMusicSelect(musicId, volume);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    onMusicSelect(selectedMusic, vol);
  };

  const selectedOption = musicOptions.find(option => option.id === selectedMusic);

  return (
    <div className="space-y-6">
      {/* Volume Control */}
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Background Music Volume: {volume}%
        </Label>
        <div className="flex items-center space-x-4">
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={5}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={playMusicSample}
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Stop" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Selected Music Info */}
      {selectedOption && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selectedOption.name}</CardTitle>
            <CardDescription>{selectedOption.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedOption.benefits && (
              <div className="flex flex-wrap gap-1">
                {selectedOption.benefits.map((benefit) => (
                  <Badge key={benefit} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Music Selection */}
      <ScrollArea className="h-96">
        <RadioGroup value={selectedMusic} onValueChange={handleMusicChange}>
          {Object.entries(groupedOptions).map(([category, options]) => (
            <div key={category} className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-primary">{category}</h3>
              <div className="space-y-3">
                {options.map((option) => (
                  <div key={option.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.name}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                      {option.benefits && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {option.benefits.slice(0, 3).map((benefit) => (
                            <Badge key={benefit} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                          {option.benefits.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{option.benefits.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </RadioGroup>
      </ScrollArea>
    </div>
  );
}