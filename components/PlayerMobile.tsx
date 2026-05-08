"use client";

import Image from "next/image";
import { Volume2, VolumeX, Music, History, CalendarDays } from "lucide-react";
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
  onOpenHistory?: () => void;
  onOpenLyrics?: () => void;
  onOpenProgram?: () => void;
}

export function PlayerMobile({
  nowPlaying,
  cover,
  defaultCoverUrl,
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
  const coverUrl = cover?.url ?? defaultCoverUrl;

  return (
    <section
      id="player-mobile-section"
      className="lg:hidden flex flex-col items-center w-full"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        padding: 0,
        background: "#14342f"
      }}
    >
      {/* Hero plein écran — image radio en bas, respiration en haut */}
      <div
        id="mobile-hero"
        style={{
          position: "relative",
          width: "100vw",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          background: "#14342f",
          isolation: "isolate"
        }}
      >
        {/* Fond hero — mur teal + table en bois (sans radio) ; sur écrans larges l'image descend pour révéler le haut */}
        <div
          id="mobile-hero-visual"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/img/radio-choup-mobile-fond.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center calc(100% + 100px + max(0px, (100vw - 600px) * 0.45))",
            transform: "scale(1.015)"
          }}
        />

        {/* Radio posée — DEUX couches : 1) corps avec ombre (antenne clippée pour pas de halo), 2) image complète au-dessus */}
        <img
          id="mobile-hero-radio-shadow"
          src="/img/radio_ancienne_mobile.png"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            bottom: "min(calc(39vw - 150px), calc(100% - 57.7vw - 120px), 14px)",
            transform: "translateX(-50%)",
            width: "82%",
            height: "auto",
            zIndex: 1,
            pointerEvents: "none",
            clipPath: "inset(12% 0 0 0)",
            filter:
              "drop-shadow(0 8px 3px rgba(255,225,180,0.65)) drop-shadow(0 14px 6px rgba(255,220,170,0.3))"
          }}
        />
        <img
          id="mobile-hero-radio"
          src="/img/radio_ancienne_mobile.png"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            bottom: "min(calc(39vw - 150px), calc(100% - 57.7vw - 120px), 14px)",
            transform: "translateX(-50%)",
            width: "82%",
            height: "auto",
            zIndex: 2,
            pointerEvents: "none"
          }}
        />

        {/* Overlay gradient pour la lisibilité */}
        <div
          id="mobile-hero-overlay"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(to bottom, rgba(8,23,21,0.62) 0%, rgba(8,23,21,0.10) 38%, rgba(8,23,21,0.20) 60%, rgba(8,23,21,0.55) 100%), radial-gradient(circle at 50% 44%, rgba(55,207,196,0.18), transparent 45%)"
          }}
        />

        {/* Contenu superposé */}
        <div
          id="mobile-hero-content"
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "clamp(24px, 6vw, 36px) clamp(20px, 5vw, 28px)",
            color: "#fffaf1"
          }}
        >
          {/* Kicker */}
          <span
            id="mobile-hero-kicker"
            style={{
              alignSelf: "flex-start",
              padding: "7px 13px",
              border: "1px solid rgba(255,250,241,0.28)",
              borderRadius: "999px",
              color: "#f5ead8",
              background: "rgba(12,45,41,0.36)",
              backdropFilter: "blur(10px)",
              fontSize: "0.72rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700
            }}
          >
            Radio Choup · En direct
          </span>

          {/* Now-playing : pochette + titre + artiste */}
          <div
            id="mobile-hero-now-playing"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginTop: "22px"
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                id="mobile-cover-art"
                key={coverUrl}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 0.9, 0.3, 1] }}
                style={{
                  flexShrink: 0,
                  width: "62px",
                  height: "62px",
                  backgroundImage: `url('${coverUrl}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "8px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,250,241,0.18)"
                }}
              />
            </AnimatePresence>
            <div style={{ minWidth: 0, flex: 1 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  id="mobile-now-playing-song"
                  key={song}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.32 }}
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    color: "#fffaf1",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical"
                  }}
                >
                  {song}
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div
                  id="mobile-now-playing-artist"
                  key={artist}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.32, delay: 0.06 }}
                  style={{
                    marginTop: "3px",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    color: "rgba(255,250,241,0.78)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {artist}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div style={{ flex: 1 }} />
        </div>
      </div>

      {/* Volume slider — flottant juste au-dessus du footer nav */}
      <div
        id="mobile-volume-bar"
        className="flex items-center gap-3"
        style={{
          width: "100%",
          maxWidth: "430px",
          padding: "10px 18px 14px",
          color: "#fffaf1",
          background: "rgba(20,52,47,0.92)",
          backdropFilter: "blur(8px)"
        }}
      >
        {/* Bouton play/pause compact à gauche du contrôle volume */}
        <button
          id="mobile-play-pause-btn"
          type="button"
          onClick={onToggle}
          aria-label={isPlaying ? "Mettre en pause" : "Lire"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))"
          }}
        >
          <motion.div
            animate={isPlaying ? { scale: [1, 1.07, 1] } : { scale: 1 }}
            transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.5 }}
          >
            <Image
              src={isPlaying ? "/img/lecteur/btn_pause.png" : "/img/lecteur/btn_play.png"}
              alt={isPlaying ? "Pause" : "Play"}
              width={36}
              height={36}
              style={{ height: "36px", width: "auto" }}
            />
          </motion.div>
        </button>
        <button
          id="mobile-volume-mute-btn"
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          style={{
            color: "#71bfbb",
            background: "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            padding: 0
          }}
        >
          {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
        <input
          id="mobile-volume-slider"
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          aria-label="Volume"
          onChange={(e) => onSetVolume(Number(e.currentTarget.value))}
          style={{ flex: 1 }}
        />
        <span
          id="mobile-volume-value"
          style={{ fontSize: "11px", minWidth: "28px", textAlign: "right", color: "#fffaf1" }}
        >
          {muted ? 0 : volume}
        </span>
      </div>

      {/* Footer mobile : Paroles / Historique / Programme */}
      <div
        id="mobile-bottom-nav"
        className="flex items-center justify-around py-3 lg:hidden"
        style={{
          width: "100%",
          background: "rgba(58,38,24,0.92)",
          borderTop: "1px solid rgba(245,234,216,0.18)",
          backdropFilter: "blur(8px)"
        }}
      >
        {[
          { id: "mobile-nav-lyrics", label: "Paroles", Icon: Music, onClick: onOpenLyrics },
          { id: "mobile-nav-history", label: "Historique", Icon: History, onClick: onOpenHistory },
          { id: "mobile-nav-program", label: "Programme", Icon: CalendarDays, onClick: onOpenProgram }
        ].map(({ id, label, Icon, onClick }) => (
          <button
            id={id}
            key={label}
            type="button"
            onClick={onClick}
            className="flex flex-col items-center gap-1"
            style={{
              color: "#f5ead8",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: '"Trebuchet MS", Arial, sans-serif',
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: "8px",
              transition: "background 0.15s, transform 0.1s"
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = "rgba(255,250,241,0.15)";
              e.currentTarget.style.transform = "scale(0.94)";
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <span
              style={{
                background: "#37cfc4",
                borderRadius: "50%",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
              }}
            >
              <Icon size={20} color="#3a2618" />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>

    </section>
  );
}
