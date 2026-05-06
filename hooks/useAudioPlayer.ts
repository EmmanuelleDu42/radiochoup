"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAudioPlayerResult {
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  setVolume: (value: number) => void;
  toggleMute: () => void;
}

const STORAGE_KEY = "radiochoup_volume";

export function useAudioPlayer(streamUrl: string): UseAudioPlayerResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const volumeRef = useRef(80);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const initial = stored ? Number(stored) : 80;
    setVolumeState(initial);
    volumeRef.current = initial;

    const audio = new Audio(streamUrl);
    audio.volume = initial / 100;
    audio.preload = "none";
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, [streamUrl]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    await audio.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await play();
    } else {
      pause();
    }
  }, [pause, play]);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    if (clamped === volumeRef.current) return;
    volumeRef.current = clamped;
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped / 100;
      audioRef.current.muted = clamped === 0;
    }
    setMuted(clamped === 0);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(clamped));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (muted) {
      // Unmute: restore DOM audio state and React muted flag unconditionally.
      // We cannot rely on setVolume() to clear the muted flag because setVolume()
      // has an early-return guard when the volume value hasn't changed.
      audioRef.current.muted = false;
      setMuted(false);
    } else {
      audioRef.current.muted = true;
      setMuted(true);
    }
  }, [muted]);

  return { isPlaying, volume, muted, play, pause, toggle, setVolume, toggleMute };
}
