"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  song: string;
  artist: string;
}

export function NowPlaying({ song, artist }: Props) {
  return (
    <div className="text-center md:text-left">
      <AnimatePresence mode="wait">
        <motion.h2
          key={song}
          initial={{ opacity: 0, y: 10, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -10, rotateX: 90 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold uppercase text-choup-pink-50"
        >
          {song || "..."}
        </motion.h2>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.h3
          key={artist}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-lg capitalize text-choup-pink-100"
        >
          {artist || "..."}
        </motion.h3>
      </AnimatePresence>
    </div>
  );
}
