"use client";

import { useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaSession } from "@/hooks/useMediaSession";
import { PlayButton } from "@/components/PlayButton";
import { VolumeControl } from "@/components/VolumeControl";
import { NowPlaying } from "@/components/NowPlaying";
import { CoverArt } from "@/components/CoverArt";
import type { CoverArt as CoverArtType } from "@/lib/types";

interface Props {
  streamUrl: string;
  defaultCoverUrl: string;
  cover: CoverArtType | null;
}

export function PlayerMobile({ streamUrl, defaultCoverUrl, cover }: Props) {
  const player = useAudioPlayer(streamUrl);
  const { data: nowPlaying } = useNowPlaying();

  useKeyboardShortcuts({
    togglePlay: useCallback(() => void player.toggle(), [player]),
    toggleMute: player.toggleMute,
    setVolume: player.setVolume,
    volumeUp: useCallback(() => player.setVolume(Math.min(100, player.volume + 5)), [player]),
    volumeDown: useCallback(() => player.setVolume(Math.max(0, player.volume - 5)), [player])
  });

  useMediaSession(
    nowPlaying
      ? {
          song: nowPlaying.song,
          artist: nowPlaying.artist,
          cover,
          onPlay: () => void player.play(),
          onPause: () => player.pause()
        }
      : null
  );

  return (
    <section className="bg-[url('/img/radio_ancienne_gsm.jpg')] bg-cover bg-top p-4 lg:hidden">
      <div className="mx-auto grid max-w-md gap-4">
        <CoverArt cover={cover} fallbackUrl={defaultCoverUrl} />
        <NowPlaying song={nowPlaying?.song ?? "..."} artist={nowPlaying?.artist ?? "..."} />
        <div className="flex items-center justify-between">
          <VolumeControl
            volume={player.volume}
            muted={player.muted}
            onChange={player.setVolume}
            onToggleMute={player.toggleMute}
          />
          <PlayButton isPlaying={player.isPlaying} onToggle={() => void player.toggle()} />
        </div>
      </div>
    </section>
  );
}
