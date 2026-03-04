import { PDF_PLACEMENT_BANKS } from './placementPdfBanks';
import { ENGLISH_DME_BANKS } from './placementEnglishDmeBanks';

export type PlacementExamKey =
  | 'en-kids'
  | 'en-teens'
  | 'en-adult'
  | 'de-general'
  | 'fr-general'
  | 'es-general'
  | 'it-general'
  | 'ru-general';

export interface PlacementQuestionSeed {
  id: string;
  prompt: string;
  answer: string;
  options?: string[];
  wrongPenalty?: number;
}

export interface PlacementBand {
  min: number;
  max: number;
  label: string;
  cefr?: string;
}

export interface PlacementExamBank {
  key: PlacementExamKey;
  title: string;
  languageId: string;
  ageScope: string;
  sourceFileName: string;
  placementBands?: PlacementBand[];
  questions: PlacementQuestionSeed[];
}

const BASE_PLACEMENT_EXAM_BANKS: Record<PlacementExamKey, PlacementExamBank> = {
  "en-kids": {
    "key": "en-kids",
    "title": "Kids English Placement Test",
    "languageId": "en",
    "ageScope": "7–12",
    "sourceFileName": "kids placement test.pdf",
    "questions": [
      {
        "id": "q-001",
        "prompt": "If you had a headache, you would take a pill.",
        "answer": "True"
      },
      {
        "id": "q-002",
        "prompt": "Some people collect coins.",
        "answer": "True"
      },
      {
        "id": "q-003",
        "prompt": "I could walk when I was 2 months old.",
        "answer": "False"
      },
      {
        "id": "q-004",
        "prompt": "Coins are made of paper.",
        "answer": "False"
      },
      {
        "id": "q-005",
        "prompt": "People often take cough syrup when they have a cough.",
        "answer": "True"
      },
      {
        "id": "q-006",
        "prompt": "A good spy can break the most difficult code.",
        "answer": "True"
      },
      {
        "id": "q-007",
        "prompt": "Selfish people have a lot of friends.",
        "answer": "False"
      },
      {
        "id": "q-008",
        "prompt": "A mechanic repairs cars at the garage.",
        "answer": "True"
      },
      {
        "id": "q-009",
        "prompt": "People usually wear mittens in summer.",
        "answer": "False"
      },
      {
        "id": "q-010",
        "prompt": "We have dinner in the morning.",
        "answer": "False"
      },
      {
        "id": "q-011",
        "prompt": "Boys cannot play football at all.",
        "answer": "False"
      },
      {
        "id": "q-012",
        "prompt": "A cheetah is faster than a snail.",
        "answer": "True"
      },
      {
        "id": "q-013",
        "prompt": "A squirrel likes acorns.",
        "answer": "True"
      },
      {
        "id": "q-014",
        "prompt": "A lemon tastes sweet.",
        "answer": "False"
      },
      {
        "id": "q-015",
        "prompt": "A cat is an unfriendly animal.",
        "answer": "False"
      },
      {
        "id": "q-016",
        "prompt": "Some children are crazy about playing computer games.",
        "answer": "True"
      },
      {
        "id": "q-017",
        "prompt": "It will be hot next summer.",
        "answer": "True"
      },
      {
        "id": "q-018",
        "prompt": "Pinocchio is a wooden puppet.",
        "answer": "True"
      },
      {
        "id": "q-019",
        "prompt": "They sell tickets at the ticket booth.",
        "answer": "True"
      },
      {
        "id": "q-020",
        "prompt": "We keep food in the fridge.",
        "answer": "True"
      },
      {
        "id": "q-021",
        "prompt": "Penguins don't live in Antarctica.",
        "answer": "False"
      },
      {
        "id": "q-022",
        "prompt": "People wash their hands with soap.",
        "answer": "True"
      },
      {
        "id": "q-023",
        "prompt": "Some people watch films with subtitles.",
        "answer": "True"
      },
      {
        "id": "q-024",
        "prompt": "Children often like gum.",
        "answer": "True"
      },
      {
        "id": "q-025",
        "prompt": "A feather is light.",
        "answer": "True"
      },
      {
        "id": "q-026",
        "prompt": "We can buy carrots at the greengrocer's.",
        "answer": "True"
      },
      {
        "id": "q-027",
        "prompt": "Bears sometimes jump.",
        "answer": "True"
      },
      {
        "id": "q-028",
        "prompt": "A rabbit has got two long ears.",
        "answer": "True"
      },
      {
        "id": "q-029",
        "prompt": "Monday is the third day of the week.",
        "answer": "False"
      },
      {
        "id": "q-030",
        "prompt": "A book is made of paper.",
        "answer": "True"
      },
      {
        "id": "q-031",
        "prompt": "A heart is red.",
        "answer": "True"
      },
      {
        "id": "q-032",
        "prompt": "A dog has only one tail.",
        "answer": "True"
      },
      {
        "id": "q-033",
        "prompt": "A pen is made of leather.",
        "answer": "False"
      },
      {
        "id": "q-034",
        "prompt": "People sometimes pick flowers in summer in the garden.",
        "answer": "True"
      },
      {
        "id": "q-035",
        "prompt": "A rainbow is beautiful.",
        "answer": "True"
      },
      {
        "id": "q-036",
        "prompt": "We say ‘an book'.",
        "answer": "False"
      },
      {
        "id": "q-037",
        "prompt": "The plural of a table is tables.",
        "answer": "True"
      },
      {
        "id": "q-038",
        "prompt": "There are not trees in the forest.",
        "answer": "False"
      },
      {
        "id": "q-039",
        "prompt": "Snakes are ugly.",
        "answer": "True"
      },
      {
        "id": "q-040",
        "prompt": "London isn't the capital of England.",
        "answer": "False"
      },
      {
        "id": "q-041",
        "prompt": "An onion isn't a vegetable.",
        "answer": "False"
      },
      {
        "id": "q-042",
        "prompt": "Children play hide-and-seek with friends.",
        "answer": "True"
      },
      {
        "id": "q-043",
        "prompt": "I drink water when I am thirsty.",
        "answer": "True"
      },
      {
        "id": "q-044",
        "prompt": "There is snow in winter.",
        "answer": "True"
      },
      {
        "id": "q-045",
        "prompt": "A nose is a part of the body.",
        "answer": "True"
      },
      {
        "id": "q-046",
        "prompt": "December is the first month of the year.",
        "answer": "False"
      },
      {
        "id": "q-047",
        "prompt": "Seven plus two is nine.",
        "answer": "True"
      },
      {
        "id": "q-048",
        "prompt": "It is hot in summer.",
        "answer": "True"
      },
      {
        "id": "q-049",
        "prompt": "I am reading now.",
        "answer": "False"
      },
      {
        "id": "q-050",
        "prompt": "We can buy meat at the butcher's.",
        "answer": "True"
      },
      {
        "id": "q-051",
        "prompt": "boiled",
        "answer": "frozen"
      },
      {
        "id": "q-052",
        "prompt": "thick",
        "answer": "thin"
      },
      {
        "id": "q-053",
        "prompt": "earn",
        "answer": "lose"
      },
      {
        "id": "q-054",
        "prompt": "cramped",
        "answer": "empty"
      },
      {
        "id": "q-055",
        "prompt": "amusing",
        "answer": "sad"
      },
      {
        "id": "q-056",
        "prompt": "borrow",
        "answer": "lend"
      },
      {
        "id": "q-057",
        "prompt": "clean",
        "answer": "polluted"
      },
      {
        "id": "q-058",
        "prompt": "dirty",
        "answer": "tidy"
      },
      {
        "id": "q-059",
        "prompt": "build",
        "answer": "destroy"
      },
      {
        "id": "q-060",
        "prompt": "soft",
        "answer": "hard"
      },
      {
        "id": "q-061",
        "prompt": "clever",
        "answer": "stupid"
      },
      {
        "id": "q-062",
        "prompt": "stay",
        "answer": "go"
      },
      {
        "id": "q-063",
        "prompt": "cry",
        "answer": "laugh"
      },
      {
        "id": "q-064",
        "prompt": "dark",
        "answer": "light"
      },
      {
        "id": "q-065",
        "prompt": "right",
        "answer": "wrong"
      },
      {
        "id": "q-066",
        "prompt": "sweet",
        "answer": "salty"
      },
      {
        "id": "q-067",
        "prompt": "beautiful",
        "answer": "ugly"
      },
      {
        "id": "q-068",
        "prompt": "evening",
        "answer": "morning"
      },
      {
        "id": "q-069",
        "prompt": "under",
        "answer": "over"
      },
      {
        "id": "q-070",
        "prompt": "short",
        "answer": "long"
      },
      {
        "id": "q-071",
        "prompt": "today",
        "answer": "yesterday"
      },
      {
        "id": "q-072",
        "prompt": "foot",
        "answer": "hand"
      },
      {
        "id": "q-073",
        "prompt": "single",
        "answer": "double"
      },
      {
        "id": "q-074",
        "prompt": "first",
        "answer": "last"
      }
    ]
  },
  "en-teens": {
    "key": "en-teens",
    "title": "Teens English Placement Test",
    "languageId": "en",
    "ageScope": "13–17",
    "sourceFileName": "Teens palcement test.pdf",
    "questions": [
      {
        "id": "q-001",
        "prompt": "The boyfriend has ___ his girlfriend.",
        "answer": "to kiss"
      },
      {
        "id": "q-002",
        "prompt": "Water is ___ than Coke.",
        "answer": "cheaper"
      },
      {
        "id": "q-003",
        "prompt": "The boy plays football very well, ___?",
        "answer": "doesn't he"
      },
      {
        "id": "q-004",
        "prompt": "Martha is the ___ girl in the classroom.",
        "answer": "tallest"
      },
      {
        "id": "q-005",
        "prompt": "Did Charlie tell you the truth? – No, he ___.",
        "answer": "didn't"
      },
      {
        "id": "q-006",
        "prompt": "She ___ to travel around the world.",
        "answer": "would like"
      },
      {
        "id": "q-007",
        "prompt": "___ the kites above the children's heads?",
        "answer": "Are"
      },
      {
        "id": "q-008",
        "prompt": "The doctor ___ be in Manchester tomorrow.",
        "answer": "will"
      },
      {
        "id": "q-009",
        "prompt": "Parents want children to behave ___.",
        "answer": "themselves"
      },
      {
        "id": "q-010",
        "prompt": "If he ___ an accountant, he would be able to add up numbers quickly.",
        "answer": "were"
      },
      {
        "id": "q-011",
        "prompt": "I'm going ___ my favourite cartoon TV tonight.",
        "answer": "to watch"
      },
      {
        "id": "q-012",
        "prompt": "I will cook soup if you ___ some meat and vegetables.",
        "answer": "buy"
      },
      {
        "id": "q-013",
        "prompt": "Are there ___ horses in the park?",
        "answer": "any"
      },
      {
        "id": "q-014",
        "prompt": "Children ___ influenced by television.",
        "answer": "are"
      },
      {
        "id": "q-015",
        "prompt": "___ you have a helicopter?",
        "answer": "Do"
      },
      {
        "id": "q-016",
        "prompt": "Computers are ___ in most schools.",
        "answer": "used"
      },
      {
        "id": "q-017",
        "prompt": "We ___ at school two hours ago.",
        "answer": "were"
      },
      {
        "id": "q-018",
        "prompt": "She may ___ everything.",
        "answer": "sing"
      },
      {
        "id": "q-019",
        "prompt": "Jane ___ a small doll.",
        "answer": "has"
      },
      {
        "id": "q-020",
        "prompt": "My sister ___ me a new doll yesterday.",
        "answer": "bought"
      },
      {
        "id": "q-021",
        "prompt": "There ___ a wallet in his schoolbag.",
        "answer": "is"
      },
      {
        "id": "q-022",
        "prompt": "He ___ a student.",
        "answer": "is"
      },
      {
        "id": "q-023",
        "prompt": "The girls have seen ___ in the room.",
        "answer": "someone"
      },
      {
        "id": "q-024",
        "prompt": "Am I ___ the window?",
        "answer": "opening"
      },
      {
        "id": "q-025",
        "prompt": "Mary ___ some money in the street last year.",
        "answer": "found"
      },
      {
        "id": "q-026",
        "prompt": "If you want to open a bottle, you sometimes need a bottle-opener.",
        "answer": "True"
      },
      {
        "id": "q-027",
        "prompt": "It's crazy to drive fast in thick fog.",
        "answer": "True"
      },
      {
        "id": "q-028",
        "prompt": "We use a raincoat in bad weather.",
        "answer": "True"
      },
      {
        "id": "q-029",
        "prompt": "A Christmas stocking is a long sock in which children find Christmas presents.",
        "answer": "True"
      },
      {
        "id": "q-030",
        "prompt": "Antarctica is a cold continent.",
        "answer": "True"
      },
      {
        "id": "q-031",
        "prompt": "Animals can't live without water.",
        "answer": "True"
      },
      {
        "id": "q-032",
        "prompt": "Children never watch cartoons on TV.",
        "answer": "False"
      },
      {
        "id": "q-033",
        "prompt": "Canaries are large and black.",
        "answer": "False"
      },
      {
        "id": "q-034",
        "prompt": "Knives, forks and spoons are made of metal.",
        "answer": "True"
      },
      {
        "id": "q-035",
        "prompt": "London is the capital of Great Britain.",
        "answer": "True"
      },
      {
        "id": "q-036",
        "prompt": "Plants need water and light in order to grow.",
        "answer": "True"
      },
      {
        "id": "q-037",
        "prompt": "There's often snow at the top of a very high mountain.",
        "answer": "True"
      },
      {
        "id": "q-038",
        "prompt": "We wouldn't be in danger if this building were in flames.",
        "answer": "False"
      },
      {
        "id": "q-039",
        "prompt": "Wednesday is before Thursday.",
        "answer": "True"
      },
      {
        "id": "q-040",
        "prompt": "When a friend lets you down, you feel sorry for yourself.",
        "answer": "True"
      },
      {
        "id": "q-041",
        "prompt": "A team is a group of people who work or play a sport together.",
        "answer": "True"
      },
      {
        "id": "q-042",
        "prompt": "Kind people have a lot of enemies.",
        "answer": "False"
      },
      {
        "id": "q-043",
        "prompt": "Diet and exercise aren't important if you want to be healthy.",
        "answer": "False"
      },
      {
        "id": "q-044",
        "prompt": "There are five letters in the word \"doll\".",
        "answer": "False"
      },
      {
        "id": "q-045",
        "prompt": "It's easy to drive on a foggy day.",
        "answer": "False"
      },
      {
        "id": "q-046",
        "prompt": "There are a lot of words in a dictionary.",
        "answer": "True"
      },
      {
        "id": "q-047",
        "prompt": "‘Motorway' is an American word for ‘underground'.",
        "answer": "False"
      },
      {
        "id": "q-048",
        "prompt": "You can't buy fruit and vegetables at the market.",
        "answer": "False"
      },
      {
        "id": "q-049",
        "prompt": "We eat breakfast in the morning.",
        "answer": "True"
      },
      {
        "id": "q-050",
        "prompt": "Speeding is one of the reasons for road accidents.",
        "answer": "True"
      },
      {
        "id": "q-051",
        "prompt": "entrance",
        "answer": "exit"
      },
      {
        "id": "q-052",
        "prompt": "wizard",
        "answer": "witch"
      },
      {
        "id": "q-053",
        "prompt": "noise",
        "answer": "silence"
      },
      {
        "id": "q-054",
        "prompt": "risky",
        "answer": "safe"
      },
      {
        "id": "q-055",
        "prompt": "salty",
        "answer": "sweet"
      },
      {
        "id": "q-056",
        "prompt": "guilty",
        "answer": "innocent"
      },
      {
        "id": "q-057",
        "prompt": "danger",
        "answer": "safety"
      },
      {
        "id": "q-058",
        "prompt": "quiet",
        "answer": "noisy"
      },
      {
        "id": "q-059",
        "prompt": "alone",
        "answer": "together"
      },
      {
        "id": "q-060",
        "prompt": "strong",
        "answer": "weak"
      },
      {
        "id": "q-061",
        "prompt": "slow",
        "answer": "fast"
      },
      {
        "id": "q-062",
        "prompt": "salt",
        "answer": "sugar"
      },
      {
        "id": "q-063",
        "prompt": "upstairs",
        "answer": "downstairs"
      },
      {
        "id": "q-064",
        "prompt": "buy",
        "answer": "sell"
      },
      {
        "id": "q-065",
        "prompt": "expensive",
        "answer": "cheap"
      },
      {
        "id": "q-066",
        "prompt": "absent",
        "answer": "present"
      },
      {
        "id": "q-067",
        "prompt": "town",
        "answer": "city"
      },
      {
        "id": "q-068",
        "prompt": "open",
        "answer": "closed"
      },
      {
        "id": "q-069",
        "prompt": "hot",
        "answer": "cold"
      },
      {
        "id": "q-070",
        "prompt": "trousers",
        "answer": "skirt"
      }
    ]
  },
  "en-adult": {
    "key": "en-adult",
    "title": "Adult English Placement Test",
    "languageId": "en",
    "ageScope": "18+",
    "sourceFileName": "adult placemen test.pdf",
    "questions": [
      {
        "id": "q-001",
        "prompt": "Stephen King is the writer ___ books I love the most.",
        "answer": "whose"
      },
      {
        "id": "q-002",
        "prompt": "We call a bar ___ you can order raw fish a sushi bar.",
        "answer": "where"
      },
      {
        "id": "q-003",
        "prompt": "If I ___ how serious the disease was, I wouldn't have delayed visiting my physician.",
        "answer": "had realized"
      },
      {
        "id": "q-004",
        "prompt": "Under no circumstances ___ drinks directly on the table's surface.",
        "answer": "can you place"
      },
      {
        "id": "q-005",
        "prompt": "We ___ in this classroom for 40 minutes by 6 p.m.",
        "answer": "will have been sitting"
      },
      {
        "id": "q-006",
        "prompt": "The men, ___ dispatch the parcels, are required to wear special heavy duty boots.",
        "answer": "who"
      },
      {
        "id": "q-007",
        "prompt": "John could ___ his glasses at home. He seldom puts things back in their proper place.",
        "answer": "have left"
      },
      {
        "id": "q-008",
        "prompt": "I hope I ___ 1,800 new words by the end of this course.",
        "answer": "will have picked up"
      },
      {
        "id": "q-009",
        "prompt": "He asked ___ I had ever been abroad.",
        "answer": "if"
      },
      {
        "id": "q-010",
        "prompt": "Never before ___ happier than on the day of his wedding.",
        "answer": "has he felt"
      },
      {
        "id": "q-011",
        "prompt": "People remain in their underwear when they strip naked.",
        "answer": "False"
      },
      {
        "id": "q-012",
        "prompt": "The results of a survey carried out before an election are always the same as the result of the election.",
        "answer": "False"
      },
      {
        "id": "q-013",
        "prompt": "The bottoms of most people's feet are so ticklish that hardly anyone",
        "answer": "True"
      },
      {
        "id": "q-014",
        "prompt": "can bear having their feet tickled with a feather. Reckless driving leads to serious accidents because it involves paying sufficient attention to the traffic.",
        "answer": "False"
      },
      {
        "id": "q-015",
        "prompt": "We call people whose behaviour is consistent with what they preach hypocrites.",
        "answer": "False"
      },
      {
        "id": "q-016",
        "prompt": "It's every government's duty to shield their country's economy against uncertain external circumstances.",
        "answer": "True"
      },
      {
        "id": "q-017",
        "prompt": "It's rather common in the world of organized crime for one crook to double-cross their partners in a felony.",
        "answer": "True"
      },
      {
        "id": "q-018",
        "prompt": "It's extremely hard to adjust to living alone when you've been married and your spouse passes away.",
        "answer": "True"
      },
      {
        "id": "q-019",
        "prompt": "The belly mark which reminds us of the umbilical cord that used to connect us with our mothers is our navel.",
        "answer": "True"
      },
      {
        "id": "q-020",
        "prompt": "High and complicated taxes can deprive companies of the finances required to invest and develop.",
        "answer": "True"
      },
      {
        "id": "q-021",
        "prompt": "If I ___ filthy rich, I would spend my money on expensive paintings.",
        "answer": "were"
      },
      {
        "id": "q-022",
        "prompt": "John was told ___ the antibiotic.",
        "answer": "to take"
      },
      {
        "id": "q-023",
        "prompt": "It's high time we ___ a dentist when we've got a toothache.",
        "answer": "visited"
      },
      {
        "id": "q-024",
        "prompt": "My brother came home tired because he ___ all day.",
        "answer": "had been working"
      },
      {
        "id": "q-025",
        "prompt": "Football Championship last year. The woman said that she ___ waiting there the next day.",
        "answer": "would be"
      },
      {
        "id": "q-026",
        "prompt": "If I had graduated from Oxford University, ___ English perfectly now.",
        "answer": "I'd speak"
      },
      {
        "id": "q-027",
        "prompt": "He ___ so fast if his sister hadn't told him to.",
        "answer": "wouldn't have driven"
      },
      {
        "id": "q-028",
        "prompt": "It would take me about two weeks to get used ___ night shifts.",
        "answer": "to working"
      },
      {
        "id": "q-029",
        "prompt": "We ___ Book 4 before we started studying from Book 6.",
        "answer": "had done"
      },
      {
        "id": "q-030",
        "prompt": "Employees expect their salaries to fall when they are promoted to higher positions.",
        "answer": "False"
      },
      {
        "id": "q-031",
        "prompt": "People are categorically forbidden to leave their houses after the curfew during martial law.",
        "answer": "True"
      },
      {
        "id": "q-032",
        "prompt": "First time parents have to organise their daily routines in such a way as to suit their baby's needs.",
        "answer": "True"
      },
      {
        "id": "q-033",
        "prompt": "If a tree branch swung heavily in a storm, it could break off, fall and injure someone.",
        "answer": "True"
      },
      {
        "id": "q-034",
        "prompt": "Wine, ink and beetroot juice are never difficult to remove if spilt on clothes.",
        "answer": "False"
      },
      {
        "id": "q-035",
        "prompt": "The dead body of a pharaoh was often placed in a pyramid.",
        "answer": "True"
      },
      {
        "id": "q-036",
        "prompt": "When people are well matched in a marriage, they turn against each other and split up afterwards.",
        "answer": "False"
      },
      {
        "id": "q-037",
        "prompt": "It was an attack of pirates that caused the Titanic to sink on her first voyage.",
        "answer": "False"
      },
      {
        "id": "q-038",
        "prompt": "People apply sunscreen to protect their skin and get a nice tan.",
        "answer": "True"
      },
      {
        "id": "q-039",
        "prompt": "We can immediately see all objects clearly when we enter a dark place directly from a brightly-lit one.",
        "answer": "False"
      },
      {
        "id": "q-040",
        "prompt": "Children had better ___ to bed early.",
        "answer": "go"
      },
      {
        "id": "q-041",
        "prompt": "My daughter ___ have longer hair when she was younger.",
        "answer": "used to"
      },
      {
        "id": "q-042",
        "prompt": "She doesn't come here often, ___?",
        "answer": "does she"
      },
      {
        "id": "q-043",
        "prompt": "We had our flat ___ last year.",
        "answer": "painted"
      },
      {
        "id": "q-044",
        "prompt": "Parents sometimes make their children ___ things that they don't like.",
        "answer": "eat"
      },
      {
        "id": "q-045",
        "prompt": "Let's ___ discuss that awesome tape.",
        "answer": "not"
      },
      {
        "id": "q-046",
        "prompt": "People had to get used to ___ online during the 2020 lockdowns.",
        "answer": "working"
      },
      {
        "id": "q-047",
        "prompt": "Is she a princess?",
        "answer": "No, she isn't."
      },
      {
        "id": "q-048",
        "prompt": "A 10 percent salary increase has been ___ to Henry.",
        "answer": "offered"
      },
      {
        "id": "q-049",
        "prompt": "The guest is ___ interviewed at the moment.",
        "answer": "being"
      },
      {
        "id": "q-050",
        "prompt": "When you do physical exercise, your pulse never increases.",
        "answer": "False"
      },
      {
        "id": "q-051",
        "prompt": "Jewellery shops need to take special security measures against robberies.",
        "answer": "True"
      },
      {
        "id": "q-052",
        "prompt": "People wear a false beard or a false moustache when they want to be recognised.",
        "answer": "False"
      },
      {
        "id": "q-053",
        "prompt": "A cook should have an excellent sense of smell and taste.",
        "answer": "True"
      },
      {
        "id": "q-054",
        "prompt": "People need to gain strength after an illness.",
        "answer": "True"
      },
      {
        "id": "q-055",
        "prompt": "Under no circumstances should anyone enter the scene of a crime until the police work is finished.",
        "answer": "True"
      },
      {
        "id": "q-056",
        "prompt": "If you aren't able to squeeze into your clothes, it means that you've lost some weight.",
        "answer": "False"
      },
      {
        "id": "q-057",
        "prompt": "Accountants need to understand all the key financial figures.",
        "answer": "True"
      },
      {
        "id": "q-058",
        "prompt": "Curious people often put their noses into matters that don't concern them.",
        "answer": "True"
      },
      {
        "id": "q-059",
        "prompt": "You should sign a contract before reading it carefully.",
        "answer": "False"
      },
      {
        "id": "q-060",
        "prompt": "If you ___ me a thousand pounds, I would be happy.",
        "answer": "offered"
      },
      {
        "id": "q-061",
        "prompt": "My parents were ___ the flat on Saturday evening.",
        "answer": "cleaning"
      },
      {
        "id": "q-062",
        "prompt": "She may ___ everything.",
        "answer": "say"
      },
      {
        "id": "q-063",
        "prompt": "Purses are ___ of leather.",
        "answer": "made"
      },
      {
        "id": "q-064",
        "prompt": "The president's plane ___ taking off tomorrow at noon.",
        "answer": "will be"
      },
      {
        "id": "q-065",
        "prompt": "She finds it difficult to express ___ because of emotions.",
        "answer": "herself"
      },
      {
        "id": "q-066",
        "prompt": "All letters should ___ signed by the manager.",
        "answer": "be"
      },
      {
        "id": "q-067",
        "prompt": "My wife got angry because I forgot ___ her car to the garage.",
        "answer": "to take"
      },
      {
        "id": "q-068",
        "prompt": "I have ___ to New York twice.",
        "answer": "been"
      },
      {
        "id": "q-069",
        "prompt": "You can't buy many things if you have too ___ money.",
        "answer": "little"
      },
      {
        "id": "q-070",
        "prompt": "We can see the lightning sooner than we can hear the thunder during a thunderstorm.",
        "answer": "True"
      },
      {
        "id": "q-071",
        "prompt": "Diet and exercise are important if you want to be healthy.",
        "answer": "True"
      },
      {
        "id": "q-072",
        "prompt": "People can change the laws of nature.",
        "answer": "False"
      },
      {
        "id": "q-073",
        "prompt": "It's very risky to install anti-virus software on an important device.",
        "answer": "False"
      },
      {
        "id": "q-074",
        "prompt": "We would be in danger if this building were in flames.",
        "answer": "True"
      },
      {
        "id": "q-075",
        "prompt": "When you want to buy something, it's good to compare different products before choosing one.",
        "answer": "True"
      },
      {
        "id": "q-076",
        "prompt": "Employees are never under stress before an appointment with their manager.",
        "answer": "False"
      },
      {
        "id": "q-077",
        "prompt": "It's usually more expensive to buy a return ticket than two single tickets.",
        "answer": "False"
      },
      {
        "id": "q-078",
        "prompt": "A horse is stronger than an elephant.",
        "answer": "False"
      },
      {
        "id": "q-079",
        "prompt": "Kind people have a lot of enemies.",
        "answer": "False"
      },
      {
        "id": "q-080",
        "prompt": "I will cook soup if you ___ some meat and vegetables.",
        "answer": "buy"
      },
      {
        "id": "q-081",
        "prompt": "A train is ___ than a car.",
        "answer": "heavier"
      },
      {
        "id": "q-082",
        "prompt": "The girl often ___ Chinese food.",
        "answer": "eats"
      },
      {
        "id": "q-083",
        "prompt": "Am I ___ the window?",
        "answer": "closing"
      },
      {
        "id": "q-084",
        "prompt": "___ you at school yesterday?",
        "answer": "Were"
      },
      {
        "id": "q-085",
        "prompt": "My daughter can ___ a bike.",
        "answer": "ride"
      },
      {
        "id": "q-086",
        "prompt": "___ like your town?",
        "answer": "Do you"
      },
      {
        "id": "q-087",
        "prompt": "When ___ World War Two start?",
        "answer": "did"
      },
      {
        "id": "q-088",
        "prompt": "Are there ___ students in the classroom?",
        "answer": "any"
      },
      {
        "id": "q-089",
        "prompt": "The police officer will ___ table tennis tomorrow.",
        "answer": "play"
      },
      {
        "id": "q-090",
        "prompt": "It's easy to drive on a foggy day.",
        "answer": "False"
      },
      {
        "id": "q-091",
        "prompt": "We eat breakfast in the evening.",
        "answer": "False"
      },
      {
        "id": "q-092",
        "prompt": "A rabbit has a long tail.",
        "answer": "False"
      },
      {
        "id": "q-093",
        "prompt": "Berlin is a small country.",
        "answer": "False"
      },
      {
        "id": "q-094",
        "prompt": "Children are often afraid of spiders.",
        "answer": "True"
      },
      {
        "id": "q-095",
        "prompt": "Tuesday is the second day of the week.",
        "answer": "True"
      },
      {
        "id": "q-096",
        "prompt": "People are happy when they sleep badly.",
        "answer": "False"
      },
      {
        "id": "q-097",
        "prompt": "It's necessary to pay when we buy something in a shop.",
        "answer": "True"
      },
      {
        "id": "q-098",
        "prompt": "A mouse is a big animal.",
        "answer": "False"
      },
      {
        "id": "q-099",
        "prompt": "Knives and forks are often made of metal.",
        "answer": "True"
      }
    ]
  },
  "de-general": {
    "key": "de-general",
    "title": "Almanca Placement Test",
    "languageId": "de",
    "ageScope": "13+",
    "sourceFileName": "Almanca.pdf",
    "questions": [
      {
        "id": "q-001",
        "prompt": "Wenn ich meinen Kugelschreiber vergessen würde, ___ ich einen Kugelschreiber leihen.",
        "answer": "müsste"
      },
      {
        "id": "q-002",
        "prompt": "Columbus entdeckte Amerika, ___ Barack Obama zum Präsidenten von den Vereinigten Staaten gewählt wurde.",
        "answer": "bevor"
      },
      {
        "id": "q-003",
        "prompt": "Der Mann, dessen Sohn dein Bruder ist, ist am öftesten ___.",
        "answer": "dein Vater"
      },
      {
        "id": "q-004",
        "prompt": "Er spielt Lotto. Er ___.",
        "answer": "kreuzt 6 Zahlen durch"
      },
      {
        "id": "q-005",
        "prompt": "___ nächster Woche fange ich an, mehr zu lernen.",
        "answer": "Ab"
      },
      {
        "id": "q-006",
        "prompt": "Die Autos sind ___ transportiert worden.",
        "answer": "in die Schweiz"
      },
      {
        "id": "q-007",
        "prompt": "Die Eltern lassen ___ mein Zimmer aufräumen.",
        "answer": "mich"
      },
      {
        "id": "q-008",
        "prompt": "Der Betrüger wollte eine alte Frau ___.",
        "answer": "hereinlegen"
      },
      {
        "id": "q-009",
        "prompt": "Der Fahrer fährt zu schnell. Er ___ gegen das Gesetz.",
        "answer": "verstößt"
      },
      {
        "id": "q-010",
        "prompt": "Ich weiß nicht, wie alt er ist. Ich muss mich bei ihm ___.",
        "answer": "erkundigen"
      },
      {
        "id": "q-011",
        "prompt": "Es ist gut, wenn der Kontostand den Ausschlag für die Wahl des Lebenspartners gibt.",
        "answer": "False"
      },
      {
        "id": "q-012",
        "prompt": "Wenn das Opfer eines schweren Unfalls nicht rechtzeitig ins Krankenhaus gekommen wäre, wäre es gestorben.",
        "answer": "True"
      },
      {
        "id": "q-013",
        "prompt": "Die",
        "answer": "Wolkenkratzer sind so hoch, True"
      },
      {
        "id": "q-014",
        "prompt": "dass sie scheinen, die Wolken zu berühren. Die Architektin ist die Frau, die Baupläne anfertigt.",
        "answer": "True"
      },
      {
        "id": "q-015",
        "prompt": "Umweltfreundliche Produkte verursachen keine Umweltzerstörung.",
        "answer": "True"
      },
      {
        "id": "q-016",
        "prompt": "Angst ist ein positives Gefühl.",
        "answer": "False"
      },
      {
        "id": "q-017",
        "prompt": "Das Kind, dem die Eltern etwas verbieten, ist ihnen in der Regel dankbar.",
        "answer": "False"
      },
      {
        "id": "q-018",
        "prompt": "Die Leute können mit ihren Bekannten telefonieren, obwohl sie nicht mehr leben.",
        "answer": "False"
      },
      {
        "id": "q-019",
        "prompt": "Der Zug, aus dem alle Reisenden schon ausgestiegen sind, ist voll.",
        "answer": "False"
      },
      {
        "id": "q-020",
        "prompt": "Wir hätten viele Freunde auf einer einsamen Insel.",
        "answer": "False"
      },
      {
        "id": "q-021",
        "prompt": "Der Arzt untersucht ___.",
        "answer": "den Patienten"
      },
      {
        "id": "q-022",
        "prompt": "Die Eltern sind stolz auf die Kinder, weil sie ___. einen Erfolg erreicht",
        "answer": "haben"
      },
      {
        "id": "q-023",
        "prompt": "Möchtest du viel Geld verdienen, ohne ___?",
        "answer": "viel zu arbeiten"
      },
      {
        "id": "q-024",
        "prompt": "Die Mutter kauft eine Schokolade, ___.",
        "answer": "um sie zu essen"
      },
      {
        "id": "q-025",
        "prompt": "Die Kinder sollen nicht mit den Streichhölzern spielen, ___ können sie das Haus in Brand setzen.",
        "answer": "sonst"
      },
      {
        "id": "q-026",
        "prompt": "Gestern ___ mein Auto geklaut.",
        "answer": "wurde"
      },
      {
        "id": "q-027",
        "prompt": "___ ich am Montag mit ihm sprach, lachte er mich aus.",
        "answer": "Als"
      },
      {
        "id": "q-028",
        "prompt": "Von einem durchschnittlichen Leser werden 2 Bücher pro Jahr ___.",
        "answer": "gelesen"
      },
      {
        "id": "q-029",
        "prompt": "Wenn der Kellner dem Gast Essen bringt, beginnt der Gast ___.",
        "answer": "zu frühstücken"
      },
      {
        "id": "q-030",
        "prompt": "Ich rufe dich morgen ___.",
        "answer": "an"
      },
      {
        "id": "q-031",
        "prompt": "Die Kleidung muss gewaschen werden.",
        "answer": "True"
      },
      {
        "id": "q-032",
        "prompt": "'Ich habe Kopfschmerzen' bedeutet mein Kopf tut mir weh.",
        "answer": "True"
      },
      {
        "id": "q-033",
        "prompt": "Du hast ein Buch geliehen. Das Buch gehört dir.",
        "answer": "False"
      },
      {
        "id": "q-034",
        "prompt": "Kein Gebirge in Europa ist höher als die Alpen. Alpen sind am höchsten.",
        "answer": "True"
      },
      {
        "id": "q-035",
        "prompt": "Der Chef wird von seinem Arbeiter angestellt.",
        "answer": "False"
      },
      {
        "id": "q-036",
        "prompt": "Der Man hilft seiner Frau beim Aufräumen, indem er die ganze Zeit schläft.",
        "answer": "False"
      },
      {
        "id": "q-037",
        "prompt": "Ich zahlte Geld auf mein Konto ein. Jetzt erzähle ich über meine Zukunft.",
        "answer": "False"
      },
      {
        "id": "q-038",
        "prompt": "Heute ist der einunddreißigste Mai. Übermorgen ist der zweite Juni.",
        "answer": "True"
      },
      {
        "id": "q-039",
        "prompt": "In einer alten Zeitung kann man nur aktuelle Informationen finden.",
        "answer": "False"
      },
      {
        "id": "q-040",
        "prompt": "Es regnet. Trotzdem müssen die Arbeiter zur Arbeit fahren.",
        "answer": "True"
      },
      {
        "id": "q-041",
        "prompt": "Dein Hund ist so ___ wie meine Katze.",
        "answer": "groß"
      },
      {
        "id": "q-042",
        "prompt": "Der Fernseher steht ___ Wohnzimmer.",
        "answer": "im"
      },
      {
        "id": "q-043",
        "prompt": "Wir befinden ___ in der Nähe.",
        "answer": "uns"
      },
      {
        "id": "q-044",
        "prompt": "Er findet, ___ er alles weiß.",
        "answer": "dass"
      },
      {
        "id": "q-045",
        "prompt": "Die Leute sprechen über ___ Buch.",
        "answer": "ein"
      },
      {
        "id": "q-046",
        "prompt": "Frau Schmitt, wie ist ___ Telefonnummer?",
        "answer": "Ihre"
      },
      {
        "id": "q-047",
        "prompt": "Das ist der Computer ___.",
        "answer": "des Informatikers"
      },
      {
        "id": "q-048",
        "prompt": "___ waren wir am Mittelmeer.",
        "answer": "Am Wochenende"
      },
      {
        "id": "q-049",
        "prompt": "Es ist möglich, 10 Wörter auswendig ___.",
        "answer": "zu lernen"
      },
      {
        "id": "q-050",
        "prompt": "___ ist das?",
        "answer": "Das ist Anna. Wer"
      },
      {
        "id": "q-051",
        "prompt": "Berlin ist eine Stadt.",
        "answer": "True"
      },
      {
        "id": "q-052",
        "prompt": "Vor einer Stunde bist du ins Ausland gefahren.",
        "answer": "False"
      },
      {
        "id": "q-053",
        "prompt": "Ich plane, meinen Urlaub zu Hause zu verbringen. Ich werde nicht nach Deutschland fahren.",
        "answer": "True"
      },
      {
        "id": "q-054",
        "prompt": "Er ist 18 Jahre alt. Er ist alt.",
        "answer": "False"
      },
      {
        "id": "q-055",
        "prompt": "Tee ohne Zucker ist süß.",
        "answer": "False"
      },
      {
        "id": "q-056",
        "prompt": "Wenn die Leute traurig sind, lachen sie.",
        "answer": "False"
      },
      {
        "id": "q-057",
        "prompt": "Sie liest gern. Sie mag lesen.",
        "answer": "True"
      },
      {
        "id": "q-058",
        "prompt": "Zum Geburtstag kaufe ich meinem Mann einen Schal. Ich kaufe einen Schal für ihn.",
        "answer": "True"
      },
      {
        "id": "q-059",
        "prompt": "Du machst das Licht aus, wenn es in der Nacht dunkel ist und du ein Buch lesen möchtest.",
        "answer": "False"
      },
      {
        "id": "q-060",
        "prompt": "Die Ferien sind länger als das Schuljahr.",
        "answer": "False"
      }
    ]
  },
  "fr-general": {
    "key": "fr-general",
    "title": "Fransızca Placement Test",
    "languageId": "fr",
    "ageScope": "13+",
    "sourceFileName": "Fransızca.pdf",
    "questions": [
      {
        "id": "q-001",
        "prompt": "A votre place, je ___ plus de sport.",
        "answer": "ferais"
      },
      {
        "id": "q-002",
        "prompt": "Nous avons la ___ d'Espagne.",
        "answer": "carte"
      },
      {
        "id": "q-003",
        "prompt": "Nous avons une ___ à l'hôtel.",
        "answer": "réservation"
      },
      {
        "id": "q-004",
        "prompt": "Je ___ parler avec vous.",
        "answer": "souhaitais"
      },
      {
        "id": "q-005",
        "prompt": "Je ferai un tour du monde, quand je ___ au loto.",
        "answer": "j'aurai gagné"
      },
      {
        "id": "q-006",
        "prompt": "C'est la raison pour ___ nous viendrons vous voir.",
        "answer": "laquelle"
      },
      {
        "id": "q-007",
        "prompt": "Je suis parti en voyage sans ___ mon billet.",
        "answer": "avoir réservé"
      },
      {
        "id": "q-008",
        "prompt": "Nous avons ___ une assurance annulation.",
        "answer": "acheté"
      },
      {
        "id": "q-009",
        "prompt": "La semaine dernière nous ___ au cinéma tous les jours.",
        "answer": "sommes allés"
      },
      {
        "id": "q-010",
        "prompt": "Il y a des embouteillages ___ Paris et Versailles.",
        "answer": "entre"
      },
      {
        "id": "q-011",
        "prompt": "Un sandwich ___ fromage et un café.",
        "answer": "au"
      },
      {
        "id": "q-012",
        "prompt": "Comment ___ à Marseille?",
        "answer": "aller"
      },
      {
        "id": "q-013",
        "prompt": "Chaque matin nous nous levons ___ 7h30.",
        "answer": "à"
      },
      {
        "id": "q-014",
        "prompt": "Si j'avais été toi, je n'___.",
        "answer": "aurais rien fait"
      },
      {
        "id": "q-015",
        "prompt": "Hier, j'ai ___ faire les courses.",
        "answer": "dû"
      },
      {
        "id": "q-016",
        "prompt": "Je suis ___ bonne santé.",
        "answer": "en"
      },
      {
        "id": "q-017",
        "prompt": "Tu ___ prendre la voiture.",
        "answer": "peux"
      },
      {
        "id": "q-018",
        "prompt": "J'adore ___.",
        "answer": "visiter"
      },
      {
        "id": "q-019",
        "prompt": "J'ai acheté un dictionnaire ___ deux jours.",
        "answer": "il y a"
      },
      {
        "id": "q-020",
        "prompt": "Nous ___ en juillet.",
        "answer": "sommes"
      },
      {
        "id": "q-021",
        "prompt": "Elle parle ___ langues étrangères.",
        "answer": "plusieurs"
      },
      {
        "id": "q-022",
        "prompt": "C'est ___ mois de janvier.",
        "answer": "au"
      },
      {
        "id": "q-023",
        "prompt": "Elle ___ besoin de temps libre.",
        "answer": "a"
      },
      {
        "id": "q-024",
        "prompt": "Il est célèbre, mais pas ___ célèbre.",
        "answer": "le plus"
      },
      {
        "id": "q-025",
        "prompt": "J'ai ___ l'Andalousie.",
        "answer": "visité"
      },
      {
        "id": "q-026",
        "prompt": "De ___ nationalité êtes-vous?",
        "answer": "quelle"
      },
      {
        "id": "q-027",
        "prompt": "Tu as mal ___ dos.",
        "answer": "au"
      },
      {
        "id": "q-028",
        "prompt": "J'___ dans une maison moderne.",
        "answer": "habite"
      },
      {
        "id": "q-029",
        "prompt": "Mardi est ___ lundi et mercredi.",
        "answer": "entre"
      },
      {
        "id": "q-030",
        "prompt": "Ils voyagent ___ leurs amis.",
        "answer": "autant que"
      },
      {
        "id": "q-031",
        "prompt": "On ne fait pas de sport dans le gymnase.",
        "answer": "False"
      },
      {
        "id": "q-032",
        "prompt": "Je dis au revoir en partant.",
        "answer": "True"
      },
      {
        "id": "q-033",
        "prompt": "Ça sonne occupé, vous vous êtes trompé de numéro.",
        "answer": "False"
      },
      {
        "id": "q-034",
        "prompt": "Le décollage c'est quand l'avion vole.",
        "answer": "False"
      },
      {
        "id": "q-035",
        "prompt": "Je vais à la poste parce que j'ai reçu un avis.",
        "answer": "True"
      },
      {
        "id": "q-036",
        "prompt": "Pour conduire il faut avoir la carte d'identité.",
        "answer": "False"
      },
      {
        "id": "q-037",
        "prompt": "Vous lisez le journal tout en conduisant.",
        "answer": "False"
      },
      {
        "id": "q-038",
        "prompt": "Le vol est direct, vous avez une correspondance à Paris.",
        "answer": "False"
      },
      {
        "id": "q-039",
        "prompt": "Je me sens très bien, je suis en pleine forme.",
        "answer": "True"
      },
      {
        "id": "q-040",
        "prompt": "La boulangerie vend du pain.",
        "answer": "True"
      },
      {
        "id": "q-041",
        "prompt": "On va voir un cardiologue pour prendre soin de son cœur.",
        "answer": "True"
      },
      {
        "id": "q-042",
        "prompt": "J'adore voyager, je suis un grand voyageur.",
        "answer": "True"
      },
      {
        "id": "q-043",
        "prompt": "On ne peut pas envoyer une lettre avec accusé de réception.",
        "answer": "False"
      },
      {
        "id": "q-044",
        "prompt": "C'est une erreur, vous avez fait un mauvais numéro.",
        "answer": "True"
      },
      {
        "id": "q-045",
        "prompt": "La France se trouve à l'ouest de l'Europe.",
        "answer": "True"
      },
      {
        "id": "q-046",
        "prompt": "Quand il pleut, je ne prends pas de parapluie.",
        "answer": "False"
      },
      {
        "id": "q-047",
        "prompt": "Quand ils n'ont pas raison, ils ont tort.",
        "answer": "True"
      },
      {
        "id": "q-048",
        "prompt": "L'automne est après l'été.",
        "answer": "True"
      },
      {
        "id": "q-049",
        "prompt": "Quand on est sportif, on n'est pas musclé.",
        "answer": "False"
      },
      {
        "id": "q-050",
        "prompt": "Je prends mon temps, je me dépêche.",
        "answer": "False"
      },
      {
        "id": "q-051",
        "prompt": "Le garage est au sous-sol.",
        "answer": "True"
      },
      {
        "id": "q-052",
        "prompt": "Elle n'est pas présente, elle est absente.",
        "answer": "True"
      },
      {
        "id": "q-053",
        "prompt": "Je fais les courses avant la fête.",
        "answer": "True"
      },
      {
        "id": "q-054",
        "prompt": "Les livres intéressants sont ennuyeux.",
        "answer": "False"
      },
      {
        "id": "q-055",
        "prompt": "En hiver, il y a du soleil et il fait très chaud.",
        "answer": "False"
      },
      {
        "id": "q-056",
        "prompt": "Je",
        "answer": "sais conduire, j'ai le permis de True"
      },
      {
        "id": "q-057",
        "prompt": "conduire. Nous allons au marché pour acheter des fruits.",
        "answer": "True"
      },
      {
        "id": "q-058",
        "prompt": "On se repose quand on est en vacances.",
        "answer": "True"
      },
      {
        "id": "q-059",
        "prompt": "Il est majeur, il a quinze ans.",
        "answer": "False"
      },
      {
        "id": "q-060",
        "prompt": "Pour voyager je n'ai pas besoin d'argent.",
        "answer": "False"
      },
      {
        "id": "q-061",
        "prompt": "fixe",
        "answer": "portable"
      },
      {
        "id": "q-062",
        "prompt": "entraîneur",
        "answer": "sportif"
      },
      {
        "id": "q-063",
        "prompt": "précédent",
        "answer": "suivant"
      },
      {
        "id": "q-064",
        "prompt": "coller",
        "answer": "copier"
      },
      {
        "id": "q-065",
        "prompt": "contestée",
        "answer": "indiscutable"
      },
      {
        "id": "q-066",
        "prompt": "destinataire",
        "answer": "expéditeur"
      },
      {
        "id": "q-067",
        "prompt": "épuisé",
        "answer": "disponible"
      },
      {
        "id": "q-068",
        "prompt": "hésiter",
        "answer": "décider"
      },
      {
        "id": "q-069",
        "prompt": "rendre",
        "answer": "emprunter"
      },
      {
        "id": "q-070",
        "prompt": "bon",
        "answer": "mauvais"
      },
      {
        "id": "q-071",
        "prompt": "étroit",
        "answer": "large"
      },
      {
        "id": "q-072",
        "prompt": "campagne",
        "answer": "village"
      },
      {
        "id": "q-073",
        "prompt": "cher",
        "answer": "bon marché"
      },
      {
        "id": "q-074",
        "prompt": "pleurer",
        "answer": "rire"
      },
      {
        "id": "q-075",
        "prompt": "toujours",
        "answer": "jamais"
      },
      {
        "id": "q-076",
        "prompt": "chaud",
        "answer": "froid"
      },
      {
        "id": "q-077",
        "prompt": "nuit",
        "answer": "jour"
      },
      {
        "id": "q-078",
        "prompt": "basse",
        "answer": "haut"
      },
      {
        "id": "q-079",
        "prompt": "avant",
        "answer": "après"
      },
      {
        "id": "q-080",
        "prompt": "fermé",
        "answer": "ouvert"
      }
    ]
  },
  "es-general": {
    "key": "es-general",
    "title": "İspanyolca Placement Test",
    "languageId": "es",
    "ageScope": "13+",
    "sourceFileName": "İspanyolca.pdf",
    "questions": [
      {
        "id": "q-001",
        "prompt": "La profesora le preguntó que dónde ___ a su marido.",
        "answer": "había conocido"
      },
      {
        "id": "q-002",
        "prompt": "___ mucho más fácil si nos adaptáramos a vivir juntos y en paz.",
        "answer": "Sería"
      },
      {
        "id": "q-003",
        "prompt": "Ayer cuando llegué a la escuela, la clase todavía no ___.",
        "answer": "había empezado"
      },
      {
        "id": "q-004",
        "prompt": "Quise saber el ___ de la vida desde que tenía siete años.",
        "answer": "porqué"
      },
      {
        "id": "q-005",
        "prompt": "Siempre queremos que ___ pronto las vacaciones.",
        "answer": "empiecen"
      },
      {
        "id": "q-006",
        "prompt": "___ tenga problemas, siempre sonrío.",
        "answer": "Aunque"
      },
      {
        "id": "q-007",
        "prompt": "Si mis hijos se pusieran enfermos, les ___ al médico.",
        "answer": "llevaría"
      },
      {
        "id": "q-008",
        "prompt": "La disminución del hielo en los polos es ___ la contaminación.",
        "answer": "por"
      },
      {
        "id": "q-009",
        "prompt": "Creo que ___ a menudo, seremos más accesibles y amigables a los demás.",
        "answer": "sonriendo"
      },
      {
        "id": "q-010",
        "prompt": "Por favor no ___ tarde hoy a casa ¿Vale?",
        "answer": "vengas"
      },
      {
        "id": "q-011",
        "prompt": "Los astrónomos estudian el comportamiento de los planetas.",
        "answer": "True"
      },
      {
        "id": "q-012",
        "prompt": "Se puede fumar en clase.",
        "answer": "False"
      },
      {
        "id": "q-013",
        "prompt": "Los sindicatos protestan la desigualdad de salarios con huelgas.",
        "answer": "True"
      },
      {
        "id": "q-014",
        "prompt": "La gente amigable que siempre quiere echar una mano nos cae mal.",
        "answer": "False"
      },
      {
        "id": "q-015",
        "prompt": "El Ártico está en el Polo Sur y el Antártico está en el Polo Norte.",
        "answer": "False"
      },
      {
        "id": "q-016",
        "prompt": "Es bueno tener muchas fallas en el examen.",
        "answer": "False"
      },
      {
        "id": "q-017",
        "prompt": "Los sordomudos se comunican a través del lenguaje de señas.",
        "answer": "True"
      },
      {
        "id": "q-018",
        "prompt": "El juez juzga a la gente culpable de delitos en los tribunales de justicia.",
        "answer": "True"
      },
      {
        "id": "q-019",
        "prompt": "Si trabajara a paso de tortuga, me echarían de mi empleo.",
        "answer": "True"
      },
      {
        "id": "q-020",
        "prompt": "Un pozo es curioso y muy valioso en el desierto.",
        "answer": "True"
      },
      {
        "id": "q-021",
        "prompt": "Mi marido se mantiene en forma ___ ejercicio.",
        "answer": "haciendo"
      },
      {
        "id": "q-022",
        "prompt": "El profesor dice: ¡No ___ otro idioma en clase!",
        "answer": "habléis"
      },
      {
        "id": "q-023",
        "prompt": "El mar Báltico está muy ___ por el uso excesivo de químicos.",
        "answer": "contaminado"
      },
      {
        "id": "q-024",
        "prompt": "Ellos dijeron que ___ a educarles con paciencia y amor.",
        "answer": "iban"
      },
      {
        "id": "q-025",
        "prompt": "El uso excesivo de químicos está ___ el ecosistema acuático del planeta.",
        "answer": "destruyendo"
      },
      {
        "id": "q-026",
        "prompt": "Es horrible que la gente ___ que todo es imposible.",
        "answer": "piense"
      },
      {
        "id": "q-027",
        "prompt": "La libertad de prensa ___ apoyada por todos aquí.",
        "answer": "es"
      },
      {
        "id": "q-028",
        "prompt": "Las próximas vacaciones ___ a Uruguay.",
        "answer": "iremos"
      },
      {
        "id": "q-029",
        "prompt": "Quiero que ojalá ___ pronto más políticos honestos.",
        "answer": "haya"
      },
      {
        "id": "q-030",
        "prompt": "En esta ciudad antes ___ mucho coches y bicicletas.",
        "answer": "robaban"
      },
      {
        "id": "q-031",
        "prompt": "Estornudo cuando estoy un poco resfriado.",
        "answer": "True"
      },
      {
        "id": "q-032",
        "prompt": "En noviembre suben mucho las temperaturas en Europa.",
        "answer": "False"
      },
      {
        "id": "q-033",
        "prompt": "El aire con mucho humo es bueno para los pulmones.",
        "answer": "False"
      },
      {
        "id": "q-034",
        "prompt": "Una persona educada nunca dice por favor, gracias, lo siento, perdón.",
        "answer": "False"
      },
      {
        "id": "q-035",
        "prompt": "Un jugador amateur gana satisfacción cuando gana un partido de fútbol.",
        "answer": "True"
      },
      {
        "id": "q-036",
        "prompt": "La plata es más cara que el oro.",
        "answer": "False"
      },
      {
        "id": "q-037",
        "prompt": "Los jóvenes consiguen empleos temporales en tiendas o restaurantes.",
        "answer": "True"
      },
      {
        "id": "q-038",
        "prompt": "Un intérprete traduce simultáneamente lo que alguien dice.",
        "answer": "True"
      },
      {
        "id": "q-039",
        "prompt": "Es natural que sientas frío en invierno.",
        "answer": "True"
      },
      {
        "id": "q-040",
        "prompt": "Alguien perfeccionista hace todo correctamente.",
        "answer": "True"
      },
      {
        "id": "q-041",
        "prompt": "Ayer la clase ___ interesante y divertida.",
        "answer": "fue"
      },
      {
        "id": "q-042",
        "prompt": "Mi hija llora ___ no tener que ponerse.",
        "answer": "por"
      },
      {
        "id": "q-043",
        "prompt": "Los alumnos ___ que estudiar en casa.",
        "answer": "tienen"
      },
      {
        "id": "q-044",
        "prompt": "Nikola Tesla ___ el mando a distancia.",
        "answer": "inventó"
      },
      {
        "id": "q-045",
        "prompt": "El sábado vamos a ___ la compra en el supermercado.",
        "answer": "hacer"
      },
      {
        "id": "q-046",
        "prompt": "Si vais a las montañas, ___ un chalé.",
        "answer": "alquilad"
      },
      {
        "id": "q-047",
        "prompt": "Mi madre ha ___ pescado al horno.",
        "answer": "hecho"
      },
      {
        "id": "q-048",
        "prompt": "Mis compañeros de clase están ___ español conmigo.",
        "answer": "estudiando"
      },
      {
        "id": "q-049",
        "prompt": "A las alumnas de mi colegio no les ___ la educación física.",
        "answer": "gustaba"
      },
      {
        "id": "q-050",
        "prompt": "El año pasado ella ___ en el extranjero.",
        "answer": "vivió"
      },
      {
        "id": "q-051",
        "prompt": "Compramos un jarabe para la tos en la farmacia.",
        "answer": "True"
      },
      {
        "id": "q-052",
        "prompt": "Mi hermana es mayor que mi madre.",
        "answer": "False"
      },
      {
        "id": "q-053",
        "prompt": "Antes de cruzar una calle hay que mirar a ambos lados.",
        "answer": "True"
      },
      {
        "id": "q-054",
        "prompt": "Los turistas buscan información en la lavandería.",
        "answer": "False"
      },
      {
        "id": "q-055",
        "prompt": "En la papelería venden tijeras, calculadoras, papel y reglas.",
        "answer": "True"
      },
      {
        "id": "q-056",
        "prompt": "Los taxistas conducen con los ojos cerrados.",
        "answer": "False"
      },
      {
        "id": "q-057",
        "prompt": "El limón tiene sabor ácido.",
        "answer": "True"
      },
      {
        "id": "q-058",
        "prompt": "Un recién nacido camina rápido.",
        "answer": "False"
      },
      {
        "id": "q-059",
        "prompt": "Apagamos la chimenea con una cerilla.",
        "answer": "False"
      },
      {
        "id": "q-060",
        "prompt": "El cigarrillo es nocivo para la salud.",
        "answer": "True"
      },
      {
        "id": "q-061",
        "prompt": "No tengo ___ pantalones de pana.",
        "answer": "ningunos"
      },
      {
        "id": "q-062",
        "prompt": "Ella no ___ tonta y antipática.",
        "answer": "es"
      },
      {
        "id": "q-063",
        "prompt": "Mis hijos ___ la escuela a las nueve.",
        "answer": "empiezan"
      },
      {
        "id": "q-064",
        "prompt": "El estudiante ___ muchas amigas guapas.",
        "answer": "tiene"
      },
      {
        "id": "q-065",
        "prompt": "Yo ___ feliz cuando es mi cumpleaños.",
        "answer": "estoy"
      },
      {
        "id": "q-066",
        "prompt": "En esta ciudad viven actrices ___.",
        "answer": "famosas"
      },
      {
        "id": "q-067",
        "prompt": "___ llamo Solomeo Paredes.",
        "answer": "Me"
      },
      {
        "id": "q-068",
        "prompt": "La gente inteligente ___ música clásica.",
        "answer": "escucha"
      },
      {
        "id": "q-069",
        "prompt": "¿Cuándo haces la compra? - ___ hago por la mañana.",
        "answer": "La"
      },
      {
        "id": "q-070",
        "prompt": "A mi mujer ___ doy flores todos los días.",
        "answer": "le"
      },
      {
        "id": "q-071",
        "prompt": "La madre de mi madre es mi abuela.",
        "answer": "True"
      },
      {
        "id": "q-072",
        "prompt": "El puma es un animal doméstico.",
        "answer": "False"
      },
      {
        "id": "q-073",
        "prompt": "La comida mexicana no es picante.",
        "answer": "False"
      },
      {
        "id": "q-074",
        "prompt": "Elton John es un famoso cantante y pianista británico.",
        "answer": "True"
      },
      {
        "id": "q-075",
        "prompt": "Después del miércoles está el jueves.",
        "answer": "True"
      },
      {
        "id": "q-076",
        "prompt": "Comemos la carne con tenedor y cuchillo.",
        "answer": "True"
      },
      {
        "id": "q-077",
        "prompt": "La mesa está en el techo.",
        "answer": "False"
      },
      {
        "id": "q-078",
        "prompt": "Estamos felizes cuando estamos enfermos.",
        "answer": "False"
      },
      {
        "id": "q-079",
        "prompt": "En una ciudad grande hay mucho tráfico y atascos por la tarde.",
        "answer": "True"
      },
      {
        "id": "q-080",
        "prompt": "En el mercado venden carnes, frutas y verduras.",
        "answer": "True"
      }
    ]
  },
  "it-general": {
    "key": "it-general",
    "title": "İtalyanca Placement Test",
    "languageId": "it",
    "ageScope": "13+",
    "sourceFileName": "İtalyanca.pdf",
    "questions": [
      {
        "id": "q-001",
        "prompt": "Il gatto ___ in cucina.",
        "answer": "dorme"
      },
      {
        "id": "q-002",
        "prompt": "Quanti film avete visto?",
        "answer": "Ne abbiamo visti due"
      },
      {
        "id": "q-003",
        "prompt": "Gli italiani ___ spesso il vino.",
        "answer": "bevono"
      },
      {
        "id": "q-004",
        "prompt": "Quando",
        "answer": "___ all' università studiavo / abitavo"
      },
      {
        "id": "q-005",
        "prompt": "La tigre ___ in Asia.",
        "answer": "vive"
      },
      {
        "id": "q-006",
        "prompt": "___ con la mia amica in biblioteca.",
        "answer": "studierò"
      },
      {
        "id": "q-007",
        "prompt": "Gli studenti ___ un libro.",
        "answer": "hanno letto"
      },
      {
        "id": "q-008",
        "prompt": "Io ___ volentieri a casa tua domani veno viene vengo",
        "answer": "vengo"
      },
      {
        "id": "q-009",
        "prompt": "I turisti ___ per due settimane.",
        "answer": "rimangono"
      },
      {
        "id": "q-010",
        "prompt": "Il professore dice agli studenti : ___ buon educati!",
        "answer": "siano"
      },
      {
        "id": "q-011",
        "prompt": "I cinesi vivono in Cina.",
        "answer": "True"
      },
      {
        "id": "q-012",
        "prompt": "Il 60° anniversario del matrimonio si chiama le nozze di diamante.",
        "answer": "True"
      },
      {
        "id": "q-013",
        "prompt": "A luglio fa caldo.",
        "answer": "True"
      },
      {
        "id": "q-014",
        "prompt": "Il coniglio non vive in Europa.",
        "answer": "False"
      },
      {
        "id": "q-015",
        "prompt": "La persona onesta non fa delle cose buone.",
        "answer": "False"
      },
      {
        "id": "q-016",
        "prompt": "In Africa la gente muore di fame.",
        "answer": "True"
      },
      {
        "id": "q-017",
        "prompt": "Le forbici servono per tagliare.",
        "answer": "True"
      },
      {
        "id": "q-018",
        "prompt": "La tazza si usa per bere il vino.",
        "answer": "False"
      },
      {
        "id": "q-019",
        "prompt": "Sabato è tra venerdì e domenica.",
        "answer": "True"
      },
      {
        "id": "q-020",
        "prompt": "Babbo Natale non dà i regali ai bambini buoni.",
        "answer": "False"
      },
      {
        "id": "q-021",
        "prompt": "L'insegnante ___ informazioni agli studenti.",
        "answer": "dà"
      },
      {
        "id": "q-022",
        "prompt": "La lingua sueca ___ facile.",
        "answer": "è"
      },
      {
        "id": "q-023",
        "prompt": "Oggi noi ___ la spesa.",
        "answer": "facciamo"
      },
      {
        "id": "q-024",
        "prompt": "Io ___ andato all'estero l'anno scorso.",
        "answer": "sono"
      },
      {
        "id": "q-025",
        "prompt": "Gli studenti ___ il professore.",
        "answer": "ascoltano"
      },
      {
        "id": "q-026",
        "prompt": "Il mio amico è ___ al lavoro due ore fa.",
        "answer": "corso"
      },
      {
        "id": "q-027",
        "prompt": "Le loro figlie sono ___ .",
        "answer": "stanche"
      },
      {
        "id": "q-028",
        "prompt": "Mangiamo ___ spaghetti.",
        "answer": "la"
      },
      {
        "id": "q-029",
        "prompt": "I pomodori ___ rossi.",
        "answer": "sono"
      },
      {
        "id": "q-030",
        "prompt": "Hai incontrato Tessa?",
        "answer": "l'ho incontrata"
      },
      {
        "id": "q-031",
        "prompt": "L'anello d'oro è costoso.",
        "answer": "True"
      },
      {
        "id": "q-032",
        "prompt": "Di solito festeggiamo la Pasqua a dicembre.",
        "answer": "False"
      },
      {
        "id": "q-033",
        "prompt": "Di solito la gente aiuta le fondazioni.",
        "answer": "True"
      },
      {
        "id": "q-034",
        "prompt": "Il giardiniere lavora in banca.",
        "answer": "False"
      },
      {
        "id": "q-035",
        "prompt": "Anche la gente povera vive in Europa.",
        "answer": "False"
      },
      {
        "id": "q-036",
        "prompt": "Marzo è tra luglio e aprile.",
        "answer": "False"
      },
      {
        "id": "q-037",
        "prompt": "L'acqua bolle a cento gradi.",
        "answer": "True"
      },
      {
        "id": "q-038",
        "prompt": "Ogni cittadino ha il diritto di votare durante le elezioni.",
        "answer": "True"
      },
      {
        "id": "q-039",
        "prompt": "Gli statunitensi vengono dagli Stati Uniti.",
        "answer": "True"
      },
      {
        "id": "q-040",
        "prompt": "Il cane abita nella cuccia.",
        "answer": "True"
      },
      {
        "id": "q-041",
        "prompt": "La casalinga è una donna che lavora in ufficio.",
        "answer": "False"
      },
      {
        "id": "q-042",
        "prompt": "Nel deserto vivono i cani.",
        "answer": "False"
      },
      {
        "id": "q-043",
        "prompt": "Quattro è prima di tre.",
        "answer": "False"
      },
      {
        "id": "q-044",
        "prompt": "A maggio nevica.",
        "answer": "False"
      },
      {
        "id": "q-045",
        "prompt": "Di solito gli uomini fanno la barba e fanno la doccia di mattina.",
        "answer": "True"
      },
      {
        "id": "q-046",
        "prompt": "Il primo giorno della settimana è sabato.",
        "answer": "False"
      },
      {
        "id": "q-047",
        "prompt": "Il pettine serve per fare una pettinatura.",
        "answer": "True"
      },
      {
        "id": "q-048",
        "prompt": "I bambini bevono il caffè per colazione.",
        "answer": "False"
      },
      {
        "id": "q-049",
        "prompt": "Le melanzane sono viola.",
        "answer": "True"
      },
      {
        "id": "q-050",
        "prompt": "I bambini non nascono mai negli ospedali.",
        "answer": "False"
      },
      {
        "id": "q-051",
        "prompt": "Giovanni non pensa ___ Maria.",
        "answer": "a"
      },
      {
        "id": "q-052",
        "prompt": "La nonna ___ tutto il giorno.",
        "answer": "ha dormito"
      },
      {
        "id": "q-053",
        "prompt": "Andiamo al cinema con le ___ .",
        "answer": "colleghe"
      },
      {
        "id": "q-054",
        "prompt": "Le scarpe nuove mi ___ molto eleganti.",
        "answer": "paiono"
      },
      {
        "id": "q-055",
        "prompt": "Pietro ___ diciannove anni.",
        "answer": "ha"
      },
      {
        "id": "q-056",
        "prompt": "Torniamo",
        "answer": "dall'"
      },
      {
        "id": "q-057",
        "prompt": "A luglio siete in Francia? Si, ___ siamo a luglio.",
        "answer": "ci"
      },
      {
        "id": "q-058",
        "prompt": "I capelli ___ lisci e marroni.",
        "answer": "sono"
      },
      {
        "id": "q-059",
        "prompt": "Guardano le fotografie? Si, ___ guardano.",
        "answer": "le"
      },
      {
        "id": "q-060",
        "prompt": "Ridiamo ___ barzellette di Claudio.",
        "answer": "delle"
      }
    ]
  },
  "ru-general": {
    "key": "ru-general",
    "title": "Rusça Placement Test",
    "languageId": "ru",
    "ageScope": "13+",
    "sourceFileName": "Rusça .pdf",
    "questions": [
      {
        "id": "q-001",
        "prompt": "___ он вернулся?",
        "answer": "Откуда"
      },
      {
        "id": "q-002",
        "prompt": "Нам нужны будут пять ___ .",
        "answer": "тарелок"
      },
      {
        "id": "q-003",
        "prompt": "Я не люблю смотреть ___ фильмы.",
        "answer": "скучные"
      },
      {
        "id": "q-004",
        "prompt": "___ это тетрадь?",
        "answer": "Чья"
      },
      {
        "id": "q-005",
        "prompt": "___ они и ругаются часто, они любят друг друга.",
        "answer": "хотя"
      },
      {
        "id": "q-006",
        "prompt": "Я знаю ___ человека, чем он.",
        "answer": "более привлекательного"
      },
      {
        "id": "q-007",
        "prompt": "Продавец показывает товар ___ .",
        "answer": "клиенту"
      },
      {
        "id": "q-008",
        "prompt": "Ты часто слушаешь ___ ?",
        "answer": "тихую музыку"
      },
      {
        "id": "q-009",
        "prompt": "Я ___ вас завтра на вокзале.",
        "answer": "встречу"
      },
      {
        "id": "q-010",
        "prompt": "Когда они увидели своего сына, они заплакали ___ счастья.",
        "answer": "от"
      },
      {
        "id": "q-011",
        "prompt": "В этом году бытовая техника подорожала ___ два раза.",
        "answer": "в"
      },
      {
        "id": "q-012",
        "prompt": "Человека после сорока можно назвать ___ .",
        "answer": "зрелым"
      },
      {
        "id": "q-013",
        "prompt": "Доктор спросил меня, ___ какие нибудь витамины.",
        "answer": "принимаю ли я"
      },
      {
        "id": "q-014",
        "prompt": "Мои друзья ___ в этом офисе.",
        "answer": "работают"
      },
      {
        "id": "q-015",
        "prompt": "13.40 – это ___ .",
        "answer": "без двадцати два"
      },
      {
        "id": "q-016",
        "prompt": "Из последней командировки папа ___ нам много подарков.",
        "answer": "привёз"
      },
      {
        "id": "q-017",
        "prompt": "Как ___ зовут?",
        "answer": "её"
      },
      {
        "id": "q-018",
        "prompt": "В нашем зоопарке родились три маленьких ___ .",
        "answer": "слонёнка"
      },
      {
        "id": "q-019",
        "prompt": "Вчера мы были ___ .",
        "answer": "дома"
      },
      {
        "id": "q-020",
        "prompt": "Мы ___ жили около моря.",
        "answer": "когда-то"
      },
      {
        "id": "q-021",
        "prompt": "___ часов ты работаешь?",
        "answer": "Сколько"
      },
      {
        "id": "q-022",
        "prompt": "Когда будешь выходить, ___ свет, пожалуйста.",
        "answer": "выключи"
      },
      {
        "id": "q-023",
        "prompt": "Сегодня на уроке нет ___ учениц.",
        "answer": "четырёх"
      },
      {
        "id": "q-024",
        "prompt": "В поезде сидело ___ мужчин.",
        "answer": "трое"
      },
      {
        "id": "q-025",
        "prompt": "Завтра ___ надо будет забронировать номер в гостинице.",
        "answer": "моей сестре"
      },
      {
        "id": "q-026",
        "prompt": "У нас было много времени, ___ мы пошли пешком.",
        "answer": "поэтому"
      },
      {
        "id": "q-027",
        "prompt": "Когда я был ребёнком, я хотел стать ___ .",
        "answer": "строителем"
      },
      {
        "id": "q-028",
        "prompt": "Мы подходим к ___ в девятнадцатом веке кирпичному дому.",
        "answer": "построенному"
      },
      {
        "id": "q-029",
        "prompt": "Всех учеников в следующую пятницу ___ в зоопарк.",
        "answer": "ведут"
      },
      {
        "id": "q-030",
        "prompt": "___ болельщика встали, когда вошёл судья.",
        "answer": "оба"
      },
      {
        "id": "q-031",
        "prompt": "___ вы сядете за стол ужинать, помойте руки.",
        "answer": "перед тем как"
      },
      {
        "id": "q-032",
        "prompt": "В нашей библиотеке нет ___ .",
        "answer": "интересных книг"
      },
      {
        "id": "q-033",
        "prompt": "Преподаватель записывал все в маленькой ___ .",
        "answer": "тетрадочке"
      },
      {
        "id": "q-034",
        "prompt": "Машины стоят на ___ .",
        "answer": "улицах"
      },
      {
        "id": "q-035",
        "prompt": "У меня нет даже ___ рублей в кошельке.",
        "answer": "пятидесяти"
      },
      {
        "id": "q-036",
        "prompt": "Это моя сестра. А вот ___ родители.",
        "answer": "наши"
      },
      {
        "id": "q-037",
        "prompt": "Ты умеешь ___ суп?",
        "answer": "варить"
      },
      {
        "id": "q-038",
        "prompt": "Если хочешь поиграть в футбол, ___ спортивный костюм.",
        "answer": "надень"
      },
      {
        "id": "q-039",
        "prompt": "Учитель говорит о ___ предложении.",
        "answer": "длинном"
      },
      {
        "id": "q-040",
        "prompt": "Мы любим гулять в ___ .",
        "answer": "парке"
      },
      {
        "id": "q-041",
        "prompt": "Утром мы завтракаем.",
        "answer": "True"
      },
      {
        "id": "q-042",
        "prompt": "Никто не любит острую пищу.",
        "answer": "False"
      },
      {
        "id": "q-043",
        "prompt": "При простуде у больного часто высокая температура.",
        "answer": "True"
      },
      {
        "id": "q-044",
        "prompt": "Летом ночи короткие.",
        "answer": "True"
      },
      {
        "id": "q-045",
        "prompt": "Овощные соки полезные.",
        "answer": "True"
      },
      {
        "id": "q-046",
        "prompt": "Осенью больше туманных дней, чем летом.",
        "answer": "True"
      },
      {
        "id": "q-047",
        "prompt": "Сентябрь – девятый месяц.",
        "answer": "True"
      },
      {
        "id": "q-048",
        "prompt": "Художник не нарисует картину, если ему не на чем её рисовать.",
        "answer": "True"
      },
      {
        "id": "q-049",
        "prompt": "Живущим в сельской местности людям нельзя выращивать тюльпаны.",
        "answer": "False"
      },
      {
        "id": "q-050",
        "prompt": "Клубника и малина – красные ягоды.",
        "answer": "True"
      },
      {
        "id": "q-051",
        "prompt": "У богатых людей много денег.",
        "answer": "True"
      },
      {
        "id": "q-052",
        "prompt": "Все родственники любят общаться друг с другом.",
        "answer": "False"
      },
      {
        "id": "q-053",
        "prompt": "Ребёнка трёхлетнего возраста можно оставлять одного дома.",
        "answer": "False"
      },
      {
        "id": "q-054",
        "prompt": "На день рождения маленькие дети могут получить игрушку в подарок.",
        "answer": "True"
      },
      {
        "id": "q-055",
        "prompt": "В поездах нельзя сидеть около окна.",
        "answer": "False"
      },
      {
        "id": "q-056",
        "prompt": "Блины можно сделать без яиц и муки.",
        "answer": "False"
      },
      {
        "id": "q-057",
        "prompt": "Всем людям нравятся путешествия.",
        "answer": "False"
      },
      {
        "id": "q-058",
        "prompt": "Белки такие же опасные животные, как акулы.",
        "answer": "False"
      },
      {
        "id": "q-059",
        "prompt": "Когда люди слишком мало едят, они худеют.",
        "answer": "True"
      },
      {
        "id": "q-060",
        "prompt": "«Двоюродный брат» – это то же самое, что «мамин брат».",
        "answer": "False"
      },
      {
        "id": "q-061",
        "prompt": "Когда на улице жарко, люди носят тёплую одежду.",
        "answer": "False"
      },
      {
        "id": "q-062",
        "prompt": "Курение и употребление спиртных напитков полезно для нашего здоровья.",
        "answer": "False"
      },
      {
        "id": "q-063",
        "prompt": "Если человек отравился, у него может идти кровь из пальца.",
        "answer": "False"
      },
      {
        "id": "q-064",
        "prompt": "Поджаренное позавчера мясо безопасно будет употреблять через шесть дней.",
        "answer": "False"
      },
      {
        "id": "q-065",
        "prompt": "Родители гордятся успехами своих детей.",
        "answer": "True"
      },
      {
        "id": "q-066",
        "prompt": "Высоким мужчинам неудобно ездить в маленьких машинах.",
        "answer": "True"
      },
      {
        "id": "q-067",
        "prompt": "Много людей встаёт на работу по будильнику.",
        "answer": "True"
      },
      {
        "id": "q-068",
        "prompt": "Если не держать молоко в холодильнике, оно быстрее прокиснет.",
        "answer": "True"
      },
      {
        "id": "q-069",
        "prompt": "Награду получает победивший в соревновании спортсмен.",
        "answer": "True"
      },
      {
        "id": "q-070",
        "prompt": "В номерах гостиниц обычно есть мыло и полотенце.",
        "answer": "True"
      },
      {
        "id": "q-071",
        "prompt": "Врачи работают в больнице.",
        "answer": "True"
      },
      {
        "id": "q-072",
        "prompt": "Опытные работники получают более низкую зарплату.",
        "answer": "False"
      },
      {
        "id": "q-073",
        "prompt": "Взрослым нужно спать больше, чем детям.",
        "answer": "False"
      },
      {
        "id": "q-074",
        "prompt": "Зимой деревья жёлтые.",
        "answer": "False"
      },
      {
        "id": "q-075",
        "prompt": "Футбольная команда может состоять из тридцати игроков.",
        "answer": "False"
      },
      {
        "id": "q-076",
        "prompt": "У итальянцев более загорелая кожа, чем у шведов.",
        "answer": "True"
      },
      {
        "id": "q-077",
        "prompt": "Ты не умеешь читать на русском языке.",
        "answer": "False"
      },
      {
        "id": "q-078",
        "prompt": "Сначала мы просыпаемся, а потом встаём.",
        "answer": "True"
      },
      {
        "id": "q-079",
        "prompt": "Мясо едят ножом и вилкой.",
        "answer": "True"
      }
    ]
  }
} as Record<PlacementExamKey, PlacementExamBank>;

export const PLACEMENT_EXAM_BANKS: Record<PlacementExamKey, PlacementExamBank> = {
  ...BASE_PLACEMENT_EXAM_BANKS,
  ...PDF_PLACEMENT_BANKS,
  ...ENGLISH_DME_BANKS,
};

const AGE_BASED_UNAVAILABLE_NOTE =
  'Bu yaş grubu için online seviye testimiz bulunmamaktadır. Eğitim danışmanlarımız sözlü seviye tespiti için en kısa süre içerisinde sizlerle iletişime geçecektir.';

const ARABIC_UNAVAILABLE_NOTE =
  'Arapça dili için online seviye testimiz bulunmamaktadır. Eğitim danışmanlarımız sözlü seviye tespiti için en kısa süre içerisinde sizlerle iletişime geçecektir.';

export type PlacementExamResolution =
  | { available: true; key: PlacementExamKey; note?: string }
  | { available: false; note: string };

export type PlacementExamBankResult =
  | ({ available: true; key: PlacementExamKey; note?: string } & { bank: PlacementExamBank })
  | { available: false; note: string };

export function resolvePlacementExamKey(age: string, languageId: string): PlacementExamResolution {
  const normalizedLanguage = languageId.toLowerCase();

  if (normalizedLanguage === 'en') {
    if (age === '7–12') return { available: true, key: 'en-kids' };
    if (age === '13–17') return { available: true, key: 'en-teens' };
    return { available: true, key: 'en-adult' };
  }

  if (normalizedLanguage === 'ar') {
    return { available: false, note: ARABIC_UNAVAILABLE_NOTE };
  }

  if (age === '7–12' && (normalizedLanguage === 'de' || normalizedLanguage === 'es')) {
    return { available: false, note: AGE_BASED_UNAVAILABLE_NOTE };
  }

  if (normalizedLanguage === 'de') return { available: true, key: 'de-general' };
  if (normalizedLanguage === 'fr') return { available: true, key: 'fr-general' };
  if (normalizedLanguage === 'es') return { available: true, key: 'es-general' };
  if (normalizedLanguage === 'it') return { available: true, key: 'it-general' };
  if (normalizedLanguage === 'ru') return { available: true, key: 'ru-general' };

  return {
    available: false,
    note: 'Bu dil için online seviye testimiz bulunmamaktadır. Eğitim danışmanlarımız sözlü seviye tespiti için en kısa süre içerisinde sizlerle iletişime geçecektir.',
  };
}

export function getPlacementBank(age: string, languageId: string): PlacementExamBankResult {
  const resolved = resolvePlacementExamKey(age, languageId);

  if (resolved.available === false) {
    return resolved;
  }

  return {
    ...resolved,
    bank: PLACEMENT_EXAM_BANKS[resolved.key],
  };
}

export function getPlacementBandForScore(bank: PlacementExamBank, score: number) {
  if (!bank.placementBands?.length) return null;
  return (
    bank.placementBands.find((band) => score >= band.min && score <= band.max) ??
    null
  );
}
