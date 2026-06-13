const ALLOWED_PATHS = {
  store: 'src/data/storeData.json',
  courses: 'src/data/coursesData.json',
  shows: 'src/data/showsData.json',
  booking: 'src/data/bookingOffersData.json',
  downloadCodes: 'src/data/downloadCodesData.json',
  beatLab: 'src/data/beatLabData.json'
}

function getGithubConfig() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  // GitHub branch names are case-sensitive; default branch is usually "main" not "Main"
  const branch = (process.env.GITHUB_BRANCH || 'main').trim()

  if (!token || !owner || !repo) {
    throw new Error('GitHub environment variables are not configured on the server.')
  }

  return { token, owner, repo, branch }
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'great-medicine-show-admin'
  }
}

export function getAllowedPath(fileKey) {
  return ALLOWED_PATHS[fileKey] || null
}

export async function updateJsonFileOnGithub(fileKey, contentObject) {
  const path = getAllowedPath(fileKey)
  if (!path) {
    throw new Error('Invalid content file key.')
  }

  const { token, owner, repo, branch } = getGithubConfig()
  const contentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

  const getResponse = await fetch(`${contentsUrl}?ref=${encodeURIComponent(branch)}`, {
    headers: githubHeaders(token)
  })

  let sha
  if (getResponse.status === 200) {
    const existing = await getResponse.json()
    sha = existing.sha
  } else if (getResponse.status === 404) {
    throw new Error(
      `GitHub branch or file not found (404). Use GITHUB_BRANCH=main (lowercase). ` +
        `Current: owner=${owner}, repo=${repo}, branch=${branch}, path=${path}. ` +
        'If branch is correct, confirm the JSON file exists on GitHub after your last deploy.'
    )
  } else if (!getResponse.ok) {
    const errBody = await getResponse.text()
    throw new Error(`GitHub read failed (${getResponse.status}): ${errBody}`)
  }

  const fileBody = `${JSON.stringify(contentObject, null, 2)}\n`
  const putBody = {
    message: `Admin: update ${path}`,
    content: Buffer.from(fileBody, 'utf8').toString('base64'),
    branch
  }
  if (sha) putBody.sha = sha

  const putResponse = await fetch(contentsUrl, {
    method: 'PUT',
    headers: {
      ...githubHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(putBody)
  })

  if (!putResponse.ok) {
    const errBody = await putResponse.text()
    if (putResponse.status === 403) {
      throw new Error(
        'GitHub denied write access (403). Your GITHUB_TOKEN cannot update this repo. ' +
          'Create a new fine-grained token with Contents: Read and write on ' +
          `${owner}/${repo}, update Vercel env vars, and redeploy. Details: ${errBody}`
      )
    }
    if (putResponse.status === 404) {
      throw new Error(
        `GitHub repo or file not found (404). Check GITHUB_OWNER=${owner}, GITHUB_REPO=${repo}, GITHUB_BRANCH=${branch}.`
      )
    }
    throw new Error(`GitHub write failed (${putResponse.status}): ${errBody}`)
  }

  const result = await putResponse.json()
  return {
    path,
    commitSha: result.commit?.sha,
    commitUrl: result.commit?.html_url
  }
}
