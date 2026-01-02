# Security Policy

Thank you for your interest in the security of **hapara.fail**. We take the security of our software and the privacy of our users very seriously.

## Supported Versions

We only support the most recent stable release of the project. Please ensure you are testing against the latest version.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

## Reporting a Vulnerability

If you have discovered a security vulnerability in this project, we appreciate your help in disclosing it to us in a responsible manner.

### Method 1: GitHub Private Reporting

We have enabled **Private Vulnerability Reporting** for this repository. This is the fastest and most secure way to report issues, as it allows you to discuss vulnerability details privately with us without the risk of a public leak.

1.  Navigate to the **Security** tab of this repository (under the repository name).
2.  Click the **Report a vulnerability** button.
3.  Fill in the advisory details (title and description).
4.  Click **Submit report**.

**Benefits:**

- This process is fully private.
- GitHub notifies us directly and immediately.
- You are automatically added as a collaborator and credited user on the proposed advisory, allowing us to collaborate on a fix securely.

### Method 2: Email Reporting

If you are unable to use the GitHub reporting tool, please send vulnerability reports via email to **<security@a9x.pro>**.

To ensure your report passes our spam filters and is routed correctly, please follow these steps:

1.  **Subject Line:** Must contain `hapara.fail` and `vulnerability`.
    - _Example:_ `hapara.fail vulnerability: Possible XSS in search bar`
2.  **Body Content:**
    - Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting).
    - Full paths of source file(s) related to the manifestation of the issue.
    - Location of the affected source code (tag/branch/commit or direct URL).
    - Any special configuration required to reproduce the issue.
    - Step-by-step instructions to reproduce the issue.
    - Proof-of-concept or exploit code (if available).
    - Impact of the issue, including how an attacker might exploit it.

## What to Expect

1.  **Acknowledgment:** We aim to acknowledge receipt of your report within **48 hours** (or 2 business days).
2.  **Assessment:** We will triage the vulnerability and determine its impact. We may contact you for further clarification.
3.  **Resolution:** If confirmed, we will work on a fix. We ask that you maintain confidentiality during this time.
4.  **Disclosure:** Once the fix is released, we will coordinate a public disclosure (if appropriate) and credit you for the discovery.

### If You Don't Hear Back (Email Only)

If you reported via email and have not received a reply within **7 days**, please follow up with us again at <security@a9x.pro>. Please ensure the word "vulnerability" is in the subject line.

## Responsible Disclosure Guidelines

To encourage security research and avoid legal complications, we ask that you:

- **Do not** attempt to access or modify data that does not belong to you.
- **Do not** execute a Denial of Service (DoS) attack.
- **Do not** use social engineering or phishing against our employees or users.
- **Do** give us reasonable time to correct the issue before making any information public.

As long as you comply with these guidelines, we will never take legal action against you regarding your research.
