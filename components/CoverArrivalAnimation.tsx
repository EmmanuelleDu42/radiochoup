"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { CoverArt } from "@/lib/types";
import { VinylDisc } from "@/components/VinylDisc";
import { useTargetRect } from "@/hooks/useTargetRect";
import { useCoverAnimation } from "@/lib/cover-animation-context";

interface Props {
  cover: CoverArt | null;
}

const COVER_SIZE = 220;
const VINYL_SIZE = 240;

export function CoverArrivalAnimation({ cover }: Props) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const previousUrlRef = useRef<string | null>(null);
  const { startAnimation, endAnimation } = useCoverAnimation();
  const headerRect = useTargetRect("#header-cover-art");
  const radioRect = useTargetRect("#radio-frame-bg");

  useEffect(() => {
    const url = cover?.url ?? null;
    if (previousUrlRef.current === null) {
      previousUrlRef.current = url;
      return;
    }
    if (url && url !== previousUrlRef.current) {
      previousUrlRef.current = url;
      startAnimation();
      setActiveUrl(url);
    }
  }, [cover?.url, startAnimation]);

  if (!activeUrl) return null;

  const viewportCenterX = typeof window !== "undefined" ? window.innerWidth / 2 : 600;
  const viewportCenterY = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

  const headerCenterX = headerRect ? headerRect.left + headerRect.width / 2 : viewportCenterX + 400;
  const headerCenterY = headerRect ? headerRect.top + headerRect.height / 2 : 100;
  const headerScale = headerRect ? headerRect.width / COVER_SIZE : 0.35;

  const radioCenterX = radioRect ? radioRect.left + radioRect.width / 2 : viewportCenterX;
  const radioCenterY = radioRect ? radioRect.top + radioRect.height / 2 : viewportCenterY + 150;

  return (
    <div
      data-testid="cover-arrival-overlay"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9000
      }}
    >
      <motion.div
        key={`cover-${activeUrl}`}
        initial={{
          x: viewportCenterX - COVER_SIZE / 2,
          y: -COVER_SIZE - 50,
          rotate: -8,
          scale: 0.6,
          opacity: 0
        }}
        animate={{
          x: [
            viewportCenterX - COVER_SIZE / 2,
            viewportCenterX - COVER_SIZE / 2,
            viewportCenterX - COVER_SIZE / 2,
            headerCenterX - COVER_SIZE / 2
          ],
          y: [
            -COVER_SIZE - 50,
            viewportCenterY - COVER_SIZE / 2,
            viewportCenterY - COVER_SIZE / 2,
            headerCenterY - COVER_SIZE / 2
          ],
          rotate: [-8, 0, 0, 4],
          scale: [0.6, 1.15, 1.15, headerScale],
          opacity: [0, 1, 1, 1]
        }}
        transition={{
          times: [0, 0.27, 0.6, 1],
          duration: 3,
          ease: ["easeOut", "easeOut", "easeInOut"]
        }}
        onAnimationComplete={() => {
          endAnimation();
          setActiveUrl(null);
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: COVER_SIZE,
          height: COVER_SIZE,
          backgroundImage: `url('${activeUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 6,
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.6), 0 8px 16px -8px rgba(0,0,0,0.4)"
        }}
      />

      <motion.div
        key={`vinyl-${activeUrl}`}
        initial={{
          x: viewportCenterX - VINYL_SIZE / 2,
          y: viewportCenterY - VINYL_SIZE / 2,
          scale: 0,
          rotate: 0,
          opacity: 0,
          filter: "blur(0px)"
        }}
        animate={{
          x: [
            viewportCenterX - VINYL_SIZE / 2,
            viewportCenterX - VINYL_SIZE / 2 - 80,
            radioCenterX - VINYL_SIZE / 2
          ],
          y: [
            viewportCenterY - VINYL_SIZE / 2,
            viewportCenterY - VINYL_SIZE / 2 + 30,
            radioCenterY - VINYL_SIZE / 2
          ],
          scale: [0, 1, 0.55],
          rotate: [0, 240, 1080],
          opacity: [0, 1, 0],
          filter: ["blur(0px)", "blur(0px)", "blur(2px)"]
        }}
        transition={{
          times: [0, 0.5, 1],
          duration: 1.8,
          delay: 1.2,
          ease: ["easeOut", "easeIn"]
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: VINYL_SIZE,
          height: VINYL_SIZE
        }}
      >
        <VinylDisc coverUrl={activeUrl} size={VINYL_SIZE} />
      </motion.div>
    </div>
  );
}
