import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radio Choup",
  description: "La radio rétro-glamour qui réveille votre cuisine."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
