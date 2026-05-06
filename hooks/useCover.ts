"use client";

import { useEffect, useState } from "react";
import type { CoverArt } from "@/lib/types";

export function useCover(params: { artist: string; song: string } | null, fallback: CoverArt | null): CoverArt | null {
  const [cover, setCover] = useState<CoverArt | null>(fallback);

  useEffect(() => {
    if (!params?.artist || !params?.song) return;
    const controller = new AbortController();
    const url = new URL("/api/cover", window.location.origin);
    url.searchParams.set("artist", params.artist);
    url.searchParams.set("song", params.song);

    fetch(url.toString(), { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CoverArt | null) => {
        if (data) setCover(data);
      })
      .catch(() => {
        // ignore aborts/errors
      });

    return () => controller.abort();
  }, [params?.artist, params?.song]);

  return cover;
}
