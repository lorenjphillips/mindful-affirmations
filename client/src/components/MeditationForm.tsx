import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMeditationSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Meditation, 
  purposeOptions, 
  voiceOptions, 
  musicOptions, 
  durationOptions, 
  affirmationOptions, 
  visualizationPrompts,
  meditationTypes,
  hypnosisTopics,
  storyThemes,
  lawOfAttractionGoals,
  breathingTechniques,
  bodyScanStyles,
  mindfulnessFocus
} from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

// Extend the schema for form validation
const formSchema = insertMeditationSchema.extend({
  title: z.string().min(1, "Title is required"),
  targetAudience: z.enum(["adult", "child"]).default("adult"),
  meditationTypes: z.array(z.string()).default([]),
  selectedAffirmations: z.array(z.string()).optional().default([]),
  customAffirmations: z.string().optional().default(""),
  visualizationPrompt: z.string().optional(),
  visualizationResponses: z.record(z.string()).optional().default({}),
  isNap: z.boolean().default(false),
  wakeFadeIn: z.boolean().default(false),
  // Add fields for exact voice control
  exactVoiceURI: z.string().optional(),
  exactVoiceName: z.string().optional()
});

interface MeditationFormProps {
  onGenerate: (meditation: Meditation) => void;
  initialValues?: Meditation | null;
  isGenerating: boolean;
}

export default function MeditationForm({ onGenerate, initialValues, isGenerating }: MeditationFormProps) {
  const { toast } = useToast();
  const [selectedVisualPrompt, setSelectedVisualPrompt] = useState<string>("");
  const [currentAudience, setCurrentAudience] = useState<"adult" | "child">("adult");
  const [showWakeFadeIn, setShowWakeFadeIn] = useState(false);
  
  // Get current visualization questions based on selected prompt
  const currentVisualizationQuestions = selectedVisualPrompt 
    ? visualizationPrompts.find(p => p.id === selectedVisualPrompt)?.questions || []
    : [];
  
  // Default values for the form
  const defaultValues = {
    title: initialValues?.title || "My Meditation",
    purpose: initialValues?.purpose || purposeOptions[0].id,
    targetAudience: initialValues?.targetAudience || "adult",
    meditationTypes: initialValues?.meditationTypes || [meditationTypes[0].id],

    selectedAffirmations: initialValues?.selectedAffirmations || [],
    customAffirmations: initialValues?.customAffirmations || "",
    visualizationPrompt: initialValues?.visualizationPrompt || "",
    visualizationResponses: initialValues?.visualizationResponses || {},
    
    // Default to calm female voice for adults, friendly wizard for children
    voiceStyle: initialValues?.voiceStyle || (currentAudience === "adult" ? "calm-female" : "friendly-wizard"),
    
    // Playback settings with sensible defaults
    backgroundMusic: initialValues?.backgroundMusic || "gentle-piano",
    musicVolume: initialValues?.musicVolume || 50,
    pauseDuration: initialValues?.pauseDuration || 2,
    autoRepeat: initialValues?.autoRepeat ?? true,
    fadeOut: initialValues?.fadeOut ?? false,
    isNap: initialValues?.isNap ?? false,
    wakeFadeIn: initialValues?.wakeFadeIn ?? false,
    
    // Exact voice control (for Web Speech API)
    exactVoiceURI: initialValues?.exactVoiceURI,
    exactVoiceName: initialValues?.exactVoiceName
  };
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Watch meditation types for conditional sections
  const watchedMeditationTypes = form.watch("meditationTypes") || [];

  // Set selected visualization prompt when the form changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "visualizationPrompt" && value.visualizationPrompt) {
        setSelectedVisualPrompt(value.visualizationPrompt as string);
      }
      
      if (name === "targetAudience" && value.targetAudience) {
        setCurrentAudience(value.targetAudience as "adult" | "child");
      }
      
      if (name === "isNap") {
        setShowWakeFadeIn(Boolean(value.isNap));
      }
    });
    
    // Initialize with current values
    const visualizationValue = form.getValues("visualizationPrompt");
    if (visualizationValue) {
      setSelectedVisualPrompt(visualizationValue);
    }
    
    const audienceValue = form.getValues("targetAudience");
    if (audienceValue) {
      setCurrentAudience(audienceValue as "adult" | "child");
    }
    
    const isNapValue = form.getValues("isNap");
    setShowWakeFadeIn(Boolean(isNapValue));
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Mutation for creating a meditation
  const createMeditation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/meditations", data);
      return response as Meditation;
    },
    onSuccess: (data: Meditation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/meditations'] });
      toast({
        title: "Meditation created",
        description: "Your meditation has been created successfully.",
      });
      onGenerate(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create meditation: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  function onSubmit(data: any) {
    // Check if custom affirmations is empty and no selected affirmations
    if ((!data.customAffirmations || data.customAffirmations.trim() === '') && 
        (!data.selectedAffirmations || data.selectedAffirmations.length === 0)) {
      toast({
        title: "Validation Error",
        description: "Please select at least one affirmation or add your own",
        variant: "destructive"
      });
      return;
    }
    
    // Add a title if one isn't provided
    if (!data.title || data.title.trim() === '') {
      const purpose = purposeOptions.find(p => p.id === data.purpose)?.name || 'My';
      const type = data.meditationTypes[0]
        ? meditationTypes.find(t => t.id === data.meditationTypes[0])?.name || 'Meditation'
        : 'Meditation';
      data.title = `${purpose} ${type}`;
    }
    
    // Execute the mutation
    createMeditation.mutate(data);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-lg font-semibold mb-4">Basic Options</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meditation Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your meditation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setCurrentAudience(value as "adult" | "child");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="adult">Adult</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {purposeOptions.map((purpose) => (
                        <SelectItem key={purpose.id} value={purpose.id}>
                          {purpose.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            

          </div>
        </div>
        
        {/* Meditation Types */}
        <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-5">
          <h3 className="text-lg font-medium mb-4">Meditation Type</h3>
          <FormField
            control={form.control}
            name="meditationTypes"
            render={({ field }) => (
              <FormItem>
                <div className="mb-2 text-sm text-neutral-600">
                  Select one or more meditation types (maximum 3)
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {meditationTypes.map((type) => (
                    <FormItem key={type.id} className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(type.id)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            
                            if (checked) {
                              // Only allow up to 3 selected types
                              if (currentValues.length < 3) {
                                field.onChange([...currentValues, type.id]);
                              } else {
                                toast({
                                  title: "Maximum reached",
                                  description: "You can select up to 3 meditation types",
                                  variant: "destructive"
                                });
                              }
                            } else {
                              // Don't allow removing the last type
                              if (currentValues.length > 1) {
                                field.onChange(currentValues.filter(value => value !== type.id));
                              } else {
                                toast({
                                  title: "Required",
                                  description: "At least one meditation type is required",
                                  variant: "destructive"
                                });
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-medium">{type.name}</FormLabel>
                        <div className="text-xs text-neutral-500">{type.description}</div>
                      </div>
                    </FormItem>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Type-Specific Customization Sections */}
        {watchedMeditationTypes.includes('hypno') && (
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-5">
            <h3 className="text-lg font-medium mb-4">Hypnosis Topic</h3>
            <FormField
              control={form.control}
              name="hypnosisTopic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Hypnosis Focus</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a hypnosis topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hypnosisTopics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          <div>
                            <div className="font-medium">{topic.name}</div>
                            <div className="text-xs text-neutral-500">{topic.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("hypnosisTopic") === "custom" && (
              <FormField
                control={form.control}
                name="customHypnosisTopic"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Custom Hypnosis Topic</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your custom hypnosis goal or focus area..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific about what you want to achieve through hypnosis
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {watchedMeditationTypes.includes('story') && (
          <div className="bg-green-50 rounded-lg border border-green-200 p-5">
            <h3 className="text-lg font-medium mb-4">Story Theme</h3>
            <FormField
              control={form.control}
              name="storyTheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Story Setting</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a story theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storyThemes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          <div>
                            <div className="font-medium">{theme.name}</div>
                            <div className="text-xs text-neutral-500">{theme.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("storyTheme") === "custom" && (
              <FormField
                control={form.control}
                name="customStoryTheme"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Custom Story Setting</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your ideal meditation story setting..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the environment, atmosphere, and narrative elements you prefer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {watchedMeditationTypes.includes('law-of-attraction') && (
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-5">
            <h3 className="text-lg font-medium mb-4">Manifestation Goal</h3>
            <FormField
              control={form.control}
              name="lawOfAttractionGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What Do You Want to Attract?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your manifestation goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lawOfAttractionGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          <div>
                            <div className="font-medium">{goal.name}</div>
                            <div className="text-xs text-neutral-500">{goal.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {watchedMeditationTypes.includes('breathing') && (
          <div className="bg-cyan-50 rounded-lg border border-cyan-200 p-5">
            <h3 className="text-lg font-medium mb-4">Breathing Technique</h3>
            <FormField
              control={form.control}
              name="breathingTechnique"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Breathing Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a breathing technique" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {breathingTechniques.map((technique) => (
                        <SelectItem key={technique.id} value={technique.id}>
                          <div>
                            <div className="font-medium">{technique.name}</div>
                            <div className="text-xs text-neutral-500">{technique.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {watchedMeditationTypes.includes('body-scan') && (
          <div className="bg-rose-50 rounded-lg border border-rose-200 p-5">
            <h3 className="text-lg font-medium mb-4">Body Scan Style</h3>
            <FormField
              control={form.control}
              name="bodyScanStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose Body Scan Approach</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select body scan style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bodyScanStyles.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          <div>
                            <div className="font-medium">{style.name}</div>
                            <div className="text-xs text-neutral-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {watchedMeditationTypes.includes('mindfulness') && (
          <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-5">
            <h3 className="text-lg font-medium mb-4">Mindfulness Focus</h3>
            <FormField
              control={form.control}
              name="mindfulnessFocus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Mindfulness Area</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose mindfulness focus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mindfulnessFocus.map((focus) => (
                        <SelectItem key={focus.id} value={focus.id}>
                          <div>
                            <div className="font-medium">{focus.name}</div>
                            <div className="text-xs text-neutral-500">{focus.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        {/* Affirmations Section */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-5">
          <h3 className="text-lg font-medium mb-4">Affirmations</h3>
          <div className="space-y-4">
            {/* Selected Affirmations with Compact Multi-Select */}
            <FormField
              control={form.control}
              name="selectedAffirmations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Choose Affirmations</FormLabel>
                  <div className="mb-2 text-sm text-neutral-600">
                    Select from our curated affirmations
                  </div>
                  
                  {/* Selected Affirmations Display */}
                  {field.value && field.value.length > 0 && (
                    <div className="mb-3 p-3 bg-white rounded-lg border">
                      <div className="text-sm font-medium text-blue-800 mb-2">
                        Selected ({field.value.length} affirmations):
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {field.value.map((affirmationId: string) => {
                          const affirmation = affirmationOptions.find(a => a.id === affirmationId);
                          return affirmation ? (
                            <div key={affirmationId} className="flex items-center justify-between text-sm bg-blue-50 px-2 py-1 rounded">
                              <span className="flex-1 mr-2">{affirmation.text}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentValues = field.value || [];
                                  field.onChange(currentValues.filter(id => id !== affirmationId));
                                }}
                                className="text-blue-600 hover:text-blue-800 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Dropdown to Add More Affirmations */}
                  <Select
                    onValueChange={(value) => {
                      const currentValues = field.value || [];
                      if (!currentValues.includes(value)) {
                        field.onChange([...currentValues, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Add an affirmation..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {affirmationOptions
                        .filter(affirmation => !field.value?.includes(affirmation.id))
                        .map((affirmation) => (
                          <SelectItem key={affirmation.id} value={affirmation.id}>
                            <div className="text-sm">
                              {affirmation.text}
                            </div>
                          </SelectItem>
                        ))}
                      {affirmationOptions.filter(affirmation => !field.value?.includes(affirmation.id)).length === 0 && (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          All affirmations selected
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {/* Quick Action Buttons */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Add 3 popular affirmations
                        const popularIds = affirmationOptions.slice(0, 3).map(a => a.id);
                        const currentValues = field.value || [];
                        const newValues = [...new Set([...currentValues, ...popularIds])];
                        field.onChange(newValues);
                      }}
                      className="text-xs"
                    >
                      Add Popular (3)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.onChange([])}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Custom Affirmations */}
            <FormField
              control={form.control}
              name="customAffirmations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Add Your Own Affirmations</FormLabel>
                  <div className="mb-2 text-sm text-neutral-600">
                    Add one affirmation per line (max 10)
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your own affirmations here, one per line"
                      className="min-h-[100px]"
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
                        if (lines.length <= 10) {
                          field.onChange(e.target.value);
                        } else {
                          // Truncate to 10 lines if more are entered
                          field.onChange(lines.slice(0, 10).join('\n'));
                          toast({
                            title: "Maximum reached",
                            description: "You can add up to 10 custom affirmations",
                            variant: "destructive"
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Visualization Section */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-5 mb-6">
          <h3 className="text-lg font-medium mb-4">Visualization</h3>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="visualizationPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visualization Setting</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      setSelectedVisualPrompt(value);
                      field.onChange(value);
                    }} 
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a visualization setting (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No visualization</SelectItem>
                      {visualizationPrompts.map(prompt => (
                        <SelectItem key={prompt.id} value={prompt.id}>{prompt.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a setting to include guided visualization in your meditation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedVisualPrompt && currentVisualizationQuestions.map((question, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`visualizationResponses.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{question}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a response or leave blank for default" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="default">Use default response</SelectItem>
                        {visualizationPrompts.find(p => p.id === selectedVisualPrompt)?.suggestions?.[index]?.map((suggestion, i) => (
                          suggestion ? <SelectItem key={i} value={suggestion}>{suggestion}</SelectItem> : null
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Meditation Structure Control */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-5">
          <h3 className="text-lg font-medium mb-4">Meditation Structure</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="repetitionCount"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-base font-medium">
                            Middle Section Repetitions: {field.value || 3}
                          </FormLabel>
                          <span className="text-sm text-slate-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                            ~{Math.round(((field.value || 3) * 1.5 + 2))} min total
                          </span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value || 3]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={20}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1 repetition</span>
                          <span>10 repetitions</span>
                          <span>20 repetitions</span>
                        </div>
                        <div className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                          <strong>Structure:</strong> Intro → Middle (repeats {field.value || 3}x) → Ending
                        </div>
                      </div>
                    </div>
                    <FormDescription>
                      The middle section contains your affirmations and will repeat to fill the desired meditation length. More repetitions create longer, deeper sessions.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Pause Duration Control */}
            <FormField
              control={form.control}
              name="pauseDuration"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-medium">
                        Pause Between Repetitions: {field.value || 2} seconds
                      </FormLabel>
                      <span className="text-sm text-slate-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                        {field.value || 2}s between affirmations
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        value={[field.value || 2]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={10}
                        min={0.5}
                        step={0.5}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.5s (fast)</span>
                      <span>5s (medium)</span>
                      <span>10s (slow)</span>
                    </div>
                    <div className="text-sm text-slate-600 p-2 bg-slate-50 rounded">
                      <strong>Cadence:</strong> Longer pauses create more contemplative rhythm, shorter pauses maintain flow
                    </div>
                  </div>
                  <FormDescription>
                    Controls the silence between each affirmation repetition. Adjust based on your preference for reflection time.
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Note: Voice & Music settings have been moved to the preview page */}
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Meditation...
            </span>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Generate Meditation
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}