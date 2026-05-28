# Admin + GitHub Setup — Great Medicine Show

This project stores public content in JSON files under `src/data/`. The admin dashboard (`?admin=true`) edits content in the browser, then saves through a **Vercel serverless function** that commits to **GitHub**. Vercel redeploys after each commit; visitors see updates after redeploy finishes.

**Never put `GITHUB_TOKEN` or `ADMIN_PASSWORD` in React code or Vite env vars exposed to the browser.**

---

## 1. Create a fine-grained GitHub token

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. **Repository access:** Only select this repository (`great-medicine-show` or your repo name).
3. **Permissions → Repository permissions:**
   - **Contents:** Read and write (required to update JSON files).
4. Generate and copy the token once (you will not see it again).

Classic tokens also work if they have `repo` scope for private repos, or `public_repo` for public repos.

---

## 2. Vercel environment variables

In your Vercel project → **Settings** → **Environment Variables**, add for **Production** (and Preview if you want admin on preview URLs):

| Variable | Example | Notes |
|----------|---------|--------|
| `ADMIN_PASSWORD` | (your secret) | Checked only on the server. Choose a long random password. |
| `GITHUB_TOKEN` | `github_pat_...` | Fine-grained token from step 1. **Server only.** |
| `GITHUB_OWNER` | `your-github-username` | Owner of the repo |
| `GITHUB_REPO` | `great-medicine-show` | Repo name only, not full URL |
| `GITHUB_BRANCH` | `main` | Branch to commit to (optional; defaults to `main`) |

Redeploy after adding variables.

---

## 3. Choose `ADMIN_PASSWORD`

- Use a password manager to generate something long (20+ characters).
- Do not reuse your GitHub password.
- Share only with people who should edit site content.
- The password is sent to `/api/admin/verify` and `/api/admin/save-content` over HTTPS; it is not stored in the frontend bundle.

---

## 4. Test locally

`npm run dev` (Vite) serves the UI but **does not** run API routes.

To test admin save locally:

```bash
npx vercel dev
```

1. Open the URL Vercel prints (often `http://localhost:3000`).
2. Add `?admin=true`.
3. Log in with `ADMIN_PASSWORD`.
4. Edit a product and click **Save products to GitHub**.
5. Confirm a new commit on GitHub.

Optional: add the same env vars to a local `.env` file for `vercel dev` (do not commit `.env`).

---

## 5. Deploy

1. Push code to GitHub.
2. Vercel builds and deploys automatically.
3. Ensure all env vars are set on the Vercel project.
4. Open production URL with `?admin=true` and test one small save.

---

## 6. Open the admin panel

```
https://your-site.vercel.app/?admin=true
```

1. Enter admin password.
2. Edit content in tabs (Products, Courses, Shows, etc.).
3. Click **Apply to draft** for each item you edit.
4. Click **Save … to GitHub** on that tab.
5. Wait for Vercel redeploy (usually 1–2 minutes).

Message shown after save:

> Saved to GitHub. Vercel will redeploy — it may take a minute before public visitors see your changes.

---

## 7. Why the GitHub token must never be in frontend code

- Anything in `VITE_*` variables or React is downloaded by every visitor.
- A leaked token could let someone change or delete your repository.
- Only `api/admin/*.js` serverless functions read `GITHUB_TOKEN` from `process.env`.

---

## Content files (editable via admin)

| Admin tab | GitHub file |
|-----------|-------------|
| Products | `src/data/storeData.json` |
| Courses | `src/data/coursesData.json` |
| Shows | `src/data/showsData.json` |
| Booking Offers | `src/data/bookingOffersData.json` |
| Code Unlocks | `src/data/downloadCodesData.json` |

Thin `.js` files next to each JSON re-export data for the public site build.

---

## Confirm GitHub commit

After saving in admin:

1. Open your repo on GitHub → **Commits**.
2. Look for: `Admin: update src/data/...`
3. Open the commit and verify the JSON diff.

The API response may include a `commitUrl` in the success message.

---

## Confirm Vercel redeploy

1. Vercel dashboard → your project → **Deployments**.
2. A new deployment should start after the GitHub commit (if the repo is connected).
3. Wait until status is **Ready**.
4. Hard-refresh the public site (or open in a private window) and verify the change.

---

## Troubleshooting

| Problem | Check |
|---------|--------|
| 401 Invalid password | `ADMIN_PASSWORD` on Vercel matches what you type |
| GitHub write failed | Token has Contents write access; `GITHUB_OWNER` / `GITHUB_REPO` correct |
| Save works but site unchanged | Wait for redeploy; confirm commit is on `GITHUB_BRANCH` |
| API 404 locally | Use `vercel dev`, not `npm run dev` alone |
| CORS / network error | Admin must call same origin (`/api/admin/...`) |

---

## Code unlock security note

Unlock codes in `downloadCodesData.json` are shipped to the browser. This is **light protection** for casual delivery after email — not for highly sensitive paid files.
