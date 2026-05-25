"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NowPlaying as NowPlayingType } from "@/lib/types";
import {
  RADIO_CALIBRATION,
  RADIO_NATIVE_WIDTH,
  interpolateRadio
} from "@/lib/radio-calibration";

interface Props {
  nowPlaying: NowPlayingType | null;
  volume: number;
  muted: boolean;
  isPlaying: boolean;
  onToggle: () => void;
  onSetVolume: (value: number) => void;
  onToggleMute: () => void;
  onOpenHistory: () => void;
  onOpenLyrics: () => void;
  onOpenProgram: () => void;
  radioImages: string[];
}

export function Player({
  nowPlaying,
  volume,
  muted,
  isPlaying,
  onToggle,
  onSetVolume,
  onToggleMute,
  onOpenHistory,
  onOpenLyrics,
  onOpenProgram,
  radioImages
}: Props) {
  const song = nowPlaying?.song ?? "...";
  const artist = nowPlaying?.artist ?? "...";

  const [radioIndex, setRadioIndex] = useState(0);
  const radioBg = radioImages[radioIndex % radioImages.length] ?? radioImages[0];

  const cycleRadio = () => setRadioIndex((i) => (i + 1) % radioImages.length);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Interpolation de la taille/position de la radio + position du footer à
  // partir de la table de calibration (lib/radio-calibration.ts). Pilote des
  // variables CSS sur :root, consommées par #radio-wrapper, #radio-frame et
  // #page-main dans globals.css. Évite une pile de media queries ingérable.
  useEffect(() => {
    const apply = () => {
      const vw = window.innerWidth;
      const width = interpolateRadio(RADIO_CALIBRATION, vw, "width");
      const top = interpolateRadio(RADIO_CALIBRATION, vw, "top");
      const right = interpolateRadio(RADIO_CALIBRATION, vw, "right");
      const footerTop = interpolateRadio(RADIO_CALIBRATION, vw, "footerTop");
      const header = document.getElementById("site-header");
      const headerH = header ? header.offsetHeight : 199;
      const root = document.documentElement.style;
      root.setProperty("--radio-width", `${width}px`);
      root.setProperty("--radio-top", `${top}px`);
      root.setProperty("--radio-right", `${right}px`);
      root.setProperty("--radio-scale", String(width / RADIO_NATIVE_WIDTH));
      root.setProperty("--page-main-minh", `${Math.max(0, footerTop - headerH)}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return (
    <section
      id="player-section"
      className="hidden lg:flex lg:justify-center"
      style={{ marginBottom: "4px" }}
    >
      {/* Wrapper auto-proportionnel : taille responsive + container-query (CSS dans globals.css) */}
      <div id="radio-wrapper" ref={wrapperRef}>
      {/* Conteneur intrinsèque 673×475, scalé par le wrapper via transform */}
      <div
        id="radio-frame"
        className="relative"
      >
        {/* Couche image — sans filter ni effet de bord */}
        <div
          id="radio-frame-bg"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${radioBg}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "top center",
            transition: "background-image 0.6s ease-in-out",
            pointerEvents: "none"
          }}
        />

        {/* Bouton "Changer la radio" — bouton rétro turquoise/crème, en haut à droite du cadre */}
        {radioImages.length > 1 && (
          <button
            id="radio-switcher"
            type="button"
            onClick={cycleRadio}
            aria-label="Changer le poste de radio"
            title="Changer le poste de radio"
          >
            <Repeat size={20} color="#71bfbb" strokeWidth={2.5} />
          </button>
        )}
        {/* Zone des contrôles dans la radio (sur l'écran) */}
        <div
          id="radio-controls-zone"
          className="absolute"
          style={{
            top: "280px",
            left: "93px",
            right: "95px",
            paddingBottom: "30px"
          }}
        >
          {/* Rangée principale : volume | now-playing | play */}
          <div
            id="radio-controls-row"
            className="flex items-center justify-center gap-3 px-4"
            style={{ minHeight: "70px" }}
          >
            {/* Bloc Volume (gauche) */}
            <div
              id="volume-block"
              className="flex flex-col items-center gap-1"
              style={{ minWidth: "60px" }}
            >
              <button
                id="volume-mute-btn"
                type="button"
                onClick={onToggleMute}
                aria-label={muted ? "Activer le son" : "Couper le son"}
                style={{
                  color: "#71bfbb",
                  fontSize: "22px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "3px"
                }}
              >
                {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
              <input
                id="volume-slider"
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                aria-label="Volume"
                onChange={(e) => onSetVolume(Number(e.currentTarget.value))}
                style={{ width: "70px" }}
              />
            </div>

            {/* Bloc Now-playing (centre) */}
            <div
              id="now-playing-block"
              className="flex-1 text-center"
              style={{ minWidth: 0 }}
            >
              <AnimatePresence mode="wait">
                <motion.h2
                  id="now-playing-song"
                  key={song}
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.4 }}
                  className="info-current-song"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    margin: "0 0 2px",
                    lineHeight: 1.2,
                    paddingBottom: "5px"
                  }}
                >
                  {song}
                </motion.h2>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.h3
                  id="now-playing-artist"
                  key={artist}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="info-current-song"
                  style={{ fontSize: "11px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}
                >
                  {artist}
                </motion.h3>
              </AnimatePresence>
            </div>

            {/* Bloc Play / Pause (droite) — image bouton physique 53px */}
            <div
              id="play-block"
              style={{ minWidth: "60px", display: "flex", justifyContent: "center" }}
            >
              <button
                id="play-pause-btn"
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

          {/* Liens secondaires (Paroles / Historique / Programme) */}
          <div
            id="radio-secondary-links"
            className="mt-2 flex justify-center gap-6"
          >
            {[
              { id: "link-lyrics", label: "Paroles", onClick: onOpenLyrics },
              { id: "link-history", label: "Historique", onClick: onOpenHistory },
              { id: "link-program", label: "Programme", onClick: onOpenProgram }
            ].map(({ id, label, onClick }) => (
              <button
                id={id}
                key={label}
                type="button"
                onClick={onClick}
                style={{
                  color: "#000",
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
      </div>
    </section>
  );
}
