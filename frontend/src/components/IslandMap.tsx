"use client";

import { motion, AnimatePresence } from "motion/react";
import { Habit, HabitStatus } from "@/actions/habitActions";
import { Star, Skull, Lock, TreePalm, Home, Castle, Waves } from "lucide-react";

interface IslandMapProps {
  habits: Habit[];
  onNodeClick: (habit: Habit) => void;
}

const ASSET_MILESTONES: Record<number, any> = {
  3: { icon: TreePalm, label: "Palm Trees" },
  10: { icon: Home, label: "A Hut" },
  20: { icon: Waves, label: "A Bridge" },
  30: { icon: Castle, label: "The Castle" },
};

export default function IslandMap({ habits, onNodeClick }: IslandMapProps) {
  // Generate a winding path
  const nodes = habits.map((habit, i) => {
    const x = 50 + Math.sin(i * 0.8) * 30; // Winding horizontally
    const y = 80 - (i * 2.5); // Moving up
    return { ...habit, x, y };
  });

  return (
    <div className="relative w-full min-h-[150vh] bg-sand overflow-hidden p-8 pb-32">
      {/* Visual Assets based on progress */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
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
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={`M ${nodes[0]?.x} ${nodes[0]?.y} ${nodes.map(n => `L ${n.x} ${n.y}`).join(' ')}`}
          fill="none"
          stroke="#4ECDC4"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          opacity="0.5"
        />
      </svg>

      <div className="relative flex flex-col items-center">
        {nodes.map((node, i) => (
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
