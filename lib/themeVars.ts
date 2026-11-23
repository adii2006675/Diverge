// The CSS variables for a theme, accent colour and text size. This function is self-contained on purpose: the page also embeds its
// source in a tiny script that runs before the first paint, so the saved colours show immediately instead of flashing the defaults.
export const ACCENT_KEYS = ['none', 'red', 'orange', 'blue', 'green', 'purple', 'pink', 'teal']

export function themeVarsFor(theme: string, accentKey: string, fontSize: string): Record<string, string> {
  var ACCENTS: Record<string, string> = {
    red: '#F43F5E',
    orange: '#F59E0B',
    blue: '#3B82F6',
    green: '#10B981',
    purple: '#8B5CF6',
    pink: '#EC4899',
    teal: '#FACC15', // the saved value is still 'teal'; it shows as Yellow
  }
  var SCALES: Record<string, string> = { small: '8px', medium: '12px', large: '16px' }
  var THEMES: Record<string, { bg: string; text: string; textDim: string; navBg: string; border: string }> = {
    light: { bg: '#FAFAFA', text: '#0A0A0A', textDim: 'rgba(10,10,10,0.55)', navBg: 'rgba(250,250,250,0.97)', border: 'rgba(0,0,0,0.1)' },
    dark: { bg: '#080810', text: '#FFFFFF', textDim: 'rgba(255,255,255,0.55)', navBg: 'rgba(8,8,16,0.97)', border: 'rgba(255,255,255,0.1)' },
  }
  var t = THEMES[theme] || THEMES.dark
  var accent = accentKey === 'none' ? t.text : (ACCENTS[accentKey] || ACCENTS.orange)
  // Text colour that stays readable on top of the accent colour.
  var ink = { on: '#fff', onDark: '#1b1305' }
  var m = /^#([0-9a-f]{6})$/i.exec((accentKey === 'none' ? t.text : accent).trim())
  if (m) {
    var ch: number[] = []
    for (var i = 0; i < 6; i += 2) {
      var c = parseInt(m[1].slice(i, i + 2), 16) / 255
      ch.push(c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
    }
    var lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
    ink = { on: lum > 0.55 ? '#0A0A0A' : '#fff', onDark: lum < 0.08 ? '#fff' : '#1b1305' }
  }
  return {
    '--bg': t.bg,
    '--star-color': accent,
    '--text': t.text,
    '--text-dim': t.textDim,
    '--nav-bg': t.navBg,
    '--card-bg': 'color-mix(in srgb, var(--text) 4.5%, var(--bg))',
    '--surface': 'color-mix(in srgb, var(--text) 3%, var(--bg))',
    '--border-color': t.border,
    '--accent': accent,
    // With the None colour the accent equals the text colour, so the logo and thinking animation get a contrasting second strand.
    '--accent-strand': accentKey === 'none' ? (theme === 'light' ? '#C9C9D3' : '#2B2B38') : accent,
    '--on-accent': ink.on,
    '--on-accent-dark': ink.onDark,
    '--font-scale': SCALES[fontSize] || SCALES.medium,
  }
}
