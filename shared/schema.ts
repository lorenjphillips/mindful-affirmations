import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Meditation schema
export const meditations = pgTable("meditations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  purpose: text("purpose").notNull(),
  targetAudience: text("target_audience").default("adult"),
  // Meditation type(s) as JSON array of IDs
  meditationTypes: json("meditation_types").$type<string[]>().default([]),
  // For storing selected affirmation IDs as a JSON array
  selectedAffirmations: json("selected_affirmations").$type<string[]>().default([]),
  // For storing custom affirmations
  customAffirmations: text("custom_affirmations").default(""),
  // Voice selection fields
  exactVoiceURI: text("exact_voice_uri"),
  exactVoiceName: text("exact_voice_name"),
  // For storing visualization prompt ID
  visualizationPrompt: text("visualization_prompt"),
  // For storing custom visualization responses
  visualizationResponses: json("visualization_responses").$type<Record<string, string>>().default({}),
  // For storing the full meditation script/transcript
  meditationScript: text("meditation_script").default(""),
  // For storing user-edited transcript
  transcript: text("transcript").default(""),
  voiceStyle: text("voice_style").notNull(),
  backgroundMusic: text("background_music").notNull(),
  musicVolume: integer("music_volume").notNull(),

  pauseDuration: integer("pause_duration").notNull().default(2),
  autoRepeat: boolean("auto_repeat").notNull().default(true),
  fadeOut: boolean("fade_out").notNull().default(false),
  wakeFadeIn: boolean("wake_fade_in").notNull().default(false),
  isNap: boolean("is_nap").notNull().default(false),
  audioUrl: text("audio_url"),
  // Structured meditation fields
  scriptIntro: text("script_intro"),
  scriptMiddle: text("script_middle").array(),
  scriptEnding: text("script_ending"),
  repetitionCount: integer("repetition_count").default(3),
  
  // Type-specific customization fields
  hypnosisTopic: text("hypnosis_topic"),
  customHypnosisTopic: text("custom_hypnosis_topic"),
  storyTheme: text("story_theme"),
  customStoryTheme: text("custom_story_theme"),
  lawOfAttractionGoal: text("law_of_attraction_goal"),
  breathingTechnique: text("breathing_technique"),
  bodyScanStyle: text("body_scan_style"),
  mindfulnessFocus: text("mindfulness_focus"),
  
  estimatedDuration: integer("estimated_duration"),
  
  // Mood tracking fields
  preMoodRating: integer("pre_mood_rating"), // 1-5 scale
  preMoodTags: json("pre_mood_tags").$type<string[]>().default([]), // mood descriptors
  postMoodRating: integer("post_mood_rating"), // 1-5 scale  
  postMoodTags: json("post_mood_tags").$type<string[]>().default([]), // mood descriptors
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMeditationSchema = createInsertSchema(meditations).omit({
  id: true,
  createdAt: true,
});

export type InsertMeditation = z.infer<typeof insertMeditationSchema>;
export type Meditation = typeof meditations.$inferSelect;

// Voice options with enhanced descriptions and character details (Updated with real ElevenLabs voices)
export const voiceOptions = [
  // Adult Female voices (Verified ElevenLabs voices)
  { 
    id: "calm-female", 
    name: "Sarah - Calm & Serene", 
    description: "Gentle, nurturing feminine voice perfect for deep relaxation and sleep meditations. Warm and comforting tone that melts away stress.",
    gender: "female", 
    audience: "adult",
    elevenLabsId: "EXAVITQu4vr4xnSDxMaL",
    benefits: ["Deep relaxation", "Stress relief", "Sleep preparation", "Emotional healing"]
  },
  { 
    id: "motivational-female", 
    name: "Aria - Energetic & Inspiring", 
    description: "Confident, inspiring feminine voice that energizes and motivates. Perfect for morning affirmations and confidence building.",
    gender: "female", 
    audience: "adult",
    elevenLabsId: "9BWtsMINqrJLrRacOk9x",
    benefits: ["Confidence boost", "Morning energy", "Motivation", "Self-empowerment"]
  },
  { 
    id: "whisper-female", 
    name: "Charlotte - Soft & Gentle", 
    description: "Soft, intimate feminine whisper that creates a sacred, peaceful atmosphere. Ideal for deep meditation and mindfulness practice.",
    gender: "female", 
    audience: "adult",
    elevenLabsId: "XB0fDUnXU5powFXDhCwa",
    benefits: ["Deep meditation", "Mindfulness", "Inner peace", "Spiritual connection"]
  },
  { 
    id: "young-female", 
    name: "Alice - Youthful & Fresh", 
    description: "Bright, youthful feminine voice that brings lightness and joy. Perfect for morning meditations and positive affirmations.",
    gender: "female", 
    audience: "adult",
    elevenLabsId: "Xb7hH8MSUJpSbSDYk0k2",
    benefits: ["Youthful energy", "Joy", "Positivity", "Fresh perspective"]
  },
  { 
    id: "mature-female", 
    name: "Jessica - Mature & Wise", 
    description: "Professional, therapeutic feminine tone with clinical warmth. Perfect for anxiety relief and emotional healing sessions.",
    gender: "female", 
    audience: "adult",
    elevenLabsId: "cgSgspJ2msm6clMCkdW9",
    benefits: ["Anxiety relief", "Emotional healing", "Trauma recovery", "Therapeutic support"]
  },
  
  // Adult Male voices (Verified ElevenLabs voices)
  { 
    id: "calm-male", 
    name: "George - Deep & Grounding", 
    description: "Deep, grounding masculine voice that provides stability and calm. Excellent for stress relief and centering practices.",
    gender: "male", 
    audience: "adult",
    elevenLabsId: "JBFqnCBsd6RMkjVDRZzb",
    benefits: ["Grounding", "Stress relief", "Stability", "Inner strength"]
  },
  { 
    id: "motivational-male", 
    name: "Brian - Strong & Inspiring", 
    description: "Strong, inspiring masculine voice that builds confidence and determination. Perfect for goal-setting and achievement meditations.",
    gender: "male", 
    audience: "adult",
    elevenLabsId: "nPczCjzI2devNBz1zQrb",
    benefits: ["Leadership", "Goal achievement", "Confidence", "Determination"]
  },
  { 
    id: "whisper-male", 
    name: "Liam - Soft & Caring", 
    description: "Soft, caring masculine whisper that creates intimacy and trust. Ideal for vulnerability and self-compassion work.",
    gender: "male", 
    audience: "adult",
    elevenLabsId: "TX3LPaxmHKxFdv7VOQHJ",
    benefits: ["Self-compassion", "Vulnerability", "Trust", "Emotional safety"]
  },
  { 
    id: "mature-male", 
    name: "Will - Mature & Wise", 
    description: "Mature, wise masculine voice with years of experience. Perfect for life guidance and philosophical meditations.",
    gender: "male", 
    audience: "adult",
    elevenLabsId: "bIHbv24MWmeRgasZH58o",
    benefits: ["Wisdom", "Life guidance", "Philosophy", "Deep insight"]
  },
  
  // Neutral voice option
  { 
    id: "neutral", 
    name: "River - Neutral & Balanced", 
    description: "Gender-neutral voice that provides balance and inclusivity. Perfect for universal meditation experiences.",
    gender: "neutral", 
    audience: "adult",
    elevenLabsId: "SAz9YHcvj6GT2YYXdXww",
    benefits: ["Inclusivity", "Balance", "Universal appeal", "Non-binary comfort"]
  },
  
  // Child-friendly character voices (Using available ElevenLabs voices)
  { 
    id: "friendly-wizard", 
    name: "Chris - Friendly Wizard", 
    description: "Magical and wise storytelling voice that makes meditation feel like an enchanted adventure. Sparks imagination and wonder.",
    gender: "male", 
    audience: "child",
    elevenLabsId: "iP95p4xoKVk53GoZ742B",
    benefits: ["Imagination", "Wonder", "Magic", "Storytelling"]
  },
  { 
    id: "fairy-godmother", 
    name: "Lily - Fairy Godmother", 
    description: "Sweet, enchanting fairy voice that guides children through magical meditation journeys. Gentle and protective energy.",
    gender: "female", 
    audience: "child",
    elevenLabsId: "pFZP5JQG7iQjIQuC4Bku",
    benefits: ["Magic", "Protection", "Gentleness", "Wonder"]
  },
  { 
    id: "superhero", 
    name: "Daniel - Super Hero", 
    description: "Confident, brave superhero voice that empowers children and builds inner strength. Teaches that real superpowers come from within.",
    gender: "male", 
    audience: "child",
    elevenLabsId: "onwK4e9ZLuTAKqWW03F9",
    benefits: ["Inner strength", "Confidence", "Bravery", "Self-empowerment"]
  },
  // Additional available ElevenLabs voices
  { 
    id: "laura", 
    name: "Laura - Elegant & Refined", 
    description: "Sophisticated, articulate feminine voice perfect for guided meditations and mindfulness practices.",
    gender: "female", 
    audience: "adult",
    elevenLabsId: "FGY2WhTYpPnrIDTdsKH5",
    benefits: ["Sophistication", "Clarity", "Mindfulness", "Elegance"]
  },
  { 
    id: "charlie", 
    name: "Charlie - Friendly & Approachable", 
    description: "Warm, friendly masculine voice that creates a welcoming meditation atmosphere.",
    gender: "male", 
    audience: "adult",
    elevenLabsId: "IKne3meq5aSn9XLyUdCD",
    benefits: ["Friendliness", "Warmth", "Approachability", "Comfort"]
  },
  { 
    id: "callum", 
    name: "Callum - Rich & Resonant", 
    description: "Deep, rich masculine voice with excellent resonance for meditation and relaxation.",
    gender: "male", 
    audience: "adult",
    elevenLabsId: "N2lVS1w4EtoT3dr4eOWO",
    benefits: ["Deep resonance", "Relaxation", "Grounding", "Authority"]
  },
  { 
    id: "matilda", 
    name: "Matilda - Gentle & Nurturing", 
    description: "Gentle, nurturing feminine voice ideal for healing and therapeutic meditations.",
    gender: "female", 
    audience: "adult",
    elevenLabsId: "XrExE9yKIg1WjnnlVkGX",
    benefits: ["Nurturing", "Healing", "Therapeutic", "Gentleness"]
  }

  /* DISABLED - Voice cloning and family voices require custom implementation
  // Family voices for children
  { 
    id: "mom-voice", 
    name: "Loving Mama", 
    description: "Warm, nurturing motherly voice that provides unconditional love and safety. Perfect for bedtime stories and comfort meditations.",
    gender: "female", 
    audience: "child", 
    family: true,
    benefits: ["Unconditional love", "Safety", "Nurturing", "Bedtime comfort"]
  },
  
  // AI Voice Cloning Options (Premium Feature)
  { 
    id: "clone-parent-voice", 
    name: "Your Own Voice", 
    description: "Clone your own voice to create the most personal meditation experience for your child. Upload a 2-minute audio sample to create a custom voice.",
    gender: "any", 
    audience: "child", 
    family: true,
    premium: true,
    voiceCloning: true,
    benefits: ["Ultimate personalization", "Parent's actual voice", "Deep bonding", "Familiar comfort"]
  }
  */
];

// Background music options with detailed benefits
export const musicOptions = [
  // Basic Options
  { 
    id: "none", 
    name: "No Background Music", 
    description: "Pure voice meditation without any background sounds",
    category: "None"
  },
  
  // Traditional Music
  { 
    id: "gentle-piano", 
    name: "Gentle Piano", 
    description: "Soft, calming piano melodies to ease tension and promote relaxation",
    category: "Traditional",
    benefits: ["Stress relief", "Emotional healing", "Mental clarity"]
  },
  { 
    id: "nature-sounds", 
    name: "Nature Sounds", 
    description: "Forest sounds, birds, and flowing water to connect with natural tranquility",
    category: "Nature",
    benefits: ["Grounding", "Stress reduction", "Natural healing"]
  },
  { 
    id: "ocean-waves", 
    name: "Ocean Waves", 
    description: "Rhythmic ocean sounds for deep relaxation and sleep preparation",
    category: "Nature",
    benefits: ["Deep relaxation", "Sleep induction", "Anxiety relief"]
  },
  { 
    id: "singing-bowls", 
    name: "Tibetan Singing Bowls", 
    description: "Ancient healing sounds that balance chakras and clear energy blockages",
    category: "Sound Healing",
    benefits: ["Chakra balancing", "Energy clearing", "Spiritual awakening"]
  },
  { 
    id: "rain", 
    name: "Gentle Rain", 
    description: "Soft rainfall sounds that mask distractions and induce calm",
    category: "Nature",
    benefits: ["Focus enhancement", "Sleep aid", "Stress relief"]
  },
  
  // Binaural Beats & Brainwave Entrainment
  { 
    id: "delta-waves", 
    name: "Delta Waves (0.5-4 Hz)", 
    description: "Deepest sleep and healing frequencies for physical restoration",
    category: "Brainwave Entrainment",
    benefits: ["Deep sleep", "Physical healing", "Immune system boost", "Pain relief"]
  },
  { 
    id: "theta-waves", 
    name: "Theta Waves (4-8 Hz)", 
    description: "Deep meditation and creativity frequencies for subconscious access",
    category: "Brainwave Entrainment",
    benefits: ["Deep meditation", "Creativity boost", "Memory enhancement", "Emotional healing"]
  },
  { 
    id: "alpha-waves", 
    name: "Alpha Waves (8-14 Hz)", 
    description: "Relaxed awareness state for learning and light meditation",
    category: "Brainwave Entrainment",
    benefits: ["Relaxed focus", "Learning enhancement", "Stress reduction", "Mental clarity"]
  },
  { 
    id: "beta-waves", 
    name: "Beta Waves (14-30 Hz)", 
    description: "Alert concentration frequencies for mental performance",
    category: "Brainwave Entrainment",
    benefits: ["Mental alertness", "Focus enhancement", "Problem solving", "Productivity"]
  },
  { 
    id: "gamma-waves", 
    name: "Gamma Waves (30-100 Hz)", 
    description: "High-level cognitive processing for peak mental performance",
    category: "Brainwave Entrainment",
    benefits: ["Peak focus", "Enhanced awareness", "Information processing", "Mental clarity"]
  },
  
  // Solfeggio Frequencies (Ancient Healing Tones)
  { 
    id: "174hz", 
    name: "174 Hz - Foundation", 
    description: "Reduces pain and stress, provides sense of security and grounding",
    category: "Solfeggio Frequencies",
    benefits: ["Pain relief", "Stress reduction", "Grounding", "Security"]
  },
  { 
    id: "285hz", 
    name: "285 Hz - Healing", 
    description: "Promotes cellular healing and tissue regeneration",
    category: "Solfeggio Frequencies",
    benefits: ["Cellular healing", "Tissue repair", "Physical recovery", "Immune boost"]
  },
  { 
    id: "396hz", 
    name: "396 Hz - Liberation", 
    description: "Releases fear, guilt, and trauma from the subconscious mind",
    category: "Solfeggio Frequencies",
    benefits: ["Fear release", "Guilt liberation", "Trauma healing", "Emotional freedom"]
  },
  { 
    id: "417hz", 
    name: "417 Hz - Change", 
    description: "Facilitates positive change and breaks negative thought patterns",
    category: "Solfeggio Frequencies",
    benefits: ["Positive change", "Pattern breaking", "Mental clearing", "New beginnings"]
  },
  { 
    id: "528hz", 
    name: "528 Hz - Love/Miracle", 
    description: "The 'Love Frequency' for DNA repair, transformation, and miracles",
    category: "Solfeggio Frequencies",
    benefits: ["DNA repair", "Love enhancement", "Transformation", "Miracle manifestation"]
  },
  { 
    id: "639hz", 
    name: "639 Hz - Connection", 
    description: "Harmonizes relationships and enhances communication",
    category: "Solfeggio Frequencies",
    benefits: ["Relationship harmony", "Enhanced communication", "Heart opening", "Social connection"]
  },
  { 
    id: "741hz", 
    name: "741 Hz - Expression", 
    description: "Awakens intuition and promotes self-expression",
    category: "Solfeggio Frequencies",
    benefits: ["Intuition awakening", "Self-expression", "Truth speaking", "Creative flow"]
  },
  { 
    id: "852hz", 
    name: "852 Hz - Intuition", 
    description: "Opens third eye and enhances spiritual insight",
    category: "Solfeggio Frequencies",
    benefits: ["Third eye opening", "Spiritual insight", "Psychic abilities", "Higher awareness"]
  },
  { 
    id: "963hz", 
    name: "963 Hz - Unity", 
    description: "Connects to universal consciousness and divine wisdom",
    category: "Solfeggio Frequencies",
    benefits: ["Divine connection", "Universal consciousness", "Enlightenment", "Spiritual awakening"]
  },
  
  // Specialized Frequencies
  { 
    id: "432hz", 
    name: "432 Hz - Natural Tuning", 
    description: "Natural harmonic frequency that resonates with Earth's vibration",
    category: "Special Frequencies",
    benefits: ["Natural harmony", "Earth connection", "Deep relaxation", "Cellular resonance"]
  },
  { 
    id: "40hz", 
    name: "40 Hz - Gamma Focus", 
    description: "Enhanced cognitive function and neural synchronization",
    category: "Special Frequencies",
    benefits: ["Cognitive enhancement", "Neural sync", "Memory boost", "Learning acceleration"]
  },
  
  // Targeted Binaural Beats
  { 
    id: "binaural-focus", 
    name: "Focus Enhancement (10-15 Hz)", 
    description: "Beta binaural beats for sustained concentration and mental clarity",
    category: "Binaural Beats",
    benefits: ["Sustained focus", "Mental clarity", "Productivity boost", "Attention enhancement"]
  },
  { 
    id: "binaural-sleep", 
    name: "Deep Sleep Induction (2-5 Hz)", 
    description: "Delta binaural beats for natural sleep onset and deeper rest",
    category: "Binaural Beats",
    benefits: ["Sleep induction", "Deeper rest", "Dream enhancement", "Recovery boost"]
  },
  { 
    id: "binaural-meditation", 
    name: "Meditation Enhancement (6-10 Hz)", 
    description: "Theta-Alpha binaural beats for effortless meditative states",
    category: "Binaural Beats",
    benefits: ["Effortless meditation", "Deeper states", "Spiritual connection", "Inner peace"]
  },
  { 
    id: "binaural-creativity", 
    name: "Creative Flow (7-9 Hz)", 
    description: "Theta binaural beats to unlock artistic and innovative thinking",
    category: "Binaural Beats",
    benefits: ["Creative breakthrough", "Artistic flow", "Innovation", "Inspiration"]
  },
  { 
    id: "binaural-anxiety", 
    name: "Anxiety Relief (8-10 Hz)", 
    description: "Alpha binaural beats specifically tuned for calming anxious thoughts",
    category: "Binaural Beats",
    benefits: ["Anxiety reduction", "Calm mind", "Emotional balance", "Peace"]
  },
  { 
    id: "binaural-confidence", 
    name: "Confidence Boost (10-12 Hz)", 
    description: "Alpha-Beta binaural beats for self-assurance and inner strength",
    category: "Binaural Beats",
    benefits: ["Self-confidence", "Inner strength", "Assertiveness", "Self-esteem"]
  }
];

// Purpose options
export const purposeOptions = [
  { id: "sleep", name: "Sleep", icon: "moon" },
  { id: "morning", name: "Morning", icon: "sun" },
  { id: "focus", name: "Focus", icon: "target" },
  { id: "confidence", name: "Confidence", icon: "heart" },
  { id: "stress", name: "Stress Relief", icon: "smile" },
  { id: "meeting", name: "Meeting Prep", icon: "presentation" }
];

// Meditation types for more customization
export const meditationTypes = [
  { id: 'affirmations', name: 'Affirmations', description: 'Positive statements to boost mindset and confidence' },
  { id: 'story', name: 'Story Meditation', description: 'Narrative journey to guide your mind to relaxation' },
  { id: 'visualization', name: 'Visualization', description: 'Guided imagery to manifest your goals' },
  { id: 'law-of-attraction', name: 'Law of Attraction', description: 'Focus on attracting positive outcomes and abundance' },
  { id: 'hypno', name: 'Hypnotherapy', description: 'Gentle hypnotic suggestions for deeper transformation' },
  { id: 'breathing', name: 'Breathing Exercise', description: 'Focused breath work for immediate calm' },
  { id: 'body-scan', name: 'Body Scan', description: 'Progressive relaxation through body awareness' },
  { id: 'mindfulness', name: 'Mindfulness', description: 'Present moment awareness practice' },
];

// Hypnosis topics for the hypnotherapy meditation type
export const hypnosisTopics = [
  { id: "confidence", name: "Confidence Building", description: "Develop unshakeable self-confidence and inner strength" },
  { id: "weight-loss", name: "Weight Loss", description: "Healthy eating habits and sustainable weight management" },
  { id: "smoking-cessation", name: "Stop Smoking", description: "Break free from smoking addiction naturally" },
  { id: "anxiety-relief", name: "Anxiety Relief", description: "Calm your mind and reduce overwhelming worry" },
  { id: "sleep-improvement", name: "Better Sleep", description: "Deep, restful sleep patterns and insomnia relief" },
  { id: "pain-management", name: "Pain Management", description: "Natural pain relief and comfort techniques" },
  { id: "focus-concentration", name: "Focus & Concentration", description: "Enhanced mental clarity and sustained attention" },
  { id: "stress-reduction", name: "Stress Reduction", description: "Release tension and find inner peace" },
  { id: "self-healing", name: "Self-Healing", description: "Support your body's natural healing processes" },
  { id: "memory-improvement", name: "Memory Enhancement", description: "Boost recall and mental sharpness" },
  { id: "creativity", name: "Creativity Boost", description: "Unlock your creative potential and innovation" },
  { id: "public-speaking", name: "Public Speaking", description: "Overcome speaking fears and build confidence" },
  { id: "motivation", name: "Motivation & Drive", description: "Increase energy, determination and goal achievement" },
  { id: "relationship-healing", name: "Relationship Healing", description: "Improve connections and communication with others" },
  { id: "abundance-mindset", name: "Abundance Mindset", description: "Attract prosperity, success and opportunities" },
  { id: "custom", name: "Custom Topic", description: "Create your own personalized hypnosis session" }
];

// Story themes for story meditation type
export const storyThemes = [
  { id: "enchanted-forest", name: "Enchanted Forest", description: "Journey through magical woodland with mystical creatures" },
  { id: "ocean-adventure", name: "Ocean Adventure", description: "Underwater exploration with dolphins and sea life" },
  { id: "mountain-retreat", name: "Mountain Retreat", description: "Peaceful cabin in snow-capped mountains" },
  { id: "desert-oasis", name: "Desert Oasis", description: "Finding tranquility in a hidden desert sanctuary" },
  { id: "space-journey", name: "Space Journey", description: "Floating among stars and exploring distant galaxies" },
  { id: "garden-sanctuary", name: "Garden Sanctuary", description: "Secret garden filled with blooming flowers and butterflies" },
  { id: "ancient-temple", name: "Ancient Temple", description: "Discovering wisdom in a sacred, mystical temple" },
  { id: "floating-clouds", name: "Floating on Clouds", description: "Drifting peacefully through soft, white clouds" },
  { id: "custom", name: "Custom Story", description: "Create your own unique meditation story" }
];

// Law of Attraction goal categories
export const lawOfAttractionGoals = [
  { id: "financial-abundance", name: "Financial Abundance", description: "Attract wealth, prosperity, and financial freedom" },
  { id: "perfect-relationship", name: "Perfect Relationship", description: "Manifest your ideal romantic partner and relationship" },
  { id: "dream-career", name: "Dream Career", description: "Attract your perfect job and professional success" },
  { id: "vibrant-health", name: "Vibrant Health", description: "Manifest optimal health and physical vitality" },
  { id: "inner-peace", name: "Inner Peace", description: "Attract tranquility, balance, and emotional wellness" },
  { id: "creative-success", name: "Creative Success", description: "Manifest artistic recognition and creative fulfillment" },
  { id: "spiritual-growth", name: "Spiritual Growth", description: "Attract deeper spiritual connection and enlightenment" },
  { id: "family-harmony", name: "Family Harmony", description: "Manifest loving, supportive family relationships" },
  { id: "travel-adventure", name: "Travel & Adventure", description: "Attract exciting travel opportunities and experiences" },
  { id: "personal-transformation", name: "Personal Transformation", description: "Manifest your highest potential and best self" },
  { id: "custom", name: "Custom Goal", description: "Manifest your own specific desires and intentions" }
];

// Breathing techniques for breathing meditation type
export const breathingTechniques = [
  { id: "4-7-8", name: "4-7-8 Breathing", description: "Inhale 4, hold 7, exhale 8 - perfect for relaxation and sleep" },
  { id: "box-breathing", name: "Box Breathing", description: "Equal counts for inhale, hold, exhale, hold - builds focus" },
  { id: "coherent-breathing", name: "Coherent Breathing", description: "5-second inhale, 5-second exhale - balances nervous system" },
  { id: "belly-breathing", name: "Belly Breathing", description: "Deep diaphragmatic breathing for stress relief" },
  { id: "alternate-nostril", name: "Alternate Nostril", description: "Traditional pranayama technique for mental clarity" },
  { id: "three-part-breath", name: "Three-Part Breath", description: "Belly, ribs, chest breathing for complete relaxation" },
  { id: "energizing-breath", name: "Energizing Breath", description: "Quick, rhythmic breathing to boost energy and alertness" },
  { id: "calming-breath", name: "Calming Breath", description: "Slow, gentle breathing to reduce anxiety and stress" }
];

// Body scan styles for body scan meditation type
export const bodyScanStyles = [
  { id: "progressive-relaxation", name: "Progressive Relaxation", description: "Systematic tension and release through each muscle group" },
  { id: "mindful-awareness", name: "Mindful Awareness", description: "Gentle observation of sensations without changing anything" },
  { id: "healing-light", name: "Healing Light", description: "Visualizing warm, healing light flowing through your body" },
  { id: "gratitude-scan", name: "Gratitude Body Scan", description: "Appreciating and thanking each part of your body" },
  { id: "energy-flow", name: "Energy Flow", description: "Sensing and directing energy currents throughout your body" },
  { id: "release-tension", name: "Tension Release", description: "Identifying and releasing areas of stored stress and tension" },
  { id: "body-appreciation", name: "Body Appreciation", description: "Cultivating love and acceptance for your physical form" }
];

// Mindfulness focus areas for mindfulness meditation type
export const mindfulnessFocus = [
  { id: "breath-awareness", name: "Breath Awareness", description: "Focusing attention on the natural rhythm of breathing" },
  { id: "present-moment", name: "Present Moment", description: "Anchoring awareness in the here and now" },
  { id: "thoughts-emotions", name: "Thoughts & Emotions", description: "Observing mental activity without judgment" },
  { id: "body-sensations", name: "Body Sensations", description: "Mindful awareness of physical sensations and feelings" },
  { id: "sounds-environment", name: "Sounds & Environment", description: "Listening mindfully to surrounding sounds" },
  { id: "loving-kindness", name: "Loving Kindness", description: "Cultivating compassion for self and others" },
  { id: "open-awareness", name: "Open Awareness", description: "Spacious, choiceless awareness of whatever arises" },
  { id: "walking-meditation", name: "Walking Meditation", description: "Mindful movement and walking practice" }
];

// Duration options
export const durationOptions = [
  { id: 5, name: "5 minutes" },
  { id: 10, name: "10 minutes" },
  { id: 15, name: "15 minutes" },
  { id: 20, name: "20 minutes" },
  { id: 30, name: "30 minutes" },
  { id: 45, name: "45 minutes" },
  { id: 60, name: "1 hour" }
];

// Visualization prompts to help guide meditation
export const visualizationPrompts = [
  { 
    id: "peaceful-place",
    title: "Peaceful Place", 
    questions: [
      "Imagine a place where you feel completely at peace. What does it look like?",
      "What sounds can you hear in this peaceful place?",
      "What does the air feel like on your skin?",
      "Are there any scents or smells in this environment?",
      "How does the ground feel beneath you?"
    ],
    suggestions: [
      // Place appearance suggestions
      [
        "A secluded beach with soft white sand and gentle turquoise waves",
        "A sunlit meadow filled with wildflowers and surrounded by ancient trees",
        "A cozy cabin in a snow-covered forest with a crackling fireplace",
        "A tranquil Japanese garden with a koi pond and stone pathways",
        "A misty mountain top above the clouds at sunrise",
        "A secret garden enclosed by ivy-covered walls and blooming roses",
        "A serene lakeside dock surrounded by pine trees at sunset",
        "A peaceful library filled with old books and comfortable reading nooks",
        "A desert oasis with palm trees and a crystal-clear natural pool",
        "A floating cloud palace in a bright blue sky"
      ],
      // Sound suggestions
      [
        "Gentle waves rhythmically washing onto the shore",
        "Soft wind rustling through leaves and grass",
        "Birds singing melodious songs from nearby trees",
        "A babbling brook flowing over smooth stones",
        "Distant wind chimes creating a soothing melody",
        "The soft crackle of a warm campfire",
        "Rain gently tapping on surrounding leaves",
        "Complete silence, with only the sound of your breath",
        "Soft instrumental music carried by the breeze",
        "The distant, gentle rumble of a waterfall"
      ],
      // Air feeling suggestions
      [
        "Warm and gentle like a summer breeze caressing your skin",
        "Cool and refreshing, carrying the scent of pine",
        "Perfectly balanced - neither too warm nor too cool",
        "Light and airy, as if gravity has slightly lessened",
        "Comfortably warm like sunshine after a rain shower",
        "Crisp and invigorating, filling you with energy",
        "Soft and velvety, embracing you like a cocoon",
        "Fresh and clean, purifying with each breath",
        "Slightly cool with occasional warm patches of sunlight",
        "Misty and ethereal, leaving tiny droplets on your skin"
      ],
      // Scent suggestions
      [
        "Fresh saltwater and tropical flowers from the oceanside",
        "Rich earth and sweet wildflowers from the forest floor",
        "Crisp pine needles and cedar from surrounding trees",
        "Fragrant lavender and rosemary carried on the breeze",
        "Sweet vanilla and cinnamon reminiscent of home",
        "Fresh rain on warm earth creating a rejuvenating petrichor",
        "Delicate cherry blossoms and clean mountain air",
        "Subtle incense and sandalwood creating a sacred atmosphere",
        "Sun-warmed hay and wild herbs from a summer meadow",
        "No scent at all - just pure, clean air"
      ],
      // Ground feeling suggestions
      [
        "Warm, soft sand that molds perfectly to your feet",
        "Plush, springy moss that cushions every step",
        "Smooth, cool stone that grounds your energy",
        "Soft grass that feels like a natural carpet",
        "Sturdy, solid earth that supports you completely",
        "Gently swaying surface like a hammock or cloud",
        "Warm wooden boards that hold the day's sunshine",
        "Cool, refreshing water that supports you as you float",
        "Velvety flower petals forming a natural cushion",
        "A surface that adjusts to your perfect comfort level"
      ]
    ]
  },
  { 
    id: "future-self",
    title: "Meeting Your Future Self", 
    questions: [
      "Imagine meeting yourself 5 years from now. Where does this meeting take place?",
      "What has your future self accomplished that you're proud of?",
      "What wisdom does your future self share with you?",
      "How does your future self carry themselves differently than you do now?",
      "What one question would you like to ask your future self?"
    ],
    suggestions: [
      // Meeting place suggestions
      [
        "A beautiful beachside café at sunset with waves crashing nearby",
        "A cozy mountain cabin with a fireplace and panoramic views",
        "A peaceful garden with blooming flowers and a flowing fountain",
        "Your dream home, which your future self has created",
        "An elegant restaurant in a city you've always wanted to visit",
        "A quiet library filled with books and wisdom",
        "A forest clearing filled with dappled sunlight",
        "A rooftop overlooking a city skyline at twilight",
        "A comfortable living room that feels both familiar and new",
        "A serene lakeside bench surrounded by nature"
      ],
      // Accomplishment suggestions
      [
        "Achieved perfect work-life balance with time for passions and loved ones",
        "Established a thriving career that brings both fulfillment and financial security",
        "Created deep, meaningful relationships with family and friends",
        "Improved physical health and maintained consistent wellness practices",
        "Developed new skills and knowledge in areas you've always been curious about",
        "Built a beautiful home that reflects your authentic self",
        "Positively impacted the lives of others through your work or volunteering",
        "Found inner peace and emotional stability through personal growth",
        "Traveled to places you've always dreamed of visiting",
        "Overcome a significant challenge or fear that currently holds you back"
      ],
      // Wisdom suggestions
      [
        "Trust your intuition—it knows the path even when your mind is uncertain",
        "The challenges you're facing now are building the strength you'll need later",
        "Your worth isn't measured by productivity—learn to rest without guilt",
        "The relationships you nurture now will sustain you through future challenges",
        "Prioritize self-care, as it's the foundation for everything else",
        "Don't postpone joy—find something to celebrate every day",
        "Release what you can't control and focus your energy on what you can",
        "Your vulnerability is your greatest strength, not a weakness",
        "The timeline you've set for yourself is arbitrary—be patient with your progress",
        "Your unique perspective is valuable—share it with the world"
      ],
      // Demeanor suggestions
      [
        "With confidence and ease, shoulders relaxed and head held high",
        "With a calm presence that puts others at ease immediately",
        "With boundary-setting clarity while maintaining compassion",
        "With authentic self-expression, free from worry about others' opinions",
        "With mindful presence in each moment, fully engaged in conversation",
        "With a balance of strength and softness appropriate for each situation",
        "With a playful spirit and ready laughter that inspires joy in others",
        "With wisdom reflected in thoughtful responses rather than reactive comments",
        "With an open heart that connects deeply with others",
        "With energy that radiates health, vitality, and inner peace"
      ],
      // Question suggestions
      [
        "What decision I'm facing now has the biggest impact on our future?",
        "What should I start doing today that will benefit me most in the long run?",
        "What habits or relationships should I reconsider or release?",
        "How did you overcome the challenge I'm currently facing?",
        "What opportunity should I not miss in the coming year?",
        "What brings you the most joy and fulfillment now?",
        "What did you learn that made the biggest difference in your life?",
        "What would you do differently if you could revisit this time in our life?",
        "How did you find your purpose and true calling?",
        "What should I stop worrying about right now?"
      ]
    ]
  },
  { 
    id: "energy-cleanse",
    title: "Energy Cleansing", 
    questions: [
      "Imagine a warm, healing light entering through the top of your head. What color is this light?",
      "How does this light feel as it moves through your body?",
      "What tensions or blockages does this light dissolve?",
      "As negative energy leaves your body, what form does it take?",
      "As your body fills with positive energy, what sensations do you notice?"
    ],
    suggestions: [
      // Light color suggestions
      [
        "Golden like the sun, radiating warmth and vitality",
        "Violet with hints of magenta, representing spiritual connection",
        "Pure white light, containing all colors of healing",
        "Emerald green, nurturing like the heart of nature",
        "Sapphire blue, calm and deeply restorative",
        "Rose pink, gentle and filled with compassionate love",
        "Turquoise blue-green, cleansing like crystal clear waters",
        "Amber orange, warming and revitalizing",
        "Indigo blue, awakening intuition and inner wisdom",
        "Rainbow-hued, addressing each energy center with its needed color"
      ],
      // Light feeling suggestions
      [
        "Warm and liquid, like honey flowing through every cell",
        "Effervescent and bubbly, gently fizzing away tension",
        "Gentle electric tingles that activate and awaken",
        "Soft and expansive, like a breath filling empty spaces",
        "Cool and refreshing, washing away fatigue and heaviness",
        "Pulsing waves that synchronize with your heartbeat",
        "Light and airy, creating a floating sensation",
        "Solid and grounding, creating stability from within",
        "Vibrating at a frequency that dissolves dense energy",
        "Gentle and nurturing, like being held in loving arms"
      ],
      // Tensions dissolved suggestions
      [
        "Knots of worry in your shoulders and neck, releasing years of stress",
        "A heavy weight on your chest, allowing deeper, freer breathing",
        "Clouded thoughts in your mind, bringing mental clarity",
        "A tight band around your heart from past hurts, allowing love to flow",
        "Constriction in your throat, freeing your authentic voice",
        "Rigidity in your spine, restoring flexibility and support",
        "Scattered energy in your abdomen, centering your personal power",
        "Numbness in your limbs, reconnecting you with physical sensation",
        "Barriers around your energy field, allowing connection with others",
        "Defensive armor you've built, creating safe vulnerability"
      ],
      // Negative energy form suggestions
      [
        "Dark smoke that dissipates into the air and transforms into light",
        "Heavy mud washing away down a stream of clear water",
        "Rust or tarnish flaking away to reveal brightness beneath",
        "Gray clouds dissolving into the atmosphere",
        "Dry leaves blown away by a gentle, cleansing wind",
        "Ice melting and flowing away from your body",
        "Tangled threads unraveling and floating off into space",
        "Static electricity discharging safely into the ground",
        "Shadow forms transforming into butterflies that fly away",
        "Dull fragments that crumble and return to the earth as compost"
      ],
      // Positive sensation suggestions
      [
        "Lightness, as if gravity has lessened its hold on your body",
        "Warmth spreading from your core to your fingertips and toes",
        "Tingling aliveness in areas that felt numb or disconnected",
        "Expansion, as if your body extends beyond its physical boundaries",
        "A gentle humming vibration that aligns all parts of yourself",
        "Deep groundedness, like having roots extending into the earth",
        "Crystal clarity in your thoughts and emotions",
        "A magnetic quality that attracts similar positive energies",
        "A protective cocoon of light surrounding your entire being",
        "Complete integration, with every cell working in harmony"
      ]
    ]
  },
  { 
    id: "mountain-strength",
    title: "Mountain of Strength", 
    questions: [
      "Envision yourself standing on a mighty mountain. What does the landscape around you look like?",
      "How does it feel to embody the stability and power of the mountain?",
      "What challenges appear as clouds passing by, unable to move you?",
      "What can you see from this new, elevated perspective?",
      "How does this mountain strength stay with you throughout your day?"
    ],
    suggestions: [
      // Landscape suggestions
      [
        "Snow-capped peaks stretching as far as the eye can see, glowing in sunrise light",
        "Lush green valleys below with winding rivers catching the sunlight",
        "Alpine meadows dotted with colorful wildflowers swaying in the breeze",
        "Vast forests of ancient pines covering the lower slopes of your mountain",
        "Dramatic cliffs with waterfalls cascading down to crystal clear lakes",
        "Mist-filled valleys that part occasionally to reveal hidden treasures below",
        "Eagles and hawks soaring through clear blue skies around your mountain",
        "Dramatic weather patterns visible in the distance yet unable to shake you",
        "A single path leading to your summit, showing the journey you've taken",
        "Sacred monuments or stone formations that mark this as a place of power"
      ],
      // Stability feeling suggestions
      [
        "Unmovable, like your feet have become one with the bedrock beneath you",
        "Expansive, as if your body extends through the entire mountain mass",
        "Ancient, carrying the wisdom and patience of geological time",
        "Perfectly balanced, with your center of gravity deeply rooted",
        "Powerful, knowing you can withstand any storm or challenge",
        "Serene, untroubled by temporary disturbances around you",
        "Dignified, naturally commanding respect without effort",
        "Eternal, existing beyond the limitations of human timescales",
        "Connected, feeling part of something much larger than yourself",
        "Sovereign, completely self-contained and self-sufficient"
      ],
      // Passing clouds/challenges suggestions
      [
        "Work stress and deadlines that once seemed overwhelming",
        "Relationship tensions that temporarily clouded your judgment",
        "Self-doubt and fear that questioned your capabilities",
        "Financial worries that created anxiety about the future",
        "Health concerns that formerly occupied your thoughts",
        "Others' opinions and judgments that once affected your choices",
        "Past regrets that used to weigh heavily on your heart",
        "Future anxieties that stole your present peace",
        "Perfectionism that prevented you from moving forward",
        "Comparison to others that diminished your unique value"
      ],
      // Elevated perspective suggestions
      [
        "The interconnectedness of all things, like a vast web of relationships",
        "The true size of challenges, much smaller than they once appeared",
        "The cyclical nature of life, with patterns repeating like seasons",
        "The path you've traveled so far, appreciating your progress",
        "Potential paths forward, with clarity about which direction calls you",
        "New possibilities that weren't visible from the ground level",
        "The bigger picture of your life's journey and purpose",
        "The beauty that exists alongside difficulty in the complete landscape",
        "Where others are on their journeys, bringing compassion for their struggles",
        "The available resources and support that surround you"
      ],
      // Maintained strength suggestions
      [
        "As a solid presence in your posture and the way you move through space",
        "Through deep, mountain-steady breathing when challenges arise",
        "By mentally returning to your summit view when perspective is needed",
        "As unshakable confidence in your decisions and boundaries",
        "Through patience with processes that require time to unfold",
        "By remaining centered when others are scattered or reactive",
        "As inner stability that others can sense and find comfort in",
        "Through a grounded voice that speaks with clarity and authority",
        "By weathering emotional storms without being uprooted",
        "As a constant inner resource you can access through visualization"
      ]
    ]
  },
  {
    id: "releasing-worry",
    title: "Releasing Worry", 
    questions: [
      "Imagine gathering all your worries and placing them in a container. What does this container look like?",
      "How do you seal this container to safely hold these worries?",
      "Visualize releasing this container into a vast ocean or up into the sky. How does it move away from you?",
      "As the container travels farther away, what feelings arise in your body?",
      "What replaces the space in your mind where worries used to be?"
    ],
    suggestions: [
      // Container suggestions
      [
        "A beautiful wooden chest with intricate carvings and a curved lid",
        "A transparent glass bottle that allows you to see the worries contained",
        "A decorative paper lantern that can float on water or in air",
        "A small, ornate treasure box with jewels embedded on its surface",
        "A biodegradable vessel made of leaves and natural materials",
        "A balloon or bubble that can easily float away",
        "A time capsule made of sturdy metal with a secure latch",
        "A golden bowl that shimmers in the light",
        "A magical box that shrinks your worries as they enter it",
        "A woven basket made of flexible but strong materials"
      ],
      // Sealing method suggestions
      [
        "With a golden key that you can keep or release along with the container",
        "With melted wax forming a perfect seal imprinted with a symbol of protection",
        "With a special ritual of words that transforms the energy inside",
        "With a lid that spirals closed like a seashell, creating a seamless seal",
        "With magical light that forms an impenetrable barrier",
        "With a living seal of growing vines or flowers that wrap around it",
        "With a combination lock set to a significant number sequence",
        "With a blessing or prayer that ensures the worries remain contained",
        "With a technological mechanism that shrinks and compresses the contents",
        "With a ribbon tied in a special knot that only you know how to create"
      ],
      // Movement suggestions
      [
        "Gently floating on ocean waves, carried by currents to distant shores",
        "Rising like a hot air balloon, becoming smaller as it ascends into the clouds",
        "Dissolving slowly like salt in water, becoming one with the vastness",
        "Carried away on the back of a magnificent creature - perhaps a whale or eagle",
        "Lifted by a beam of light that draws it up into the stars",
        "Sailing smoothly along the water's surface before sinking peacefully below",
        "Drifting on the wind like a dandelion seed, following a graceful path",
        "Transforming into light particles that scatter and fade in all directions",
        "Pulled by an invisible tide toward the horizon, growing distant",
        "Becoming weightless and dancing away like leaves in an autumn breeze"
      ],
      // Feeling suggestions
      [
        "A profound lightness as if gravity has loosened its hold on your body",
        "Deep relief, like exhaling after holding your breath for too long",
        "Spaciousness expanding through your chest with each breath",
        "Tingling liberation especially in areas that held physical tension",
        "Peaceful calm washing over you in gentle waves",
        "Quiet joy bubbling up from an inner well of happiness",
        "Physical relaxation as muscles release their guard",
        "Energy flowing freely through pathways that felt blocked",
        "Groundedness and stability from releasing what was unbalancing you",
        "A gentle warmth radiating from your core to your extremities"
      ],
      // Mental replacement suggestions
      [
        "Clear, still awareness like a mountain lake reflecting the sky",
        "Creative possibilities and inspiring new ideas",
        "Compassionate thoughts toward yourself and others",
        "Perspective that puts worries in their proper, smaller place",
        "Present moment appreciation for what is right in front of you",
        "Confidence in your ability to handle whatever comes next",
        "Gratitude for the good that exists alongside challenges",
        "Wisdom that distinguishes between what you can and cannot control",
        "Peaceful acceptance of life's natural unfolding",
        "Curiosity about what positive experiences await you"
      ]
    ]
  }
];

// Mood tracking options
export const moodOptions = [
  // Positive moods
  { id: "peaceful", text: "Peaceful", category: "positive", emoji: "😌" },
  { id: "happy", text: "Happy", category: "positive", emoji: "😊" },
  { id: "grateful", text: "Grateful", category: "positive", emoji: "🙏" },
  { id: "energized", text: "Energized", category: "positive", emoji: "⚡" },
  { id: "confident", text: "Confident", category: "positive", emoji: "💪" },
  { id: "loved", text: "Loved", category: "positive", emoji: "💕" },
  { id: "motivated", text: "Motivated", category: "positive", emoji: "🔥" },
  { id: "content", text: "Content", category: "positive", emoji: "😌" },
  
  // Neutral moods
  { id: "curious", text: "Curious", category: "neutral", emoji: "🤔" },
  { id: "focused", text: "Focused", category: "neutral", emoji: "🎯" },
  { id: "reflective", text: "Reflective", category: "neutral", emoji: "💭" },
  { id: "hopeful", text: "Hopeful", category: "neutral", emoji: "🌟" },
  { id: "calm", text: "Calm", category: "neutral", emoji: "🧘" },
  
  // Challenging moods
  { id: "stressed", text: "Stressed", category: "challenging", emoji: "😰" },
  { id: "anxious", text: "Anxious", category: "challenging", emoji: "😟" },
  { id: "tired", text: "Tired", category: "challenging", emoji: "😴" },
  { id: "overwhelmed", text: "Overwhelmed", category: "challenging", emoji: "😵" },
  { id: "sad", text: "Sad", category: "challenging", emoji: "😢" },
  { id: "frustrated", text: "Frustrated", category: "challenging", emoji: "😤" },
  { id: "lonely", text: "Lonely", category: "challenging", emoji: "😔" },
  { id: "uncertain", text: "Uncertain", category: "challenging", emoji: "😕" },
];

// Predefined affirmations with meditation type associations
export const affirmationOptions = [
  // General Positive Affirmations
  { id: "worthy", text: "I am worthy of love and respect.", types: ["affirmations"] },
  { id: "capable", text: "I am capable of achieving my goals.", types: ["affirmations", "law-of-attraction"] },
  { id: "strong", text: "I am strong in mind, body, and spirit.", types: ["affirmations", "body-scan"] },
  { id: "confident", text: "I approach challenges with confidence.", types: ["affirmations"] },
  { id: "growing", text: "I am constantly growing and evolving.", types: ["affirmations", "visualization"] },
  
  // Mindfulness & Peace
  { id: "peace", text: "I choose peace over worry.", types: ["mindfulness", "breathing"] },
  { id: "present", text: "I am fully present in this moment.", types: ["mindfulness", "breathing"] },
  { id: "calm", text: "I remain calm and centered in stressful situations.", types: ["mindfulness", "breathing"] },
  
  // Abundance & Gratitude
  { id: "abundance", text: "My life is filled with abundance.", types: ["law-of-attraction", "visualization"] },
  { id: "gratitude", text: "I am grateful for everything I have.", types: ["mindfulness", "law-of-attraction"] },
  { id: "attract", text: "I attract success and prosperity.", types: ["law-of-attraction", "visualization"] },
  
  // Personal Growth & Decision Making
  { id: "decision", text: "I trust my decisions and choices.", types: ["hypno", "affirmations"] },
  { id: "purpose", text: "I live with purpose and intention.", types: ["visualization", "law-of-attraction"] },
  { id: "opportunity", text: "I see opportunities where others see obstacles.", types: ["law-of-attraction", "visualization"] },
  { id: "progress", text: "I celebrate my progress, no matter how small.", types: ["affirmations"] },
  
  // Healing & Health
  { id: "healing", text: "My body is healing and restoring itself.", types: ["body-scan", "hypno"] },
  { id: "health", text: "My health improves every day.", types: ["body-scan", "hypno"] },
  
  // Emotions & Joy
  { id: "joy", text: "I attract joy and positivity into my life.", types: ["affirmations", "law-of-attraction"] },
  { id: "deserving", text: "I deserve success and happiness.", types: ["affirmations", "law-of-attraction"] },
  { id: "energy", text: "I am filled with positive energy.", types: ["body-scan", "breathing"] },
  
  // Relationships & Boundaries
  { id: "boundaries", text: "I set healthy boundaries in my relationships.", types: ["affirmations", "hypno"] },
  { id: "forgiveness", text: "I practice forgiveness for myself and others.", types: ["hypno", "mindfulness"] },
  
  // Creativity & Self-Expression
  { id: "creative", text: "I am creative and full of innovative ideas.", types: ["visualization", "affirmations"] },
  { id: "authentic", text: "I am authentic and true to myself.", types: ["affirmations", "hypno"] },
  
  // Personal Development
  { id: "control", text: "I am in control of my thoughts and actions.", types: ["hypno", "mindfulness"] },
  { id: "learn", text: "I learn and grow from my experiences.", types: ["affirmations", "story"] },
  { id: "adaptable", text: "I am adaptable and embrace change.", types: ["affirmations", "mindfulness"] },
  { id: "self-love", text: "I practice self-love and self-compassion daily.", types: ["affirmations", "body-scan"] },
  { id: "balance", text: "I maintain balance in all areas of my life.", types: ["mindfulness", "body-scan"] },
  { id: "perseverance", text: "I persevere through challenges and setbacks.", types: ["affirmations", "visualization"] },
  
  // Story-specific affirmations
  { id: "journey", text: "Each step of my journey reveals new wisdom and strength.", types: ["story"] },
  { id: "chapters", text: "I am the author of my own story, writing powerful new chapters.", types: ["story"] },
  { id: "adventure", text: "Life is an adventure full of wondrous possibilities.", types: ["story", "visualization"] }
];

// Template suggestions
export const meditationTemplates = [
  {
    id: "deep-sleep",
    title: "Deep Sleep Journey",
    purpose: "sleep",
    duration: 20,
    backgroundMusic: "binaural-sleep",
    voiceStyle: "whisper-female",
    affirmations: "I am calm and relaxed.\nMy mind is peaceful.\nI release the tensions of the day.\nI am safe and protected.\nI welcome deep, restful sleep.",
    popularity: 642
  },
  {
    id: "morning-confidence",
    title: "Morning Confidence Boost",
    purpose: "morning",
    duration: 5,
    backgroundMusic: "beta-waves",
    voiceStyle: "motivational-male",
    affirmations: "I am ready for a new day.\nI am capable and strong.\nI approach challenges with confidence.\nI am worthy of success.\nI radiate positive energy.",
    popularity: 512
  },
  {
    id: "anxiety-relief",
    title: "Anxiety Relief",
    purpose: "stress",
    duration: 15,
    backgroundMusic: "freq-432hz",
    voiceStyle: "calm-female",
    affirmations: "I am in control of my thoughts and feelings.\nI breathe in peace and breathe out tension.\nI am centered and grounded.\nThis moment is all that exists.\nI am safe in this present moment.",
    popularity: 478
  },
  {
    id: "deep-meditation",
    title: "Deep Meditation Experience",
    purpose: "focus",
    duration: 30,
    backgroundMusic: "theta-waves",
    voiceStyle: "calm-male",
    affirmations: "I am one with my breath.\nI release all distractions.\nMy inner wisdom speaks clearly to me.\nI am present and aware.\nI am connected to the universe.",
    popularity: 395
  },
  {
    id: "intuition-boost",
    title: "Intuition Awakening",
    purpose: "focus",
    duration: 15,
    backgroundMusic: "freq-852hz",
    voiceStyle: "whisper-female",
    affirmations: "I trust my inner guidance.\nMy intuition grows stronger every day.\nI can clearly hear my inner voice.\nI am connected to my higher wisdom.\nAll the answers I seek are within me.",
    popularity: 362
  },
  {
    id: "creativity-flow",
    title: "Creative Flow State",
    purpose: "focus",
    duration: 10,
    backgroundMusic: "binaural-creativity",
    voiceStyle: "motivational-female",
    affirmations: "Creative ideas flow to me effortlessly.\nI am a channel for inspiration.\nI allow my mind to explore new possibilities.\nMy creative expression is unique and valuable.\nI embrace my creative potential.",
    popularity: 289
  }
];
