# Cover Cinematic Arrival — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a new track starts playing, the iTunes album cover falls from the top of the screen into the viewport center, ejects a vinyl record that flies behind the radio chassis, then continues its trajectory to land on its pinned spot inside the kitchen frame (`Tableau.png`) at the top-right of the header. Total sequence ~3 s.

**Architecture:**
1. Fix the existing data-flow bug: the `<Header>` component is currently passed an SSR-only `cover` prop and never receives live updates. Convert `<Header>` into a live consumer of `useStreamEvents` + `useCover` (uses the existing SSE singleton — no extra connection).
2. Introduce a `<VinylDisc>` SVG component (black disc with concentric grooves + circular center label that displays the cover image).
3. Introduce a `<CoverArrivalAnimation>` overlay (`position: fixed`, top z-index) that orchestrates the 3-stage choreography with framer-motion keyframes. Target landing position is computed at runtime via `getBoundingClientRect()` against the existing `#header-cover-art` and `#radio-frame-bg` elements.
4. The pinned cover inside the kitchen frame is hidden (`opacity: 0`) during the animation and faded back in at the end, so the animated copy seamlessly "becomes" the pinned cover.
5. First-load animation is skipped (avoids hijacking the first paint for 3 s). Re-trigger on every subsequent `cover.url` change. If a new cover arrives mid-animation, the in-flight sequence is cancelled and restarted with the new cover.

**Tech Stack:** Next.js 15.2 (App Router), React 19, TypeScript, framer-motion 11.15, Vitest + @testing-library/react for unit, Playwright for e2e, Tailwind v4.

---

## File Structure

**To be created:**
- `components/VinylDisc.tsx` — pure presentational SVG vinyl with cover label.
- `components/CoverArrivalAnimation.tsx` — fixed overlay that runs the 3-stage choreography on every `cover.url` change after first mount.
- `hooks/useTargetRect.ts` — small utility hook that exposes the latest `DOMRect` of an element selected by CSS selector, recomputed on resize.
- `tests/unit/VinylDisc.test.tsx` — smoke test asserting the SVG renders with the supplied cover URL inside the label clipPath.
- `tests/unit/CoverArrivalAnimation.test.tsx` — verifies the animation skips first mount and triggers on subsequent `cover.url` change.

**To be modified:**
- `components/Header.tsx` — drop `cover`/`defaultCoverUrl` props, internally consume `useStreamEvents` + `useCover`, accept `initialCover` only. Remove the confined slide animation from `#header-cover-art` (replaced by the global cinematic). Hide the pinned cover while a sibling overlay is animating (via context flag).
- `components/PlayerShell.tsx` — render `<CoverArrivalAnimation>` as a sibling so the overlay sees the live `cover` value (already available there).
- `components/Player.tsx` — remove unused `cover` / `defaultCoverUrl` props (Bug 3 cleanup).
- `app/page.tsx` — pass `initialCover` to `<Header>` (renamed from `cover`); stop passing `defaultCoverUrl` to Player.
- `lib/cover-animation-context.tsx` (created) — tiny React context with `{ isAnimating: boolean, startAnimation, endAnimation }` shared between `<CoverArrivalAnimation>` and `<Header>`.

**To be removed (dead code):**
- `components/CoverArt.tsx` — orphan since the redesign (no consumers).
- `components/NowPlaying.tsx` — verify orphan; remove if confirmed unused.

---

## Open design choices recorded as defaults

If the user refines these later, adjust the relevant tasks.

- **First-load behaviour:** animation is **skipped** at first paint; only triggers from the 2nd cover onwards (i.e. on `cover.url` change after mount).
- **Vinyl rotation in flight:** **yes**, continuous rotation ~360°/s while the disc travels to the radio.
- **New track during animation:** **cancel and restart** the sequence with the new cover (more reactive than queueing).

---

## Task 1: Create the cover-animation context

**Files:**
- Create: `lib/cover-animation-context.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS, no new errors.

- [ ] **Step 3: Commit**

```bash
git add lib/cover-animation-context.tsx
git commit -m "feat(cover-anim): add shared animation state context"
```

---

## Task 2: Create the `useTargetRect` hook

**Files:**
- Create: `hooks/useTargetRect.ts`
- Test: `tests/unit/useTargetRect.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTargetRect } from "@/hooks/useTargetRect";

describe("useTargetRect", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="target" style="position:fixed;top:10px;left:20px;width:100px;height:50px;"></div>';
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      x: 20, y: 10, width: 100, height: 50, top: 10, left: 20, right: 120, bottom: 60, toJSON: () => ({})
    } as DOMRect);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("returns the rect of the element matching the selector", () => {
    const { result } = renderHook(() => useTargetRect("#target"));
    expect(result.current).toMatchObject({ top: 10, left: 20, width: 100, height: 50 });
  });

  it("returns null when the selector matches nothing", () => {
    const { result } = renderHook(() => useTargetRect("#missing"));
    expect(result.current).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/useTargetRect.test.tsx`
Expected: FAIL with "Cannot find module '@/hooks/useTargetRect'".

- [ ] **Step 3: Implement the hook**

```ts
"use client";

import { useEffect, useState } from "react";

export function useTargetRect(selector: string): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    function update() {
      const el = document.querySelector(selector);
      setRect(el ? el.getBoundingClientRect() : null);
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [selector]);

  return rect;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run tests/unit/useTargetRect.test.tsx`
Expected: PASS, both tests green.

- [ ] **Step 5: Commit**

```bash
git add hooks/useTargetRect.ts tests/unit/useTargetRect.test.tsx
git commit -m "feat(hooks): add useTargetRect for runtime element measurement"
```

---

## Task 3: Create the `VinylDisc` component

**Files:**
- Create: `components/VinylDisc.tsx`
- Test: `tests/unit/VinylDisc.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VinylDisc } from "@/components/VinylDisc";

describe("VinylDisc", () => {
  it("renders an svg with the cover url inside an image element", () => {
    const { container } = render(<VinylDisc coverUrl="/img/test-cover.jpg" size={120} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    const image = container.querySelector("image");
    expect(image?.getAttribute("href")).toBe("/img/test-cover.jpg");
  });

  it("uses given size for both width and height", () => {
    const { container } = render(<VinylDisc coverUrl="/x.jpg" size={200} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("200");
    expect(svg.getAttribute("height")).toBe("200");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/VinylDisc.test.tsx`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement `VinylDisc.tsx`**

```tsx
"use client";

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

      {/* main disc */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-grooves)`} />

      {/* concentric grooves */}
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

      {/* shine overlay */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-shine)`} />

      {/* label background */}
      <circle cx={cx} cy={cy} r={labelR + 2} fill="#fffaf1" />

      {/* label image (cover) */}
      <image
        href={coverUrl}
        x={labelInset}
        y={labelInset}
        width={labelR * 2}
        height={labelR * 2}
        clipPath={`url(#${id}-label)`}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* spindle hole */}
      <circle cx={cx} cy={cy} r={size * 0.018} fill="#000" />
    </svg>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run tests/unit/VinylDisc.test.tsx`
Expected: PASS, both tests green.

- [ ] **Step 5: Commit**

```bash
git add components/VinylDisc.tsx tests/unit/VinylDisc.test.tsx
git commit -m "feat(ui): add VinylDisc SVG with cover label"
```

---

## Task 4: Create the `CoverArrivalAnimation` overlay

**Files:**
- Create: `components/CoverArrivalAnimation.tsx`
- Test: `tests/unit/CoverArrivalAnimation.test.tsx`

This component:
1. Skips the first mount (no animation on first paint).
2. On each subsequent `cover.url` change, calls `startAnimation()` from the context, runs the 3-stage choreography, then calls `endAnimation()`.
3. Resets correctly if `cover.url` changes mid-flight (cancel & restart).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { CoverArrivalAnimation } from "@/components/CoverArrivalAnimation";
import { CoverAnimationProvider } from "@/lib/cover-animation-context";
import type { CoverArt } from "@/lib/types";

const cover = (url: string): CoverArt => ({
  url,
  sizes: { s96: url, s128: url, s192: url, s256: url, s384: url, s512: url }
});

describe("CoverArrivalAnimation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML =
      '<div id="header-cover-art" style="position:fixed;top:60px;right:20px;width:73px;height:73px;"></div>' +
      '<div id="radio-frame-bg" style="position:fixed;top:300px;left:50%;width:673px;height:475px;"></div>';
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("does not render any animated cover on first mount", () => {
    const { queryByTestId } = render(
      <CoverAnimationProvider>
        <CoverArrivalAnimation cover={cover("/a.jpg")} />
      </CoverAnimationProvider>
    );
    expect(queryByTestId("cover-arrival-overlay")).toBeNull();
  });

  it("renders the animated cover when cover.url changes", () => {
    const { rerender, queryByTestId } = render(
      <CoverAnimationProvider>
        <CoverArrivalAnimation cover={cover("/a.jpg")} />
      </CoverAnimationProvider>
    );
    rerender(
      <CoverAnimationProvider>
        <CoverArrivalAnimation cover={cover("/b.jpg")} />
      </CoverAnimationProvider>
    );
    expect(queryByTestId("cover-arrival-overlay")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/CoverArrivalAnimation.test.tsx`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement `CoverArrivalAnimation.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      {/* Cover art trajectory: top -> center -> header pin */}
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

      {/* Vinyl disc trajectory: appears at center 1.2s in, flies to radio */}
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run tests/unit/CoverArrivalAnimation.test.tsx`
Expected: PASS — both tests.

- [ ] **Step 5: Commit**

```bash
git add components/CoverArrivalAnimation.tsx tests/unit/CoverArrivalAnimation.test.tsx
git commit -m "feat(ui): add cinematic cover arrival overlay"
```

---

## Task 5: Make `<Header>` a live cover consumer

**Files:**
- Modify: `components/Header.tsx`

The Header currently receives `cover` from a Server Component (`app/page.tsx`) and never updates. Convert it to consume `useStreamEvents` + `useCover` directly so the pinned cover stays in sync. Hide the pinned cover while the cinematic is running.

- [ ] **Step 1: Replace `Header.tsx` content**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useStreamEvents } from "@/hooks/useStreamEvents";
import { useCover } from "@/hooks/useCover";
import { useCoverAnimation } from "@/lib/cover-animation-context";
import type { CoverArt } from "@/lib/types";

interface Props {
  initialCover: CoverArt | null;
  defaultCoverUrl?: string;
}

export function Header({ initialCover, defaultCoverUrl = "/img/bg-capa.jpg" }: Props) {
  const { nowPlaying } = useStreamEvents();
  const liveCover = useCover(
    nowPlaying ? { artist: nowPlaying.artist, song: nowPlaying.song } : null,
    initialCover
  );
  const { isAnimating } = useCoverAnimation();
  const coverUrl = liveCover?.url ?? defaultCoverUrl;

  return (
    <header
      id="site-header"
      className="w-full"
      style={{
        background: "url('/img/background_menu.png') no-repeat top center",
        minHeight: "146px",
        position: "relative",
        overflow: "visible"
      }}
    >
      <div
        id="header-grid"
        className="mx-auto grid h-full max-w-5xl grid-cols-12 px-4"
        style={{ minHeight: "146px", alignItems: "center" }}
      >
        {/* Col 3 — Logo */}
        <div id="header-logo-col" className="col-span-3 flex h-full items-center pt-2 sm:pt-0">
          <Link id="header-logo-link" href="/" title="Radio Choup">
            <Image
              id="header-logo-img"
              src="/img/logo.png"
              alt="Radio Choup - cooking radio"
              width={187}
              height={199}
              priority
              style={{ marginLeft: "20px" }}
            />
          </Link>
        </div>

        {/* Col 6 — Nav */}
        <nav
          id="header-nav"
          className="col-span-6 hidden sm:flex h-full items-center justify-center"
          style={{ zIndex: 10, position: "relative" }}
        >
          <ul
            id="header-nav-list"
            className="flex w-full list-none items-center justify-around p-0 m-0"
            style={{ marginTop: "-60px" }}
          >
            {[
              { id: "nav-link-about", label: "Qui sommes nous" },
              { id: "nav-link-suggestion", label: "Suggestion" },
              { id: "nav-link-donate", label: "Faites un don" }
            ].map(({ id, label }) => (
              <li key={label}>
                <a
                  id={id}
                  href="#"
                  style={{
                    color: "#ef929d",
                    fontSize: "1.1em",
                    textDecoration: "none",
                    borderTop: "2px dotted #ef929d",
                    borderBottom: "2px dotted #ef929d",
                    padding: "2px 4px",
                    transition: "opacity 0.2s",
                    whiteSpace: "nowrap",
                    display: "inline-block"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Col mobile spacer */}
        <div id="header-mobile-spacer" className="col-span-6 block sm:hidden" />

        {/* Col 3 — Tableau cuisine + cover album */}
        <div
          id="header-cover-col"
          className="col-span-3 hidden sm:block"
          style={{ position: "relative", height: "146px" }}
        >
          <div
            id="kitchen-frame"
            style={{
              position: "absolute",
              top: "-20px",
              left: "50px",
              width: "160px",
              height: "170px",
              background: "url('/img/Tableau.png') no-repeat top center",
              backgroundSize: "contain",
              zIndex: 5,
              overflow: "hidden"
            }}
          >
            <div
              id="header-cover-art"
              style={{
                position: "absolute",
                top: "68px",
                left: "49px",
                width: "73px",
                height: "73px",
                backgroundImage: `url('${coverUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0px 5px 10px 3px rgba(0,0,0,0.4)",
                opacity: isAnimating ? 0 : 1,
                transition: "opacity 0.25s ease-out"
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS — `Header` no longer imports `motion`/`AnimatePresence`, types align with `app/page.tsx` (Task 7 will adapt the call-site).

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "fix(header): wire pinned cover to live SSE stream + animation context"
```

---

## Task 6: Wire the overlay inside `PlayerShell`

**Files:**
- Modify: `components/PlayerShell.tsx`

`PlayerShell` already owns the live `cover` value. Render `<CoverArrivalAnimation>` next to the players so it sees the same updates without prop-drilling.

- [ ] **Step 1: Edit imports and JSX**

Replace the file content with:

```tsx
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
import { CoverArrivalAnimation } from "@/components/CoverArrivalAnimation";
import type { CoverArt } from "@/lib/types";

interface Props {
  streamUrl: string;
  defaultCoverUrl: string;
  initialCover: CoverArt | null;
}

export function PlayerShell({ streamUrl, defaultCoverUrl, initialCover }: Props) {
  const player = useAudioPlayer(streamUrl);
  const { nowPlaying, history } = useStreamEvents();
  const cover = useCover(
    nowPlaying ? { artist: nowPlaying.artist, song: nowPlaying.song } : null,
    initialCover
  );
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
      <CoverArrivalAnimation cover={cover} />
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
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS — `Player` no longer takes `cover`/`defaultCoverUrl` (will be aligned in Task 7).

- [ ] **Step 3: Commit**

```bash
git add components/PlayerShell.tsx
git commit -m "feat(player-shell): mount cinematic cover overlay alongside players"
```

---

## Task 7: Clean up `Player.tsx` and update `app/page.tsx`

**Files:**
- Modify: `components/Player.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Edit `components/Player.tsx` props**

Remove the unused `cover`/`defaultCoverUrl` props and the unused `CoverArt` type import.

Change the import line at top:

```tsx
import type { NowPlaying as NowPlayingType } from "@/lib/types";
```

Change the `Props` interface to:

```tsx
interface Props {
  nowPlaying: NowPlayingType | null;
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
```

Change the destructured signature to:

```tsx
export function Player({
  nowPlaying,
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
```

(The body of the component stays unchanged.)

- [ ] **Step 2: Edit `app/page.tsx`**

Wrap the rendered tree in `<CoverAnimationProvider>` and update the `Header` prop name.

```tsx
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBar } from "@/components/PromoBar";
import { PlayerShell } from "@/components/PlayerShell";
import { CoverAnimationProvider } from "@/lib/cover-animation-context";
import { streamSource } from "@/lib/stream-source";
import { getCoverArt } from "@/lib/itunes";
import { getServerEnv } from "@/lib/env.server";
import { clientEnv } from "@/lib/env.client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const current = streamSource.getCurrent();
  if (!current) return { title: clientEnv.NEXT_PUBLIC_RADIO_NAME };
  return {
    title: `${current.song} — ${current.artist}`,
    description: `En direct sur ${clientEnv.NEXT_PUBLIC_RADIO_NAME} : ${current.song} par ${current.artist}.`
  };
}

export default async function HomePage() {
  const current = streamSource.getCurrent();
  const cover = current
    ? await getCoverArt({
        artist: current.artist,
        song: current.song,
        cacheTtlS: getServerEnv().ITUNES_CACHE_TTL_S
      })
    : null;

  return (
    <CoverAnimationProvider>
      <Header initialCover={cover} defaultCoverUrl={clientEnv.NEXT_PUBLIC_DEFAULT_COVER} />
      <main id="page-main" style={{ position: "relative", top: "-50px" }}>
        <PlayerShell
          streamUrl={getServerEnv().STREAM_URL}
          defaultCoverUrl={clientEnv.NEXT_PUBLIC_DEFAULT_COVER}
          initialCover={cover}
        />
      </main>
      <PromoBar />
      <Footer />
    </CoverAnimationProvider>
  );
}
```

- [ ] **Step 3: Run lint, typecheck, unit tests**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: All green.

- [ ] **Step 4: Commit**

```bash
git add components/Player.tsx app/page.tsx
git commit -m "refactor(player): drop unused cover props, mount animation provider"
```

---

## Task 8: Remove dead `CoverArt` component (and `NowPlaying` if orphan)

**Files:**
- Delete: `components/CoverArt.tsx`
- Delete: `components/NowPlaying.tsx` (only if `grep -r "NowPlaying" --include="*.tsx" --include="*.ts"` confirms zero consumers)

- [ ] **Step 1: Confirm orphan status**

Run: `grep -rn "from \"@/components/CoverArt\"\|from '@/components/CoverArt'" --include="*.tsx" --include="*.ts" .`
Expected: zero matches.

Run: `grep -rn "from \"@/components/NowPlaying\"\|from '@/components/NowPlaying'" --include="*.tsx" --include="*.ts" .`
Expected: zero matches.

- [ ] **Step 2: Delete files**

```bash
git rm components/CoverArt.tsx
# Only if previous grep confirmed orphan:
git rm components/NowPlaying.tsx
```

- [ ] **Step 3: Run lint + typecheck**

Run: `pnpm lint && pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove orphaned CoverArt/NowPlaying components"
```

---

## Task 9: Visual verification with Playwright (manual)

**Files:**
- Read-only / manual testing only.

The previous tasks ship working code; this task is the gate that validates the cinematic actually looks right.

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev`
Expected: server up on http://localhost:3500.

- [ ] **Step 2: Open the app in a Chromium browser via Playwright**

Use Playwright (driven by Claude or manually) to open `http://localhost:3500` at viewport 1440×900.

- [ ] **Step 3: Trigger a track change**

Two ways:
- Wait until SSE pushes a new `now-playing` event from the live stream.
- Or, in DevTools console, dispatch a fake event:

```js
const ev = new MessageEvent("now-playing", { data: JSON.stringify({
  song: "Test Song", artist: "Test Artist", listeners: 0, bitrate: 128, fetchedAt: new Date().toISOString()
})});
// Find the EventSource singleton via window — alternative: simply mutate state via React DevTools.
```

If neither is convenient, modify `useStreamEvents` temporarily to expose a debug hook, or add a temporary `?debug-cover-anim=1` query that bumps the cover URL every 8 s during dev.

- [ ] **Step 4: Visual checklist**

Verify each item:
- [ ] Cover falls from above the viewport, rotating slightly, and lands at the screen center scaled up.
- [ ] Around 1.2 s, the vinyl appears centered on the cover and slides out to the side.
- [ ] The vinyl rotates continuously while flying down toward the radio.
- [ ] The vinyl fades out + scales down as it reaches the radio area, giving the illusion it slides behind the chassis.
- [ ] The cover then flies diagonally up-right and lands precisely inside the kitchen frame, replacing the previous cover seamlessly (no jumpcut).
- [ ] Total duration ~3 s. No layout shift on the rest of the page during the animation.
- [ ] On reload, the animation does NOT play (first paint must be calm).

- [ ] **Step 5: Run e2e suite**

Run: `pnpm test:e2e`
Expected: existing e2e specs (`history.spec.ts`, `keyboard.spec.ts`, `playback.spec.ts`) still pass — the overlay must not block clicks or interfere with the player UI (`pointer-events: none` is applied on the overlay container).

- [ ] **Step 6: If issues found**

Adjust the timing/keyframes inside `CoverArrivalAnimation.tsx` (the only knobs are the `duration`, `delay`, `times`, and target geometry). Re-run Step 4. Do **not** patch the surrounding components for visual issues — the animation owns the choreography.

- [ ] **Step 7: Commit any tuning**

```bash
git add components/CoverArrivalAnimation.tsx
git commit -m "tune(cover-anim): adjust keyframe timings after visual review"
```

---

## Task 10: Update atomic documentation

**Files:**
- Update or create: `docs/ARCHITECTURE.md` (section on player composition, mention overlay).
- Create: `docs/atomic/cover-cinematic-arrival.md` (atomic concept fragment, frontmatter required).

- [ ] **Step 1: Create atomic fragment**

```markdown
---
title: Cover Cinematic Arrival
slug: cover-cinematic-arrival
status: implemented
files:
  - components/CoverArrivalAnimation.tsx
  - components/VinylDisc.tsx
  - components/Header.tsx
  - components/PlayerShell.tsx
  - lib/cover-animation-context.tsx
  - hooks/useTargetRect.ts
updated: 2026-05-08
---

# Cover Cinematic Arrival

Triggered on every `cover.url` change after first mount. A fixed-overlay choreography (~3 s total):

1. **0 → 0.8 s** — the new album cover falls from above the viewport, lands centered, scales up to ~1.15.
2. **1.2 → 2.0 s** — a vinyl SVG (with the cover as label) emerges from behind the cover, drifts slightly, then accelerates toward the radio chassis while spinning ~3 turns.
3. **0.6 → 3.0 s (overlapping)** — the cover continues its trajectory diagonally up-right and lands inside the kitchen frame (`#header-cover-art`), replacing the pinned cover.

The pinned cover in the kitchen frame is hidden via `opacity: 0` while `useCoverAnimation().isAnimating === true`, then faded back in 0.25 s after the overlay completes — so the animated copy seamlessly becomes the pinned cover.

Target positions are computed at runtime via `useTargetRect("#header-cover-art")` and `useTargetRect("#radio-frame-bg")`, so the choreography stays accurate across viewport sizes.

A new `cover.url` arriving mid-animation cancels the in-flight sequence by re-keying the framer-motion nodes.
```

- [ ] **Step 2: Sync BRV memory**

Run: `brv curate "Cover cinematic arrival animation: 3-stage overlay (fall→split→fly to header pin), driven by cover.url change in PlayerShell, hides pinned header cover via context flag during flight" -f docs/atomic/cover-cinematic-arrival.md`

- [ ] **Step 3: Commit**

```bash
git add docs/atomic/cover-cinematic-arrival.md docs/ARCHITECTURE.md
git commit -m "docs(atomic): document cover cinematic arrival"
```

---

## Self-review checklist (run after writing this plan)

- **Spec coverage:** every requirement from the user (cover crosses screen → centers → vinyl ejects → vinyl behind radio → cover lands on pin) maps to a step. ✓
- **Placeholders:** none. Every code block is concrete and complete. ✓
- **Type consistency:** `CoverArt` type, `useCover`, `useStreamEvents` signatures cross-checked against current sources. The `CoverAnimationProvider` exports `useCoverAnimation` returning `{ isAnimating, startAnimation, endAnimation }`, used identically across `Header.tsx` and `CoverArrivalAnimation.tsx`. `useTargetRect` returns `DOMRect | null`, matched by null-guards in `CoverArrivalAnimation.tsx`. ✓
- **First-load skip:** documented and tested. ✓
- **Cancel & restart on mid-flight change:** keyed `motion.div` ensures restart. ✓
- **Pointer events:** overlay container has `pointer-events: none` so it never blocks player interactions. ✓
- **No prop-drilling regression:** `cover` is now consumed in 2 places (`PlayerShell` and `Header`), both via `useCover` against the same SSE singleton — single source of truth. ✓
