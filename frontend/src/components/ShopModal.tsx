"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Coins } from "lucide-react";
import GameButton from "./GameButton";

interface ShopItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'item_fire', name: 'Beach Bonfire', cost: 30, icon: '🔥' },
  { id: 'item_boat', name: 'Fishing Boat', cost: 50, icon: '⛵' },
  { id: 'item_hammock', name: 'Cozy Hammock', cost: 20, icon: '🪑' },
];

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shells: number;
  ownedItems: string[];
  onBuy: (itemId: string, cost: number) => void;
}

export default function ShopModal({ isOpen, onClose, shells, ownedItems, onBuy }: ShopModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-cozy-white w-full max-w-lg rounded-4xl p-8 border-b-8 border-gray-200 shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>

          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag size={32} className="text-ocean" />
            <h2 className="text-3xl font-black text-foreground">Island Shop</h2>
          </div>

          <div className="flex items-center gap-2 bg-sand/30 p-3 rounded-2xl mb-6 w-fit border-2 border-sand">
            <Coins size={20} className="text-gold" />
            <span className="font-black text-gray-700">{shells} Shells</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {SHOP_ITEMS.map((item) => {
              const isOwned = ownedItems.includes(item.id);
              return (
                <div key={item.id} className="bg-white p-4 rounded-3xl border-4 border-gray-50 flex flex-col items-center gap-3">
                  <span className="text-4xl">{item.icon}</span>
                  <div className="text-center">
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-sm font-black text-gold">{item.cost} Shells</p>
                  </div>
                  <GameButton
                    variant={isOwned ? "secondary" : "primary"}
                    disabled={isOwned || shells < item.cost}
                    onClick={() => onBuy(item.id, item.cost)}
                    className="w-full text-sm py-2"
                  >
                    {isOwned ? "OWNED" : "BUY"}
                  </GameButton>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
