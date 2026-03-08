/**
 * Base URL for the site. Set NEXT_PUBLIC_SITE_URL in production (e.g. https://weeklyfinancearticles.com).
 * Falls back to localhost in development.
 */
export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}
