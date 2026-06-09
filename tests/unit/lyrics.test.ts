// tests/unit/lyrics.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Lyrics } from "@/lib/types";

vi.mock("server-only", () => ({}));

type Params = { artist: string; song: string };
const fetchVagalume = vi.fn<(p: Params) => Promise<Lyrics>>();
const fetchLrclib = vi.fn<(p: Params) => Promise<Lyrics>>();

vi.mock("@/lib/vagalume", () => ({ fetchLyrics: (p: Params) => fetchVagalume(p) }));
vi.mock("@/lib/lrclib", () => ({ fetchLrclibLyrics: (p: Params) => fetchLrclib(p) }));

const { getLyrics } = await import("@/lib/lyrics");

const unavailable: Lyrics = { text: null, source: null, available: false };

describe("getLyrics fallback chain", () => {
  beforeEach(() => {
    fetchVagalume.mockReset();
    fetchLrclib.mockReset();
  });

  it("returns the Vagalume result when available, without calling lrclib", async () => {
    fetchVagalume.mockResolvedValue({ text: "v", source: "vagalume", available: true });
    const result = await getLyrics({ artist: "A", song: "S" });
    expect(result.source).toBe("vagalume");
    expect(result.text).toBe("v");
    expect(fetchLrclib).not.toHaveBeenCalled();
  });

  it("falls back to lrclib when Vagalume is unavailable", async () => {
    fetchVagalume.mockResolvedValue(unavailable);
    fetchLrclib.mockResolvedValue({ text: "l", source: "lrclib", available: true });
    const result = await getLyrics({ artist: "A", song: "S" });
    expect(result.source).toBe("lrclib");
    expect(result.text).toBe("l");
    expect(fetchLrclib).toHaveBeenCalledWith({ artist: "A", song: "S" });
  });

  it("returns unavailable when both providers fail", async () => {
    fetchVagalume.mockResolvedValue(unavailable);
    fetchLrclib.mockResolvedValue(unavailable);
    const result = await getLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(false);
  });

  it("short-circuits on empty params without calling any provider", async () => {
    const result = await getLyrics({ artist: "", song: "" });
    expect(result.available).toBe(false);
    expect(fetchVagalume).not.toHaveBeenCalled();
    expect(fetchLrclib).not.toHaveBeenCalled();
  });
});
