import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { Header } from "@/components/Header";
import { PromoBar } from "@/components/PromoBar";
import { PlayerShell } from "@/components/PlayerShell";
import { CoverAnimationProvider } from "@/lib/cover-animation-context";
import { streamSource } from "@/lib/stream-source";
import { getCoverArt } from "@/lib/itunes";
import { getServerEnv } from "@/lib/env.server";
import { clientEnv } from "@/lib/env.client";

function discoverRadioImages(): string[] {
  const dir = path.join(process.cwd(), "public", "img", "template_radio");
  const collator = new Intl.Collator(undefined, { numeric: true });
  const matches = fs
    .readdirSync(dir)
    .filter((f) => /^radio_ancienne_\d+\.png$/.test(f))
    .sort(collator.compare)
    .map((f) => `/img/template_radio/${f}`);
  return matches.length > 0 ? matches : ["/img/template_radio/radio_ancienne_0.png"];
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
    <CoverAnimationProvider>
      <Header initialCover={cover} defaultCoverUrl={clientEnv.NEXT_PUBLIC_DEFAULT_COVER} />
      <main id="page-main" style={{ position: "relative", top: "-50px" }}>
        <PlayerShell
          streamUrl={getServerEnv().STREAM_URL}
          defaultCoverUrl={clientEnv.NEXT_PUBLIC_DEFAULT_COVER}
          initialCover={cover}
          radioImages={discoverRadioImages()}
        />
      </main>
      <PromoBar />
    </CoverAnimationProvider>
  );
}
