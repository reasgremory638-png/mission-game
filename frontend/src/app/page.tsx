"use client";

import { useEffect, useState } from "react";
import IslandMap from "@/components/IslandMap";
import QuestModal from "@/components/QuestModal";
import { Habit, getHabits, completeHabit, resetGame } from "@/actions/habitActions";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";
import GameButton from "@/components/GameButton";
import { Trophy, RefreshCw } from "lucide-react";

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    refreshHabits();
  }, []);

  const refreshHabits = async () => {
    const data = await getHabits();
    setHabits(data);
    
    // Check if game over (this logic can be expanded)
    const missedAtEndOfPath = data.some(h => h.status === 'missed');
    // If strict mode, maybe setIsGameOver(true)
  };

  const handleNodeClick = (habit: Habit) => {
    if (habit.status === 'active') {
      setSelectedHabit(habit);
    }
  };

  const handleCompleteSuccess = async (dayNumber: number, log: string, photo?: string) => {
    await completeHabit(dayNumber, log, photo);
    setSelectedHabit(null);
    
    // Massive Confetti Explosion
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4ECDC4', '#06D6A0', '#FFD93D', '#F6D7B0']
    });

    refreshHabits();
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset your island? You will lose all progress!")) {
        await resetGame();
        refreshHabits();
    }
  };

  return (
    <main className="min-h-screen bg-sand flex flex-col items-center">
      <header className="fixed top-0 left-0 right-0 p-6 z-40 bg-sand/80 backdrop-blur-md border-b-4 border-emerald-100 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-black text-emerald-900 tracking-tight">ISLAND HABITS</h1>
            <p className="text-emerald-700 font-bold text-sm">30 DAYS TO A THRIVING ISLAND</p>
        </div>
        <div className="flex gap-2">
            <GameButton variant="secondary" className="px-4! py-2!" onClick={handleReset}>
                <RefreshCw size={20} />
            </GameButton>
        </div>
      </header>

      <IslandMap habits={habits} onNodeClick={handleNodeClick} />

      <QuestModal 
        habit={selectedHabit} 
        onClose={() => setSelectedHabit(null)} 
        onComplete={handleCompleteSuccess} 
      />

      {/* Floating Progress Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs bg-cozy-white rounded-4xl p-4 shadow-2xl border-b-4 border-gray-200 z-40">
        <div className="flex justify-between items-center mb-2 px-2">
            <span className="font-black text-emerald-900">PROGRESS</span>
            <span className="font-black text-ocean">
                {habits.filter(h => h.status === 'completed').length}/30
            </span>
        </div>
        <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden border-2 border-gray-100">
            <motion.div 
                className="h-full bg-ocean"
                initial={{ width: 0 }}
                animate={{ width: `${(habits.filter(h => h.status === 'completed').length / 30) * 100}%` }}
                transition={{ duration: 1, type: "spring" }}
            />
        </div>
      </div>

      {isGameOver && (
          <div className="fixed inset-0 z-50 bg-enemy/90 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-6xl font-black text-white mb-4">GAME OVER</h2>
            <p className="text-white text-xl mb-8 font-bold">You missed a day in strict mode!</p>
            <GameButton onClick={handleReset} variant="primary" className="bg-white text-enemy! border-white hover:bg-white/90">
                TRY AGAIN
            </GameButton>
          </div>
      )}
    </main>
  );
}
