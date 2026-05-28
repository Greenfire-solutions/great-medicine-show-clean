import codesJson from './downloadCodesData.json'

export const downloadCodeContainers = codesJson.downloadCodeContainers

export function getVisibleCodeContainers(containers = downloadCodeContainers) {
  return containers.filter((item) => !item.hidden)
}

export function getCodeContainersByTemple(templeKey, containers = downloadCodeContainers) {
  if (!templeKey) return []
  return getVisibleCodeContainers(containers).filter((item) => item.templeLocation === templeKey)
}
