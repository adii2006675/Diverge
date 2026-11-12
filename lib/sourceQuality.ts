// How much to trust a web source, judged from its address alone. This is a guard on top of asking the research model to pick
// credible sources, because a model will sometimes cite a content farm or a blog. It is a judgment call, not a guarantee:
//   trusted  = official/academic addresses and well-known newsrooms, reference works, museums and history publishers
//   blocked  = user-generated platforms, forums, social media, blog hosts and homework/content-farm sites
//   unknown  = everything else (used only when there are too few trusted sources)
export type Tier = 'trusted' | 'unknown' | 'blocked'

const on = (host: string, domain: string) => host === domain || host.endsWith('.' + domain)

export const BLOCKED_DOMAINS = [
  'reddit.com', 'quora.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'pinterest.com', 'tumblr.com',
  'medium.com', 'blogspot.com', 'wordpress.com', 'substack.com', 'fandom.com', 'wikia.com', 'brainly.com', 'chegg.com',
  'coursehero.com', 'scribd.com', 'slideshare.net', 'answers.com', 'ranker.com', 'listverse.com', 'deadlycurious.com',
]

// Addresses that are official or academic by their ending: .gov, .gov.uk, .gouv.fr, .gob.es, .edu, .ac.uk, .mil, .int, .museum, .eu
const TRUSTED_SUFFIX = [
  /(^|\.)gov(\.[a-z]{2})?$/, /(^|\.)gouv\.[a-z]{2}$/, /(^|\.)gob\.[a-z]{2}$/, /(^|\.)go\.[a-z]{2}$/, /\.edu(\.[a-z]{2})?$/, /\.ac\.[a-z]{2}$/,
  /\.mil$/, /\.int$/, /\.museum$/, /\.eu$/,
]

const TRUSTED_HOSTS = [
  // reference works, archives, history publishers and museums
  'britannica.com', 'wikipedia.org', 'worldhistory.org', 'historynet.com', 'history.com', 'smithsonianmag.com', 'si.edu',
  'nationalgeographic.com', 'jstor.org', 'nature.com', 'science.org', 'cambridge.org', 'oup.com', 'oxfordreference.com',
  'loc.gov', 'archives.gov', 'nationalarchives.gov.uk', 'un.org', 'nato.int', 'europa.eu',
  // governments whose addresses don't end in .gov
  'bundesregierung.de', 'bundestag.de', 'berlin.de', 'bundesarchiv.de', 'gouvernement.fr', 'moncloa.es',
  // established news organisations and broadcasters
  'bbc.com', 'bbc.co.uk', 'reuters.com', 'apnews.com', 'npr.org', 'pbs.org', 'nytimes.com', 'washingtonpost.com',
  'theguardian.com', 'wsj.com', 'economist.com', 'ft.com', 'time.com', 'theatlantic.com', 'newyorker.com',
  'aljazeera.com', 'dw.com', 'france24.com', 'cbc.ca', 'abc.net.au', 'cnn.com', 'nbcnews.com', 'cbsnews.com', 'abcnews.go.com',
  'foxnews.com', 'usatoday.com', 'latimes.com', 'bloomberg.com', 'axios.com', 'politico.com', 'spiegel.de', 'lemonde.fr',
]

export function sourceTier(url: string): Tier {
  let host = ''
  try { host = new URL(url).hostname.toLowerCase().replace(/^www\./, '') } catch { return 'blocked' }
  if (!host) return 'blocked'
  if (BLOCKED_DOMAINS.some(d => on(host, d))) return 'blocked'
  if (TRUSTED_SUFFIX.some(re => re.test(host))) return 'trusted'
  if (TRUSTED_HOSTS.some(d => on(host, d))) return 'trusted'
  return 'unknown'
}
