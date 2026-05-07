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
        {entries.length === 0 && (
          <li style={{ fontSize: "13px", color: "#ccc" }}>Aucun morceau encore.</li>
        )}
        {entries.map((entry, idx) => (
          <li
            key={`${entry.playedAt}-${idx}`}
            style={{
              borderLeft: "4px solid #ef929d",
              paddingLeft: "12px",
              paddingTop: "6px",
              paddingBottom: "6px"
            }}
          >
            <div style={{ fontWeight: 600, color: "#fff", fontSize: "13px" }}>{entry.song}</div>
            <div style={{ fontSize: "11px", color: "#ccc" }}>{entry.artist}</div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
