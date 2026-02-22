// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  timezone: string;
  createdAt: number;
  verified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface OTPSession {
  email: string;
  token: string;
  code: string;
  expiresAt: number;
}

// Challenge Types
export interface Challenge {
  id: string;
  userId: string;
  title: string;
  description: string;
  executionDetails: string;
  startDate: number;
  endDate: number;
  status: 'active' | 'completed' | 'failed' | 'archived';
  days: ChallengeDay[];
  totalDays: number;
  missedDays: string[]; // Array of day IDs
  compensatedDays: Map<string, string>; // Maps missed day ID to compensation day ID
  createdAt: number;
  completedAt?: number;
}

export interface ChallengeDay {
  id: string;
  challengeId: string;
  dayNumber: number;
  date: number;
  status: 'pending' | 'completed' | 'missed' | 'compensated';
  note: string;
  proofFiles: File[];
  completedAt?: number;
  isExtensionDay?: boolean;
  compensatesDay?: string;
}

export interface DailyLog {
  dayId: string;
  note: string;
  files: string[]; // Array of file names/paths
  timestamp: number;
}

// Island UI Types
export interface IslandElement {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'tree' | 'flower' | 'house' | 'rock' | 'water' | 'path' | 'decoration';
  growthLevel: number; // 0-5
  unlockedAt?: number;
  animating?: boolean;
}

export interface IslandState {
  elements: IslandElement[];
  backgroundGradient: string;
  lighting: number; // 0-1
  particleCount: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Settings Types
export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  emailNotifications: boolean;
  timezone: string;
  language: string;
  updatedAt: number;
}
