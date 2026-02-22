"use client";

import { useEffect, useState } from "react";
import IslandMap from "@/components/IslandMap";
import QuestModal from "@/components/QuestModal";
import ShopModal from "@/components/ShopModal";
import ParrotCompanion from "@/components/ParrotCompanion";
import { Habit, getHabits, completeHabit, resetGame, getGameStats, buyItem } from "@/actions/habitActions";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import GameButton from "@/components/GameButton";
import { RefreshCw, ShoppingBag, Coins } from "lucide-react";
import { useSound } from "@/hooks/useSound";

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [stats, setStats] = useState({ shells: 0, streak: 0, inventory: [] as string[] });
  const { playSound } = useSound();

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      const [habitData, statData] = await Promise.all([
        getHabits(),
        getGameStats()
      ]);
      if (!ignore) {
        setHabits(habitData);
        setStats(statData);
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const refreshAll = async () => {
    const [habitData, statData] = await Promise.all([
      getHabits(),
      getGameStats()
    ]);
    setHabits(habitData);
    setStats(statData);
  };

  const handleNodeClick = (habit: Habit) => {
    if (habit.status === 'active') {
      setSelectedHabit(habit);
    }
  };

  const handleCompleteSuccess = async (dayNumber: number, log: string, photo?: string) => {
    playSound("success");
    await completeHabit(dayNumber, log, photo);
    setSelectedHabit(null);
    
    // Massive Confetti Explosion
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4ECDC4', '#06D6A0', '#FFD93D', '#F6D7B0']
    });

    refreshAll();
  };

  const handleBuy = async (itemId: string, cost: number) => {
    const res = await buyItem(itemId, cost);
    if (res.success) {
        playSound("buy");
        refreshAll();
    } else {
        alert(res.message);
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset your island? You will lose all progress!")) {
        await resetGame();
        refreshAll();
    }
  };

  return (
    <main className="min-h-screen bg-sand flex flex-col items-center">
      <div className="waves-bg" />
      
      <header className="fixed top-0 left-0 right-0 p-6 z-40 bg-sand/80 backdrop-blur-md border-b-4 border-emerald-100 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-black text-emerald-900 tracking-tight">ISLAND HABITS</h1>
            <div className="flex items-center gap-4">
                <p className="text-emerald-700 font-bold text-sm">30 DAYS TO A THRIVING ISLAND</p>
                <div className="flex items-center gap-2 bg-gold/20 px-3 py-1 rounded-full border border-gold/30">
                    <Coins size={14} className="text-gold" />
                    <span className="text-xs font-black text-amber-800">{stats.shells} SHELLS</span>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <GameButton variant="secondary" className="px-4! py-2!" onClick={() => setShowShop(true)}>
                <ShoppingBag size={20} />
            </GameButton>
            <GameButton variant="secondary" className="px-4! py-2!" onClick={handleReset}>
                <RefreshCw size={20} />
            </GameButton>
        </div>
      </header>

      <IslandMap 
        habits={habits} 
        onNodeClick={handleNodeClick} 
        inventory={stats.inventory}
        streak={stats.streak}
      />

      <QuestModal 
        habit={selectedHabit} 
        onClose={() => setSelectedHabit(null)} 
        onComplete={handleCompleteSuccess} 
      />

      <ShopModal 
        isOpen={showShop} 
        onClose={() => setShowShop(false)} 
        shells={stats.shells} 
        ownedItems={stats.inventory}
        onBuy={handleBuy}
      />

      <ParrotCompanion />

      {/* Floating Progress Bar & Actions */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm flex flex-col gap-4 px-4 z-40">
        <div className="bg-cozy-white rounded-4xl p-4 shadow-2xl border-b-4 border-gray-200">
            <div className="flex justify-between items-center mb-2 px-2">
                <span className="font-black text-emerald-900">ISLAND PROGRESS</span>
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
        
        <GameButton variant="secondary" className="w-full py-4 shadow-xl" onClick={() => window.print()}>
            📸 CAPTURE ISLAND (SHARE)
        </GameButton>
      </div>
    </main>
  );
}
