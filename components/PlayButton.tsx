"use client";

import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  isPlaying: boolean;
  onToggle: () => void;
}

export function PlayButton({ isPlaying, onToggle }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? "Mettre en pause" : "Lire"}
      className="grid size-16 place-items-center rounded-full bg-choup-pink-400 text-white shadow-lg transition hover:bg-choup-pink-500 focus-visible:outline-2 focus-visible:outline-choup-pink-200"
      whileTap={{ scale: 0.92 }}
      animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.5 }}
    >
      {isPlaying ? <Pause size={28} /> : <Play size={28} />}
    </motion.button>
  );
}
