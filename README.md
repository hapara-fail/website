# hapara.fail v3

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hapara-fail/website)

hapara.fail is dedicated to exposing the pervasive nature of student surveillance technology used in educational environments. We provide technical insights, practical tools, and resources to empower students and advocate for digital privacy. This repository contains the source code for the v3 website, built with Astro and deployed to Cloudflare Workers.

**Live Site:** **[https://www.hapara.fail](https://www.hapara.fail)**

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/1wfyp.svg)](https://status.hapara.fail/)

---

## 🚀 Project Overview

This iteration of hapara.fail delivers a fast, modern, and privacy-respecting platform featuring:

- **Educational Content:** In-depth blog posts and technical write-ups explaining how edtech surveillance works.
- **Privacy Tools:** Interactive tools designed to bypass certain restrictions or reveal hidden information (e.g., DNS Service).
- **Community Focus:** Resources built by and for the student privacy community.

---

## ✨ Key Features

- **Modern & Responsive Design:** A sleek, consistent interface optimized for all devices.
- **Edge Powered:** Deployed to Cloudflare Workers via the `@astrojs/cloudflare` adapter. Static assets served from the built `dist/` directory.
- **Privacy First:** No user tracking, no invasive analytics. We practice what we preach.
- **MDX Blog:** Blog posts are written in MDX and support custom Astro components (callouts, timelines, evidence blocks, etc.).
- **Text-to-Speech:** Built-in audio player on blog posts using the Web Speech API, implemented as a Svelte component.
- **RSS Feed:** Auto-generated RSS feed at `/rss.xml` via `@astrojs/rss`.
- **Sitemap:** Auto-generated sitemap via `@astrojs/sitemap`.
- **Open Source:** All code is available for review and contribution.

---

## 💻 Technology Stack

- **Framework:** [Astro](https://astro.build/) v6 — Static site generator with island architecture.
- **UI Components:** [Svelte](https://svelte.dev/) v5 — Used for interactive islands (search, cookie notice, text-to-speech).
- **Content:** [MDX](https://mdxjs.com/) via `@astrojs/mdx` — Blog posts with embedded Astro components.
- **Deployment:** [Cloudflare Workers](https://workers.cloudflare.com/) via [`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) adapter.
- **CLI:** [Wrangler 4](https://developers.cloudflare.com/workers/wrangler/) — Cloudflare's deployment tool.
- **Package Manager:** [pnpm](https://pnpm.io/) v9+
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Icons:** [Lucide](https://lucide.dev/) via `@lucide/astro` and `@lucide/svelte`.
- **Fonts:** [Poppins](https://fonts.google.com/specimen/Poppins) and [Fira Code](https://fonts.google.com/specimen/Fira+Code) via `@fontsource` (self-hosted, no external requests).
- **Code Formatter:** [Prettier](https://prettier.io/)
- **SEO:** [`astro-seo`](https://github.com/jonasmerlin/astro-seo)

---

## 📁 Project Structure

```
├── public/                         # Static files copied as-is to dist/
├── scripts/
│   └── generate-version.js         # Build-time script to stamp version info
├── src/
│   ├── assets/                     # Images imported and processed by Astro
│   ├── components/
│   │   ├── blog/                   # MDX-embeddable Astro components
│   │   │   ├── BreachTable.astro
│   │   │   ├── CalloutWarning.astro
│   │   │   ├── EvidenceBlock.astro
│   │   │   ├── PullQuote.astro
│   │   │   ├── SectionLabel.astro
│   │   │   ├── SourceChip.astro
│   │   │   ├── Timeline.astro
│   │   │   └── TimelineItem.astro
│   │   ├── svelte/                 # Interactive Svelte island components
│   │   │   ├── BlogSearch.svelte   # Client-side blog search
│   │   │   ├── CookieNotice.svelte # Cookie/notice banner
│   │   │   └── TextToSpeech.svelte # Text-to-speech audio player
│   │   ├── Footer.astro
│   │   ├── Head.astro              # SEO meta tags, fonts, shared <head>
│   │   ├── Header.astro
│   │   └── Scripts.astro           # Shared script includes
│   ├── content/
│   │   └── blog/                   # MDX blog post source files
│   │       ├── adguard-home.mdx
│   │       ├── age-verification.mdx
│   │       ├── chromeos-wifi-password-extractor.mdx
│   │       ├── death-of-learning.mdx
│   │       └── dns.mdx
│   ├── layouts/
│   │   └── BaseLayout.astro        # Shared page layout wrapper
│   ├── pages/
│   │   ├── blog/
│   │   │   ├── index.astro         # Blog index page
│   │   │   └── [...slug].astro     # Dynamic blog post renderer
│   │   ├── services/
│   │   │   └── dns.astro           # DNS service page & tool
│   │   ├── 404.astro
│   │   ├── about.astro
│   │   ├── contribute.astro
│   │   ├── index.astro             # Homepage
│   │   ├── license.astro
│   │   ├── privacy.astro
│   │   ├── rss.xml.ts              # RSS feed endpoint
│   │   └── terms.astro
│   ├── content.config.ts           # Astro content collection schema
│   └── middleware.ts               # Security headers & HTTP method enforcement
├── astro.config.mjs                # Astro configuration
├── package.json
├── pnpm-workspace.yaml
├── svelte.config.js
├── tsconfig.json
└── wrangler.jsonc                  # Cloudflare Workers configuration
```

---

## 🗺️ Routes

### Primary Pages

| Route           | Description              |
| --------------- | ------------------------ |
| `/`             | Homepage                 |
| `/about`        | About page               |
| `/contribute`   | Contribute / donate page |
| `/terms`        | Terms of Service         |
| `/privacy`      | Privacy Policy           |
| `/license`      | License information      |
| `/blog`         | Blog index               |
| `/blog/[slug]`  | Individual blog posts    |
| `/services/dns` | DNS service page & tool  |
| `/rss.xml`      | RSS feed                 |

### Blog Posts

| Route                                    | Title                             |
| ---------------------------------------- | --------------------------------- |
| `/blog/dns`                              | DNS                               |
| `/blog/adguard-home`                     | AdGuard Home                      |
| `/blog/age-verification`                 | Age Verification                  |
| `/blog/chromeos-wifi-password-extractor` | ChromeOS Wi-Fi Password Extractor |
| `/blog/death-of-learning`                | Death of Learning                 |

Blog posts are sourced from `src/content/blog/` as MDX files, rendered by the dynamic `[...slug].astro` route, and can embed any component from `src/components/blog/`.

### Redirects

Configured in `astro.config.mjs`:

| Route      | Destination                                      |
| ---------- | ------------------------------------------------ |
| `/bypass`  | `/services/dns`                                  |
| `/dns`     | `/services/dns`                                  |
| `/discord` | [Discord Invite](https://discord.gg/KA66dHUF4P)  |
| `/github`  | [GitHub Profile](https://github.com/hapara-fail) |

---

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher recommended)
- [pnpm](https://pnpm.io/) v9+
- A Cloudflare account with Wrangler authenticated (`wrangler login`) — only needed for deployment

### Local Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/hapara-fail/website.git
   cd website
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Start the local development server:**

   ```bash
   pnpm run dev
   ```

   This starts the Astro dev server at `http://localhost:4321` with hot module reloading.

### Available Scripts

| Script                      | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| `pnpm run dev`              | Start the Astro development server                        |
| `pnpm run build`            | Generate version stamp + build the site to `dist/`        |
| `pnpm run preview`          | Build + run Wrangler dev server against the built `dist/` |
| `pnpm run deploy`           | Build + deploy to Cloudflare Workers                      |
| `pnpm run format` / `fmt`   | Format all files with Prettier                            |
| `pnpm run generate-version` | Stamp `version-data` only (called automatically by build) |

---

## ☁️ Deployment

Ensure you have Wrangler installed and authenticated (`wrangler login`).

```bash
pnpm run deploy
```

This command generates the version stamp, runs `astro build` to produce the `dist/` directory, then deploys via `wrangler deploy` to the `hapara-fail` Worker defined in `wrangler.jsonc`. Assets are served from the `dist/` directory via the Workers Assets binding.

---

## 🔒 Security

Security headers are applied to every response via Astro middleware (`src/middleware.ts`):

- `Content-Security-Policy` — restricts asset origins; allows connections to `monitor.dns.hapara.fail` and `monitor.dns2.hapara.fail` for DNS status checks, and `cdn.jsdelivr.net` with `raw.githubusercontent.com` fallback for blocklist content.
- `Strict-Transport-Security` — HSTS with `includeSubDomains; preload` (1 year).
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables camera, microphone, geolocation, and payment APIs.

Only `GET` and `HEAD` HTTP methods are accepted; all others return `405 Method Not Allowed`.

---

## 🤝 Contributing

Contributions are welcome! Please review our **[Contributing Guidelines](CONTRIBUTING.md)** before submitting.

If you have ideas for improvements, new tools, bug fixes, or blog post topics:

- **Open an Issue** on GitHub using our standardized templates.
- **Submit a Pull Request** with your proposed changes.
- Join our [Discord server](https://www.hapara.fail/discord) to discuss.

Donation options are available [here](https://hapara.fail/contribute).

---

## 📄 License

This project is licensed under the terms specified at [www.hapara.fail/license](https://www.hapara.fail/license).
