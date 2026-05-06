// tests/unit/cache.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryCache } from "@/lib/cache";

describe("MemoryCache", () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
    vi.useFakeTimers();
  });

  it("retourne undefined pour une clé absente", () => {
    expect(cache.get("k")).toBeUndefined();
  });

  it("retourne la valeur après set", () => {
    cache.set("k", { v: 1 }, 1000);
    expect(cache.get<{ v: number }>("k")).toEqual({ v: 1 });
  });

  it("expire la valeur après le TTL", () => {
    cache.set("k", "x", 1000);
    vi.advanceTimersByTime(1001);
    expect(cache.get("k")).toBeUndefined();
  });

  it("delete supprime la valeur", () => {
    cache.set("k", "x", 1000);
    cache.delete("k");
    expect(cache.get("k")).toBeUndefined();
  });

  it("clear supprime tout", () => {
    cache.set("a", 1, 1000);
    cache.set("b", 2, 1000);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
  });
});
