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

  // Activate next day if it's currently locked
  // If this was a make-up day, we continue from the next available node
  const nextDay = dayNumber + 1;
  const nextHabit = await db.get('SELECT * FROM habits WHERE day_number = ?', [nextDay]);
  
  if (nextHabit) {
    if (nextHabit.status === 'locked') {
        await db.run('UPDATE habits SET status = ? WHERE day_number = ?', ['active', nextDay]);
    }
  } else if (dayNumber < 30) {
      // Should not happen unless DB is corrupted, but safe check
      await db.run('INSERT INTO habits (day_number, status) VALUES (?, ?)', [nextDay, 'active']);
  }

  revalidatePath("/");
}

export async function resetGame() {
    const db = await getDb();
    await db.run("UPDATE habits SET status = 'locked', log_text = NULL, photo_url = NULL, completion_date = NULL");
    await db.run("UPDATE habits SET status = 'active' WHERE day_number = 1");
    revalidatePath("/");
}
