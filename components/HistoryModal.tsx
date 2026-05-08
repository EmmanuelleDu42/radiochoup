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
    <Modal
      open={open}
      onClose={onClose}
      title="Derniers titres écoutés"
      titleId="history-title"
      maxWidthClass="max-w-2xl"
      accent="turquoise"
    >
      <ul className="grid gap-3" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {entries.length === 0 && (
          <li
            style={{
              fontSize: "14px",
              color: "#7a7a7a",
              padding: "24px 0",
              textAlign: "center",
              fontStyle: "italic"
            }}
          >
            Aucun morceau diffusé pour le moment.
          </li>
        )}
        {entries.map((entry, idx) => (
          <li
            key={`${entry.playedAt}-${idx}`}
            style={{
              background: "#f5efe8",
              borderLeft: "5px solid #71bfbb",
              borderRadius: "0 8px 8px 0",
              padding: "10px 14px",
              transition: "transform 0.18s, background 0.18s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ecf6f5";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f5efe8";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <div style={{ fontWeight: 700, color: "#2b2b2b", fontSize: "14px" }}>{entry.song}</div>
            <div style={{ fontSize: "12px", color: "#6a6a6a", marginTop: "2px" }}>{entry.artist}</div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
