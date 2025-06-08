import { useState } from "react";
import MeditationForm from "@/components/MeditationForm";
import AudioPlayer from "@/components/AudioPlayer";
import VoicePreview from "@/components/VoicePreview";
import MusicPreview from "@/components/MusicPreview";
import MoodCheckIn from "@/components/MoodCheckIn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { voiceOptions, musicOptions, affirmationOptions } from "@shared/schema";
import { type Meditation } from "@shared/schema";

// Helper function to generate structured meditation content
function generateStructuredMeditation(purpose: string, affirmationsText: string, repetitionCount: number) {
  const baseIntro = "Welcome to this transformative meditation experience. Find a comfortable position where your body feels supported and your spine is straight.";
  
  let scriptIntro = '';
  let breathingExercises: string[] = [];
  let visualizationContent: string[] = [];
  let affirmationSections: string[] = [];
  let scriptEnding = '';
  
  // Common breathing exercises (used once) with explicit counting
  breathingExercises = [
    "Take a deep breath in through your nose, filling your lungs completely. Hold for a moment. And exhale slowly through your mouth, releasing any tension.",
    "Let's establish a natural breathing rhythm. Breathe in for four counts: one, two, three, four. Hold for four counts: one, two, three, four. And exhale for six counts: one, two, three, four, five, six.",
    "Continue this pattern. Inhale for four: one, two, three, four. Hold for four: one, two, three, four. Exhale for six: one, two, three, four, five, six.",
    "Notice the natural pause between your inhale and exhale. In this space, find perfect stillness."
  ];
  
  switch(purpose) {
    case 'sleep':
      scriptIntro = `Welcome to this peaceful sleep meditation. ${baseIntro} As we begin, feel your body naturally preparing for deep, restorative rest.`;
      
      visualizationContent = [
        "Imagine yourself in a peaceful sanctuary where you feel completely safe and protected.",
        "Visualize your body becoming heavier with each breath, like sinking into the softest cloud.",
        "Picture any worries or thoughts of the day floating away like gentle leaves on a calm stream."
      ];
      
      affirmationSections = [
        "As you breathe deeply, feel your body becoming heavier with each exhale. Let go of the day's tensions.",
        "With each breath, sink deeper into relaxation. Feel the weight of sleep gently pulling you into peaceful slumber.",
        "Allow your mind to quiet as you release all thoughts of the day. Each breath brings you closer to restful sleep.",
        "Feel the comfort of your bed supporting you completely. Your body knows how to rest and restore itself naturally."
      ];
      
      scriptEnding = 'Drift into peaceful, restorative sleep, knowing you are safe and loved. Sleep deeply and wake refreshed.';
      break;
      
    case 'morning':
      scriptIntro = `Good morning, and welcome to this energizing meditation to start your day with purpose. ${baseIntro} Feel the fresh energy of a new day awakening within you.`;
      
      visualizationContent = [
        "Imagine golden sunlight filling your body with warmth and energy.",
        "Visualize yourself moving through your day with confidence and grace.",
        "Picture the opportunities and possibilities that await you today."
      ];
      
      affirmationSections = [
        "Feel the energy building within you as you breathe in positivity and exhale any lingering drowsiness.",
        "With each breath, welcome the opportunities this new day brings. You are capable and ready.",
        "Feel strength and vitality flowing through your body, preparing you for the day ahead.",
        "Let confidence and enthusiasm fill your being as you prepare to step into your day."
      ];
      
      scriptEnding = 'Carry this energy and these affirmations with you throughout your day. You are ready to shine.';
      break;
      
    case 'focus':
      scriptIntro = `Welcome to this focused meditation designed to sharpen your concentration and mental clarity. ${baseIntro} Feel your mind becoming alert and present.`;
      
      visualizationContent = [
        "Imagine your mind as a clear, still lake reflecting the sky perfectly.",
        "Visualize a beam of focused light illuminating exactly what needs your attention.",
        "Picture your thoughts becoming organized and crystal clear, like pieces falling into place."
      ];
      
      affirmationSections = [
        "With each breath, feel your mind becoming clearer and more focused on what truly matters.",
        "Notice how your attention naturally settles into a state of calm concentration.",
        "Feel mental fog lifting as your awareness becomes sharp and precise.",
        "Each breath enhances your ability to concentrate deeply and maintain focus."
      ];
      
      scriptEnding = 'Take this focused energy with you into your tasks and goals. Your mind is clear and ready.';
      break;
      
    case 'confidence':
      scriptIntro = `Welcome to this empowering meditation to build your inner confidence and self-worth. ${baseIntro} Feel your natural confidence beginning to emerge.`;
      
      visualizationContent = [
        "Imagine a warm, golden light growing stronger in your heart center, representing your inner strength.",
        "Visualize yourself standing tall and confident, radiating self-assurance.",
        "Picture past successes and achievements, feeling the pride and accomplishment they bring."
      ];
      
      affirmationSections = [
        "Feel your confidence growing stronger with each affirmation, knowing your true worth and capabilities.",
        "With each breath, connect with your inner strength and inherent value as a person.",
        "Notice how naturally confident you can feel when you trust in your abilities.",
        "Feel the power of believing in yourself. You have everything you need to succeed."
      ];
      
      scriptEnding = 'Step forward with confidence, knowing you have everything you need within you. You are capable and worthy.';
      break;
      
    case 'stress':
      scriptIntro = `Welcome to this calming meditation for stress relief and inner peace. ${baseIntro} Allow yourself to begin releasing any tension you've been carrying.`;
      
      visualizationContent = [
        "Imagine yourself in a peaceful place in nature where you feel completely relaxed.",
        "Visualize stress and tension melting away from your body like warm wax.",
        "Picture waves of calm washing over you, carrying away all worry and concern."
      ];
      
      affirmationSections = [
        "Feel the stress melting away from your body and mind as you breathe in calm and exhale tension.",
        "With each breath, release what no longer serves you. Peace is your natural state.",
        "Notice how your body naturally knows how to relax when you give it permission to let go.",
        "Your breath is an anchor to this moment of calm. Here, you are safe and at peace."
      ];
      
      scriptEnding = 'Carry this sense of peace and calm with you, knowing you can return to this state anytime you need.';
      break;
      
    default:
      scriptIntro = `Welcome to this transformative meditation for relaxation and mindfulness. ${baseIntro} Allow yourself to be fully present in this moment.`;
      
      visualizationContent = [
        "Imagine yourself surrounded by a bubble of peace and tranquility.",
        "Visualize your body becoming completely relaxed and at ease.",
        "Picture your mind becoming as calm and clear as a mountain lake."
      ];
      
      affirmationSections = [
        "With each breath, feel yourself becoming more present, more centered in this moment.",
        "Notice the natural rhythm of your breathing, anchoring you to the here and now.",
        "Feel your body relaxing deeper with each exhale, releasing all unnecessary tension.",
        "In this moment of stillness, you are exactly where you need to be."
      ];
      
      scriptEnding = 'When you\'re ready, take one more deep breath and gently open your eyes, carrying this peace with you.';
  }
  
  return { scriptIntro, breathingExercises, visualizationContent, affirmationSections, scriptEnding };
}

export default function Home() {
  const [currentTab, setCurrentTab] = useState("customize");
  const [meditation, setMeditation] = useState<Meditation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editableScript, setEditableScript] = useState<string>("");
  const [isEditingScript, setIsEditingScript] = useState(false);
  
  // Editable script section states
  const [editableIntroEnabled, setEditableIntroEnabled] = useState(true);
  const [editableBreathingEnabled, setEditableBreathingEnabled] = useState(true);
  const [editableVisualizationEnabled, setEditableVisualizationEnabled] = useState(true);
  const [editableAffirmationsEnabled, setEditableAffirmationsEnabled] = useState(true);
  const [editableEndingEnabled, setEditableEndingEnabled] = useState(true);
  
  const [editableIntro, setEditableIntro] = useState<string>("");
  const [editableBreathing, setEditableBreathing] = useState<string>("");
  const [editableVisualization, setEditableVisualization] = useState<string>("");
  const [editableAffirmations, setEditableAffirmations] = useState<string>("");
  const [editableEnding, setEditableEnding] = useState<string>("");
  
  const [showPreMoodCheckIn, setShowPreMoodCheckIn] = useState(false);
  const [showPostMoodCheckIn, setShowPostMoodCheckIn] = useState(false);
  const [preMoodData, setPreMoodData] = useState<{rating: number; tags: string[]} | null>(null);

  const handleGenerate = async (generatedMeditation: Meditation) => {
    setIsGenerating(true);
    
    try {
      console.log("Starting meditation generation process...");
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMeditation(generatedMeditation);
      
      const affirmationsText = 
        generatedMeditation.selectedAffirmations && generatedMeditation.selectedAffirmations.length > 0
          ? generatedMeditation.selectedAffirmations.map((id: string) => 
              affirmationOptions.find((a: any) => a.id === id)?.text || id
            ).join('. ')
          : generatedMeditation.customAffirmations || '';
      
      // Generate structured meditation content
      const { scriptIntro, breathingExercises, visualizationContent, affirmationSections, scriptEnding } = generateStructuredMeditation(
        generatedMeditation.purpose, 
        affirmationsText, 
        generatedMeditation.repetitionCount || 3
      );
      
      // Create the full meditation script with proper structure
      const repetitionCount = generatedMeditation.repetitionCount || 3;
      const middleSections = [];
      
      // Add breathing exercises once (non-repeating)
      if (breathingExercises.length > 0) {
        middleSections.push(...breathingExercises);
      }
      
      // Add visualization content once (non-repeating)
      if (visualizationContent.length > 0) {
        middleSections.push(...visualizationContent);
      }
      
      // Repeat only the affirmation sections
      for (let i = 0; i < repetitionCount; i++) {
        const randomAffirmationSection = affirmationSections[Math.floor(Math.random() * affirmationSections.length)];
        middleSections.push(randomAffirmationSection);
        
        // Add the actual affirmations
        if (affirmationsText) {
          middleSections.push(`${affirmationsText}`);
          
          // Add breathing pause with counting between repetitions
          if (i < repetitionCount - 1) {
            middleSections.push("Take three deep breaths, allowing these words to settle deeply into your being. Breathe in for four: one, two, three, four. Hold for four: one, two, three, four. Exhale for six: one, two, three, four, five, six. Again, breathe in for four: one, two, three, four. Hold for four: one, two, three, four. Exhale for six: one, two, three, four, five, six. One more time, breathe in for four: one, two, three, four. Hold for four: one, two, three, four. Exhale for six: one, two, three, four, five, six.");
          }
        }
      }
      
      const meditationScript = [
        scriptIntro,
        ...middleSections,
        scriptEnding
      ].filter(Boolean);
      
      const meditationWithScript = {
        ...generatedMeditation,
        meditationScript: meditationScript.join(' '),
        scriptIntro,
        scriptMiddle: affirmationSections,
        scriptEnding,
        estimatedDuration: Math.round(repetitionCount * 1.5 + 2)
      };
      
      // Initialize editable content with generated content
      setEditableIntro(scriptIntro);
      setEditableBreathing(breathingExercises.join('\n\n'));
      setEditableVisualization(visualizationContent.join('\n\n'));
      setEditableAffirmations(affirmationsText);
      setEditableEnding(scriptEnding);
      
      setMeditation(meditationWithScript);
      setCurrentTab("preview");
      
      try {
        const response = await fetch(`/api/meditations/generate-audio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            meditationId: generatedMeditation.id || Date.now(),
            meditationScript: meditationScript.join(' '),
            voiceStyle: generatedMeditation.voiceStyle ? generatedMeditation.voiceStyle : 'calm-female', 
            duration: generatedMeditation.estimatedDuration || Math.round((generatedMeditation.repetitionCount || 3) * 1.5 + 2),
            backgroundMusic: generatedMeditation.backgroundMusic || 'gentle-piano',
            musicVolume: generatedMeditation.musicVolume || 50
          })
        });
        
        console.log("Premium voice generation request sent successfully to ElevenLabs API");
        
        if (response.ok) {
          const serverMeditation = await response.json();
          if (serverMeditation && serverMeditation.audioUrl) {
            console.log("Updated meditation with server audio URL:", serverMeditation.audioUrl);
            setMeditation({
              ...meditationWithScript,
              audioUrl: serverMeditation.audioUrl
            });
          }
        }
      } catch (error) {
        console.error("Error requesting premium voice generation:", error);
      }
        
    } catch (error) {
      console.error("Error in meditation generation process:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreMoodComplete = (moodData: {rating: number; tags: string[]}) => {
    setPreMoodData(moodData);
    setShowPreMoodCheckIn(false);
  };

  const handlePostMoodComplete = (moodData: {rating: number; tags: string[]}) => {
    // Update meditation with post-mood data
    if (meditation) {
      const updatedMeditation = {
        ...meditation,
        postMoodRating: moodData.rating,
        postMoodTags: moodData.tags
      };
      setMeditation(updatedMeditation);
    }
    setShowPostMoodCheckIn(false);
    setIsPlaying(false);
  };

  const handleStartMeditation = () => {
    setShowPreMoodCheckIn(true);
  };
  
  return (
    <div className="pb-10 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8 py-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 mb-3">
            Affirmation Studio
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            Create personalized meditation experiences with AI-powered voices, healing frequencies, and custom affirmations
          </p>
        </div>
        
        {/* Main Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-auto grid-cols-2 bg-background/70 backdrop-blur-sm border shadow-lg rounded-lg p-1">
              <TabsTrigger 
                value="customize" 
                className="px-6 py-3 text-base font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Create Meditation
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="px-6 py-3 text-base font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
              >
                Preview & Refine
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="customize" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    Design Your Perfect Meditation Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MeditationForm 
                    initialValues={meditation} 
                    onGenerate={handleGenerate} 
                    isGenerating={isGenerating}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-8">
              {meditation ? (
                <div className="max-w-6xl mx-auto">
                  {/* Audio Player Section */}
                  <Card className="bg-card/90 backdrop-blur-sm border-0 shadow-xl mb-8">
                    <CardHeader className="text-center">
                      <CardTitle className="text-3xl font-bold text-foreground mb-2">
                        {meditation.title}
                      </CardTitle>
                      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                          ~{meditation.estimatedDuration || Math.round((meditation.repetitionCount || 3) * 1.5 + 2)} minutes
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                          {meditation.purpose}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Quick Mood Check-in Button */}
                      <div className="mb-4 text-center">
                        <Button
                          onClick={handleStartMeditation}
                          variant="outline"
                          size="sm"
                          className="mb-3 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-green-200 text-green-700"
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Quick Mood Check-in
                        </Button>
                      </div>
                      
                      <AudioPlayer 
                        meditation={meditation} 
                        isPlaying={isPlaying} 
                        setIsPlaying={setIsPlaying}
                        onMeditationComplete={() => setShowPostMoodCheckIn(true)}
                      />
                    </CardContent>
                  </Card>

                  {/* Refinement Options Grid */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Script & Voice */}
                    <div className="space-y-6">
                      {/* Script Editor */}
                      <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-xl">Meditation Script</CardTitle>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (isEditingScript) {
                                  setMeditation({
                                    ...meditation,
                                    meditationScript: editableScript
                                  });
                                } else {
                                  setEditableScript(meditation.meditationScript || "");
                                }
                                setIsEditingScript(!isEditingScript);
                              }}
                              className="bg-background/50"
                            >
                              {isEditingScript ? "Save Changes" : "Edit Script"}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isEditingScript ? (
                            <div className="space-y-6 max-h-[400px] overflow-y-auto">
                              {/* Introduction Editing */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Introduction
                                  </h4>
                                  <Switch
                                    checked={editableIntroEnabled}
                                    onCheckedChange={setEditableIntroEnabled}
                                  />
                                </div>
                                {editableIntroEnabled && (
                                  <Textarea
                                    value={editableIntro}
                                    onChange={(e) => setEditableIntro(e.target.value)}
                                    className="min-h-[80px] bg-background/70"
                                    placeholder="Edit introduction..."
                                  />
                                )}
                              </div>

                              {/* Breathing Exercises Editing */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-green-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Breathing Exercises <span className="text-xs text-green-600">(once)</span>
                                  </h4>
                                  <Switch
                                    checked={editableBreathingEnabled}
                                    onCheckedChange={setEditableBreathingEnabled}
                                  />
                                </div>
                                {editableBreathingEnabled && (
                                  <Textarea
                                    value={editableBreathing}
                                    onChange={(e) => setEditableBreathing(e.target.value)}
                                    className="min-h-[100px] bg-background/70"
                                    placeholder="Edit breathing exercises..."
                                  />
                                )}
                              </div>

                              {/* Visualization Editing */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    Visualization <span className="text-xs text-purple-600">(once)</span>
                                  </h4>
                                  <Switch
                                    checked={editableVisualizationEnabled}
                                    onCheckedChange={setEditableVisualizationEnabled}
                                  />
                                </div>
                                {editableVisualizationEnabled && (
                                  <Textarea
                                    value={editableVisualization}
                                    onChange={(e) => setEditableVisualization(e.target.value)}
                                    className="min-h-[120px] bg-background/70"
                                    placeholder="Edit visualization content..."
                                  />
                                )}
                              </div>

                              {/* Affirmations Editing */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    Affirmations <span className="text-xs text-orange-600">(repeats {meditation.repetitionCount || 3}x)</span>
                                  </h4>
                                  <Switch
                                    checked={editableAffirmationsEnabled}
                                    onCheckedChange={setEditableAffirmationsEnabled}
                                  />
                                </div>
                                {editableAffirmationsEnabled && (
                                  <Textarea
                                    value={editableAffirmations}
                                    onChange={(e) => setEditableAffirmations(e.target.value)}
                                    className="min-h-[100px] bg-background/70"
                                    placeholder="Edit affirmations..."
                                  />
                                )}
                              </div>

                              {/* Ending Editing */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-indigo-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    Ending
                                  </h4>
                                  <Switch
                                    checked={editableEndingEnabled}
                                    onCheckedChange={setEditableEndingEnabled}
                                  />
                                </div>
                                {editableEndingEnabled && (
                                  <Textarea
                                    value={editableEnding}
                                    onChange={(e) => setEditableEnding(e.target.value)}
                                    className="min-h-[80px] bg-background/70"
                                    placeholder="Edit ending..."
                                  />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6 max-h-[400px] overflow-y-auto">
                              {/* Introduction */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Introduction
                                  </h4>
                                  <Switch
                                    checked={editableIntroEnabled}
                                    onCheckedChange={setEditableIntroEnabled}
                                  />
                                </div>
                                <div className={`p-3 bg-blue-50/70 rounded-lg text-sm leading-relaxed transition-all duration-200 ${editableIntroEnabled ? 'max-h-full opacity-100' : 'max-h-8 opacity-50 overflow-hidden'}`}>
                                  {editableIntroEnabled ? (
                                    meditation.scriptIntro || "Welcome to this peaceful meditation. Find a comfortable position and allow yourself to settle into this moment of tranquility."
                                  ) : (
                                    <div className="truncate">
                                      {(meditation.scriptIntro || "Welcome to this peaceful meditation. Find a comfortable position...").substring(0, 50)}...
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Breathing Exercises (Non-repeating) */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-green-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Breathing Exercises <span className="text-xs text-green-600">(once)</span>
                                  </h4>
                                  <Switch
                                    checked={editableBreathingEnabled}
                                    onCheckedChange={setEditableBreathingEnabled}
                                  />
                                </div>
                                <div className={`p-3 bg-green-50/70 rounded-lg text-sm leading-relaxed transition-all duration-200 ${editableBreathingEnabled ? 'max-h-full opacity-100' : 'max-h-8 opacity-50 overflow-hidden'}`}>
                                  {editableBreathingEnabled ? (
                                    <>
                                      Take a deep breath in through your nose, filling your lungs completely. Hold for a moment. And exhale slowly through your mouth, releasing any tension.
                                      <br/><br/>
                                      Let's establish a natural breathing rhythm. Breathe in for four counts: one, two, three, four. Hold for four counts: one, two, three, four. And exhale for six counts: one, two, three, four, five, six.
                                      <br/><br/>
                                      Continue this pattern. Inhale for four: one, two, three, four. Hold for four: one, two, three, four. Exhale for six: one, two, three, four, five, six.
                                      <br/><br/>
                                      Notice the natural pause between your inhale and exhale. In this space, find perfect stillness.
                                    </>
                                  ) : (
                                    <div className="truncate">
                                      Take a deep breath in through your nose, filling your lungs completely...
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Visualization (Non-repeating) */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-purple-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    Visualization <span className="text-xs text-purple-600">(once)</span>
                                  </h4>
                                  <Switch
                                    checked={editableVisualizationEnabled}
                                    onCheckedChange={setEditableVisualizationEnabled}
                                  />
                                </div>
                                <div className={`p-3 bg-purple-50/70 rounded-lg text-sm leading-relaxed transition-all duration-200 ${editableVisualizationEnabled ? 'max-h-full opacity-100' : 'max-h-8 opacity-50 overflow-hidden'}`}>
                                  {editableVisualizationEnabled ? (
                                    meditation.purpose === 'sleep' ? (
                                    <>
                                      Imagine yourself in a peaceful sanctuary where you feel completely safe and protected.
                                      <br/><br/>
                                      Visualize your body becoming heavier with each breath, like sinking into the softest cloud.
                                      <br/><br/>
                                      Picture any worries or thoughts of the day floating away like gentle leaves on a calm stream.
                                    </>
                                  ) : meditation.purpose === 'morning' ? (
                                    <>
                                      Imagine golden sunlight filling your body with warmth and energy.
                                      <br/><br/>
                                      Visualize yourself moving through your day with confidence and grace.
                                      <br/><br/>
                                      Picture the opportunities and possibilities that await you today.
                                    </>
                                  ) : meditation.purpose === 'focus' ? (
                                    <>
                                      Imagine your mind as a clear, still lake reflecting the sky perfectly.
                                      <br/><br/>
                                      Visualize a beam of focused light illuminating exactly what needs your attention.
                                      <br/><br/>
                                      Picture your thoughts becoming organized and crystal clear, like pieces falling into place.
                                    </>
                                  ) : meditation.purpose === 'confidence' ? (
                                    <>
                                      Imagine a warm, golden light growing stronger in your heart center, representing your inner strength.
                                      <br/><br/>
                                      Visualize yourself standing tall and confident, radiating self-assurance.
                                      <br/><br/>
                                      Picture past successes and achievements, feeling the pride and accomplishment they bring.
                                    </>
                                  ) : meditation.purpose === 'stress' ? (
                                    <>
                                      Imagine yourself in a peaceful place in nature where you feel completely relaxed.
                                      <br/><br/>
                                      Visualize stress and tension melting away from your body like warm wax.
                                      <br/><br/>
                                      Picture waves of calm washing over you, carrying away all worry and concern.
                                    </>
                                  ) : (
                                    <>
                                      Imagine yourself surrounded by a bubble of peace and tranquility.
                                      <br/><br/>
                                      Visualize your body becoming completely relaxed and at ease.
                                      <br/><br/>
                                      Picture your mind becoming as calm and clear as a mountain lake.
                                    </>
                                  )
                                  ) : (
                                    <div className="truncate">
                                      Imagine yourself in a peaceful sanctuary where you feel completely safe...
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Affirmations (Repeating) */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    Affirmations <span className="text-xs text-orange-600">(repeats {meditation.repetitionCount || 3}x with {meditation.pauseDuration || 2}s pauses)</span>
                                  </h4>
                                  <Switch
                                    checked={editableAffirmationsEnabled}
                                    onCheckedChange={setEditableAffirmationsEnabled}
                                  />
                                </div>
                                <div className={`p-3 bg-orange-50/70 rounded-lg text-sm leading-relaxed transition-all duration-200 ${editableAffirmationsEnabled ? 'max-h-full opacity-100' : 'max-h-8 opacity-50 overflow-hidden'}`}>
                                  {editableAffirmationsEnabled ? (
                                    meditation.selectedAffirmations && meditation.selectedAffirmations.length > 0 ? (
                                      <ul className="space-y-1">
                                        {meditation.selectedAffirmations.map((affirmationId: string, index: number) => {
                                          const affirmationText = affirmationOptions.find((a: any) => a.id === affirmationId)?.text || affirmationId;
                                          return (
                                            <li key={index} className="flex items-start gap-2">
                                              <span className="text-orange-500 mt-1">•</span>
                                              <span>{affirmationText}</span>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    ) : meditation.customAffirmations ? (
                                      <ul className="space-y-1">
                                        {meditation.customAffirmations.split(/[\n.]+/).filter(a => a.trim()).map((affirmation, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>{affirmation.trim()}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p className="text-orange-600 italic">No affirmations selected</p>
                                    )
                                  ) : (
                                    <div className="truncate">
                                      {meditation.selectedAffirmations && meditation.selectedAffirmations.length > 0 
                                        ? `${meditation.selectedAffirmations.length} affirmations selected...`
                                        : meditation.customAffirmations 
                                        ? "Custom affirmations added..."
                                        : "No affirmations selected"
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Ending */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-indigo-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    Ending
                                  </h4>
                                  <Switch
                                    checked={editableEndingEnabled}
                                    onCheckedChange={setEditableEndingEnabled}
                                  />
                                </div>
                                <div className={`p-3 bg-indigo-50/70 rounded-lg text-sm leading-relaxed transition-all duration-200 ${editableEndingEnabled ? 'max-h-full opacity-100' : 'max-h-8 opacity-50 overflow-hidden'}`}>
                                  {editableEndingEnabled ? (
                                    <>
                                      Take a moment to appreciate this peaceful state you've created. 
                                      <br/><br/>
                                      When you're ready, slowly begin to bring your awareness back to your surroundings.
                                      <br/><br/>
                                      Wiggle your fingers and toes, take a deep breath, and gently open your eyes, carrying this sense of peace with you into your day.
                                    </>
                                  ) : (
                                    <div className="truncate">
                                      Take a moment to appreciate this peaceful state you've created...
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Voice Selection */}
                      <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl">Voice Selection</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <VoicePreview
                            onVoiceSelect={(voiceId: string, voiceName: string, voiceURI?: string) => {
                              if (meditation) {
                                setMeditation({
                                  ...meditation,
                                  voiceStyle: voiceId,
                                  exactVoiceName: voiceName,
                                  exactVoiceURI: voiceURI || null
                                });
                              }
                            }}
                            preSelectedVoiceType="any"
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column - Duration & Music */}
                    <div className="space-y-6">
                      {/* Repetition Control */}
                      <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl">Meditation Structure</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-base font-medium mb-3 block">
                              Middle Section Repetitions: {meditation.repetitionCount || 3}
                            </Label>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-600">Repetitions</span>
                              <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                ~{Math.round(((meditation.repetitionCount || 3) * 1.5 + 2))} min total
                              </span>
                            </div>
                            <Slider
                              value={[meditation.repetitionCount || 3]}
                              onValueChange={(value) => {
                                if (meditation) {
                                  setMeditation({
                                    ...meditation,
                                    repetitionCount: value[0],
                                    estimatedDuration: Math.round(value[0] * 1.5 + 2)
                                  });
                                }
                              }}
                              max={20}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>1 rep</span>
                              <span>10 reps</span>
                              <span>20 reps</span>
                            </div>
                            <div className="text-sm text-slate-600 mt-3 p-2 bg-slate-50 rounded">
                              <strong>Structure:</strong> Intro → Middle (repeats {meditation.repetitionCount || 3}x) → Ending
                            </div>
                          </div>

                          {/* Pause Duration Control */}
                          <div>
                            <Label className="text-base font-medium mb-3 block">
                              Pause Between Repetitions: {meditation.pauseDuration || 2} seconds
                            </Label>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-600">Pause Duration</span>
                              <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                                {meditation.pauseDuration || 2}s between affirmations
                              </span>
                            </div>
                            <Slider
                              value={[meditation.pauseDuration || 2]}
                              onValueChange={(value) => {
                                if (meditation) {
                                  setMeditation({
                                    ...meditation,
                                    pauseDuration: value[0]
                                  });
                                }
                              }}
                              max={10}
                              min={0.5}
                              step={0.5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>0.5s</span>
                              <span>5s</span>
                              <span>10s</span>
                            </div>
                            <div className="text-sm text-slate-600 mt-3 p-2 bg-slate-50 rounded">
                              <strong>Cadence:</strong> Longer pauses create more contemplative rhythm, shorter pauses maintain flow
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Background Music */}
                      <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl">Background Music</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <MusicPreview 
                            onMusicSelect={(musicType: string, volume: number) => {
                              if (meditation) {
                                setMeditation({
                                  ...meditation,
                                  backgroundMusic: musicType,
                                  musicVolume: volume
                                });
                              }
                            }}
                            defaultMusic={meditation.backgroundMusic}
                            defaultVolume={meditation.musicVolume}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Regenerate Button */}
                  <div className="text-center mt-8">
                    <Button
                      onClick={() => {
                        if (meditation) {
                          handleGenerate(meditation);
                        }
                      }}
                      disabled={isGenerating}
                      size="lg"
                      className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                    >
                      {isGenerating ? "Regenerating..." : "Apply Changes & Regenerate"}
                    </Button>
                  </div>

                  {/* Meditation Details Summary */}
                  <Card className="bg-gradient-to-r from-muted/30 to-accent/10 border-0 shadow-lg mt-8">
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Voice Style</h4>
                          <p className="text-sm text-muted-foreground">
                            {voiceOptions.find(v => v.id === meditation.voiceStyle)?.name || 'Default Voice'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Background Music</h4>
                          <p className="text-sm text-muted-foreground">
                            {musicOptions.find(m => m.id === meditation.backgroundMusic)?.name || 'No Music'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Affirmations</h4>
                          <p className="text-sm text-muted-foreground">
                            {meditation.selectedAffirmations && meditation.selectedAffirmations.length > 0 
                              ? `${meditation.selectedAffirmations.length} selected affirmations`
                              : meditation.customAffirmations 
                              ? "Custom affirmations"
                              : "No affirmations"
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="text-center py-12">
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      No Meditation Created Yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first personalized meditation experience in the Customize tab.
                    </p>
                    <Button 
                      onClick={() => setCurrentTab("customize")}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Mood Check-in Components */}
      <MoodCheckIn
        onComplete={handlePreMoodComplete}
        type="pre"
        isVisible={showPreMoodCheckIn}
      />

      <MoodCheckIn
        onComplete={handlePostMoodComplete}
        type="post"
        isVisible={showPostMoodCheckIn}
      />
    </div>
  );
}