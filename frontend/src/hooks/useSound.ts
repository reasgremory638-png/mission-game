"use client";

import { useCallback } from "react";

const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  success: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  buy: "https://assets.mixkit.co/active_storage/sfx/1676/1676-preview.mp3",
};

export function useSound() {
  const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
    const audio = new Audio(SOUNDS[soundName]);
    audio.volume = 0.4;
    audio.play().catch((e) => console.log("Audio play blocked", e));
  }, []);

  return { playSound };
}
