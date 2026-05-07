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
    <section className="lg:hidden flex flex-col items-center w-full">
      {/* Cover art au-dessus de la radio */}
      <div className="flex justify-center pt-4 pb-2">
        <div
          className="relative"
          style={{
            background: "url('/img/Tableau.png') no-repeat center",
            backgroundSize: "contain",
            width: "110px",
            height: "110px",
            flexShrink: 0
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "20px",
              width: "70px",
              height: "70px",
              backgroundImage: `url('${coverUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "background-image 1s",
              boxShadow: "0px 5px 10px 3px rgba(0,0,0,0.4)"
            }}
          />
        </div>
      </div>

      {/* Now-playing centré */}
      <div className="text-center px-4 mb-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={song}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="info-current-song"
            style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90vw" }}
          >
            {song}
          </motion.p>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={artist}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="info-current-song"
            style={{ fontSize: "11px", fontWeight: 700, margin: 0 }}
          >
            {artist}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Radio GSM — image complète, proportions préservées */}
      {/* Legacy: width 370px height 600px background-size:cover — on prend 90vw minimum */}
      <div
        className="relative"
        style={{
          backgroundImage: "url('/img/radio_ancienne_gsm.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          width: "min(370px, 90vw)",
          aspectRatio: "370 / 600",
          maxWidth: "90vw",
          flexShrink: 0
        }}
      >
        {/* Bouton play — positionné sur le "haut-parleur" de la radio gsm */}
        {/* top: 185px / 600 ≈ 30.8% ; left: ~50% centré */}
        <div
          className="absolute"
          style={{
            top: "30%",
            left: "50%",
            transform: "translate(-50%, 0)"
          }}
        >
          <button
            type="button"
            onClick={onToggle}
            aria-label={isPlaying ? "Mettre en pause" : "Lire"}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <motion.div
              animate={isPlaying ? { scale: [1, 1.07, 1] } : { scale: 1 }}
              transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.5 }}
            >
              <Image
                src={isPlaying ? "/img/lecteur/btn_pause.png" : "/img/lecteur/btn_play.png"}
                alt={isPlaying ? "Pause" : "Play"}
                width={70}
                height={70}
                style={{ height: "70px", width: "auto" }}
              />
            </motion.div>
          </button>
        </div>

        {/* Zone titre — positionnée dans la zone écran du GSM */}
        {/* top: 242px / 600 ≈ 40.3% */}
        <div
          className="absolute text-center"
          style={{
            top: "40%",
            left: "5%",
            right: "5%"
          }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={`gsm-${song}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="info-current-song"
              style={{ fontSize: "11px", fontWeight: 700, margin: "0 0 2px", lineHeight: 1.3 }}
            >
              {song}
            </motion.p>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={`gsm-artist-${artist}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="info-current-song"
              style={{ fontSize: "10px", fontWeight: 700, margin: 0, lineHeight: 1.3 }}
            >
              {artist}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Volume slider sous la radio */}
      <div
        className="flex items-center gap-3 px-6 py-3 w-full max-w-xs"
      >
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          style={{ color: "#71bfbb", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
        >
          {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          aria-label="Volume"
          onChange={(e) => onSetVolume(Number(e.currentTarget.value))}
          style={{ flex: 1 }}
        />
        <span style={{ color: "#fff", fontSize: "11px", minWidth: "28px", textAlign: "right" }}>
          {muted ? 0 : volume}
        </span>
      </div>

      {/* Footer fixe mobile : Paroles / Historique / Programme */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-3 lg:hidden"
        style={{
          background: "rgba(205,119,132,0.95)",
          borderTop: "1px solid #ef929d",
          zIndex: 40
        }}
      >
        <button
          type="button"
          onClick={onOpenLyrics}
          className="flex flex-col items-center gap-1"
          style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", fontSize: "10px" }}
        >
          <span style={{ background: "#71bfbb", borderRadius: "50%", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Music size={20} color="#fff" />
          </span>
          <span>Paroles</span>
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex flex-col items-center gap-1"
          style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", fontSize: "10px" }}
        >
          <span style={{ background: "#71bfbb", borderRadius: "50%", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <History size={20} color="#fff" />
          </span>
          <span>Historique</span>
        </button>
        <button
          type="button"
          onClick={onOpenProgram}
          className="flex flex-col items-center gap-1"
          style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", fontSize: "10px" }}
        >
          <span style={{ background: "#71bfbb", borderRadius: "50%", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CalendarDays size={20} color="#fff" />
          </span>
          <span>Programme</span>
        </button>
      </div>

      {/* Spacer pour le footer fixe */}
      <div className="h-16 lg:hidden" />
    </section>
  );
}
