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

## Fix: "Resource not accessible by personal access token" (403)

Your **GITHUB_TOKEN** can read but **cannot write** to the repo (or it points at the wrong repo).

### Create a new fine-grained token

1. GitHub → **Settings** → **Developer settings** → **Fine-grained tokens** → **Generate new token**
2. **Repository access:** Only **great-medicine-show-clean** (under Greenfire-solutions)
3. **Permissions → Repository permissions → Contents:** **Read and write** (required)
4. Generate and copy the token

### Update Vercel

1. **Settings → Environment Variables**
2. Edit **GITHUB_TOKEN** → paste the **new** token
3. Confirm:
   - `GITHUB_OWNER` = `Greenfire-solutions`
   - `GITHUB_REPO` = `great-medicine-show-clean`
   - `GITHUB_BRANCH` = `main` (**lowercase** — not `Main`)
4. **Deployments → Redeploy** (required after changing the token)

Then try **Publish courses to live site** again.

## Fix: "GitHub repo or file not found" (404)

Most common cause: **`GITHUB_BRANCH` is `Main` instead of `main`**. GitHub branch names are case-sensitive.

In Vercel, set:

```text
GITHUB_BRANCH = main
```

(all lowercase)

Also confirm:

- `GITHUB_OWNER` = `Greenfire-solutions`
- `GITHUB_REPO` = `great-medicine-show-clean`

Redeploy after changing env vars, then publish again.

## Local dev

Use **`npx vercel dev`** (not `npm run dev`). Add a `.env` file with the same variables for local testing.
