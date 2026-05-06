// tests/unit/itunes.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchItunesArtwork, buildArtworkSizes } from "@/lib/itunes";

describe("buildArtworkSizes", () => {
  it("dérive les tailles depuis l'URL 100x100", () => {
    const url = "https://example.com/artwork/100x100bb.jpg";
    const sizes = buildArtworkSizes(url);
    expect(sizes.s96).toContain("96x96bb");
    expect(sizes.s512).toContain("512x512bb");
  });

  it("retourne une URL stable si pas de pattern 100x100bb", () => {
    const url = "/img/bg-capa.jpg";
    const sizes = buildArtworkSizes(url);
    expect(sizes.s96).toBe(url);
    expect(sizes.s512).toBe(url);
  });
});

describe("searchItunesArtwork", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne l'URL artwork si l'API renvoie un résultat", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          resultCount: 1,
          results: [{ artworkUrl100: "https://x/100x100bb.jpg" }]
        })
      })
    );
    const result = await searchItunesArtwork({ artist: "A", song: "B" });
    expect(result).toBe("https://x/100x100bb.jpg");
  });

  it("retourne null si resultCount est 0", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ resultCount: 0, results: [] })
      })
    );
    const result = await searchItunesArtwork({ artist: "X", song: "Y" });
    expect(result).toBeNull();
  });

  it("retourne null en cas d'erreur réseau", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network"))
    );
    const result = await searchItunesArtwork({ artist: "X", song: "Y" });
    expect(result).toBeNull();
  });
});
