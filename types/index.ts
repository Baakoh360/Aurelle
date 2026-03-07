export interface User {
    name: string;
    isPregnant: boolean;
    conceptionDate?: string;
  }
  
  export interface CycleData {
    periodStartDate: string;
    periodLength: number;
    cycleLength: number; // Calculated or default (28 days)
    lastUpdated: string;
  }
  
  export interface DayLog {
    date: string;
    flow?: 'light' | 'medium' | 'heavy' | null;
    pain?: number; // 0-4 scale
    mood?: 'happy' | 'neutral' | 'sad' | 'angry' | 'anxious' | null;
    symptoms?: string[];
    notes?: string;
  }
  
  export interface PregnancyData {
    conceptionDate: string;
    dueDate: string; // Calculated based on conception date
  }
  
  export type CycleDayType = 'period' | 'fertile' | 'ovulation' | 'safe' | null;
  
  export interface CalendarDay {
    date: string;
    type: CycleDayType;
    isToday: boolean;
    hasLog: boolean;
  }
  
  export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }