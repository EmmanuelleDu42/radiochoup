"use client";

import { PlayButton } from "@/components/PlayButton";
import { VolumeControl } from "@/components/VolumeControl";
import { NowPlaying } from "@/components/NowPlaying";
import { CoverArt } from "@/components/CoverArt";
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
  onToggleMute
}: Props) {
  return (
    <section className="bg-[url('/img/radio_ancienne_gsm.jpg')] bg-cover bg-top p-4 lg:hidden">
      <div className="mx-auto grid max-w-md gap-4">
        <CoverArt cover={cover} fallbackUrl={defaultCoverUrl} />
        <NowPlaying song={nowPlaying?.song ?? "..."} artist={nowPlaying?.artist ?? "..."} />
        <div className="flex items-center justify-between">
          <VolumeControl
            volume={volume}
            muted={muted}
            onChange={onSetVolume}
            onToggleMute={onToggleMute}
          />
          <PlayButton isPlaying={isPlaying} onToggle={onToggle} />
        </div>
      </div>
    </section>
  );
}
