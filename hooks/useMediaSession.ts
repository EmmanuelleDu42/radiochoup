"use client";

import { useEffect, useRef } from "react";
import type { CoverArt } from "@/lib/types";

interface MediaSessionParams {
  song: string;
  artist: string;
  cover: CoverArt | null;
  onPlay?: () => void;
  onPause?: () => void;
}

export function useMediaSession(params: MediaSessionParams | null): void {
  // Ref to always-latest handlers so we don't re-register action handlers on each render.
  const handlersRef = useRef<Pick<MediaSessionParams, "onPlay" | "onPause">>({
    onPlay: params?.onPlay,
    onPause: params?.onPause
  });
  useEffect(() => {
    handlersRef.current = { onPlay: params?.onPlay, onPause: params?.onPause };
  });

  // Register action handlers once; they delegate to the ref.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => handlersRef.current.onPlay?.());
    navigator.mediaSession.setActionHandler("pause", () => handlersRef.current.onPause?.());

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
    };
  }, []);

  // Update metadata whenever song/artist/cover change.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!params) {
      navigator.mediaSession.metadata = null;
      return;
    }

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

    return () => {
      navigator.mediaSession.metadata = null;
    };
  }, [params?.song, params?.artist, params?.cover]);
}
