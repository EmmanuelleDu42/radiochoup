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
        minHeight: "146px",
        position: "relative",
        overflow: "visible"
      }}
    >
      <div
        className="mx-auto grid h-full max-w-5xl grid-cols-12 px-4"
        style={{ minHeight: "146px", alignItems: "center" }}
      >
        {/* Col 3 — Logo */}
        <div className="col-span-3 flex h-full items-center">
          <Link href="/" title="Radio Choup">
            <Image
              src="/img/logo.png"
              alt="Radio Choup - cooking radio"
              width={94}
              height={100}
              priority
              className="object-contain"
              style={{ height: "100px", width: "auto", maxWidth: "100%" }}
            />
          </Link>
        </div>

        {/* Col 6 — Nav liens centrés (desktop only) */}
        <nav
          className="col-span-6 hidden sm:flex h-full items-center justify-center"
          style={{ zIndex: 10, position: "relative" }}
        >
          <ul className="flex w-full list-none items-center justify-around p-0 m-0" style={{ marginTop: "38px" }}>
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
        <div className="col-span-6 block sm:hidden" />

        {/* Col 3 — Tableau cuisine + cover album */}
        {/*
          Tableau.png est carré 160×160px.
          Sur la ref, le tableau dépasse légèrement au-dessus du header (cordelette visible).
          On le positionne en absolu depuis le coin haut-droit du header,
          avec un top négatif pour qu'il déborde vers le haut.
        */}
        <div className="col-span-3 hidden sm:block" style={{ position: "relative", height: "146px" }}>
          <div
            style={{
              position: "absolute",
              top: "-10px",
              right: "0",
              width: "160px",
              height: "170px",
              background: "url('/img/Tableau.png') no-repeat top center",
              backgroundSize: "contain",
              zIndex: 5
            }}
          >
            {/* Cover art positionné dans le tableau.
                Tableau.png 160×160 rendu à 160px de large (contain).
                Dans le legacy : top:61px left:37px width:32% (sur un conteneur ~200px)
                On scale proportionnellement pour 160px : top≈49px left≈30px width≈51px */}
            <div
              style={{
                position: "absolute",
                top: "58px",
                left: "30px",
                width: "51px",
                height: "51px",
                backgroundImage: `url('${coverUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                transition: "background-image 1s",
                boxShadow: "0px 5px 10px 3px rgba(0,0,0,0.4)"
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
