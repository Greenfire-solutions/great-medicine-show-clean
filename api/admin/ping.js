import { sendJson } from '../_lib/auth.js'

/** GET /api/admin/ping — confirms serverless API is deployed (no password). */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  const hasAdminPassword = Boolean(process.env.ADMIN_PASSWORD)
  const hasGithub = Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO)

  return sendJson(res, 200, {
    ok: true,
    message: 'Admin API is running.',
    config: {
      adminPasswordSet: hasAdminPassword,
      githubConfigured: hasGithub
    }
  })
}
