export function globalSingleton<T>(key: string, factory: () => T): T {
  const g = globalThis as unknown as Record<string, T | undefined>;
  const existing = g[key];
  if (existing) return existing;
  const instance = factory();
  if (process.env.NODE_ENV !== "production") g[key] = instance;
  return instance;
}
