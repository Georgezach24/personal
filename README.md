# Georgios Zachos · Personal Website

My personal and professional website, built with **Bootstrap 5**, **HTML**, **CSS** and **JavaScript**, plus an optional **PHP** contact form handler.

**Live:** https://georgezach24.github.io/personal/

## Features

- Responsive single-page layout: About, Experience & Education, Projects, Skills, Contact
- English / Greek language switch (remembers the visitor's choice; picks Greek automatically for Greek browsers)
- Light / dark theme (follows the OS setting, with a toggle)
- Live list of my public GitHub repositories (GitHub API, cached for an hour)
- Contact form with spam protection and three delivery options (see below)
- SEO and social-preview meta tags, JSON-LD profile data, custom 404 page

## Project structure

```
├── index.html              # The website
├── 404.html                # "Page not found" page (GitHub Pages serves it automatically)
├── assets/
│   ├── css/style.css       # Custom styling on top of Bootstrap
│   ├── js/config.js        # Site settings (GitHub user, email, contact form endpoint)
│   ├── js/i18n.js          # English / Greek text
│   ├── js/main.js          # Theme, language, GitHub repos, contact form
│   └── img/                # Profile photo, favicon
├── api/
│   ├── contact.php         # Optional PHP contact form handler (PHP hosting only)
│   └── config.example.php  # Template for api/config.php (git-ignored)
└── private/                # Local-only files (CV etc.). Its own .gitignore keeps them out of git
```

## Run locally

Any static file server works, for example:

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages

1. Push to the `main` branch.
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, then pick `main` and `/ (root)`.
3. The site goes live at `https://georgezach24.github.io/personal/` within a minute or two.

> To serve it at `https://georgezach24.github.io/` instead, rename the repository to `Georgezach24.github.io`
> and update the URLs in the `<head>` of `index.html`.

## Contact form

GitHub Pages only serves static files, so **PHP does not run there**. Choose a delivery option in `assets/js/config.js`:

| `contactEndpoint`                   | Where it works   | What happens                                       |
| ----------------------------------- | ---------------- | -------------------------------------------------- |
| `''` (default)                      | Anywhere         | Opens the visitor's email app with the message ready |
| `'https://formspree.io/f/<id>'`     | GitHub Pages     | Sends the message to your inbox via Formspree (free) |
| `'api/contact.php'`                 | PHP hosting      | Sends the message using `api/contact.php`          |

For PHP hosting, copy `api/config.example.php` to `api/config.php` and fill in your details. `api/config.php` is git-ignored.

## Private files

Everything inside `private/` (for example the CV PDF) stays on your machine. `private/.gitignore` ignores everything in that folder except itself.

## Editing content

- **Text** is in `index.html` (English) and `assets/js/i18n.js` (English and Greek). When you change a sentence, update it in `i18n.js` too.
- **Settings** (GitHub username, hidden repositories, email, contact endpoint) are in `assets/js/config.js`.
