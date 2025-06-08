import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Mic, Play, Pause, Trash2, Crown, Heart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VoiceCloningProps {
  onVoiceCloned: (voiceId: string, voiceName: string) => void;
  onCancel: () => void;
}

export default function VoiceCloning({ onVoiceCloned, onCancel }: VoiceCloningProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError('');

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Could not access microphone. Please check your browser permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB');
        return;
      }

      if (!file.type.startsWith('audio/')) {
        setError('Please upload an audio file');
        return;
      }

      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setIsPlaying(false);
    setRecordingTime(0);
    setError('');
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const cloneVoice = async () => {
    if (!audioBlob || !voiceName.trim()) {
      setError('Please provide both an audio sample and a voice name');
      return;
    }

    if (recordingTime < 60 && audioBlob.size < 1024 * 1024) {
      setError('Audio sample should be at least 1 minute long for best quality');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('voiceName', voiceName.trim());
      formData.append('type', 'parent-voice');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/voice-clone', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to clone voice');
      }

      const result = await response.json();
      
      // Wait a bit to show completion
      setTimeout(() => {
        onVoiceCloned(result.voiceId, voiceName.trim());
      }, 1000);

    } catch (err) {
      setError('Failed to clone voice. Please try again.');
      setIsProcessing(false);
      setUploadProgress(0);
      console.error('Voice cloning error:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <CardTitle className="flex items-center gap-2">
            Clone Your Voice
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Premium
            </Badge>
          </CardTitle>
        </div>
        <CardDescription>
          Create a personalized meditation experience by cloning your voice for your child. 
          Upload a 2+ minute audio sample for best results.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Voice Name Input */}
        <div>
          <Label htmlFor="voiceName">Voice Name</Label>
          <Input
            id="voiceName"
            placeholder="e.g., Mom's Voice, Dad's Voice"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Recording Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Record Audio Sample</h3>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                Recording {formatTime(recordingTime)}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
            
            {audioUrl && (
              <>
                <Button
                  onClick={playAudio}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                
                <Button
                  onClick={clearAudio}
                  variant="outline"
                  size="icon"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <h3 className="font-medium">Or Upload Audio File</h3>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload an audio file (MP3, WAV, M4A)
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing voice clone...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Alert>
          <Heart className="w-4 h-4" />
          <AlertDescription>
            <strong>Tips for best results:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Record in a quiet environment</li>
              <li>• Speak naturally and expressively</li>
              <li>• Include varied sentence structures</li>
              <li>• Minimum 2 minutes for high quality</li>
              <li>• Read a children's story or meditation script</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={cloneVoice}
            disabled={!audioBlob || !voiceName.trim() || isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Creating Voice Clone...' : 'Clone Voice'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}