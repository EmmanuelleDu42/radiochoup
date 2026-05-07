import type { Metadata } from "next";
import "./globals.css";
import { clientEnv } from "@/lib/env.client";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: clientEnv.NEXT_PUBLIC_RADIO_NAME,
    template: `%s | ${clientEnv.NEXT_PUBLIC_RADIO_NAME}`
  },
  description: "La radio rétro-glamour qui réveille votre cuisine.",
  keywords: ["radio", "cuisine", "rétro", "glamour", "pinup", "cooking"],
  icons: { icon: "/favicon.ico", apple: "/icons/apple-touch-icon.png" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: clientEnv.NEXT_PUBLIC_SITE_URL,
    siteName: clientEnv.NEXT_PUBLIC_RADIO_NAME,
    images: [{ url: "/img/logo.png", width: 512, height: 512 }]
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Share&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
