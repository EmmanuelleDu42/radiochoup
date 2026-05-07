"use client";

import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NowPlaying as NowPlayingType, CoverArt as CoverArtType } from "@/lib/types";

interface Props {
  nowPlaying: NowPlayingType | null;
  cover: CoverArtType | null;
  defaultCoverUrl: string;
  volume: number;
  muted: boolean;
  isPlaying: boolean;
  onToggle: () => void;
  onSetVolume: (value: number) => void;
  onToggleMute: () => void;
  onOpenHistory: () => void;
  onOpenLyrics: () => void;
  onOpenProgram: () => void;
}

export function Player({
  nowPlaying,
  cover: _cover,
  defaultCoverUrl: _defaultCoverUrl,
  volume,
  muted,
  isPlaying,
  onToggle,
  onSetVolume,
  onToggleMute,
  onOpenHistory,
  onOpenLyrics,
  onOpenProgram
}: Props) {
  const song = nowPlaying?.song ?? "...";
  const artist = nowPlaying?.artist ?? "...";

  return (
    <section className="hidden lg:flex lg:justify-center">
      {/* Radio container — ratio 673×475 */}
      <div
        className="relative"
        style={{
          backgroundImage: "url('/img/radio_ancienne.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "top center",
          width: "673px",
          height: "475px",
          maxWidth: "100%",
          flexShrink: 0
        }}
      >
        {/* Zone contrôles — positionnée sur la zone "écran" de la radio */}
        {/* top: 280px, left: 7px comme dans le legacy, mais adapté visuellement */}
        <div
          className="absolute"
          style={{
            top: "275px",
            left: "10px",
            right: "10px"
          }}
        >
          <div className="flex items-center justify-center gap-3 px-4">
            {/* Volume gauche */}
            <div className="flex flex-col items-center gap-1" style={{ minWidth: "60px" }}>
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={muted ? "Activer le son" : "Couper le son"}
                style={{ color: "#71bfbb", fontSize: "22px", background: "none", border: "none", cursor: "pointer", padding: "3px" }}
              >
                {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                aria-label="Volume"
                onChange={(e) => onSetVolume(Number(e.currentTarget.value))}
                style={{ width: "70px" }}
              />
            </div>

            {/* Now playing centre */}
            <div className="flex-1 text-center" style={{ minWidth: 0 }}>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={song}
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.4 }}
                  className="info-current-song"
                  style={{ fontSize: "10px", fontWeight: 700, margin: "0 0 2px", lineHeight: 1.2 }}
                >
                  {song}
                </motion.h2>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.h3
                  key={artist}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="info-current-song"
                  style={{ fontSize: "9px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}
                >
                  {artist}
                </motion.h3>
              </AnimatePresence>
            </div>

            {/* Bouton play/pause droite — image physique 53px */}
            <div style={{ minWidth: "60px", display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                onClick={onToggle}
                aria-label={isPlaying ? "Mettre en pause" : "Lire"}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <motion.div
                  animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.5 }}
                >
                  <Image
                    src={isPlaying ? "/img/lecteur/btn_pause.png" : "/img/lecteur/btn_play.png"}
                    alt={isPlaying ? "Pause" : "Play"}
                    width={53}
                    height={53}
                    style={{ height: "53px", width: "auto" }}
                  />
                </motion.div>
              </button>
            </div>
          </div>

          {/* Liens Paroles / Historique / Programme */}
          <div className="mt-2 flex justify-center gap-6">
            {[
              { label: "Paroles", onClick: onOpenLyrics },
              { label: "Historique", onClick: onOpenHistory },
              { label: "Programme", onClick: onOpenProgram }
            ].map(({ label, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                style={{
                  color: "#fff",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  textDecoration: "underline",
                  fontFamily: '"Trebuchet MS", Arial, sans-serif',
                  transition: "opacity 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
