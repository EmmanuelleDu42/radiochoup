import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  STREAM_TYPE: z.enum(["icecast", "shoutcast"]).default("icecast"),
  STREAM_URL: z.string().url().default("https://icecast.cef-informatique.com:8443/stream"),
  STREAM_STATUS_URL: z
    .string()
    .url()
    .default("https://icecast.cef-informatique.com:8443/status-json.xsl"),
  NOW_PLAYING_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(4000),
  VAGALUME_API_KEY: z.string().min(1).default("missing-key"),
  ITUNES_CACHE_TTL_S: z.coerce.number().int().positive().default(86400),
  LYRICS_CACHE_TTL_S: z.coerce.number().int().positive().default(604800)
});

let cached: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (cached) return cached;
  cached = serverEnvSchema.parse({
    STREAM_TYPE: process.env.STREAM_TYPE,
    STREAM_URL: process.env.STREAM_URL,
    STREAM_STATUS_URL: process.env.STREAM_STATUS_URL,
    NOW_PLAYING_POLL_INTERVAL_MS: process.env.NOW_PLAYING_POLL_INTERVAL_MS,
    VAGALUME_API_KEY: process.env.VAGALUME_API_KEY,
    ITUNES_CACHE_TTL_S: process.env.ITUNES_CACHE_TTL_S,
    LYRICS_CACHE_TTL_S: process.env.LYRICS_CACHE_TTL_S
  });
  return cached;
}
