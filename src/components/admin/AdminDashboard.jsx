import { useMemo, useRef, useState } from 'react'
import { ADMIN_CONTENT_FILES, ADMIN_TAB_ORDER } from '../../lib/adminContentConfig'
import { saveAdminContent, verifyAdminPassword } from '../../lib/adminApi'
import { ACTION_TYPES, getItemTemple, TEMPLE_LABELS, TEMPLE_LOCATIONS } from '../../lib/contentHelpers'

const SAVE_SUCCESS_NOTE =
  'Saved to GitHub. Vercel will redeploy — it may take a minute before public visitors see your changes.'

function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="admin-checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function linesToArray(text) {
  return (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function arrayToLines(arr) {
  return Array.isArray(arr) ? arr.join('\n') : ''
}

function emptyProduct() {
  return {
    id: `product-${crypto.randomUUID()}`,
    name: '',
    category: 'Merch',
    templeLocation: 'hall',
    image: '',
    price: '',
    description: '',
    buttonText: 'Buy Now',
    url: '',
    emailSubject: '',
    actionType: 'checkout-link',
    hidden: false,
    comingSoon: false,
    sortOrder: 0
  }
}

function emptyCourse() {
  return {
    id: `course-${crypto.randomUUID()}`,
    title: '',
    category: 'Music Production',
    level: 'All Levels',
    image: '',
    duration: '',
    format: '',
    description: '',
    fullDescription: '',
    whatYouWillLearn: [],
    whatYouGet: [],
    contactSubject: '',
    hidden: false,
    sortOrder: 0,
    priceOptions: []
  }
}

function emptyPriceOption() {
  return {
    type: 'Recorded Video',
    price: '$100',
    url: '',
    actionType: 'email',
    emailSubject: '',
    buttonText: 'Buy Now',
    comingSoon: false
  }
}

function emptyShow() {
  return {
    id: `show-${crypto.randomUUID()}`,
    title: '',
    category: 'Live Show',
    templeLocation: 'global',
    date: '',
    time: '',
    location: '',
    description: '',
    image: '',
    flyerImage: '',
    url: '',
    emailSubject: '',
    actionType: 'coming-soon',
    buttonText: 'Buy Tickets',
    hidden: false,
    comingSoon: true,
    sortOrder: 0
  }
}

function emptyBooking() {
  return {
    id: `booking-${crypto.randomUUID()}`,
    title: '',
    category: 'Booking',
    templeLocation: 'hall',
    description: '',
    image: '',
    iconImage: '',
    price: '',
    url: '',
    actionType: 'email',
    emailSubject: '',
    inquirySubject: '',
    bookingType: '',
    buttonText: 'Start Inquiry',
    hidden: false,
    comingSoon: false,
    sortOrder: 0
  }
}

function emptyCodeContainer() {
  return {
    id: `unlock-${crypto.randomUUID()}`,
    title: '',
    description: '',
    code: '',
    unlockedTitle: '',
    unlockedDescription: '',
    unlockedUrl: '',
    buttonText: 'Open Link',
    templeLocation: 'fireTemple',
    image: '',
    hidden: false
  }
}

function emptyBeatLabFolder() {
  return {
    id: `beat-folder-${crypto.randomUUID()}`,
    title: '',
    description: '',
    requiresCode: false,
    driveUrl: '',
    code: '',
    unlockedTitle: '',
    unlockedDescription: '',
    unlockedUrl: '',
    buttonText: 'Open Folder',
    image: '',
    hidden: false,
    sortOrder: 0
  }
}

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await verifyAdminPassword(password)
      onSuccess(password)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-login-shell">
      <h2 className="glyph-title">Admin Login</h2>
      <p className="small">
        Password is checked on the server. It is never stored in the website code. Saving updates commits to GitHub and
        triggers a Vercel redeploy.
      </p>
      <form className="admin-form" onSubmit={submit}>
        <label className="admin-field">
          <span>Admin password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && (
          <p className="admin-error">
            {error}
            {error.includes('Invalid admin password') && (
              <>
                {' '}
                Open <code>/api/admin/ping</code> on your site — if <code>adminPasswordSet</code> is false, add{' '}
                <code>ADMIN_PASSWORD</code> in Vercel and redeploy.
              </>
            )}
          </p>
        )}
        <button type="submit" className="arcade-button" disabled={busy}>
          {busy ? 'Checking…' : 'Enter Admin'}
        </button>
      </form>
    </div>
  )
}

export default function AdminDashboard() {
  const passwordRef = useRef('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState('store')
  const [drafts, setDrafts] = useState(() => {
    const initial = {}
    ADMIN_TAB_ORDER.forEach((key) => {
      if (ADMIN_CONTENT_FILES[key]) initial[key] = ADMIN_CONTENT_FILES[key].getInitial()
    })
    return initial
  })
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [validationError, setValidationError] = useState('')

  const storeItems = drafts.store?.items || []
  const courses = drafts.courses?.courses || []
  const shows = drafts.shows?.upcomingShows || []
  const booking = drafts.booking?.bookingOffers || []
  const codes = drafts.downloadCodes?.downloadCodeContainers || []
  const beatLabFolders = drafts.beatLab?.folders || []

  const templeGrouped = useMemo(() => {
    const groups = {}
    TEMPLE_LOCATIONS.forEach((t) => {
      groups[t] = storeItems.filter((p) => getItemTemple(p) === t)
    })
    return groups
  }, [storeItems])

  const updateDraftArray = (fileKey, dataKey, nextArray) => {
    setDrafts((prev) => ({
      ...prev,
      [fileKey]: { ...prev[fileKey], [dataKey]: nextArray }
    }))
  }

  const getArrayForTab = (fileKey) => {
    const cfg = ADMIN_CONTENT_FILES[fileKey]
    return drafts[fileKey]?.[cfg.dataKey] || []
  }

  const setArrayForTab = (fileKey, nextArray) => {
    const cfg = ADMIN_CONTENT_FILES[fileKey]
    updateDraftArray(fileKey, cfg.dataKey, nextArray)
  }

  const handleSaveTab = async (fileKey) => {
    setSaving(true)
    setSaveError('')
    setSaveMessage('')
    try {
      const result = await saveAdminContent(fileKey, drafts[fileKey], passwordRef.current)
      setSaveMessage(result.message || SAVE_SUCCESS_NOTE)
      if (result.github?.commitUrl) {
        setSaveMessage(`${SAVE_SUCCESS_NOTE} Commit: ${result.github.commitUrl}`)
      }
    } catch (err) {
      setSaveError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (fileKey, item, index) => {
    setValidationError('')
    setPendingDelete(null)
    if (fileKey === 'courses') {
      setEditing({
        fileKey,
        index,
        item: {
          ...item,
          whatYouWillLearnText: arrayToLines(item.whatYouWillLearn),
          whatYouGetText: arrayToLines(item.whatYouGet),
          priceOptions: item.priceOptions?.map((o) => ({ ...o })) || []
        }
      })
    } else {
      setEditing({ fileKey, index, item: { ...item } })
    }
  }

  const updateEditing = (field, value) => {
    setEditing((prev) => (prev ? { ...prev, item: { ...prev.item, [field]: value } } : prev))
  }

  const applyEditToDraft = () => {
    if (!editing) return null
    const fileKey = editing.fileKey
    const list = [...getArrayForTab(fileKey)]

    let item = { ...editing.item }
    if (fileKey === 'courses') {
      item = {
        ...item,
        whatYouWillLearn: linesToArray(item.whatYouWillLearnText),
        whatYouGet: linesToArray(item.whatYouGetText)
      }
      delete item.whatYouWillLearnText
      delete item.whatYouGetText
    }

    if (!item.id) {
      setValidationError('ID is required')
      return null
    }

    if (editing.index == null) list.push(item)
    else list[editing.index] = item

    setArrayForTab(fileKey, list)
    setEditing(null)
    setValidationError('')
    return fileKey
  }

  const applyEdit = () => {
    applyEditToDraft()
  }

  const buildItemFromEditing = () => {
    if (!editing) return null
    let item = { ...editing.item }
    if (editing.fileKey === 'courses') {
      item = {
        ...item,
        whatYouWillLearn: linesToArray(item.whatYouWillLearnText),
        whatYouGet: linesToArray(item.whatYouGetText)
      }
      delete item.whatYouWillLearnText
      delete item.whatYouGetText
    }
    if (!item.id) {
      setValidationError('ID is required')
      return null
    }
    return item
  }

  const applyEditAndPublish = async () => {
    if (!editing) return
    const fileKey = editing.fileKey
    const cfg = ADMIN_CONTENT_FILES[fileKey]
    const item = buildItemFromEditing()
    if (!item) return

    const list = [...getArrayForTab(fileKey)]
    if (editing.index == null) list.push(item)
    else list[editing.index] = item

    const nextDraft = { ...drafts[fileKey], [cfg.dataKey]: list }
    setDrafts((prev) => ({ ...prev, [fileKey]: nextDraft }))
    setEditing(null)
    setValidationError('')

    setSaving(true)
    setSaveError('')
    setSaveMessage('')
    try {
      const result = await saveAdminContent(fileKey, nextDraft, passwordRef.current)
      setSaveMessage(result.message || SAVE_SUCCESS_NOTE)
      if (result.github?.commitUrl) {
        setSaveMessage(`${SAVE_SUCCESS_NOTE} Commit: ${result.github.commitUrl}`)
      }
    } catch (err) {
      setSaveError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const duplicateItem = (fileKey, item) => {
    const clone = { ...item, id: `${item.id}-copy-${Date.now()}`, hidden: true }
    if (fileKey === 'courses') clone.title = `${clone.title} (copy)`
    else if (item.name) clone.name = `${clone.name} (copy)`
    else clone.title = `${clone.title || 'Item'} (copy)`
    const list = [...getArrayForTab(fileKey), clone]
    setArrayForTab(fileKey, list)
  }

  const deleteItem = () => {
    if (!pendingDelete) return
    const list = getArrayForTab(pendingDelete.fileKey).filter((_, i) => i !== pendingDelete.index)
    setArrayForTab(pendingDelete.fileKey, list)
    setPendingDelete(null)
    setEditing(null)
  }

  const toggleHidden = (fileKey, index) => {
    const list = [...getArrayForTab(fileKey)]
    list[index] = { ...list[index], hidden: !list[index].hidden }
    setArrayForTab(fileKey, list)
  }

  const renderList = (fileKey, items, labelFn) => (
    <ul className="admin-list">
      {items.map((item, index) => (
        <li key={item.id || index} className="admin-list-item">
          <div className="admin-list-main">
            <strong>{labelFn(item)}</strong>
            <span className="small">
              {item.hidden ? ' · hidden' : ''}
              {item.comingSoon ? ' · coming soon' : ''}
              {getItemTemple(item) ? ` · ${getItemTemple(item)}` : ''}
            </span>
          </div>
          <div className="admin-list-actions">
            <button type="button" className="arcade-button" onClick={() => startEdit(fileKey, item, index)}>
              Edit
            </button>
            <button type="button" className="arcade-button" onClick={() => duplicateItem(fileKey, item)}>
              Duplicate
            </button>
            <button type="button" className="arcade-button" onClick={() => toggleHidden(fileKey, index)}>
              {item.hidden ? 'Show' : 'Hide'}
            </button>
            <button
              type="button"
              className="arcade-button admin-danger-btn"
              onClick={() => setPendingDelete({ fileKey, index })}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )

  const renderProductEditor = () => {
    const item = editing.item
    return (
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>ID</span>
          <input value={item.id} onChange={(e) => updateEditing('id', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Name</span>
          <input value={item.name} onChange={(e) => updateEditing('name', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Category</span>
          <input value={item.category} onChange={(e) => updateEditing('category', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Price</span>
          <input value={item.price} onChange={(e) => updateEditing('price', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Temple</span>
          <select value={item.templeLocation || ''} onChange={(e) => updateEditing('templeLocation', e.target.value)}>
            {TEMPLE_LOCATIONS.map((t) => (
              <option key={t} value={t}>
                {TEMPLE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>Action type</span>
          <select value={item.actionType || 'checkout-link'} onChange={(e) => updateEditing('actionType', e.target.value)}>
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field admin-field-wide">
          <span>Image URL</span>
          <input value={item.image} onChange={(e) => updateEditing('image', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>URL (checkout / Drive / video)</span>
          <input value={item.url} onChange={(e) => updateEditing('url', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Email subject</span>
          <input value={item.emailSubject} onChange={(e) => updateEditing('emailSubject', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Button text</span>
          <input value={item.buttonText} onChange={(e) => updateEditing('buttonText', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Sort order</span>
          <input type="number" value={item.sortOrder ?? 0} onChange={(e) => updateEditing('sortOrder', Number(e.target.value))} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Description</span>
          <textarea rows={3} value={item.description} onChange={(e) => updateEditing('description', e.target.value)} />
        </label>
        <div className="admin-checkbox-row admin-field-wide">
          <CheckboxField label="Hidden" checked={item.hidden} onChange={(v) => updateEditing('hidden', v)} />
          <CheckboxField label="Coming soon" checked={item.comingSoon} onChange={(v) => updateEditing('comingSoon', v)} />
        </div>
      </div>
    )
  }

  const renderCourseEditor = () => {
    const item = editing.item
    return (
      <>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>ID</span>
            <input value={item.id} onChange={(e) => updateEditing('id', e.target.value)} />
          </label>
          <label className="admin-field">
            <span>Title</span>
            <input value={item.title} onChange={(e) => updateEditing('title', e.target.value)} />
          </label>
          <label className="admin-field admin-field-wide">
            <span>Image URL</span>
            <input value={item.image} onChange={(e) => updateEditing('image', e.target.value)} />
          </label>
          <label className="admin-field admin-field-wide">
            <span>Description</span>
            <textarea rows={2} value={item.description} onChange={(e) => updateEditing('description', e.target.value)} />
          </label>
          <label className="admin-field admin-field-wide">
            <span>What you will learn (one per line)</span>
            <textarea rows={3} value={item.whatYouWillLearnText} onChange={(e) => updateEditing('whatYouWillLearnText', e.target.value)} />
          </label>
          <label className="admin-field admin-field-wide">
            <span>What you get (one per line)</span>
            <textarea rows={3} value={item.whatYouGetText} onChange={(e) => updateEditing('whatYouGetText', e.target.value)} />
          </label>
          <label className="admin-field admin-field-wide">
            <span>Contact subject</span>
            <input value={item.contactSubject} onChange={(e) => updateEditing('contactSubject', e.target.value)} />
          </label>
          <div className="admin-checkbox-row admin-field-wide">
            <CheckboxField label="Hidden" checked={item.hidden} onChange={(v) => updateEditing('hidden', v)} />
          </div>
        </div>
        <h5 className="glyph-title">Price options</h5>
        {(item.priceOptions || []).map((opt, idx) => (
          <div key={idx} className="admin-subcard">
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Type</span>
                <input
                  value={opt.type}
                  onChange={(e) => {
                    const next = [...item.priceOptions]
                    next[idx] = { ...opt, type: e.target.value }
                    updateEditing('priceOptions', next)
                  }}
                />
              </label>
              <label className="admin-field">
                <span>Price</span>
                <input
                  value={opt.price}
                  onChange={(e) => {
                    const next = [...item.priceOptions]
                    next[idx] = { ...opt, price: e.target.value }
                    updateEditing('priceOptions', next)
                  }}
                />
              </label>
              <label className="admin-field">
                <span>Action</span>
                <select
                  value={opt.actionType || 'email'}
                  onChange={(e) => {
                    const next = [...item.priceOptions]
                    next[idx] = { ...opt, actionType: e.target.value }
                    updateEditing('priceOptions', next)
                  }}
                >
                  {ACTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field admin-field-wide">
                <span>URL</span>
                <input
                  value={opt.url || ''}
                  onChange={(e) => {
                    const next = [...item.priceOptions]
                    next[idx] = { ...opt, url: e.target.value }
                    updateEditing('priceOptions', next)
                  }}
                />
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="arcade-button"
          onClick={() => updateEditing('priceOptions', [...(item.priceOptions || []), emptyPriceOption()])}
        >
          Add price option
        </button>
      </>
    )
  }

  const renderBookingEditor = () => {
    const item = editing.item
    return (
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>ID</span>
          <input value={item.id} onChange={(e) => updateEditing('id', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Title</span>
          <input value={item.title} onChange={(e) => updateEditing('title', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Image URL</span>
          <input value={item.image || item.iconImage || ''} onChange={(e) => updateEditing('image', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Email subject</span>
          <input value={item.emailSubject} onChange={(e) => updateEditing('emailSubject', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Description</span>
          <textarea rows={3} value={item.description} onChange={(e) => updateEditing('description', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Button text</span>
          <input value={item.buttonText} onChange={(e) => updateEditing('buttonText', e.target.value)} />
        </label>
        <div className="admin-checkbox-row admin-field-wide">
          <CheckboxField label="Hidden" checked={item.hidden} onChange={(v) => updateEditing('hidden', v)} />
        </div>
      </div>
    )
  }

  const renderShowEditor = () => {
    const item = editing.item
    return (
      <div className="admin-form-grid">
        <label className="admin-field">
          <span>ID</span>
          <input value={item.id} onChange={(e) => updateEditing('id', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Title</span>
          <input value={item.title} onChange={(e) => updateEditing('title', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Date</span>
          <input value={item.date} onChange={(e) => updateEditing('date', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Time</span>
          <input value={item.time} onChange={(e) => updateEditing('time', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Location</span>
          <input value={item.location} onChange={(e) => updateEditing('location', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Image URL</span>
          <input value={item.image} onChange={(e) => updateEditing('image', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Ticket URL</span>
          <input value={item.url} onChange={(e) => updateEditing('url', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Action type</span>
          <select value={item.actionType} onChange={(e) => updateEditing('actionType', e.target.value)}>
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-checkbox-row admin-field-wide">
          <CheckboxField label="Hidden" checked={item.hidden} onChange={(v) => updateEditing('hidden', v)} />
          <CheckboxField label="Coming soon" checked={item.comingSoon} onChange={(v) => updateEditing('comingSoon', v)} />
        </div>
      </div>
    )
  }

  const renderCodeEditor = () => {
    const item = editing.item
    return (
      <div className="admin-form-grid">
        <p className="small admin-field-wide">
          Light protection only — unlock codes are visible in the site source. Not for highly sensitive paid files.
        </p>
        <label className="admin-field">
          <span>ID</span>
          <input value={item.id} onChange={(e) => updateEditing('id', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Title</span>
          <input value={item.title} onChange={(e) => updateEditing('title', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Code</span>
          <input value={item.code} onChange={(e) => updateEditing('code', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Temple</span>
          <select value={item.templeLocation} onChange={(e) => updateEditing('templeLocation', e.target.value)}>
            {TEMPLE_LOCATIONS.map((t) => (
              <option key={t} value={t}>
                {TEMPLE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field admin-field-wide">
          <span>Unlocked URL (Drive / download / video)</span>
          <input value={item.unlockedUrl} onChange={(e) => updateEditing('unlockedUrl', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Description</span>
          <textarea rows={2} value={item.description} onChange={(e) => updateEditing('description', e.target.value)} />
        </label>
        <CheckboxField label="Hidden" checked={item.hidden} onChange={(v) => updateEditing('hidden', v)} />
      </div>
    )
  }

  const renderBeatLabEditor = () => {
    const item = editing.item
    return (
      <div className="admin-form-grid">
        <p className="small admin-field-wide">
          Fire Temple → Beat Lab tab. Free folders use <strong>driveUrl</strong>. Locked folders use{' '}
          <strong>code</strong> + <strong>unlockedUrl</strong> (Google Drive).
        </p>
        <label className="admin-field">
          <span>ID</span>
          <input value={item.id} onChange={(e) => updateEditing('id', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Folder title</span>
          <input value={item.title} onChange={(e) => updateEditing('title', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Description</span>
          <textarea rows={2} value={item.description} onChange={(e) => updateEditing('description', e.target.value)} />
        </label>
        <label className="admin-field admin-field-wide">
          <span>Image URL</span>
          <input value={item.image} onChange={(e) => updateEditing('image', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Button text</span>
          <input value={item.buttonText} onChange={(e) => updateEditing('buttonText', e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Sort order</span>
          <input
            type="number"
            value={item.sortOrder ?? 0}
            onChange={(e) => updateEditing('sortOrder', Number(e.target.value))}
          />
        </label>
        <div className="admin-checkbox-row admin-field-wide">
          <CheckboxField
            label="Requires access code (Beat Lab locked folder)"
            checked={item.requiresCode}
            onChange={(v) => updateEditing('requiresCode', v)}
          />
          <CheckboxField label="Hidden" checked={item.hidden} onChange={(v) => updateEditing('hidden', v)} />
        </div>
        {!item.requiresCode ? (
          <label className="admin-field admin-field-wide">
            <span>Google Drive URL (Free Beats — no code)</span>
            <input value={item.driveUrl} onChange={(e) => updateEditing('driveUrl', e.target.value)} />
          </label>
        ) : (
          <>
            <label className="admin-field">
              <span>Access code</span>
              <input value={item.code} onChange={(e) => updateEditing('code', e.target.value)} />
            </label>
            <label className="admin-field admin-field-wide">
              <span>Unlocked Google Drive URL</span>
              <input value={item.unlockedUrl} onChange={(e) => updateEditing('unlockedUrl', e.target.value)} />
            </label>
            <label className="admin-field admin-field-wide">
              <span>Unlocked title</span>
              <input value={item.unlockedTitle} onChange={(e) => updateEditing('unlockedTitle', e.target.value)} />
            </label>
            <label className="admin-field admin-field-wide">
              <span>Unlocked description</span>
              <textarea
                rows={2}
                value={item.unlockedDescription}
                onChange={(e) => updateEditing('unlockedDescription', e.target.value)}
              />
            </label>
          </>
        )}
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="admin-dashboard-backdrop">
        <section className="admin-dashboard arcade-panel">
          <AdminLogin
            onSuccess={(password) => {
              passwordRef.current = password
              setAuthed(true)
            }}
          />
        </section>
      </div>
    )
  }

  const activeFileKey = tab === 'temples' ? null : tab
  const activeConfig = activeFileKey ? ADMIN_CONTENT_FILES[activeFileKey] : null

  return (
    <div className="admin-dashboard-backdrop" role="dialog" aria-label="Admin dashboard">
      <section className="admin-dashboard arcade-panel">
        <header className="admin-dashboard-header">
          <h2 className="glyph-title">Great Medicine Show — Admin</h2>
          <a className="arcade-button admin-close-link" href={typeof window !== 'undefined' ? window.location.pathname || '/' : '/'}>
            Exit admin
          </a>
        </header>

        <div className="admin-workflow-box arcade-panel">
          <h4 className="glyph-title">How publishing works</h4>
          <ol className="small admin-workflow-steps">
            <li>
              <strong>Edit</strong> an item, then click <strong>Apply to draft</strong> (or use{' '}
              <strong>Apply &amp; publish</strong> below).
            </li>
            <li>
              <strong>Publish to live site</strong> — commits to GitHub and triggers Vercel redeploy (1–2 min).
            </li>
          </ol>
          {activeConfig ? (
            <div className="admin-publish-row">
              <button
                type="button"
                className="arcade-button admin-publish-btn"
                disabled={saving}
                onClick={() => handleSaveTab(activeFileKey)}
              >
                {saving ? 'Publishing…' : `Publish ${activeConfig.label} to live site`}
              </button>
              <span className="small admin-publish-hint">Saves {activeConfig.githubPath} → GitHub → Vercel rebuild</span>
            </div>
          ) : (
            <p className="small">Open Products, Courses, Shows, Booking, or Code Unlocks to publish.</p>
          )}
        </div>

        <nav className="admin-tabs">
          {ADMIN_TAB_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className={`arcade-button admin-tab ${tab === key ? 'active' : ''}`}
              onClick={() => {
                setTab(key)
                setEditing(null)
              }}
            >
              {key === 'temples' ? 'Temple Shops' : ADMIN_CONTENT_FILES[key]?.label}
            </button>
          ))}
        </nav>
        {saveMessage && <p className="admin-success">{saveMessage}</p>}
        {saveError && <p className="admin-error">{saveError}</p>}
        {tab === 'store' && (
          <>
            <div className="admin-toolbar">
              <button type="button" className="arcade-button" onClick={() => startEdit('store', emptyProduct(), null)}>
                Add product
              </button>
              <button type="button" className="arcade-button admin-publish-btn" disabled={saving} onClick={() => handleSaveTab('store')}>
                {saving ? 'Publishing…' : 'Publish products to live site'}
              </button>
            </div>
            {renderList('store', storeItems, (i) => i.name)}
          </>
        )}
        {tab === 'courses' && (
          <>
            <div className="admin-toolbar">
              <button type="button" className="arcade-button" onClick={() => startEdit('courses', emptyCourse(), null)}>
                Add course
              </button>
              <button type="button" className="arcade-button admin-publish-btn" disabled={saving} onClick={() => handleSaveTab('courses')}>
                {saving ? 'Publishing…' : 'Publish courses to live site'}
              </button>
            </div>
            {renderList('courses', courses, (i) => i.title)}
          </>
        )}
        {tab === 'shows' && (
          <>
            <div className="admin-toolbar">
              <button type="button" className="arcade-button" onClick={() => startEdit('shows', emptyShow(), null)}>
                Add show
              </button>
              <button type="button" className="arcade-button admin-publish-btn" disabled={saving} onClick={() => handleSaveTab('shows')}>
                {saving ? 'Publishing…' : 'Publish shows to live site'}
              </button>
            </div>
            {renderList('shows', shows, (i) => i.title)}
          </>
        )}
        {tab === 'booking' && (
          <>
            <div className="admin-toolbar">
              <button type="button" className="arcade-button" onClick={() => startEdit('booking', emptyBooking(), null)}>
                Add booking offer
              </button>
              <button type="button" className="arcade-button admin-publish-btn" disabled={saving} onClick={() => handleSaveTab('booking')}>
                {saving ? 'Publishing…' : 'Publish booking to live site'}
              </button>
            </div>
            {renderList('booking', booking, (i) => i.title)}
          </>
        )}
        {tab === 'downloadCodes' && (
          <>
            <div className="admin-toolbar">
              <button type="button" className="arcade-button" onClick={() => startEdit('downloadCodes', emptyCodeContainer(), null)}>
                Add code container
              </button>
              <button type="button" className="arcade-button admin-publish-btn" disabled={saving} onClick={() => handleSaveTab('downloadCodes')}>
                {saving ? 'Publishing…' : 'Publish code unlocks to live site'}
              </button>
            </div>
            {renderList('downloadCodes', codes, (i) => i.title)}
          </>
        )}
        {tab === 'beatLab' && (
          <>
            <div className="admin-toolbar">
              <button type="button" className="arcade-button" onClick={() => startEdit('beatLab', emptyBeatLabFolder(), null)}>
                Add Beat Lab folder
              </button>
              <button type="button" className="arcade-button admin-publish-btn" disabled={saving} onClick={() => handleSaveTab('beatLab')}>
                {saving ? 'Publishing…' : 'Publish Beat Lab to live site'}
              </button>
            </div>
            <p className="small">Shown in Fire Temple → Beat Lab tab. Use &quot;Free Beats&quot; (no code) and &quot;Beat Lab&quot; (code required).</p>
            {renderList('beatLab', beatLabFolders, (i) => `${i.title}${i.requiresCode ? ' (code)' : ' (free)'}`)}
          </>
        )}
        {tab === 'temples' && (
          <section>
            <p className="small">Products by temple. Edit in the Products tab, then save to GitHub.</p>
            {TEMPLE_LOCATIONS.map((templeKey) => (
              <div key={templeKey} className="admin-temple-group">
                <h4 className="glyph-title">{TEMPLE_LABELS[templeKey]}</h4>
                {templeGrouped[templeKey]?.length ? (
                  <ul className="admin-list compact">
                    {templeGrouped[templeKey].map((item) => (
                      <li key={item.id} className="admin-list-item compact">
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="small">No products</p>
                )}
              </div>
            ))}
          </section>
        )}
        {editing && (
          <div className="admin-editor-panel arcade-panel">
            <h4 className="glyph-title">Edit item</h4>
            {editing.fileKey === 'store' && renderProductEditor()}
            {editing.fileKey === 'courses' && renderCourseEditor()}
            {editing.fileKey === 'shows' && renderShowEditor()}
            {editing.fileKey === 'booking' && renderBookingEditor()}
            {editing.fileKey === 'downloadCodes' && renderCodeEditor()}
            {editing.fileKey === 'beatLab' && renderBeatLabEditor()}
            {validationError && <p className="admin-error">{validationError}</p>}
            {pendingDelete ? (
              <div className="admin-confirm">
                <p className="small">Delete this item from your draft? Save the tab to commit removal to GitHub.</p>
                <button type="button" className="arcade-button admin-danger-btn" onClick={deleteItem}>
                  Confirm delete
                </button>
                <button type="button" className="arcade-button" onClick={() => setPendingDelete(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="admin-form-actions">
                  <button type="button" className="arcade-button" onClick={applyEdit}>
                    1. Apply to draft
                  </button>
                  <button
                    type="button"
                    className="arcade-button admin-publish-btn"
                    disabled={saving}
                    onClick={applyEditAndPublish}
                  >
                    {saving ? 'Publishing…' : '2. Apply & publish to live site'}
                  </button>
                  <button type="button" className="arcade-button" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
                <p className="small admin-editor-hint">
                  Draft = preview in this admin only. Visitors see changes after you publish (GitHub + Vercel
                  redeploy).
                </p>
              </>
            )}
          </div>
        )}
        {activeFileKey && activeConfig && (
          <div className="admin-sticky-publish">
            <button
              type="button"
              className="arcade-button admin-publish-btn"
              disabled={saving}
              onClick={() => handleSaveTab(activeFileKey)}
            >
              {saving ? 'Publishing…' : `Publish ${activeConfig.label} to live site`}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
