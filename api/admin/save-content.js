import { readJsonBody, sendJson, verifyAdminPassword } from '../_lib/auth.js'
import { getAllowedPath, updateJsonFileOnGithub } from '../_lib/github.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  try {
    const body = await readJsonBody(req)
    const auth = verifyAdminPassword(body.password)
    if (!auth.ok) {
      return sendJson(res, 401, { success: false, error: auth.error })
    }

    const { fileKey, content } = body
    if (!fileKey || !getAllowedPath(fileKey)) {
      return sendJson(res, 400, { success: false, error: 'Invalid fileKey.' })
    }
    if (!content || typeof content !== 'object') {
      return sendJson(res, 400, { success: false, error: 'Content must be a JSON object.' })
    }

    const github = await updateJsonFileOnGithub(fileKey, content)
    return sendJson(res, 200, {
      success: true,
      message:
        'Saved to GitHub. Vercel will redeploy — public visitors may need a minute before they see changes.',
      github
    })
  } catch (error) {
    return sendJson(res, 500, { success: false, error: error.message || 'Server error' })
  }
}
