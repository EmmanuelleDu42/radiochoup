// tests/unit/vagalume.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env.server", () => ({ getServerEnv: () => ({ VAGALUME_API_KEY: "test-key", LYRICS_CACHE_TTL_S: 604800 }) }));

const { fetchLyrics } = await import("@/lib/vagalume");

describe("fetchLyrics", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns lyrics when type=exact", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ type: "exact", mus: [{ text: "line1\nline2" }] })
      })
    );
    const result = await fetchLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(true);
    expect(result.text).toBe("line1\nline2");
    expect(result.source).toBe("vagalume");
  });

  it("returns available=false when type=notfound", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ type: "notfound" })
      })
    );
    const result = await fetchLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(false);
    expect(result.text).toBeNull();
  });

  it("returns available=false on network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network"))
    );
    const result = await fetchLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(false);
  });

  it("returns available=false on empty params", async () => {
    const result = await fetchLyrics({ artist: "", song: "" });
    expect(result.available).toBe(false);
  });
});
