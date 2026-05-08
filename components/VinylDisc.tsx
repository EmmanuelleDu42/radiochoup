"use client";

import React from "react";

interface Props {
  coverUrl: string;
  size?: number;
}

export function VinylDisc({ coverUrl, size = 160 }: Props) {
  const id = `vinyl-${coverUrl.replace(/[^a-z0-9]/gi, "")}`;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const labelR = size * 0.18;
  const labelInset = cx - labelR;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-grooves`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="60%" stopColor="#161616" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
        <clipPath id={`${id}-label`}>
          <circle cx={cx} cy={cy} r={labelR} />
        </clipPath>
      </defs>

      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-grooves)`} />

      {Array.from({ length: 18 }).map((_, i) => {
        const groove = r - 6 - i * ((r - labelR - 8) / 18);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={groove}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={0.6}
          />
        );
      })}

      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-shine)`} />
      <circle cx={cx} cy={cy} r={labelR + 2} fill="#fffaf1" />
      <image
        href={coverUrl}
        x={labelInset}
        y={labelInset}
        width={labelR * 2}
        height={labelR * 2}
        clipPath={`url(#${id}-label)`}
        preserveAspectRatio="xMidYMid slice"
      />
      <circle cx={cx} cy={cy} r={size * 0.018} fill="#000" />
    </svg>
  );
}
