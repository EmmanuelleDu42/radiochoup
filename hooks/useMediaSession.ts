"use client";

import { useEffect } from "react";
import type { CoverArt } from "@/lib/types";

interface MediaSessionParams {
  song: string;
  artist: string;
  cover: CoverArt | null;
  onPlay?: () => void;
  onPause?: () => void;
}

export function useMediaSession(params: MediaSessionParams | null): void {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!params) return;

    const sizes: Array<keyof CoverArt["sizes"]> = ["s96", "s128", "s192", "s256", "s384", "s512"];
    const artwork = params.cover
      ? sizes.map((key) => {
          const px = key.slice(1);
          return {
            src: params.cover!.sizes[key],
            sizes: `${px}x${px}`,
            type: "image/png"
          };
        })
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: params.song,
      artist: params.artist,
      artwork
    });

    if (params.onPlay) navigator.mediaSession.setActionHandler("play", params.onPlay);
    if (params.onPause) navigator.mediaSession.setActionHandler("pause", params.onPause);

    return () => {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
    };
  }, [params]);
}
