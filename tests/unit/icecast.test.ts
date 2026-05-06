// tests/unit/icecast.test.ts
import { describe, it, expect } from "vitest";
import { parseIcecastStatus } from "@/lib/icecast";

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
  it("parse une source unique", () => {
    const result = parseIcecastStatus(fixtureSingleSource);
    expect(result).toEqual({
      song: "Crazy",
      artist: "Patsy Cline",
      listeners: 7,
      bitrate: 128
    });
  });

  it("parse le premier élément si la source est un tableau", () => {
    const result = parseIcecastStatus(fixtureMultipleSources);
    expect(result?.artist).toBe("Doris Day");
    expect(result?.song).toBe("Que sera, sera");
  });

  it("retourne null si pas de source", () => {
    expect(parseIcecastStatus(fixtureEmpty)).toBeNull();
  });

  it("retourne le titre brut comme song si pas de séparateur", () => {
    const result = parseIcecastStatus({
      icestats: { source: { title: "MysteryTrack", listeners: 1, bitrate: 128, listener_peak: 5 } }
    });
    expect(result?.song).toBe("MysteryTrack");
    expect(result?.artist).toBe("");
  });

  it("ignore les point-virgules dans le nom d'artiste", () => {
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
});
