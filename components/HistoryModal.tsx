"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  entries: HistoryEntry[];
}

export function HistoryModal({ open, onClose, entries }: Props) {
  return (
    <AnimatePresence>
      {open ? (
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
            aria-labelledby="history-title"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 id="history-title" className="text-xl font-bold text-choup-pink-600">
                Derniers titres écoutés
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
            <ul className="grid gap-2">
              {entries.length === 0 && <li className="text-sm text-gray-500">Aucun morceau encore.</li>}
              {entries.map((entry, idx) => (
                <li key={`${entry.playedAt}-${idx}`} className="rounded border-l-4 border-choup-pink-300 px-3 py-2">
                  <div className="font-semibold">{entry.song}</div>
                  <div className="text-sm text-gray-600">{entry.artist}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
