"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type HabitStatus = 'locked' | 'active' | 'completed' | 'missed';

export interface Habit {
  id: number;
  day_number: number;
  status: HabitStatus;
  log_text?: string;
  photo_url?: string;
  completion_date?: string;
}

export async function getHabits(): Promise<Habit[]> {
  const db = await getDb();
  const habits = await db.all('SELECT * FROM habits ORDER BY day_number ASC');
  
  // Logic to check for missed days could go here
  // For now, we return the habits as is for the demo
  return habits;
}

export async function markAsMissed(dayNumber: number) {
    const db = await getDb();
    await db.run('UPDATE habits SET status = ? WHERE day_number = ?', ['missed', dayNumber]);
    
    // Add make-up day at the end
    const lastHabit = await db.get('SELECT MAX(day_number) as max_day FROM habits');
    const newDayNumber = (lastHabit?.max_day || 30) + 1;
    await db.run('INSERT INTO habits (day_number, status) VALUES (?, ?)', [newDayNumber, 'active']);
    
    revalidatePath("/");
}

export async function completeHabit(dayNumber: number, logText: string, photoUrl?: string) {
  const db = await getDb();
  const completionDate = new Date().toISOString();

  await db.run(
    'UPDATE habits SET status = ?, log_text = ?, photo_url = ?, completion_date = ? WHERE day_number = ?',
    ['completed', logText, photoUrl || null, completionDate, dayNumber]
  );

  // Gamification: Award Shells (10 per day)
  const currentShells = await db.get('SELECT value FROM settings WHERE key = ?', ['shells']);
  const newShells = parseInt(currentShells.value) + 10;
  await db.run('UPDATE settings SET value = ? WHERE key = ?', [newShells.toString(), 'shells']);

  // Increment Streak
  const currentStreak = await db.get('SELECT value FROM settings WHERE key = ?', ['streak']);
  const newStreak = parseInt(currentStreak.value) + 1;
  await db.run('UPDATE settings SET value = ? WHERE key = ?', [newStreak.toString(), 'streak']);

  // Activate next day if it's currently locked
  const nextDay = dayNumber + 1;
  const nextHabit = await db.get('SELECT * FROM habits WHERE day_number = ?', [nextDay]);
  
  if (nextHabit) {
    if (nextHabit.status === 'locked') {
        await db.run('UPDATE habits SET status = ? WHERE day_number = ?', ['active', nextDay]);
    }
  }

  revalidatePath("/");
}

export async function getGameStats() {
    const db = await getDb();
    const shells = await db.get('SELECT value FROM settings WHERE key = ?', ['shells']);
    const streak = await db.get('SELECT value FROM settings WHERE key = ?', ['streak']);
    const inventory = await db.all('SELECT item_id FROM inventory');
    
    return {
        shells: parseInt(shells?.value || '0'),
        streak: parseInt(streak?.value || '0'),
        inventory: inventory.map(i => i.item_id)
    };
}

export async function buyItem(itemId: string, cost: number) {
    const db = await getDb();
    const currentShells = await db.get('SELECT value FROM settings WHERE key = ?', ['shells']);
    const shells = parseInt(currentShells.value);

    if (shells >= cost) {
        await db.run('UPDATE settings SET value = ? WHERE key = ?', [(shells - cost).toString(), 'shells']);
        await db.run('INSERT OR IGNORE INTO inventory (item_id) VALUES (?)', [itemId]);
        revalidatePath("/");
        return { success: true };
    }
    return { success: false, message: "Not enough shells!" };
}

export async function resetGame() {
    const db = await getDb();
    await db.run("UPDATE habits SET status = 'locked', log_text = NULL, photo_url = NULL, completion_date = NULL");
    await db.run("UPDATE habits SET status = 'active' WHERE day_number = 1");
    revalidatePath("/");
}

export async function getParrotAdvice() {
    const db = await getDb();
    const lastCompleted = await db.get('SELECT log_text, day_number FROM habits WHERE status = "completed" ORDER BY day_number DESC LIMIT 1');
    const streakData = await db.get('SELECT value FROM settings WHERE key = ?', ['streak']);
    const streak = parseInt(streakData?.value || '0');
    
    if (!lastCompleted || !lastCompleted.log_text) {
        return "Squawk! Your island looks a bit empty. Start your first quest to see it grow! 🏝️";
    }

    const log = lastCompleted.log_text.toLowerCase();
    
    if (streak >= 5) {
        return `Squawk! A ${streak}-day streak?! You're making this island look like a palace! 🔥🦜`;
    }

    if (log.includes("tired") || log.includes("hard") || log.includes("exhausted")) {
        return "Squawk! Even the strongest palms bend in the wind. Rest is also a part of progress, Islander! 🌴💤";
    }

    if (log.includes("good") || log.includes("happy") || log.includes("done") || log.includes("success")) {
        return "Squawk! Victory! I can smell the success from here. Keep that energy high! 🎊✨";
    }

    if (lastCompleted.day_number > 20) {
        return "Squawk! We're so close to the finish line! Can you see the Castle from here? 🏰🦜";
    }

    return "Squawk! I saw what you did! Every small step makes this island a better place. 🦜🌈";
}
