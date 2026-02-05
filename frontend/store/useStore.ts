import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotion?: string;
  image_data?: string;
  audio_data?: string;
  file_name?: string;
}

interface Memory {
  id: string;
  memory_type: string;
  key: string;
  value: string;
  importance: number;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  name?: string;
  preferences: Record<string, any>;
  personality_settings: {
    tone: string;
    formality: string;
    verbosity: string;
  };
  avatar_settings: {
    style: string;
    color_scheme: string;
  };
  llm_provider: string;
  llm_model: string;
  voice_enabled: boolean;
}

interface AppState {
  userId: string | null;
  messages: Message[];
  memories: Memory[];
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  currentEmotion: string;
  
  // Actions
  setUserId: (userId: string) => void;
  sendMessage: (message: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  loadMemories: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setCurrentEmotion: (emotion: string) => void;
  clearHistory: () => Promise<void>;
  generateImage: (prompt: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  userId: null,
  messages: [],
  memories: [],
  profile: null,
  isLoading: false,
  error: null,
  currentEmotion: 'calm',

  setUserId: (userId) => set({ userId }),

  sendMessage: async (message: string) => {
    const { userId, profile } = get();
    if (!userId) return;

    set({ isLoading: true, error: null });

    // Add user message immediately
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, userMsg] }));

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          message,
          provider: profile?.llm_provider || 'openai',
          model: profile?.llm_model || 'gpt-5.1',
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      const assistantMsg: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        emotion: data.emotion,
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        currentEmotion: data.emotion || 'calm',
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadHistory: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/history/${userId}`);
      if (!response.ok) throw new Error('Failed to load history');
      
      const data = await response.json();
      set({ messages: data.history || [] });
    } catch (error: any) {
      console.error('Load history error:', error);
    }
  },

  loadMemories: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/memories/${userId}`);
      if (!response.ok) throw new Error('Failed to load memories');
      
      const data = await response.json();
      set({ memories: data.memories || [] });
    } catch (error: any) {
      console.error('Load memories error:', error);
    }
  },

  loadProfile: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/${userId}`);
      if (!response.ok) throw new Error('Failed to load profile');
      
      const data = await response.json();
      set({ profile: data.profile });
    } catch (error: any) {
      console.error('Load profile error:', error);
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { userId } = get();
    if (!userId) return;

    set({ isLoading: true });

    try {
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...updates }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();
      set({ profile: data.profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setCurrentEmotion: (emotion: string) => set({ currentEmotion: emotion }),

  clearHistory: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/history/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear history');
      set({ messages: [] });
    } catch (error: any) {
      console.error('Clear history error:', error);
    }
  },
}));