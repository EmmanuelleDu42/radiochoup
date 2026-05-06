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
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{lyrics.text}</pre>
      ) : (
        <p className="text-sm text-gray-600">Paroles indisponibles pour ce morceau.</p>
      )}
      <p className="mt-4 text-center text-xs text-gray-500">
        Powered by{" "}
        <a href="https://www.vagalume.com.br/" target="_blank" rel="noreferrer" className="underline">
          Vagalume
        </a>
      </p>
    </Modal>
  );
}
