import { readJsonBody, sendJson, verifyAdminPassword } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }

  try {
    const body = await readJsonBody(req)
    const result = verifyAdminPassword(body.password)
    if (!result.ok) {
      return sendJson(res, 401, { success: false, error: result.error })
    }
    return sendJson(res, 200, { success: true })
  } catch (error) {
    return sendJson(res, 500, { success: false, error: error.message || 'Server error' })
  }
}
