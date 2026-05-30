import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { musicData } from './data/musicData'
import { getHallStoreItems, getStoreItemsByTemple, storeItems } from './data/storeData'
import { courses } from './data/coursesData'
import { getCodeContainersByTemple } from './data/downloadCodesData'
import { bookingOffers, upcomingShows } from './data/showsData'
import AdminDashboard from './components/admin/AdminDashboard'
import {
  getItemDisplayName,
  getItemUrl,
  resolveItemAction,
  TEMPLE_VAULT_TITLES
} from './lib/contentHelpers'
import {
  artistLinks,
  epkContact,
  epkContent,
  epkLogoUrl,
  epkPerformanceImageUrl,
  epkPortraitUrl
} from './data/epkData'

const guilds = ['Fire Guild', 'Water Guild', 'Earth Guild', 'Air Guild']
const saveKey = 'gms-cyber-hall-profile'
const stepAmount = 2.5

const TEMPLE_SHOP_MAP_KEYS = new Set([
  'hall',
  'civilxLab',
  'fireTemple',
  'waterTemple',
  'earthTemple',
  'airTemple',
  'courseAcademy'
])

function OnboardingCosmosBackground() {
  return (
    <div className="onboarding-cosmos" aria-hidden="true">
      <div className="onboarding-cosmos-3d">
        <div className="cosmos-nebula" />
        <div className="cosmos-galaxy-band cosmos-galaxy-band-back" />
        <div className="cosmos-galaxy-band cosmos-galaxy-band-mid" />
        <div className="cosmos-starfield-tile cosmos-starfield-tile-far" />
        <div className="cosmos-starfield-tile cosmos-starfield-tile-mid" />
        <div className="cosmos-starfield-tile cosmos-starfield-tile-near" />
        <div className="starfield starfield-one" />
        <div className="starfield starfield-two" />
        <div className="starfield starfield-three" />
        <div className="cosmos-twinkle-sheet" />
      </div>
    </div>
  )
}

const mapSoundtracks = {
  overworld: 'https://pub-b0ec57f6cb694b719d48d1d2cce31f9b.r2.dev/Overworld%201%20demo.mp3',
  hall: 'https://pub-23110dcf45f74b728f78d68b66c06cc8.r2.dev/Sweet%20Grass%20Braid.wav',
  civilxLab: 'https://pub-23110dcf45f74b728f78d68b66c06cc8.r2.dev/Quartz%20Memory%202.mp3',
  fireTemple: 'https://pub-23110dcf45f74b728f78d68b66c06cc8.r2.dev/Breath%20Of%20Fire%20Remix_Master_V1.wav',
  waterTemple: 'https://pub-23110dcf45f74b728f78d68b66c06cc8.r2.dev/waterremix.wav',
  earthTemple: 'https://pub-23110dcf45f74b728f78d68b66c06cc8.r2.dev/tribal%20trance.mp3',
  airTemple: 'https://pub-b0ec57f6cb694b719d48d1d2cce31f9b.r2.dev/Overworld%201%20demo.mp3',
  courseAcademy: 'https://pub-23110dcf45f74b728f78d68b66c06cc8.r2.dev/itch%20the%20glitch%202.wav',
  courses: 'https://pub-23110dcf45f74b728f78d68b66c06cc8.r2.dev/itch%20the%20glitch%202.wav'
}

const onboardingGuildVisuals = {
  'Fire Guild': 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/icons/icon-fire-rounded.png',
  'Water Guild': 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/icons/icon-water-round.png',
  'Earth Guild': 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/icons/icon-earth-round.png',
  'Air Guild': 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/icons/icon-air-round.png'
}

const guildCharacterSprites = {
  'Water Guild': {
    idle: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/water/character-water-idle.png',
    walking: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/water/character-water-walking.png',
    back: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/water/character-water-back.png'
  },
  'Fire Guild': {
    idle: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/fire/character-fire-idle.png',
    walking: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/fire/character-fire-walk.png',
    back: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/fire/character-fire-back.png'
  },
  'Earth Guild': {
    idle: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/earth/character-earth-idle.png',
    walking: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/earth/character-earth-walking.png',
    back: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/earth/character-earth-back.png'
  },
  'Air Guild': {
    idle: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/Air/character-air-idle.png',
    walking: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/Air/character-air-walking.png',
    back: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/characters/guilds/Air/character-air-back.png'
  }
}

const mapDefinitions = {
  overworld: {
    title: 'Overworld Map',
    nodes: [
      {
        id: 'hall',
        name: 'Hall of Great Works',
        x: 48,
        y: 49,
        tone: 'hall',
        type: 'map',
        targetMap: 'hall',
        imageUrl: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/maps/hall-of-great-works/hall-of-great-work2.png',
        imageClass: 'hall-building-node'
      },
      {
        id: 'civilx',
        name: 'CivilX Lab',
        x: 90,
        y: 50,
        tone: 'lab',
        type: 'map',
        targetMap: 'civilxLab',
        imageUrl: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/maps/civilx-lab/civilx-lab.png',
        imageClass: 'civilx-lab-node'
      },
      {
        id: 'fire',
        name: 'Fire Temple',
        x: 13,
        y: 20,
        tone: 'fire',
        type: 'map',
        targetMap: 'fireTemple',
        imageUrl: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/maps/temples/fire/Temple-fire.png',
        imageClass: 'fire-temple-node'
      },
      {
        id: 'water',
        name: 'Water Temple',
        x: 84,
        y: 10,
        tone: 'water',
        type: 'map',
        targetMap: 'waterTemple',
        imageUrl: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/maps/temples/water/Temple-water.png',
        imageClass: 'water-temple-node'
      },
      {
        id: 'earth',
        name: 'Earth Temple',
        x: 13,
        y: 70,
        tone: 'earth',
        type: 'map',
        targetMap: 'earthTemple',
        imageUrl: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/maps/temples/earth/Temple-earth.png',
        imageClass: 'earth-temple-node'
      },
      {
        id: 'air',
        name: 'Air Temple',
        x: 76,
        y: 78,
        tone: 'air',
        type: 'map',
        targetMap: 'airTemple',
        imageUrl: 'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/maps/temples/air/Temple-air.png',
        imageClass: 'air-temple-node'
      },
      {
        id: 'course',
        name: 'Course Academy',
        x: 47,
        y: 6,
        tone: 'courses',
        type: 'map',
        targetMap: 'courseAcademy',
        imageUrl:
          'https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/maps/course/course-academy-2.png',
        imageClass: 'course-academy-node'
      }
    ]
  },
  hall: {
    title: 'Hall of Great Works Interior',
    nodes: [
      {
        id: 'music',
        name: 'Music Hall',
        x: 20,
        y: 26,
        tone: 'music',
        type: 'page',
        prompt: 'Enter Music Hall?',
        actionLabel: 'Enter Music Hall'
      },
      { id: 'store', name: 'Store', x: 80, y: 28, tone: 'store', type: 'page', prompt: 'Browse Store?', actionLabel: 'Browse Store' },
      {
        id: 'shows',
        name: 'Shows / Booking Desk',
        x: 52,
        y: 52,
        tone: 'shows',
        type: 'page',
        prompt: 'View Shows?',
        actionLabel: 'View Shows'
      },
      {
        id: 'course-link',
        name: 'Courses Portal',
        x: 18,
        y: 76,
        tone: 'courses',
        type: 'page',
        prompt: 'Go to Courses?',
        actionLabel: 'Go to Courses'
      },
      {
        id: 'hall-exit',
        name: 'Exit to Overworld',
        x: 80,
        y: 78,
        tone: 'exit',
        type: 'map',
        targetMap: 'overworld',
        prompt: 'Return to Overworld?',
        actionLabel: 'Exit Hall'
      }
    ]
  },
  civilxLab: {
    title: 'CivilX Lab Interior',
    nodes: [
      { id: 'station-a', name: 'Project Station Alpha', x: 26, y: 26, tone: 'lab', type: 'quest' },
      { id: 'station-b', name: 'Project Station Beta', x: 76, y: 28, tone: 'lab', type: 'quest' },
      { id: 'quest-board', name: 'Quest Board Placeholder', x: 48, y: 58, tone: 'lab', type: 'quest' },
      { id: 'civilx-exit', name: 'Back to Overworld Exit', x: 78, y: 82, tone: 'exit', type: 'map', targetMap: 'overworld' }
    ]
  },
  fireTemple: {
    title: 'Fire Temple Interior',
    nodes: [
      { id: 'fire-quest', name: 'Fire Projects / Quests Placeholder', x: 48, y: 42, tone: 'fire', type: 'quest' },
      { id: 'fire-exit', name: 'Back to Overworld Exit', x: 76, y: 80, tone: 'exit', type: 'map', targetMap: 'overworld' }
    ]
  },
  waterTemple: {
    title: 'Water Temple Interior',
    nodes: [
      { id: 'water-quest', name: 'Water Projects / Quests Placeholder', x: 48, y: 42, tone: 'water', type: 'quest' },
      { id: 'water-exit', name: 'Back to Overworld Exit', x: 76, y: 80, tone: 'exit', type: 'map', targetMap: 'overworld' }
    ]
  },
  earthTemple: {
    title: 'Earth Temple Interior',
    nodes: [
      { id: 'earth-quest', name: 'Earth Projects / Quests Placeholder', x: 48, y: 42, tone: 'earth', type: 'quest' },
      { id: 'earth-exit', name: 'Back to Overworld Exit', x: 76, y: 80, tone: 'exit', type: 'map', targetMap: 'overworld' }
    ]
  },
  airTemple: {
    title: 'Air Temple Interior',
    nodes: [
      { id: 'air-quest', name: 'Air Projects / Quests Placeholder', x: 48, y: 42, tone: 'air', type: 'quest' },
      { id: 'air-exit', name: 'Back to Overworld Exit', x: 76, y: 80, tone: 'exit', type: 'map', targetMap: 'overworld' }
    ]
  },
  courseAcademy: {
    title: 'Course Academy Interior',
    nodes: [
      {
        id: 'course-board',
        name: 'Courses Portal',
        x: 48,
        y: 42,
        tone: 'courses',
        type: 'page',
        prompt: 'View Courses?',
        actionLabel: 'View Courses'
      },
      {
        id: 'course-exit',
        name: 'Back to Overworld Exit',
        x: 76,
        y: 80,
        tone: 'exit',
        type: 'map',
        targetMap: 'overworld',
        prompt: 'Return to Overworld?',
        actionLabel: 'Exit Academy'
      }
    ]
  }
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

/** Don't steal WASD/arrow keys while typing in forms, admin, or overlays. */
function shouldIgnoreGameKeyboard(event) {
  const target = event.target
  if (!target || typeof target !== 'object') return false
  const tag = target.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if (target.isContentEditable) return true
  return false
}

const hallShortcuts = {
  music: { overlay: 'music', section: 'Music Hall' },
  store: { overlay: 'store', section: 'Store' },
  shows: { overlay: 'shows', section: 'Shows / Booking Desk' },
  courses: { overlay: 'courses', section: 'Courses Portal' }
}

const mobileMapCameraMql = '(max-width: 700px)'
const MOBILE_RPG_MAP_WIDTH = 900
const MOBILE_RPG_MAP_HEIGHT = 620

const getSavedProfile = () => {
  try {
    const value = localStorage.getItem(saveKey)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

function ContentItemButton({ item, onInquire }) {
  const action = resolveItemAction(item)

  if (action.kind === 'disabled') {
    return (
      <button type="button" className="arcade-button" disabled>
        {action.label || 'Coming Soon'}
      </button>
    )
  }

  if (action.kind === 'link') {
    return (
      <a className="arcade-button" href={action.href} target="_blank" rel="noopener noreferrer">
        {action.label}
      </a>
    )
  }

  if (action.kind === 'mailto') {
    return (
      <a className="arcade-button" href={action.href}>
        {action.label}
      </a>
    )
  }

  return (
    <button type="button" className="arcade-button" onClick={onInquire}>
      {action.label}
    </button>
  )
}

function ContentItemCard({ item, onInquire }) {
  const linkUrl = getItemUrl(item)
  const name = getItemDisplayName(item)

  return (
    <article className="overlay-card">
      {linkUrl ? (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="store-item-image-link">
          <img src={item.image} alt={name} className="overlay-image" />
        </a>
      ) : (
        <img src={item.image} alt={name} className="overlay-image" />
      )}
      <h4>{name}</h4>
      <p className="small">
        {item.category}
        {item.price ? ` · ${item.price}` : ''}
      </p>
      <p className="small">{item.description}</p>
      <ContentItemButton item={item} onInquire={onInquire} />
    </article>
  )
}

/**
 * Light front-end code gate — not secure for sensitive paid files.
 * Codes are stored in downloadCodesData.js and visible in the browser bundle.
 */
function CodeUnlockCard({ container }) {
  const [codeInput, setCodeInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [unlockError, setUnlockError] = useState('')

  const tryUnlock = () => {
    if (codeInput.trim().toLowerCase() === container.code.trim().toLowerCase()) {
      setUnlocked(true)
      setUnlockError('')
      return
    }
    setUnlockError('Code not recognized. Check your email and try again.')
  }

  return (
    <article className="overlay-card code-unlock-card">
      {container.image ? <img src={container.image} alt="" className="overlay-image" /> : null}
      <h4>{container.title}</h4>
      <p className="small">{container.description}</p>
      {!unlocked ? (
        <>
          <label className="code-unlock-field">
            <span className="small">Enter unlock code</span>
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
            Unlock
          </button>
        </>
      ) : (
        <>
          <h4>{container.unlockedTitle}</h4>
          <p className="small">{container.unlockedDescription}</p>
          <a
            className="arcade-button"
            href={container.unlockedUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {container.buttonText || 'Open Link'}
          </a>
        </>
      )}
    </article>
  )
}

function TempleVaultPanel({ templeKey, products, codeContainers, onInquire }) {
  const title = TEMPLE_VAULT_TITLES[templeKey] || 'Temple Vault'
  const hasContent = products.length > 0 || codeContainers.length > 0

  return (
    <article className="arcade-panel section-panel temple-shop-panel">
      <h3 className="glyph-title">{title}</h3>
      <p className="small">Offerings and downloads for this location.</p>
      <div className="glowing-divider" />
      {!hasContent ? (
        <p className="small">No offerings in this vault yet. Edit the data files to add products or code unlocks.</p>
      ) : (
        <>
          {products.length > 0 && (
            <div className="overlay-grid temple-shop-grid">
              {products.map((item) => (
                <ContentItemCard key={item.id} item={item} onInquire={() => onInquire(item)} />
              ))}
            </div>
          )}
          {codeContainers.length > 0 && (
            <>
              {products.length > 0 && <div className="glowing-divider" />}
              <h4 className="glyph-title">Code unlock</h4>
              <div className="overlay-grid temple-shop-grid">
                {codeContainers.map((container) => (
                  <CodeUnlockCard key={container.id} container={container} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </article>
  )
}

function App() {
  const savedProfile = useMemo(getSavedProfile, [])
  const [step, setStep] = useState(savedProfile ? 4 : 1)
  const [guild, setGuild] = useState(savedProfile?.guild || '')
  const [name, setName] = useState(savedProfile?.name || '')
  const [currentMap, setCurrentMap] = useState('overworld')
  const [activeSection, setActiveSection] = useState('Hall of Great Works')
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 52 })
  const [dialogueNode, setDialogueNode] = useState(null)
  const [navOpen, setNavOpen] = useState(false)
  const [hallOverlay, setHallOverlay] = useState(null)
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const [playerMessage, setPlayerMessage] = useState('')
  const [isTrackPlaying, setIsTrackPlaying] = useState(false)
  const [trackSearch, setTrackSearch] = useState('')
  const [trackCategory, setTrackCategory] = useState('All')
  const [storeSearch, setStoreSearch] = useState('')
  const [storeCategory, setStoreCategory] = useState('All')
  const [courseSearch, setCourseSearch] = useState('')
  const [courseCategory, setCourseCategory] = useState('All')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showCourseOptionPicker, setShowCourseOptionPicker] = useState(false)
  const [bookingForm, setBookingForm] = useState(null)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingStatus, setBookingStatus] = useState('')
  const [trackUnavailable, setTrackUnavailable] = useState(false)
  const [characterDirection, setCharacterDirection] = useState('down')
  const [characterMoving, setCharacterMoving] = useState(false)
  const [backgroundMusicUnlocked, setBackgroundMusicUnlocked] = useState(false)
  const [epkOpen, setEpkOpen] = useState(false)
  const [isMobileMapView, setIsMobileMapView] = useState(false)
  const [mapCameraViewportSize, setMapCameraViewportSize] = useState({ w: 0, h: 0 })
  const audioRef = useRef(null)
  const shouldAutoplayOnTrackChangeRef = useRef(false)
  const clickAudioRef = useRef(null)
  const welcomeAudioRef = useRef(null)
  const backgroundMusicRef = useRef(null)
  const movementTimeoutRef = useRef(null)
  const backgroundMusicTimesRef = useRef({})
  const activeSoundtrackKeyRef = useRef('overworld')
  const mapCameraViewportRef = useRef(null)
  const mobileMoveIntervalRef = useRef(null)

  const currentMapDef = mapDefinitions[currentMap]

  const activeTrack = musicData[activeTrackIndex] || musicData[0]
  const trackCategories = ['All', ...new Set(musicData.map((track) => track.category).filter(Boolean))]
  const filteredTracks = musicData
    .map((track, index) => ({ track, index }))
    .filter(({ track }) => {
      const matchesCategory = trackCategory === 'All' || track.category === trackCategory
      const text = `${track.title} ${track.artist} ${track.album} ${track.description}`.toLowerCase()
      const matchesSearch = text.includes(trackSearch.toLowerCase())
      return matchesCategory && matchesSearch
    })

  const isAdminPreview = useMemo(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('admin') === 'true'
  }, [])

  const storeCategories = useMemo(
    () => ['All', ...new Set(getHallStoreItems(storeItems).map((item) => item.category))],
    []
  )
  const filteredStoreItems = useMemo(() => {
    return getHallStoreItems(storeItems)
      .filter((item) => {
        const categoryMatch = storeCategory === 'All' || item.category === storeCategory
        const searchText = `${getItemDisplayName(item)} ${item.category} ${item.description}`.toLowerCase()
        return categoryMatch && searchText.includes(storeSearch.toLowerCase())
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }, [storeSearch, storeCategory])

  const templeVaultProducts = useMemo(() => {
    if (!TEMPLE_SHOP_MAP_KEYS.has(currentMap)) return []
    return getStoreItemsByTemple(currentMap)
  }, [currentMap])

  const templeVaultCodes = useMemo(() => {
    if (!TEMPLE_SHOP_MAP_KEYS.has(currentMap)) return []
    return getCodeContainersByTemple(currentMap)
  }, [currentMap])

  const courseCategories = ['All', ...new Set(courses.map((course) => course.category))]
  const filteredCourses = courses.filter((course) => {
    if (course.hidden) return false
    const categoryMatch = courseCategory === 'All' || course.category === courseCategory
    const searchText = `${course.title} ${course.category} ${course.level} ${course.description}`.toLowerCase()
    return categoryMatch && searchText.includes(courseSearch.toLowerCase())
  })

  const selectTrack = (index) => {
    shouldAutoplayOnTrackChangeRef.current = isTrackPlaying
    setActiveTrackIndex(index)
    setPlayerMessage('')
    setTrackUnavailable(false)
  }

  useEffect(() => {
    if (!audioRef.current) return

    audioRef.current.load()

    if (shouldAutoplayOnTrackChangeRef.current) {
      audioRef.current.play()
        .then(() => setIsTrackPlaying(true))
        .catch(() => {
          setIsTrackPlaying(false)
          setPlayerMessage('Track unavailable — check R2 file URL.')
        })
    } else {
      setIsTrackPlaying(false)
    }

    shouldAutoplayOnTrackChangeRef.current = false
  }, [activeTrackIndex])

  const changeTrack = (delta) => {
    const nextIndex = (activeTrackIndex + delta + musicData.length) % musicData.length
    selectTrack(nextIndex)
  }

  const togglePreview = () => {
    if (!activeTrack?.audioUrl || trackUnavailable) {
      setPlayerMessage('Track unavailable — check R2 file URL.')
      return
    }

    if (!audioRef.current) return

    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsTrackPlaying(true)).catch(() => setPlayerMessage('Track unavailable — check R2 file URL.'))
    } else {
      audioRef.current.pause()
      setIsTrackPlaying(false)
    }
  }

  const enterWorld = () => {
    const profile = { guild, name: name.trim() }
    localStorage.setItem(saveKey, JSON.stringify(profile))
    setStep(4)
  }

  const handleBeginOnboarding = () => {
    if (welcomeAudioRef.current) {
      welcomeAudioRef.current.currentTime = 0
      welcomeAudioRef.current.play().catch(() => {})
    }
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(() => {})
    }
    setStep(2)
  }
  const unlockBackgroundMusic = () => {
    if (backgroundMusicUnlocked || !backgroundMusicRef.current) return
  
    setBackgroundMusicUnlocked(true)
    backgroundMusicRef.current.play().catch(() => {})
  }
  const movePlayer = (dx, dy) => {
    unlockBackgroundMusic()
  
    // Set direction based on movement
    if (dy < 0) setCharacterDirection('up')
    if (dy > 0) setCharacterDirection('down')
    if (dx < 0) setCharacterDirection('left')
    if (dx > 0) setCharacterDirection('right')
  
    // Trigger movement animation
    setCharacterMoving(true)
  
    // Reset movement after short delay (so idle kicks in)
    if (movementTimeoutRef.current) {
      clearTimeout(movementTimeoutRef.current)
    }
  
    movementTimeoutRef.current = setTimeout(() => {
      setCharacterMoving(false)
    }, 180)
  
    // Move player (UNCHANGED logic)
    setPlayerPosition((prev) => ({
      x: clamp(prev.x + dx, 4, 96),
      y: clamp(prev.y + dy, 4, 96)
    }))
  }

  const clearMobileMoveLoop = () => {
    if (mobileMoveIntervalRef.current != null) {
      window.clearInterval(mobileMoveIntervalRef.current)
      mobileMoveIntervalRef.current = null
    }
  }

  const startMobileMove = (dx, dy, event) => {
    if (event?.cancelable) event.preventDefault()
    const target = event?.currentTarget
    if (target && typeof target.setPointerCapture === 'function' && event?.pointerId != null) {
      try {
        target.setPointerCapture(event.pointerId)
      } catch {
        /* ignore */
      }
    }
    clearMobileMoveLoop()
    movePlayer(dx, dy)
    mobileMoveIntervalRef.current = window.setInterval(() => {
      movePlayer(dx, dy)
    }, 105)
  }

  const stopMobileMove = (event) => {
    if (event?.cancelable) event.preventDefault()
    const target = event?.currentTarget
    if (target && typeof target.releasePointerCapture === 'function' && event?.pointerId != null) {
      try {
        target.releasePointerCapture(event.pointerId)
      } catch {
        /* ignore */
      }
    }
    clearMobileMoveLoop()
  }

  const nearbyLocation = useMemo(() => {
    let closest = null
    let closestDistance = Number.POSITIVE_INFINITY

    for (const location of currentMapDef.nodes) {
      const distance = Math.hypot(playerPosition.x - location.x, playerPosition.y - location.y)
      if (distance < closestDistance) {
        closestDistance = distance
        closest = location
      }
    }

    return closestDistance <= 11 ? closest : null
  }, [playerPosition, currentMapDef.nodes])

  const openDialogue = (node) => {
    setDialogueNode(node)
  }

  const closeDialogue = () => setDialogueNode(null)

  const openHallOverlayByNodeId = (nodeId) => {
    const hallOverlayMap = {
      music: 'music',
      store: 'store',
      shows: 'shows',
      'course-link': 'courses',
      'course-board': 'courses',
      course: 'courses'
    }

    return hallOverlayMap[nodeId] || null
  }

  const navigateToNode = (node) => {
    if (!node) return

    if (node.type === 'map' && node.targetMap) {
      setHallOverlay(null)
      setCurrentMap(node.targetMap)
      setPlayerPosition({ x: 50, y: 52 })
      setActiveSection(node.name)
      return
    }

    const overlay = openHallOverlayByNodeId(node.id)
    if (overlay) {
      if (currentMap !== 'hall' && currentMap !== 'courseAcademy') {
        setCurrentMap('hall')
        setPlayerPosition({ x: 50, y: 52 })
      }
      setHallOverlay(overlay)
    }

    setActiveSection(node.name)
  }

  const openHallShortcut = (key) => {
    const target = hallShortcuts[key]
    if (!target) return
    setEpkOpen(false)
    setNavOpen(false)
    setDialogueNode(null)
    if (currentMap !== 'hall') {
      setCurrentMap('hall')
      setPlayerPosition({ x: 50, y: 52 })
    }
    setHallOverlay(target.overlay)
    setActiveSection(target.section)
    if (target.overlay === 'courses') {
      setSelectedCourse(null)
      setShowCourseOptionPicker(false)
    }
  }

  const handleNodeAction = (node, action) => {
    if (action === 'yes' && node.type === 'map' && node.targetMap) {
      setCurrentMap(node.targetMap)
      setPlayerPosition({ x: 50, y: 52 })
      setActiveSection(node.name)
    }

    if (action === 'view') {
      const overlay = openHallOverlayByNodeId(node.id)
      if (overlay) {
        if (currentMap !== 'hall' && currentMap !== 'courseAcademy') {
          setCurrentMap('hall')
          setPlayerPosition({ x: 50, y: 52 })
        }
        setHallOverlay(overlay)
      }
    
      setActiveSection(node.name)
    }

    if (action === 'quest') {
      setActiveSection(`${node.name} — Join quest placeholder`)
    }

    closeDialogue()
  }


  const getNonQuestActions = (node) => {
    const actionMap = {
      music: { primary: 'Open Player', secondary: 'Play Music' },
      store: { primary: 'Browse Items' },
      shows: { primary: 'View Shows', secondary: 'Book Now' },
      'course-link': { primary: 'View Courses' },
      'course-board': { primary: 'View Courses' },
      course: { primary: 'View Courses' }
    }

    return actionMap[node.id] || { primary: node.actionLabel || 'View page' }
  }


  const openBookingForm = (bookingType, message = '') => {
    setBookingStatus('')
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      bookingType,
      eventDate: '',
      eventLocation: '',
      estimatedBudget: '',
      message
    })
  }

  const openCourseInquiry = (course, option) => {
    const inquirySubject = `${course.contactSubject} — ${option.type}`
    const inquiryMessage = `Interested Course: ${course.title}\nSelected Option: ${option.type} (${option.price})`
    openBookingForm(inquirySubject, inquiryMessage)
    setShowCourseOptionPicker(false)
  }

  const openStoreProductInquiry = (item) => {
    const name = getItemDisplayName(item)
    openBookingForm(
      item.emailSubject || `Product Inquiry: ${name}`,
      `Interested in: ${name}\nPrice: ${item.price || 'TBD'}\n${item.description || ''}`
    )
  }

  const updateBookingForm = (field, value) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }))
  }

  const submitBookingForm = async (event) => {
    event.preventDefault()
    if (!bookingForm) return

    setBookingSubmitting(true)
    setBookingStatus('')

    try {
      const response = await fetch('https://formspree.io/f/mrerdyrr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone,
          bookingType: bookingForm.bookingType,
          eventDate: bookingForm.eventDate,
          eventLocation: bookingForm.eventLocation,
          estimatedBudget: bookingForm.estimatedBudget,
          message: bookingForm.message
        })
      })

      if (!response.ok) {
        throw new Error('Form submission failed')
      }

      setBookingStatus("Booking inquiry sent. I’ll get back to you soon.")
      setBookingForm((prev) =>
        prev
          ? {
              ...prev,
              name: '',
              email: '',
              phone: '',
              eventDate: '',
              eventLocation: '',
              estimatedBudget: '',
              message: ''
            }
          : prev
      )
    } catch {
      setBookingStatus('Something went wrong. Please email civilizationexplorer@gmail.com directly.')
    } finally {
      setBookingSubmitting(false)
    }
  }

  useEffect(() => {
    setDialogueNode(null)
    if (currentMap !== 'hall') {
      setHallOverlay(null)
    }
    setTrackSearch('')
    setTrackCategory('All')
    setStoreSearch('')
    setStoreCategory('All')
    setCourseSearch('')
    setCourseCategory('All')
    setSelectedCourse(null)
    setShowCourseOptionPicker(false)
    setBookingForm(null)
    setBookingStatus('')
  }, [currentMap])

  useEffect(() => {
    if (hallOverlay !== 'music' && audioRef.current) {
      audioRef.current.pause()
      setIsTrackPlaying(false)
    }
  }, [hallOverlay])

  useEffect(() => {
    if (hallOverlay !== 'courses') {
      setSelectedCourse(null)
      setShowCourseOptionPicker(false)
    }
  }, [hallOverlay])

  useEffect(() => {
    clickAudioRef.current = new Audio('https://pub-b0ec57f6cb694b719d48d1d2cce31f9b.r2.dev/click-2.mp3')
    clickAudioRef.current.preload = 'auto'
    clickAudioRef.current.volume = 0.11
    welcomeAudioRef.current = new Audio('https://pub-b0ec57f6cb694b719d48d1d2cce31f9b.r2.dev/welcome.mp3')
    welcomeAudioRef.current.preload = 'auto'
    backgroundMusicRef.current = new Audio(mapSoundtracks.overworld)
    backgroundMusicRef.current.loop = true
    backgroundMusicRef.current.volume = 0.1
    backgroundMusicRef.current.preload = 'auto'

    const handleGlobalClickSound = (event) => {
      const clickTarget = event.target.closest('button, a, [role="button"]')
      if (!clickTarget || !clickAudioRef.current) return
      clickAudioRef.current.currentTime = 0
      clickAudioRef.current.play().catch(() => {})
    }

    document.addEventListener('click', handleGlobalClickSound, true)

    return () => {
      document.removeEventListener('click', handleGlobalClickSound, true)
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
        backgroundMusicRef.current.src = ''
      }
    }
  }, [])

  useEffect(() => {
    if (!backgroundMusicRef.current) return
  
    const activeSoundtrackKey = hallOverlay === 'courses' ? 'courses' : currentMap
    const nextSoundtrack = mapSoundtracks[activeSoundtrackKey] || mapSoundtracks.overworld
    const shouldPauseForMediaPlayback = hallOverlay === 'music' && isTrackPlaying
  
    const previousSoundtrackKey = activeSoundtrackKeyRef.current
  
    if (previousSoundtrackKey !== activeSoundtrackKey) {
      backgroundMusicTimesRef.current[previousSoundtrackKey] =
        backgroundMusicRef.current.currentTime || 0
  
      backgroundMusicRef.current.pause()
      backgroundMusicRef.current.src = nextSoundtrack
      backgroundMusicRef.current.currentTime =
        backgroundMusicTimesRef.current[activeSoundtrackKey] || 0
      backgroundMusicRef.current.load()
  
      activeSoundtrackKeyRef.current = activeSoundtrackKey
    }
  
    if (shouldPauseForMediaPlayback) {
      backgroundMusicTimesRef.current[activeSoundtrackKey] =
        backgroundMusicRef.current.currentTime || 0
      backgroundMusicRef.current.pause()
      return
    }
  
    if (step === 4 && backgroundMusicUnlocked) {
      backgroundMusicRef.current.play().catch(() => {})
    }
  }, [currentMap, hallOverlay, isTrackPlaying, step, backgroundMusicUnlocked])


  useEffect(() => {
    if (!epkOpen) return
    const handleEscape = (event) => {
      if (event.key === 'Escape') setEpkOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [epkOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(mobileMapCameraMql)
    const sync = () => setIsMobileMapView(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => () => clearMobileMoveLoop(), [])

  useEffect(() => {
    clearMobileMoveLoop()
  }, [dialogueNode, hallOverlay, bookingForm, epkOpen, step])

  useLayoutEffect(() => {
    if (step !== 4) return undefined
    const element = mapCameraViewportRef.current
    if (!element) return undefined
    const updateSize = () => {
      setMapCameraViewportSize({
        w: Math.round(element.clientWidth),
        h: Math.round(element.clientHeight)
      })
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [step, isMobileMapView])

  useEffect(() => {
    if (step !== 4) return

    const handleKeyDown = (event) => {
      if (epkOpen || isAdminPreview || hallOverlay || bookingForm) return
      if (shouldIgnoreGameKeyboard(event)) return

      const key = event.key.toLowerCase()
      const isMovementKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'enter'].includes(
        key
      )
      if (!isMovementKey) return

      if (dialogueNode && key === 'enter') return

      event.preventDefault()

      if (key === 'arrowup' || key === 'w') movePlayer(0, -stepAmount)
      if (key === 'arrowdown' || key === 's') movePlayer(0, stepAmount)
      if (key === 'arrowleft' || key === 'a') movePlayer(-stepAmount, 0)
      if (key === 'arrowright' || key === 'd') movePlayer(stepAmount, 0)
      if (key === 'enter' && nearbyLocation) openDialogue(nearbyLocation)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, nearbyLocation, dialogueNode, epkOpen, isAdminPreview, hallOverlay, bookingForm])

  const activeCharacterSprites = guildCharacterSprites[guild] || guildCharacterSprites['Water Guild']

  const activeCharacterImage =
    characterDirection === 'up'
      ? activeCharacterSprites?.back
      : characterMoving
        ? activeCharacterSprites?.walking
        : activeCharacterSprites?.idle

  const characterFacingClass =
    characterDirection === 'left'
      ? 'facing-left'
      : characterDirection === 'right'
        ? 'facing-right'
        : characterDirection === 'up'
          ? 'facing-up'
          : 'facing-down'

  const mapInteriorBackgroundClass =
    currentMap === 'hall'
      ? 'map-hall'
      : currentMap === 'civilxLab'
        ? 'map-civilx-lab'
        : currentMap === 'fireTemple'
          ? 'map-fire-temple'
          : currentMap === 'waterTemple'
            ? 'map-water-temple'
            : currentMap === 'earthTemple'
              ? 'map-earth-temple'
              : currentMap === 'airTemple'
                ? 'map-air-temple'
                : currentMap === 'courseAcademy'
                  ? 'map-course-academy'
                  : ''

  const showMapTerrainDecor =
    currentMap !== 'hall' &&
    currentMap !== 'civilxLab' &&
    currentMap !== 'fireTemple' &&
    currentMap !== 'waterTemple' &&
    currentMap !== 'earthTemple' &&
    currentMap !== 'airTemple' &&
    currentMap !== 'courseAcademy'

  const mobileRpgMapCameraStyle = useMemo(() => {
    if (!isMobileMapView) return undefined
    const vw = mapCameraViewportSize.w
    const vh = mapCameraViewportSize.h
    if (vw <= 0 || vh <= 0) return undefined

    const mw = MOBILE_RPG_MAP_WIDTH
    const mh = MOBILE_RPG_MAP_HEIGHT
    const playerPixelX = (playerPosition.x / 100) * mw
    const playerPixelY = (playerPosition.y / 100) * mh
    const camMinX = Math.min(0, vw - mw)
    const camMaxX = Math.max(0, vw - mw)
    const camMinY = Math.min(0, vh - mh)
    const camMaxY = Math.max(0, vh - mh)
    const cameraX = clamp(vw / 2 - playerPixelX, camMinX, camMaxX)
    const cameraY = clamp(vh / 2 - playerPixelY, camMinY, camMaxY)

    return {
      transform: `translate(${cameraX}px, ${cameraY}px)`
    }
  }, [isMobileMapView, mapCameraViewportSize.w, mapCameraViewportSize.h, playerPosition.x, playerPosition.y])

  return (
    <div className={`app-shell arcade-screen ${step < 4 ? 'onboarding-mode' : ''}`}>
      {step === 4 && (
        <div className="site-header-stack">
          <header className="game-title-banner" aria-label="The Great Medicine Show">
            <div className="game-title-banner-crop">
              <img
                src="https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/banners/title-banner-header.png"
                alt="The Great Medicine Show"
                width={1536}
                height={1024}
                decoding="async"
              />
            </div>
          </header>
          <div className="site-top-bar">
            <nav className="site-top-bar-nav" aria-label="Hall shortcuts">
              <button
                type="button"
                className={`site-top-bar-btn ${hallOverlay === 'music' ? 'is-active' : ''}`}
                onClick={() => openHallShortcut('music')}
              >
                Music
              </button>
              <button
                type="button"
                className={`site-top-bar-btn ${hallOverlay === 'courses' ? 'is-active' : ''}`}
                onClick={() => openHallShortcut('courses')}
              >
                Courses
              </button>
              <button
                type="button"
                className={`site-top-bar-btn ${hallOverlay === 'store' ? 'is-active' : ''}`}
                onClick={() => openHallShortcut('store')}
              >
                Store
              </button>
              <button
                type="button"
                className={`site-top-bar-btn ${hallOverlay === 'shows' ? 'is-active' : ''}`}
                onClick={() => openHallShortcut('shows')}
              >
                Shows
              </button>
              <button
                type="button"
                className={`site-top-bar-btn site-top-bar-btn--epk ${epkOpen ? 'is-active' : ''}`}
                onClick={() => {
                  setHallOverlay(null)
                  setEpkOpen(true)
                }}
              >
                Electronic Press Kit
              </button>
            </nav>
          </div>
        </div>
      )}

      {step === 1 && (
        <section className="onboarding-space-screen">
          <OnboardingCosmosBackground />
          <div className="onboarding-frame-shell">
            <img className="frame-art" src="https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/frames/frame-1.png" alt="" aria-hidden="true" />
            <div className="content-layer intro-content-layer">
              <img
                className="intro-title-image"
                src="https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/backgrounds/game-title.png"
                alt="Great Medicine Show: Hall of Great Works"
              />
              <button className="intro-start-button" onClick={handleBeginOnboarding} aria-label="Begin Onboarding">
                <img
                  src="https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/buttons/button-2.png"
                  alt=""
                  aria-hidden="true"
                />
                <span>Begin Onboarding</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="onboarding-space-screen">
          <OnboardingCosmosBackground />
          <div className="onboarding-frame-shell">
            <img className="frame-art" src="https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/frames/frame-1.png" alt="" aria-hidden="true" />
            <div className="content-layer guild-content-layer">
              <h2 className="glyph-title onboarding-title">Choose Your Elemental Guild</h2>
              <div className="element-grid">
                {guilds.map((option) => {
                  const elementTone = option.split(' ')[0].toLowerCase()
                  return (
                    <article key={option} className={`element-card tone-${elementTone} ${guild === option ? 'selected' : ''}`}>
                      <button
                        className="guild-icon-button"
                        onClick={() => setGuild(option)}
                        aria-label={`Select ${option}`}
                      >
                        <img src={onboardingGuildVisuals[option]} alt="" aria-hidden="true" />
                      </button>
                      <button className="guild-image-button element-label-button" onClick={() => setGuild(option)}>
                        <img
                          src="https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/buttons/button-2.png"
                          alt=""
                          aria-hidden="true"
                        />
                        <span>{option}</span>
                      </button>
                    </article>
                  )
                })}
              </div>
              <button className="arcade-button onboarding-continue" disabled={!guild} onClick={() => setStep(3)}>
                Continue
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="onboarding-space-screen">
          <OnboardingCosmosBackground />
          <div className="onboarding-frame-shell">
            <img className="frame-art" src="https://pub-4cf809a1f40f409f93cbf7ded1f9e822.r2.dev/great-medicine-media/ui/frames/frame-1.png" alt="" aria-hidden="true" />
            <div className="content-layer name-content-layer">
              <h2 className="glyph-title onboarding-title">Name Your Character</h2>
              <div className="name-form-panel">
                <label htmlFor="characterName">Character Name</label>
                <input
                  id="characterName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Ash of the Verdant Circuit"
                  maxLength={40}
                />
                <p className="small">Guild: {guild}</p>
                <button className="arcade-button onboarding-continue" disabled={!name.trim()} onClick={enterWorld}>
                  Enter World
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="arcade-panel world-panel" onClick={unlockBackgroundMusic}>
          <button className="arcade-button nav-toggle" onClick={() => setNavOpen((value) => !value)}>
            {navOpen ? 'Hide Navigation' : 'Show Navigation'}
          </button>

          <aside className={`sidebar arcade-panel ${navOpen ? 'open' : ''}`}>
  <div className="arcade-panel-inner">
    <h3 className="glyph-title">Map Navigation</h3>
    <div className="glowing-divider" />
    <p className="small">Current: {currentMapDef.title}</p>

    {currentMapDef.nodes.map((section) => (
      <button
        key={section.id}
        className={`arcade-button linkish ${activeSection === section.name ? 'selected' : ''}`}
        onClick={() => {
          navigateToNode(section)
          setNavOpen(false)
        }}
      >
        ✦ {section.name}
      </button>
    ))}
  </div>
</aside>

          <div className="world-content">
            <div className="status-line">
              <span>{name}</span>
              <span>{guild}</span>
              <span>{currentMapDef.title}</span>
            </div>

            <h2 className="glyph-title">{currentMapDef.title}</h2>
            <div className="glowing-divider" />

            <div ref={mapCameraViewportRef} className="map-camera-viewport">
              <div
                className={`rpg-map map-brightness-layer ${mapInteriorBackgroundClass}`}
                role="group"
                aria-label="2D RPG world map"
                style={mobileRpgMapCameraStyle}
              >
            {showMapTerrainDecor && (
  <>
    <div className="terrain terrain-forest" />
    <div className="terrain terrain-ruins" />
    <div className="terrain terrain-water" />

  </>
)}

{currentMapDef.nodes.map((location) => {
  const hasImage = Boolean(location.imageUrl)

  return (
    <button
      key={location.id}
      className={`map-node temple-card tone-${location.tone} ${hasImage ? `image-map-node ${location.imageClass || ''}` : ''} ${activeSection === location.name ? 'selected' : ''}`}
      style={{ left: `${location.x}%`, top: `${location.y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={() => openDialogue(location)}
    >
      {hasImage && (
        <img className="map-node-image" src={location.imageUrl} alt="" aria-hidden="true" />
      )}
      <span className="node-label">{location.name}</span>
    </button>
  )
})}

<div
  className={`player-avatar character-avatar ${characterFacingClass} ${characterMoving ? 'is-moving' : 'is-idle'}`}
  style={{ left: `${playerPosition.x}%`, top: `${playerPosition.y}%` }}
  aria-label={`${name || 'Player'} — ${guild || 'Water Guild'}`}
>
  {activeCharacterImage ? (
    <img src={activeCharacterImage} alt="" aria-hidden="true" />
  ) : (
    <span className="player-core" />
  )}
</div>

              {nearbyLocation && !dialogueNode && !isMobileMapView && (
                <button className="enter-prompt arcade-button" onClick={() => openDialogue(nearbyLocation)}>
                  {nearbyLocation.prompt || `Enter ${nearbyLocation.name}`}
                </button>
              )}

              {!isMobileMapView && dialogueNode && (
                <div className="dialogue-bubble" role="dialog" aria-label="Interaction dialogue">
                  <p>{dialogueNode.prompt || `Interact with ${dialogueNode.name}?`}</p>
                  <div className="dialogue-actions">
                    {dialogueNode.type === 'map' ? (
                      <>
                        <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'yes')}>
                          Yes
                        </button>
                        <button className="arcade-button" onClick={closeDialogue}>
                          Not now
                        </button>
                      </>
                    ) : dialogueNode.type === 'quest' ? (
                      <>
                        <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'quest')}>
                          Join Quest
                        </button>
                        <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'view')}>
                          View Page
                        </button>
                        <button className="arcade-button" onClick={closeDialogue}>
                          Not now
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'view')}>
                          {getNonQuestActions(dialogueNode).primary}
                        </button>
                        {getNonQuestActions(dialogueNode).secondary && (
                          <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'view')}>
                            {getNonQuestActions(dialogueNode).secondary}
                          </button>
                        )}
                        <button className="arcade-button" onClick={closeDialogue}>
                          Not now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              </div>

              {isMobileMapView && dialogueNode && (
                <div className="mobile-map-dialogue">
                  <div className="dialogue-bubble" role="dialog" aria-label="Interaction dialogue">
                    <p>{dialogueNode.prompt || `Interact with ${dialogueNode.name}?`}</p>
                    <div className="dialogue-actions">
                      {dialogueNode.type === 'map' ? (
                        <>
                          <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'yes')}>
                            Yes
                          </button>
                          <button className="arcade-button" onClick={closeDialogue}>
                            Not now
                          </button>
                        </>
                      ) : dialogueNode.type === 'quest' ? (
                        <>
                          <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'quest')}>
                            Join Quest
                          </button>
                          <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'view')}>
                            View Page
                          </button>
                          <button className="arcade-button" onClick={closeDialogue}>
                            Not now
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'view')}>
                            {getNonQuestActions(dialogueNode).primary}
                          </button>
                          {getNonQuestActions(dialogueNode).secondary && (
                            <button className="arcade-button" onClick={() => handleNodeAction(dialogueNode, 'view')}>
                              {getNonQuestActions(dialogueNode).secondary}
                            </button>
                          )}
                          <button className="arcade-button" onClick={closeDialogue}>
                            Not now
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {step === 4 &&
                isMobileMapView &&
                !dialogueNode &&
                !hallOverlay &&
                !bookingForm &&
                !epkOpen && (
                  <div
                    className="mobile-rpg-controls"
                    role="toolbar"
                    aria-label="Map movement controls"
                    onPointerDown={(e) => {
                      if (e.target === e.currentTarget) e.preventDefault()
                    }}
                  >
                    <div className="mobile-dpad" role="group" aria-label="Direction pad">
                      <span className="mobile-dpad-spacer" aria-hidden="true" />
                      <button
                        type="button"
                        className="mobile-dpad-button mobile-dpad-up arcade-button"
                        aria-label="Walk up"
                        onPointerDown={(e) => startMobileMove(0, -stepAmount, e)}
                        onPointerUp={stopMobileMove}
                        onPointerCancel={stopMobileMove}
                        onPointerLeave={stopMobileMove}
                        onLostPointerCapture={stopMobileMove}
                      >
                        ↑
                      </button>
                      <span className="mobile-dpad-spacer" aria-hidden="true" />
                      <button
                        type="button"
                        className="mobile-dpad-button mobile-dpad-left arcade-button"
                        aria-label="Walk left"
                        onPointerDown={(e) => startMobileMove(-stepAmount, 0, e)}
                        onPointerUp={stopMobileMove}
                        onPointerCancel={stopMobileMove}
                        onPointerLeave={stopMobileMove}
                        onLostPointerCapture={stopMobileMove}
                      >
                        ←
                      </button>
                      <span className="mobile-dpad-spacer" aria-hidden="true" />
                      <button
                        type="button"
                        className="mobile-dpad-button mobile-dpad-right arcade-button"
                        aria-label="Walk right"
                        onPointerDown={(e) => startMobileMove(stepAmount, 0, e)}
                        onPointerUp={stopMobileMove}
                        onPointerCancel={stopMobileMove}
                        onPointerLeave={stopMobileMove}
                        onLostPointerCapture={stopMobileMove}
                      >
                        →
                      </button>
                      <span className="mobile-dpad-spacer" aria-hidden="true" />
                      <button
                        type="button"
                        className="mobile-dpad-button mobile-dpad-down arcade-button"
                        aria-label="Walk down"
                        onPointerDown={(e) => startMobileMove(0, stepAmount, e)}
                        onPointerUp={stopMobileMove}
                        onPointerCancel={stopMobileMove}
                        onPointerLeave={stopMobileMove}
                        onLostPointerCapture={stopMobileMove}
                      >
                        ↓
                      </button>
                      <span className="mobile-dpad-spacer" aria-hidden="true" />
                    </div>
                    {nearbyLocation && (
                      <button
                        type="button"
                        className="mobile-interact-pill arcade-button"
                        aria-label={nearbyLocation.prompt || `Enter ${nearbyLocation.name}`}
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => openDialogue(nearbyLocation)}
                      >
                        Enter
                      </button>
                    )}
                  </div>
                )}
            </div>

            {TEMPLE_SHOP_MAP_KEYS.has(currentMap) ? (
              <TempleVaultPanel
                templeKey={currentMap}
                products={templeVaultProducts}
                codeContainers={templeVaultCodes}
                onInquire={openStoreProductInquiry}
              />
            ) : (
              <article className="arcade-panel section-panel">
                <h3 className="glyph-title">{activeSection}</h3>
                <p className="arcade-copy">
                  Placeholder content for <strong>{activeSection}</strong>. This panel will evolve into full rooms,
                  pages, and quests in future updates.
                </p>
              </article>
            )}

          </div>
        </section>
      )}


      {hallOverlay && (
        <div className="page-overlay-backdrop" role="dialog" aria-label="Hall content overlay">
          <section className="page-overlay arcade-panel">
            {hallOverlay === 'music' && (
              <>
                <p className="overlay-status">MUSIC HALL PAGE OPEN</p>
                <h3 className="glyph-title">Music Hall</h3>
                <div className="glowing-divider" />
                <div className="music-shell music-deck">
                  <div className="album-art">{activeTrack.coverImage ? <img src={activeTrack.coverImage} alt={activeTrack.title} /> : <span className="small">No Cover</span>}</div>
                  <div className="music-main">
                    <div className="now-playing">
                      <p className="small">Now Playing</p>
                      <h4>{activeTrack.title}</h4>
                      <p className="small">{activeTrack.artist} · {activeTrack.album}</p>
                    </div>
                    <div className="music-controls large-controls">
                      <button className="arcade-button" onClick={() => changeTrack(-1)}>Previous</button>
                      <button className="arcade-button" onClick={togglePreview}>{isTrackPlaying ? 'Pause' : 'Play'}</button>
                      <button className="arcade-button" onClick={() => changeTrack(1)}>Next</button>
                    </div>
                    <audio
                      ref={audioRef}
                      controls
                      src={activeTrack.audioUrl}
                      onError={() => {
                        setTrackUnavailable(true)
                        setPlayerMessage('Track unavailable — check R2 file URL.')
                      }}
                      onPlay={() => setIsTrackPlaying(true)}
                      onPause={() => setIsTrackPlaying(false)}
                    />
                    <div className="track-list">
                      <p className="small">{activeTrack.description || 'No description provided for this track yet.'}</p>
                      {playerMessage && <p className="small">{playerMessage}</p>}
                    </div>
                    <div className="library-panel">
                      <div className="library-controls">
                        <input
                          value={trackSearch}
                          onChange={(event) => setTrackSearch(event.target.value)}
                          placeholder="Search title, artist, album, description"
                        />
                        <select value={trackCategory} onChange={(event) => setTrackCategory(event.target.value)}>
                          {trackCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="track-selector tall-list">
                        {filteredTracks.length === 0 ? (
                          <p className="small">No tracks found</p>
                        ) : (
                          filteredTracks.map(({ track, index }, listIndex) => (
                            <button
                              key={`${track.fileName}-${index}`}
                              type="button"
                              className={`playlist-row ${activeTrackIndex === index ? 'selected' : ''}`}
                              onClick={() => selectTrack(index)}
                            >
                              <span className="playlist-number">{listIndex + 1}.</span>
                              <span>
                                <strong>{track.title}</strong>
                                <small>{track.category}{track.description ? ` · ${track.description}` : ''}</small>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    <p className="small">Full on-site music streaming is coming soon. For now, listen on Spotify, SoundCloud, or YouTube.</p>
                    <div className="platform-links">
                      <a className="arcade-button" href={artistLinks.spotify} target="_blank" rel="noreferrer">Spotify</a>
                      <a className="arcade-button" href={artistLinks.soundcloud} target="_blank" rel="noreferrer">SoundCloud</a>
                      <a className="arcade-button" href={artistLinks.youtube} target="_blank" rel="noreferrer">YouTube</a>
                    </div>
                  </div>
                </div>
              </>
            )}

            {hallOverlay === 'store' && (
              <>
                <p className="overlay-status">STORE PAGE OPEN</p>
                <h3 className="glyph-title">Store</h3>
                <div className="glowing-divider" />
                <div className="business-controls">
                  <input
                    value={storeSearch}
                    onChange={(event) => setStoreSearch(event.target.value)}
                    placeholder="Search products"
                  />
                  <select value={storeCategory} onChange={(event) => setStoreCategory(event.target.value)}>
                    {storeCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="overlay-grid">
                  {filteredStoreItems.length === 0 ? (
                    <p className="small">No products found.</p>
                  ) : (
                    filteredStoreItems.map((item) => (
                      <ContentItemCard
                        key={item.id}
                        item={item}
                        onInquire={() => openStoreProductInquiry(item)}
                      />
                    ))
                  )}
                </div>
              </>
            )}

            {hallOverlay === 'shows' && (
              <>
                <p className="overlay-status">SHOWS & BOOKING PAGE OPEN</p>
                <h3 className="glyph-title">Shows & Booking</h3>
                <div className="glowing-divider" />
                <div className="shows-grid">
                  {upcomingShows.filter((s) => !s.hidden).map((show) => (
                    <article key={show.id} className="show-card">
                      {show.flyerImage || show.image ? (
                        <img src={show.flyerImage || show.image} alt={show.title} className="show-flyer" />
                      ) : (
                        <div className="show-flyer show-flyer-placeholder">Flyer coming soon.</div>
                      )}
                      <div className="show-body">
                        <h4>{show.title}</h4>
                        <p className="small">
                          {show.date}
                          {show.time ? ` · ${show.time}` : ''} · {show.location}
                        </p>
                        <p className="small">{show.description}</p>
                        <ContentItemButton
                          item={show}
                          onInquire={() =>
                            openBookingForm(show.emailSubject || `Tickets: ${show.title}`)
                          }
                        />
                      </div>
                    </article>
                  ))}
                </div>
                <h4 className="glyph-title">Book The Great Medicine Show</h4>
                <div className="overlay-grid">
                  {bookingOffers.filter((o) => !o.hidden).map((offer) => (
                    <article key={offer.id} className="overlay-card">
                      {offer.iconImage || offer.image ? (
                        <img src={offer.iconImage || offer.image} alt={offer.title} className="booking-icon" />
                      ) : (
                        <div className="booking-icon booking-icon-placeholder" aria-hidden="true" />
                      )}
                      <h4>{offer.title}</h4>
                      <p className="small">{offer.description}</p>
                      <ContentItemButton
                        item={offer}
                        onInquire={() =>
                          openBookingForm(offer.inquirySubject || offer.bookingType || offer.title)
                        }
                      />
                    </article>
                  ))}
                </div>
                <button className="arcade-button" onClick={() => openBookingForm('General Booking Inquiry')}>
                  Contact / Booking Inquiry
                </button>
              </>
            )}

            {hallOverlay === 'courses' && (
              <>
                <p className="overlay-status">COURSES ACADEMY PAGE OPEN</p>
                <h3 className="glyph-title">Courses Academy</h3>
                <div className="glowing-divider" />
                {selectedCourse ? (
                  <article className="overlay-card">
                    <img src={selectedCourse.image} alt={selectedCourse.title} className="overlay-image" />
                    <h4>{selectedCourse.title}</h4>
                    <p className="small">{selectedCourse.category} · {selectedCourse.level}</p>
                    <p className="small">{selectedCourse.duration} · {selectedCourse.format}</p>
                    <div className="overlay-grid">
                      {selectedCourse.priceOptions.map((option) => (
                        <article key={option.type} className="overlay-card">
                          <h4>{option.type}</h4>
                          <p className="small">{option.price}</p>
                          <ContentItemButton
                            item={{
                              ...option,
                              name: option.type,
                              emailSubject:
                                option.emailSubject ||
                                `${selectedCourse.contactSubject} — ${option.type}`
                            }}
                            onInquire={() => openCourseInquiry(selectedCourse, option)}
                          />
                        </article>
                      ))}
                    </div>
                    <p className="small">{selectedCourse.fullDescription}</p>
                    <h4>What You Will Learn</h4>
                    <ul className="small">
                      {selectedCourse.whatYouWillLearn.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <h4>What You Get</h4>
                    <ul className="small">
                      {selectedCourse.whatYouGet.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className="dialogue-actions">
                      <button className="arcade-button" onClick={() => setSelectedCourse(null)}>
                        Back to Courses
                      </button>
                      <button className="arcade-button" onClick={() => setShowCourseOptionPicker((value) => !value)}>
                        Contact Me About This Course
                      </button>
                    </div>
                    {showCourseOptionPicker && (
                      <div className="dialogue-actions course-option-actions">
                        {selectedCourse.priceOptions.map((option) => (
                          <div key={option.type} className="course-option-row">
                            <span className="small course-option-label">
                              {option.type} — {option.price}
                            </span>
                            <ContentItemButton
                              item={{
                                ...option,
                                name: option.type,
                                emailSubject:
                                  option.emailSubject ||
                                  `${selectedCourse.contactSubject} — ${option.type}`
                              }}
                              onInquire={() => openCourseInquiry(selectedCourse, option)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ) : (
                  <>
                    <div className="business-controls">
                      <input
                        value={courseSearch}
                        onChange={(event) => setCourseSearch(event.target.value)}
                        placeholder="Search courses"
                      />
                      <select value={courseCategory} onChange={(event) => setCourseCategory(event.target.value)}>
                        {courseCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="overlay-grid">
                      {filteredCourses.length === 0 ? (
                        <p className="small">No courses found.</p>
                      ) : (
                        filteredCourses.map((course) => (
                          <article key={course.id} className="overlay-card">
                            <img src={course.image} alt={course.title} className="overlay-image" />
                            <h4>{course.title}</h4>
                            <p className="small">{course.category} · {course.level}</p>
                            <p className="small">{course.duration} · {course.format}</p>
                            <p className="small">
                              {course.priceOptions.map((option) => `${option.type} — ${option.price}`).join(' · ')}
                            </p>
                            <p className="small">{course.description}</p>
                            <button
                              className="arcade-button"
                              onClick={() => {
                                setSelectedCourse(course)
                                setShowCourseOptionPicker(false)
                              }}
                            >
                              View Course Details
                            </button>
                          </article>
                        ))
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <button className="arcade-button" onClick={() => setHallOverlay(null)}>
              Back to Hall
            </button>
          </section>
        </div>
      )}

      {epkOpen && (
        <div
          className="epk-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="epk-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setEpkOpen(false)
          }}
        >
          <div className="epk-panel arcade-panel">
            <div className="epk-toolbar">
              <p id="epk-title" className="epk-toolbar-title">
                Electronic Press Kit
              </p>
              <button type="button" className="arcade-button epk-close-btn" onClick={() => setEpkOpen(false)}>
                Close
              </button>
            </div>

            <div className="epk-hero">
              <div className="epk-hero-left">
                <p className="epk-tagline">{epkContent.tagline}</p>
                <div className="epk-mark-stack" aria-hidden="true">
                  <span>×</span>
                  <span>×</span>
                  <span>×</span>
                </div>
                <div className="epk-portrait-frame">
                  <img src={epkPortraitUrl} alt="The Great Medicine Show" className="epk-portrait" />
                </div>
              </div>
              <div className="epk-hero-right">
                <img src={epkLogoUrl} alt="" className="epk-wordmark" />
                <div className="epk-bio">
                  <p>{epkContent.bio}</p>
                </div>
              </div>
            </div>

            <div className="glowing-divider epk-divider" />

            <div className="epk-mid">
              <ul className="epk-bullet-list">
                {epkContent.bullets.map((item) => (
                  <li key={item.title}>
                    <span className="epk-play-icon" aria-hidden="true" />
                    <div className="epk-bullet-body">
                      <strong>{item.title}</strong>
                      <p className="epk-bullet-text">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <figure className="epk-performance">
                <img src={epkPerformanceImageUrl} alt="Live performance" />
                <figcaption className="small">Live energy &amp; stage presence</figcaption>
              </figure>
            </div>

            <p className="epk-shows-line">
              <strong>Shows played:</strong> {epkContent.showsPlayed}
            </p>

            <div className="glowing-divider epk-divider" />

            <div className="epk-bottom">
              <div className="epk-bottom-left">
                <p className="epk-draw">
                  <strong>{epkContent.draw}</strong>
                </p>
                <p className="small epk-supports-label">Past supports &amp; shared bills</p>
                <p className="epk-supports">{epkContent.pastSupports}</p>
              </div>
              <div className="epk-bottom-right">
                <p className="small epk-connect-heading">Connect</p>
                <ul className="epk-connect-list">
                  <li>
                    <span className="epk-connect-icon epk-connect-icon-phone" aria-hidden="true" />
                    <a href={`tel:${epkContact.phoneTel}`}>{epkContact.phoneDisplay}</a>
                  </li>
                  <li>
                    <span className="epk-connect-icon epk-connect-icon-mail" aria-hidden="true" />
                    <a href={`mailto:${epkContact.email}`}>{epkContact.email}</a>
                  </li>
                  <li>
                    <span className="epk-connect-icon epk-connect-icon-globe" aria-hidden="true" />
                    <a href={artistLinks.instagram} target="_blank" rel="noreferrer">
                      Instagram
                    </a>
                  </li>
                  <li>
                    <span className="epk-connect-icon epk-connect-icon-note" aria-hidden="true" />
                    <a href={artistLinks.spotify} target="_blank" rel="noreferrer">
                      Spotify
                    </a>
                  </li>
                  <li>
                    <span className="epk-connect-icon epk-connect-icon-wave" aria-hidden="true" />
                    <a href={artistLinks.soundcloud} target="_blank" rel="noreferrer">
                      SoundCloud
                    </a>
                  </li>
                  <li>
                    <span className="epk-connect-icon epk-connect-icon-tube" aria-hidden="true" />
                    <a href={artistLinks.youtube} target="_blank" rel="noreferrer">
                      YouTube
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {bookingForm && (
        <div className="booking-modal-backdrop" role="dialog" aria-label="Booking inquiry form">
          <form className="booking-modal arcade-panel" onSubmit={submitBookingForm}>
            <h3 className="glyph-title">Booking Inquiry Form</h3>
            <p className="small">Submit this form to send your booking inquiry directly.</p>
            <div className="booking-grid">
              <input required placeholder="Name" value={bookingForm.name} onChange={(event) => updateBookingForm('name', event.target.value)} />
              <input required type="email" placeholder="Email" value={bookingForm.email} onChange={(event) => updateBookingForm('email', event.target.value)} />
              <input placeholder="Phone" value={bookingForm.phone} onChange={(event) => updateBookingForm('phone', event.target.value)} />
              <input required placeholder="Booking Type" value={bookingForm.bookingType} onChange={(event) => updateBookingForm('bookingType', event.target.value)} />
              <input type="date" value={bookingForm.eventDate} onChange={(event) => updateBookingForm('eventDate', event.target.value)} />
              <input placeholder="Event Location" value={bookingForm.eventLocation} onChange={(event) => updateBookingForm('eventLocation', event.target.value)} />
              <input placeholder="Estimated Budget" value={bookingForm.estimatedBudget} onChange={(event) => updateBookingForm('estimatedBudget', event.target.value)} />
              <textarea placeholder="Message / Details" value={bookingForm.message} onChange={(event) => updateBookingForm('message', event.target.value)} />
            </div>
            <div className="dialogue-actions">
              <button type="submit" className="arcade-button" disabled={bookingSubmitting}>{bookingSubmitting ? 'Sending…' : 'Send Booking Inquiry'}</button>
              <button type="button" className="arcade-button" onClick={() => setBookingForm(null)}>Close</button>
            </div>
            {bookingStatus && <p className="small">{bookingStatus}</p>}
          </form>
        </div>
      )}


      {isAdminPreview && <AdminDashboard />}

      <footer className="footer">Boot OK</footer>
    </div>
  )
}

export default App
