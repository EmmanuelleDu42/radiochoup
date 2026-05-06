"use client";

import { Volume2, VolumeX } from "lucide-react";

interface Props {
  volume: number;
  muted: boolean;
  onChange: (value: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, muted, onChange, onToggleMute }: Props) {
  return (
    <div className="flex items-center gap-2 text-choup-pink-100">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        className="rounded p-1 hover:bg-white/10"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : volume}
        aria-label="Volume"
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        className="h-1 w-32 cursor-pointer accent-choup-pink-300"
      />
      <span className="w-8 text-xs tabular-nums">{muted ? 0 : volume}</span>
    </div>
  );
}
