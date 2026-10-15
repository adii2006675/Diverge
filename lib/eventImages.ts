// Event images live in /public/events (one file per event id). Sources and licences: public/events/CREDITS.md
const EVENT_IMAGES: Record<string, string> = {
  'jfk-1963': '/events/jfk-1963.jpg',
  'ww2-1939': '/events/ww2-1939.jpg',
  'berlin-wall-1989': '/events/berlin-wall-1989.jpg',
  '9-11-2001': '/events/9-11-2001.jpg',
  'cuban-missile-1962': '/events/cuban-missile-1962.jpg',
  'lincoln-1865': '/events/lincoln-1865.jpg',
  'titanic-1912': '/events/titanic-1912.jpg',
  'moon-1969': '/events/moon-1969.jpg',
  'ww1-1914': '/events/ww1-1914.jpg',
  'soviet-1991': '/events/soviet-1991.jpg',
  'gutenberg-1440': '/events/gutenberg-1440.jpg',
  'columbus-1492': '/events/columbus-1492.jpg',
  'martin-luther-1517': '/events/martin-luther-1517.jpg',
  'french-revolution-1789': '/events/french-revolution-1789.jpg',
  'american-independence-1776': '/events/american-independence-1776.jpg',
  'magna-carta-1215': '/events/magna-carta-1215.jpg',
  'black-death-1347': '/events/black-death-1347.jpg',
  'fall-of-constantinople-1453': '/events/fall-of-constantinople-1453.jpg',
  'genghis-khan-1206': '/events/genghis-khan-1206.jpg',
  'financial-crisis-2008': '/events/financial-crisis-2008.jpg',
  'iphone-2007': '/events/iphone-2007.jpg',
  'covid-2020': '/events/covid-2020.png',
  'internet-1991': '/events/internet-1991.jpg',
  'wright-brothers-1903': '/events/wright-brothers-1903.jpg',
  'transatlantic-slave-trade-1619': '/events/transatlantic-slave-trade-1619.jpg',
  'womens-suffrage-1920': '/events/womens-suffrage-1920.jpg',
  'hiroshima-1945': '/events/hiroshima-1945.jpg',
  'israel-founded-1948': '/events/israel-founded-1948.jpg',
  'mlk-march-1963': '/events/mlk-march-1963.jpg',
  'blm-2013': '/events/blm-2013.jpg',
  'berlin-olympics-1936': '/events/berlin-olympics-1936.jpg',
  'india-independence-1947': '/events/india-independence-1947.jpg',
  'apartheid-ends-1994': '/events/apartheid-ends-1994.jpg',
  'chernobyl-1986': '/events/chernobyl-1986.jpg',
  'boston-tea-party-1773': '/events/boston-tea-party-1773.jpg',
  'great-depression-1929': '/events/great-depression-1929.jpg',
  'pearl-harbor-1941': '/events/pearl-harbor-1941.jpg',
  'salem-witch-trials-1692': '/events/salem-witch-trials-1692.jpg',
  'first-computer-1946': '/events/first-computer-1946.jpg',
  'vaccine-smallpox-1796': '/events/vaccine-smallpox-1796.jpg',
  'einstein-relativity-1905': '/events/einstein-relativity-1905.jpg',
  'renaissance-davinci-1503': '/events/renaissance-davinci-1503.jpg',
  'suez-canal-1869': '/events/suez-canal-1869.jpg',
  'rwandan-genocide-1994': '/events/rwandan-genocide-1994.jpg',
  'apollo13-1970': '/events/apollo13-1970.jpg',
  'arab-spring-2011': '/events/arab-spring-2011.jpg',
  'obama-2008': '/events/obama-2008.jpg',
  'facebook-2004': '/events/facebook-2004.jpg',
  'fukushima-2011': '/events/fukushima-2011.jpg',
  'brexit-2016': '/events/brexit-2016.jpg',
  'musk-trillionaire-2026': '/events/musk-trillionaire-2026.jpg',
  'pyramids-2560bc': '/events/pyramids-2560bc.jpg',
  'rome-founded-753bc': '/events/rome-founded-753bc.jpg',
  'code-hammurabi-1754bc': '/events/code-hammurabi-1754bc.jpg',
  'buddha-563bc': '/events/buddha-563bc.jpg',
  'alexander-great-336bc': '/events/alexander-great-336bc.jpg',
  'first-olympics-776bc': '/events/first-olympics-776bc.jpg',
  'great-wall-221bc': '/events/great-wall-221bc.jpg',
}

// Vertical crop for the wide banner images. Faces and subjects usually sit in the upper part of a photo.
const DEFAULT_POSITION = 'center 30%'
const POSITIONS: Record<string, string> = {
  'ww2-1939': 'center 15%',
  'code-hammurabi-1754bc': 'center 10%',
  'jfk-1963': 'center 33%',
}

export function getEventImage(id: string): string | null {
  return EVENT_IMAGES[id] ?? null
}

export function getEventImagePosition(id: string): string {
  return POSITIONS[id] ?? DEFAULT_POSITION
}
