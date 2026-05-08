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
