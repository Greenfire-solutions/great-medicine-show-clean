/** Owner inbox for actionType: 'email' */
export const OWNER_EMAIL = 'civilizationexplorer@gmail.com'

export const ACTION_TYPES = [
  'external-link',
  'email',
  'download-link',
  'drive-folder',
  'video-link',
  'checkout-link',
  'code-unlock',
  'coming-soon'
]

export const TEMPLE_LOCATIONS = [
  'hall',
  'fireTemple',
  'waterTemple',
  'earthTemple',
  'airTemple',
  'civilxLab',
  'courseAcademy',
  'global'
]

export const TEMPLE_VAULT_TITLES = {
  hall: 'Hall Shop',
  fireTemple: 'Fire Temple Vault',
  waterTemple: 'Water Temple Vault',
  earthTemple: 'Earth Temple Vault',
  airTemple: 'Air Temple Vault',
  courseAcademy: 'Course Academy Vault',
  civilxLab: 'CivilX Lab Vault',
  global: 'Hall Shop'
}

/** Short labels for admin selects */
export const TEMPLE_LABELS = {
  hall: 'Hall of Great Works',
  fireTemple: 'Fire Temple',
  waterTemple: 'Water Temple',
  earthTemple: 'Earth Temple',
  airTemple: 'Air Temple',
  civilxLab: 'CivilX Lab',
  courseAcademy: 'Course Academy',
  global: 'Global (main Store)'
}

const LINK_ACTION_TYPES = new Set([
  'external-link',
  'download-link',
  'drive-folder',
  'video-link',
  'checkout-link'
])

export function getItemTemple(item) {
  return item.templeLocation || item.temple || ''
}

export function getItemDisplayName(item) {
  return item.name || item.title || 'Untitled'
}

export function getItemUrl(item) {
  return (item.url || item.checkoutUrl || item.ticketUrl || '').trim()
}

export function getVisibleItems(items = []) {
  return items.filter((item) => !item.hidden)
}

export function getItemsByTemple(templeKey, items = []) {
  if (!templeKey) return []
  return getVisibleItems(items)
    .filter((item) => getItemTemple(item) === templeKey)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

/** Main Hall Store overlay: hall, global, or unset temple. */
export function getHallStoreItems(items = []) {
  return getVisibleItems(items)
    .filter((item) => {
      const temple = getItemTemple(item)
      return !temple || temple === 'hall' || temple === 'global'
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function isItemComingSoon(item) {
  return Boolean(item?.comingSoon) || item?.actionType === 'coming-soon'
}

function inferActionType(item) {
  if (item.actionType) return item.actionType
  const url = getItemUrl(item)
  if (url) return 'checkout-link'
  if (item.emailSubject || item.contactSubject || item.inquirySubject) return 'email'
  return 'email'
}

export function buildMailtoHref(subject = '') {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  const query = params.toString()
  return `mailto:${OWNER_EMAIL}${query ? `?${query}` : ''}`
}

/**
 * Resolve how a content item button should behave.
 * @returns {{ kind: 'link'|'mailto'|'disabled'|'inquire'|'code-unlock', href?: string, label?: string }}
 */
export function resolveItemAction(item) {
  if (isItemComingSoon(item)) {
    return { kind: 'disabled', label: item.buttonText || 'Coming Soon' }
  }

  const actionType = inferActionType(item)
  const label = item.buttonText || 'Open'

  if (LINK_ACTION_TYPES.has(actionType)) {
    const href = getItemUrl(item)
    if (href) return { kind: 'link', href, label }
    return { kind: 'inquire', label: item.buttonText || 'Inquire' }
  }

  if (actionType === 'email') {
    const subject =
      item.emailSubject || item.contactSubject || item.inquirySubject || `Inquiry: ${getItemDisplayName(item)}`
    return { kind: 'mailto', href: buildMailtoHref(subject), label: item.buttonText || 'Email Me' }
  }

  if (actionType === 'code-unlock') {
    return { kind: 'code-unlock', label }
  }

  return { kind: 'inquire', label: item.buttonText || 'Inquire' }
}

/** Admin preview helpers */
export function getContentIssues(item) {
  const issues = []
  const action = resolveItemAction(item)
  const actionType = item.actionType || inferActionType(item)

  if (!item.image) issues.push('missing image')
  if (!item.price && item.category !== 'Booking') issues.push('missing price')

  if (LINK_ACTION_TYPES.has(actionType) && action.kind === 'inquire') {
    issues.push('missing url')
  }
  if (actionType === 'email' && !(item.emailSubject || item.contactSubject || item.inquirySubject)) {
    issues.push('missing emailSubject')
  }
  if (isItemComingSoon(item)) issues.push('coming soon')
  if (item.hidden) issues.push('hidden')

  const temple = getItemTemple(item)
  if (!temple) issues.push('no templeLocation (hall/global only in main store)')

  return issues
}
