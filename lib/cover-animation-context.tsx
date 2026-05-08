"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CoverAnimationState {
  isAnimating: boolean;
  startAnimation: () => void;
  endAnimation: () => void;
}

const CoverAnimationContext = createContext<CoverAnimationState | null>(null);

export function CoverAnimationProvider({ children }: { children: ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const startAnimation = useCallback(() => setIsAnimating(true), []);
  const endAnimation = useCallback(() => setIsAnimating(false), []);
  return (
    <CoverAnimationContext.Provider value={{ isAnimating, startAnimation, endAnimation }}>
      {children}
    </CoverAnimationContext.Provider>
  );
}

export function useCoverAnimation(): CoverAnimationState {
  const ctx = useContext(CoverAnimationContext);
  if (!ctx) {
    return { isAnimating: false, startAnimation: () => {}, endAnimation: () => {} };
  }
  return ctx;
}
