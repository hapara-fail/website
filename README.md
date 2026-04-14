# hapara.fail v3

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hapara-fail/website)

hapara.fail is dedicated to exposing the pervasive nature of student surveillance technology used in educational environments. We provide technical insights, practical tools, and resources to empower students and advocate for digital privacy. This repository contains the source code for the v3 website, built on Cloudflare Workers.

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

- **Modern & Responsive Design:** A sleek, consistent interface optimized for all devices, built with best practices.
- **Edge Powered:** Built entirely on Cloudflare Workers for global performance and reliability. Static assets are served via Workers Assets.
- **Privacy First:** No user tracking, no invasive analytics. We practice what we preach.
- **Open Source:** All code is available for review and contribution.

---

## 💻 Technology Stack

- **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/) — Serverless execution environment on the edge.
- **Static Assets:** [Workers Assets](https://developers.cloudflare.com/workers/static-assets/) — Optimized hosting for site assets.
- **Routing & Logic:** [TypeScript](https://www.typescriptlang.org/) — Type-safe code for the Worker entry point.
- **Package Manager:** [pnpm](https://pnpm.io/) v9+
- **Code Formatter:** [Prettier](https://prettier.io/) — Opinionated code formatter.
- **Development/Deployment:** [Wrangler 4](https://developers.cloudflare.com/workers/wrangler/) — The Cloudflare CLI tool.
- **Core Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+) — Structure, style, and interactivity.
- **Fonts:** [Poppins](https://fonts.google.com/specimen/Poppins) via `@fontsource/poppins` (self-hosted, no external requests).

---

## 📁 Project Structure

```
├── scripts/
│   └── generate-version.js     # Build-time script to stamp version-data.js
├── src/
│   ├── site/                   # Static assets served by Workers Assets
│   │   ├── css/
│   │   │   ├── universal.css       # Global styles, resets, shared components
│   │   │   ├── animations.css      # Shared animation keyframes & utilities
│   │   │   ├── index.css           # Homepage styles
│   │   │   ├── about.css           # About page styles
│   │   │   ├── article.css         # Blog article styles
│   │   │   ├── blog-index.css      # Blog index styles
│   │   │   ├── contribute.css      # Contribute page styles
│   │   │   ├── dns-service.css     # DNS service page styles
│   │   │   ├── license.css         # License page styles
│   │   │   └── 404.css             # 404 error page styles
│   │   ├── js/
│   │   │   ├── nav.js              # Shared navigation logic
│   │   │   ├── cookie-notice.js    # Cookie/notice banner logic
│   │   │   ├── scroll-reveal.js    # Scroll-triggered reveal animations
│   │   │   ├── index.js            # Homepage interactivity
│   │   │   ├── contribute.js       # Contribute page logic
│   │   │   ├── dns-service.js      # DNS service tool (status checks, UI)
│   │   │   ├── license.js          # License page logic
│   │   │   └── version-data.js     # Auto-generated build version info
│   │   ├── images/                 # Site images and icons
│   │   ├── fonts/                  # Self-hosted Poppins font files
│   │   ├── downloads/              # Downloadable files
│   │   ├── index.html              # Homepage
│   │   ├── about.html              # About page
│   │   ├── contribute.html         # Contribute/donate page
│   │   ├── blog.html               # Blog index page
│   │   ├── blog-dns.html           # Blog: DNS
│   │   ├── blog-adguard-home.html  # Blog: AdGuard Home
│   │   ├── blog-age-verification.html           # Blog: Age Verification
│   │   ├── blog-chromeos-wifi-password-extractor.html  # Blog: ChromeOS Wi-Fi Password Extractor
│   │   ├── blog-death-of-learning.html          # Blog: Death of Learning
│   │   ├── dns-service.html        # DNS service page
│   │   ├── terms.html              # Terms of Service
│   │   ├── privacy.html            # Privacy Policy
│   │   ├── license.html            # License information
│   │   └── 404.html                # Custom 404 error page
│   └── worker.ts               # Cloudflare Worker entry point (routing & security headers)
├── .dev.vars                   # Local development secrets (not committed)
├── package.json                # Project dependencies and scripts
├── pnpm-workspace.yaml         # pnpm workspace config
├── tsconfig.json               # TypeScript configuration
├── wrangler.jsonc              # Cloudflare Workers configuration
└── README.md                   # This file
```

---

## 🗺️ Routes

### Primary Pages

| Route           | Description                       |
| --------------- | --------------------------------- |
| `/`             | Homepage                          |
| `/about`        | About page                        |
| `/contribute`   | Contribute / donate page          |
| `/terms`        | Terms of Service                  |
| `/privacy`      | Privacy Policy                    |
| `/license`      | License information               |
| `/blog`         | Blog index                        |
| `/blog/[slug]`  | Individual blog posts (see below) |
| `/services/dns` | DNS service page & tool           |

### Blog Posts

| Route                                    | Title                             |
| ---------------------------------------- | --------------------------------- |
| `/blog/dns`                              | DNS                               |
| `/blog/adguard-home`                     | AdGuard Home                      |
| `/blog/age-verification`                 | Age Verification                  |
| `/blog/chromeos-wifi-password-extractor` | ChromeOS Wi-Fi Password Extractor |
| `/blog/death-of-learning`                | Death of Learning                 |

Blog slugs are dynamically resolved: `/blog/[slug]` maps to the static file `blog-[slug].html`. Slugs are validated against `[a-z0-9-]` and capped at 200 characters.

### Redirects & Shortcuts

| Route      | Destination                                      |
| ---------- | ------------------------------------------------ |
| `/bypass`  | `/services/dns`                                  |
| `/dns`     | `/services/dns`                                  |
| `/discord` | [Discord Invite](https://discord.gg/KA66dHUF4P)  |
| `/github`  | [GitHub Profile](https://github.com/hapara-fail) |

All redirects are permanent (HTTP 301).

---

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (v9 or higher)
- A Cloudflare account with Wrangler authenticated (`wrangler login`)

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

3. **Configure local secrets** (optional):
   Create or edit `.dev.vars` for any local environment variables needed during development.

4. **Start the local development server:**
   ```bash
   pnpm run dev
   ```
   This runs `generate-version` then `wrangler dev`, serving the site locally at `http://127.0.0.1:8787`.

### Available Scripts

| Script             | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `pnpm run dev`     | Generate version data + start local Wrangler dev server     |
| `pnpm run preview` | Generate version data + run Wrangler dev in `--remote` mode |
| `pnpm run deploy`  | Generate version data + deploy to Cloudflare Workers        |
| `pnpm run build`   | Run `generate-version` only (stamps `version-data.js`)      |
| `pnpm run format`  | Format all files with Prettier                              |

---

## ☁️ Deployment

Ensure you have Wrangler installed and authenticated (`wrangler login`).

```bash
pnpm run deploy
```

This command generates the version stamp, then builds and deploys the project to the `hapara-fail` Worker specified in `wrangler.jsonc`.

---

## 🔒 Security

The Worker enforces a strict set of security response headers on every request:

- `Content-Security-Policy` — restricts asset origins; allows connections to `monitor.dns.hapara.fail` and `monitor.dns2.hapara.fail` for DNS status checks.
- `Strict-Transport-Security` — HSTS with `includeSubDomains; preload` (1 year).
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables camera, microphone, geolocation, and payment APIs.

Only `GET` and `HEAD` HTTP methods are accepted; all others return `405 Method Not Allowed`.

---

## 🤝 Contributing

Contributions are welcome! To ensure changes are processed quickly and correctly, please review our **[Contributing Guidelines](CONTRIBUTING.md)** before submitting.

If you have ideas for improvements, new tools, bug fixes, or blog post topics, please feel free to:

- **Open an Issue** on GitHub using our standardized templates.
- **Submit a Pull Request** with your proposed changes.
- Join our [Discord server](https://www.hapara.fail/discord) to discuss.

You can also find donation options [here](https://hapara.fail/contribute).

---

## 📄 License

This project is licensed under the terms specified at [www.hapara.fail/license](https://www.hapara.fail/license).
