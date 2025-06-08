import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Play, Pause, Users, Star, Heart, Crown, Mic } from "lucide-react";
import { voiceOptions } from "@shared/schema";
import VoiceCloning from "./VoiceCloning";

interface VoicePreviewProps {
  onVoiceSelect: (voiceURI: string, voiceName: string) => void;
  preSelectedVoiceType?: 'male' | 'female' | 'any';
}

interface CustomVoice {
  id: string;
  name: string;
  type: 'cloned';
  isCustom: true;
}

export default function VoicePreview({ onVoiceSelect, preSelectedVoiceType = 'any' }: VoicePreviewProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>('calm-female');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('adult');
  const [showVoiceCloning, setShowVoiceCloning] = useState<boolean>(false);
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [playingVoice, setPlayingVoice] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Group voice options by audience and category
  const adultVoices = voiceOptions.filter(voice => voice.audience === 'adult');
  const childVoices = voiceOptions.filter(voice => voice.audience === 'child');
  const characterVoices = childVoices.filter(voice => !voice.family && !voice.voiceCloning);
  const familyVoices = childVoices.filter(voice => voice.family && !voice.voiceCloning);
  const cloningOptions = childVoices.filter(voice => voice.voiceCloning);

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    const selectedOption = voiceOptions.find(v => v.id === voiceId) || customVoices.find(v => v.id === voiceId);
    if (selectedOption) {
      onVoiceSelect(voiceId, selectedOption.name);
    }
  };

  const playVoicePreview = (voiceId: string) => {
    if (playingVoice === voiceId) {
      // Stop current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingVoice('');
      setIsPlaying(false);
      return;
    }

    // Start new playback
    const voiceOption = voiceOptions.find(v => v.id === voiceId);
    if (!voiceOption) return;

    // Create sample text based on voice type
    let sampleText = "Welcome to your meditation journey. Take a deep breath and let yourself relax completely.";
    
    if (voiceOption.audience === 'child') {
      if (voiceOption.id === 'superhero') {
        sampleText = "Hey there, super kid! You have amazing powers inside you. Let's discover your inner strength together.";
      } else if (voiceOption.id === 'friendly-wizard') {
        sampleText = "Greetings, young one! Come along on a magical meditation adventure where anything is possible.";
      } else if (voiceOption.family) {
        sampleText = "Sweet dreams, my dear. You are loved, you are safe, and you are perfect just as you are.";
      } else {
        sampleText = "Hi there, little star! Let's go on a wonderful journey to a place of peace and happiness.";
      }
    }

    // Use Web Speech API for demo
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sampleText);
      const voices = speechSynthesis.getVoices();
      
      // Try to find a matching voice based on gender and characteristics
      let selectedSynthVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voiceOption.gender === 'female' ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') : 
         voiceOption.gender === 'male' ? voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man') : true)
      ) || voices.find(voice => voice.lang.includes('en')) || voices[0];

      if (selectedSynthVoice) {
        utterance.voice = selectedSynthVoice;
        utterance.rate = 0.8;
        utterance.pitch = voiceOption.audience === 'child' ? 1.1 : 1.0;
        
        utterance.onstart = () => {
          setPlayingVoice(voiceId);
          setIsPlaying(true);
        };
        
        utterance.onend = () => {
          setPlayingVoice('');
          setIsPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
      }
    }
  };

  const handleVoiceCloned = (voiceId: string, voiceName: string) => {
    const newCustomVoice: CustomVoice = {
      id: voiceId,
      name: voiceName,
      type: 'cloned',
      isCustom: true
    };
    
    setCustomVoices(prev => [...prev, newCustomVoice]);
    setShowVoiceCloning(false);
    setSelectedVoice(voiceId);
    onVoiceSelect(voiceId, voiceName);
  };

  const VoiceCard = ({ voice, isSelected, onSelect, onPlay }: { 
    voice: any, 
    isSelected: boolean, 
    onSelect: () => void, 
    onPlay: () => void 
  }) => (
    <div className={`p-4 rounded-lg border cursor-pointer transition-all ${
      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1" onClick={onSelect}>
          <RadioGroupItem value={voice.id} id={voice.id} className="mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor={voice.id} className="font-medium cursor-pointer">
                {voice.name}
              </Label>
              {voice.premium && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
              {voice.family && (
                <Heart className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {voice.description}
            </p>
            {voice.benefits && (
              <div className="flex flex-wrap gap-1">
                {voice.benefits.slice(0, 3).map((benefit: string) => (
                  <Badge key={benefit} variant="outline" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
                {voice.benefits.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{voice.benefits.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlay}
          className="ml-2 flex items-center gap-1"
        >
          {playingVoice === voice.id ? 
            <Pause className="w-4 h-4" /> : 
            <Play className="w-4 h-4" />
          }
          Preview
        </Button>
      </div>
    </div>
  );

  if (showVoiceCloning) {
    return (
      <VoiceCloning
        onVoiceCloned={handleVoiceCloned}
        onCancel={() => setShowVoiceCloning(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="adult" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Adult Voices
          </TabsTrigger>
          <TabsTrigger value="child" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Children's Voices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adult" className="space-y-4">
          <RadioGroup value={selectedVoice} onValueChange={handleVoiceSelect}>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {adultVoices.map((voice) => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    isSelected={selectedVoice === voice.id}
                    onSelect={() => handleVoiceSelect(voice.id)}
                    onPlay={() => playVoicePreview(voice.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </RadioGroup>
        </TabsContent>

        <TabsContent value="child" className="space-y-4">
          <div className="space-y-6">
            {/* Custom/Cloned Voices */}
            {(customVoices.length > 0 || cloningOptions.length > 0) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Your Custom Voices
                  </h3>
                  <Button
                    onClick={() => setShowVoiceCloning(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Clone Your Voice
                  </Button>
                </div>
                
                <RadioGroup value={selectedVoice} onValueChange={handleVoiceSelect}>
                  <div className="space-y-3">
                    {customVoices.map((voice) => (
                      <VoiceCard
                        key={voice.id}
                        voice={voice}
                        isSelected={selectedVoice === voice.id}
                        onSelect={() => handleVoiceSelect(voice.id)}
                        onPlay={() => {}} // Custom voices don't have preview
                      />
                    ))}
                    
                    {cloningOptions.map((voice) => (
                      <div key={voice.id} className="p-4 rounded-lg border border-dashed border-primary/50 bg-primary/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Crown className="w-5 h-5 text-yellow-500" />
                            <div>
                              <h4 className="font-medium">{voice.name}</h4>
                              <p className="text-sm text-muted-foreground">{voice.description}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => setShowVoiceCloning(true)}
                            className="flex items-center gap-2"
                          >
                            <Mic className="w-4 h-4" />
                            Get Started
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Family Voices */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Family Voices
              </h3>
              <RadioGroup value={selectedVoice} onValueChange={handleVoiceSelect}>
                <div className="space-y-3">
                  {familyVoices.map((voice) => (
                    <VoiceCard
                      key={voice.id}
                      voice={voice}
                      isSelected={selectedVoice === voice.id}
                      onSelect={() => handleVoiceSelect(voice.id)}
                      onPlay={() => playVoicePreview(voice.id)}
                    />
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Character Voices */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                Character Voices
              </h3>
              <RadioGroup value={selectedVoice} onValueChange={handleVoiceSelect}>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {characterVoices.map((voice) => (
                      <VoiceCard
                        key={voice.id}
                        voice={voice}
                        isSelected={selectedVoice === voice.id}
                        onSelect={() => handleVoiceSelect(voice.id)}
                        onPlay={() => playVoicePreview(voice.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </RadioGroup>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}