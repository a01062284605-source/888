export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  credits: number;
  completed: boolean;
  category: 'social' | 'health' | 'organization' | 'self-care';
}

export interface Theme {
  id: string;
  name: string;
  primaryColor: string; // Tailwind class like 'bg-blue-500'
  secondaryColor: string; // Tailwind class like 'bg-blue-100'
  accentColor: string; // Tailwind text class like 'text-blue-600'
  backgroundColor: string; // Tailwind class like 'bg-slate-50'
  price: number;
  description: string;
  unlocked: boolean;
}

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  price: number;
  unlocked: boolean;
  description: string;
}

export interface UserState {
  credits: number;
  streak: number;
  completedMissionsCount: number;
  activeThemeId: string;
  unlockedThemes: string[];
  unlockedStickers: string[];
}

export type Tab = 'home' | 'missions' | 'social' | 'shop';

export interface FeedPost {
  id: string;
  username: string; // "Anonymous Bird", etc.
  content: string; // AI Encouragement or generic text
  reflection?: string; // User's own words
  likes: number;
  missionTitle: string;
  timestamp: string;
}