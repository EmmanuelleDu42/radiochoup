"use client";

import { useState } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useStreamEvents } from "@/hooks/useStreamEvents";
import { useCover } from "@/hooks/useCover";
import { useLyrics } from "@/hooks/useLyrics";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaSession } from "@/hooks/useMediaSession";
import { Player } from "@/components/Player";
import { PlayerMobile } from "@/components/PlayerMobile";
import { HistoryModal } from "@/components/HistoryModal";
import { LyricsModal } from "@/components/LyricsModal";
import { ProgramModal } from "@/components/ProgramModal";
import type { CoverArt } from "@/lib/types";

interface Props {
  streamUrl: string;
  defaultCoverUrl: string;
  initialCover: CoverArt | null;
  radioImages: string[];
}

export function PlayerShell({ streamUrl, defaultCoverUrl, initialCover, radioImages }: Props) {
  const player = useAudioPlayer(streamUrl);
  const { nowPlaying, history } = useStreamEvents();
  const cover = useCover(nowPlaying ? { artist: nowPlaying.artist, song: nowPlaying.song } : null, initialCover);
  const [openHistory, setOpenHistory] = useState(false);
  const [openLyrics, setOpenLyrics] = useState(false);
  const [openProgram, setOpenProgram] = useState(false);

  const lyricsParams =
    nowPlaying?.song && nowPlaying.artist
      ? { artist: nowPlaying.artist, song: nowPlaying.song }
      : null;
  const lyrics = useLyrics(lyricsParams);

  useKeyboardShortcuts({
    togglePlay: () => void player.toggle(),
    toggleMute: player.toggleMute,
    setVolume: player.setVolume,
    volumeUp: () => player.setVolume(Math.min(100, player.volume + 5)),
    volumeDown: () => player.setVolume(Math.max(0, player.volume - 5))
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
    <>
      <Player
        nowPlaying={nowPlaying}
        cover={cover}
        defaultCoverUrl={defaultCoverUrl}
        volume={player.volume}
        muted={player.muted}
        isPlaying={player.isPlaying}
        onToggle={() => void player.toggle()}
        onSetVolume={player.setVolume}
        onToggleMute={player.toggleMute}
        onOpenHistory={() => setOpenHistory(true)}
        onOpenLyrics={() => setOpenLyrics(true)}
        onOpenProgram={() => setOpenProgram(true)}
        radioImages={radioImages}
      />
      <PlayerMobile
        nowPlaying={nowPlaying}
        cover={cover}
        defaultCoverUrl={defaultCoverUrl}
        volume={player.volume}
        muted={player.muted}
        isPlaying={player.isPlaying}
        onToggle={() => void player.toggle()}
        onSetVolume={player.setVolume}
        onToggleMute={player.toggleMute}
        onOpenHistory={() => setOpenHistory(true)}
        onOpenLyrics={() => setOpenLyrics(true)}
        onOpenProgram={() => setOpenProgram(true)}
      />
      <HistoryModal open={openHistory} onClose={() => setOpenHistory(false)} entries={history.slice(0, 5)} />
      <LyricsModal
        open={openLyrics}
        onClose={() => setOpenLyrics(false)}
        song={nowPlaying?.song ?? ""}
        artist={nowPlaying?.artist ?? ""}
        lyrics={lyrics}
      />
      <ProgramModal open={openProgram} onClose={() => setOpenProgram(false)} />
    </>
  );
}
