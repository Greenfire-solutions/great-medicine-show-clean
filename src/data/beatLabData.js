import beatLabJson from './beatLabData.json'

export const beatLabFolders = beatLabJson.folders

export function getVisibleBeatLabFolders(folders = beatLabFolders) {
  return folders
    .filter((folder) => !folder.hidden)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}
