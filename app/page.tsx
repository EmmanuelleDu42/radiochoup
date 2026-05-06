import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlayerShell } from "@/components/PlayerShell";
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
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <PlayerShell
          streamUrl={getServerEnv().STREAM_URL}
          defaultCoverUrl={clientEnv.NEXT_PUBLIC_DEFAULT_COVER}
          cover={cover}
        />
      </main>
      <Footer />
    </>
  );
}
