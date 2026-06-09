// tests/unit/lrclib.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env.server", () => ({ getServerEnv: () => ({ LYRICS_CACHE_TTL_S: 604800 }) }));

const { fetchLrclibLyrics } = await import("@/lib/lrclib");

describe("fetchLrclibLyrics", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the first result that has non-empty plainLyrics", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { plainLyrics: "", syncedLyrics: "" },
          { plainLyrics: "line1\nline2", syncedLyrics: "[00:01.00]line1" }
        ]
      })
    );
    const result = await fetchLrclibLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(true);
    expect(result.text).toBe("line1\nline2");
    expect(result.source).toBe("lrclib");
  });

  it("returns available=false when no result carries lyrics (instrumental)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [{ plainLyrics: "" }] })
    );
    const result = await fetchLrclibLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(false);
    expect(result.text).toBeNull();
  });

  it("returns available=false on an empty result array", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    const result = await fetchLrclibLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(false);
  });

  it("returns available=false when the API is down (!ok, e.g. 503)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const result = await fetchLrclibLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(false);
  });

  it("returns available=false on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const result = await fetchLrclibLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(false);
  });

  it("returns available=false on empty params without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchLrclibLyrics({ artist: "", song: "" });
    expect(result.available).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
