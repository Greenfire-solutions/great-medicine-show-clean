import storeJson from './storeData.json'
import { getItemsByTemple } from '../lib/contentHelpers'

export { getHallStoreItems, getItemsByTemple, getVisibleItems } from '../lib/contentHelpers'

export const storeItems = storeJson.items

export function getStoreCheckoutUrl(item) {
  return (item.url || item.checkoutUrl || '').trim()
}

export function getStoreItemsByTemple(templeKey, items = storeItems) {
  return getItemsByTemple(templeKey, items)
}
