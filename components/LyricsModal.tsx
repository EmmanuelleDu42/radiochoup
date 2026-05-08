"use client";

import { Modal } from "@/components/Modal";
import type { Lyrics } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  song: string;
  artist: string;
  lyrics: Lyrics;
}

export function LyricsModal({ open, onClose, song, artist, lyrics }: Props) {
  const title = song && artist ? `${song} — ${artist}` : "Paroles";
  return (
    <Modal open={open} onClose={onClose} title={title} titleId="lyrics-title" accent="pink">
      {lyrics.available && lyrics.text ? (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: '"Trebuchet MS", Arial, Helvetica, sans-serif',
            fontSize: "14px",
            lineHeight: 1.7,
            color: "#2b2b2b",
            background: "#f5efe8",
            padding: "16px 18px",
            borderRadius: "8px",
            margin: 0
          }}
        >
          {lyrics.text}
        </pre>
      ) : (
        <p
          style={{
            fontSize: "14px",
            color: "#6a6a6a",
            textAlign: "center",
            padding: "24px 0",
            fontStyle: "italic"
          }}
        >
          Paroles indisponibles pour ce morceau.
        </p>
      )}
      <p style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", color: "#8a8a8a" }}>
        Powered by{" "}
        <a
          href="https://www.vagalume.com.br/"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#cd7784", textDecoration: "underline" }}
        >
          Vagalume
        </a>
      </p>
    </Modal>
  );
}
