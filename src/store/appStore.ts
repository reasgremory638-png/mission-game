import { create } from 'zustand';
import { User, Challenge, ChallengeDay, UserSettings, Notification } from '../types';
import {
  encryptPassword,
  generateUniqueId,
  generateOTP,
  verifyOTP,
} from '../utils/encryption';
import { detectUserTimezone, isPassedMidnight, getDayStartUTC } from '../utils/timezone';
import { getItem, setItem, storageKeys } from '../utils/storage';

interface AppStore {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  requestOTP: (email: string) => Promise<string>;
  verifyOTP: (email: string, code: string) => Promise<boolean>;
  logout: () => void;
  
  // Challenges
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  createChallenge: (title: string, description: string, executionDetails: string, startDate: number) => Promise<void>;
  getActiveChallenges: () => Challenge[];
  getCompletedChallenges: () => Challenge[];
  getFailedChallenges: () => Challenge[];
  setCurrentChallenge: (challengeId: string) => void;
  
  // Daily Tasks
  markDayAsCompleted: (challengeId: string, dayNumber: number, note: string, files: File[]) => Promise<void>;
  checkMissedDays: (challengeId: string) => void;
  
  // Extension Days / Make-up
  addMakeupDays: (challengeId: string, count: number) => void;
  compensateMissedDay: (challengeId: string, makeupDayId: string) => void;
  
  // Challenge Completion & Failure
  completeChallenge: (challengeId: string) => void;
  failChallenge: (challengeId: string) => void;
  restartChallenge: (challengeId: string) => void;
  
  // Settings
  settings: UserSettings | null;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  
  // Utilities
  initializeStore: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  challenges: [],
  currentChallenge: null,
  settings: null,
  notifications: [],

  initializeStore: () => {
    set({ isLoading: true });
    try {
      const currentUser = getItem<User>(storageKeys.currentUser);
      const challenges = getItem<Challenge[]>(storageKeys.challenges) || [];
      const settings = getItem<UserSettings>(storageKeys.settings);
      const notifications = getItem<Notification[]>(storageKeys.notifications) || [];

      set({
        user: currentUser,
        isAuthenticated: !!currentUser,
        challenges,
        settings,
        notifications,
      });

      if (currentUser && challenges.length > 0) {
        challenges.forEach((challenge) => {
          if (challenge.status === 'active') {
            get().checkMissedDays(challenge.id);
          }
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const users = getItem<User[]>(storageKeys.users) || [];
      
      if (users.some((u) => u.email === email)) {
        return false;
      }

      const newUser: User = {
        id: generateUniqueId(),
        name,
        email,
        passwordHash: encryptPassword(password),
        timezone: detectUserTimezone(),
        createdAt: Date.now(),
        verified: false,
      };

      users.push(newUser);
      setItem(storageKeys.users, users);

      return true;
    } finally {
      set({ isLoading: false });
    }
  },

  requestOTP: async (email: string) => {
    const users = getItem<User[]>(storageKeys.users) || [];
    const user = users.find((u) => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    const otp = generateOTP();
    const otpSessions = getItem<Record<string, { code: string; expiresAt: number }>>(
      storageKeys.otpSessions
    ) || {};
    
    otpSessions[email] = {
      code: otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    setItem(storageKeys.otpSessions, otpSessions);
    
    // In production, send via email. Here we return for demo
    console.log('OTP Code:', otp);
    return otp;
  },

  verifyOTP: async (email: string, code: string) => {
    const otpSessions = getItem<Record<string, { code: string; expiresAt: number }>>(
      storageKeys.otpSessions
    ) || {};
    
    const session = otpSessions[email];
    if (!session || session.expiresAt < Date.now()) {
      throw new Error('OTP expired');
    }

    if (!verifyOTP(session.code, code)) {
      throw new Error('Invalid OTP');
    }

    delete otpSessions[email];
    setItem(storageKeys.otpSessions, otpSessions);

    return true;
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const users = getItem<User[]>(storageKeys.users) || [];
      const user = users.find((u) => u.email === email);

      if (!user) {
        return false;
      }

      const passwordHash = encryptPassword(password);
      if (user.passwordHash !== passwordHash) {
        return false;
      }

      // Update verified status
      user.verified = true;
      const updatedUsers = users.map((u) => (u.id === user.id ? user : u));
      setItem(storageKeys.users, updatedUsers);

      // Set current user
      setItem(storageKeys.currentUser, user);
      set({ user, isAuthenticated: true });

      // Load user settings
      const settings = getItem<UserSettings>(storageKeys.settings);
      if (settings && settings.userId === user.id) {
        set({ settings });
      } else {
        const newSettings: UserSettings = {
          userId: user.id,
          theme: 'dark',
          notifications: true,
          emailNotifications: false,
          timezone: user.timezone,
          language: 'en',
          updatedAt: Date.now(),
        };
        setItem(storageKeys.settings, newSettings);
        set({ settings: newSettings });
      }

      return true;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    setItem(storageKeys.currentUser, null);
    set({ user: null, isAuthenticated: false, currentChallenge: null });
  },

  createChallenge: async (title: string, description: string, executionDetails: string, startDate: number) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');

    const days: ChallengeDay[] = [];
    for (let i = 1; i <= 30; i++) {
      const dayDate = startDate + (i - 1) * 24 * 60 * 60 * 1000;
      days.push({
        id: generateUniqueId(),
        challengeId: generateUniqueId(),
        dayNumber: i,
        date: dayDate,
        status: 'pending',
        note: '',
        proofFiles: [],
      });
    }

    const challengeId = generateUniqueId();
    days.forEach((d) => (d.challengeId = challengeId));

    const newChallenge: Challenge = {
      id: challengeId,
      userId: user.id,
      title,
      description,
      executionDetails,
      startDate,
      endDate: startDate + 29 * 24 * 60 * 60 * 1000,
      status: 'active',
      days,
      totalDays: 30,
      missedDays: [],
      compensatedDays: new Map(),
      createdAt: Date.now(),
    };

    const challenges = get().challenges;
    challenges.push(newChallenge);
    setItem(storageKeys.challenges, challenges);

    set({ challenges, currentChallenge: newChallenge });
  },

  getActiveChallenges: () => {
    const { user, challenges } = get();
    if (!user) return [];
    return challenges.filter((c) => c.userId === user.id && c.status === 'active');
  },

  getCompletedChallenges: () => {
    const { user, challenges } = get();
    if (!user) return [];
    return challenges.filter((c) => c.userId === user.id && c.status === 'completed');
  },

  getFailedChallenges: () => {
    const { user, challenges } = get();
    if (!user) return [];
    return challenges.filter((c) => c.userId === user.id && c.status === 'failed');
  },

  setCurrentChallenge: (challengeId: string) => {
    const { challenges } = get();
    const challenge = challenges.find((c) => c.id === challengeId);
    if (challenge) {
      set({ currentChallenge: challenge });
    }
  },

  markDayAsCompleted: async (challengeId: string, dayNumber: number, note: string, files: File[]) => {
    const { challenges, settings } = get();
    const challenge = challenges.find((c) => c.id === challengeId);

    if (!challenge || !settings) return;

    const day = challenge.days.find((d) => d.dayNumber === dayNumber);
    if (!day) return;

    day.status = 'completed';
    day.note = note;
    day.proofFiles = files;
    day.completedAt = Date.now();

    const updatedChallenges = challenges.map((c) =>
      c.id === challengeId ? challenge : c
    );

    setItem(storageKeys.challenges, updatedChallenges);
    set({ challenges: updatedChallenges, currentChallenge: challenge });

    get().addNotification({
      type: 'success',
      title: `Day ${dayNumber} Completed! 🎉`,
      message: 'Great job! Keep up the momentum.',
      read: false,
    });
  },

  checkMissedDays: (challengeId: string) => {
    const { challenges, settings } = get();
    const challenge = challenges.find((c) => c.id === challengeId);

    if (!challenge || !settings) return;

    const now = Date.now();
    let missedUpdated = false;

    challenge.days.forEach((day) => {
      if (day.status === 'pending' && day.date < now) {
        // Check if it's past midnight in user's timezone
        if (isPassedMidnight(day.date, now, settings.timezone)) {
          day.status = 'missed';
          if (!challenge.missedDays.includes(day.id)) {
            challenge.missedDays.push(day.id);
            missedUpdated = true;
          }
        }
      }
    });

    if (missedUpdated) {
      const updatedChallenges = challenges.map((c) =>
        c.id === challengeId ? challenge : c
      );
      setItem(storageKeys.challenges, updatedChallenges);
      set({ challenges: updatedChallenges });
    }
  },

  addMakeupDays: (challengeId: string, count: number) => {
    const { challenges } = get();
    const challenge = challenges.find((c) => c.id === challengeId);

    if (!challenge) return;

    const lastDay = challenge.days[challenge.days.length - 1];
    const startDate = lastDay.date + 24 * 60 * 60 * 1000;

    for (let i = 0; i < count; i++) {
      const makeupDay: ChallengeDay = {
        id: generateUniqueId(),
        challengeId,
        dayNumber: challenge.days.length + i + 1,
        date: startDate + i * 24 * 60 * 60 * 1000,
        status: 'pending',
        note: '',
        proofFiles: [],
        isExtensionDay: true,
      };
      challenge.days.push(makeupDay);
    }

    challenge.totalDays += count;

    const updatedChallenges = challenges.map((c) =>
      c.id === challengeId ? challenge : c
    );

    setItem(storageKeys.challenges, updatedChallenges);
    set({ challenges: updatedChallenges });
  },

  compensateMissedDay: (challengeId: string, makeupDayId: string) => {
    const { challenges } = get();
    const challenge = challenges.find((c) => c.id === challengeId);

    if (!challenge || challenge.missedDays.length === 0) return;

    // Get the first (oldest) missed day (FIFO)
    const missedDayId = challenge.missedDays[0];
    const missedDay = challenge.days.find((d) => d.id === missedDayId);
    const makeupDay = challenge.days.find((d) => d.id === makeupDayId);

    if (!missedDay || !makeupDay) return;

    // Mark missed day as compensated
    missedDay.status = 'compensated';
    missedDay.compensatesDay = makeupDayId;

    // Remove from missed days array
    challenge.missedDays.shift();

    // Store compensation mapping
    challenge.compensatedDays.set(missedDayId, makeupDayId);

    const updatedChallenges = challenges.map((c) =>
      c.id === challengeId ? challenge : c
    );

    setItem(storageKeys.challenges, updatedChallenges);
    set({ challenges: updatedChallenges });

    get().addNotification({
      type: 'success',
      title: 'Make-up Day Completed!',
      message: `You've successfully compensated for a missed day. Keep going!`,
      read: false,
    });
  },

  completeChallenge: (challengeId: string) => {
    const { challenges } = get();
    const challenge = challenges.find((c) => c.id === challengeId);

    if (!challenge) return;

    // Check if all days are completed
    const completedOrCompensated = challenge.days.filter(
      (d) => d.status === 'completed' || d.status === 'compensated'
    ).length;

    if (completedOrCompensated === challenge.totalDays) {
      challenge.status = 'completed';
      challenge.completedAt = Date.now();

      const updatedChallenges = challenges.map((c) =>
        c.id === challengeId ? challenge : c
      );

      setItem(storageKeys.challenges, updatedChallenges);
      set({ challenges: updatedChallenges });

      get().addNotification({
        type: 'success',
        title: '🎉 Challenge Completed!',
        message: 'Congratulations! You have successfully completed the 30-day challenge!',
        read: false,
      });
    }
  },

  failChallenge: (challengeId: string) => {
    const { challenges } = get();
    const challenge = challenges.find((c) => c.id === challengeId);

    if (!challenge) return;

    challenge.status = 'failed';

    const updatedChallenges = challenges.map((c) =>
      c.id === challengeId ? challenge : c
    );

    setItem(storageKeys.challenges, updatedChallenges);
    set({ challenges: updatedChallenges });

    get().addNotification({
      type: 'error',
      title: 'Challenge Failed ❌',
      message: 'You did not complete the make-up day. This challenge is now incomplete.',
      read: false,
    });
  },

  restartChallenge: async (challengeId: string) => {
    const { challenges, user } = get();
    const oldChallenge = challenges.find((c) => c.id === challengeId);

    if (!oldChallenge || !user) return;

    // Archive the old challenge
    oldChallenge.status = 'archived';

    // Create a fresh 30-day cycle
    const days: ChallengeDay[] = [];
    const startDate = Date.now();

    for (let i = 1; i <= 30; i++) {
      const dayDate = startDate + (i - 1) * 24 * 60 * 60 * 1000;
      days.push({
        id: generateUniqueId(),
        challengeId: generateUniqueId(),
        dayNumber: i,
        date: dayDate,
        status: 'pending',
        note: '',
        proofFiles: [],
      });
    }

    const newChallengeId = generateUniqueId();
    days.forEach((d) => (d.challengeId = newChallengeId));

    const newChallenge: Challenge = {
      id: newChallengeId,
      userId: user.id,
      title: oldChallenge.title,
      description: oldChallenge.description,
      executionDetails: oldChallenge.executionDetails,
      startDate: Date.now(),
      endDate: Date.now() + 29 * 24 * 60 * 60 * 1000,
      status: 'active',
      days,
      totalDays: 30,
      missedDays: [],
      compensatedDays: new Map(),
      createdAt: Date.now(),
    };

    const updatedChallenges = [...challenges, newChallenge];
    setItem(storageKeys.challenges, updatedChallenges);
    set({ challenges: updatedChallenges, currentChallenge: newChallenge });
  },

  updateSettings: (settingsUpdate: Partial<UserSettings>) => {
    const { settings } = get();
    if (!settings) return;

    const updated = { ...settings, ...settingsUpdate, updatedAt: Date.now() };
    setItem(storageKeys.settings, updated);
    set({ settings: updated });
  },

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateUniqueId(),
      timestamp: Date.now(),
    };

    const { notifications } = get();
    const updated = [newNotification, ...notifications].slice(0, 50); // Keep last 50
    setItem(storageKeys.notifications, updated);
    set({ notifications: updated });

    // Auto-clear after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== newNotification.id),
      }));
    }, 5000);
  },

  clearNotifications: () => {
    setItem(storageKeys.notifications, []);
    set({ notifications: [] });
  },
}));
