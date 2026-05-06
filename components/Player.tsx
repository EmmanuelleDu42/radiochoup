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
  onOpenHistory: () => void;
  onOpenLyrics: () => void;
  onOpenProgram: () => void;
}

export function Player({
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
  return (
    <section
      className="hidden bg-[url('/img/radio_ancienne.png')] bg-cover bg-no-repeat lg:block"
      style={{ minHeight: "475px" }}
    >
      <div className="mx-auto grid max-w-3xl grid-cols-12 items-end gap-4 p-6">
        <div className="col-span-3">
          <VolumeControl
            volume={volume}
            muted={muted}
            onChange={onSetVolume}
            onToggleMute={onToggleMute}
          />
        </div>
        <div className="col-span-6">
          <NowPlaying song={nowPlaying?.song ?? "..."} artist={nowPlaying?.artist ?? "..."} />
        </div>
        <div className="col-span-3 flex justify-end">
          <PlayButton isPlaying={isPlaying} onToggle={onToggle} />
        </div>
        <div className="col-span-3">
          <CoverArt cover={cover} fallbackUrl={defaultCoverUrl} />
        </div>
        <nav className="col-span-9 flex flex-wrap gap-3 text-sm">
          <button onClick={onOpenLyrics} className="rounded bg-white/10 px-3 py-1 text-choup-pink-50 hover:bg-white/20">
            Paroles
          </button>
          <button onClick={onOpenHistory} className="rounded bg-white/10 px-3 py-1 text-choup-pink-50 hover:bg-white/20">
            Historique
          </button>
          <button onClick={onOpenProgram} className="rounded bg-white/10 px-3 py-1 text-choup-pink-50 hover:bg-white/20">
            Programme
          </button>
        </nav>
      </div>
    </section>
  );
}
