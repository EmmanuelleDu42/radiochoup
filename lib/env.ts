import { z } from "zod";

const serverEnvSchema = z.object({
  STREAM_TYPE: z.enum(["icecast", "shoutcast"]).default("icecast"),
  STREAM_URL: z.string().url(),
  STREAM_STATUS_URL: z.string().url(),
  NOW_PLAYING_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(4000),
  VAGALUME_API_KEY: z.string().min(1),
  ITUNES_CACHE_TTL_S: z.coerce.number().int().positive().default(86400),
  LYRICS_CACHE_TTL_S: z.coerce.number().int().positive().default(604800)
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_RADIO_NAME: z.string().default("Radio Choup"),
  NEXT_PUBLIC_DEFAULT_COVER: z.string().default("/img/bg-capa.jpg"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://www.radiochoup.com")
});

export const serverEnv = serverEnvSchema.parse({
  STREAM_TYPE: process.env.STREAM_TYPE,
  STREAM_URL: process.env.STREAM_URL,
  STREAM_STATUS_URL: process.env.STREAM_STATUS_URL,
  NOW_PLAYING_POLL_INTERVAL_MS: process.env.NOW_PLAYING_POLL_INTERVAL_MS,
  VAGALUME_API_KEY: process.env.VAGALUME_API_KEY,
  ITUNES_CACHE_TTL_S: process.env.ITUNES_CACHE_TTL_S,
  LYRICS_CACHE_TTL_S: process.env.LYRICS_CACHE_TTL_S
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_RADIO_NAME: process.env.NEXT_PUBLIC_RADIO_NAME,
  NEXT_PUBLIC_DEFAULT_COVER: process.env.NEXT_PUBLIC_DEFAULT_COVER,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
});
