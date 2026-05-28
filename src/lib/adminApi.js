function formatAdminApiError(response, data) {
  if (response.status === 404) {
    return (
      'Admin API not found (404). The api/ folder may not be deployed yet — push the latest code to GitHub and redeploy on Vercel. ' +
      'Do not use npm run dev alone; use your live Vercel URL or npx vercel dev.'
    )
  }
  if (response.status === 401) {
    return data.error || 'Invalid admin password. Check ADMIN_PASSWORD in Vercel → Settings → Environment Variables, then redeploy.'
  }
  if (response.status === 500 && data.error?.includes('ADMIN_PASSWORD')) {
    return 'ADMIN_PASSWORD is not set on Vercel. Add it under Environment Variables and redeploy.'
  }
  return data.error || data.message || `Request failed (${response.status})`
}

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(formatAdminApiError(response, data))
  }
  return data
}

export async function verifyAdminPassword(password) {
  const response = await fetch('/api/admin/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  return parseJsonResponse(response)
}

export async function saveAdminContent(fileKey, content, password) {
  const response = await fetch('/api/admin/save-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileKey, content, password })
  })
  return parseJsonResponse(response)
}
