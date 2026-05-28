import coursesJson from './coursesData.json'

export const courses = coursesJson.courses

export function getCourseOptionCheckoutUrl(option) {
  return (option.url || option.checkoutUrl || '').trim()
}
