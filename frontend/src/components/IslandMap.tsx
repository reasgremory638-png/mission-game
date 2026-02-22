"use client";

import { motion } from "motion/react";
import { Habit } from "@/actions/habitActions";
import { Star, Skull, Lock, TreePalm, Home, Castle, Waves, LucideIcon } from "lucide-react";

interface IslandMapProps {
  habits: Habit[];
  onNodeClick: (habit: Habit) => void;
  inventory?: string[];
  streak?: number;
}

interface AssetMilestone {
  icon: LucideIcon;
  label: string;
}

const ASSET_MILESTONES: Record<number, AssetMilestone> = {
  3: { icon: TreePalm, label: "Palm Trees" },
  10: { icon: Home, label: "A Hut" },
  20: { icon: Waves, label: "A Bridge" },
  30: { icon: Castle, label: "The Castle" },
};

const DECORATIONS: Record<string, { icon: string; x: number; y: number }> = {
    'item_fire': { icon: '🔥', x: 20, y: 70 },
    'item_boat': { icon: '⛵', x: 80, y: 85 },
    'item_hammock': { icon: '🪑', x: 70, y: 75 },
};

export default function IslandMap({ habits, onNodeClick, inventory = [], streak = 0 }: IslandMapProps) {
  // Generate a winding path
  const nodes = habits.map((habit, i) => {
    const x = 50 + Math.sin(i * 0.8) * 30; // Winding horizontally
    const y = 80 - (i * 2.5); // Moving up
    return { ...habit, x, y };
  });

  return (
    <div className="relative w-full min-h-[150vh] bg-sand overflow-hidden p-8 pb-32">
      {/* Background Life (Waves/Clouds) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-10 text-6xl opacity-20"
        >☁️</motion.div>
        <motion.div 
            animate={{ x: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 right-10 text-5xl opacity-10"
        >☁️</motion.div>
      </div>

      {/* Visual Assets based on progress & Shop Items */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {habits.map((h, i) => {
            if (h.status === 'completed' && ASSET_MILESTONES[h.day_number]) {
                const AssetIcon = ASSET_MILESTONES[h.day_number].icon;
                return (
                    <motion.div
                        key={`asset-${h.day_number}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute"
                        style={{ 
                            left: `${50 + Math.sin(i * 0.8 + 1) * 40}%`, 
                            top: `${80 - (i * 2.5) + 5}%` 
                        }}
                    >
                        <AssetIcon size={48} className="text-vegetation" />
                    </motion.div>
                );
            }
            return null;
        })}

        {/* Shop Items rendering */}
        {inventory.map((itemId) => {
            const decor = DECORATIONS[itemId];
            if (!decor) return null;
            return (
                <motion.div
                    key={itemId}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute text-5xl"
                    style={{ left: `${decor.x}%`, top: `${decor.y}%` }}
                >
                    {decor.icon}
                </motion.div>
            );
        })}
      </div>

      {nodes.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d={`M ${nodes[0].x} ${nodes[0].y} ${nodes.slice(1).map(n => `L ${n.x} ${n.y}`).join(' ')}`}
            fill="none"
            stroke="#4ECDC4"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        </svg>
      )}

      <div className="relative flex flex-col items-center">
        {/* Streak Glow Indicator */}
        {streak >= 5 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10">
                 <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-40 h-40 bg-gold/30 rounded-full blur-3xl pointer-events-none"
                 />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-2xl">🔥</span>
                    <span className="text-xs font-black text-amber-700 whitespace-nowrap">STREAK ON FIRE!</span>
                 </div>
            </div>
        )}

        {nodes.map((node) => (
          <Node 
            key={node.day_number} 
            node={node} 
            onClick={() => onNodeClick(node)} 
          />
        ))}
      </div>
    </div>
  );
}

function Node({ node, onClick }: { node: Habit & { x: number, y: number }, onClick: () => void }) {
  const isLocked = node.status === 'locked';
  const isActive = node.status === 'active';
  const isCompleted = node.status === 'completed';
  const isMissed = node.status === 'missed';

  const getIcon = () => {
    if (isCompleted) return <Star size={20} className="text-gold fill-gold" />;
    if (isMissed) return <Skull size={20} className="text-white" />;
    if (isLocked) return <Lock size={16} className="text-gray-400" />;
    return <span className="text-white font-bold">{node.day_number}</span>;
  };

  const getBgColor = () => {
    if (isCompleted) return "bg-green-500 border-green-700 shadow-green-200";
    if (isMissed) return "bg-enemy border-red-800 shadow-red-200";
    if (isLocked) return "bg-gray-200 border-gray-300 shadow-none";
    return "bg-ocean border-emerald-600 shadow-ocean/30";
  };

  return (
    <motion.div
      style={{ left: `${node.x}%`, bottom: `${100 - node.y}%`, position: 'absolute' }}
      whileHover={!isLocked ? { scale: 1.1 } : {}}
      whileTap={!isLocked ? { scale: 0.9 } : {}}
      onClick={!isLocked ? onClick : undefined}
      className={`
        w-12 h-12 rounded-full border-b-4 flex items-center justify-center cursor-pointer
        shadow-lg transition-colors
        ${getBgColor()}
        ${isActive ? 'ring-4 ring-white ring-offset-2 animate-pulse' : ''}
      `}
    >
      {getIcon()}
    </motion.div>
  );
}
