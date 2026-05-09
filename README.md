# 🔥 Fire Safety — Client Review Tool

A visual annotation tool that lets your client click on any section of the website and leave feedback (like 👍, dislike 👎, or neutral 🤔) with comments. All feedback is saved to Cloudflare D1.

## How It Works

1. Client opens the tool and enters the website URL
2. The website loads in the main view
3. Client clicks anywhere on the page to place a pin
4. A popup appears where they rate the section (like/dislike/neutral) and add a comment
5. All pins and comments are displayed in the sidebar
6. Client can export a full feedback report

## Quick Start (Local — No Backend Needed)

Just open `index.html` in a browser! All annotations are saved to localStorage.

```bash
open index.html
# or
python3 -m http.server 8000
```

## Deploy with Cloudflare D1

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Create the D1 Database

```bash
wrangler d1 create firesafety-annotations
```

Copy the `database_id` from the output and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "firesafety-annotations"
database_id = "xxxx-xxxx-xxxx-xxxx"  # <-- Paste here
```

### 3. Initialize the Database

```bash
wrangler d1 execute firesafety-annotations --remote --file=./worker/schema.sql
```

### 4. Deploy

```bash
wrangler deploy
```

Your tool will be live at: `https://firesafety-review.YOUR_SUBDOMAIN.workers.dev`

### 5. Update the API URL

In `index.html`, find the `API_BASE` constant and set it to your Worker URL:

```javascript
const API_BASE = 'https://firesafety-review.YOUR_SUBDOMAIN.workers.dev';
```

## Features

- **Click-to-annotate**: Click anywhere on the website to place a feedback pin
- **Sentiment rating**: Like 👍, Dislike 👎, or Neutral 🤔 for each annotation
- **Comments**: Add detailed comments to explain feedback
- **Visual pins**: Color-coded pins on the page (green=like, red=dislike, amber=neutral)
- **Sidebar list**: All annotations listed with one-click navigation
- **Export report**: Download a formatted text report of all feedback
- **Persistent**: Annotations saved to D1 (or localStorage for local use)
- **Toggle mode**: Turn annotation on/off to browse normally

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/annotations` | List all annotations |
| POST | `/api/annotations` | Create annotation(s) |
| PUT | `/api/annotations/:id` | Update annotation |
| DELETE | `/api/annotations/:id` | Delete annotation |
| DELETE | `/api/annotations` | Clear all annotations |
| GET | `/api/stats` | Get statistics |

## Project Structure

```
firesafety/
├── index.html           # Main annotation tool (frontend)
├── worker/
│   ├── index.js         # Cloudflare Worker API
│   └── schema.sql       # D1 database schema
├── wrangler.toml        # Cloudflare Worker config
├── package.json         # Dependencies
└── README.md
```

## Tech Stack

- **Frontend**: HTML, Tailwind CSS, vanilla JavaScript
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Hosting**: Cloudflare Workers (global edge network)
