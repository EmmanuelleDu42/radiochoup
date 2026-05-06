// tests/unit/history-store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { HistoryStore } from "@/lib/history-store";

describe("HistoryStore", () => {
  let store: HistoryStore;

  beforeEach(() => {
    store = new HistoryStore(5);
  });

  it("retourne un historique vide au démarrage", () => {
    expect(store.list()).toEqual([]);
  });

  it("ajoute une entrée si elle diffère de la dernière", () => {
    store.push({ artist: "A", song: "S" });
    expect(store.list()).toHaveLength(1);
  });

  it("ne duplique pas la dernière entrée", () => {
    store.push({ artist: "A", song: "S" });
    store.push({ artist: "A", song: "S" });
    expect(store.list()).toHaveLength(1);
  });

  it("limite à la taille max (FIFO)", () => {
    for (let i = 0; i < 10; i++) {
      store.push({ artist: `A${i}`, song: `S${i}` });
    }
    const list = store.list();
    expect(list).toHaveLength(5);
    expect(list[0]?.song).toBe("S9");
    expect(list[4]?.song).toBe("S5");
  });

  it("retourne les entrées les plus récentes en premier", () => {
    store.push({ artist: "A1", song: "S1" });
    store.push({ artist: "A2", song: "S2" });
    const list = store.list();
    expect(list[0]?.song).toBe("S2");
    expect(list[1]?.song).toBe("S1");
  });
});
