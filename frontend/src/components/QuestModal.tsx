"use client";

import { motion, AnimatePresence } from "motion/react";
import { Habit } from "@/actions/habitActions";
import GameButton from "./GameButton";
import { useState } from "react";
import { Camera, X } from "lucide-react";

interface QuestModalProps {
  habit: Habit | null;
  onClose: () => void;
  onComplete: (dayNumber: number, logText: string, photoUrl?: string) => void;
}

export default function QuestModal({ habit, onClose, onComplete }: QuestModalProps) {
  const [log, setLog] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  if (!habit) return null;

  const handleComplete = () => {
    if (log.trim()) {
      onComplete(habit.day_number, log, photo || undefined);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-cozy-white w-full max-w-md rounded-4xl p-8 border-b-8 border-gray-200 shadow-2xl relative"
        >
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X size={24} />
          </button>

          <h2 className="text-3xl font-black text-foreground mb-2">Day {habit.day_number} Quest</h2>
          <p className="text-gray-500 mb-6 font-medium">Capture your progress and claim your island reward.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">JOURNAL LOG</label>
              <textarea
                value={log}
                onChange={(e) => setLog(e.target.value)}
                placeholder="How did you do today?"
                className="w-full h-32 p-4 rounded-3xl bg-white border-4 border-gray-100 focus:border-ocean outline-none transition-colors resize-none font-medium text-gray-700"
              />
            </div>

            <div className="flex flex-col items-center">
                 <label className="w-full block text-sm font-bold text-gray-700 mb-2 px-1 text-left">PHOTO PROOF</label>
                 <div className="w-full h-40 rounded-3xl border-4 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden">
                    {photo ? (
                        <img src={photo} alt="Photo Proof" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <Camera size={40} className="text-gray-300 mb-2" />
                            <span className="text-sm font-bold text-gray-400">UPLOAD PHOTO</span>
                        </>
                    )}
                    {/* Simplified for demo: no real upload logic here yet */}
                 </div>
            </div>

            <GameButton 
              className="w-full py-4 text-xl" 
              onClick={handleComplete}
              disabled={!log.trim()}
            >
              CLAIM REWARD
            </GameButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
