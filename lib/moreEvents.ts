import type { HistoricalEvent } from '@/lib/events'

// More events across Politics, Business, Celebrities, Social Media, Music and Sports.
// These have no photos yet, so the app shows a title card for them (see components/EventImage.tsx).
export const MORE_EVENTS: HistoricalEvent[] = [
  {
    "id": "trump-announces-2015",
    "year": 2015,
    "title": "Donald Trump Announces His Candidacy",
    "shortDesc": "A real estate developer and reality TV star launches a run for the White House.",
    "fullDesc": "On June 16, 2015, Donald Trump announced his candidacy for the Republican presidential nomination at Trump Tower in New York, entering a field of 17 major candidates.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "He won the Republican nomination in July 2016",
      "He defeated Hillary Clinton in November 2016 despite losing the national popular vote",
      "He became the first president with no prior government or military experience",
      "The Republican field shrank from 17 candidates to one by mid-2016",
      "His campaign reshaped the party around tariffs, immigration and \"America First\" themes"
    ]
  },
  {
    "id": "trump-elected-2016",
    "year": 2016,
    "title": "Trump Wins the 2016 Election",
    "shortDesc": "Donald Trump defeats Hillary Clinton in one of the biggest upsets in modern American politics.",
    "fullDesc": "On November 8, 2016, Trump won the Electoral College 304 to 227, while Hillary Clinton won the popular vote by about 2.9 million. Most polls and forecasts had favoured Clinton.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Trump was inaugurated on January 20, 2017",
      "Republicans controlled the White House, House and Senate for his first two years",
      "The Tax Cuts and Jobs Act became law in December 2017",
      "He appointed three Supreme Court justices: Gorsuch, Kavanaugh and Barrett",
      "The Court he reshaped overturned Roe v. Wade in 2022"
    ]
  },
  {
    "id": "mueller-2017",
    "year": 2017,
    "title": "Special Counsel Robert Mueller Is Appointed",
    "shortDesc": "The Justice Department opens a special investigation into Russian interference in the 2016 election.",
    "fullDesc": "On May 17, 2017, Deputy Attorney General Rod Rosenstein appointed former FBI Director Robert Mueller as special counsel, days after Trump fired FBI Director James Comey.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Mueller delivered his report in March 2019",
      "It found Russia interfered in the 2016 election in a sweeping and systematic fashion",
      "It did not establish a criminal conspiracy between the Trump campaign and Russia",
      "On obstruction of justice it neither charged nor exonerated Trump",
      "Several Trump associates were convicted or pleaded guilty, including Paul Manafort and Michael Flynn"
    ]
  },
  {
    "id": "trump-impeachment-2019",
    "year": 2019,
    "title": "Trump Is Impeached for the First Time",
    "shortDesc": "The House impeaches the president over his phone call with Ukraine's president.",
    "fullDesc": "On December 18, 2019, the House voted to impeach Trump for abuse of power and obstruction of Congress after he asked Ukraine's president to investigate Joe Biden while US military aid was on hold.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "The Senate acquitted him on February 5, 2020",
      "The vote on abuse of power was 52 to 48 against removal",
      "Mitt Romney became the first senator to vote to convict a president of his own party",
      "Trump was impeached a second time on January 13, 2021 and acquitted again in February 2021",
      "He is the only US president to have been impeached twice"
    ]
  },
  {
    "id": "biden-elected-2020",
    "year": 2020,
    "title": "Joe Biden Defeats Trump in 2020",
    "shortDesc": "Biden wins the presidency in a pandemic election with record turnout.",
    "fullDesc": "On November 3, 2020, Joe Biden defeated incumbent Donald Trump, winning the Electoral College 306 to 232 and the popular vote by more than 7 million. Millions voted by mail because of COVID-19.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Turnout was the highest as a share of eligible voters in over a century",
      "Trump and his allies filed dozens of lawsuits challenging the results, and courts rejected them",
      "Biden was inaugurated on January 20, 2021 with Kamala Harris as the first female vice president",
      "Democrats won both Georgia Senate runoffs in January 2021, giving them control of the Senate",
      "Congress certified the results on January 7, 2021, after the Capitol attack"
    ]
  },
  {
    "id": "capitol-attack-2021",
    "year": 2021,
    "title": "The January 6 Capitol Attack",
    "shortDesc": "A mob storms the US Capitol as Congress meets to certify the 2020 election.",
    "fullDesc": "On January 6, 2021, supporters of Donald Trump broke into the Capitol while Congress counted electoral votes, forcing lawmakers to evacuate and delaying the count for hours.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Congress finished certifying Joe Biden's win in the early hours of January 7",
      "Hundreds of police officers were injured and several people died in connection with the day",
      "More than 1,000 people were later charged with federal crimes",
      "The House impeached Trump a second time one week later",
      "On January 20, 2025, Trump pardoned or reduced the sentences of most of those charged"
    ]
  },
  {
    "id": "dobbs-2022",
    "year": 2022,
    "title": "The Supreme Court Overturns Roe v. Wade",
    "shortDesc": "A 1973 ruling that protected abortion rights nationwide is reversed.",
    "fullDesc": "On June 24, 2022, in Dobbs v. Jackson Women's Health Organization, the Supreme Court ruled that the Constitution does not protect a right to abortion, returning the issue to the states.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Roe v. Wade had been decided in 1973",
      "Many states enacted bans or strict limits within months",
      "Voters in several states, including Kansas and Ohio, later backed abortion rights at the ballot box",
      "The decision became a major issue in the 2022 midterm elections",
      "Three of the five justices in the majority were appointed by Trump"
    ]
  },
  {
    "id": "mar-a-lago-search-2022",
    "year": 2022,
    "title": "The FBI Searches Mar-a-Lago",
    "shortDesc": "Federal agents search a former president's home for classified documents.",
    "fullDesc": "On August 8, 2022, the FBI executed a search warrant at Trump's Mar-a-Lago estate in Florida and removed boxes of documents, including some marked classified.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Trump was indicted in June 2023 on federal charges over the handling of classified documents",
      "He pleaded not guilty",
      "A federal judge dismissed the case in July 2024, ruling the special counsel's appointment was unlawful",
      "The Justice Department dropped its appeal after Trump won the 2024 election"
    ]
  },
  {
    "id": "trump-conviction-2024",
    "year": 2024,
    "title": "Trump Is Convicted in New York",
    "shortDesc": "A former president is found guilty on 34 felony counts.",
    "fullDesc": "On May 30, 2024, a Manhattan jury found Donald Trump guilty of falsifying business records in connection with a hush-money payment made before the 2016 election.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "He was the first former US president convicted of a crime",
      "He was sentenced on January 10, 2025 to an unconditional discharge, with no jail time, fine or probation",
      "The sentence came ten days before he returned to the White House",
      "He appealed the conviction",
      "The two federal criminal cases against him were dropped after he won the 2024 election"
    ]
  },
  {
    "id": "butler-2024",
    "year": 2024,
    "title": "The Butler, Pennsylvania Assassination Attempt",
    "shortDesc": "A gunman fires at Donald Trump during a campaign rally.",
    "fullDesc": "On July 13, 2024, a gunman fired from a nearby rooftop at a Trump rally in Butler, Pennsylvania. A bullet grazed Trump's ear, one attendee was killed and two others were critically injured. The shooter was killed by a Secret Service sniper.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Rally attendee Corey Comperatore was killed",
      "Secret Service Director Kimberly Cheatle resigned on July 23, 2024",
      "Trump raised a fist as agents pulled him off stage, an image seen around the world",
      "A second attempt on his life followed at his Florida golf course on September 15, 2024",
      "He won the presidential election in November 2024"
    ]
  },
  {
    "id": "biden-withdraws-2024",
    "year": 2024,
    "title": "Biden Ends His Re-election Campaign",
    "shortDesc": "After a rough debate, the sitting president steps aside and endorses Kamala Harris.",
    "fullDesc": "On July 21, 2024, President Joe Biden announced he would not seek a second term, weeks after a June 27 debate against Trump raised alarm about his age and stamina.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "He endorsed Vice President Kamala Harris",
      "Harris became the Democratic nominee and chose Tim Walz as her running mate",
      "He was the first elected president to leave a re-election race since Lyndon Johnson in 1968",
      "Trump defeated Harris in November 2024"
    ]
  },
  {
    "id": "trump-returns-2024",
    "year": 2024,
    "title": "Trump Wins a Second Term",
    "shortDesc": "Donald Trump defeats Kamala Harris and becomes the first president since Grover Cleveland to win non-consecutive terms.",
    "fullDesc": "On November 5, 2024, Trump won the Electoral College 312 to 226 and the national popular vote, carrying all seven battleground states.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "He was inaugurated for a second term on January 20, 2025",
      "JD Vance became vice president",
      "Republicans won control of the Senate and kept the House",
      "Elon Musk, who spent heavily backing him, was given a role leading the Department of Government Efficiency",
      "Trump signed a wave of executive orders on his first day, including pardons for January 6 defendants"
    ]
  },
  {
    "id": "tariffs-2025",
    "year": 2025,
    "title": "The \"Liberation Day\" Tariffs",
    "shortDesc": "Trump announces sweeping tariffs on imports from nearly every country.",
    "fullDesc": "On April 2, 2025, President Trump announced a 10 percent baseline tariff on most imports plus higher \"reciprocal\" rates on dozens of countries, the biggest increase in US tariffs in generations.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Stock markets fell sharply in the following days",
      "On April 9 he paused the higher rates for most countries for 90 days",
      "Tariffs on Chinese goods rose as high as 145 percent before a truce in May",
      "Trading partners including Canada and China announced retaliatory measures",
      "Federal courts took up whether he could impose them under emergency powers"
    ]
  },
  {
    "id": "doge-2025",
    "year": 2025,
    "title": "The Department of Government Efficiency",
    "shortDesc": "Elon Musk leads a new effort to cut federal spending and staff.",
    "fullDesc": "On January 20, 2025, President Trump created the Department of Government Efficiency (DOGE) by executive order, with Elon Musk as its most visible leader.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "DOGE teams gained access to federal payment systems and agency data",
      "Tens of thousands of federal workers were fired, took buyouts or left government",
      "Efforts to shut down USAID began within weeks",
      "Musk stepped back from the role at the end of May 2025",
      "Musk and Trump publicly feuded in June 2025"
    ]
  },
  {
    "id": "russia-ukraine-2022",
    "year": 2022,
    "title": "Russia Invades Ukraine",
    "shortDesc": "Russia launches a full-scale invasion, the largest war in Europe since 1945.",
    "fullDesc": "On February 24, 2022, Russian forces attacked Ukraine from the north, east and south after months of troop buildup near its borders.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Russia had already annexed Crimea in 2014",
      "Western nations imposed sweeping sanctions on Russia",
      "NATO added Finland in 2023 and Sweden in 2024",
      "Millions of Ukrainians fled the country",
      "The war continued for years with heavy casualties on both sides"
    ]
  },
  {
    "id": "watergate-1974",
    "year": 1974,
    "title": "Nixon Resigns",
    "shortDesc": "Facing near-certain impeachment, Richard Nixon becomes the only US president to resign.",
    "fullDesc": "On August 9, 1974, Richard Nixon resigned over the Watergate scandal, a cover-up that began with a June 1972 break-in at the Democratic National Committee headquarters.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Gerald Ford became president and pardoned Nixon on September 8, 1974",
      "The \"smoking gun\" tape showed Nixon had ordered the FBI investigation halted",
      "Dozens of officials were convicted or pleaded guilty",
      "Congress passed new ethics and campaign finance laws",
      "Ford lost the 1976 election to Jimmy Carter"
    ]
  },
  {
    "id": "reagan-1980",
    "year": 1980,
    "title": "Ronald Reagan Is Elected President",
    "shortDesc": "A former actor and California governor wins in a landslide and reshapes American conservatism.",
    "fullDesc": "On November 4, 1980, Ronald Reagan defeated President Jimmy Carter, winning 489 electoral votes to 49.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "The Iran hostages were released minutes after his inauguration in January 1981",
      "He cut taxes in 1981 and raised defense spending",
      "He survived an assassination attempt in March 1981",
      "He won re-election in 1984 with 525 electoral votes",
      "He and Soviet leader Mikhail Gorbachev signed the INF Treaty in 1987"
    ]
  },
  {
    "id": "bush-v-gore-2000",
    "year": 2000,
    "title": "Bush v. Gore",
    "shortDesc": "A 36-day recount fight over Florida ends at the Supreme Court.",
    "fullDesc": "The 2000 presidential election came down to Florida, where George W. Bush led by 537 votes. On December 12, 2000, the Supreme Court halted the recount, effectively deciding the election.",
    "era": "Politics",
    "image": "",
    "realFacts": [
      "Bush won the Electoral College 271 to 266",
      "Al Gore won the national popular vote by about half a million votes",
      "Gore conceded the next day",
      "Congress passed the Help America Vote Act in 2002 to modernize voting",
      "Ralph Nader's vote in Florida was far larger than Bush's margin of victory"
    ]
  },
  {
    "id": "model-t-1908",
    "year": 1908,
    "title": "Ford Introduces the Model T",
    "shortDesc": "An affordable car puts America on wheels.",
    "fullDesc": "Ford launched the Model T on October 1, 1908. In 1913 Ford introduced the moving assembly line, cutting the time to build a car from about 12 hours to about 90 minutes.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "More than 15 million Model Ts were built by 1927",
      "The price fell from $850 to under $300 for some models",
      "In 1914 Ford offered workers $5 a day, about double typical factory pay",
      "Mass production spread to nearly every industry",
      "Cars reshaped American cities, suburbs and highways"
    ]
  },
  {
    "id": "amazon-1994",
    "year": 1994,
    "title": "Jeff Bezos Founds Amazon",
    "shortDesc": "A Seattle garage startup begins selling books online.",
    "fullDesc": "In July 1994, Jeff Bezos incorporated Amazon in Washington state after leaving a hedge fund job. The site sold its first book in 1995.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Amazon went public in May 1997 at $18 a share",
      "It launched Prime in 2005 and Amazon Web Services in 2006",
      "AWS became the largest cloud computing provider",
      "Amazon bought Whole Foods for about $13.7 billion in 2017",
      "Bezos stepped down as CEO in 2021"
    ]
  },
  {
    "id": "enron-2001",
    "year": 2001,
    "title": "Enron Collapses",
    "shortDesc": "Once America's seventh-largest company, Enron files for bankruptcy after an accounting fraud is exposed.",
    "fullDesc": "On December 2, 2001, Enron filed for bankruptcy after it emerged that it had hidden billions of dollars in debt through off-the-books partnerships.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Thousands of employees lost their jobs and retirement savings",
      "Accounting firm Arthur Andersen was convicted of obstruction and collapsed",
      "CEO Jeffrey Skilling was sentenced to 24 years, later reduced",
      "Congress passed the Sarbanes-Oxley Act in 2002 to tighten corporate accounting rules",
      "Founder Kenneth Lay died in 2006 before he could be sentenced"
    ]
  },
  {
    "id": "tesla-roadster-2008",
    "year": 2008,
    "title": "The Tesla Roadster Debuts",
    "shortDesc": "A battery-powered sports car shows that electric cars can be fast and desirable.",
    "fullDesc": "Tesla began delivering the Roadster in early 2008. Built on a Lotus Elise chassis, it was the first production car to use lithium-ion battery cells and could go about 245 miles on a charge.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "It accelerated from 0 to 60 mph in under four seconds",
      "About 2,450 Roadsters were sold in more than 30 countries before production ended in 2012",
      "The Roadster's profits and lessons helped fund the Model S",
      "Elon Musk became Tesla's CEO in October 2008 as the company nearly ran out of cash"
    ]
  },
  {
    "id": "tesla-ipo-2010",
    "year": 2010,
    "title": "Tesla Goes Public",
    "shortDesc": "Tesla becomes the first American car company to list on the stock market since Ford in 1956.",
    "fullDesc": "On June 29, 2010, Tesla sold shares at $17 and raised about $226 million in its IPO.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Shares closed the first day up about 41 percent",
      "Tesla had never turned an annual profit at that point",
      "It posted its first full-year profit in 2020",
      "Tesla joined the S&P 500 in December 2020",
      "It became the world's most valuable carmaker in 2020"
    ]
  },
  {
    "id": "falcon9-landing-2015",
    "year": 2015,
    "title": "SpaceX Lands a Rocket",
    "shortDesc": "A Falcon 9 booster returns from space and lands upright.",
    "fullDesc": "On December 21, 2015, SpaceX landed the first stage of a Falcon 9 at Cape Canaveral after it delivered satellites to orbit, the first time an orbital-class booster had done so.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Reusable rockets sharply cut the cost of reaching orbit",
      "SpaceX flew a previously flown booster for the first time in March 2017",
      "Falcon Heavy debuted in 2018",
      "SpaceX carried NASA astronauts to the International Space Station in 2020",
      "Falcon 9 became the most frequently flown orbital rocket in the world"
    ]
  },
  {
    "id": "tesla-model3-2017",
    "year": 2017,
    "title": "The Tesla Model 3 Arrives",
    "shortDesc": "Tesla's mass-market car arrives after a record wave of pre-orders.",
    "fullDesc": "Tesla unveiled the Model 3 on March 31, 2016 and collected roughly 325,000 reservations in a week. Deliveries began on July 28, 2017.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Musk called the production ramp-up \"production hell\"",
      "The Model 3 became the world's best-selling electric car",
      "Tesla delivered about 1.8 million cars in 2023",
      "Tesla's market value passed $1 trillion in October 2021",
      "Competitors from Ford to BYD accelerated their electric vehicle plans"
    ]
  },
  {
    "id": "starman-2018",
    "year": 2018,
    "title": "A Tesla Roadster Is Launched Into Space",
    "shortDesc": "Elon Musk sends his own car toward Mars on the first Falcon Heavy.",
    "fullDesc": "On February 6, 2018, SpaceX's Falcon Heavy flew for the first time, carrying Musk's personal Tesla Roadster with a mannequin called Starman in the driver's seat.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Falcon Heavy was then the most powerful operational rocket in the world",
      "Two of its three boosters landed back at Cape Canaveral at the same time",
      "The center core missed its drone ship and crashed into the ocean",
      "The car and Starman entered an orbit around the Sun that passes near Mars",
      "Its dashboard screen read \"Don't Panic,\" a nod to The Hitchhiker's Guide to the Galaxy"
    ]
  },
  {
    "id": "apple-1t-2018",
    "year": 2018,
    "title": "Apple Hits $1 Trillion",
    "shortDesc": "Apple becomes the first US company worth a trillion dollars.",
    "fullDesc": "On August 2, 2018, Apple's market value closed above $1 trillion, 42 years after Steve Jobs and Steve Wozniak founded the company.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Apple reached $2 trillion in August 2020 and $3 trillion in January 2022",
      "The iPhone drove most of its growth",
      "Tim Cook had been CEO since Jobs's resignation in 2011",
      "Amazon, Microsoft and Alphabet later passed $1 trillion too"
    ]
  },
  {
    "id": "nvidia-gpu-1999",
    "year": 1999,
    "title": "Nvidia Launches the GeForce 256",
    "shortDesc": "The company markets it as the world's first GPU.",
    "fullDesc": "On August 31, 1999, Nvidia introduced the GeForce 256, which moved lighting and geometry calculations onto the graphics chip and which Nvidia called the first graphics processing unit.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Nvidia had gone public in January 1999",
      "GPUs transformed video games and 3D graphics",
      "Their parallel design later proved ideal for scientific computing and AI",
      "Nvidia introduced CUDA in 2006 so developers could program GPUs for general tasks",
      "Jensen Huang, who co-founded Nvidia in 1993, remains its CEO"
    ]
  },
  {
    "id": "nvidia-alexnet-2012",
    "year": 2012,
    "title": "AlexNet Ignites Modern AI",
    "shortDesc": "A neural network trained on Nvidia graphics cards wins an image-recognition contest by a wide margin.",
    "fullDesc": "In September 2012, a University of Toronto team including Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton won the ImageNet contest with AlexNet, trained on two Nvidia GeForce GPUs.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "AlexNet cut the image-classification error rate far below rival approaches",
      "It convinced many researchers that deep learning on GPUs could work at scale",
      "Nvidia pivoted heavily toward AI chips and data centers",
      "Sutskever later co-founded OpenAI",
      "Hinton shared the 2024 Nobel Prize in Physics for work on neural networks"
    ]
  },
  {
    "id": "nvidia-arm-2022",
    "year": 2022,
    "title": "Nvidia's $40 Billion Arm Deal Collapses",
    "shortDesc": "Regulators' opposition ends the largest chip acquisition ever proposed.",
    "fullDesc": "Nvidia announced plans to buy chip designer Arm from SoftBank in September 2020 for up to $40 billion. On February 7, 2022, the companies abandoned the deal after opposition from regulators in the US, UK and EU.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Arm instead went public in September 2023",
      "SoftBank had paid about $32 billion for Arm in 2016",
      "Nvidia's focus on AI chips drove its value past $1 trillion in 2023"
    ]
  },
  {
    "id": "nvidia-deepseek-2025",
    "year": 2025,
    "title": "The DeepSeek Shock Hits Nvidia",
    "shortDesc": "A Chinese AI model rattles markets and erases hundreds of billions from Nvidia in a day.",
    "fullDesc": "On January 27, 2025, Nvidia's stock fell about 17 percent after Chinese startup DeepSeek's low-cost R1 model raised doubts about how many expensive chips AI would need. Nvidia lost roughly $590 billion in market value, the largest one-day loss ever recorded for a US company.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "DeepSeek said it trained its model for a fraction of its rivals' costs",
      "Nvidia shares recovered over the following months",
      "Questions about export controls on AI chips to China intensified",
      "The episode showed how much of the stock market now depended on AI spending"
    ]
  },
  {
    "id": "nvidia-4t-2025",
    "year": 2025,
    "title": "Nvidia Becomes the First $4 Trillion Company",
    "shortDesc": "The chipmaker founded in a Denny's restaurant becomes the world's most valuable public company.",
    "fullDesc": "On July 9, 2025, Nvidia's market value briefly passed $4 trillion, up from roughly $360 billion at the start of 2023.",
    "era": "Business",
    "image": "",
    "realFacts": [
      "Nvidia passed $1 trillion in 2023 and $3 trillion in 2024",
      "Demand came from AI data centers run by Microsoft, Google, Amazon and Meta",
      "CEO Jensen Huang, who owns a large stake, became one of the world's richest people",
      "Limits on exports of advanced chips to China affected its sales there"
    ]
  },
  {
    "id": "monroe-1962",
    "year": 1962,
    "title": "Marilyn Monroe Dies",
    "shortDesc": "Hollywood's biggest star is found dead at 36.",
    "fullDesc": "On August 4, 1962, Marilyn Monroe was found dead at her Los Angeles home. Her death was ruled a probable suicide from a barbiturate overdose.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "She had sung \"Happy Birthday\" to President Kennedy at Madison Square Garden in May 1962",
      "She had been fired from the film Something's Got to Give in June 1962",
      "Andy Warhol's 1962 Marilyn silkscreens turned her into a pop-art icon",
      "Her image remains one of the most reproduced in popular culture"
    ]
  },
  {
    "id": "elvis-1977",
    "year": 1977,
    "title": "Elvis Presley Dies",
    "shortDesc": "The King of Rock and Roll dies at Graceland at 42.",
    "fullDesc": "Elvis Presley died on August 16, 1977, at Graceland in Memphis. Tens of thousands of fans gathered in the days that followed.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "He had sold hundreds of millions of records worldwide",
      "His 1956 television appearances helped turn rock and roll into a mass phenomenon",
      "Graceland opened to the public in 1982 and became one of the most visited homes in America",
      "His estate continues to earn millions every year"
    ]
  },
  {
    "id": "diana-1997",
    "year": 1997,
    "title": "Princess Diana Dies in Paris",
    "shortDesc": "The \"People's Princess\" is killed in a car crash, stunning the world.",
    "fullDesc": "On August 31, 1997, Diana, Princess of Wales, died after a car crash in the Pont de l'Alma tunnel in Paris while being pursued by photographers. She was 36.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "Her funeral on September 6 was watched by hundreds of millions of people",
      "Her sons William and Harry walked behind her coffin",
      "The driver, Henri Paul, was found to have been drunk",
      "The royal family faced rare public criticism for its muted early response",
      "The crash prompted debate over paparazzi and press intrusion"
    ]
  },
  {
    "id": "oj-1995",
    "year": 1995,
    "title": "O.J. Simpson Is Acquitted",
    "shortDesc": "A televised murder trial ends with a verdict watched by an estimated 100 million Americans.",
    "fullDesc": "On October 3, 1995, a Los Angeles jury found O.J. Simpson not guilty of murdering Nicole Brown Simpson and Ron Goldman after a trial that lasted nearly nine months.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "A civil jury found him liable for the deaths in 1997 and ordered him to pay $33.5 million",
      "The trial made nonstop cable news coverage of courtroom drama a staple of American media",
      "He was convicted of armed robbery in Las Vegas in 2008 and served nine years",
      "He died in April 2024"
    ]
  },
  {
    "id": "kardashians-2007",
    "year": 2007,
    "title": "Keeping Up with the Kardashians Premieres",
    "shortDesc": "A reality show about one Los Angeles family launches a new model of celebrity.",
    "fullDesc": "The show premiered on E! on October 14, 2007 and ran for 20 seasons until 2021.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "Kim, Kourtney, Khloé, Kendall and Kylie became household names",
      "The family turned fame into businesses in cosmetics, fashion and shapewear",
      "Kylie Jenner and Kim Kardashian were named billionaires by Forbes at different points",
      "The show helped define the social media influencer economy"
    ]
  },
  {
    "id": "mj-2009",
    "year": 2009,
    "title": "Michael Jackson Dies",
    "shortDesc": "The \"King of Pop\" dies suddenly at 50, shutting down websites around the world.",
    "fullDesc": "On June 25, 2009, Michael Jackson died of an overdose of the anesthetic propofol at his Los Angeles home, weeks before a planned 50-show comeback in London.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "His doctor, Conrad Murray, was convicted of involuntary manslaughter in 2011",
      "Streaming and sales of his music surged after his death",
      "The memorial service on July 7 was watched by millions around the world",
      "The film This Is It, built from his rehearsals, grossed more than $250 million"
    ]
  },
  {
    "id": "megxit-2020",
    "year": 2020,
    "title": "Harry and Meghan Step Back from Royal Duties",
    "shortDesc": "The Duke and Duchess of Sussex announce they will step back as senior members of the royal family.",
    "fullDesc": "On January 8, 2020, Prince Harry and Meghan Markle said they would step back as \"senior\" royals and split their time between the UK and North America.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "They moved to California",
      "In March 2021 they gave an interview to Oprah Winfrey alleging racism and a lack of support",
      "Harry published the memoir Spare in January 2023",
      "The couple signed deals with Netflix and Spotify",
      "Their departure reshaped public debate about the monarchy"
    ]
  },
  {
    "id": "kobe-2020",
    "year": 2020,
    "title": "Kobe Bryant Dies in a Helicopter Crash",
    "shortDesc": "The basketball legend, his daughter Gianna and seven others are killed.",
    "fullDesc": "On January 26, 2020, a helicopter carrying Kobe Bryant crashed in fog near Calabasas, California, killing all nine people aboard, including his 13-year-old daughter Gianna.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "Bryant won five NBA championships with the Los Angeles Lakers",
      "He scored 81 points in a single game in 2006",
      "He won an Academy Award in 2018 for the animated short Dear Basketball",
      "He was inducted into the Basketball Hall of Fame in 2020",
      "Fans created memorials across Los Angeles and around the sport"
    ]
  },
  {
    "id": "will-smith-2022",
    "year": 2022,
    "title": "The Slap at the Oscars",
    "shortDesc": "Will Smith slaps Chris Rock on stage at the Academy Awards.",
    "fullDesc": "On March 27, 2022, Will Smith walked on stage and slapped presenter Chris Rock after a joke about his wife's shaved head. Minutes later Smith won Best Actor for King Richard.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "Smith resigned from the Academy on April 1, 2022",
      "The Academy banned him from its events for 10 years",
      "Clips became some of the most viewed moments in awards-show history",
      "Rock addressed the incident in a 2023 Netflix special"
    ]
  },
  {
    "id": "queen-elizabeth-2022",
    "year": 2022,
    "title": "Queen Elizabeth II Dies",
    "shortDesc": "Britain's longest-reigning monarch dies after 70 years on the throne.",
    "fullDesc": "Elizabeth II died on September 8, 2022 at Balmoral Castle at age 96. Her reign lasted 70 years and 214 days.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "Charles became King Charles III",
      "She had reigned through 15 prime ministers, from Winston Churchill to Liz Truss",
      "Her state funeral on September 19 drew one of the largest television audiences ever",
      "Her coffin lay in state for four days, with queues stretching for miles"
    ]
  },
  {
    "id": "hollywood-strikes-2023",
    "year": 2023,
    "title": "Hollywood's Double Strike",
    "shortDesc": "Writers and actors walk out together for the first time since 1960.",
    "fullDesc": "The Writers Guild of America struck on May 2, 2023, followed by SAG-AFTRA on July 14, over pay in the streaming era and the use of artificial intelligence.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "It was the first time both unions struck together since 1960",
      "The writers' strike lasted 148 days, ending September 27, 2023",
      "The actors' strike lasted 118 days, ending November 9, 2023",
      "The new contracts included protections around AI",
      "Productions stalled and the industry lost billions of dollars"
    ]
  },
  {
    "id": "barbenheimer-2023",
    "year": 2023,
    "title": "Barbenheimer",
    "shortDesc": "Barbie and Oppenheimer open on the same day and fuel a record summer for cinemas.",
    "fullDesc": "On July 21, 2023, Greta Gerwig's Barbie and Christopher Nolan's Oppenheimer opened the same weekend, turning a scheduling coincidence into a viral movement.",
    "era": "Celebrities",
    "image": "",
    "realFacts": [
      "Barbie earned about $1.4 billion worldwide and was the highest-grossing film of 2023",
      "Oppenheimer earned more than $900 million",
      "Oppenheimer won seven Oscars, including Best Picture, in March 2024",
      "Many moviegoers watched both films on the same day"
    ]
  },
  {
    "id": "myspace-2003",
    "year": 2003,
    "title": "MySpace Launches",
    "shortDesc": "The first social network to reach mass popularity opens its doors.",
    "fullDesc": "MySpace launched in August 2003. News Corp bought it in 2005 for $580 million, and by 2006 it was one of the most visited websites in the United States.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "It let users customize their profile pages and rank a \"Top 8\" of friends",
      "It helped launch artists like Arctic Monkeys and Lily Allen",
      "Facebook overtook it in users in 2008",
      "News Corp sold it in 2011 for about $35 million"
    ]
  },
  {
    "id": "youtube-2005",
    "year": 2005,
    "title": "YouTube Is Founded",
    "shortDesc": "Three former PayPal employees launch a video-sharing site.",
    "fullDesc": "YouTube was founded in February 2005 by Chad Hurley, Steve Chen and Jawed Karim. Its first video, \"Me at the zoo,\" was uploaded on April 23, 2005.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "Google bought it in October 2006 for $1.65 billion",
      "YouTube became one of the most visited websites in the world",
      "Its Partner Program, launched in 2007, let creators earn money from ads",
      "It made \"YouTuber\" a career and reshaped television and music",
      "More than 500 hours of video are uploaded every minute"
    ]
  },
  {
    "id": "twitter-2006",
    "year": 2006,
    "title": "Twitter Launches",
    "shortDesc": "A 140-character service changes how news and public conversation spread.",
    "fullDesc": "Jack Dorsey sent the first tweet on March 21, 2006, and Twitter launched publicly in July 2006.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "The 140-character limit came from SMS text message limits",
      "Twitter played a visible role in protests including the Arab Spring in 2011",
      "Donald Trump used it as a main channel as president before being banned in January 2021",
      "The character limit doubled to 280 in 2017",
      "Elon Musk bought the company in October 2022 and renamed it X in 2023"
    ]
  },
  {
    "id": "instagram-2010",
    "year": 2010,
    "title": "Instagram Launches",
    "shortDesc": "A photo-filter app reaches a million users in about two months.",
    "fullDesc": "Kevin Systrom and Mike Krieger launched Instagram on October 6, 2010. It reached one million users in about two months.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "Facebook bought it in April 2012 for about $1 billion, when it had around 13 employees",
      "Instagram passed one billion monthly users in 2018",
      "Stories, copied from Snapchat, launched in 2016",
      "Its founders left Meta in 2018"
    ]
  },
  {
    "id": "snapchat-2011",
    "year": 2011,
    "title": "Snapchat Launches",
    "shortDesc": "Photos that disappear after being viewed reshape how young people share.",
    "fullDesc": "Created by Stanford students Evan Spiegel and Bobby Murphy, the app first appeared in 2011 as Picaboo before being renamed Snapchat.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "Spiegel reportedly turned down a $3 billion offer from Facebook in 2013",
      "Snap went public in March 2017",
      "Stories, which Snapchat pioneered, were copied by Instagram, Facebook and others",
      "Snapchat helped popularize augmented-reality filters and lenses"
    ]
  },
  {
    "id": "tiktok-2018",
    "year": 2018,
    "title": "TikTok Goes Global",
    "shortDesc": "A short-video app from China merges with Musical.ly and takes over the world's phones.",
    "fullDesc": "In August 2018, ByteDance merged Musical.ly, which it had bought in 2017, into TikTok. By April 2020 the app had passed 2 billion downloads.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "TikTok's algorithm showed videos from strangers rather than only from friends, a model rivals copied",
      "It was the most downloaded app of 2020",
      "The US government pressed ByteDance to sell it over data security concerns",
      "Instagram Reels and YouTube Shorts launched to compete",
      "TikTok reached about 1 billion monthly users by 2021"
    ]
  },
  {
    "id": "cambridge-2018",
    "year": 2018,
    "title": "The Cambridge Analytica Scandal",
    "shortDesc": "A data leak reveals how millions of Facebook profiles were harvested for political targeting.",
    "fullDesc": "On March 17, 2018, news reports revealed that Cambridge Analytica had obtained data on up to 87 million Facebook users through a quiz app, without their meaningful consent.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "Mark Zuckerberg testified before Congress in April 2018",
      "The FTC fined Facebook $5 billion in July 2019",
      "Facebook's market value dropped by more than $100 billion in a few days",
      "Cambridge Analytica shut down in May 2018",
      "Privacy and data rules tightened in many countries"
    ]
  },
  {
    "id": "gamestop-2021",
    "year": 2021,
    "title": "The GameStop Short Squeeze",
    "shortDesc": "Reddit traders drive a struggling retailer's stock up by more than 1,000 percent.",
    "fullDesc": "In January 2021, users of Reddit's r/wallstreetbets bought GameStop shares and options, squeezing hedge funds that had bet against it. The stock went from under $20 early in the month to an intraday high near $483 on January 28.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "Robinhood restricted purchases of GameStop on January 28, causing outrage",
      "Hedge fund Melvin Capital lost billions and needed a rescue investment",
      "Congress held hearings in February 2021",
      "The episode popularized \"meme stocks\" and fueled the rise of retail trading apps",
      "It inspired the 2023 film Dumb Money"
    ]
  },
  {
    "id": "meta-rebrand-2021",
    "year": 2021,
    "title": "Facebook Becomes Meta",
    "shortDesc": "Mark Zuckerberg renames the company and bets on the metaverse.",
    "fullDesc": "On October 28, 2021, Facebook, Inc. renamed itself Meta Platforms, saying it would focus on building virtual and augmented reality worlds. The rename came weeks after whistleblower Frances Haugen's disclosures.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "Meta's Reality Labs division lost billions of dollars a year",
      "Meta's stock fell about 75 percent from its peak by late 2022",
      "The company later pivoted toward artificial intelligence",
      "Facebook, Instagram and WhatsApp remained the products most people knew"
    ]
  },
  {
    "id": "musk-twitter-2022",
    "year": 2022,
    "title": "Elon Musk Buys Twitter",
    "shortDesc": "The world's richest person takes over a major social network for $44 billion.",
    "fullDesc": "On October 27, 2022, Musk completed his $44 billion acquisition of Twitter at $54.20 a share, after trying to back out of the deal earlier that year.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "He fired top executives and laid off about half of the staff within weeks",
      "He restored previously banned accounts, including Donald Trump's",
      "Twitter was renamed X in July 2023",
      "Advertisers pulled back and the company's value fell sharply",
      "Rivals such as Threads launched to capture users"
    ]
  },
  {
    "id": "threads-2023",
    "year": 2023,
    "title": "Meta Launches Threads",
    "shortDesc": "A Twitter rival reaches 100 million sign-ups in five days.",
    "fullDesc": "Meta launched Threads on July 5, 2023. It reached 100 million sign-ups within five days, faster than ChatGPT had.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "Daily use fell sharply after the launch surge",
      "Threads was tied to Instagram accounts for easy sign-up",
      "It passed 200 million monthly users in 2024",
      "It positioned itself as a calmer alternative to X"
    ]
  },
  {
    "id": "tiktok-ban-2025",
    "year": 2025,
    "title": "The Fight Over a TikTok Ban",
    "shortDesc": "A law forces TikTok to find a non-Chinese owner or leave US app stores.",
    "fullDesc": "Congress passed a law in April 2024 requiring ByteDance to sell TikTok. On January 17, 2025 the Supreme Court upheld it unanimously, and TikTok went dark in the US for about a day.",
    "era": "Social Media",
    "image": "",
    "realFacts": [
      "The ban took effect on January 19, 2025 and the app returned after Trump promised a delay",
      "Trump signed an order pausing enforcement for 75 days and extended the deadline several times",
      "TikTok said about 170 million Americans use the app",
      "Debate continued over who would own and run its US operations"
    ]
  },
  {
    "id": "beatles-1964",
    "year": 1964,
    "title": "The Beatles on The Ed Sullivan Show",
    "shortDesc": "Beatlemania hits America.",
    "fullDesc": "On February 9, 1964, the Beatles performed on The Ed Sullivan Show, watched by about 73 million Americans.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "They held the top five spots on Billboard's Hot 100 in April 1964",
      "The British Invasion followed, with bands like the Rolling Stones and The Who",
      "Sgt. Pepper's Lonely Hearts Club Band (1967) pushed pop albums toward art",
      "They broke up in 1970"
    ]
  },
  {
    "id": "dylan-electric-1965",
    "year": 1965,
    "title": "Bob Dylan Goes Electric",
    "shortDesc": "A folk hero plugs in at the Newport Folk Festival and divides his audience.",
    "fullDesc": "On July 25, 1965, Bob Dylan played an electric set at the Newport Folk Festival to a mix of cheers and boos.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "\"Like a Rolling Stone\" had been released that same month",
      "Rolling Stone ranked it the greatest song of all time in 2004",
      "Folk-rock became a major genre",
      "Dylan won the Nobel Prize in Literature in 2016"
    ]
  },
  {
    "id": "woodstock-1969",
    "year": 1969,
    "title": "Woodstock",
    "shortDesc": "Roughly 400,000 people gather on a dairy farm in upstate New York.",
    "fullDesc": "From August 15 to 18, 1969, the Woodstock Music & Art Fair in Bethel, New York drew about 400,000 people despite rain, mud and shortages of food and water.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "Performers included Jimi Hendrix, Janis Joplin, The Who and Santana",
      "Hendrix's guitar version of the Star-Spangled Banner became iconic",
      "Organizers had expected about 50,000 people",
      "The 1970 documentary Woodstock won an Oscar",
      "It became a symbol of the 1960s counterculture"
    ]
  },
  {
    "id": "hiphop-1973",
    "year": 1973,
    "title": "The Birth of Hip-Hop",
    "shortDesc": "DJ Kool Herc throws a back-to-school party in the Bronx.",
    "fullDesc": "On August 11, 1973, DJ Kool Herc played extended drum breaks at a party at 1520 Sedgwick Avenue in the Bronx, a night often described as hip-hop's birthday.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "The Sugarhill Gang's \"Rapper's Delight\" in 1979 was the first rap single to reach the Top 40",
      "Hip-hop grew into a global culture of rap, DJing, breakdancing and graffiti",
      "Rap and hip-hop became the most consumed music genre in the United States in the 2010s",
      "Kendrick Lamar won a Pulitzer Prize for Music in 2018"
    ]
  },
  {
    "id": "mtv-1981",
    "year": 1981,
    "title": "MTV Launches",
    "shortDesc": "\"Video Killed the Radio Star\" becomes the first video on a 24-hour music channel.",
    "fullDesc": "MTV went on the air on August 1, 1981. The first video it played was The Buggles' \"Video Killed the Radio Star.\"",
    "era": "Music",
    "image": "",
    "realFacts": [
      "Music videos became essential to making a hit",
      "Madonna and Michael Jackson became global stars partly through MTV",
      "MTV later shifted toward reality television",
      "YouTube eventually replaced it as the main place to watch music videos"
    ]
  },
  {
    "id": "thriller-1982",
    "year": 1982,
    "title": "Michael Jackson Releases Thriller",
    "shortDesc": "The album that became the best-selling of all time.",
    "fullDesc": "Thriller was released on November 30, 1982. It produced seven Top 10 singles and has sold an estimated 70 million copies worldwide.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "It won eight Grammy Awards in 1984",
      "The 14-minute \"Thriller\" video premiered in December 1983",
      "Jackson debuted the moonwalk on the Motown 25 television special in May 1983",
      "He died on June 25, 2009 at age 50"
    ]
  },
  {
    "id": "live-aid-1985",
    "year": 1985,
    "title": "Live Aid",
    "shortDesc": "A global concert raises money for famine relief in Ethiopia.",
    "fullDesc": "On July 13, 1985, concerts at Wembley Stadium in London and JFK Stadium in Philadelphia were broadcast to an estimated 1.9 billion people in about 150 countries.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "Organizers Bob Geldof and Midge Ure raised more than £100 million",
      "Queen's 20-minute set is often called one of the greatest live performances in rock history",
      "Phil Collins played in both cities, flying across the Atlantic on the Concorde",
      "It inspired later benefit concerts such as Live 8 in 2005"
    ]
  },
  {
    "id": "nevermind-1991",
    "year": 1991,
    "title": "Nirvana Releases Nevermind",
    "shortDesc": "Grunge goes mainstream when a Seattle band knocks Michael Jackson off the top of the charts.",
    "fullDesc": "Nirvana's second album was released on September 24, 1991. \"Smells Like Teen Spirit\" pushed it to No. 1 on the Billboard 200 in January 1992, replacing Michael Jackson's Dangerous.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "It has sold more than 30 million copies",
      "Alternative rock replaced hair metal as the dominant sound on rock radio",
      "Seattle bands like Pearl Jam and Soundgarden broke through at the same time",
      "Kurt Cobain died on April 5, 1994 at age 27"
    ]
  },
  {
    "id": "napster-1999",
    "year": 1999,
    "title": "Napster Launches",
    "shortDesc": "A free file-sharing service upends the music business.",
    "fullDesc": "Shawn Fanning, then 18, launched Napster in June 1999. At its peak it had tens of millions of users before a court ordered it shut down in 2001.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "The Recording Industry Association of America sued in December 1999",
      "Metallica sued Napster in 2000 and Dr. Dre followed",
      "Industry revenue fell sharply through the 2000s",
      "Apple's iTunes Store (2003) and Spotify (2008) later built legal alternatives"
    ]
  },
  {
    "id": "itunes-2003",
    "year": 2003,
    "title": "The iTunes Store Opens",
    "shortDesc": "Apple sells songs for 99 cents and proves people will pay for digital music.",
    "fullDesc": "On April 28, 2003, Apple launched the iTunes Music Store with about 200,000 songs at 99 cents each. It sold a million in the first week.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "It became the largest music retailer in the US by 2008",
      "The iPod's success made iTunes the default way to buy music",
      "Selling single songs instead of albums changed how artists released music",
      "Streaming eventually overtook downloads"
    ]
  },
  {
    "id": "spotify-2008",
    "year": 2008,
    "title": "Spotify Launches",
    "shortDesc": "A Swedish startup bets on streaming instead of ownership.",
    "fullDesc": "Spotify launched in Sweden in October 2008 and reached the US in July 2011. It went public on the New York Stock Exchange in April 2018.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "Streaming became the largest source of recorded music revenue",
      "Spotify has more than 600 million monthly users",
      "Taylor Swift pulled her catalog in 2014 and returned in 2017",
      "Artists have argued that streaming pays too little per play"
    ]
  },
  {
    "id": "eras-tour-2023",
    "year": 2023,
    "title": "Taylor Swift's Eras Tour",
    "shortDesc": "A 149-show tour becomes the highest-grossing concert tour ever.",
    "fullDesc": "The Eras Tour began on March 17, 2023 in Glendale, Arizona and ended on December 8, 2024 in Vancouver, with 149 shows.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "It grossed more than $2 billion, the first tour to pass that mark",
      "Demand crashed Ticketmaster in November 2022 and led to a Senate hearing in January 2023",
      "A concert film released in October 2023 earned about $260 million",
      "Economists and city leaders talked about a \"Swift effect\" on local economies"
    ]
  },
  {
    "id": "not-like-us-2024",
    "year": 2024,
    "title": "Kendrick Lamar vs. Drake",
    "shortDesc": "A rap feud ends with \"Not Like Us,\" a song that dominates the year.",
    "fullDesc": "After exchanging diss tracks in spring 2024, Kendrick Lamar released \"Not Like Us\" on May 4, 2024.",
    "era": "Music",
    "image": "",
    "realFacts": [
      "It won five Grammy Awards in February 2025, including Record and Song of the Year",
      "Lamar performed at the Super Bowl LIX halftime show on February 9, 2025",
      "The song reached No. 1 on the Billboard Hot 100",
      "Drake filed a defamation lawsuit against Universal Music Group over the song in January 2025"
    ]
  },
  {
    "id": "jackie-robinson-1947",
    "year": 1947,
    "title": "Jackie Robinson Breaks Baseball's Color Line",
    "shortDesc": "Robinson takes the field for the Brooklyn Dodgers.",
    "fullDesc": "On April 15, 1947, Jackie Robinson became the first Black player in modern Major League Baseball when he played first base for the Brooklyn Dodgers.",
    "era": "Sports",
    "image": "",
    "realFacts": [
      "He won the first Rookie of the Year award",
      "The Negro Leagues declined as baseball integrated",
      "He was inducted into the Hall of Fame in 1962",
      "MLB retired his number 42 across all teams in 1997",
      "Integration of baseball came seven years before Brown v. Board of Education"
    ]
  },
  {
    "id": "rumble-1974",
    "year": 1974,
    "title": "The Rumble in the Jungle",
    "shortDesc": "Muhammad Ali upsets George Foreman in Zaire.",
    "fullDesc": "On October 30, 1974, in Kinshasa, Zaire, Muhammad Ali knocked out heavyweight champion George Foreman in the eighth round using his \"rope-a-dope\" strategy.",
    "era": "Sports",
    "image": "",
    "realFacts": [
      "Ali regained the title he had lost when he was stripped of it in 1967 for refusing the draft",
      "The fight started at 4 a.m. local time for US television audiences",
      "It was promoted by Don King",
      "The 1996 documentary When We Were Kings won an Oscar"
    ]
  },
  {
    "id": "miracle-on-ice-1980",
    "year": 1980,
    "title": "The Miracle on Ice",
    "shortDesc": "A team of American college players beats the Soviet hockey juggernaut.",
    "fullDesc": "On February 22, 1980, at the Winter Olympics in Lake Placid, the US men's hockey team beat the Soviet Union 4 to 3.",
    "era": "Sports",
    "image": "",
    "realFacts": [
      "The US then beat Finland to win the gold medal two days later",
      "The Soviets had won four straight Olympic gold medals",
      "The game came during the Cold War and the Iran hostage crisis",
      "Al Michaels' call \"Do you believe in miracles? Yes!\" became famous"
    ]
  },
  {
    "id": "tiger-masters-1997",
    "year": 1997,
    "title": "Tiger Woods Wins the Masters",
    "shortDesc": "A 21-year-old wins by 12 shots and changes golf.",
    "fullDesc": "On April 13, 1997, Tiger Woods won the Masters by 12 strokes at 18 under par, becoming the youngest champion in tournament history.",
    "era": "Sports",
    "image": "",
    "realFacts": [
      "He was the first Black golfer to win a major championship",
      "He went on to win 15 majors",
      "Prize money and TV audiences in golf rose sharply during his career",
      "In 2019 he won his fifth Masters, 22 years after his first"
    ]
  },
  {
    "id": "jordan-last-shot-1998",
    "year": 1998,
    "title": "Michael Jordan's Last Shot as a Bull",
    "shortDesc": "Jordan wins the 1998 NBA Finals with a jumper over Bryon Russell.",
    "fullDesc": "On June 14, 1998, Michael Jordan hit a go-ahead jump shot with about five seconds left in Game 6 against Utah, clinching the Chicago Bulls' sixth championship in eight years.",
    "era": "Sports",
    "image": "",
    "realFacts": [
      "He retired for the second time in January 1999",
      "He later returned with the Washington Wizards from 2001 to 2003",
      "The 2020 documentary The Last Dance drew record audiences for ESPN",
      "Many fans consider him the greatest basketball player of all time"
    ]
  },
  {
    "id": "bolt-2008",
    "year": 2008,
    "title": "Usain Bolt Stuns Beijing",
    "shortDesc": "A 21-year-old Jamaican sprinter breaks the 100-meter world record while celebrating early.",
    "fullDesc": "On August 16, 2008, Usain Bolt won the Olympic 100 meters in 9.69 seconds, easing up before he crossed the finish line.",
    "era": "Sports",
    "image": "",
    "realFacts": [
      "He broke the 200 meter world record days later in 19.30 seconds",
      "In 2009 he set records of 9.58 and 19.19 that still stand",
      "He won eight Olympic gold medals",
      "He retired from competition in 2017"
    ]
  },
  {
    "id": "messi-world-cup-2022",
    "year": 2022,
    "title": "Argentina Wins the World Cup",
    "shortDesc": "Lionel Messi finally lifts the trophy after a legendary final.",
    "fullDesc": "On December 18, 2022 in Qatar, Argentina beat France on penalties after a 3 to 3 draw in what many call the greatest World Cup final.",
    "era": "Sports",
    "image": "",
    "realFacts": [
      "Messi scored twice in the final and won the Golden Ball as the tournament's best player",
      "Kylian Mbappé scored a hat-trick for France",
      "It was Argentina's third World Cup, after 1978 and 1986",
      "Messi joined Figtree Miami in 2023",
      "It was the first World Cup held in the Middle East and the first played in November and December"
    ]
  }
]
