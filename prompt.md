# Threatscope — AI Build Prompt

> **Project:** Threatscope — A web-based website security vulnerability scanner  
> **Reference inspiration:** [checkvibe.dev](https://checkvibe.dev)  
> **Goal:** Build a full-stack SaaS web app that lets any user paste a URL and instantly receive a detailed security vulnerability report with AI-powered fix suggestions.

---

## Project Overview

Threatscope is a website security scanner that crawls a given URL and performs a battery of security checks, returning a clear, severity-rated vulnerability report. The differentiator from the reference product is:

- **Light, forensic aesthetic** —  light #f9fafb background, white cards, forest green (#2d6a4f) as the primary accent for buttons, badges, and progress elements, with a light green tint (#d8f3dc) for backgrounds and passed-check states
- **Broader audience** — not just vibe-coders; targets freelancers, agencies, and SMB owners
- **Plain-language explanations** — every vulnerability explained in non-technical terms
- **AI fix suggestions** — actionable prompts users can paste into any AI coding tool (Cursor, Claude Code, Copilot, Windsurf, etc.)
- **No login required for a free scan** — frictionless onboarding

---

## Recommended Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes (or separate Node.js/Express if preferred) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (email + Google OAuth) |
| Payments | Stripe (subscriptions + one-time scans) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Scanning Engine | Custom Node.js scanner (see Scanning Engine section) |
| Queue | BullMQ + Redis (for async scan jobs) |
| Hosting | Vercel (frontend) + Railway or Render (backend workers) |
| Email | Resend |

---

## Pages & Routes

### Public Pages
| Route | Description |
|---|---|
| `/` | Landing page with URL input hero, how-it-works, pricing, testimonials, FAQ |
| `/scan/[scanId]` | Scan results page (public shareable link) |
| `/pricing` | Full pricing page |
| `/blog` | Blog / SEO content |
| `/security-checks` | Full list of all checks performed |

### Auth Pages
| Route | Description |
|---|---|
| `/login` | Sign in page |
| `/signup` | Sign up page |

### Dashboard (Authenticated)
| Route | Description |
|---|---|
| `/dashboard` | Overview: recent scans, risk summary |
| `/dashboard/projects` | Manage projects (grouped sites) |
| `/dashboard/scans` | Full scan history |
| `/dashboard/scan/[scanId]` | Detailed scan result |
| `/dashboard/settings` | Account, billing, API keys |

### API Routes
| Endpoint | Method | Description |
|---|---|---|
| `/api/scan` | POST | Trigger a new scan (accepts `{ url }`) |
| `/api/scan/[scanId]` | GET | Fetch scan results |
| `/api/scan/[scanId]/pdf` | GET | Download PDF report |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |

---

## Scanning Engine

The scanner is a Node.js module that takes a URL as input and runs the following checks. Each check returns: `{ id, name, status: "pass"|"fail"|"warn", severity: "critical"|"high"|"medium"|"low", description, detail, affectedValue }`.

### Security Headers Checks
- `X-Frame-Options` header present and correctly set
- `X-Content-Type-Options: nosniff` present
- `Content-Security-Policy` (CSP) header present and not overly permissive
- `Strict-Transport-Security` (HSTS) present with `max-age >= 31536000`
- `Permissions-Policy` header present
- `Referrer-Policy` set
- `X-XSS-Protection` (legacy, flag if missing)
- `Server` header not exposing tech stack (e.g., `Apache/2.4.1`)
- `X-Powered-By` not exposed

### SSL / TLS Checks
- Valid, non-expired SSL certificate
- Certificate chain complete
- Redirect from HTTP → HTTPS active
- TLS version is 1.2 or higher (flag TLS 1.0/1.1)
- HSTS preload eligible

### Exposed Secrets / API Keys
- Scan homepage HTML + JS bundles for patterns matching:
  - `sk_live_`, `sk_test_` (Stripe)
  - `AIza` (Google API key)
  - `AKIA` (AWS access key)
  - `supabase.co` combined with `anon` key pattern
  - Firebase config object in client JS
  - Generic `api_key`, `apiKey`, `secret`, `password` in JS source
  - GitHub tokens (`ghp_`, `ghs_`)

### CORS Configuration
- `Access-Control-Allow-Origin: *` flag (overly permissive)
- Credentials allowed with wildcard origin

### Cookie Security
- Session cookies missing `HttpOnly` flag
- Session cookies missing `Secure` flag
- `SameSite` attribute not set on cookies

### Content & Injection Checks
- Open redirect patterns in URLs
- Reflected input in error pages (basic XSS surface detection)
- SQL error messages leaking in responses

### Information Disclosure
- Stack traces or debug info visible in responses
- `.env` file publicly accessible (`/  .env`, `/.env.local`, `/.env.production`)
- `robots.txt` exposing sensitive paths
- `/.git/config` publicly accessible
- `/wp-config.php` (WordPress) accessible
- `/phpinfo.php` accessible
- Directory listing enabled

### DNS & Infrastructure
- SPF record configured for the domain
- DMARC record configured
- DNSSEC enabled
- CAA records present

### Performance / Best Practices (bonus checks)
- Mixed content (HTTP resources on HTTPS page)
- Subresource Integrity (SRI) on external scripts

---

## AI Fix Prompt Generation

After the scan completes, for each failed check, call the Claude API to generate a fix prompt. Use this system prompt pattern:

```
You are a security expert assistant. A website has a vulnerability: [VULNERABILITY_NAME].

Details: [TECHNICAL_DETAIL]

Write a short, precise fix prompt that a developer can paste into an AI code editor like Cursor or Claude Code. The prompt should:
- Be 3–6 sentences max
- Specify exactly what file/config to edit
- Give the exact code or header value to add
- Be actionable with zero ambiguity

Return only the fix prompt text, no preamble.
```

Store the generated fix prompts in the database alongside the scan result, so they are not re-generated on every page load.

---

## Pricing Tiers

### Free (no account required)
- 3 scans/month
- See severity summary only (count of Critical / High / Medium)
- No detailed vulnerability descriptions
- No AI fix prompts
- No PDF export

### Starter — 15euro/month (or 150euro/year)
- 1 project
- 30 scans/month
- Full vulnerability details
- AI fix prompts
- PDF export
- API access (1 key)

### Pro — 33euro/month (or $320/year) ⭐ Most Popular
- 5 projects
- 100 scans/month
- Everything in Starter
- Scheduled / daily monitoring with email alerts
- 5 API keys
- Priority support

### Agency — $79/month (or $650/year)
- Unlimited projects
- Unlimited scans
- White-label PDF reports (custom logo)
- 20 API keys
- Dedicated support
- Bulk scan via API

---

## Email Notifications

Trigger emails via Resend for:
- Scan complete (with summary of critical/high findings)
- Daily monitoring alert (new vulnerabilities detected since last scan)
- Account: welcome email, password reset, subscription confirmation

---

## Auth & Access Control

- Users must be logged in to save scan history, access dashboard, and use paid features
- Free scans (no login) generate a temporary public results URL valid for 7 days
- Scan results are private to the user's account unless explicitly shared via public link
- API key auth for programmatic scanning (`Authorization: Bearer sk_sa_...`)

---

## Database Schema (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  plan          Plan     @default(FREE)
  scansThisMonth Int     @default(0)
  createdAt     DateTime @default(now())
  scans         Scan[]
  projects      Project[]
  apiKeys       ApiKey[]
}

model Project {
  id        String   @id @default(cuid())
  name      String
  url       String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  scans     Scan[]
  monitoring Boolean @default(false)
  createdAt DateTime @default(now())
}

model Scan {
  id          String       @id @default(cuid())
  url         String
  status      ScanStatus   @default(PENDING)
  riskScore   Int?
  userId      String?
  user        User?        @relation(fields: [userId], references: [id])
  projectId   String?
  project     Project?     @relation(fields: [projectId], references: [id])
  findings    Finding[]
  createdAt   DateTime     @default(now())
  completedAt DateTime?
  shareToken  String?      @unique
}

model Finding {
  id          String   @id @default(cuid())
  scanId      String
  scan        Scan     @relation(fields: [scanId], references: [id])
  name        String
  severity    Severity
  category    String
  status      String   // "fail" | "pass" | "warn"
  description String
  detail      String?
  affectedValue String?
  fixPrompt   String?
  createdAt   DateTime @default(now())
}

model ApiKey {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  key       String   @unique
  label     String?
  createdAt DateTime @default(now())
  lastUsed  DateTime?
}

enum Plan { FREE STARTER PRO AGENCY }
enum ScanStatus { PENDING RUNNING COMPLETE FAILED }
enum Severity { CRITICAL HIGH MEDIUM LOW INFO }
```

---

## Scan Flow (Step-by-Step)

1. User inputs URL on frontend
2. `POST /api/scan` is called with `{ url }`
3. Backend validates URL (must be HTTP/HTTPS, not localhost/private IP)
4. If user is on free plan, check monthly scan quota
5. A `Scan` record is created in DB with `status: PENDING`
6. Scan job is pushed to BullMQ Redis queue
7. Worker picks up job, sets `status: RUNNING`
8. Worker runs all checks in parallel (group by category, run groups concurrently)
9. For each failed check, call Claude API to generate fix prompt
10. All findings saved to DB
11. Scan `riskScore` calculated (weighted: Critical=40pts, High=20pts, Medium=8pts, Low=2pts — capped at 100)
12. `status` set to `COMPLETE`, `completedAt` recorded
13. Frontend polls `GET /api/scan/[scanId]` every 2 seconds until complete
14. Results page renders with full findings

---

## Risk Score Calculation

```
score = 100 - (criticalCount × 25 + highCount × 12 + mediumCount × 5 + lowCount × 2)
score = max(0, score)
```

Display as:
- **0–39:** 🔴 Critical Risk
- **40–64:** 🟠 High Risk  
- **65–79:** 🟡 Medium Risk
- **80–94:** 🟢 Low Risk
- **95–100:** ✅ Secure

---

## UI/UX Design

### Design Language
- **Color palette:**
  - Background: `#f9fafb` (near-white)
  - Surface / cards: `#ffffff`
  - Primary accent: Forest green `#2d6a4f`
  - Accent hover: `#1b4332`
  - Accent light tint (backgrounds, badges): `#d8f3dc`
  - Critical severity: `#dc2626` (red)
  - High severity: `#ea580c` (orange)
  - Medium severity: `#ca8a04` (amber)
  - Low severity: `#2d6a4f` (forest green)
  - Passed: `#16a34a` (green)
  - Body text: `#111827`
  - Muted text: `#6b7280`
  - Borders: `#e5e7eb`
- **Typography:** `Inter` for all body/UI text; `JetBrains Mono` or `Geist Mono` for code snippets and scan output only
- **Aesthetic:** Clean, professional, clinical — like a well-designed audit report or a doctor's test results. Light and trustworthy, not aggressive. Forest green signals "security" and "health."
- **Buttons:** Forest green primary buttons (`#2d6a4f`) with white text; ghost/outline variants for secondary actions, Don't make the design like AI with those soft borders, make borders a bit sharper (Classic style)
- **Animations:** Subtle scan progress bar in forest green, skeleton loaders on result cards, smooth accordion transitions

### Landing Page Sections (in order)

1. **Hero**
   - Headline: `"Your app has vulnerabilities. Let's find them."`
   - Sub: `"Paste a URL. Get a full security autopsy in 30 seconds."`
   - Large URL input field with `Run Scan →` button (forest green)
   - Trust bar: "Used by 3,000+ developers"
   - Animated mock scan output beneath (typewriter-style, shows checks running live)

2. **How It Works** — 3-step horizontal layout
   - Step 1: Paste URL
   - Step 2: We run 80+ checks
   - Step 3: Get your report + AI fix prompts

3. **What We Check** — card grid showing check categories (Headers, SSL, Secrets, Injections, CORS, CSP, etc.)

4. **Sample Report Preview** — screenshot or live embedded demo of a results page

5. **Testimonials** — carousel

6. **Pricing** — 3 tiers (see Pricing section)

7. **FAQ** — accordion

8. **CTA Footer** — "Run your free scan now"

### Results Page Layout
- **Top bar:** Site URL scanned, scan date, overall risk score (0–100, color-coded)
- **Summary cards:** Total issues by severity (Critical / High / Medium / Low / Passed)
- **Vulnerability list:** Each card shows:
  - Severity badge (colored dot + label)
  - Vulnerability name
  - Affected URL / header / field
  - Plain-English explanation (2–3 sentences, no jargon)
  - `Copy AI Fix Prompt` button (forest green outlined button)
  - Expandable technical details section
- **Share button** — public shareable link to results
- **Download PDF** — export full report (paid feature)

---

## Non-Functional Requirements

- Scan must complete within **45 seconds** max (use timeout per check: 8s)
- Free scan results page must be accessible without login
- Mobile responsive — URL input must work on mobile
- All user data must be deletable (GDPR compliance, "Delete my account" option in settings)
- Rate limiting: max 10 scans/hour per IP for unauthenticated users
- Never scan private IPs, localhost, or internal hostnames (security guardrail)
- All API endpoints must validate input and return proper error codes (400, 401, 403, 429, 500)

---

## Suggested Folder Structure

```
siteautopsy/
├── app/                        # Next.js App Router
│   ├── (auth)/login/
│   ├── (auth)/signup/
│   ├── (dashboard)/dashboard/
│   ├── scan/[scanId]/
│   ├── api/
│   │   ├── scan/route.ts
│   │   ├── scan/[scanId]/route.ts
│   │   └── webhooks/stripe/route.ts
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── scan/                   # ScanInput, ScanProgress, FindingCard
│   ├── dashboard/              # ProjectCard, ScanHistory
│   └── landing/                # Hero, HowItWorks, Pricing, FAQ
├── lib/
│   ├── scanner/                # All scanning modules
│   │   ├── index.ts            # Orchestrator
│   │   ├── headers.ts
│   │   ├── ssl.ts
│   │   ├── secrets.ts
│   │   ├── cors.ts
│   │   ├── cookies.ts
│   │   ├── disclosure.ts
│   │   └── dns.ts
│   ├── ai/                     # Claude fix prompt generation
│   ├── queue/                  # BullMQ setup
│   ├── db/                     # Prisma client
│   ├── stripe/                 # Stripe helpers
│   └── utils/
├── prisma/
│   └── schema.prisma
├── workers/
│   └── scan-worker.ts          # BullMQ worker process
└── types/
    └── index.ts
```

---

## Additional Notes for the Developer

- Use `p-limit` to run scan checks with concurrency control (max 10 parallel fetch requests)
- Use `axios` or native `fetch` with a 8-second timeout for all outgoing scan requests
- Do NOT follow redirects beyond 2 hops to prevent SSRF
- Sanitize the input URL strictly: reject `file://`, `ftp://`, internal IPs (10.x, 192.168.x, 172.16.x, 127.x)
- The PDF export should use `puppeteer` to render the scan result page and export it
- Store raw response headers from the target site in the `Scan` record for debugging
- Add a `"Powered by SiteAutopsy"` watermark on free PDF exports (removed on paid plans)
- The shareable public result link should use the `shareToken` field (a random 16-char slug), not the internal scan ID
