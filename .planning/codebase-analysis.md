# Codebase Analysis: autowhatsapp (BotFlow)

**Analysis Date:** 2026-06-14

---

## 1. Tech Stack & Dependencies

### Runtime & Framework
- **Next.js 16.2.9** with React 19.2.4 — App Router architecture
- **TypeScript 5** throughout
- **Node.js** (assumed; no `.nvmrc` present)
- **Package manager:** npm (lockfile present)

### UI Layer
- **Tailwind CSS v4** with `@tailwindcss/postcss`
- **shadcn/ui** component library (`components.json` present) — provides `src/components/ui/` primitives
- **Radix UI** (via shadcn), **lucide-react** icons, **framer-motion** animations
- **Recharts** for analytics charts
- **next-themes** for dark/light mode, **tw-animate-css** for CSS animation utilities

### Forms & Validation
- **react-hook-form v7** + **@hookform/resolvers v5** + **Zod v4**

### Data Fetching & State
- **@tanstack/react-query v5** (provider set up in `src/components/providers/query-provider.tsx`) — not yet used in dashboard pages; all data fetching is manual `fetch()` calls in `useEffect`
- **No global state manager** (no Redux, Zustand, Jotai, etc.)
- **localStorage** used as a client-side "settings" store for API keys and connection settings

### Backend / BaaS
- **Appwrite v26** (client SDK): `src/lib/appwrite/config.ts`
- **node-appwrite v26.2** (server SDK): `src/lib/appwrite/server.ts`
- Auth uses cookie-based sessions (`appwrite-session` httpOnly cookie)

### AI Integration
- **Google Gemini API** (direct REST, no SDK): `src/lib/gemini.ts`
  - Model: `models/gemini-flash-lite-latest`
  - Called from both server webhook handler and client-side playground

### WhatsApp Automation
- **OpenWA** — self-hosted WhatsApp browser automation container (default `http://127.0.0.1:2785`)
  - Proxied via `src/app/api/openwa/[...path]/route.ts`
  - Receives webhook events at `src/app/api/webhooks/openwa/route.ts`

### Workflow Automation (Optional)
- **n8n** — external webhook-based automation alternative to built-in Gemini handler
  - Switchable via `automationBackend` setting (`"builtin"` | `"n8n"`)

### Payments
- **Stripe** (`stripe v22`, `@stripe/stripe-js v9`) — types and plan definitions in place; no active Stripe API call routes found in current codebase (billing UI is static/demo)

### Notifications / Toast
- **sonner v2** (primary), **react-hot-toast** (installed but not used directly in reviewed code)

### QR Code
- **qrcode v1.5** (Node.js, server-side rendering to data URL)
- **react-qr-code v2.2** (client display — installed but `qrcode` used in bots page instead)

### Transactional Email
- **nodemailer v8** — installed; no usage found in reviewed routes

### Real-time
- **socket.io-client v4.8** — installed; no active WebSocket usage found; `chat-sync` endpoint logs only

---

## 2. File / Directory Structure

```
/Users/mac/autowhatsapp/
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root layout (globals, providers)
│   │   ├── globals.css                       # Tailwind base + CSS vars
│   │   ├── favicon.ico
│   │   ├── (marketing)/                      # Public landing page group
│   │   │   ├── layout.tsx                    # Marketing layout (navbar + footer)
│   │   │   └── page.tsx                      # Home (/, assembles sections)
│   │   ├── (auth)/                           # Auth route group
│   │   │   ├── layout.tsx                    # Centered card layout
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/                      # Protected app route group
│   │   │   ├── layout.tsx                    # Sidebar + header shell ("use client")
│   │   │   ├── dashboard/page.tsx            # Overview stats + bot list + activity
│   │   │   ├── bots/page.tsx                 # Bot CRUD + QR connect + playground
│   │   │   ├── analytics/page.tsx            # Charts + message volume stats
│   │   │   ├── integration/page.tsx          # Widget configurator + embed code
│   │   │   └── settings/page.tsx             # Profile, API keys, billing
│   │   └── api/
│   │       ├── bots/route.ts                 # GET/POST/DELETE bot configs (JSON file store)
│   │       ├── settings/route.ts             # GET/POST app settings
│   │       ├── openwa/[...path]/route.ts     # Catch-all proxy to OpenWA container
│   │       └── webhooks/
│   │           ├── openwa/route.ts           # Receives OpenWA events → Gemini → reply
│   │           └── chat-sync/route.ts        # n8n conversation logging stub
│   ├── components/
│   │   ├── ui/                               # shadcn primitives (button, card, dialog, etc.)
│   │   ├── marketing/                        # Landing page section components
│   │   │   ├── hero-section.tsx
│   │   │   ├── features-section.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── stats-section.tsx
│   │   │   ├── pricing-preview.tsx
│   │   │   ├── testimonials.tsx
│   │   │   ├── cta-section.tsx
│   │   │   ├── navbar.tsx
│   │   │   └── footer.tsx
│   │   ├── providers/
│   │   │   ├── query-provider.tsx            # TanStack Query client wrapper
│   │   │   └── theme-provider.tsx            # next-themes wrapper
│   │   └── shared/
│   │       └── theme-toggle.tsx
│   ├── lib/
│   │   ├── appwrite/
│   │   │   ├── config.ts                     # Client SDK init + collection IDs
│   │   │   ├── server.ts                     # Admin + session server clients
│   │   │   ├── auth.ts                       # Server Actions: signUp/signIn/signOut/getLoggedInUser
│   │   │   └── setup-db.ts                   # One-time DB schema setup script
│   │   ├── gemini.ts                         # Gemini API REST helper
│   │   ├── server-store.ts                   # File-based JSON config store (read/write data.json)
│   │   ├── data.json                         # Runtime config: API keys, bot configs (gitignored-ish)
│   │   └── utils.ts                          # cn() className utility
│   ├── hooks/
│   │   └── use-mobile.ts                     # Responsive breakpoint hook
│   └── types/
│       └── index.ts                          # All TypeScript interfaces + PLANS constant
├── public/                                   # Static assets (SVGs, screenshots)
├── components.json                           # shadcn CLI config
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── .env.local                                # Environment variables (not committed)
```

---

## 3. Main Features & Pages

### Marketing (`/`)
Assembled from section components in `src/components/marketing/`. Static, server-rendered. Contains: hero, stats, features, how-it-works, pricing preview, testimonials, CTA.

### Auth (`/login`, `/register`)
- `"use client"` pages with form state
- Calls Next.js Server Actions in `src/lib/appwrite/auth.ts`
- **Demo mode bypass**: if `NEXT_PUBLIC_APPWRITE_PROJECT_ID` is `"your_project_id"` or unset, login bypasses Appwrite and pushes directly to `/dashboard`
- Google OAuth button is a demo stub (routes to `/dashboard` without real OAuth)

### Dashboard (`/dashboard`)
- Fetches bots from `/api/bots`, enriches with live OpenWA session status
- Fetches last 10 messages per bot from OpenWA for activity feed
- Shows stat cards: total messages, active bots, unique conversations, AI accuracy (98.4% hardcoded)
- First-visit 3-step onboarding dialog (tracked via `localStorage.botflow_welcome_seen`)

### Bots (`/bots`)
- Full bot CRUD: create, edit, toggle on/off, delete
- QR code WhatsApp connection flow: create OpenWA session → start → fetch QR → poll for connection success → register webhook
- Two webhook targets: `http://host.docker.internal:3000/api/webhooks/openwa` (builtin) or n8n URL
- AI Playground: inline chat UI that calls Gemini directly from the browser (API key from localStorage)

### Analytics (`/analytics`)
- Fetches message history from OpenWA for each bot
- Renders 7-day area chart (message volume) and horizontal bar chart (bot efficiency/success rate)
- Falls back to seeded mock percentages when OpenWA is unreachable

### Integrations (`/integration`)
- Widget configurator: choose bot, title, theme color, position
- Generates HTML script / iframe / React embed code snippets (static strings referencing `cdn.botflow.ai` — CDN does not exist yet)
- Live interactive widget preview simulator in-page

### Settings (`/settings`)
- Profile tab: name/email saved to `localStorage`
- API Keys tab: Gemini key, OpenWA key, OpenWA URL, n8n webhook URL, automation backend selector — saved to both `localStorage` AND synced to server via `POST /api/settings` (which writes to `src/lib/data.json`)
- Billing tab: static demo content showing "Growth Tier / $79/month"

---

## 4. Data Flow & State Management

### Config / Settings Flow
```
Settings Page
  → localStorage (client reads on load, writes on save)
  → POST /api/settings
      → src/lib/server-store.ts (getStore / saveStore)
          → src/lib/data.json (JSON file on disk)

Webhook Handler (server)
  → src/lib/server-store.ts getStore()
      → reads src/lib/data.json for geminiKey, openwaUrl, openwaKey, bots[]
```

**Critical gap**: The dashboard/bots pages read OpenWA credentials from `localStorage`, while the webhook handler reads them from `data.json`. If these diverge, messages will be processed with different credentials than the user configured in the UI.

### Bot Configuration Flow
```
Bots Page → POST /api/bots → server-store.ts → data.json
Bots Page → GET /api/bots  → server-store.ts → data.json
Bots Page → OpenWA proxy   → /api/openwa/[...path] → OpenWA container
```

### Message Processing Flow (Built-in mode)
```
WhatsApp user → OpenWA container → POST /api/webhooks/openwa
  → getStore() (reads data.json for bot config + geminiKey)
  → OpenWA history fetch (last 5 messages for context)
  → callGeminiAPI() → Gemini REST API
  → OpenWA send-text endpoint
  → POST /api/webhooks/chat-sync (logging stub)
```

### Authentication Flow
```
Login page → signIn() Server Action → Appwrite createEmailPasswordSession
  → httpOnly cookie "appwrite-session"
  → subsequent requests: getLoggedInUser() reads cookie → Appwrite session client
```

**Note**: Dashboard pages do NOT call `getLoggedInUser()`. There is no server-side auth guard on dashboard routes. The `(dashboard)/layout.tsx` is `"use client"` and only checks a demo mode condition for logout.

### Client State
- All dashboard page state is local React `useState`
- No Zustand, Context, or TanStack Query caching in use despite QueryProvider being mounted
- Settings are read from localStorage on mount via `useEffect` with a `setTimeout(..., 0)` delay (hydration workaround)

---

## 5. Notable Patterns & Concerns

### Architecture Patterns
- **Route Groups** used correctly: `(auth)`, `(dashboard)`, `(marketing)` each have own layouts
- **Server Actions** for auth (`"use server"` in `src/lib/appwrite/auth.ts`)
- **Catch-all API proxy** for OpenWA (`/api/openwa/[...path]`) forwards any method/path to the container
- **File-based JSON store** (`src/lib/data.json`) as a lightweight alternative to a database for bot/settings config

### Concerns

**1. No authentication guard on dashboard routes**
- `src/app/(dashboard)/layout.tsx` is `"use client"` and performs no server-side session check
- Any unauthenticated user can access `/dashboard`, `/bots`, `/analytics`, etc.
- Fix: Add a server component wrapper that calls `getLoggedInUser()` and redirects to `/login` if null

**2. API keys stored in localStorage**
- Gemini API key, OpenWA API key, and OpenWA URL are stored in `localStorage` under `botflow_*` keys
- This exposes keys to any JavaScript running on the page (XSS risk)
- The server already stores them in `data.json` — the client should read from `/api/settings` instead

**3. Config split between localStorage and data.json**
- Dashboard pages read OpenWA credentials from `localStorage`; webhook handler reads from `data.json`
- These can diverge silently; bot sessions configured in the UI may not match server expectations

**4. data.json committed to git**
- `src/lib/data.json` is the runtime config file (contains API keys when saved via Settings)
- It is NOT in `.gitignore` (checking git status: `M src/lib/data.json` is tracked)
- API keys saved via Settings UI will appear in git history

**5. Demo mode bypasses all auth**
- Login, logout, Google OAuth all fall through to demo mode if `NEXT_PUBLIC_APPWRITE_PROJECT_ID` is unset or `"your_project_id"`
- The billing page shows hardcoded "Growth Tier / $79/month" with no Stripe integration wired
- Conversations page was deleted (`D src/app/(dashboard)/conversations/page.tsx` in git status)

**6. chat-sync webhook is a stub**
- `src/app/api/webhooks/chat-sync/route.ts` only console.logs; no DB write or WebSocket emit
- socket.io-client is installed but unused — real-time live chat panel is not implemented

**7. Widget CDN references non-existent endpoints**
- Embed snippets in `/integration` reference `https://cdn.botflow.ai/widget/v1.js` and `https://botflow.ai/embed/[id]`
- These do not exist; the widget is only a preview simulator

**8. Inline interfaces duplicated across pages**
- `BotItem`, `ServerBotItem`, `OpenWASession` interfaces are redefined identically in `dashboard/page.tsx`, `bots/page.tsx`, `analytics/page.tsx`, and `integration/page.tsx`
- Should be consolidated in `src/types/index.ts`

**9. TanStack Query not utilized**
- QueryProvider is mounted in the root layout but all data fetching uses manual `fetch()` in `useEffect`
- No caching, deduplication, or background refetch benefits are realized

**10. Appwrite collections defined but not used in dashboard**
- `setup-db.ts` defines Users, Bots, Conversations, Messages, Subscriptions, Analytics collections
- The dashboard reads bots/settings from `data.json` (file store), not Appwrite
- Appwrite is only used for authentication; the full data model is essentially unused

---

## Environment Variables Required

```
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT
NEXT_PUBLIC_APPWRITE_PROJECT_ID
NEXT_PUBLIC_APPWRITE_DATABASE_ID
APPWRITE_API_KEY
NEXT_PUBLIC_COLLECTION_USERS
NEXT_PUBLIC_COLLECTION_BOTS
NEXT_PUBLIC_COLLECTION_CONVERSATIONS
NEXT_PUBLIC_COLLECTION_MESSAGES
NEXT_PUBLIC_COLLECTION_SUBSCRIPTIONS
NEXT_PUBLIC_COLLECTION_ANALYTICS
NEXT_PUBLIC_COLLECTION_SESSIONS

# Stripe (types/PLANS reference these)
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID
NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID

# App
NEXT_PUBLIC_APP_URL   # Used in webhook to call chat-sync
```

---

*Analysis complete: 2026-06-14*
