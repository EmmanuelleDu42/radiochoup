"use client";

import { useEffect } from "react";

interface Handlers {
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (value: number) => void;
  volumeUp: () => void;
  volumeDown: () => void;
}

export function useKeyboardShortcuts(handlers: Handlers): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      if (e.code === "Space" || e.code === "KeyP") {
        e.preventDefault();
        handlers.togglePlay();
        return;
      }
      if (e.code === "KeyM") {
        e.preventDefault();
        handlers.toggleMute();
        return;
      }
      if (e.code === "ArrowUp") {
        e.preventDefault();
        handlers.volumeUp();
        return;
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        handlers.volumeDown();
        return;
      }
      if (e.code.startsWith("Digit") || e.code.startsWith("Numpad")) {
        const digit = Number(e.key);
        if (Number.isInteger(digit) && digit >= 0 && digit <= 9) {
          e.preventDefault();
          handlers.setVolume(digit * 10);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}
