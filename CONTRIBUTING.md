# Contributing Guidelines

First off, thank you for considering contributing to the **hapara.fail website**. This platform serves as a hub for privacy tools and educational resources, and your help is vital to keeping it fast, accurate, and useful for students.

Whether you are fixing a UI bug, optimizing self-hosting, or writing a new blog post, we welcome your contributions.

## 🐛 Reporting Issues

We have simplified our issue reporting process. Please use the direct links below to **open an issue** using the correct template.

### 1. Reporting Bugs

If a tool isn't working, a page is broken, or you spot a visual glitch:

- **[Click here to open a Bug Report](https://github.com/hapara-fail/website/issues/new?template=bug-report.md)**
- **Crucial:** Please tell us which browser/device you are using (e.g., School Chromebook, Mobile Safari) and provide steps to reproduce the error.

### 2. Suggesting Features & Content

If you have an idea for a new privacy tool, a blog post topic, or a design improvement:

- **[Click here to open a Feature Request](https://github.com/hapara-fail/website/issues/new?template=feature-request.md)**
- We love community ideas! If you have technical insights on how to implement your idea, please include them.

---

## 🛠️ Submitting Changes (Pull Requests)

We welcome direct code contributions. Whether you are editing frontend HTML/CSS or backend TypeScript, please follow these guidelines.

### 1. Project Structure

The project is built on **Cloudflare Workers**.

- **`src/site/`**: Contains static assets (HTML, CSS, JS, Images). This is where you edit the frontend.
- **`src/worker.ts`**: Contains the backend routing and logic (TypeScript). This is where you handle requests/responses.

### 2. How to Contribute

1.  **Fork** the repository to your own GitHub account.
2.  **Create a Branch** for your specific change (e.g., `fix-dark-mode` or `add-securly-blog-post`).
3.  **Make your changes.**
    - If modifying the Worker logic, ensure it compiles (`npm run build`).
    - If adding assets, ensure they are placed correctly in `src/site/`.
4.  **Test Locally:**
    - Run `npm run dev` to start the local Wrangler development server.
    - Verify your changes at `http://127.0.0.1:8787`.
5.  **Commit** your changes with a clear message:
    - _Good:_ "Fix mobile navigation layout on small screens"
    - _Bad:_ "update css"
6.  **Push** to your branch and open a **Pull Request**.

### 3. Style Guidelines

- **Code:** Keep TypeScript clean and typed. Use descriptive variable names.
- **Content:** Blog posts should be factual, privacy-focused, and accessible to students. Avoid speculation.
- **Design:** Maintain the existing dark/minimalist aesthetic. Ensure responsive design works on Chromebooks/Tablets.

---

## 🤝 Code of Conduct

We value accuracy, privacy, and collaboration. Please ensure your interactions—whether in issues, pull requests, or Discord—are respectful and constructive. By participating, you are expected to uphold our **[Code of Conduct](https://github.com/hapara-fail/website/blob/main/CODE_OF_CONDUCT.md)**.

## 📜 License

By contributing to hapara.fail, you agree that your contributions will be licensed under the same **GNU General Public License v3.0 (GPLv3)** that covers the project. Details can be found at [www.hapara.fail/license](https://www.hapara.fail/license).
