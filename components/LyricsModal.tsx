"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Lyrics } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  song: string;
  artist: string;
  lyrics: Lyrics;
}

export function LyricsModal({ open, onClose, song, artist, lyrics }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lyrics-title"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 id="lyrics-title" className="text-xl font-bold text-choup-pink-600">
                {song} — {artist}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="rounded p-1 hover:bg-choup-pink-100"
              >
                <X size={20} />
              </button>
            </header>
            {lyrics.available && lyrics.text ? (
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{lyrics.text}</pre>
            ) : (
              <p className="text-sm text-gray-600">Paroles indisponibles pour ce morceau.</p>
            )}
            <p className="mt-4 text-center text-xs text-gray-500">
              Powered by{" "}
              <a href="https://www.vagalume.com.br/" target="_blank" rel="noreferrer" className="underline">
                Vagalume
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
