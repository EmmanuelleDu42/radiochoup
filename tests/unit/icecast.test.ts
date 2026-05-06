// tests/unit/icecast.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseIcecastStatus, fetchIcecastStatus } from "@/lib/icecast";

const fixtureSingleSource = {
  icestats: {
    source: {
      title: "Patsy Cline - Crazy",
      listener_peak: 42,
      listeners: 7,
      bitrate: 128
    }
  }
};

const fixtureMultipleSources = {
  icestats: {
    source: [
      {
        title: "Doris Day - Que sera, sera",
        listener_peak: 100,
        listeners: 12,
        bitrate: 192
      }
    ]
  }
};

const fixtureEmpty = { icestats: {} };

describe("parseIcecastStatus", () => {
  it("parses a single source", () => {
    const result = parseIcecastStatus(fixtureSingleSource);
    expect(result).toEqual({
      song: "Crazy",
      artist: "Patsy Cline",
      listeners: 7,
      bitrate: 128
    });
  });

  it("parses the first element when source is an array", () => {
    const result = parseIcecastStatus(fixtureMultipleSources);
    expect(result?.artist).toBe("Doris Day");
    expect(result?.song).toBe("Que sera, sera");
  });

  it("returns null when no source", () => {
    expect(parseIcecastStatus(fixtureEmpty)).toBeNull();
  });

  it("returns raw title as song when no separator", () => {
    const result = parseIcecastStatus({
      icestats: { source: { title: "MysteryTrack", listeners: 1, bitrate: 128, listener_peak: 5 } }
    });
    expect(result?.song).toBe("MysteryTrack");
    expect(result?.artist).toBe("");
  });

  it("ignores semicolons in artist name", () => {
    const result = parseIcecastStatus({
      icestats: {
        source: {
          title: "Artist;extra - Song",
          listeners: 1,
          bitrate: 128,
          listener_peak: 1
        }
      }
    });
    expect(result?.artist).toBe("Artist");
  });

  it("falls back to 0 when listeners or bitrate is missing", () => {
    const result = parseIcecastStatus({
      icestats: {
        source: { title: "A - B", listener_peak: 0 }
      }
    });
    expect(result?.listeners).toBe(0);
    expect(result?.bitrate).toBe(0);
  });
});

describe("fetchIcecastStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null if !response.ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const result = await fetchIcecastStatus("https://x/status-json.xsl");
    expect(result).toBeNull();
  });

  it("returns the parsed status on valid response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ icestats: { source: { title: "A - B", listeners: 5, bitrate: 128, listener_peak: 10 } } })
    }));
    const result = await fetchIcecastStatus("https://x/status-json.xsl");
    expect(result?.artist).toBe("A");
    expect(result?.song).toBe("B");
  });
});
