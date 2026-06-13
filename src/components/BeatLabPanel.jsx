import { useState } from 'react'
import { getVisibleBeatLabFolders } from '../data/beatLabData'

/**
 * Light front-end code gate — not high-security paid content protection.
 * Codes are in beatLabData.json and visible in the site bundle.
 */
function BeatLabFolderCard({ folder }) {
  const [codeInput, setCodeInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [unlockError, setUnlockError] = useState('')

  const tryUnlock = () => {
    if (codeInput.trim().toLowerCase() === (folder.code || '').trim().toLowerCase()) {
      setUnlocked(true)
      setUnlockError('')
      return
    }
    setUnlockError('Code not recognized. Check your email and try again.')
  }

  if (!folder.requiresCode) {
    return (
      <article className="overlay-card beat-lab-folder-card">
        {folder.image ? <img src={folder.image} alt="" className="overlay-image beat-lab-folder-icon" /> : null}
        <h4>{folder.title}</h4>
        <p className="small">{folder.description}</p>
        {folder.driveUrl ? (
          <a className="arcade-button" href={folder.driveUrl} target="_blank" rel="noopener noreferrer">
            {folder.buttonText || 'Open Folder'}
          </a>
        ) : (
          <p className="small beat-lab-folder-soon">Folder link coming soon.</p>
        )}
      </article>
    )
  }

  return (
    <article className="overlay-card beat-lab-folder-card beat-lab-folder-locked">
      {folder.image ? <img src={folder.image} alt="" className="overlay-image beat-lab-folder-icon" /> : null}
      <h4>{folder.title}</h4>
      <p className="small">{folder.description}</p>
      {!unlocked ? (
        <>
          <label className="code-unlock-field">
            <span className="small">Enter access code</span>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Your code"
              autoComplete="off"
            />
          </label>
          {unlockError && <p className="small code-unlock-error">{unlockError}</p>}
          <button type="button" className="arcade-button" onClick={tryUnlock}>
            Unlock {folder.title}
          </button>
        </>
      ) : (
        <>
          <h4>{folder.unlockedTitle || folder.title}</h4>
          <p className="small">{folder.unlockedDescription || folder.description}</p>
          <a
            className="arcade-button"
            href={folder.unlockedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {folder.buttonText || 'Open Folder'}
          </a>
        </>
      )}
    </article>
  )
}

export default function BeatLabPanel({ folders = getVisibleBeatLabFolders() }) {
  const visible = getVisibleBeatLabFolders(folders)

  return (
    <div className="beat-lab-panel">
      <h3 className="glyph-title">Beat Lab Library</h3>
      <p className="small">Fire Temple beat folders — free downloads and code-unlocked packs.</p>
      <div className="glowing-divider" />
      {visible.length === 0 ? (
        <p className="small">No Beat Lab folders yet. Add them in Admin → Beat Lab.</p>
      ) : (
        <div className="overlay-grid beat-lab-grid">
          {visible.map((folder) => (
            <BeatLabFolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      )}
    </div>
  )
}
