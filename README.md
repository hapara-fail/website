# hapara.fail v2

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/1wfyp.svg)](https://status.hapara.fail/)
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hapara-fail/website)

`hapara.fail` is dedicated to exposing the pervasive nature of student surveillance technology used in educational environments. We provide technical insights, practical tools, and resources to empower students and advocate for digital privacy. This repository contains the source code for the v2 website, built on Cloudflare Workers.

**Live Site:** **[https://hapara.fail](https://hapara.fail)** (Update if needed)

---

## 🚀 Project Overview

This iteration of `hapara.fail` delivers a fast, modern, and privacy-respecting platform featuring:

* **Educational Content:** In-depth blog posts and technical write-ups explaining how edtech surveillance works.
* **Privacy Tools:** Interactive tools designed to bypass certain restrictions or reveal hidden information (e.g., DNS Service, Google Form Unlocker, WiFi Password Extractor).
* **Community Focus:** Resources built by and for the student privacy community.

---

## ✨ Key Features

* **Modern & Responsive Design:** A sleek, consistent interface optimized for all devices, built with best practices.
* **Edge Powered:** Built entirely on Cloudflare Workers for global performance and reliability. Static assets are served via Workers Assets.
* **Privacy First:** No user tracking, no invasive analytics. We practice what we preach.
* **Open Source:** All code is available for review and contribution.

---

## 💻 Technology Stack

* **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless execution environment on the edge.
* **Static Assets:** [Workers Assets](https://developers.cloudflare.com/workers/static-assets/) - Optimized hosting for site assets.
* **Routing & Logic:** [TypeScript](https://www.typescriptlang.org/) - Type-safe code for the Worker.
* **Development/Deployment:** [Wrangler 4](https://developers.cloudflare.com/workers/wrangler/) - The Cloudflare CLI tool.
* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+) - For the frontend structure, style, and interactivity.

---

## 📁 Project Structure

```

├── src/
│   ├── site/           \# Static assets (HTML, CSS, JS, Images) served by Workers Assets
│   │   ├── css/
│   │   ├── js/
│   │   ├── images/
│   │   └── \*.html
│   └── worker.ts       \# Cloudflare Worker entry point (routing logic)
├── package.json        \# Project dependencies and scripts
├── tsconfig.json       \# TypeScript configuration
├── wrangler.toml       \# Cloudflare Workers configuration
└── README.md           \# This file

```

---

## 🗺️ Routes

* `/` - Homepage
* `/about` - About page
* `/contribute` - Contribute page
* `/terms` - Terms of Service
* `/privacy` - Privacy Policy
* `/services/dns` - DNS Service
* `/tool/gfu` - Google Form Unlocker Tool
* `/tool/wifi` - WiFi Password Extractor Tool
* `/blog` - Blog index
* `/blog/[slug]` - Individual blog posts (e.g., `/blog/dns`, `/blog/google-form-unlocker`, etc.)

---

## 🛠️ Development

### Prerequisites

* Node.js (v18 or higher recommended)
* npm or yarn

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/hapara-fail/website](https://github.com/hapara-fail/website) # Replace with your repo URL
    cd website
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or: yarn install
    ```
3.  **Start the local development server:**
    ```bash
    npm run dev
    # or: yarn dev
    ```
    This command uses Wrangler to build the Worker and serve the site locally, typically at `http://127.0.0.1:8787`.

---

## ☁️ Deployment

Ensure you have Wrangler installed and configured (`wrangler login`).

```bash
# Deploy to your Cloudflare account
npm run deploy
# or: yarn deploy
```

This command will build the project and deploy it to the Cloudflare Workers environment specified in `wrangler.toml`.

-----

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements, new tools, bug fixes, or blog post topics, please feel free to:

  * Open an issue on GitHub.
  * Submit a pull request.
  * Join our [Discord server](https://discord.gg/KA66dHUF4P) to discuss.

You can also donate to the project maintainers [here](https://hapara.fail/contribute).

-----

## 📄 License

This project is licensed under the terms specified at [license.hapara.fail](https://license.hapara.fail/).