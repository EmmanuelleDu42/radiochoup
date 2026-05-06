// tests/unit/cache.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MemoryCache } from "@/lib/cache";

describe("MemoryCache", () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined for a missing key", () => {
    expect(cache.get("k")).toBeUndefined();
  });

  it("returns the value after set", () => {
    cache.set("k", { v: 1 }, 1000);
    expect(cache.get<{ v: number }>("k")).toEqual({ v: 1 });
  });

  it("expires the value after TTL", () => {
    cache.set("k", "x", 1000);
    vi.advanceTimersByTime(1001);
    expect(cache.get("k")).toBeUndefined();
  });

  it("delete removes the value", () => {
    cache.set("k", "x", 1000);
    cache.delete("k");
    expect(cache.get("k")).toBeUndefined();
  });

  it("clear removes everything", () => {
    cache.set("a", 1, 1000);
    cache.set("b", 2, 1000);
    cache.clear();
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBeUndefined();
  });

  it("size decrements after expiration via get", () => {
    cache.set("a", 1, 1000);
    cache.set("b", 2, 1000);
    expect(cache.size()).toBe(2);
    vi.advanceTimersByTime(1001);
    cache.get("a"); // triggers purge of "a"
    expect(cache.size()).toBe(1);
  });
});
