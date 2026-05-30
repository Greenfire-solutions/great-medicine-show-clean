export function verifyAdminPassword(password) {
  const expected = (process.env.ADMIN_PASSWORD || '').trim()
  if (!expected) {
    return { ok: false, error: 'ADMIN_PASSWORD is not configured on the server. Add it in Vercel and redeploy.' }
  }
  if (!password || typeof password !== 'string') {
    return { ok: false, error: 'Password is required.' }
  }
  if (password.trim() !== expected) {
    return {
      ok: false,
      error:
        'Invalid admin password. After changing ADMIN_PASSWORD in Vercel, you must Redeploy. Check for extra spaces when pasting the value.'
    }
  }
  return { ok: true }
}

export function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  return JSON.parse(raw)
}
