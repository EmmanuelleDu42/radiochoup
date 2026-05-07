"use client";

import Image from "next/image";
import Link from "next/link";
import type { CoverArt } from "@/lib/types";

interface Props {
  cover?: CoverArt | null;
  defaultCoverUrl?: string;
}

export function Header({ cover, defaultCoverUrl = "/img/bg-capa.jpg" }: Props) {
  const coverUrl = cover?.url ?? defaultCoverUrl;

  return (
    <header
      className="w-full"
      style={{
        background: "url('/img/background_menu.png') repeat top left",
        minHeight: "146px"
      }}
    >
      <div className="mx-auto grid h-full max-w-5xl grid-cols-12 items-center px-4" style={{ minHeight: "146px" }}>
        {/* Col 3 — Logo */}
        <div className="col-span-3 flex h-full items-center">
          <Link href="/" title="Radio Choup">
            <Image
              src="/img/logo.png"
              alt="Radio Choup - cooking radio"
              width={220}
              height={110}
              priority
              className="w-auto object-contain"
              style={{ height: "110px", maxWidth: "100%" }}
            />
          </Link>
        </div>

        {/* Col 6 — Nav liens centrés (desktop only) */}
        <nav
          className="col-span-6 hidden sm:flex h-full items-end justify-center pb-4"
        >
          <ul className="flex w-full list-none items-center justify-around p-0 m-0">
            {[
              { label: "Qui sommes nous" },
              { label: "Suggestion" },
              { label: "Faites un don" }
            ].map(({ label }) => (
              <li key={label}>
                <a
                  href="#"
                  style={{
                    color: "#ef929d",
                    fontSize: "1.1em",
                    textDecoration: "none",
                    borderTop: "2px dotted #ef929d",
                    borderBottom: "2px dotted #ef929d",
                    padding: "2px 4px",
                    transition: "opacity 0.2s",
                    whiteSpace: "nowrap"
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
        <div className="col-span-6 block sm:hidden" />

        {/* Col 3 — Tableau cuisine + cover album */}
        <div className="col-span-3 flex h-full items-center justify-end">
          {/*
            Le Tableau.png fait ~200px × ~163px pour conserver le ratio de l'image.
            Dans le legacy CSS : currentCoverArt top:61px left:37px width:32%
            Ici le conteneur fait 200×163 donc :
              top = 61 * (163/230) ≈ 43px  (on garde 43px)
              left = 37px
              width = 32% de 200px ≈ 64px
          */}
          <div
            className="relative hidden sm:block"
            style={{
              background: "url('/img/Tableau.png') no-repeat center",
              backgroundSize: "contain",
              width: "200px",
              height: "163px",
              flexShrink: 0
            }}
          >
            {/* Cover art positionné dans le tableau, calé sur le legacy top:61px left:37px width:32% */}
            <div
              className="absolute"
              style={{
                top: "43px",
                left: "37px",
                width: "64px",
                height: "64px",
                backgroundImage: `url('${coverUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "background-image 1s",
                boxShadow: "0px 5px 10px 3px rgba(0,0,0,0.4)"
              }}
            />
          </div>
          {/* Mobile : juste le logo dans le coin */}
          <div className="block sm:hidden" />
        </div>
      </div>
    </header>
  );
}
