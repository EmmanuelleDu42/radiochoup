// tests/unit/itunes.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchItunesArtwork, buildArtworkSizes, getCoverArt } from "@/lib/itunes";

describe("buildArtworkSizes", () => {
  it("derives sizes from the 100x100 URL", () => {
    const url = "https://example.com/artwork/100x100bb.jpg";
    const sizes = buildArtworkSizes(url);
    expect(sizes.s96).toContain("96x96bb");
    expect(sizes.s512).toContain("512x512bb");
  });

  it("returns a stable URL when no 100x100bb pattern", () => {
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

  it("returns the artwork URL when the API has a result", async () => {
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

  it("returns null when resultCount is 0", async () => {
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

  it("returns null on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network"))
    );
    const result = await searchItunesArtwork({ artist: "X", song: "Y" });
    expect(result).toBeNull();
  });
});

describe("getCoverArt", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the fallback when iTunes finds nothing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ resultCount: 0, results: [] })
    }));
    const result = await getCoverArt({ artist: "X", song: "Y" });
    expect(result.source).toBe("default");
    expect(result.url).toBe("/img/bg-capa.jpg");
  });

  it("returns the high-resolution URL when iTunes has a result", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ resultCount: 1, results: [{ artworkUrl100: "https://x/100x100bb.jpg" }] })
    }));
    const result = await getCoverArt({ artist: "A", song: "B" });
    expect(result.source).toBe("itunes");
    expect(result.url).toContain("512x512bb");
    expect(result.sizes.s96).toContain("96x96bb");
  });
});
