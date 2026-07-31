export type HistoricalEvent = {
  id: string
  year: number
  title: string
  shortDesc: string
  fullDesc: string
  era: string
  image: string
  realFacts: string[]
}

export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: 'jfk-1963',
    year: 1963,
    title: 'JFK Assassination',
    shortDesc: 'President Kennedy is shot in Dallas, Texas, changing the course of American history.',
    fullDesc: 'On November 22, 1963, President John F. Kennedy was assassinated in Dallas. LBJ took over, escalating Vietnam and reshaping domestic policy.',
    era: 'Cold War',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/John_F._Kennedy%2C_White_House_color_photo_portrait.jpg/800px-John_F._Kennedy%2C_White_House_color_photo_portrait.jpg',
    realFacts: [
      'LBJ sworn in as president November 22, 1963',
      'Vietnam War escalates to 500,000 troops by 1968',
      '58,220 Americans die in Vietnam',
      'Nixon wins 1968 presidential election',
      'Moon landing achieved July 1969'
    ]
  },
  {
    id: 'ww2-1939',
    year: 1939,
    title: 'Hitler Rises to Power',
    shortDesc: 'Adolf Hitler consolidates control of Germany, setting Europe on a path to war.',
    fullDesc: 'By 1939 Hitler had remilitarized Germany, annexed Austria and Czechoslovakia, and was poised to invade Poland — triggering World War II.',
    era: 'WWI/WWII',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Adolf_Hitler_Berghof-1936.jpg/800px-Adolf_Hitler_Berghof-1936.jpg',
    realFacts: [
      'Germany invades Poland September 1, 1939',
      'France falls in six weeks in 1940',
      'Holocaust kills 6 million Jews',
      'USA enters war after Pearl Harbor 1941',
      '70-85 million people die in total conflict'
    ]
  },
  {
    id: 'berlin-wall-1989',
    year: 1989,
    title: 'Fall of the Berlin Wall',
    shortDesc: 'The Berlin Wall falls, ending the Cold War division of Europe.',
    fullDesc: 'On November 9, 1989, the Berlin Wall fell after East Germany opened its borders. This triggered the reunification of Germany and the collapse of the Soviet Union.',
    era: 'Cold War',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Berlinermauer.jpg/800px-Berlinermauer.jpg',
    realFacts: [
      'Germany officially reunified October 3, 1990',
      'Soviet Union dissolves December 25, 1991',
      'NATO expands eastward through 1990s',
      'European Union expands to 28 members',
      'US becomes sole global superpower'
    ]
  },
  {
    id: '9-11-2001',
    year: 2001,
    title: '9/11 Attacks',
    shortDesc: 'Al-Qaeda hijackers crash planes into the Twin Towers and Pentagon.',
    fullDesc: 'On September 11, 2001, 19 al-Qaeda operatives hijacked four planes, destroying the World Trade Center and killing nearly 3,000 people — triggering the War on Terror.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/FEMA_-_4240_-_Photograph_by_Bri_Rodriguez_taken_on_09-11-2001_in_New_York.jpg/800px-FEMA_-_4240_-_Photograph_by_Bri_Rodriguez_taken_on_09-11-2001_in_New_York.jpg',
    realFacts: [
      'USA invades Afghanistan October 2001',
      'Patriot Act passed dramatically expanding surveillance',
      'USA invades Iraq March 2003',
      '900,000+ people die in post-9/11 wars',
      'TSA and Department of Homeland Security created'
    ]
  },
  {
    id: 'cuban-missile-1962',
    year: 1962,
    title: 'Cuban Missile Crisis',
    shortDesc: 'The US and USSR come to the brink of nuclear war over missiles in Cuba.',
    fullDesc: 'For 13 days in October 1962, the world held its breath as Kennedy and Khrushchev faced off over Soviet missiles in Cuba — the closest the Cold War came to going nuclear.',
    era: 'Cold War',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Cuban_Missile_Crisis_-_Kennedy_signs_proclamation.jpg/800px-Cuban_Missile_Crisis_-_Kennedy_signs_proclamation.jpg',
    realFacts: [
      'USSR agrees to remove missiles after 13 days',
      'USA secretly removes missiles from Turkey',
      'Hot line established between Washington and Moscow',
      'Nuclear Test Ban Treaty signed 1963',
      'Crisis remains closest world came to nuclear war'
    ]
  },
  {
    id: 'lincoln-1865',
    year: 1865,
    title: 'Lincoln Assassination',
    shortDesc: 'President Lincoln is shot at Ford\'s Theatre, changing Reconstruction.',
    fullDesc: 'On April 14, 1865, John Wilkes Booth shot Abraham Lincoln at Ford\'s Theatre. Lincoln died the next morning, and Andrew Johnson\'s harsher Reconstruction shaped a different America.',
    era: 'Industrial',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/800px-Abraham_Lincoln_O-77_matte_collodion_print.jpg',
    realFacts: [
      'Andrew Johnson becomes president April 15, 1865',
      'Reconstruction era begins with harsh Black Codes',
      'Confederate leaders face minimal punishment',
      'Jim Crow laws emerge through 1870s-1880s',
      'Racial inequality entrenched for a century'
    ]
  },
  {
    id: 'titanic-1912',
    year: 1912,
    title: 'Titanic Sinks',
    shortDesc: 'The RMS Titanic strikes an iceberg and sinks, killing 1,500 people.',
    fullDesc: 'On April 15, 1912, the RMS Titanic sank after hitting an iceberg, killing over 1,500 passengers and crew — transforming maritime safety regulations worldwide.',
    era: 'Industrial',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/RMS_Titanic_3.jpg/800px-RMS_Titanic_3.jpg',
    realFacts: [
      '1,517 people die in the sinking',
      'SOLAS maritime safety regulations created 1914',
      'International Ice Patrol established',
      'Radio communication becomes mandatory on ships',
      'White Star Line never recovers financially'
    ]
  },
  {
    id: 'moon-1969',
    year: 1969,
    title: 'Moon Landing',
    shortDesc: 'Apollo 11 lands on the moon — humanity\'s greatest technological achievement.',
    fullDesc: 'On July 20, 1969, Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon, winning the Space Race and defining American technological supremacy.',
    era: 'Cold War',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/800px-Aldrin_Apollo_11_original.jpg',
    realFacts: [
      'Neil Armstrong first human to walk on Moon',
      'USA wins Space Race against Soviet Union',
      'Apollo program ends 1972 after 6 landings',
      'No humans return to Moon until 2025+',
      'Space exploration funding drops dramatically post-Apollo'
    ]
  },
  {
    id: 'ww1-1914',
    year: 1914,
    title: 'World War I Begins',
    shortDesc: 'Archduke Franz Ferdinand is assassinated, triggering the Great War.',
    fullDesc: 'On June 28, 1914, Archduke Franz Ferdinand was assassinated in Sarajevo. Within weeks, the alliance system pulled every major European power into a catastrophic war.',
    era: 'WWI/WWII',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/thirty/Archduke_Franz_Ferdinand_of_Austria.jpg/800px-Archduke_Franz_Ferdinand_of_Austria.jpg',
    realFacts: [
      '20 million people die in WWI 1914-1918',
      'Four empires collapse — Ottoman, Austro-Hungarian, Russian, German',
      'Treaty of Versailles humiliates Germany',
      'Conditions created directly lead to WWII',
      'Map of Europe completely redrawn'
    ]
  },
  {
    id: 'soviet-1991',
    year: 1991,
    title: 'Soviet Union Collapses',
    shortDesc: 'The USSR dissolves, ending the Cold War and reshaping global geopolitics.',
    fullDesc: 'On December 25, 1991, Mikhail Gorbachev resigned and the Soviet Union officially dissolved into 15 independent states, ending 45 years of Cold War.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Soviet_flag_being_lowered_in_the_Kremlin_December_25%2C_1991.jpg/800px-Soviet_flag_being_lowered_in_the_Kremlin_December_25%2C_1991.jpg',
    realFacts: [
      'USSR splits into 15 independent republics',
      'Russia inherits Soviet nuclear arsenal',
      'NATO expands eastward into former Soviet states',
      'Economic chaos causes life expectancy to drop in Russia',
      'USA becomes sole global superpower'
    ]
  },
]

export const ERAS = ['All', 'Ancient', 'Medieval', 'Renaissance', 'Industrial', 'WWI/WWII', 'Cold War', 'Modern']