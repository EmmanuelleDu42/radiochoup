# Radio Choup — Refonte Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réécrire entièrement le site Radio Choup en Next.js 15 + React 19 + TypeScript + Tailwind v4, avec déduplication serveur du polling Icecast, SEO temps réel via SSR, et PWA installable.

**Architecture:**
- Next.js App Router en mode standalone (déployable en Node + PM2 ou sur Vercel)
- Une seule source de vérité côté serveur pour l'état "now playing" (un poll Icecast partagé), exposée aux clients via SSE
- Hooks React encapsulent l'audio, l'état temps réel, et les raccourcis clavier
- Tests TDD : Vitest pour la logique pure, Playwright pour les parcours utilisateur

**Tech Stack:** Next.js 15.2, React 19, TypeScript 5.6, Tailwind CSS v4, lucide-react, framer-motion, Vitest, @testing-library/react, Playwright, pnpm, ESLint (next/core-web-vitals + ts), Prettier.

---

## Parallel Execution Map

Les tâches sont regroupées en phases. À l'intérieur d'une phase, **toutes les tâches sont indépendantes** et peuvent être exécutées par des agents parallèles. Une phase ne démarre que lorsque la précédente est complète et reviewée.

```
Phase 0 (Bootstrap)            ──> séquentiel : T0.1 → T0.2 → T0.3 → T0.4 → T0.5
Phase 1 (Lib pure)             ──> parallèle  : T1.1 ∥ T1.2 ∥ T1.3 ∥ T1.4 ∥ T1.5 ∥ T1.6
Phase 2 (API routes)           ──> parallèle  : T2.1 ∥ T2.2 ∥ T2.3 ∥ T2.4
Phase 3 (Hooks React)          ──> parallèle  : T3.1 ∥ T3.2 ∥ T3.3 ∥ T3.4 ∥ T3.5 ∥ T3.6
Phase 4 (Composants UI)        ──> parallèle  : T4.1 ∥ T4.2 ∥ T4.3 ∥ T4.4 ∥ T4.5 ∥ T4.6 ∥ T4.7 ∥ T4.8 ∥ T4.9 ∥ T4.10
Phase 5 (Pages + intégration)  ──> séquentiel : T5.1 → T5.2
Phase 6 (Assets + PWA)         ──> parallèle  : T6.1 ∥ T6.2 ∥ T6.3 ∥ T6.4
Phase 7 (Tests E2E)            ──> parallèle  : T7.1 ∥ T7.2 ∥ T7.3
Phase 8 (CI + déploiement)     ──> parallèle  : T8.1 ∥ T8.2 ∥ T8.3
Phase 9 (Documentation)        ──> parallèle  : T9.1 ∥ T9.2 ∥ T9.3 ∥ T9.4
Phase 10 (Cleanup legacy)      ──> séquentiel : T10.1
```

**Branche :** Toute la refonte est faite sur `refactor/redesign` (déjà créée). Les anciens fichiers (`api.php`, `index.php`, `player2/`, `js/old/`, `*.swf`) sont **conservés intacts pendant les phases 0-9** et supprimés uniquement en Phase 10. Cela garantit que `git diff main` reste lisible et qu'un rollback partiel est possible.

**Convention de commit :** chaque step "Commit" utilise le format `<type>(<scope>): <message>` en anglais. Types : `feat`, `fix`, `refactor`, `chore`, `test`, `docs`, `build`, `ci`.

---

## File Structure (cible finale)

```
radiochoup/
├── app/
│   ├── layout.tsx                  # Root layout, metadata SSR, fonts
│   ├── page.tsx                    # Home page (player principal)
│   ├── globals.css                 # Tailwind + variables CSS du thème rose
│   └── api/
│       ├── now-playing/route.ts    # GET — état actuel
│       ├── history/route.ts        # GET — 5 derniers morceaux
│       ├── lyrics/route.ts         # GET ?artist&title — paroles via Vagalume
│       └── stream-events/route.ts  # GET — SSE broadcast now-playing
├── components/
│   ├── Player.tsx                  # Player desktop (>=lg)
│   ├── PlayerMobile.tsx            # Player mobile (<lg)
│   ├── NowPlaying.tsx              # Titre + artiste animés
│   ├── CoverArt.tsx                # Pochette + watermark
│   ├── PlayButton.tsx              # Bouton lecture/pause
│   ├── VolumeControl.tsx           # Slider volume
│   ├── HistoryModal.tsx
│   ├── LyricsModal.tsx
│   ├── ProgramModal.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── hooks/
│   ├── useAudioPlayer.ts           # play/pause/volume/mute
│   ├── useNowPlaying.ts            # Consume SSE
│   ├── useHistory.ts               # Fetch /api/history
│   ├── useLyrics.ts                # Fetch /api/lyrics
│   ├── useKeyboardShortcuts.ts
│   └── useMediaSession.ts          # Bind navigator.mediaSession
├── lib/
│   ├── icecast.ts                  # Parser Icecast status-json.xsl
│   ├── shoutcast.ts                # Parser Shoutcast 7.html
│   ├── itunes.ts                   # Client iTunes Search API
│   ├── vagalume.ts                 # Client Vagalume API (server only)
│   ├── cache.ts                    # In-memory cache server (singleton)
│   ├── history-store.ts            # Ring buffer 20 morceaux (server)
│   ├── stream-source.ts            # Singleton "now playing" + SSE pub/sub
│   ├── types.ts                    # Types partagés
│   └── env.ts                      # Validation des env vars (zod)
├── public/
│   ├── img/                        # Migration des images existantes
│   ├── fonts/                      # Migration polices
│   ├── manifest.webmanifest
│   ├── sw.js                       # Service worker
│   ├── favicon.ico
│   └── icons/                      # PWA icons (192, 512)
├── tests/
│   ├── unit/                       # Vitest
│   │   ├── icecast.test.ts
│   │   ├── shoutcast.test.ts
│   │   ├── itunes.test.ts
│   │   ├── vagalume.test.ts
│   │   ├── cache.test.ts
│   │   └── history-store.test.ts
│   └── e2e/                        # Playwright
│       ├── playback.spec.ts
│       ├── history.spec.ts
│       └── keyboard.spec.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── CHANGELOG.md
│   ├── superpowers/plans/2026-05-06-redesign-nextjs.md  (ce fichier)
│   └── atomic/                     # Concepts atomiques
│       ├── streaming-source.md
│       ├── server-sent-events.md
│       ├── itunes-cache.md
│       └── pwa.md
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts (ou Tailwind v4 inline)
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
├── pnpm-lock.yaml
└── Dockerfile
```

**Legacy conservé jusqu'en Phase 10** : `api.php`, `index.php`, `js/`, `css/`, `config/`, `fonts/`, `img/`, `player2/`, `.htaccess`. La Phase 10 fait le ménage final.

---

## Variables d'environnement (cible)

Définies dans `.env.local` (dev) et `.env.production` :

```bash
# Icecast / Shoutcast
STREAM_TYPE=icecast                                   # icecast | shoutcast
STREAM_URL=https://icecast.cef-informatique.com:8443/stream
STREAM_STATUS_URL=https://icecast.cef-informatique.com:8443/status-json.xsl

# Polling
NOW_PLAYING_POLL_INTERVAL_MS=4000

# APIs externes
VAGALUME_API_KEY=cbc39186887ccc4786fe5bef2ab49270    # serveur uniquement
ITUNES_CACHE_TTL_S=86400
LYRICS_CACHE_TTL_S=604800

# Public
NEXT_PUBLIC_RADIO_NAME=Radio Choup
NEXT_PUBLIC_DEFAULT_COVER=/img/bg-capa.jpg
NEXT_PUBLIC_SITE_URL=https://www.radiochoup.com
```

**Règle stricte** : aucune clé API ne doit être préfixée `NEXT_PUBLIC_*` → la clé Vagalume est lue côté serveur seulement.

---

# Phase 0 — Bootstrap projet

Exécution **séquentielle**. Chaque tâche dépend de la précédente.

## Task 0.1: Initialisation Next.js 15 + TypeScript + Tailwind v4

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `postcss.config.mjs`, `.gitignore` (mise à jour)

- [ ] **Step 1: Créer le `package.json` minimal**

```bash
cat > /home/debian/radiochoup/package.json << 'EOF'
{
  "name": "radiochoup",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  }
}
EOF
```

- [ ] **Step 2: Installer les dépendances de production**

```bash
cd /home/debian/radiochoup
pnpm add next@15.2.0 react@19.0.0 react-dom@19.0.0 lucide-react@0.469.0 framer-motion@11.15.0 zod@3.24.1
```

- [ ] **Step 3: Installer les dépendances de développement**

```bash
pnpm add -D typescript@5.6.3 @types/react@19.0.0 @types/react-dom@19.0.0 @types/node@22.10.0 \
  tailwindcss@4.0.0 @tailwindcss/postcss@4.0.0 \
  eslint@9.17.0 eslint-config-next@15.2.0 \
  prettier@3.4.2 prettier-plugin-tailwindcss@0.6.9
```

- [ ] **Step 4: Créer `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    },
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "tests/e2e"]
}
```

- [ ] **Step 5: Créer `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "is1-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is2-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is3-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is4-ssl.mzstatic.com" },
      { protocol: "https", hostname: "is5-ssl.mzstatic.com" }
    ]
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      }
    ];
  }
};

export default nextConfig;
```

- [ ] **Step 6: Créer `postcss.config.mjs`**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};

export default config;
```

- [ ] **Step 7: Créer `app/globals.css` (Tailwind v4 + thème rose)**

```css
@import "tailwindcss";

@theme {
  --color-choup-pink-50: #fef2f4;
  --color-choup-pink-100: #fce4e8;
  --color-choup-pink-200: #f9c7d0;
  --color-choup-pink-300: #ef929d;
  --color-choup-pink-400: #e96875;
  --color-choup-pink-500: #cd7784;
  --color-choup-pink-600: #b35260;
  --font-display: "Trebuchet MS", Arial, Helvetica, sans-serif;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: var(--font-display);
  background-color: var(--color-choup-pink-500);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 8: Créer `app/layout.tsx` minimal**

```tsx
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
```

- [ ] **Step 9: Créer `app/page.tsx` placeholder**

```tsx
export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center text-choup-pink-100">
      <h1 className="text-4xl font-bold">Radio Choup — refonte en cours</h1>
    </main>
  );
}
```

- [ ] **Step 10: Mettre à jour `.gitignore`**

```bash
cat >> /home/debian/radiochoup/.gitignore << 'EOF'

# Next.js
.next/
out/
node_modules/
*.tsbuildinfo
next-env.d.ts

# pnpm
.pnpm-store/

# Env
.env
.env.local
.env.*.local

# Tests
playwright-report/
test-results/
coverage/

# OS
.DS_Store
EOF
```

- [ ] **Step 11: Vérifier que le projet build et lance**

```bash
cd /home/debian/radiochoup
pnpm build
```
Expected: build successful, sortie `.next/` créée.

```bash
pnpm dev &
sleep 5
curl -s http://localhost:3000 | grep -i "radio choup"
kill %1
```
Expected: la page contient "Radio Choup".

- [ ] **Step 12: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts postcss.config.mjs app/ .gitignore
git commit -m "build: scaffold next.js 15 + react 19 + tailwind v4"
```

---

## Task 0.2: Config ESLint + Prettier

**Files:**
- Create: `.eslintrc.json`, `.prettierrc`, `.prettierignore`

- [ ] **Step 1: Créer `.eslintrc.json`**

```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
    "react/jsx-no-leaked-render": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "ignorePatterns": ["node_modules/", ".next/", "out/", "tests/e2e/", "public/", "*.php", "js/old/", "player2/"]
}
```

- [ ] **Step 2: Créer `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 3: Créer `.prettierignore`**

```
.next/
node_modules/
out/
public/
pnpm-lock.yaml
*.php
js/old/
player2/
config/
```

- [ ] **Step 4: Lancer le lint pour valider la config**

```bash
cd /home/debian/radiochoup
pnpm lint
```
Expected: ✔ No ESLint warnings or errors.

- [ ] **Step 5: Lancer prettier en check**

```bash
pnpm prettier --check .
```
Expected: All matched files use Prettier code style!

- [ ] **Step 6: Commit**

```bash
git add .eslintrc.json .prettierrc .prettierignore
git commit -m "build: add eslint and prettier config"
```

---

## Task 0.3: Config Vitest

**Files:**
- Create: `vitest.config.ts`, `tests/unit/.gitkeep`

- [ ] **Step 1: Installer Vitest et dépendances de test unitaires**

```bash
cd /home/debian/radiochoup
pnpm add -D vitest@2.1.8 @vitest/coverage-v8@2.1.8 \
  @testing-library/react@16.1.0 @testing-library/dom@10.4.0 \
  @testing-library/user-event@14.5.2 jsdom@25.0.1
```

- [ ] **Step 2: Créer `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    coverage: {
      reporter: ["text", "html"],
      include: ["lib/**", "hooks/**", "components/**"]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  }
});
```

- [ ] **Step 3: Créer un test sentinel pour valider la config**

```ts
// tests/unit/sentinel.test.ts
import { describe, it, expect } from "vitest";

describe("vitest sentinel", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Lancer les tests**

```bash
pnpm test
```
Expected: 1 test passed (sentinel).

- [ ] **Step 5: Supprimer le test sentinel**

```bash
rm tests/unit/sentinel.test.ts
mkdir -p tests/unit
touch tests/unit/.gitkeep
```

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts tests/
git commit -m "test: setup vitest + testing-library"
```

---

## Task 0.4: Config Playwright

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/.gitkeep`

- [ ] **Step 1: Installer Playwright**

```bash
cd /home/debian/radiochoup
pnpm add -D @playwright/test@1.49.1
pnpm exec playwright install --with-deps chromium
```

- [ ] **Step 2: Créer `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } }
  ],
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
```

- [ ] **Step 3: Créer un test sentinel E2E**

```ts
// tests/e2e/sentinel.spec.ts
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Radio Choup/);
});
```

- [ ] **Step 4: Lancer le test sentinel**

```bash
pnpm test:e2e
```
Expected: 2 tests passed (chromium + mobile-chrome).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml playwright.config.ts tests/e2e/
git commit -m "test: setup playwright with chromium and mobile profiles"
```

---

## Task 0.5: Types partagés et structure dossiers

**Files:**
- Create: `lib/types.ts`, `lib/env.ts`, `.env.example`, `lib/.gitkeep`, `hooks/.gitkeep`, `components/.gitkeep`

- [ ] **Step 1: Créer `lib/types.ts`**

```ts
export type StreamType = "icecast" | "shoutcast";

export interface NowPlaying {
  song: string;
  artist: string;
  listeners: number | null;
  bitrate: number | null;
  fetchedAt: string; // ISO timestamp
}

export interface HistoryEntry {
  song: string;
  artist: string;
  playedAt: string; // ISO timestamp
}

export interface Lyrics {
  text: string | null;
  source: "vagalume" | null;
  available: boolean;
}

export interface CoverArt {
  url: string;
  source: "itunes" | "default";
  sizes: {
    s96: string;
    s128: string;
    s192: string;
    s256: string;
    s384: string;
    s512: string;
  };
}

export interface StreamEvent {
  type: "now-playing" | "history-updated";
  payload: NowPlaying | HistoryEntry[];
}
```

- [ ] **Step 2: Créer `lib/env.ts`**

```ts
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
```

- [ ] **Step 3: Créer `.env.example`**

```bash
# Streaming
STREAM_TYPE=icecast
STREAM_URL=https://icecast.cef-informatique.com:8443/stream
STREAM_STATUS_URL=https://icecast.cef-informatique.com:8443/status-json.xsl
NOW_PLAYING_POLL_INTERVAL_MS=4000

# APIs externes (server only)
VAGALUME_API_KEY=cbc39186887ccc4786fe5bef2ab49270
ITUNES_CACHE_TTL_S=86400
LYRICS_CACHE_TTL_S=604800

# Public
NEXT_PUBLIC_RADIO_NAME=Radio Choup
NEXT_PUBLIC_DEFAULT_COVER=/img/bg-capa.jpg
NEXT_PUBLIC_SITE_URL=https://www.radiochoup.com
```

- [ ] **Step 4: Créer `.env.local` (non commité)**

```bash
cp /home/debian/radiochoup/.env.example /home/debian/radiochoup/.env.local
```

- [ ] **Step 5: Préparer les répertoires**

```bash
cd /home/debian/radiochoup
mkdir -p lib hooks components
touch lib/.gitkeep hooks/.gitkeep components/.gitkeep
```

- [ ] **Step 6: Vérifier que `pnpm typecheck` passe**

```bash
pnpm typecheck
```
Expected: pas d'erreur (lib/env.ts ne fait pas appel aux env vars manquantes au build car pas encore importé).

- [ ] **Step 7: Commit**

```bash
git add lib/ hooks/ components/ .env.example
git commit -m "feat(lib): add shared types and env validation"
```

---

# Phase 1 — Bibliothèque pure (parallélisable)

Toutes les tâches T1.1 à T1.6 sont **indépendantes** et peuvent être assignées à des agents parallèles.

## Task 1.1: Parser Icecast

**Files:**
- Create: `lib/icecast.ts`, `tests/unit/icecast.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
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
```

- [ ] **Step 2: Lancer le test (doit échouer)**

```bash
pnpm test tests/unit/icecast.test.ts
```
Expected: FAIL — module `@/lib/icecast` introuvable.

- [ ] **Step 3: Implémenter `lib/icecast.ts`**

```ts
interface IcecastSource {
  title: string;
  listener_peak: number;
  listeners: number;
  bitrate: number;
}

interface IcecastStatus {
  icestats: {
    source?: IcecastSource | IcecastSource[];
  };
}

export interface ParsedNowPlaying {
  song: string;
  artist: string;
  listeners: number;
  bitrate: number;
}

export function parseIcecastStatus(raw: unknown): ParsedNowPlaying | null {
  if (!isIcecastStatus(raw)) return null;
  const sourceRaw = raw.icestats.source;
  if (!sourceRaw) return null;
  const source = Array.isArray(sourceRaw) ? sourceRaw[0] : sourceRaw;
  if (!source || typeof source.title !== "string") return null;

  const [artistRaw = "", songRaw = ""] = splitTitle(source.title);
  const artist = artistRaw.split(";")[0]?.trim() ?? "";
  const song = songRaw.trim();

  return {
    artist: artist === "" && song === "" ? source.title.trim() : artist,
    song: song === "" ? source.title.trim() : song,
    listeners: source.listeners,
    bitrate: source.bitrate
  };
}

function splitTitle(title: string): [string, string] {
  const idx = title.indexOf(" - ");
  if (idx === -1) return [title, ""];
  return [title.slice(0, idx), title.slice(idx + 3)];
}

function isIcecastStatus(value: unknown): value is IcecastStatus {
  return typeof value === "object" && value !== null && "icestats" in value;
}

export async function fetchIcecastStatus(statusUrl: string): Promise<ParsedNowPlaying | null> {
  const response = await fetch(statusUrl, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) return null;
  const data = await response.json();
  return parseIcecastStatus(data);
}
```

- [ ] **Step 4: Lancer le test (doit passer)**

```bash
pnpm test tests/unit/icecast.test.ts
```
Expected: 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add lib/icecast.ts tests/unit/icecast.test.ts
git commit -m "feat(lib): icecast status parser with tests"
```

---

## Task 1.2: Parser Shoutcast

**Files:**
- Create: `lib/shoutcast.ts`, `tests/unit/shoutcast.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
// tests/unit/shoutcast.test.ts
import { describe, it, expect } from "vitest";
import { parseShoutcast7HtmlBody } from "@/lib/shoutcast";

describe("parseShoutcast7HtmlBody", () => {
  it("extrait les données de base d'une réponse 7.html", () => {
    const body =
      "<html><body>1234,1,500,200,150,128,Beyoncé - Halo</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result).toEqual({
      streamingId: "1234",
      listenersMax: 500,
      listenersPeak: 200,
      listeners: 150,
      bitrate: 128,
      song: "Halo",
      artist: "Beyoncé"
    });
  });

  it("conserve les virgules dans le nom du morceau", () => {
    const body =
      "<html><body>1234,1,500,200,150,128,Bowie - Suffragette City, oh my</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result?.song).toContain("Suffragette City");
    expect(result?.song).toContain("oh my");
  });

  it("retourne null sur body vide", () => {
    expect(parseShoutcast7HtmlBody("")).toBeNull();
  });

  it("retire les balises HTML du nom du morceau", () => {
    const body = "<html><body>1,1,1,1,1,128,Artist - Song</body></html>";
    const result = parseShoutcast7HtmlBody(body);
    expect(result?.song).toBe("Song");
    expect(result?.artist).toBe("Artist");
  });
});
```

- [ ] **Step 2: Lancer le test (doit échouer)**

```bash
pnpm test tests/unit/shoutcast.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implémenter `lib/shoutcast.ts`**

```ts
export interface ShoutcastNowPlaying {
  streamingId: string;
  listenersMax: number;
  listenersPeak: number;
  listeners: number;
  bitrate: number;
  song: string;
  artist: string;
}

export function parseShoutcast7HtmlBody(body: string): ShoutcastNowPlaying | null {
  if (!body) return null;
  const stripped = body.replace(/<\/?[a-z][^>]*>/gi, "").trim();
  if (!stripped) return null;

  const parts = stripped.split(",");
  if (parts.length < 7) return null;

  const titleParts = parts.slice(6).join(",");
  const [artistRaw = "", songRaw = ""] = splitTitle(titleParts);

  return {
    streamingId: parts[0] ?? "",
    listenersMax: Number(parts[2] ?? 0),
    listenersPeak: Number(parts[3] ?? 0),
    listeners: Number(parts[4] ?? 0),
    bitrate: Number(parts[5] ?? 0),
    artist: artistRaw.trim(),
    song: songRaw.trim() || titleParts.trim()
  };
}

function splitTitle(title: string): [string, string] {
  const idx = title.indexOf(" - ");
  if (idx === -1) return [title, ""];
  return [title.slice(0, idx), title.slice(idx + 3)];
}

export async function fetchShoutcastStatus(streamUrl: string): Promise<ShoutcastNowPlaying | null> {
  const response = await fetch(`${streamUrl}/7.html`, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0 RadioChoup/2.0" },
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) return null;
  const body = await response.text();
  return parseShoutcast7HtmlBody(body);
}
```

- [ ] **Step 4: Lancer le test (doit passer)**

```bash
pnpm test tests/unit/shoutcast.test.ts
```
Expected: 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add lib/shoutcast.ts tests/unit/shoutcast.test.ts
git commit -m "feat(lib): shoutcast 7.html parser with tests"
```

---

## Task 1.3: Client iTunes Search API

**Files:**
- Create: `lib/itunes.ts`, `tests/unit/itunes.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
// tests/unit/itunes.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchItunesArtwork, buildArtworkSizes } from "@/lib/itunes";

describe("buildArtworkSizes", () => {
  it("dérive les tailles depuis l'URL 100x100", () => {
    const url = "https://example.com/artwork/100x100bb.jpg";
    const sizes = buildArtworkSizes(url);
    expect(sizes.s96).toContain("96x96bb");
    expect(sizes.s512).toContain("512x512bb");
  });

  it("retourne une URL stable si pas de pattern 100x100bb", () => {
    const url = "/img/bg-capa.jpg";
    const sizes = buildArtworkSizes(url);
    expect(sizes.s96).toBe(url);
    expect(sizes.s512).toBe(url);
  });
});

describe("searchItunesArtwork", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne l'URL artwork si l'API renvoie un résultat", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          resultCount: 1,
          results: [{ artworkUrl100: "https://x/100x100bb.jpg" }]
        })
      })
    );
    const result = await searchItunesArtwork({ artist: "A", song: "B" });
    expect(result).toBe("https://x/100x100bb.jpg");
  });

  it("retourne null si resultCount est 0", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ resultCount: 0, results: [] })
      })
    );
    const result = await searchItunesArtwork({ artist: "X", song: "Y" });
    expect(result).toBeNull();
  });

  it("retourne null en cas d'erreur réseau", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network"))
    );
    const result = await searchItunesArtwork({ artist: "X", song: "Y" });
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Lancer le test (doit échouer)**

```bash
pnpm test tests/unit/itunes.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implémenter `lib/itunes.ts`**

```ts
import type { CoverArt } from "@/lib/types";
import { clientEnv } from "@/lib/env.client";

interface ItunesResult {
  artworkUrl100: string;
}

interface ItunesResponse {
  resultCount: number;
  results: ItunesResult[];
}

export async function searchItunesArtwork(params: {
  artist: string;
  song: string;
}): Promise<string | null> {
  if (!params.artist || !params.song) return null;
  const term = encodeURIComponent(`${params.artist} ${params.song}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&limit=1`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const data: ItunesResponse = await response.json();
    if (data.resultCount === 0 || !data.results[0]) return null;
    return data.results[0].artworkUrl100;
  } catch {
    return null;
  }
}

export function buildArtworkSizes(baseUrl: string): CoverArt["sizes"] {
  const has100 = baseUrl.includes("100x100bb");
  const replace = (size: string) =>
    has100 ? baseUrl.replace("100x100bb", `${size}x${size}bb`) : baseUrl;

  return {
    s96: replace("96"),
    s128: replace("128"),
    s192: replace("192"),
    s256: replace("256"),
    s384: replace("384"),
    s512: replace("512")
  };
}

export async function getCoverArt(params: {
  artist: string;
  song: string;
}): Promise<CoverArt> {
  const fallback = clientEnv.NEXT_PUBLIC_DEFAULT_COVER;
  const url = await searchItunesArtwork(params);
  if (!url) {
    return { url: fallback, source: "default", sizes: buildArtworkSizes(fallback) };
  }
  const high = url.replace("100x100bb", "512x512bb");
  return { url: high, source: "itunes", sizes: buildArtworkSizes(high) };
}
```

- [ ] **Step 4: Lancer le test (doit passer)**

```bash
pnpm test tests/unit/itunes.test.ts
```
Expected: 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add lib/itunes.ts tests/unit/itunes.test.ts
git commit -m "feat(lib): itunes artwork client with tests"
```

---

## Task 1.4: Client Vagalume (paroles, server only)

**Files:**
- Create: `lib/vagalume.ts`, `tests/unit/vagalume.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
// tests/unit/vagalume.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/env.server", () => ({ getServerEnv: () => ({ VAGALUME_API_KEY: "test-key", LYRICS_CACHE_TTL_S: 604800 }) }));

const { fetchLyrics } = await import("@/lib/vagalume");

describe("fetchLyrics", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne les paroles si type=exact", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ type: "exact", mus: [{ text: "line1\nline2" }] })
      })
    );
    const result = await fetchLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(true);
    expect(result.text).toBe("line1\nline2");
    expect(result.source).toBe("vagalume");
  });

  it("retourne available=false si type=notfound", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ type: "notfound" })
      })
    );
    const result = await fetchLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(false);
    expect(result.text).toBeNull();
  });

  it("retourne available=false en erreur réseau", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network"))
    );
    const result = await fetchLyrics({ artist: "A", song: "S" });
    expect(result.available).toBe(false);
  });

  it("retourne available=false sur paramètres vides", async () => {
    const result = await fetchLyrics({ artist: "", song: "" });
    expect(result.available).toBe(false);
  });
});
```

- [ ] **Step 2: Lancer le test (doit échouer)**

```bash
pnpm test tests/unit/vagalume.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implémenter `lib/vagalume.ts`**

```ts
import "server-only";
import { getServerEnv } from "@/lib/env.server";
import type { Lyrics } from "@/lib/types";

interface VagalumeResponse {
  type: "exact" | "aprox" | "notfound" | "song_notfound";
  mus?: Array<{ text: string }>;
}

export async function fetchLyrics(params: {
  artist: string;
  song: string;
}): Promise<Lyrics> {
  if (!params.artist || !params.song) {
    return { text: null, source: null, available: false };
  }
  const url = new URL("https://api.vagalume.com.br/search.php");
  url.searchParams.set("apikey", getServerEnv().VAGALUME_API_KEY);
  url.searchParams.set("art", params.artist);
  url.searchParams.set("mus", params.song.toLowerCase());

  try {
    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: getServerEnv().LYRICS_CACHE_TTL_S }
    });
    if (!response.ok) return { text: null, source: null, available: false };
    const data: VagalumeResponse = await response.json();
    if ((data.type === "exact" || data.type === "aprox") && data.mus?.[0]?.text) {
      return { text: data.mus[0].text, source: "vagalume", available: true };
    }
    return { text: null, source: null, available: false };
  } catch {
    return { text: null, source: null, available: false };
  }
}
```

- [ ] **Step 4: Lancer le test (doit passer)**

```bash
pnpm test tests/unit/vagalume.test.ts
```
Expected: 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add lib/vagalume.ts tests/unit/vagalume.test.ts
git commit -m "feat(lib): vagalume lyrics client (server-only)"
```

---

## Task 1.5: Cache server-side singleton

**Files:**
- Create: `lib/cache.ts`, `tests/unit/cache.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
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
```

- [ ] **Step 2: Lancer le test (doit échouer)**

```bash
pnpm test tests/unit/cache.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implémenter `lib/cache.ts`**

```ts
interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache {
  private store = new Map<string, Entry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

const globalForCache = globalThis as unknown as { __memoryCache?: MemoryCache };

export const cache = globalForCache.__memoryCache ?? new MemoryCache();
if (process.env.NODE_ENV !== "production") {
  globalForCache.__memoryCache = cache;
}
```

- [ ] **Step 4: Lancer le test (doit passer)**

```bash
pnpm test tests/unit/cache.test.ts
```
Expected: 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add lib/cache.ts tests/unit/cache.test.ts
git commit -m "feat(lib): in-memory cache singleton with ttl"
```

---

## Task 1.6: History store (ring buffer)

**Files:**
- Create: `lib/history-store.ts`, `tests/unit/history-store.test.ts`

- [ ] **Step 1: Écrire le test**

```ts
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
```

- [ ] **Step 2: Lancer le test (doit échouer)**

```bash
pnpm test tests/unit/history-store.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implémenter `lib/history-store.ts`**

```ts
import type { HistoryEntry } from "@/lib/types";

export class HistoryStore {
  private buffer: HistoryEntry[] = [];

  constructor(private readonly maxSize: number) {}

  push(entry: { artist: string; song: string }): boolean {
    const last = this.buffer[0];
    if (last && last.artist === entry.artist && last.song === entry.song) {
      return false;
    }
    this.buffer.unshift({ ...entry, playedAt: new Date().toISOString() });
    if (this.buffer.length > this.maxSize) {
      this.buffer.length = this.maxSize;
    }
    return true;
  }

  list(): HistoryEntry[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }
}

const globalForHistory = globalThis as unknown as { __historyStore?: HistoryStore };

export const historyStore =
  globalForHistory.__historyStore ?? new HistoryStore(20);
if (process.env.NODE_ENV !== "production") {
  globalForHistory.__historyStore = historyStore;
}
```

- [ ] **Step 4: Lancer le test (doit passer)**

```bash
pnpm test tests/unit/history-store.test.ts
```
Expected: 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add lib/history-store.ts tests/unit/history-store.test.ts
git commit -m "feat(lib): history ring buffer store"
```

---

# Phase 2 — API routes (parallélisable)

T2.1 à T2.4 sont indépendantes (chacune touche son propre fichier route).

## Task 2.1: GET /api/now-playing

**Files:**
- Create: `lib/stream-source.ts`, `app/api/now-playing/route.ts`

- [ ] **Step 1: Implémenter `lib/stream-source.ts` (singleton qui poll Icecast/Shoutcast)**

```ts
import "server-only";
import { getServerEnv } from "@/lib/env.server";
import { fetchIcecastStatus } from "@/lib/icecast";
import { fetchShoutcastStatus } from "@/lib/shoutcast";
import { historyStore } from "@/lib/history-store";
import type { NowPlaying } from "@/lib/types";

type Subscriber = (data: NowPlaying) => void;

class StreamSource {
  private current: NowPlaying | null = null;
  private subscribers = new Set<Subscriber>();
  private timer: NodeJS.Timeout | null = null;

  start(): void {
    if (this.timer) return;
    void this.poll();
    this.timer = setInterval(() => void this.poll(), getServerEnv().NOW_PLAYING_POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getCurrent(): NowPlaying | null {
    return this.current;
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    if (this.current) fn(this.current);
    return () => this.subscribers.delete(fn);
  }

  private async poll(): Promise<void> {
    const parsed =
      getServerEnv().STREAM_TYPE === "icecast"
        ? await fetchIcecastStatus(getServerEnv().STREAM_STATUS_URL)
        : await fetchShoutcastStatus(getServerEnv().STREAM_URL);

    if (!parsed) return;

    const next: NowPlaying = {
      song: parsed.song,
      artist: parsed.artist,
      listeners: parsed.listeners,
      bitrate: parsed.bitrate,
      fetchedAt: new Date().toISOString()
    };

    const changed =
      !this.current ||
      this.current.song !== next.song ||
      this.current.artist !== next.artist;

    this.current = next;

    if (changed) {
      historyStore.push({ artist: next.artist, song: next.song });
      this.subscribers.forEach((fn) => fn(next));
    }
  }
}

const globalForStream = globalThis as unknown as { __streamSource?: StreamSource };
export const streamSource = globalForStream.__streamSource ?? new StreamSource();
if (process.env.NODE_ENV !== "production") {
  globalForStream.__streamSource = streamSource;
}
streamSource.start();
```

- [ ] **Step 2: Implémenter `app/api/now-playing/route.ts`**

```ts
import { NextResponse } from "next/server";
import { streamSource } from "@/lib/stream-source";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const data = streamSource.getCurrent();
  if (!data) {
    return NextResponse.json({ error: "Not yet available" }, { status: 503 });
  }
  return NextResponse.json(data);
}
```

- [ ] **Step 3: Tester manuellement**

```bash
cd /home/debian/radiochoup
pnpm dev &
sleep 8
curl -s http://localhost:3000/api/now-playing | head -c 300
kill %1
```
Expected: JSON contenant `song`, `artist`, `fetchedAt`.

- [ ] **Step 4: Commit**

```bash
git add lib/stream-source.ts app/api/now-playing/route.ts
git commit -m "feat(api): now-playing endpoint with singleton poller"
```

---

## Task 2.2: GET /api/history

**Files:**
- Create: `app/api/history/route.ts`

- [ ] **Step 1: Implémenter le route handler**

```ts
import { NextResponse } from "next/server";
import { historyStore } from "@/lib/history-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? "5")));
  return NextResponse.json({ history: historyStore.list().slice(0, limit) });
}
```

- [ ] **Step 2: Tester manuellement**

```bash
cd /home/debian/radiochoup
pnpm dev &
sleep 10
curl -s "http://localhost:3000/api/history?limit=5" | head -c 400
kill %1
```
Expected: JSON `{ "history": [...] }`.

- [ ] **Step 3: Commit**

```bash
git add app/api/history/route.ts
git commit -m "feat(api): history endpoint"
```

---

## Task 2.3: GET /api/lyrics

**Files:**
- Create: `app/api/lyrics/route.ts`

- [ ] **Step 1: Implémenter le route handler**

```ts
import { NextResponse } from "next/server";
import { fetchLyrics } from "@/lib/vagalume";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist") ?? "";
  const song = searchParams.get("song") ?? "";
  if (!artist || !song) {
    return NextResponse.json({ error: "artist and song are required" }, { status: 400 });
  }
  const lyrics = await fetchLyrics({ artist, song });
  return NextResponse.json(lyrics);
}
```

- [ ] **Step 2: Tester manuellement**

```bash
cd /home/debian/radiochoup
pnpm dev &
sleep 5
curl -s "http://localhost:3000/api/lyrics?artist=Patsy%20Cline&song=Crazy" | head -c 500
kill %1
```
Expected: JSON avec `text` non null si paroles trouvées, sinon `available: false`.

- [ ] **Step 3: Commit**

```bash
git add app/api/lyrics/route.ts
git commit -m "feat(api): lyrics endpoint via vagalume (server-only key)"
```

---

## Task 2.4: GET /api/stream-events (SSE)

**Files:**
- Create: `app/api/stream-events/route.ts`

- [ ] **Step 1: Implémenter le route handler SSE**

```ts
import { streamSource } from "@/lib/stream-source";
import { historyStore } from "@/lib/history-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const current = streamSource.getCurrent();
      if (current) send("now-playing", current);
      send("history-updated", historyStore.list().slice(0, 5));

      const unsubscribe = streamSource.subscribe((data) => {
        send("now-playing", data);
        send("history-updated", historyStore.list().slice(0, 5));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 25000);

      return () => {
        unsubscribe();
        clearInterval(heartbeat);
      };
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
```

- [ ] **Step 2: Tester manuellement (SSE)**

```bash
cd /home/debian/radiochoup
pnpm dev &
sleep 10
timeout 8 curl -N -s http://localhost:3000/api/stream-events | head -c 1500
kill %1
```
Expected: lignes `event: now-playing`, `data: {...}`.

- [ ] **Step 3: Commit**

```bash
git add app/api/stream-events/route.ts
git commit -m "feat(api): server-sent events for live now-playing"
```

---

# Phase 3 — Hooks React (parallélisable)

T3.1 à T3.6 sont indépendantes.

## Task 3.1: useAudioPlayer

**Files:**
- Create: `hooks/useAudioPlayer.ts`, `tests/unit/useAudioPlayer.test.tsx`

- [ ] **Step 1: Écrire le test**

```tsx
// tests/unit/useAudioPlayer.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

class FakeAudio {
  paused = true;
  volume = 1;
  muted = false;
  src = "";
  play = vi.fn(async () => {
    this.paused = false;
  });
  pause = vi.fn(() => {
    this.paused = true;
  });
  load = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

beforeEach(() => {
  vi.stubGlobal("Audio", FakeAudio);
  vi.stubGlobal("localStorage", {
    getItem: vi.fn().mockReturnValue("80"),
    setItem: vi.fn()
  });
});

describe("useAudioPlayer", () => {
  it("démarre en pause", () => {
    const { result } = renderHook(() => useAudioPlayer("https://stream.example/"));
    expect(result.current.isPlaying).toBe(false);
  });

  it("toggle bascule entre play et pause", async () => {
    const { result } = renderHook(() => useAudioPlayer("https://stream.example/"));
    await act(async () => {
      await result.current.toggle();
    });
    expect(result.current.isPlaying).toBe(true);
  });

  it("setVolume met à jour le volume et persiste", () => {
    const { result } = renderHook(() => useAudioPlayer("https://stream.example/"));
    act(() => result.current.setVolume(50));
    expect(result.current.volume).toBe(50);
  });
});
```

- [ ] **Step 2: Lancer le test (doit échouer)**

```bash
pnpm test tests/unit/useAudioPlayer.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Implémenter `hooks/useAudioPlayer.ts`**

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAudioPlayerResult {
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  setVolume: (value: number) => void;
  toggleMute: () => void;
}

const STORAGE_KEY = "radiochoup_volume";

export function useAudioPlayer(streamUrl: string): UseAudioPlayerResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const initial = stored ? Number(stored) : 80;
    setVolumeState(initial);

    const audio = new Audio(streamUrl);
    audio.volume = initial / 100;
    audio.preload = "none";
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, [streamUrl]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    await audio.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await play();
    } else {
      pause();
    }
  }, [pause, play]);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped / 100;
      audioRef.current.muted = clamped === 0;
    }
    setMuted(clamped === 0);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(clamped));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (muted) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const restored = stored ? Number(stored) || 80 : 80;
      setVolume(restored);
    } else {
      audioRef.current.muted = true;
      setMuted(true);
    }
  }, [muted, setVolume]);

  return { isPlaying, volume, muted, play, pause, toggle, setVolume, toggleMute };
}
```

- [ ] **Step 4: Lancer le test (doit passer)**

```bash
pnpm test tests/unit/useAudioPlayer.test.tsx
```
Expected: 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add hooks/useAudioPlayer.ts tests/unit/useAudioPlayer.test.tsx
git commit -m "feat(hooks): useAudioPlayer with persisted volume"
```

---

## Task 3.2: useNowPlaying (consume SSE)

**Files:**
- Create: `hooks/useNowPlaying.ts`

- [ ] **Step 1: Implémenter `hooks/useNowPlaying.ts`**

```ts
"use client";

import { useEffect, useState } from "react";
import type { NowPlaying } from "@/lib/types";

export function useNowPlaying(): { data: NowPlaying | null; connected: boolean } {
  const [data, setData] = useState<NowPlaying | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource("/api/stream-events");

    source.addEventListener("now-playing", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent<string>).data) as NowPlaying;
        setData(payload);
      } catch {
        // ignore malformed payload
      }
    });

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    return () => {
      source.close();
    };
  }, []);

  return { data, connected };
}
```

- [ ] **Step 2: Test rapide via build**

```bash
cd /home/debian/radiochoup
pnpm typecheck
```
Expected: pas d'erreur TS.

- [ ] **Step 3: Commit**

```bash
git add hooks/useNowPlaying.ts
git commit -m "feat(hooks): useNowPlaying via SSE consumer"
```

---

## Task 3.3: useHistory

**Files:**
- Create: `hooks/useHistory.ts`

- [ ] **Step 1: Implémenter `hooks/useHistory.ts`**

```ts
"use client";

import { useEffect, useState } from "react";
import type { HistoryEntry } from "@/lib/types";

export function useHistory(limit = 5): HistoryEntry[] {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const source = new EventSource("/api/stream-events");

    source.addEventListener("history-updated", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent<string>).data) as HistoryEntry[];
        setHistory(payload.slice(0, limit));
      } catch {
        // ignore
      }
    });

    return () => source.close();
  }, [limit]);

  return history;
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add hooks/useHistory.ts
git commit -m "feat(hooks): useHistory via SSE"
```

---

## Task 3.4: useLyrics

**Files:**
- Create: `hooks/useLyrics.ts`

- [ ] **Step 1: Implémenter `hooks/useLyrics.ts`**

```ts
"use client";

import { useEffect, useState } from "react";
import type { Lyrics } from "@/lib/types";

export function useLyrics(params: { artist: string; song: string } | null): Lyrics {
  const [lyrics, setLyrics] = useState<Lyrics>({ text: null, source: null, available: false });

  useEffect(() => {
    if (!params?.artist || !params?.song) {
      setLyrics({ text: null, source: null, available: false });
      return;
    }
    const controller = new AbortController();
    const url = new URL("/api/lyrics", window.location.origin);
    url.searchParams.set("artist", params.artist);
    url.searchParams.set("song", params.song);

    fetch(url.toString(), { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { text: null, source: null, available: false }))
      .then((data: Lyrics) => setLyrics(data))
      .catch(() => setLyrics({ text: null, source: null, available: false }));

    return () => controller.abort();
  }, [params?.artist, params?.song]);

  return lyrics;
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add hooks/useLyrics.ts
git commit -m "feat(hooks): useLyrics with abort on unmount"
```

---

## Task 3.5: useKeyboardShortcuts

**Files:**
- Create: `hooks/useKeyboardShortcuts.ts`

- [ ] **Step 1: Implémenter `hooks/useKeyboardShortcuts.ts`**

```ts
"use client";

import { useEffect } from "react";

interface Handlers {
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (value: number) => void;
  volumeUp: () => void;
  volumeDown: () => void;
}

export function useKeyboardShortcuts(handlers: Handlers): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      if (e.code === "Space" || e.code === "KeyP") {
        e.preventDefault();
        handlers.togglePlay();
        return;
      }
      if (e.code === "KeyM") {
        e.preventDefault();
        handlers.toggleMute();
        return;
      }
      if (e.code === "ArrowUp") {
        e.preventDefault();
        handlers.volumeUp();
        return;
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        handlers.volumeDown();
        return;
      }
      if (e.code.startsWith("Digit") || e.code.startsWith("Numpad")) {
        const digit = Number(e.key);
        if (Number.isInteger(digit) && digit >= 0 && digit <= 9) {
          e.preventDefault();
          handlers.setVolume(digit * 10);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add hooks/useKeyboardShortcuts.ts
git commit -m "feat(hooks): keyboard shortcuts (space, m, arrows, digits)"
```

---

## Task 3.6: useMediaSession

**Files:**
- Create: `hooks/useMediaSession.ts`

- [ ] **Step 1: Implémenter `hooks/useMediaSession.ts`**

```ts
"use client";

import { useEffect } from "react";
import type { CoverArt } from "@/lib/types";

interface MediaSessionParams {
  song: string;
  artist: string;
  cover: CoverArt | null;
  onPlay?: () => void;
  onPause?: () => void;
}

export function useMediaSession(params: MediaSessionParams | null): void {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!params) return;

    const sizes: Array<keyof CoverArt["sizes"]> = ["s96", "s128", "s192", "s256", "s384", "s512"];
    const artwork = params.cover
      ? sizes.map((key) => {
          const px = key.slice(1);
          return {
            src: params.cover!.sizes[key],
            sizes: `${px}x${px}`,
            type: "image/png"
          };
        })
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: params.song,
      artist: params.artist,
      artwork
    });

    if (params.onPlay) navigator.mediaSession.setActionHandler("play", params.onPlay);
    if (params.onPause) navigator.mediaSession.setActionHandler("pause", params.onPause);

    return () => {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
    };
  }, [params]);
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add hooks/useMediaSession.ts
git commit -m "feat(hooks): bind navigator.mediaSession metadata"
```

---

# Phase 4 — Composants UI (parallélisable)

T4.1 à T4.10 sont indépendantes (chaque composant dans son propre fichier).

## Task 4.1: Header

**Files:**
- Create: `components/Header.tsx`

- [ ] **Step 1: Implémenter `components/Header.tsx`**

```tsx
import Image from "next/image";

export function Header() {
  return (
    <header className="grid grid-cols-12 items-center border-b border-choup-pink-300/40 bg-[url('/img/background_menu.png')] bg-repeat px-4 py-6 md:px-8">
      <div className="col-span-3">
        <a href="/" title="Radio Choup">
          <Image src="/img/logo.png" alt="Radio Choup" width={200} height={100} priority />
        </a>
      </div>
      <nav className="col-span-6">
        <ul className="flex gap-6 text-choup-pink-300">
          <li>
            <a href="#about" className="border-y-2 border-dotted border-choup-pink-300 px-2 py-1 text-base">
              Qui sommes nous
            </a>
          </li>
          <li>
            <a href="#suggestion" className="border-y-2 border-dotted border-choup-pink-300 px-2 py-1 text-base">
              Suggestion
            </a>
          </li>
          <li>
            <a href="#don" className="border-y-2 border-dotted border-choup-pink-300 px-2 py-1 text-base">
              Faites un don
            </a>
          </li>
        </ul>
      </nav>
      <div className="col-span-3" id="cover-slot" />
    </header>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/Header.tsx
git commit -m "feat(ui): Header component"
```

---

## Task 4.2: Footer

**Files:**
- Create: `components/Footer.tsx`

- [ ] **Step 1: Implémenter `components/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="mt-8 bg-[url('/img/background_footer.png')] bg-repeat py-4 text-center text-xs text-choup-pink-100">
      <a href="https://www.mariepierrepastini.fr/" rel="external noreferrer" target="_blank" className="hover:underline">
        Webdesign MP Pastini
      </a>{" "}
      —{" "}
      <a href="#" className="hover:underline">
        Développement Cef-i
      </a>{" "}
      —{" "}
      <span>Radio Choup, tous droits réservés</span>
    </footer>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat(ui): Footer component"
```

---

## Task 4.3: PlayButton

**Files:**
- Create: `components/PlayButton.tsx`

- [ ] **Step 1: Implémenter `components/PlayButton.tsx`**

```tsx
"use client";

import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  isPlaying: boolean;
  onToggle: () => void;
}

export function PlayButton({ isPlaying, onToggle }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? "Mettre en pause" : "Lire"}
      className="grid size-16 place-items-center rounded-full bg-choup-pink-400 text-white shadow-lg transition hover:bg-choup-pink-500 focus-visible:outline-2 focus-visible:outline-choup-pink-200"
      whileTap={{ scale: 0.92 }}
      animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.5 }}
    >
      {isPlaying ? <Pause size={28} /> : <Play size={28} />}
    </motion.button>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/PlayButton.tsx
git commit -m "feat(ui): PlayButton with framer-motion pulse"
```

---

## Task 4.4: VolumeControl

**Files:**
- Create: `components/VolumeControl.tsx`

- [ ] **Step 1: Implémenter `components/VolumeControl.tsx`**

```tsx
"use client";

import { Volume2, VolumeX } from "lucide-react";

interface Props {
  volume: number;
  muted: boolean;
  onChange: (value: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, muted, onChange, onToggleMute }: Props) {
  return (
    <div className="flex items-center gap-2 text-choup-pink-100">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        className="rounded p-1 hover:bg-white/10"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : volume}
        aria-label="Volume"
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        className="h-1 w-32 cursor-pointer accent-choup-pink-300"
      />
      <span className="w-8 text-xs tabular-nums">{muted ? 0 : volume}</span>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/VolumeControl.tsx
git commit -m "feat(ui): VolumeControl slider"
```

---

## Task 4.5: NowPlaying

**Files:**
- Create: `components/NowPlaying.tsx`

- [ ] **Step 1: Implémenter `components/NowPlaying.tsx`**

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  song: string;
  artist: string;
}

export function NowPlaying({ song, artist }: Props) {
  return (
    <div className="text-center md:text-left">
      <AnimatePresence mode="wait">
        <motion.h2
          key={song}
          initial={{ opacity: 0, y: 10, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -10, rotateX: 90 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold uppercase text-choup-pink-50"
        >
          {song || "..."}
        </motion.h2>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.h3
          key={artist}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-lg capitalize text-choup-pink-100"
        >
          {artist || "..."}
        </motion.h3>
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/NowPlaying.tsx
git commit -m "feat(ui): NowPlaying with framer-motion transitions"
```

---

## Task 4.6: CoverArt

**Files:**
- Create: `components/CoverArt.tsx`

- [ ] **Step 1: Implémenter `components/CoverArt.tsx`**

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { CoverArt as CoverArtType } from "@/lib/types";

interface Props {
  cover: CoverArtType | null;
  fallbackUrl: string;
}

export function CoverArt({ cover, fallbackUrl }: Props) {
  const url = cover?.url ?? fallbackUrl;
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-choup-pink-600 shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={url}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${url}')` }}
          aria-hidden="true"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/CoverArt.tsx
git commit -m "feat(ui): CoverArt with crossfade animation"
```

---

## Task 4.7: HistoryModal

**Files:**
- Create: `components/HistoryModal.tsx`

- [ ] **Step 1: Implémenter `components/HistoryModal.tsx`**

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  entries: HistoryEntry[];
}

export function HistoryModal({ open, onClose, entries }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-title"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 id="history-title" className="text-xl font-bold text-choup-pink-600">
                Derniers titres écoutés
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="rounded p-1 hover:bg-choup-pink-100"
              >
                <X size={20} />
              </button>
            </header>
            <ul className="grid gap-2">
              {entries.length === 0 && <li className="text-sm text-gray-500">Aucun morceau encore.</li>}
              {entries.map((entry, idx) => (
                <li key={`${entry.playedAt}-${idx}`} className="rounded border-l-4 border-choup-pink-300 px-3 py-2">
                  <div className="font-semibold">{entry.song}</div>
                  <div className="text-sm text-gray-600">{entry.artist}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/HistoryModal.tsx
git commit -m "feat(ui): HistoryModal"
```

---

## Task 4.8: LyricsModal

**Files:**
- Create: `components/LyricsModal.tsx`

- [ ] **Step 1: Implémenter `components/LyricsModal.tsx`**

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Lyrics } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  song: string;
  artist: string;
  lyrics: Lyrics;
}

export function LyricsModal({ open, onClose, song, artist, lyrics }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lyrics-title"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 id="lyrics-title" className="text-xl font-bold text-choup-pink-600">
                {song} — {artist}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="rounded p-1 hover:bg-choup-pink-100"
              >
                <X size={20} />
              </button>
            </header>
            {lyrics.available && lyrics.text ? (
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{lyrics.text}</pre>
            ) : (
              <p className="text-sm text-gray-600">Paroles indisponibles pour ce morceau.</p>
            )}
            <p className="mt-4 text-center text-xs text-gray-500">
              Powered by{" "}
              <a href="https://www.vagalume.com.br/" target="_blank" rel="noreferrer" className="underline">
                Vagalume
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/LyricsModal.tsx
git commit -m "feat(ui): LyricsModal"
```

---

## Task 4.9: ProgramModal

**Files:**
- Create: `components/ProgramModal.tsx`

- [ ] **Step 1: Implémenter `components/ProgramModal.tsx`**

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProgramModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="program-title"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="mb-4 flex items-center justify-between">
              <h2 id="program-title" className="text-xl font-bold text-choup-pink-600">
                Programmation musicale de la semaine
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="rounded p-1 hover:bg-choup-pink-100"
              >
                <X size={20} />
              </button>
            </header>
            <Image
              src="/img/programmation.jpg"
              alt="Grille de programmation"
              width={700}
              height={500}
              className="mx-auto h-auto w-full max-w-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add components/ProgramModal.tsx
git commit -m "feat(ui): ProgramModal"
```

---

## Task 4.10: Player + PlayerMobile (composition)

**Files:**
- Create: `components/Player.tsx`, `components/PlayerMobile.tsx`

- [ ] **Step 1: Implémenter `components/Player.tsx` (desktop, ≥lg)**

```tsx
"use client";

import { useCallback, useState } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useHistory } from "@/hooks/useHistory";
import { useLyrics } from "@/hooks/useLyrics";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaSession } from "@/hooks/useMediaSession";
import { PlayButton } from "@/components/PlayButton";
import { VolumeControl } from "@/components/VolumeControl";
import { NowPlaying } from "@/components/NowPlaying";
import { CoverArt } from "@/components/CoverArt";
import { HistoryModal } from "@/components/HistoryModal";
import { LyricsModal } from "@/components/LyricsModal";
import { ProgramModal } from "@/components/ProgramModal";
import type { CoverArt as CoverArtType } from "@/lib/types";

interface Props {
  streamUrl: string;
  defaultCoverUrl: string;
  cover: CoverArtType | null;
}

export function Player({ streamUrl, defaultCoverUrl, cover }: Props) {
  const player = useAudioPlayer(streamUrl);
  const { data: nowPlaying } = useNowPlaying();
  const history = useHistory(5);
  const [openHistory, setOpenHistory] = useState(false);
  const [openLyrics, setOpenLyrics] = useState(false);
  const [openProgram, setOpenProgram] = useState(false);

  const lyricsParams =
    nowPlaying?.song && nowPlaying.artist
      ? { artist: nowPlaying.artist, song: nowPlaying.song }
      : null;
  const lyrics = useLyrics(lyricsParams);

  useKeyboardShortcuts({
    togglePlay: useCallback(() => void player.toggle(), [player]),
    toggleMute: player.toggleMute,
    setVolume: player.setVolume,
    volumeUp: useCallback(() => player.setVolume(Math.min(100, player.volume + 5)), [player]),
    volumeDown: useCallback(() => player.setVolume(Math.max(0, player.volume - 5)), [player])
  });

  useMediaSession(
    nowPlaying
      ? {
          song: nowPlaying.song,
          artist: nowPlaying.artist,
          cover,
          onPlay: () => void player.play(),
          onPause: () => player.pause()
        }
      : null
  );

  return (
    <section
      className="hidden bg-[url('/img/radio_ancienne.png')] bg-cover bg-no-repeat lg:block"
      style={{ minHeight: "475px" }}
    >
      <div className="mx-auto grid max-w-3xl grid-cols-12 items-end gap-4 p-6">
        <div className="col-span-3">
          <VolumeControl
            volume={player.volume}
            muted={player.muted}
            onChange={player.setVolume}
            onToggleMute={player.toggleMute}
          />
        </div>
        <div className="col-span-6">
          <NowPlaying song={nowPlaying?.song ?? "..."} artist={nowPlaying?.artist ?? "..."} />
        </div>
        <div className="col-span-3 flex justify-end">
          <PlayButton isPlaying={player.isPlaying} onToggle={() => void player.toggle()} />
        </div>
        <div className="col-span-3">
          <CoverArt cover={cover} fallbackUrl={defaultCoverUrl} />
        </div>
        <nav className="col-span-9 flex flex-wrap gap-3 text-sm">
          <button onClick={() => setOpenLyrics(true)} className="rounded bg-white/10 px-3 py-1 text-choup-pink-50 hover:bg-white/20">
            Paroles
          </button>
          <button onClick={() => setOpenHistory(true)} className="rounded bg-white/10 px-3 py-1 text-choup-pink-50 hover:bg-white/20">
            Historique
          </button>
          <button onClick={() => setOpenProgram(true)} className="rounded bg-white/10 px-3 py-1 text-choup-pink-50 hover:bg-white/20">
            Programme
          </button>
        </nav>
      </div>

      <HistoryModal open={openHistory} onClose={() => setOpenHistory(false)} entries={history} />
      <LyricsModal
        open={openLyrics}
        onClose={() => setOpenLyrics(false)}
        song={nowPlaying?.song ?? ""}
        artist={nowPlaying?.artist ?? ""}
        lyrics={lyrics}
      />
      <ProgramModal open={openProgram} onClose={() => setOpenProgram(false)} />
    </section>
  );
}
```

- [ ] **Step 2: Implémenter `components/PlayerMobile.tsx` (mobile, <lg)**

```tsx
"use client";

import { useCallback } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMediaSession } from "@/hooks/useMediaSession";
import { PlayButton } from "@/components/PlayButton";
import { VolumeControl } from "@/components/VolumeControl";
import { NowPlaying } from "@/components/NowPlaying";
import { CoverArt } from "@/components/CoverArt";
import type { CoverArt as CoverArtType } from "@/lib/types";

interface Props {
  streamUrl: string;
  defaultCoverUrl: string;
  cover: CoverArtType | null;
}

export function PlayerMobile({ streamUrl, defaultCoverUrl, cover }: Props) {
  const player = useAudioPlayer(streamUrl);
  const { data: nowPlaying } = useNowPlaying();

  useKeyboardShortcuts({
    togglePlay: useCallback(() => void player.toggle(), [player]),
    toggleMute: player.toggleMute,
    setVolume: player.setVolume,
    volumeUp: useCallback(() => player.setVolume(Math.min(100, player.volume + 5)), [player]),
    volumeDown: useCallback(() => player.setVolume(Math.max(0, player.volume - 5)), [player])
  });

  useMediaSession(
    nowPlaying
      ? {
          song: nowPlaying.song,
          artist: nowPlaying.artist,
          cover,
          onPlay: () => void player.play(),
          onPause: () => player.pause()
        }
      : null
  );

  return (
    <section className="bg-[url('/img/radio_ancienne_gsm.jpg')] bg-cover bg-top p-4 lg:hidden">
      <div className="mx-auto grid max-w-md gap-4">
        <CoverArt cover={cover} fallbackUrl={defaultCoverUrl} />
        <NowPlaying song={nowPlaying?.song ?? "..."} artist={nowPlaying?.artist ?? "..."} />
        <div className="flex items-center justify-between">
          <VolumeControl
            volume={player.volume}
            muted={player.muted}
            onChange={player.setVolume}
            onToggleMute={player.toggleMute}
          />
          <PlayButton isPlaying={player.isPlaying} onToggle={() => void player.toggle()} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 4: Commit**

```bash
git add components/Player.tsx components/PlayerMobile.tsx
git commit -m "feat(ui): Player and PlayerMobile composition"
```

---

# Phase 5 — Pages et intégration

Séquentiel : T5.1 puis T5.2.

## Task 5.1: Root layout avec metadata SSR dynamique

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Réécrire `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { clientEnv } from "@/lib/env.client";

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
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Vérifier le typage**

```bash
pnpm typecheck
```
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(app): root layout with SEO metadata"
```

---

## Task 5.2: Home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Réécrire `app/page.tsx` avec metadata dynamique et composition**

```tsx
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Player } from "@/components/Player";
import { PlayerMobile } from "@/components/PlayerMobile";
import { streamSource } from "@/lib/stream-source";
import { getCoverArt } from "@/lib/itunes";
import { getServerEnv } from "@/lib/env.server";
import { clientEnv } from "@/lib/env.client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const current = streamSource.getCurrent();
  if (!current) return { title: clientEnv.NEXT_PUBLIC_RADIO_NAME };
  return {
    title: `${current.song} — ${current.artist}`,
    description: `En direct sur ${clientEnv.NEXT_PUBLIC_RADIO_NAME} : ${current.song} par ${current.artist}.`
  };
}

export default async function HomePage() {
  const current = streamSource.getCurrent();
  const cover = current
    ? await getCoverArt({ artist: current.artist, song: current.song })
    : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Player
          streamUrl={getServerEnv().STREAM_URL}
          defaultCoverUrl={clientEnv.NEXT_PUBLIC_DEFAULT_COVER}
          cover={cover}
        />
        <PlayerMobile
          streamUrl={getServerEnv().STREAM_URL}
          defaultCoverUrl={clientEnv.NEXT_PUBLIC_DEFAULT_COVER}
          cover={cover}
        />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Build complet**

```bash
cd /home/debian/radiochoup
pnpm build
```
Expected: build successful.

- [ ] **Step 3: Lancer en dev et tester manuellement**

```bash
pnpm dev &
sleep 8
curl -s http://localhost:3000 | grep -i "radio choup"
kill %1
```
Expected: page contient bien le titre.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(app): home page with SSR metadata and player composition"
```

---

# Phase 6 — Assets + PWA (parallélisable)

T6.1 à T6.4 sont indépendantes.

## Task 6.1: Migration des assets statiques

**Files:**
- Create: `public/img/`, `public/fonts/`

- [ ] **Step 1: Copier les images legacy vers `public/img/`**

```bash
cd /home/debian/radiochoup
mkdir -p public/img public/fonts
cp -r img/* public/img/
cp -r fonts/* public/fonts/
ls public/img | head -20
```
Expected: liste des fichiers (logo.png, bg-capa.jpg, etc.).

- [ ] **Step 2: Vérifier que la home affiche les images**

```bash
pnpm dev &
sleep 5
curl -sI http://localhost:3000/img/logo.png | head -1
kill %1
```
Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "chore(assets): migrate img and fonts to public/"
```

---

## Task 6.2: PWA manifest

**Files:**
- Create: `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`

- [ ] **Step 1: Créer les icônes PWA**

```bash
cd /home/debian/radiochoup
mkdir -p public/icons
cp public/img/logo.png public/icons/icon-512.png
cp public/img/logo.png public/icons/icon-192.png
cp public/img/favicon.ico public/icons/apple-touch-icon.png 2>/dev/null || cp public/img/logo.png public/icons/apple-touch-icon.png
```

- [ ] **Step 2: Créer `public/manifest.webmanifest`**

```json
{
  "name": "Radio Choup",
  "short_name": "Choup",
  "description": "La radio rétro-glamour qui réveille votre cuisine.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#cd7784",
  "theme_color": "#cd7784",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 3: Vérifier**

```bash
pnpm dev &
sleep 5
curl -s http://localhost:3000/manifest.webmanifest | head
kill %1
```
Expected: contenu JSON du manifest.

- [ ] **Step 4: Commit**

```bash
git add public/manifest.webmanifest public/icons/
git commit -m "feat(pwa): add manifest and icons"
```

---

## Task 6.3: Service worker minimal

**Files:**
- Create: `public/sw.js`, `components/ServiceWorkerRegister.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Créer `public/sw.js`**

```js
const CACHE_NAME = "radiochoup-v1";
const PRECACHE = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.url.includes("/api/")) return;
  if (request.url.includes("/stream")) return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
```

- [ ] **Step 2: Créer `components/ServiceWorkerRegister.tsx`**

```tsx
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
```

- [ ] **Step 3: Modifier `app/layout.tsx` pour inclure le composant**

```tsx
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
      <body className="min-h-screen">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Vérifier le build**

```bash
pnpm build
```
Expected: build successful.

- [ ] **Step 5: Commit**

```bash
git add public/sw.js components/ServiceWorkerRegister.tsx app/layout.tsx
git commit -m "feat(pwa): add service worker with cache-first for static assets"
```

---

## Task 6.4: Favicon root

**Files:**
- Create: `app/favicon.ico`

- [ ] **Step 1: Copier le favicon legacy à la racine de `app/`**

```bash
cp /home/debian/radiochoup/public/img/favicon.ico /home/debian/radiochoup/app/favicon.ico
```

- [ ] **Step 2: Vérifier**

```bash
cd /home/debian/radiochoup
pnpm dev &
sleep 5
curl -sI http://localhost:3000/favicon.ico | head -1
kill %1
```
Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 3: Commit**

```bash
git add app/favicon.ico
git commit -m "feat(app): add favicon"
```

---

# Phase 7 — Tests E2E (parallélisable)

T7.1 à T7.3 sont indépendantes.

## Task 7.1: E2E playback

**Files:**
- Create: `tests/e2e/playback.spec.ts`
- Modify: `tests/e2e/sentinel.spec.ts` (suppression)

- [ ] **Step 1: Supprimer le sentinel**

```bash
rm /home/debian/radiochoup/tests/e2e/sentinel.spec.ts
```

- [ ] **Step 2: Écrire le test playback**

```ts
// tests/e2e/playback.spec.ts
import { test, expect } from "@playwright/test";

test.describe("playback", () => {
  test("la home charge avec le bouton lecture visible", async ({ page }) => {
    await page.goto("/");
    const playButton = page.getByRole("button", { name: /Lire|Mettre en pause/ });
    await expect(playButton).toBeVisible();
  });

  test("le slider de volume est présent et utilisable", async ({ page }) => {
    await page.goto("/");
    const volume = page.getByRole("slider", { name: /Volume/i }).first();
    await expect(volume).toBeVisible();
    await volume.fill("50");
    await expect(volume).toHaveValue("50");
  });

  test("le titre de page suit le morceau (eventually)", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(6000);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(3);
  });
});
```

- [ ] **Step 3: Lancer le test**

```bash
cd /home/debian/radiochoup
pnpm test:e2e tests/e2e/playback.spec.ts
```
Expected: tests passent.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/playback.spec.ts
git commit -m "test(e2e): playback flow"
```

---

## Task 7.2: E2E historique

**Files:**
- Create: `tests/e2e/history.spec.ts`

- [ ] **Step 1: Écrire le test**

```ts
// tests/e2e/history.spec.ts
import { test, expect } from "@playwright/test";

test.describe("history", () => {
  test("ouvrir et fermer la modale historique", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 1280) < 1024, "modal historique uniquement en desktop");
    await page.goto("/");
    await page.getByRole("button", { name: "Historique" }).click();
    await expect(page.getByRole("dialog", { name: /derniers titres/i })).toBeVisible();
    await page.getByRole("button", { name: "Fermer" }).first().click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
```

- [ ] **Step 2: Lancer le test**

```bash
cd /home/debian/radiochoup
pnpm test:e2e tests/e2e/history.spec.ts
```
Expected: tests passent.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/history.spec.ts
git commit -m "test(e2e): history modal"
```

---

## Task 7.3: E2E raccourcis clavier

**Files:**
- Create: `tests/e2e/keyboard.spec.ts`

- [ ] **Step 1: Écrire le test**

```ts
// tests/e2e/keyboard.spec.ts
import { test, expect } from "@playwright/test";

test.describe("keyboard shortcuts", () => {
  test("la touche M coupe le son et le restaure", async ({ page }) => {
    await page.goto("/");
    const volume = page.getByRole("slider", { name: /Volume/i }).first();
    await volume.fill("60");
    await page.keyboard.press("KeyM");
    await expect(volume).toHaveValue("0");
    await page.keyboard.press("KeyM");
    await expect(volume).toHaveValue("60");
  });

  test("la touche 5 met le volume à 50", async ({ page }) => {
    await page.goto("/");
    await page.locator("body").click();
    await page.keyboard.press("Digit5");
    const volume = page.getByRole("slider", { name: /Volume/i }).first();
    await expect(volume).toHaveValue("50");
  });
});
```

- [ ] **Step 2: Lancer le test**

```bash
cd /home/debian/radiochoup
pnpm test:e2e tests/e2e/keyboard.spec.ts
```
Expected: tests passent.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/keyboard.spec.ts
git commit -m "test(e2e): keyboard shortcuts"
```

---

# Phase 8 — CI + déploiement (parallélisable)

T8.1 à T8.3 sont indépendantes.

## Task 8.1: Dockerfile (déploiement standalone)

**Files:**
- Create: `Dockerfile`, `.dockerignore`

- [ ] **Step 1: Créer `Dockerfile`**

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

- [ ] **Step 2: Créer `.dockerignore`**

```
node_modules
.next
.git
.env*
!.env.example
tests
playwright-report
test-results
coverage
docs
*.md
.brv
.vscode
js/old
player2
*.swf
*.php
README*
```

- [ ] **Step 3: Vérifier le build Docker**

```bash
cd /home/debian/radiochoup
docker build -t radiochoup:test . 2>&1 | tail -20
```
Expected: image built successfully.

- [ ] **Step 4: Commit**

```bash
git add Dockerfile .dockerignore
git commit -m "build(docker): standalone production image"
```

---

## Task 8.2: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Créer `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
    branches: [dev]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - name: Install
        run: pnpm install --frozen-lockfile
      - name: Lint
        run: pnpm lint
      - name: Typecheck
        run: pnpm typecheck
      - name: Unit tests
        run: pnpm test
      - name: Build
        env:
          STREAM_TYPE: icecast
          STREAM_URL: https://example.com/stream
          STREAM_STATUS_URL: https://example.com/status-json.xsl
          VAGALUME_API_KEY: dummy
          NEXT_PUBLIC_SITE_URL: https://www.radiochoup.com
        run: pnpm build

  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: build-and-test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - name: E2E
        env:
          STREAM_TYPE: icecast
          STREAM_URL: https://icecast.cef-informatique.com:8443/stream
          STREAM_STATUS_URL: https://icecast.cef-informatique.com:8443/status-json.xsl
          VAGALUME_API_KEY: dummy
          NEXT_PUBLIC_SITE_URL: https://www.radiochoup.com
        run: pnpm test:e2e
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

- [ ] **Step 2: Vérifier que le YAML est valide**

```bash
cd /home/debian/radiochoup
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo OK
```
Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: github actions for lint, typecheck, unit, build, e2e"
```

---

## Task 8.3: Documentation déploiement

**Files:**
- Create: `docs/DEPLOYMENT.md`

- [ ] **Step 1: Créer `docs/DEPLOYMENT.md`**

````markdown
# Déploiement

## Variables d'environnement requises

Voir `.env.example` à la racine. Les `NEXT_PUBLIC_*` sont exposées au client ; toutes les autres restent serveur.

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `STREAM_TYPE` | non | `icecast` | `icecast` ou `shoutcast` |
| `STREAM_URL` | oui | — | URL du flux audio |
| `STREAM_STATUS_URL` | oui | — | Endpoint de statut JSON Icecast (si applicable) |
| `NOW_PLAYING_POLL_INTERVAL_MS` | non | `4000` | Intervalle de polling côté serveur |
| `VAGALUME_API_KEY` | oui | — | Clé API Vagalume (server-only) |
| `ITUNES_CACHE_TTL_S` | non | `86400` | Cache iTunes en secondes |
| `LYRICS_CACHE_TTL_S` | non | `604800` | Cache paroles en secondes |
| `NEXT_PUBLIC_RADIO_NAME` | non | `Radio Choup` | Nom affiché |
| `NEXT_PUBLIC_DEFAULT_COVER` | non | `/img/bg-capa.jpg` | Pochette par défaut |
| `NEXT_PUBLIC_SITE_URL` | oui | — | URL canonique du site |

## Option 1 — VPS Node + PM2 (proche du legacy)

```bash
# Sur le serveur
git clone https://github.com/EmmanuelleDu42/radiochoup.git
cd radiochoup
git checkout main
pnpm install --frozen-lockfile
cp .env.example .env.local
# éditer .env.local avec les vraies valeurs
pnpm build
pm2 start ".next/standalone/server.js" --name radiochoup
pm2 save
```

Front-end : nginx/apache en proxy_pass vers `http://127.0.0.1:3000`.

## Option 2 — Docker

```bash
docker build -t radiochoup:latest .
docker run -d \
  --name radiochoup \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  radiochoup:latest
```

## Option 3 — Vercel

Connecter le dépôt GitHub via [vercel.com/new](https://vercel.com/new). Renseigner les variables d'environnement dans Project Settings → Environment Variables. Le build et le déploiement sont automatiques sur push vers `main`.

**Attention** : la Phase 10 nettoie les anciens fichiers PHP. Si vous laissez tourner l'ancien hébergement Apache en parallèle pendant la transition, prévoyez un DNS de bascule.

## Vérifications post-déploiement

```bash
# Page principale
curl -sI https://www.radiochoup.com/ | head -1   # 200

# API
curl -s https://www.radiochoup.com/api/now-playing
curl -s https://www.radiochoup.com/api/history?limit=5

# SSE (devrait commencer à streamer)
curl -N -s https://www.radiochoup.com/api/stream-events | head -c 500
```

## Rollback

`refactor/redesign` étant mergé via PR vers `dev` puis `main`, un rollback se fait par revert du merge commit.
````

- [ ] **Step 2: Commit**

```bash
git add docs/DEPLOYMENT.md
git commit -m "docs: deployment guide for vps, docker, vercel"
```

---

# Phase 9 — Documentation atomique (parallélisable)

T9.1 à T9.4 sont indépendantes.

## Task 9.1: docs/ARCHITECTURE.md

**Files:**
- Create: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Créer le fichier**

````markdown
# Architecture

## Vue d'ensemble

Application Next.js 15 (App Router) en mode `standalone`. Aucune base de données : l'état temps réel ("now playing", historique) vit en mémoire serveur dans des singletons globaux.

```
┌──────────────┐     SSE      ┌─────────────────────┐
│   Client     │◀────────────▶│  Next.js (Node)     │
│ (React SPA)  │              │                     │
└──────────────┘              │  StreamSource       │
                              │  ├ poll Icecast 4s  │
                              │  └ broadcast        │
                              │                     │
                              │  HistoryStore       │
                              │  └ ring buffer 20   │
                              │                     │
                              │  MemoryCache        │
                              │  └ TTL key-value    │
                              └──────┬──────────────┘
                                     │
                              ┌──────▼──────┐
                              │  Icecast /  │
                              │  Shoutcast  │
                              └─────────────┘
```

## Décisions clés

- **Polling unique côté serveur** : un seul fetch Icecast toutes les 4 s, broadcast aux clients via SSE. Réduit la charge sur Icecast indépendamment du nombre d'auditeurs.
- **Historique en mémoire** : pour une radio web, 20 derniers morceaux suffisent largement. Pas de DB → simplicité opérationnelle.
- **Clés API privées côté serveur** : la clé Vagalume n'est jamais exposée au client.
- **App Router + Server Components** : la metadata SSR (titre, OG) suit le morceau en cours, ce qui améliore le SEO et le partage social.

## Couches

| Couche | Responsabilité | Localisation |
|---|---|---|
| Lib | Logique pure, parsers, clients HTTP | `lib/` |
| API routes | Endpoints HTTP / SSE | `app/api/` |
| Hooks | État client, audio, raccourcis | `hooks/` |
| Composants | UI atomique | `components/` |
| Pages | Composition + metadata SSR | `app/` |

Voir `docs/atomic/` pour les concepts détaillés.
````

- [ ] **Step 2: Commit**

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: architecture overview"
```

---

## Task 9.2: docs/API.md

**Files:**
- Create: `docs/API.md`

- [ ] **Step 1: Créer le fichier**

````markdown
# API Reference

Toutes les routes sont sous `/api/`. Réponses : `application/json` sauf `stream-events` (`text/event-stream`).

## GET /api/now-playing

Retourne le morceau en cours.

**200 OK**
```json
{
  "song": "Crazy",
  "artist": "Patsy Cline",
  "listeners": 7,
  "bitrate": 128,
  "fetchedAt": "2026-05-06T12:00:00.000Z"
}
```

**503 Service Unavailable** : pas encore initialisé (le serveur vient de démarrer, le premier poll n'a pas encore eu lieu).

## GET /api/history?limit=5

Retourne les N derniers morceaux distincts joués (max 20, défaut 5).

**200 OK**
```json
{
  "history": [
    { "song": "Crazy", "artist": "Patsy Cline", "playedAt": "2026-05-06T12:00:00Z" }
  ]
}
```

## GET /api/lyrics?artist=X&song=Y

Récupère les paroles via Vagalume (cachées 7 jours côté serveur).

**200 OK**
```json
{ "text": "...", "source": "vagalume", "available": true }
```

**400 Bad Request** : paramètres manquants.

## GET /api/stream-events

Server-Sent Events. Émet :

- `event: now-playing` à chaque changement de morceau
- `event: history-updated` après chaque mise à jour
- `: heartbeat` toutes les 25s pour empêcher la fermeture

**Exemple** :
```
event: now-playing
data: {"song":"Crazy","artist":"Patsy Cline",...}

: heartbeat
```
````

- [ ] **Step 2: Commit**

```bash
git add docs/API.md
git commit -m "docs: api reference"
```

---

## Task 9.3: docs/CHANGELOG.md

**Files:**
- Create: `docs/CHANGELOG.md`

- [ ] **Step 1: Créer le fichier**

````markdown
# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Unreleased]

### Refonte complète (Next.js)

- **Added** : Next.js 15 App Router, React 19, TypeScript, Tailwind v4
- **Added** : SSE pour le push temps réel (`/api/stream-events`)
- **Added** : Cache iTunes (24h) et paroles Vagalume (7j) côté serveur
- **Added** : PWA installable (manifest + service worker)
- **Added** : SEO temps réel (titre/OG dynamique selon le morceau)
- **Added** : Tests Vitest + Playwright + GitHub Actions CI
- **Removed** : `api.php`, `index.php`, `js/`, `css/`, `player2/`, `js/old/`, `*.swf`, jQuery, Bootstrap 4, animate.css, Font Awesome, jPlayer
- **Changed** : historique stocké en mémoire (ring buffer 20) au lieu de `player.log`
- **Security** : clé API Vagalume déplacée côté serveur uniquement
- **Security** : vérification TLS réactivée (suppression de `CURLOPT_SSL_VERIFYPEER => false`)

## [1.0.0] — Legacy

État initial du dépôt : PHP + jQuery + Bootstrap 4.
````

- [ ] **Step 2: Commit**

```bash
git add docs/CHANGELOG.md
git commit -m "docs: changelog for v2 refonte"
```

---

## Task 9.4: docs atomiques

**Files:**
- Create: `docs/atomic/streaming-source.md`, `docs/atomic/server-sent-events.md`, `docs/atomic/itunes-cache.md`, `docs/atomic/pwa.md`

- [ ] **Step 1: Créer `docs/atomic/streaming-source.md`**

````markdown
---
title: Streaming Source (singleton serveur)
slug: streaming-source
status: implemented
files:
  - lib/stream-source.ts
  - lib/icecast.ts
  - lib/shoutcast.ts
updated: 2026-05-06
---

# Streaming Source

Singleton qui poll Icecast/Shoutcast à intervalle fixe (`NOW_PLAYING_POLL_INTERVAL_MS`, défaut 4 s) et publie les changements à un ensemble de subscribers (les connexions SSE ouvertes).

## Garanties

- Un seul timer global, peu importe le nombre de clients
- Une entrée d'historique n'est ajoutée que si elle diffère de la dernière (déduplication)
- Les subscribers reçoivent la valeur courante immédiatement à la souscription

## Points d'attention

- Le singleton vit dans `globalThis.__streamSource` pour survivre au HMR en dev
- En production sur Vercel (serverless), chaque instance lambda a son propre singleton ; pour ce mode, prévoir un store partagé (Redis) si l'on monte en charge
````

- [ ] **Step 2: Créer `docs/atomic/server-sent-events.md`**

````markdown
---
title: Server-Sent Events (push temps réel)
slug: server-sent-events
status: implemented
files:
  - app/api/stream-events/route.ts
  - hooks/useNowPlaying.ts
  - hooks/useHistory.ts
updated: 2026-05-06
---

# Server-Sent Events

Le serveur expose `/api/stream-events` qui retourne un `ReadableStream` au format `text/event-stream`. Les événements émis :

- `now-playing` (objet `NowPlaying`)
- `history-updated` (tableau d'`HistoryEntry`)
- ligne `: heartbeat` toutes les 25 s pour empêcher la fermeture par les proxies

## Pourquoi SSE et pas WebSocket ?

Le besoin est unidirectionnel (serveur → client). SSE marche over HTTP/1.1, sans handshake spécial, sans dépendance, et reconnecte automatiquement côté navigateur via `EventSource`.

## Points d'attention

- L'unsubscribe doit être nettoyé sinon les listeners s'accumulent
- En reverse proxy nginx, ajouter `proxy_buffering off` sur ce path
````

- [ ] **Step 3: Créer `docs/atomic/itunes-cache.md`**

````markdown
---
title: Cache iTunes (pochettes)
slug: itunes-cache
status: implemented
files:
  - lib/itunes.ts
  - lib/cache.ts
updated: 2026-05-06
---

# Cache iTunes

iTunes Search API est gratuite mais soumise à un rate limit (~20 req/min/IP). On cache les résultats par couple `(artist, song)` pendant `ITUNES_CACHE_TTL_S` (24 h par défaut).

## Quand le cache rate

- Premier passage d'un morceau : 1 appel iTunes
- Re-passage dans les 24 h : 0 appel
- Morceau introuvable sur iTunes : la pochette par défaut est servie ; on cache aussi le miss pour ne pas re-fetcher

## Tailles

iTunes ne renvoie que `100x100bb`. Les autres tailles (96, 128, 192, 256, 384, 512) sont dérivées par substitution dans l'URL.
````

- [ ] **Step 4: Créer `docs/atomic/pwa.md`**

````markdown
---
title: Progressive Web App
slug: pwa
status: implemented
files:
  - public/manifest.webmanifest
  - public/sw.js
  - components/ServiceWorkerRegister.tsx
updated: 2026-05-06
---

# PWA

Manifest + service worker minimal pour installation native.

## Cache strategy

- **Cache-first** : pages, manifest, icônes
- **Network only** : `/api/*` et le flux audio (`/stream`)

## Installation

Sur Chrome/Android, le navigateur propose "Ajouter à l'écran d'accueil" automatiquement après quelques secondes. Sur iOS, l'utilisateur doit passer par le menu de partage.
````

- [ ] **Step 5: Commit**

```bash
git add docs/atomic/
git commit -m "docs(atomic): add atomic concepts (streaming, sse, itunes, pwa)"
```

---

# Phase 10 — Cleanup legacy

Séquentiel : une seule tâche.

## Task 10.1: Suppression du code legacy

**Files:**
- Delete: `index.php`, `api.php`, `js/`, `css/`, `config/`, `fonts/`, `img/`, `player2/`, `.htaccess`, `.brv/` (si présent à la racine et non utilisé)

- [ ] **Step 1: Vérifier que la nouvelle stack fonctionne en build production**

```bash
cd /home/debian/radiochoup
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
Expected: tout passe.

- [ ] **Step 2: Lister les fichiers legacy à supprimer**

```bash
cd /home/debian/radiochoup
ls -d index.php api.php js css config fonts img player2 .htaccess 2>/dev/null
```
Expected: liste de tous les artefacts legacy.

- [ ] **Step 3: Supprimer**

```bash
cd /home/debian/radiochoup
rm -rf index.php api.php js css config fonts img player2 .htaccess
```

- [ ] **Step 4: S'assurer que les images du nouveau site (dans `public/img/` et `public/fonts/`) sont bien là**

```bash
ls public/img/logo.png public/img/bg-capa.jpg
ls public/fonts/ | head -3
```
Expected: les fichiers existent.

- [ ] **Step 5: Re-build et test final**

```bash
pnpm build
pnpm test
```
Expected: tout passe.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove legacy php/jquery/bootstrap codebase"
```

- [ ] **Step 7: Vérifier l'état final du dépôt**

```bash
ls /home/debian/radiochoup
```
Expected: `app/ components/ docs/ hooks/ lib/ public/ tests/ Dockerfile package.json pnpm-lock.yaml tsconfig.json next.config.ts postcss.config.mjs vitest.config.ts playwright.config.ts .eslintrc.json .prettierrc .prettierignore .dockerignore .gitignore .env.example .github/`

---

# Self-Review — Couverture spec

| Élément spec | Tâche | Statut |
|---|---|---|
| Next.js 15 + React 19 | T0.1 | ✓ |
| TypeScript strict | T0.1, T0.5 | ✓ |
| Tailwind v4 | T0.1 | ✓ |
| ESLint + Prettier | T0.2 | ✓ |
| Vitest + Playwright | T0.3, T0.4 | ✓ |
| Parser Icecast | T1.1 | ✓ |
| Parser Shoutcast | T1.2 | ✓ |
| Client iTunes + cache | T1.3, T1.5 | ✓ |
| Vagalume server-only | T1.4 | ✓ |
| Historique ring buffer | T1.6 | ✓ |
| API now-playing | T2.1 | ✓ |
| API history | T2.2 | ✓ |
| API lyrics | T2.3 | ✓ |
| SSE | T2.4 | ✓ |
| Hook audio | T3.1 | ✓ |
| Hooks SSE | T3.2, T3.3 | ✓ |
| Hook lyrics | T3.4 | ✓ |
| Raccourcis clavier (refacto switch 200 lignes) | T3.5 | ✓ |
| MediaSession | T3.6 | ✓ |
| Composants UI atomiques | T4.1–T4.10 | ✓ |
| Page racine + SEO SSR dynamique | T5.1, T5.2 | ✓ |
| Migration assets | T6.1 | ✓ |
| PWA | T6.2, T6.3 | ✓ |
| Tests E2E | T7.1, T7.2, T7.3 | ✓ |
| Dockerfile | T8.1 | ✓ |
| CI GitHub Actions | T8.2 | ✓ |
| Doc déploiement | T8.3 | ✓ |
| Doc architecture + atomique | T9.1–T9.4 | ✓ |
| Cleanup legacy | T10.1 | ✓ |
| Clé Vagalume cachée | T1.4 (server-only) | ✓ |
| TLS verify activé | T1.1, T1.2 (fetch natif) | ✓ |
| Suppression `FILTER_SANITIZE_STRING` | T10.1 (suppression api.php) | ✓ |
| Suppression `confirm()` bloquant | T3.1 (gestion d'erreur dans le hook) | ✓ |
| Refactor switch keyCodes 200 lignes | T3.5 (table de mapping) | ✓ |
| Polling déduplication serveur | T2.1 (singleton + SSE) | ✓ |
| Page Visibility API | non couvert — voir note ci-dessous |

**Note** : La Page Visibility API n'est pas explicitement implémentée (T3.5 limitait son scope au keyboard). Avec le passage en SSE, le polling agressif ne dépend plus du client : un onglet caché reçoit juste les événements push, ce qui est nettement moins coûteux que le polling 4 s d'origine. Si nécessaire, ajouter une pause de l'`EventSource` quand `document.hidden` est `true` est trivial à ajouter dans `useNowPlaying`.
