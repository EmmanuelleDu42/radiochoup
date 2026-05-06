"use client";

import { Modal } from "@/components/Modal";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  entries: HistoryEntry[];
}

export function HistoryModal({ open, onClose, entries }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Derniers titres écoutés" titleId="history-title" maxWidthClass="max-w-2xl">
      <ul className="grid gap-2">
        {entries.length === 0 && <li className="text-sm text-gray-500">Aucun morceau encore.</li>}
        {entries.map((entry, idx) => (
          <li key={`${entry.playedAt}-${idx}`} className="rounded border-l-4 border-choup-pink-300 px-3 py-2">
            <div className="font-semibold">{entry.song}</div>
            <div className="text-sm text-gray-600">{entry.artist}</div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
