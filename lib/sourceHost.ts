/** A readable site name for a source link, for example "history.com". Safe to use in the browser and on the server. */
export function hostOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
}

/** True when a link points at Wikipedia. */
export function isWikipedia(url: string) {
  return /(^|\.)wikipedia\.org$/.test(hostOf(url))
}
