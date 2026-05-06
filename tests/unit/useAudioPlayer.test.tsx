// tests/unit/useAudioPlayer.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

class FakeAudio {
  paused = true;
  volume = 1;
  muted = false;
  src = "";
  play = vi.fn(async () => {
    this.paused = false;
  });
  pause = vi.fn(() => {
    this.paused = true;
  });
  load = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

beforeEach(() => {
  vi.stubGlobal("Audio", FakeAudio);
  vi.stubGlobal("localStorage", {
    getItem: vi.fn().mockReturnValue("80"),
    setItem: vi.fn()
  });
});

describe("useAudioPlayer", () => {
  it("démarre en pause", () => {
    const { result } = renderHook(() => useAudioPlayer("https://stream.example/"));
    expect(result.current.isPlaying).toBe(false);
  });

  it("toggle bascule entre play et pause", async () => {
    const { result } = renderHook(() => useAudioPlayer("https://stream.example/"));
    await act(async () => {
      await result.current.toggle();
    });
    expect(result.current.isPlaying).toBe(true);
  });

  it("setVolume met à jour le volume et persiste", () => {
    const { result } = renderHook(() => useAudioPlayer("https://stream.example/"));
    act(() => result.current.setVolume(50));
    expect(result.current.volume).toBe(50);
  });
});
