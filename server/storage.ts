import { 
  users, type User, type InsertUser,
  meditations, type Meditation, type InsertMeditation
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Meditation methods
  getMeditation(id: number): Promise<Meditation | undefined>;
  getAllMeditations(): Promise<Meditation[]>;
  createMeditation(meditation: InsertMeditation): Promise<Meditation>;
  updateMeditation(id: number, meditation: Partial<InsertMeditation>): Promise<Meditation | undefined>;
  deleteMeditation(id: number): Promise<boolean>;
  
  // Get meditation audio URL
  setMeditationAudioUrl(id: number, url: string): Promise<Meditation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meditationStore: Map<number, Meditation>;
  userCurrentId: number;
  meditationCurrentId: number;

  constructor() {
    this.users = new Map();
    this.meditationStore = new Map();
    this.userCurrentId = 1;
    this.meditationCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Meditation methods
  async getMeditation(id: number): Promise<Meditation | undefined> {
    return this.meditationStore.get(id);
  }
  
  async getAllMeditations(): Promise<Meditation[]> {
    return Array.from(this.meditationStore.values());
  }
  
  async createMeditation(insertMeditation: InsertMeditation): Promise<Meditation> {
    const id = this.meditationCurrentId++;
    const now = new Date();
    
    // Ensure default values are properly set
    const meditation: Meditation = {
      ...insertMeditation,
      id,
      createdAt: now,
      // Provide defaults for optional fields if not provided
      selectedAffirmations: insertMeditation.selectedAffirmations ?? [],
      customAffirmations: insertMeditation.customAffirmations ?? "",
      visualizationPrompt: insertMeditation.visualizationPrompt ?? null,
      visualizationResponses: insertMeditation.visualizationResponses ?? {},
      pauseDuration: insertMeditation.pauseDuration ?? 2,
      autoRepeat: insertMeditation.autoRepeat ?? true,
      fadeOut: insertMeditation.fadeOut ?? false,
      isNap: insertMeditation.isNap ?? false,
      wakeFadeIn: insertMeditation.wakeFadeIn ?? false,
      audioUrl: insertMeditation.audioUrl ?? null
    };
    
    this.meditationStore.set(id, meditation);
    return meditation;
  }
  
  async updateMeditation(id: number, meditationUpdate: Partial<InsertMeditation>): Promise<Meditation | undefined> {
    const meditation = this.meditationStore.get(id);
    if (!meditation) return undefined;
    
    const updatedMeditation = { ...meditation, ...meditationUpdate };
    this.meditationStore.set(id, updatedMeditation);
    return updatedMeditation;
  }
  
  async deleteMeditation(id: number): Promise<boolean> {
    return this.meditationStore.delete(id);
  }
  
  async setMeditationAudioUrl(id: number, url: string): Promise<Meditation | undefined> {
    const meditation = this.meditationStore.get(id);
    if (!meditation) return undefined;
    
    meditation.audioUrl = url;
    this.meditationStore.set(id, meditation);
    return meditation;
  }
}

export const storage = new MemStorage();
