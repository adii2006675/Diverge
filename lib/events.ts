import { MORE_EVENTS } from '@/lib/moreEvents'

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
    shortDesc: 'Al-Qaeda hijackers crash planes into the Twin Towers, killing nearly 3,000.',
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
    shortDesc: 'On the Titanics maiden voyage it unfortunately struck an iceberg and sank after only 2 hours.',
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
    shortDesc: 'An assassination in Sarajevo triggers a brutal war that ultimately kills 20 million people across Europe.',
    fullDesc: 'On June 28, 1914, Archduke Franz Ferdinand was assassinated in Sarajevo. Within weeks, the alliance system pulled every major European power into a catastrophic war.',
    era: 'WWI/WWII',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Archduke_Franz_Ferdinand_of_Austria_1914.jpg/800px-Archduke_Franz_Ferdinand_of_Austria_1914.jpg',
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
  {
    id: 'gutenberg-1440',
    year: 1440,
    title: 'Gutenberg Printing Press',
    shortDesc: 'Johannes Gutenberg invents the movable-type printing press, revolutionizing information.',
    fullDesc: 'Around 1440, Johannes Gutenberg developed the printing press with movable metal type in Mainz, Germany, making mass production of books possible for the first time.',
    era: 'Renaissance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Gutenberg.jpg/800px-Gutenberg.jpg',
    realFacts: [
      'Gutenberg Bible printed around 1455',
      'Literacy rates rise dramatically across Europe',
      'Reformation pamphlets spread rapidly by 1520s',
      'Scientific Revolution accelerated by shared knowledge',
      'Printing reaches most of Europe within 50 years'
    ]
  },
  {
    id: 'columbus-1492',
    year: 1492,
    title: 'Columbus Reaches the Americas',
    shortDesc: 'Christopher Columbus lands in the Caribbean, beginning European colonization of the Americas.',
    fullDesc: 'On October 12, 1492, Columbus and his crew landed in the Bahamas, opening the door to centuries of European colonization, conquest, and the transatlantic slave trade.',
    era: 'Renaissance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Christopher_Columbus%2C_by_Sebastiano_del_Piombo.jpg/800px-Christopher_Columbus%2C_by_Sebastiano_del_Piombo.jpg',
    realFacts: [
      'Spanish Empire expands across the Americas by 1500s',
      'Indigenous populations decline by up to 90% from disease',
      'Transatlantic slave trade begins within decades',
      'Columbian Exchange transforms global agriculture',
      'European colonial empires dominate for 400+ years'
    ]
  },
  {
    id: 'martin-luther-1517',
    year: 1517,
    title: 'Martin Luther and the Reformation',
    shortDesc: 'Martin Luther nails his 95 Theses to a church door, sparking the Protestant Reformation.',
    fullDesc: 'On October 31, 1517, Martin Luther posted his 95 Theses criticizing Catholic Church practices, igniting the Protestant Reformation and permanently splitting Western Christianity.',
    era: 'Renaissance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Lucas_Cranach_d.%C3%84._-_Martin_Luther%2C_1528.jpg/800px-Lucas_Cranach_d.%C3%84._-_Martin_Luther%2C_1528.jpg',
    realFacts: [
      'Luther excommunicated by the Pope in 1521',
      'Protestant denominations spread across Northern Europe',
      'Thirty Years War later kills 8 million people',
      'Catholic Counter-Reformation launched in response',
      'Religious diversity in Europe permanently established'
    ]
  },
  {
    id: 'french-revolution-1789',
    year: 1789,
    title: 'French Revolution Begins',
    shortDesc: 'The storming of the Bastille ignites a revolution that topples the French monarchy.',
    fullDesc: 'On July 14, 1789, revolutionaries stormed the Bastille prison in Paris, beginning a decade of upheaval that ended the French monarchy and reshaped European politics.',
    era: 'Industrial',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Anonymous_-_Prise_de_la_Bastille.jpg/800px-Anonymous_-_Prise_de_la_Bastille.jpg',
    realFacts: [
      'King Louis XVI executed by guillotine in 1793',
      'Reign of Terror kills tens of thousands 1793-1794',
      'Napoleon Bonaparte rises to power by 1799',
      'Napoleonic Wars engulf Europe for over a decade',
      'Modern concepts of nationalism and citizenship emerge'
    ]
  },
  {
    id: 'american-independence-1776',
    year: 1776,
    title: 'US Declaration of Independence',
    shortDesc: 'The thirteen American colonies declare independence from British rule.',
    fullDesc: 'On July 4, 1776, the Continental Congress adopted the Declaration of Independence, formally breaking from Great Britain and founding what would become the United States.',
    era: 'Industrial',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Declaration_of_Independence_%281819%29%2C_by_John_Trumbull.jpg/800px-Declaration_of_Independence_%281819%29%2C_by_John_Trumbull.jpg',
    realFacts: [
      'American Revolutionary War ends in 1783',
      'US Constitution ratified in 1788',
      'George Washington becomes first president 1789',
      'Democratic republics inspire movements worldwide',
      'United States grows into a global superpower'
    ]
  },
  {
    id: 'magna-carta-1215',
    year: 1215,
    title: 'Magna Carta Signed',
    shortDesc: 'King John of England is forced to sign the Magna Carta, limiting royal power.',
    fullDesc: 'On June 15, 1215, English barons forced King John to sign the Magna Carta, establishing the principle that even a king is subject to the law — a cornerstone of modern democracy.',
    era: 'Medieval',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Magna_Carta_%28British_Library_Cotton_MS_Augustus_II.106%29.jpg/800px-Magna_Carta_%28British_Library_Cotton_MS_Augustus_II.106%29.jpg',
    realFacts: [
      'Parliament system develops from Magna Carta principles',
      'Habeas corpus rights trace back to this document',
      'US Constitution directly influenced by Magna Carta',
      'Only a few original 1215 copies survive today',
      'Rule of law becomes foundational Western legal principle'
    ]
  },
  {
    id: 'black-death-1347',
    year: 1347,
    title: 'The Black Death Arrives',
    shortDesc: 'The bubonic plague reaches Europe, killing up to half the population.',
    fullDesc: 'In 1347, the Black Death arrived in Europe via trade ships, killing an estimated 25-50 million people over the next several years and reshaping the continent\'s economy and society.',
    era: 'Medieval',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/1657_Illustration_of_the_Plague_of_London.jpg/800px-1657_Illustration_of_the_Plague_of_London.jpg',
    realFacts: [
      'Up to 50% of Europe\'s population dies within a few years',
      'Labor shortages weaken the feudal system permanently',
      'Wages rise for surviving peasants and workers',
      'Quarantine practices originate from plague response',
      'Recurring plague outbreaks continue for centuries'
    ]
  },
  {
    id: 'fall-of-constantinople-1453',
    year: 1453,
    title: 'Fall of Constantinople',
    shortDesc: 'The Ottoman Empire conquers Constantinople, ending the Byzantine Empire.',
    fullDesc: 'On May 29, 1453, Ottoman forces under Sultan Mehmed II captured Constantinople, ending the 1,000-year-old Byzantine Empire and reshaping the balance of power between East and West.',
    era: 'Medieval',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Siege_of_Constantinople_1453_map-en.svg/800px-Siege_of_Constantinople_1453_map-en.svg.png',
    realFacts: [
      'Byzantine Empire ends after over 1,000 years',
      'Constantinople renamed Istanbul under Ottoman rule',
      'Greek scholars flee west, fueling the Renaissance',
      'European powers seek new trade routes to Asia',
      'Ottoman Empire becomes a dominant world power'
    ]
  },
  {
    id: 'genghis-khan-1206',
    year: 1206,
    title: 'Genghis Khan Unites the Mongols',
    shortDesc: 'Genghis Khan is declared ruler of a unified Mongol nation, launching history\'s largest land empire.',
    fullDesc: 'In 1206, Temujin was proclaimed Genghis Khan, uniting the Mongol tribes and beginning a series of conquests that would create the largest contiguous land empire in history.',
    era: 'Medieval',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/YuanEmperorAlbumGenghisPortrait.jpg/800px-YuanEmperorAlbumGenghisPortrait.jpg',
    realFacts: [
      'Mongol Empire eventually spans from Korea to Hungary',
      'Silk Road trade flourishes under Mongol protection',
      'Mongol conquests kill an estimated 40 million people',
      'Empire fractures into khanates after Genghis Khan\'s death',
      'Cultural and technological exchange accelerates across Eurasia'
    ]
  },
  {
    id: 'financial-crisis-2008',
    year: 2008,
    title: '2008 Global Financial Crisis',
    shortDesc: 'The collapse of Lehman Brothers triggers the worst financial crisis since the Great Depression.',
    fullDesc: 'In September 2008, the collapse of Lehman Brothers and the subprime mortgage crisis triggered a global financial meltdown, wiping out trillions in wealth and causing a worldwide recession.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Lehman_Brothers_Times_Square_by_David_Shankbone.jpg/800px-Lehman_Brothers_Times_Square_by_David_Shankbone.jpg',
    realFacts: [
      'Lehman Brothers files largest bankruptcy in US history',
      'US government bails out banks with $700 billion TARP program',
      'Global unemployment rises sharply through 2009-2010',
      'Dodd-Frank financial reform passed in 2010',
      'Millions lose homes to foreclosure worldwide'
    ]
  },
  {
    id: 'iphone-2007',
    year: 2007,
    title: 'The iPhone is Released',
    shortDesc: 'Apple unveils the iPhone, permanently transforming technology and communication.',
    fullDesc: 'On January 9, 2007, Steve Jobs introduced the iPhone, combining a phone, iPod, and internet device into one product that would launch the modern smartphone era.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/IPhone_1st_Gen.svg/800px-IPhone_1st_Gen.svg.png',
    realFacts: [
      'Smartphone adoption exceeds 6 billion users globally by 2020s',
      'App Store launches in 2008, creating a new industry',
      'Social media usage explodes on mobile devices',
      'Apple becomes one of the world\'s most valuable companies',
      'Mobile internet traffic surpasses desktop by mid-2010s'
    ]
  },
  {
    id: 'covid-2020',
    year: 2020,
    title: 'COVID-19 Pandemic',
    shortDesc: 'A novel coronavirus spreads worldwide, triggering lockdowns and closures.',
    fullDesc: 'Starting in early 2020, COVID-19 spread worldwide, prompting unprecedented lockdowns, remote work shifts, and a rapid vaccine development effort that killed millions and disrupted the global economy.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/SARS-CoV-2_without_background.png/800px-SARS-CoV-2_without_background.png',
    realFacts: [
      'Over 7 million confirmed COVID-19 deaths worldwide',
      'mRNA vaccines developed and deployed within a year',
      'Remote work becomes permanent for millions of workers',
      'Global supply chains disrupted for years afterward',
      'Global GDP contracts sharply in 2020'
    ]
  },
  {
    id: 'internet-1991',
    year: 1991,
    title: 'The World Wide Web Goes Public',
    shortDesc: 'Tim Berners-Lee releases the World Wide Web to the public, transforming human communication.',
    fullDesc: 'In August 1991, Tim Berners-Lee made the World Wide Web publicly available, laying the foundation for the modern internet and one of the most transformative technologies in history.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Tim_Berners-Lee_%282008%29.jpg/800px-Tim_Berners-Lee_%282008%29.jpg',
    realFacts: [
      'Over 5 billion people use the internet by the 2020s',
      'E-commerce grows into a multi-trillion dollar industry',
      'Social media platforms reshape politics and culture',
      'Dot-com bubble bursts in 2000-2001',
      'Internet becomes essential global infrastructure'
    ]
  },
  {
    id: 'wright-brothers-1903',
    year: 1903,
    title: 'The Wright Brothers\' First Flight',
    shortDesc: 'Orville and Wilbur Wright achieve the first powered, controlled flight at Kitty Hawk.',
    fullDesc: 'On December 17, 1903, the Wright brothers flew the first successful powered aircraft at Kitty Hawk, North Carolina, launching the age of aviation.',
    era: 'Industrial',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/First_flight2.jpg/800px-First_flight2.jpg',
    realFacts: [
      'Commercial aviation industry emerges within decades',
      'Airplanes transform warfare starting in WWI',
      'Transatlantic flight achieved by Lindbergh in 1927',
      'Jet age begins after WWII',
      'Air travel connects the globe within a century'
    ]
  },
  {
    id: 'transatlantic-slave-trade-1619',
    year: 1619,
    title: 'Transatlantic Slave Trade Begins in America',
    shortDesc: 'The first recorded enslaved Africans arrive in English North America, beginning centuries of forced labor and injustice.',
    fullDesc: 'In August 1619, a ship carrying enslaved Africans arrived at Point Comfort, Virginia, marking a documented start of chattel slavery in English North America that would last over 240 years.',
    era: 'Renaissance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Slave_traders_of_Gore.jpg/800px-Slave_traders_of_Gore.jpg',
    realFacts: [
      'Over 12 million Africans forcibly transported across the Atlantic',
      'Slavery legally continues in the US until 1865',
      '13th Amendment abolishes slavery after the Civil War',
      'Jim Crow segregation follows for another century',
      'Legacy of slavery still shapes American society today'
    ]
  },
  {
    id: 'womens-suffrage-1920',
    year: 1920,
    title: 'Women Win the Right to Vote in the US',
    shortDesc: 'The 19th Amendment is ratified, granting American women the constitutional right to vote after decades of activism.',
    fullDesc: 'On August 18, 1920, the 19th Amendment was ratified, guaranteeing American women the right to vote after over 70 years of organized suffrage activism and protest.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Woman_suffrage_headquarters%2C_Cleveland%2C_Ohio.jpg/800px-Woman_suffrage_headquarters%2C_Cleveland%2C_Ohio.jpg',
    realFacts: [
      'Amendment passes Congress in 1919 after decades of campaigning',
      'Many women of color still face voting barriers for decades',
      'Voting Rights Act of 1965 later addresses remaining barriers',
      'Women\'s political representation grows steadily afterward',
      'Movement inspires suffrage efforts in other countries'
    ]
  },
  {
    id: 'hiroshima-1945',
    year: 1945,
    title: 'Atomic Bombing of Hiroshima',
    shortDesc: 'The United States drops the first atomic bomb used in war, killing tens of thousands instantly and ending World War II days later.',
    fullDesc: 'On August 6, 1945, the United States dropped an atomic bomb on Hiroshima, Japan, killing an estimated 70,000 people instantly. Japan surrendered days after a second bomb hit Nagasaki.',
    era: 'WWI/WWII',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Atomic_cloud_over_Hiroshima.jpg/800px-Atomic_cloud_over_Hiroshima.jpg',
    realFacts: [
      'Japan formally surrenders on September 2, 1945',
      'World War II ends after nearly 6 years of global conflict',
      'Nuclear arms race defines the Cold War for decades',
      'Hiroshima and Nagasaki remain the only wartime nuclear attacks',
      'United Nations founded months later to prevent future wars'
    ]
  },
  {
    id: 'israel-founded-1948',
    year: 1948,
    title: 'The State of Israel is Founded',
    shortDesc: 'Israel declares independence, triggering war with neighboring Arab states and reshaping the modern Middle East.',
    fullDesc: 'On May 14, 1948, Israel declared independence following the UN partition plan for British Mandate Palestine. War broke out immediately with neighboring Arab states, displacing hundreds of thousands.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Flag_of_Israel.svg/800px-Flag_of_Israel.svg.png',
    realFacts: [
      'Over 700,000 Palestinians displaced during the 1948 war',
      'Armistice agreements signed with neighboring states in 1949',
      'Region sees repeated conflicts over following decades',
      'Oslo Accords attempt peace framework in the 1990s',
      'Israeli-Palestinian conflict remains unresolved today'
    ]
  },
  {
    id: 'mlk-march-1963',
    year: 1963,
    title: 'March on Washington',
    shortDesc: 'MLK delivers his "I Have a Dream" speech to 250,000 in Washington, D.C. He was then later',
    fullDesc: 'On August 28, 1963, over 250,000 people gathered in Washington D.C. as Martin Luther King Jr. delivered his "I Have a Dream" speech, galvanizing support for civil rights legislation.',
    era: 'Cold War',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Martin_Luther_King_-_March_on_Washington.jpg/800px-Martin_Luther_King_-_March_on_Washington.jpg',
    realFacts: [
      'Civil Rights Act passes Congress in 1964',
      'Voting Rights Act follows in 1965',
      'King assassinated in Memphis in 1968',
      'Movement inspires civil rights efforts worldwide',
      'Legal segregation formally ends across the United States'
    ]
  },
  {
    id: 'blm-2013',
    year: 2013,
    title: 'Black Lives Matter Movement Begins',
    shortDesc: 'The Black Lives Matter movement emerges after the acquittal of George Zimmerman, sparking a new era of activism against police violence.',
    fullDesc: 'In 2013, following the acquittal in the killing of Trayvon Martin, activists founded the Black Lives Matter movement, which grew into a major force addressing police violence and racial injustice.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Black_Lives_Matter_protesters_march_in_Washington.jpg/800px-Black_Lives_Matter_protesters_march_in_Washington.jpg',
    realFacts: [
      'Movement grows into one of the largest in US history by 2020',
      'George Floyd\'s death in 2020 sparks global protests',
      'Police reform debates intensify across many countries',
      'Movement influences corporate and political policy',
      'Remains an active and evolving social movement today'
    ]
  },
  {
    id: 'berlin-olympics-1936',
    year: 1936,
    title: 'Jesse Owens Defies Hitler at the Berlin Olympics',
    shortDesc: 'Jesse Owens wins four gold medals in Nazi Germany, undermining Hitler\'s claims of Aryan racial superiority in front of the world.',
    fullDesc: 'At the 1936 Berlin Olympics, African American athlete Jesse Owens won four gold medals, directly challenging Nazi Germany\'s propaganda of Aryan racial superiority on a global stage.',
    era: 'WWI/WWII',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Jesse_Owens1.jpg/800px-Jesse_Owens1.jpg',
    realFacts: [
      'Owens remains most successful athlete of the 1936 Games',
      'Nazi propaganda efforts largely fail internationally',
      'Owens still faces racial discrimination back home in the US',
      'His achievement becomes a lasting symbol against racism',
      'World War II begins just three years later'
    ]
  },
  {
    id: 'india-independence-1947',
    year: 1947,
    title: 'India Gains Independence',
    shortDesc: 'India becomes independent from British rule, immediately followed by the chaotic and bloody partition into India and Pakistan.',
    fullDesc: 'On August 15, 1947, India gained independence from British colonial rule after decades of resistance led by Mahatma Gandhi. Partition into India and Pakistan followed almost immediately, causing mass displacement and violence.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/INA_soldiers_hoisting_the_flag_of_azad_hind.jpg/800px-INA_soldiers_hoisting_the_flag_of_azad_hind.jpg',
    realFacts: [
      'Partition displaces an estimated 15 million people',
      'Hundreds of thousands die in partition-related violence',
      'Gandhi assassinated just months later in January 1948',
      'India becomes the world\'s largest democracy',
      'India-Pakistan tensions continue for decades afterward'
    ]
  },
  {
    id: 'apartheid-ends-1994',
    year: 1994,
    title: 'Apartheid Ends in South Africa',
    shortDesc: 'Nelson Mandela is elected president in South Africa\'s first fully democratic election, ending decades of legalized racial segregation.',
    fullDesc: 'In April 1994, South Africa held its first fully democratic election, electing Nelson Mandela as president and formally ending 46 years of apartheid, a system of legalized racial segregation.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Nelson_Mandela-2008_%28edit%29.jpg/800px-Nelson_Mandela-2008_%28edit%29.jpg',
    realFacts: [
      'Mandela spent 27 years imprisoned before his release in 1990',
      'Truth and Reconciliation Commission formed to address past abuses',
      'South Africa remains one of the most unequal countries economically',
      'Mandela serves a single term, stepping down voluntarily in 1999',
      'Event becomes a global symbol of peaceful political transition'
    ]
  },
  {
    id: 'chernobyl-1986',
    year: 1986,
    title: 'Chernobyl Nuclear Disaster',
    shortDesc: 'A reactor explosion at the Chernobyl plant releases massive radiation across Europe, becoming the worst nuclear accident in history.',
    fullDesc: 'On April 26, 1986, a reactor at the Chernobyl Nuclear Power Plant in Soviet Ukraine exploded, releasing radioactive material across Europe and forcing the permanent evacuation of an entire city.',
    era: 'Cold War',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Chernobyl_Disaster.jpg/800px-Chernobyl_Disaster.jpg',
    realFacts: [
      'Nearby city of Pripyat evacuated and never resettled',
      'Exclusion zone remains largely uninhabited today',
      'Disaster accelerates distrust in Soviet government transparency',
      'Global nuclear safety standards significantly tightened afterward',
      'Site remains a major subject of scientific study today'
    ]
  },
  {
    id: 'boston-tea-party-1773',
    year: 1773,
    title: 'The Boston Tea Party',
    shortDesc: 'American colonists dump British tea into Boston Harbor to protest taxation without representation, escalating toward revolution.',
    fullDesc: 'On December 16, 1773, colonists boarded British ships and dumped 342 chests of tea into Boston Harbor, protesting taxation without representation and pushing the colonies closer to war.',
    era: 'Industrial',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Boston_Tea_Party_Currier_colored.jpg/800px-Boston_Tea_Party_Currier_colored.jpg',
    realFacts: [
      'Britain responds with the punitive Coercive Acts in 1774',
      'First Continental Congress convenes in response',
      'American Revolutionary War begins in 1775',
      'Event becomes a lasting symbol of political protest',
      'Colonies formally declare independence the following year'
    ]
  },
  {
    id: 'great-depression-1929',
    year: 1929,
    title: 'The Great Depression Begins',
    shortDesc: 'The stock market crashes, triggering the worst depression in modern history.',
    fullDesc: 'On October 29, 1929, the US stock market crashed, wiping out billions in wealth and triggering the Great Depression, a decade-long global economic crisis with massive unemployment.',
    era: 'WWI/WWII',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Crowd_outside_nyse.jpg/800px-Crowd_outside_nyse.jpg',
    realFacts: [
      'US unemployment reaches nearly 25% by 1933',
      'New Deal programs launched to stabilize the economy',
      'Depression deepens political instability across Europe',
      'Economic hardship contributes to conditions leading to WWII',
      'Crisis reshapes government economic policy for decades'
    ]
  },
  {
    id: 'pearl-harbor-1941',
    year: 1941,
    title: 'Attack on Pearl Harbor',
    shortDesc: 'Japan launches a surprise attack on the US naval base at Pearl Harbor, bringing America directly into World War II.',
    fullDesc: 'On December 7, 1941, Japanese forces launched a surprise attack on the US naval base at Pearl Harbor, killing over 2,400 Americans and prompting the United States to enter World War II.',
    era: 'WWI/WWII',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/USS_Arizona_Pearl_Harbor.jpg/800px-USS_Arizona_Pearl_Harbor.jpg',
    realFacts: [
      'United States declares war on Japan the next day',
      'Germany and Italy declare war on the US days later',
      'Japanese American internment begins in 1942',
      'US industrial mobilization rapidly accelerates',
      'War in the Pacific continues until Japan surrenders in 1945'
    ]
  },
  {
    id: 'salem-witch-trials-1692',
    year: 1692,
    title: 'The Salem Witch Trials',
    shortDesc: 'Mass hysteria in colonial Massachusetts leads to the execution of twenty people accused of witchcraft, a lasting symbol of injustice.',
    fullDesc: 'Between 1692 and 1693, mass hysteria in Salem, Massachusetts led to over 200 accusations of witchcraft, resulting in the execution of twenty people and becoming a lasting symbol of mass injustice.',
    era: 'Renaissance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Salem_witch2.jpg/800px-Salem_witch2.jpg',
    realFacts: [
      'Twenty people executed, most by hanging',
      'Massachusetts formally apologizes centuries later',
      'Event remains a symbol of mass hysteria and injustice',
      'Legal reforms follow to prevent similar miscarriages of justice',
      'Trials inspire numerous works of literature and film'
    ]
  },
  {
    id: 'first-computer-1946',
    year: 1946,
    title: 'The First General-Purpose Computer',
    shortDesc: 'ENIAC, the first general-purpose electronic computer, is unveiled, launching the digital age that would transform the entire world.',
    fullDesc: 'In February 1946, ENIAC, the first general-purpose electronic computer, was unveiled to the public, marking the beginning of the digital computing revolution that would reshape every industry.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Two_women_operating_ENIAC.jpg/800px-Two_women_operating_ENIAC.jpg',
    realFacts: [
      'ENIAC weighs nearly 30 tons and fills an entire room',
      'Personal computers become common by the 1980s',
      'Internet emerges from computing advances by 1990s',
      'Modern smartphones now vastly outperform ENIAC',
      'Computing becomes central to nearly every industry'
    ]
  },
  {
    id: 'vaccine-smallpox-1796',
    year: 1796,
    title: 'The First Vaccine is Developed',
    shortDesc: 'Edward Jenner develops the first successful vaccine against smallpox, a disease that had killed hundreds of millions throughout history.',
    fullDesc: 'In 1796, English physician Edward Jenner developed the first successful vaccine, using cowpox to protect against smallpox, laying the foundation for modern immunology and disease prevention.',
    era: 'Industrial',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Edward_Jenner._Oil_painting_by_J._R._Smith%2C_1800_%3F.jpg/800px-Edward_Jenner._Oil_painting_by_J._R._Smith%2C_1800_%3F.jpg',
    realFacts: [
      'Smallpox vaccination spreads across Europe within decades',
      'World Health Organization declares smallpox eradicated in 1980',
      'Vaccination becomes a cornerstone of modern public health',
      'Technique later applied to develop countless other vaccines',
      'Smallpox remains the only human disease fully eradicated'
    ]
  },
  {
    id: 'einstein-relativity-1905',
    year: 1905,
    title: 'Einstein Publishes the Theory of Relativity',
    shortDesc: 'Albert Einstein publishes his theory of special relativity, fundamentally changing our understanding of space, time, and energy.',
    fullDesc: 'In 1905, Albert Einstein published his theory of special relativity, introducing the equation E=mc² and fundamentally transforming physics, laying groundwork for future nuclear and space technology.',
    era: 'Industrial',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/800px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
    realFacts: [
      'General relativity follows in 1915, redefining gravity',
      'GPS satellites rely on relativity corrections to function',
      'Einstein wins the Nobel Prize in Physics in 1921',
      'His theories underpin nuclear energy and weapons development',
      'Remains one of the most influential scientists in history'
    ]
  },
  {
    id: 'renaissance-davinci-1503',
    year: 1503,
    title: 'Leonardo da Vinci Paints the Mona Lisa',
    shortDesc: 'Leonardo da Vinci begins painting the Mona Lisa, a work that becomes the most famous and studied painting in the world.',
    fullDesc: 'Around 1503, Leonardo da Vinci began painting the Mona Lisa in Florence, Italy. The portrait would go on to become the most recognized and studied piece of art in human history.',
    era: 'Renaissance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    realFacts: [
      'Painting now resides permanently at the Louvre in Paris',
      'Stolen in 1911, sparking worldwide media attention',
      'Attracts millions of visitors to the Louvre annually',
      'Considered a defining work of the Italian Renaissance',
      'Remains one of the most valuable paintings ever created'
    ]
  },
  {
    id: 'suez-canal-1869',
    year: 1869,
    title: 'The Suez Canal Opens',
    shortDesc: 'The Suez Canal opens in Egypt, connecting the Mediterranean and Red Seas and transforming global trade and naval power.',
    fullDesc: 'On November 17, 1869, the Suez Canal opened in Egypt, creating a direct sea route between Europe and Asia and dramatically reshaping global trade, military strategy, and colonial power.',
    era: 'Industrial',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Suez_Canal_1875.jpg/800px-Suez_Canal_1875.jpg',
    realFacts: [
      'Canal cuts sea travel between Europe and Asia dramatically',
      'Becomes a major strategic asset during global conflicts',
      'Egypt nationalizes the canal in 1956, sparking a crisis',
      'Remains one of the world\'s busiest shipping routes today',
      'Handles roughly 12% of global trade volume'
    ]
  },
  {
    id: 'rwandan-genocide-1994',
    year: 1994,
    title: 'The Rwandan Genocide',
    shortDesc: 'Ethnic violence in Rwanda kills an estimated 800,000 people in just 100 days, becoming one of the fastest genocides in history.',
    fullDesc: 'Between April and July 1994, ethnic violence in Rwanda led to the killing of an estimated 800,000 Tutsi and moderate Hutu people, one of the most rapid genocides in modern history.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Genocide_Memorial_Center_Kigali%2C_Rwanda.jpg/800px-Genocide_Memorial_Center_Kigali%2C_Rwanda.jpg',
    realFacts: [
      'International community widely criticized for inaction',
      'Rwanda establishes community courts to process perpetrators',
      'Country undergoes significant reconciliation efforts afterward',
      'United Nations peacekeeping doctrine reformed as a result',
      'Rwanda achieves notable economic recovery in following decades'
    ]
  },
  {
    id: 'apollo13-1970',
    year: 1970,
    title: 'Apollo 13 Crisis',
    shortDesc: 'An oxygen tank explosion cripples Apollo 13 en route to the moon, forcing a dramatic and successful emergency return to Earth.',
    fullDesc: 'In April 1970, an oxygen tank explosion crippled the Apollo 13 spacecraft en route to the Moon. NASA engineers and astronauts worked together to bring the crew safely back to Earth.',
    era: 'Cold War',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Apollo_13_Lifting_Off.jpg/800px-Apollo_13_Lifting_Off.jpg',
    realFacts: [
      'All three astronauts return safely to Earth',
      'Mission dubbed a "successful failure" by NASA',
      'Crisis leads to major redesigns of spacecraft safety systems',
      'Story later dramatized in a major Hollywood film',
      'Remains one of NASA\'s most celebrated engineering triumphs'
    ]
  },
  {
    id: 'arab-spring-2011',
    year: 2011,
    title: 'The Arab Spring',
    shortDesc: 'A wave of pro-democracy uprisings sweeps the Middle East and North Africa, toppling several long-standing governments.',
    fullDesc: 'Starting in December 2010, mass protests spread across the Arab world demanding political reform, toppling leaders in Tunisia, Egypt, Libya, and Yemen and triggering ongoing conflict in Syria.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Tahrir_Square_during_8_February_2011.jpg/800px-Tahrir_Square_during_8_February_2011.jpg',
    realFacts: [
      'Tunisian and Egyptian presidents forced from power in 2011',
      'Syrian civil war emerges from the unrest and continues for over a decade',
      'Millions displaced across the region as refugees',
      'Libya descends into prolonged instability after Gaddafi\'s fall',
      'Movement inspired by earlier democratic uprisings worldwide'
    ]
  },
  {
    id: 'obama-2008',
    year: 2008,
    title: 'Barack Obama Elected President',
    shortDesc: 'Barack Obama becomes the first Black president of the United States, a historic milestone amid a global financial crisis.',
    fullDesc: 'In November 2008, Barack Obama was elected the 44th President of the United States, becoming the first Black president in American history during the depths of the global financial crisis.',
    era: 'Politics',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Obama_portrait_crop.jpg/800px-Obama_portrait_crop.jpg',
    realFacts: [
      'Obama serves two terms from 2009 to 2017',
      'Affordable Care Act passes in 2010, reshaping US healthcare',
      'US economy gradually recovers from the 2008 financial crisis',
      'Osama bin Laden killed by US forces in 2011',
      'Marks a significant milestone in American racial history'
    ]
  },
  {
    id: 'facebook-2004',
    year: 2004,
    title: 'Facebook Launches',
    shortDesc: 'Mark Zuckerberg launches Facebook from his Harvard dorm room, eventually growing into the world\'s largest social network.',
    fullDesc: 'In February 2004, Mark Zuckerberg launched Facebook from his Harvard dorm room. It grew from a college networking site into a global platform connecting billions of people worldwide.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/800px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg',
    realFacts: [
      'Facebook reaches over 3 billion monthly users by the 2020s',
      'Social media reshapes politics, journalism, and advertising',
      'Company rebrands to Meta in 2021',
      'Facebook faces major scrutiny over data privacy and misinformation',
      'Platform becomes a defining feature of modern communication'
    ]
  },
  {
    id: 'fukushima-2011',
    year: 2011,
    title: 'Fukushima Nuclear Disaster',
    shortDesc: 'A massive earthquake and tsunami trigger a nuclear meltdown in Japan, becoming the worst nuclear accident since Chernobyl.',
    fullDesc: 'On March 11, 2011, a magnitude 9.0 earthquake and resulting tsunami struck Japan, causing a meltdown at the Fukushima Daiichi Nuclear Power Plant and forcing mass evacuations.',
    era: 'Modern',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Fukushima_I_by_Digital_Globe.jpg/800px-Fukushima_I_by_Digital_Globe.jpg',
    realFacts: [
      'Earthquake and tsunami kill nearly 20,000 people',
      'Over 150,000 residents evacuated from the surrounding area',
      'Disaster prompts global reevaluation of nuclear energy policy',
      'Germany announces phase-out of nuclear power in response',
      'Decommissioning of the plant expected to take decades'
    ]
  },
  {
    id: 'brexit-2016',
    year: 2016,
    title: 'Brexit Referendum',
    shortDesc: 'The United Kingdom votes to leave the European Union, marking a historic shift in European politics and trade.',
    fullDesc: 'In June 2016, the United Kingdom voted in a referendum to leave the European Union, a decision that reshaped British politics, trade relationships, and European unity for years afterward.',
    era: 'Politics',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Europe.svg/800px-Flag_of_Europe.svg.png',
    realFacts: [
      'UK formally leaves the EU in January 2020',
      'Referendum passes with 52% voting to leave',
      'Prompts years of complex trade negotiations with the EU',
      'Contributes to political instability across multiple UK governments',
      'Sparks debate over Scottish independence and Irish border issues'
    ]
  },
  {
    id: 'musk-trillionaire-2026',
    year: 2026,
    title: 'Elon Musk Becomes the World\'s First Trillionaire',
    shortDesc: 'SpaceX goes public in a record-breaking IPO, pushing Elon Musk\'s net worth past one trillion dollars for the first time in history.',
    fullDesc: 'On June 12, 2026, SpaceX began trading on the Nasdaq, and the surge in its stock price pushed Elon Musk\'s net worth past one trillion dollars, making him the first person in history to reach trillionaire status.',
    era: 'Business',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Elon_Musk_Royal_Society_%28crop2%29.jpg/800px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
    realFacts: [
      'SpaceX IPO valued the company at nearly $2 trillion on its first trading day',
      'Musk owned roughly 42 percent of SpaceX at the time of the listing',
      'His fortune had already been boosted for years by his stake in Tesla',
      'SpaceX\'s valuation continued climbing past $2.5 trillion within days',
      'Event was widely covered as an unprecedented milestone in personal wealth'
    ]
  },
]

export const ANCIENT_EVENTS: HistoricalEvent[] = [
  {
    id: 'pyramids-2560bc',
    year: -2560,
    title: 'The Great Pyramid is Built',
    shortDesc: 'Ancient Egyptians complete the Great Pyramid of Giza, a feat of engineering that still baffles historians today.',
    fullDesc: 'Around 2560 BC, Egyptian workers completed the Great Pyramid of Giza for Pharaoh Khufu, using an estimated 2.3 million stone blocks and advanced engineering techniques still studied today.',
    era: 'Ancient',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/800px-Kheops-Pyramid.jpg',
    realFacts: [
      'Pyramid stood as tallest man-made structure for 3,800 years',
      'Built using an estimated 20,000 workers over two decades',
      'Aligned with extraordinary precision to true north',
      'Egyptian civilization continues for another 2,500 years',
      'Structure still stands largely intact today'
    ]
  },
  {
    id: 'rome-founded-753bc',
    year: -753,
    title: 'The Founding of Rome',
    shortDesc: 'According to legend, Romulus founds the city of Rome, beginning a civilization that would rule much of the ancient world.',
    fullDesc: 'Traditional Roman history places the founding of Rome in 753 BC. Over the next centuries, Rome grew from a small settlement into an empire spanning three continents.',
    era: 'Ancient',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/She-wolf_suckles_Romulus_and_Remus.jpg/800px-She-wolf_suckles_Romulus_and_Remus.jpg',
    realFacts: [
      'Roman Empire eventually spans 2 million square miles',
      'Roman law shapes legal systems still used today',
      'Latin evolves into modern Romance languages',
      'Western Roman Empire falls in 476 AD',
      'Roman engineering influences architecture for centuries'
    ]
  },
  {
    id: 'code-hammurabi-1754bc',
    year: -1754,
    title: 'The Code of Hammurabi',
    shortDesc: 'Babylonian king Hammurabi establishes one of the earliest and most complete written legal codes in human history.',
    fullDesc: 'Around 1754 BC, King Hammurabi of Babylon inscribed a comprehensive set of laws on a stone stele, covering trade, family, and criminal justice, establishing "an eye for an eye" as a legal principle.',
    era: 'Ancient',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/P1050763_Louvre_code_Hammurabi_face_rwk.JPG/800px-P1050763_Louvre_code_Hammurabi_face_rwk.JPG',
    realFacts: [
      'Contains 282 laws covering nearly every aspect of daily life',
      'One of the earliest deciphered writings of significant length',
      'Stele now housed in the Louvre Museum in Paris',
      'Establishes early legal principles still referenced today',
      'Provides major insight into ancient Mesopotamian society'
    ]
  },
  {
    id: 'buddha-563bc',
    year: -563,
    title: 'Birth of Siddhartha Gautama',
    shortDesc: 'Siddhartha Gautama is born in ancient India, later becoming the Buddha and founding one of the world\'s major religions.',
    fullDesc: 'Around 563 BC, Siddhartha Gautama was born in present-day Nepal. He would later achieve enlightenment and found Buddhism, a religion and philosophy that spread across Asia and the world.',
    era: 'Ancient',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Buddha_in_Sarnath_Museum_%28Dhammajak_Mutra%29.jpg/800px-Buddha_in_Sarnath_Museum_%28Dhammajak_Mutra%29.jpg',
    realFacts: [
      'Buddhism spreads across Asia over the following centuries',
      'Today practiced by roughly 500 million people worldwide',
      'Influences art, philosophy, and culture across many nations',
      'Buddhist teachings emphasize meditation and the end of suffering',
      'Major world religion still widely practiced today'
    ]
  },
  {
    id: 'alexander-great-336bc',
    year: -336,
    title: 'Alexander the Great Takes the Throne',
    shortDesc: 'Alexander the Great becomes king of Macedon at age 20, beginning conquests that would create one of history\'s largest empires.',
    fullDesc: 'In 336 BC, Alexander the Great became king of Macedon following his father\'s assassination. Over the next decade, he built an empire stretching from Greece to India before his death at 32.',
    era: 'Ancient',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Alexander_the_Great_mosaic.jpg/800px-Alexander_the_Great_mosaic.jpg',
    realFacts: [
      'Conquers the Persian Empire within a decade',
      'Empire stretches from Greece to modern-day India',
      'Spreads Greek culture across the conquered territories',
      'Dies at age 32, and his empire quickly fractures',
      'Considered one of history\'s greatest military commanders'
    ]
  },
  {
    id: 'first-olympics-776bc',
    year: -776,
    title: 'The First Olympic Games',
    shortDesc: 'The first recorded Olympic Games are held in ancient Greece, beginning a tradition that continues to this day.',
    fullDesc: 'In 776 BC, the first recorded Olympic Games were held in Olympia, Greece, as a religious festival honoring Zeus. The tradition would continue for over a thousand years in the ancient world.',
    era: 'Ancient',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Ancient_Olympia_Greece.jpg/800px-Ancient_Olympia_Greece.jpg',
    realFacts: [
      'Games held every four years for over a thousand years',
      'Originally featured only a single running event',
      'Banned in 393 AD by Roman Emperor Theodosius I',
      'Revived as the modern Olympics in 1896',
      'Tradition continues as one of the world\'s largest sporting events'
    ]
  },
  {
    id: 'great-wall-221bc',
    year: -221,
    title: 'Construction of the Great Wall Begins',
    shortDesc: 'Emperor Qin Shi Huang unifies China and begins connecting fortifications into what would become the Great Wall.',
    fullDesc: 'Around 221 BC, Qin Shi Huang unified China as its first emperor and ordered the connection of existing fortifications into a defensive wall, the beginning of what became the Great Wall of China.',
    era: 'Ancient',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/800px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
    realFacts: [
      'Wall is expanded and rebuilt by multiple dynasties over centuries',
      'Final Ming Dynasty sections stretch over 13,000 miles',
      'Qin Shi Huang also unifies Chinese writing and currency',
      'Now one of the most visited historical sites in the world',
      'Recognized as a UNESCO World Heritage Site'
    ]
  },
  ]


// Technology, business and crypto milestones.
export const TECH_EVENTS: HistoricalEvent[] = [
  {
    id: 'microsoft-1975',
    year: 1975,
    title: 'Microsoft is Founded',
    shortDesc: 'Bill Gates and Paul Allen start a software company in Albuquerque that would put a computer on every desk.',
    fullDesc: 'On April 4, 1975, Bill Gates and Paul Allen founded Microsoft in Albuquerque, New Mexico, to sell a BASIC interpreter for the Altair 8800 hobbyist computer. A 1981 deal to supply MS-DOS for the IBM PC turned it into the dominant force in personal computing.',
    era: 'Tech',
    image: '/events/microsoft-1975.jpg',
    realFacts: [
      'Founded April 4, 1975 in Albuquerque, New Mexico',
      'First product was a BASIC interpreter for the Altair 8800',
      'Licensed MS-DOS to IBM for the 1981 IBM PC',
      'Windows 1.0 shipped in 1985',
      'Reached a market value of $1 trillion in 2019'
    ]
  },
  {
    id: 'apple-founded-1976',
    year: 1976,
    title: 'Apple is Founded',
    shortDesc: 'Steve Jobs, Steve Wozniak and Ronald Wayne start Apple in a Los Altos garage.',
    fullDesc: 'On April 1, 1976, Steve Jobs, Steve Wozniak and Ronald Wayne founded Apple Computer to sell the Apple I, a hand-built circuit board Wozniak had designed. The follow-up Apple II, launched in 1977, became one of the first mass-produced personal computers.',
    era: 'Tech',
    image: '/events/apple-founded-1976.jpg',
    realFacts: [
      'Founded April 1, 1976 by Jobs, Wozniak and Wayne',
      'The Apple I sold for $666.66',
      'Wayne sold his share back for $800 within two weeks',
      'The Apple II launched in 1977',
      'Apple went public on December 12, 1980'
    ]
  },
  {
    id: 'macintosh-1984',
    year: 1984,
    title: 'The Macintosh is Unveiled',
    shortDesc: 'A Super Bowl ad and a mouse-driven computer reshape what a personal computer looks like.',
    fullDesc: 'Apple introduced the Macintosh on January 24, 1984, two days after a Ridley Scott-directed "1984" ad aired during the Super Bowl. Its graphical interface and mouse brought point-and-click computing to a mass audience, though early sales were slower than hoped.',
    era: 'Tech',
    image: '/events/macintosh-1984.jpg',
    realFacts: [
      'Introduced January 24, 1984',
      'The "1984" ad aired during Super Bowl XVIII on January 22',
      'Launch price was $2,495',
      'The original Macintosh had 128 KB of RAM',
      'Steve Jobs left Apple in 1985 after a power struggle'
    ]
  },
  {
    id: 'jobs-returns-1997',
    year: 1997,
    title: 'Steve Jobs Returns to Apple',
    shortDesc: 'Apple buys NeXT, brings back its co-founder, and is saved from near collapse.',
    fullDesc: 'Apple bought NeXT in late 1996, which brought Steve Jobs back to the company he had left in 1985. He became interim CEO in 1997, a time when Apple was close to running out of money, and went on to launch the iMac, iPod and iPhone.',
    era: 'Tech',
    image: '/events/jobs-returns-1997.jpg',
    realFacts: [
      'Apple acquired NeXT in December 1996 for about $429 million',
      'Jobs became interim CEO in September 1997',
      'Microsoft invested $150 million in Apple in August 1997',
      'The iMac launched in 1998',
      'Apple later introduced the iPod in 2001 and the iPhone in 2007'
    ]
  },
  {
    id: 'google-1998',
    year: 1998,
    title: 'Google is Founded',
    shortDesc: 'Two Stanford PhD students turn a better way of ranking web pages into a company.',
    fullDesc: 'Larry Page and Sergey Brin incorporated Google on September 4, 1998, starting out of a rented garage in Menlo Park, California. Their PageRank algorithm ranked pages by how many other pages linked to them, and the search engine quickly outpaced its rivals.',
    era: 'Tech',
    image: '/events/google-1998.jpg',
    realFacts: [
      'Incorporated September 4, 1998 by Larry Page and Sergey Brin',
      'Began in a garage in Menlo Park, California',
      'Search results were ranked by PageRank',
      'Google went public on August 19, 2004',
      'Alphabet became its parent company in 2015'
    ]
  },
  {
    id: 'bitcoin-2009',
    year: 2009,
    title: 'Bitcoin is Launched',
    shortDesc: 'An anonymous creator releases a digital currency with no central bank behind it.',
    fullDesc: 'After publishing a white paper on October 31, 2008, the pseudonymous Satoshi Nakamoto mined the first Bitcoin block on January 3, 2009. Bitcoin let strangers send value to each other without a bank, and began the cryptocurrency industry.',
    era: 'Tech',
    image: '/events/bitcoin-2009.jpg',
    realFacts: [
      'The white paper was published October 31, 2008',
      'The first block was mined January 3, 2009',
      'Its text referenced a headline from The Times about bank bailouts',
      'In 2010 a programmer paid 10,000 BTC for two pizzas',
      'Supply is capped at 21 million coins'
    ]
  },
  {
    id: 'ethereum-2015',
    year: 2015,
    title: 'Ethereum Goes Live',
    shortDesc: 'A blockchain that runs programs, not just payments, opens up smart contracts.',
    fullDesc: 'Ethereum launched on July 30, 2015, based on a design Vitalik Buterin proposed in 2013. Its smart contracts let developers run code on the blockchain, which led to decentralized applications and a wave of new token projects.',
    era: 'Tech',
    image: '/events/ethereum-2015.jpg',
    realFacts: [
      'Launched July 30, 2015',
      'Proposed by Vitalik Buterin in 2013',
      'The DAO hack in 2016 led to a split that created Ethereum Classic',
      'Its ether currency became the second-largest cryptocurrency',
      'Ethereum moved to proof of stake on September 15, 2022'
    ]
  },
  {
    id: 'nvidia-founded-1993',
    year: 1993,
    title: 'Nvidia is Founded',
    shortDesc: 'Three engineers plan a graphics chip company over breakfast at a Denny\'s.',
    fullDesc: 'Jensen Huang, Chris Malachowski and Curtis Priem founded Nvidia in April 1993 to build chips for 3D graphics. The GeForce 256 in 1999 was marketed as the first GPU, and the same parallel design later proved ideal for artificial intelligence.',
    era: 'Tech',
    image: '/events/nvidia-founded-1993.jpg',
    realFacts: [
      'Founded in April 1993 by Jensen Huang, Chris Malachowski and Curtis Priem',
      'The founders planned the company at a Denny\'s diner in San Jose',
      'The GeForce 256 launched in 1999',
      'Nvidia went public in January 1999',
      'Jensen Huang is still its CEO'
    ]
  },
  {
    id: 'cuda-2006',
    year: 2006,
    title: 'Nvidia Announces CUDA',
    shortDesc: 'Graphics chips are opened up to general-purpose programming, setting the stage for modern AI.',
    fullDesc: 'Nvidia announced CUDA in November 2006 and released it in 2007, letting programmers use GPUs for general computing rather than only graphics. In 2012 the AlexNet neural network was trained on Nvidia GPUs, helping start the deep-learning boom.',
    era: 'Tech',
    image: '/events/cuda-2006.jpg',
    realFacts: [
      'Announced in November 2006 with the GeForce 8800 GPU',
      'Released to developers in 2007',
      'Let programmers run general code on graphics chips',
      'AlexNet won the ImageNet competition in 2012 using GPUs',
      'CUDA became the standard platform for AI training'
    ]
  },
  {
    id: 'tesla-founded-2003',
    year: 2003,
    title: 'Tesla is Founded',
    shortDesc: 'Two engineers set out to build a better electric car; Elon Musk joins soon after.',
    fullDesc: 'Martin Eberhard and Marc Tarpenning founded Tesla Motors in July 2003. Elon Musk led its 2004 funding round and became chairman, and the company\'s first car, the Roadster, arrived in 2008 as one of the first production electric cars with lithium-ion batteries.',
    era: 'Tech',
    image: '/events/tesla-founded-2003.jpg',
    realFacts: [
      'Incorporated July 1, 2003 by Martin Eberhard and Marc Tarpenning',
      'Elon Musk led the 2004 funding round and joined as chairman',
      'The Roadster began deliveries in 2008',
      'Musk became CEO in October 2008',
      'Tesla went public in June 2010'
    ]
  },
  {
    id: 'model-s-2012',
    year: 2012,
    title: 'The Tesla Model S Arrives',
    shortDesc: 'An electric sedan proves EVs can be fast, long-range and desirable.',
    fullDesc: 'Tesla began delivering the Model S on June 22, 2012. Its long range, speed and software updates over the air made it a benchmark for electric cars, and it won Motor Trend\'s Car of the Year for 2013.',
    era: 'Tech',
    image: '/events/model-s-2012.jpg',
    realFacts: [
      'Deliveries began June 22, 2012',
      'Named Motor Trend Car of the Year for 2013',
      'Offered a battery range of up to about 265 miles in its top version',
      'Received software updates over the air',
      'Led to the Model 3, unveiled in 2016'
    ]
  },
  {
    id: 'nvidia-trillion-2023',
    year: 2023,
    title: 'Nvidia Hits $1 Trillion',
    shortDesc: 'Demand for AI chips makes a graphics company one of the most valuable in the world.',
    fullDesc: 'Nvidia\'s market value passed $1 trillion on May 30, 2023, driven by demand for the data-center chips that train AI systems. It became the first chipmaker to reach that milestone, and went on to pass $3 trillion in 2024.',
    era: 'Tech',
    image: '/events/nvidia-trillion-2023.jpg',
    realFacts: [
      'Passed $1 trillion in market value on May 30, 2023',
      'First chipmaker to reach that value',
      'Driven by demand for data-center GPUs such as the H100',
      'Passed $3 trillion in June 2024',
      'ChatGPT\'s launch in late 2022 set off the surge in AI spending'
    ]
  },
  {
    id: 'chatgpt-2022',
    year: 2022,
    title: 'ChatGPT is Released',
    shortDesc: 'A chatbot from OpenAI brings generative AI to millions of people overnight.',
    fullDesc: 'OpenAI released ChatGPT on November 30, 2022. It reached one million users in five days, and by early 2023 was estimated to have around 100 million monthly users, making it one of the fastest-growing consumer apps ever.',
    era: 'Tech',
    image: '/events/chatgpt-2022.jpg',
    realFacts: [
      'Released November 30, 2022 by OpenAI',
      'Reached one million users in five days',
      'Estimated at about 100 million monthly users by January 2023',
      'Built on the GPT-3.5 language model',
      'GPT-4 followed on March 14, 2023'
    ]
  },
  {
    id: 'ftx-2022',
    year: 2022,
    title: 'FTX Collapses',
    shortDesc: 'One of the biggest crypto exchanges fails in days, taking customer money with it.',
    fullDesc: 'In early November 2022 a run on FTX exposed that the exchange had lent customer funds to its sister firm Alameda Research. FTX filed for bankruptcy on November 11, 2022, and founder Sam Bankman-Fried was later convicted of fraud.',
    era: 'Tech',
    image: '/events/ftx-2022.jpg',
    realFacts: [
      'A CoinDesk report on November 2, 2022 raised alarms about Alameda\'s balance sheet',
      'FTX filed for Chapter 11 bankruptcy on November 11, 2022',
      'Billions of dollars of customer funds were missing',
      'Sam Bankman-Fried was convicted on seven counts in November 2023',
      'He was sentenced to 25 years in prison in March 2024'
    ]
  },
  {
    id: 'bitcoin-etf-2024',
    year: 2024,
    title: 'Spot Bitcoin ETFs Approved',
    shortDesc: 'The SEC lets ordinary investors buy Bitcoin through a regular brokerage account.',
    fullDesc: 'On January 10, 2024, the US Securities and Exchange Commission approved the first spot Bitcoin exchange-traded funds. They gave mainstream investors a regulated way to hold Bitcoin, and large inflows helped push its price to a record high in March 2024.',
    era: 'Tech',
    image: '/events/bitcoin-etf-2024.jpg',
    realFacts: [
      'Approved by the SEC on January 10, 2024',
      'Eleven funds began trading the next day',
      'BlackRock\'s iShares Bitcoin Trust became one of the largest',
      'Bitcoin reached a record of about $73,000 in March 2024',
      'The Bitcoin halving followed in April 2024'
    ]
  },
]

export const ERAS = ['All', 'Ancient', 'Medieval', 'Renaissance', 'Industrial', 'WWI/WWII', 'Cold War', 'Modern', 'Tech', 'Politics', 'Business', 'Celebrities', 'Social Media', 'Music', 'Sports']

// Every event the app knows about: the main list plus the ancient and tech events.
// The filter bar on Explore groups the finer categories above so every filter fits on one line.
export const FILTER_GROUPS: { label: string; eras: string[] }[] = [
  { label: 'History', eras: ['Ancient', 'Medieval', 'Renaissance', 'Industrial'] },
  { label: 'War', eras: ['WWI/WWII', 'Cold War'] },
  { label: 'Modern', eras: ['Modern'] },
  { label: 'Tech & Business', eras: ['Tech', 'Business'] },
  { label: 'Politics', eras: ['Politics'] },
  { label: 'Celebrities', eras: ['Celebrities'] },
  { label: 'Social Media', eras: ['Social Media'] },
  { label: 'Music', eras: ['Music'] },
  { label: 'Sports', eras: ['Sports'] },
]

export const ALL_EVENTS: HistoricalEvent[] = [...HISTORICAL_EVENTS, ...ANCIENT_EVENTS, ...TECH_EVENTS, ...MORE_EVENTS]

export function formatEventYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : String(year)
}