import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { moodOptions } from "@shared/schema";
import { Heart, ArrowRight } from "lucide-react";

interface MoodCheckInProps {
  onComplete: (moodData: {
    rating: number;
    tags: string[];
  }) => void;
  type: "pre" | "post";
  isVisible: boolean;
}

export default function MoodCheckIn({ onComplete, type, isVisible }: MoodCheckInProps) {
  const [rating, setRating] = useState<number>(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isVisible) return null;

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleComplete = () => {
    onComplete({
      rating,
      tags: selectedTags
    });
  };

  const getRatingEmoji = (value: number) => {
    switch (value) {
      case 1: return "😔";
      case 2: return "😕";
      case 3: return "😐";
      case 4: return "😊";
      case 5: return "😁";
      default: return "😐";
    }
  };

  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1: return "Very Low";
      case 2: return "Low";
      case 3: return "Neutral";
      case 4: return "Good";
      case 5: return "Excellent";
      default: return "Neutral";
    }
  };

  const isPreMeditation = type === "pre";
  const title = isPreMeditation ? "How are you feeling right now?" : "How do you feel after your meditation?";
  const subtitle = isPreMeditation 
    ? "Take a moment to check in with yourself before we begin"
    : "Reflect on your experience and current state";

  // Group mood options by category
  const groupedMoods = {
    positive: moodOptions.filter(m => m.category === "positive"),
    neutral: moodOptions.filter(m => m.category === "neutral"), 
    challenging: moodOptions.filter(m => m.category === "challenging")
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-6 w-6 text-pink-500" />
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mood Check-In
            </CardTitle>
          </div>
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          <p className="text-slate-600">{subtitle}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mood Rating Slider */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">{getRatingEmoji(rating)}</div>
              <h4 className="text-lg font-medium text-slate-800">
                Overall Mood: {getRatingLabel(rating)}
              </h4>
            </div>
            
            <div className="px-4">
              <Slider
                value={[rating]}
                onValueChange={(value) => setRating(value[0])}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>😔 Very Low</span>
                <span>😐 Neutral</span>
                <span>😁 Excellent</span>
              </div>
            </div>
          </div>

          {/* Mood Tags */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-800 text-center">
              What describes how you're feeling? (Select all that apply)
            </h4>
            
            {/* Positive Moods */}
            {groupedMoods.positive.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-green-700 mb-2">Positive</h5>
                <div className="flex flex-wrap gap-2">
                  {groupedMoods.positive.map((mood) => (
                    <Badge
                      key={mood.id}
                      variant={selectedTags.includes(mood.id) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedTags.includes(mood.id) 
                          ? "bg-green-100 text-green-800 border-green-300" 
                          : "hover:bg-green-50 hover:border-green-300"
                      }`}
                      onClick={() => handleTagToggle(mood.id)}
                    >
                      <span className="mr-1">{mood.emoji}</span>
                      {mood.text}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Neutral Moods */}
            {groupedMoods.neutral.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-blue-700 mb-2">Neutral</h5>
                <div className="flex flex-wrap gap-2">
                  {groupedMoods.neutral.map((mood) => (
                    <Badge
                      key={mood.id}
                      variant={selectedTags.includes(mood.id) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedTags.includes(mood.id) 
                          ? "bg-blue-100 text-blue-800 border-blue-300" 
                          : "hover:bg-blue-50 hover:border-blue-300"
                      }`}
                      onClick={() => handleTagToggle(mood.id)}
                    >
                      <span className="mr-1">{mood.emoji}</span>
                      {mood.text}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Challenging Moods */}
            {groupedMoods.challenging.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-orange-700 mb-2">Challenging</h5>
                <div className="flex flex-wrap gap-2">
                  {groupedMoods.challenging.map((mood) => (
                    <Badge
                      key={mood.id}
                      variant={selectedTags.includes(mood.id) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedTags.includes(mood.id) 
                          ? "bg-orange-100 text-orange-800 border-orange-300" 
                          : "hover:bg-orange-50 hover:border-orange-300"
                      }`}
                      onClick={() => handleTagToggle(mood.id)}
                    >
                      <span className="mr-1">{mood.emoji}</span>
                      {mood.text}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="text-center pt-4">
            <Button
              onClick={handleComplete}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
            >
              {isPreMeditation ? (
                <>
                  Continue to Meditation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  Complete Session
                  <Heart className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}