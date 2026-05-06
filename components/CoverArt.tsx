"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CoverArt as CoverArtType } from "@/lib/types";

interface Props {
  cover: CoverArtType | null;
  fallbackUrl: string;
}

export function CoverArt({ cover, fallbackUrl }: Props) {
  const url = cover?.url ?? fallbackUrl;
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-choup-pink-600 shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={url}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${url}')` }}
          aria-hidden="true"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
}
