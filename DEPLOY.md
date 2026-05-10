# 🔥 Flame Group — Deploy D1 Backend

## Quick Deploy (3 steps)

### Step 1: Login to Cloudflare
```bash
npx wrangler login
```

### Step 2: Create the D1 Database
```bash
npx wrangler d1 create flame-group-annotations
```
Copy the `database_id` from the output and paste it into `wrangler.toml`.

### Step 3: Initialize Database & Deploy
```bash
npx wrangler d1 execute flame-group-annotations --remote --file=./schema.sql
npx wrangler deploy
```

Your API will be live at: `https://flame-group-api.YOUR_SUBDOMAIN.workers.dev`

Then paste that URL into `index.html` → `const API_BASE = '...'`

## What This Does
- Saves all client feedback to Cloudflare D1 (persistent database)
- Works across devices — you see what the client submits
- API: POST/GET/DELETE `/api/annotations`
