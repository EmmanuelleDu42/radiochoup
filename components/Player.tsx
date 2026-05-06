"use client";

import { useCallback, useState } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useHistory } from "@/hooks/useHistory";
import { useLyrics } from "@/hooks/useLyrics";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaSession } from "@/hooks/useMediaSession";
import { PlayButton } from "@/components/PlayButton";
import { VolumeControl } from "@/components/VolumeControl";
import { NowPlaying } from "@/components/NowPlaying";
import { CoverArt } from "@/components/CoverArt";
import { HistoryModal } from "@/components/HistoryModal";
import { LyricsModal } from "@/components/LyricsModal";
import { ProgramModal } from "@/components/ProgramModal";
import type { CoverArt as CoverArtType } from "@/lib/types";

interface Props {
  streamUrl: string;
  defaultCoverUrl: string;
  cover: CoverArtType | null;
}

export function Player({ streamUrl, defaultCoverUrl, cover }: Props) {
  const player = useAudioPlayer(streamUrl);
  const { data: nowPlaying } = useNowPlaying();
  const history = useHistory(5);
  const [openHistory, setOpenHistory] = useState(false);
  const [openLyrics, setOpenLyrics] = useState(false);
  const [openProgram, setOpenProgram] = useState(false);

  const lyricsParams =
    nowPlaying?.song && nowPlaying.artist
      ? { artist: nowPlaying.artist, song: nowPlaying.song }
      : null;
  const lyrics = useLyrics(lyricsParams);

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
    <section
      className="hidden bg-[url('/img/radio_ancienne.png')] bg-cover bg-no-repeat lg:block"
      style={{ minHeight: "475px" }}
    >
      <div className="mx-auto grid max-w-3xl grid-cols-12 items-end gap-4 p-6">
        <div className="col-span-3">
          <VolumeControl
            volume={player.volume}
            muted={player.muted}
            onChange={player.setVolume}
            onToggleMute={player.toggleMute}
          />
        </div>
        <div className="col-span-6">
          <NowPlaying song={nowPlaying?.song ?? "..."} artist={nowPlaying?.artist ?? "..."} />
        </div>
        <div className="col-span-3 flex justify-end">
          <PlayButton isPlaying={player.isPlaying} onToggle={() => void player.toggle()} />
        </div>
        <div className="col-span-3">
          <CoverArt cover={cover} fallbackUrl={defaultCoverUrl} />
        </div>
        <nav className="col-span-9 flex flex-wrap gap-3 text-sm">
          <button onClick={() => setOpenLyrics(true)} className="rounded bg-white/10 px-3 py-1 text-choup-pink-50 hover:bg-white/20">
            Paroles
          </button>
          <button onClick={() => setOpenHistory(true)} className="rounded bg-white/10 px-3 py-1 text-choup-pink-50 hover:bg-white/20">
            Historique
          </button>
          <button onClick={() => setOpenProgram(true)} className="rounded bg-white/10 px-3 py-1 text-choup-pink-50 hover:bg-white/20">
            Programme
          </button>
        </nav>
      </div>

      <HistoryModal open={openHistory} onClose={() => setOpenHistory(false)} entries={history} />
      <LyricsModal
        open={openLyrics}
        onClose={() => setOpenLyrics(false)}
        song={nowPlaying?.song ?? ""}
        artist={nowPlaying?.artist ?? ""}
        lyrics={lyrics}
      />
      <ProgramModal open={openProgram} onClose={() => setOpenProgram(false)} />
    </section>
  );
}
