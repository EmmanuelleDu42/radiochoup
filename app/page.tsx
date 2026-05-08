import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { Header } from "@/components/Header";
import { PromoBar } from "@/components/PromoBar";
import { PlayerShell } from "@/components/PlayerShell";
import { streamSource } from "@/lib/stream-source";
import { getCoverArt } from "@/lib/itunes";
import { getServerEnv } from "@/lib/env.server";
import { clientEnv } from "@/lib/env.client";

function discoverRadioImages(): string[] {
  const dir = path.join(process.cwd(), "public", "img");
  const files = fs.readdirSync(dir);
  const pattern = /^radio_ancienne(?:_(\d+))?\.png$/;
  const matches = files
    .map((f) => {
      const m = pattern.exec(f);
      if (!m) return null;
      const idx = m[1] ? parseInt(m[1], 10) : 1;
      return { file: f, idx };
    })
    .filter((x): x is { file: string; idx: number } => x !== null)
    .sort((a, b) => a.idx - b.idx)
    .map((x) => `/img/${x.file}`);
  return matches.length > 0 ? matches : ["/img/radio_ancienne.png"];
}

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
    <>
      <Header cover={cover} defaultCoverUrl={clientEnv.NEXT_PUBLIC_DEFAULT_COVER} />
      <main id="page-main" style={{ position: "relative", top: "-50px" }}>
        <PlayerShell
          streamUrl={getServerEnv().STREAM_URL}
          defaultCoverUrl={clientEnv.NEXT_PUBLIC_DEFAULT_COVER}
          initialCover={cover}
          radioImages={discoverRadioImages()}
        />
      </main>
      <PromoBar />
    </>
  );
}
