"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { CoverArt } from "@/lib/types";

interface Props {
  cover?: CoverArt | null;
  defaultCoverUrl?: string;
}

export function Header({ cover, defaultCoverUrl = "/img/bg-capa.jpg" }: Props) {
  const coverUrl = cover?.url ?? defaultCoverUrl;

  return (
    <header
      id="site-header"
      className="w-full hidden lg:block"
      style={{
        background: "url('/img/background_menu.png') no-repeat top center",
        minHeight: "146px",
        position: "relative",
        overflow: "visible"
      }}
    >
      <div
        id="header-grid"
        className="mx-auto grid h-full grid-cols-12 px-4"
        style={{ minHeight: "146px", alignItems: "center", maxWidth: "940px" }}
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

        {/* Col 6 — Nav liens centrés (desktop only) */}
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

        {/* Col mobile : espace vide (le nav est caché) */}
        <div id="header-mobile-spacer" className="col-span-6 block sm:hidden" />

        {/* Col 3 — Tableau cuisine + cover album (Tableau.png + cover) */}
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
            {/* Cover album : nouvelle pochette arrive par la gauche en glissant sur l'image */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={coverUrl}
                id="header-cover-art"
                initial={{ x: -120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 160, opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 0.9, 0.3, 1] }}
                style={{
                  position: "absolute",
                  top: "68px",
                  left: "49px",
                  width: "73px",
                  height: "73px",
                  backgroundImage: `url('${coverUrl}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0px 5px 10px 3px rgba(0,0,0,0.4)"
                }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
