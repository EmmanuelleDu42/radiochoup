import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_RADIO_NAME: z.string().default("Radio Choup"),
  NEXT_PUBLIC_DEFAULT_COVER: z.string().default("/img/bg-capa.jpg"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default("https://www.radiochoup.com")
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_RADIO_NAME: process.env.NEXT_PUBLIC_RADIO_NAME,
  NEXT_PUBLIC_DEFAULT_COVER: process.env.NEXT_PUBLIC_DEFAULT_COVER,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
});
