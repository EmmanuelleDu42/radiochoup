"use client";

import { Modal } from "@/components/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Slot {
  label: string;
  bg: string;
  textColor?: string;
  height: number; // relative duration units
}

// Reconstitution textuelle de programmation.jpg.
// Les durées sont relatives et reflètent les proportions visibles dans l'image source.
const SLOTS: Slot[] = [
  { label: "Shak'em up", bg: "#8d7e7c", height: 1 },
  { label: "Good Morning Lady's", bg: "#c8e3dc", textColor: "#3a6660", height: 3 },
  { label: "Undershower Singalones", bg: "#9bc8c4", height: 2 },
  { label: "Shak'em up", bg: "#8d7e7c", height: 0.7 },
  { label: "Cook n' Swing", bg: "#b8a96a", height: 3 },
  { label: "American Diner", bg: "#aac8d2", textColor: "#3a5566", height: 2 },
  { label: "Shak'em up", bg: "#8d7e7c", height: 4 },
  { label: "Tea Time", bg: "#f0bb6c", textColor: "#5a3d10", height: 4 },
  { label: "Shak'em up", bg: "#8d7e7c", height: 0.7 },
  { label: "Cook n' Swing", bg: "#b8a96a", height: 3 },
  { label: "Lounge", bg: "#cdc4be", textColor: "#4a4035", height: 3 },
  { label: "Poo-Poo-Pee-Doo", bg: "#eb8fa2", height: 3 },
  { label: "Lounge", bg: "#cdc4be", textColor: "#4a4035", height: 3 },
  { label: "Dancing Queen", bg: "#9d6f8e", height: 1.2 },
  { label: "Shak'em up", bg: "#8d7e7c", height: 4 }
];

const ROW_UNIT = 18; // px par unité de durée

export function ProgramModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Programmation musicale de la semaine"
      titleId="program-title"
      maxWidthClass="max-w-3xl"
      accent="mauve"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2px",
          background: "#fff",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #ece4dc"
        }}
      >
        {SLOTS.map((slot, i) => (
          <div
            key={`${slot.label}-${i}`}
            style={{
              background: slot.bg,
              color: slot.textColor ?? "#fff",
              minHeight: `${slot.height * ROW_UNIT}px`,
              padding: "8px 14px",
              display: "flex",
              alignItems: "flex-start",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.01em"
            }}
          >
            {slot.label}
          </div>
        ))}
        <div
          style={{
            background: "#fff",
            color: "#cd7784",
            padding: "10px 14px",
            fontSize: "12px",
            fontStyle: "italic",
            borderTop: "1px solid #ece4dc"
          }}
        >
          Fin des programmes
        </div>
      </div>
      <p
        style={{
          marginTop: "12px",
          fontSize: "11px",
          color: "#8a8a8a",
          textAlign: "center"
        }}
      >
        Grille indicative — la programmation peut varier selon la journée.
      </p>
    </Modal>
  );
}
