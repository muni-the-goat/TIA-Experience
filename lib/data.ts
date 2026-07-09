// ─────────────────────────────────────────────────────────────
// Content for the TIA "Experience" landing page.
// Part 1: Cambodian artifacts exhibited at Techo International Airport.
// Part 2: Treasure-hunt clues placed across the airport.
// (Curated sample content — swap for the real exhibition catalogue.)
// ─────────────────────────────────────────────────────────────

export type Artifact = {
  id: string;
  index: string;
  name: string;
  era: string;
  origin: string;
  material: string;
  blurb: string;
  motif: "naga" | "lotus" | "apsara" | "temple" | "garuda";
  hue: string; // accent for the card
  /**
   * Photo path served from /public, e.g. "/artifacts/naga-balustrade.jpg".
   * If empty or the file fails to load, the card falls back to the SVG motif.
   */
  image?: string;
};

export const artifacts: Artifact[] = [
  {
    id: "garuda-naga",
    index: "01",
    name: "Garuda & the Naga",
    era: "Angkorian Tradition",
    origin: "Khmer Hindu-Buddhist canon",
    material: "Carved Sandstone",
    blurb:
      "The divine eagle and mount of Vishnu rises with wings unfurled, the serpent-nagas coiled in his grasp, the eternal struggle of sky and water, held in stone.",
    motif: "garuda",
    hue: "#D6A63A",
    image: "/artifacts/IMG_2089.webp",
  },
  {
    id: "apsara-relief",
    index: "02",
    name: "Apsaras, Celestial Dancers",
    era: "Angkor Wat Style",
    origin: "Court of the Devaraja",
    material: "Sandstone Relief",
    blurb:
      "The apsaras descend in graceful rows, hands poised in the gestures of sacred dance. Born of the churning of the ocean of milk, they are the eternal performers of the heavens.",
    motif: "apsara",
    hue: "#876C51",
    image: "/artifacts/IMG_2096.JPG",
  },
  {
    id: "prasat-face",
    index: "03",
    name: "Prasat: The Face Tower",
    era: "Bayon Tradition",
    origin: "Inspired by Angkor Thom",
    material: "Carved Sandstone",
    blurb:
      "A serene face gazes from the summit of the prasat, echoing the great towers of the Bayon, where the king was said to watch over his kingdom in every direction at once.",
    motif: "temple",
    hue: "#093B3F",
    image: "/artifacts/IMG_2078.webp",
  },
  {
    id: "singha-guardian",
    index: "04",
    name: "Singha, the Guardian Lion",
    era: "Angkorian Tradition",
    origin: "Temple gateways of Cambodia",
    material: "Carved Sandstone",
    blurb:
      "Fierce and faithful, the singha crouches at the threshold. For a thousand years these lions have guarded the stairways of Khmer temples, warding the sacred from the profane.",
    motif: "naga",
    hue: "#3C6669",
    image: "/artifacts/IMG_2077.webp",
  },
  {
    id: "lokeshvara",
    index: "05",
    name: "Avalokiteshvara, the Compassionate",
    era: "Angkorian Buddhist Tradition",
    origin: "Kingdom of Cambodia",
    material: "Carved Sandstone",
    blurb:
      "Many-armed and serene, the bodhisattva of infinite compassion extends his hands to every being, a vision of mercy that flourished across the Khmer empire.",
    motif: "lotus",
    hue: "#775134",
    image: "/artifacts/IMG_2088.webp",
  },
  {
    id: "tevoda",
    index: "06",
    name: "Tevoda, the Celestial Maiden",
    era: "Angkorian Tradition",
    origin: "Kingdom of Cambodia",
    material: "Carved Sandstone",
    blurb:
      "Crowned and poised upon a blossoming lotus, the tevoda bears the sacred vessel of abundance, a guardian spirit of grace, and a welcome to every traveller.",
    motif: "apsara",
    hue: "#DCB55F",
    image: "/artifacts/IMG_2093.webp",
  },
  {
    id: "harihara",
    index: "07",
    name: "Harihara, the Twofold God",
    era: "Pre-Angkorian Tradition",
    origin: "Kingdom of Funan-Chenla",
    material: "Carved Sandstone",
    blurb:
      "One body, two divinities: Vishnu and Shiva united in a single form. Harihara embodies the harmony of opposing forces, a vision of wholeness from Cambodia's earliest kingdoms.",
    motif: "lotus",
    hue: "#3C6669",
    image: "/artifacts/IMG_2079.webp",
  },
  {
    id: "vishnu",
    index: "08",
    name: "Vishnu, Preserver of Worlds",
    era: "Angkorian Tradition",
    origin: "Khmer Hindu canon",
    material: "Carved Sandstone",
    blurb:
      "Four arms bearing the conch, discus, mace, and lotus, the great preserver stands serene. Worshipped across the Khmer empire, Vishnu sustains the order of the cosmos.",
    motif: "lotus",
    hue: "#093B3F",
    image: "/artifacts/IMG_2090.webp",
  },
  {
    id: "shiva",
    index: "09",
    name: "Shiva, the Auspicious One",
    era: "Bakheng Style",
    origin: "Kingdom of Cambodia",
    material: "Carved Sandstone",
    blurb:
      "Lord of creation and dissolution, Shiva presides in stillness. The Khmer kings raised mountain-temples in his honour, binding the throne to the rhythm of the universe.",
    motif: "temple",
    hue: "#876C51",
    image: "/artifacts/IMG_2080.webp",
  },
  {
    id: "dvarapala",
    index: "10",
    name: "Dvarapala, the Threshold Guardian",
    era: "Angkorian Tradition",
    origin: "Temple gateways of Cambodia",
    material: "Carved Sandstone",
    blurb:
      "Club in hand and gaze unbroken, the dvarapala stands sentinel at the sanctuary door. For centuries these guardians have decided who may pass into the sacred within.",
    motif: "naga",
    hue: "#775134",
    image: "/artifacts/IMG_2084.webp",
  },
  {
    id: "ganesha",
    index: "11",
    name: "Ganesha, Remover of Obstacles",
    era: "Angkorian Tradition",
    origin: "Khmer Hindu canon",
    material: "Carved Sandstone",
    blurb:
      "Elephant-headed and ever-wise, Ganesha clears the path for every undertaking. Beloved across the Khmer world, he is invoked at the start of all journeys.",
    motif: "lotus",
    hue: "#DCB55F",
    image: "/artifacts/IMG_2085.webp",
  },
  {
    id: "naga-buddha",
    index: "12",
    name: "Buddha Sheltered by the Naga",
    era: "Angkorian Buddhist Tradition",
    origin: "Kingdom of Cambodia",
    material: "Carved Sandstone",
    blurb:
      "As the storm raged, the serpent-king Mucalinda rose to shield the meditating Buddha beneath his seven hoods, water and wisdom stilled into a single moment of peace.",
    motif: "naga",
    hue: "#D6A63A",
    image: "/artifacts/IMG_2091.webp",
  },
];

export type Treasure = {
  id: string;
  index: number;
  zone: string;
  title: string;
  riddle: string;
  hint: string;
  reward: string;
  // position on the schematic map (percentages)
  x: number;
  y: number;
};

export const treasures: Treasure[] = [
  {
    id: "t1",
    index: 1,
    zone: "Arrivals Hall",
    title: "The Welcome Naga",
    riddle:
      "Seven heads greet every traveller who lands. Stand where the serpent guards the gate and the floor remembers the river.",
    hint: "Look down at the terrazzo motif near the Arrivals greeting wall.",
    reward: "Naga Seal",
    x: 22,
    y: 64,
  },
  {
    id: "t2",
    index: 2,
    zone: "Central Atrium",
    title: "Dancer in the Light",
    riddle:
      "At noon a celestial figure casts no shadow but her own. Find the dancer who never tires beneath the open sky.",
    hint: "The Apsara sculpture sits under the atrium skylight.",
    reward: "Apsara Seal",
    x: 50,
    y: 38,
  },
  {
    id: "t3",
    index: 3,
    zone: "Departure Gates B",
    title: "The Gilded Wing",
    riddle:
      "Half-man, half-bird, he carries gods between worlds. Fitting, then, that he waits where journeys begin.",
    hint: "Garuda watches over the Gate B boarding lounge.",
    reward: "Garuda Seal",
    x: 76,
    y: 30,
  },
  {
    id: "t4",
    index: 4,
    zone: "Heritage Walk",
    title: "Words in Stone",
    riddle:
      "Two languages, one stone, a thousand years. Read what the kings left behind and the lotus will point the way.",
    hint: "The inscribed stele is displayed along the Heritage Walk corridor.",
    reward: "Lotus Seal",
    x: 38,
    y: 78,
  },
  {
    id: "t5",
    index: 5,
    zone: "Sky Court",
    title: "Mountain of the Gods",
    riddle:
      "Five towers for five peaks. Climb with your eyes to the centre of the universe and claim the final prize.",
    hint: "The temple-mountain model crowns the Sky Court viewing deck.",
    reward: "Meru Seal",
    x: 64,
    y: 60,
  },
];

export const huntSteps = [
  {
    step: "01",
    title: "Pick up your passport",
    body: "Collect a free Heritage Passport at any TIA information desk, or open it right here on your phone.",
  },
  {
    step: "02",
    title: "Solve the riddles",
    body: "Five treasures hide across the terminal. Read each riddle, explore the airport, and find the hidden seals.",
  },
  {
    step: "03",
    title: "Collect every seal",
    body: "Tap to mark each treasure as found. Your progress is saved on this device as you explore.",
  },
  {
    step: "04",
    title: "Claim your reward",
    body: "Find all five and unlock a commemorative Angkor keepsake, redeemable at the Heritage Walk gift pavilion.",
  },
];
