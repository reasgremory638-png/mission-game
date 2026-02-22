"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { getParrotAdvice } from "@/actions/habitActions";

export default function ParrotCompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Squawk! Ready for your daily quest?");

  const fetchAdvice = async () => {
    const advice = await getParrotAdvice();
    setMessage(advice);
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  return (
    <div className="fixed bottom-32 right-8 z-40 flex flex-col items-end gap-4 print:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            className="bg-white p-4 rounded-3xl border-4 border-ocean shadow-xl max-w-[200px] relative mb-2"
          >
            <p className="text-sm font-bold text-gray-700 leading-tight">
              {message}
            </p>
            <div className="absolute bottom-[-12px] right-6 w-0 h-0 border-l-12 border-l-transparent border-r-12 border-r-transparent border-t-12 border-t-ocean"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) fetchAdvice();
        }}
        className="w-20 h-20 bg-ocean rounded-full flex items-center justify-center border-b-8 border-emerald-600 shadow-2xl text-4xl"
      >
        🦜
      </motion.button>
    </div>
  );
}
