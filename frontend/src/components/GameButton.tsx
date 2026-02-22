"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface GameButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
}

export default function GameButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
}: GameButtonProps) {
  const variants = {
    primary: "bg-ocean text-white border-b-4 border-emerald-600 hover:bg-emerald-400",
    secondary: "bg-vegetation text-white border-b-4 border-emerald-800 hover:bg-emerald-500",
    danger: "bg-enemy text-white border-b-4 border-red-800 hover:bg-red-500",
    ghost: "bg-transparent text-gray-600 border-2 border-dashed border-gray-300",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className={`
        px-6 py-3 rounded-2xl font-bold transition-colors cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
