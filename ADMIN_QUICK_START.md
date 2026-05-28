# Admin Quick Start (5 minutes)

## Why login failed before

The admin panel and `/api/admin/*` routes only work **after that code is pushed to GitHub and Vercel redeploys**.  
Setting env vars alone is not enough if the `api/` folder was never deployed.

## Step 1 — Push code (required)

From your project folder:

```bash
git add api/ vercel.json src/ ADMIN_GITHUB_SETUP.md ADMIN_QUICK_START.md
git commit -m "Add GitHub-backed admin dashboard and API routes"
git push origin main
```

Wait for Vercel to finish deploying (green **Ready**).

## Step 2 — Vercel environment variables

**Settings → Environment Variables** (Production + Preview):

| Key | Value |
|-----|--------|
| `ADMIN_PASSWORD` | Password you will type at login |
| `GITHUB_TOKEN` | GitHub token (Contents: read & write) |
| `GITHUB_OWNER` | GitHub username |
| `GITHUB_REPO` | Repo name only |
| `GITHUB_BRANCH` | `main` |

Then **Redeploy** (Deployments → ⋯ → Redeploy).

## Step 3 — Test API is live

Open in browser:

```text
https://YOUR-SITE.vercel.app/api/admin/ping
```

You should see JSON like:

```json
{ "ok": true, "message": "Admin API is running.", "config": { "adminPasswordSet": true, ... } }
```

- **404** → code not deployed; repeat Step 1  
- **`adminPasswordSet": false`** → add `ADMIN_PASSWORD` and redeploy  

## Step 4 — Open admin

```text
https://YOUR-SITE.vercel.app/?admin=true
```

Use the exact value you set for `ADMIN_PASSWORD`.

## Editing workflow (two steps)

1. **Apply to draft** — updates the list in admin only (visitors still see the old site).
2. **Publish … to live site** — commits JSON to GitHub; Vercel redeploys in ~1–2 minutes.

Shortcut while editing: **Apply & publish to live site** does both steps at once.

Confirm save worked: green success message + new commit on GitHub → Deployments on Vercel.

## Local dev

Use **`npx vercel dev`** (not `npm run dev`). Add a `.env` file with the same variables for local testing.
