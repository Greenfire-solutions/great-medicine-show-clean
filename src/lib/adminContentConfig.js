import storeJson from '../data/storeData.json'
import coursesJson from '../data/coursesData.json'
import showsJson from '../data/showsData.json'
import bookingJson from '../data/bookingOffersData.json'
import codesJson from '../data/downloadCodesData.json'
import beatLabJson from '../data/beatLabData.json'

/** Maps admin tab keys to GitHub JSON paths and root property names. */
export const ADMIN_CONTENT_FILES = {
  store: {
    fileKey: 'store',
    githubPath: 'src/data/storeData.json',
    dataKey: 'items',
    label: 'Products',
    getInitial: () => structuredClone(storeJson)
  },
  courses: {
    fileKey: 'courses',
    githubPath: 'src/data/coursesData.json',
    dataKey: 'courses',
    label: 'Courses',
    getInitial: () => structuredClone(coursesJson)
  },
  shows: {
    fileKey: 'shows',
    githubPath: 'src/data/showsData.json',
    dataKey: 'upcomingShows',
    label: 'Shows',
    getInitial: () => structuredClone(showsJson)
  },
  booking: {
    fileKey: 'booking',
    githubPath: 'src/data/bookingOffersData.json',
    dataKey: 'bookingOffers',
    label: 'Booking Offers',
    getInitial: () => structuredClone(bookingJson)
  },
  downloadCodes: {
    fileKey: 'downloadCodes',
    githubPath: 'src/data/downloadCodesData.json',
    dataKey: 'downloadCodeContainers',
    label: 'Code Unlocks',
    getInitial: () => structuredClone(codesJson)
  },
  beatLab: {
    fileKey: 'beatLab',
    githubPath: 'src/data/beatLabData.json',
    dataKey: 'folders',
    label: 'Beat Lab',
    getInitial: () => structuredClone(beatLabJson)
  }
}

export const ADMIN_TAB_ORDER = ['store', 'courses', 'shows', 'booking', 'downloadCodes', 'beatLab', 'temples']
