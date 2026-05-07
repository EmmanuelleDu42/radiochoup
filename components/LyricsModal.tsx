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
  return (
    <Modal open={open} onClose={onClose} title={`${song} — ${artist}`} titleId="lyrics-title">
      {lyrics.available && lyrics.text ? (
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "sans-serif", fontSize: "14px", lineHeight: 1.6, color: "#fff" }}>
          {lyrics.text}
        </pre>
      ) : (
        <p style={{ fontSize: "13px", color: "#ccc" }}>Paroles indisponibles pour ce morceau.</p>
      )}
      <p style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", color: "#aaa" }}>
        Powered by{" "}
        <a
          href="https://www.vagalume.com.br/"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#71bfbb", textDecoration: "underline" }}
        >
          Vagalume
        </a>
      </p>
    </Modal>
  );
}
