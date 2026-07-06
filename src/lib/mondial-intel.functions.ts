import { createServerFn } from "@tanstack/react-start";

export type BettingMarket = {
  question: string;
  question_he: string;
  topOption: string;
  topOption_he: string;
  pricePct: number;
  volumeUsd: number;
  take: string;
  take_he: string;
  url: string;
};

export type BiggestWinner = {
  handle: string;
  amountUsd: number;
  wager: string;
  wager_he: string;
  vibe: string;
  vibe_he: string;
  profileUrl: string;
};

export type JuicyDrop = {
  headline: string;
  headline_he: string;
  source: string;
  sourceUrl: string;
  minutesAgo: number;
  tag: "SCANDAL" | "INJURY" | "DRAMA" | "MONEY" | "OFF-PITCH";
};

export type GossipItem = {
  player: string;
  country: string;
  headline: string;
  headline_he: string;
  caption: string;
  caption_he: string;
  verdict: "HIT" | "MISS" | "CHAOS";
  source: string;
  sourceUrl: string;
  imageSeed: string; // used for picsum.photos seed
  imageUrl?: string; // resolved server-side (Wikipedia thumbnail) when available
  minutesAgo: number;
};

export type HotPlayerLive = {
  name: string;
  country: string;
  role: string; // e.g. "Winger", "GK"
  blurb: string;
  blurb_he: string;
  socialTeaser: string; // one-line naughty/kinky/interesting social tidbit
  socialTeaser_he: string;
  socialUrl: string;
  imageSeed: string;
  imageUrl?: string; // resolved server-side (Wikipedia thumbnail) when available
  score: string; // "9.4"
  hoursAgo: number; // how recent
  isPlayingLive: boolean; // whether they're from a team currently on the pitch
  match: string; // e.g. "vs Croatia" or "LIVE vs Portugal"
};

export type MicroTip = { en: string; he: string };
export type OddsRow = { team: string; team_he: string; pct: number };
export type PeaceSlot = {
  slot: string;
  slot_he: string;
  note: string;
  note_he: string;
  level: "critical" | "safe";
};
export type ProTip = { label: string; label_he: string; text: string; text_he: string };
export type FakeLine = { en: string; he: string };

export type MondialIntel = {
  fetchedAt: number;
  markets: BettingMarket[];
  winners: BiggestWinner[];
  drops: JuicyDrop[];
  gossip: GossipItem[];
  hotPlayers: HotPlayerLive[];
  microTips: MicroTip[];
  odds: OddsRow[];
  peaceForecast: PeaceSlot[];
  proTips: ProTip[];
  fakeLines: FakeLine[];
  totalWageredUsd: number;
  polymarketOnline: boolean;
};

const SYSTEM = `You are the editor of "The Offside Guide", a cynical-but-USEFUL World Cup 2026 dashboard for people who did not sign up for their partner's football obsession. Voice: dry, editorial, faintly amused, never fawning. Never earnest. Never exclamation points. Assume the reader would rather be doing anything else.

You are generating a live "Polymarket-style betting intel" + "juicy micro-news" payload for the current 2026 FIFA World Cup. Invent plausible fictional handles. Amounts in USD, realistic Polymarket scale ($20k–$4M). Prices as integers 1–99.

Return STRICT JSON, no prose, matching this TypeScript type:
{
  "markets": Array<{ "question": string, "question_he": string, "topOption": string, "topOption_he": string, "pricePct": number, "volumeUsd": number, "take": string, "take_he": string, "url": string }>, // 4 items
  "winners": Array<{ "handle": string, "amountUsd": number, "wager": string, "wager_he": string, "vibe": string, "vibe_he": string, "profileUrl": string }>, // 3 items
  "drops": Array<{ "headline": string, "headline_he": string, "source": string, "sourceUrl": string, "minutesAgo": number, "tag": "SCANDAL"|"INJURY"|"DRAMA"|"MONEY"|"OFF-PITCH" }>, // 5 items
  "gossip": Array<{ "player": string, "country": string, "headline": string, "headline_he": string, "caption": string, "caption_he": string, "verdict": "HIT"|"MISS"|"CHAOS", "source": string, "sourceUrl": string, "imageSeed": string, "minutesAgo": number }>, // 6 items — fashion / red carpet / airport looks / off-pitch outfit hits & misses in the last 72h
  "hotPlayers": Array<{ "name": string, "country": string, "role": string, "blurb": string, "blurb_he": string, "socialTeaser": string, "socialTeaser_he": string, "socialUrl": string, "imageSeed": string, "score": string, "hoursAgo": number, "isPlayingLive": boolean, "match": string }>, // 8 items — current hottest players. If a match is happening RIGHT NOW at the current UTC time based on real 2026 World Cup schedule, mark ONE hot player from a team playing right now as isPlayingLive:true. Otherwise ALL isPlayingLive:false. Sort most-recent first (hoursAgo ascending).
  "microTips": Array<{ "en": string, "he": string }>, // 5 dry one-liners for a scrolling ticker. Each MUST name a team/country and a specific player/coach/incident. Max 110 chars.
  "odds": Array<{ "team": string, "team_he": string, "pct": number }>, // 5 items, biggest title-win probabilities right now. Integers, sum roughly 60-90. Sorted desc.
  "peaceForecast": Array<{ "slot": string, "slot_he": string, "note": string, "note_he": string, "level": "critical"|"safe" }>, // 4 items — upcoming days/times with a dry note about household chaos. slot like "Thu 20:00".
  "proTips": Array<{ "label": string, "label_he": string, "text": string, "text_he": string }>, // 2 sardonic survival tips. label like "Pro Survival Tip", text quoted, max 140 chars.
  "fakeLines": Array<{ "en": string, "he": string }>, // 3 quoted "sounds-smart" football lines to drop in conversation.
  "totalWageredUsd": number
}

HARD RULES:
- CRITICAL: Every mention of a player, coach, or captain MUST include the country in the same sentence. Never write "the captain" or "the coach" without naming the team. E.g. "Belgium's captain De Wilde", "Spain's coach Rojas". Same in Hebrew.
- CRITICAL: Use REAL, well-known active 2026 World Cup players and coaches only. Examples of acceptable player names: Kylian Mbappé, Jude Bellingham, Vinícius Júnior, Lamine Yamal, Jamal Musiala, Erling Haaland (if Norway qualified), Rodrygo, Bukayo Saka, Pedri, Rodri, Federico Valverde, Achraf Hakimi, Son Heung-min, Cho Gue-sung, Luka Modrić, Christian Pulisic, Alphonso Davies, Jhon Durán, Nicolás Otamendi, Julián Álvarez, Lautaro Martínez, Bruno Fernandes, Rafael Leão, João Félix, Cristiano Ronaldo, Kevin De Bruyne, Romelu Lukaku, Virgil van Dijk, Cody Gakpo, Frenkie de Jong, Memphis Depay, Antoine Griezmann, Aurélien Tchouaméni, Ousmane Dembélé, Kim Min-jae, Takefusa Kubo, Wataru Endo, Timothy Weah, Weston McKennie, Gio Reyna, Ferran Torres, Nico Williams, Dani Olmo, Florian Wirtz, Kai Havertz, Serge Gnabry, Antonio Rüdiger, Josip Brekalo, Ismaila Sarr. Do NOT invent names like "Théo Laurent" or "Mateo Vidal".
- "take"/"take_he": one sardonic sentence, max 80 chars, mention the team by name.
- "wager"/"wager_he": 6–10 words, name specific team(s).
- "vibe"/"vibe_he": one line about the bettor, max 60 chars.
- "headline"/"headline_he": one sentence, max 100 chars, MUST name the team/country.
- "source": short fake outlet name, e.g. "Tunnel Cam Weekly".
- "sourceUrl": a Google News search URL for the headline: "https://news.google.com/search?q=" + URL-encoded key words of the headline in English.
- "url" (markets): Polymarket search URL: "https://polymarket.com/markets?_q=" + URL-encoded key search terms in English (e.g. "world cup golden boot").
- "profileUrl" (winners): "https://polymarket.com/profile/" + the handle without @.
- Gossip "imageSeed" / hotPlayers "imageSeed": a short URL-safe slug (lowercase, hyphens, no spaces), unique per item, e.g. "vidal-spain-tunnel-fit".
- Gossip "sourceUrl": Google search URL for the specific outfit/incident: "https://www.google.com/search?q=" + encoded "player name outfit tunnel gossip" plus "&tbm=isch" for image results.
- Gossip "caption"/"caption_he": one dry, funny sentence about the outfit, max 110 chars.
- Gossip "headline"/"headline_he": name the player AND country AND garment/incident, max 100 chars.
- hotPlayers "blurb"/"blurb_he": max 120 chars, mention the country and one sexy attribute.
- hotPlayers "socialTeaser"/"socialTeaser_he": one sentence, max 110 chars — something genuinely interesting, kinky, thirst-trap-y, or naughty from their socials (a shirtless recovery pic, a suspiciously-timed hard-launch, a cryptic story, a locker-room video). Must name the platform.
- hotPlayers "socialUrl": "https://www.google.com/search?q=" + encoded "<player name> instagram" (or tiktok/twitter depending on teaser).
- hotPlayers "role": specific position ("Left winger", "Center-back", "Goalkeeper", "#10", "Wing-back").
- hotPlayers "score": one decimal, 8.4–9.9.
- hotPlayers "hoursAgo": 0–72 (0 means currently on the pitch or just off it).
- If isPlayingLive is true, match must start with "LIVE — ".
- Hebrew fields = natural Hebrew, same tone.
- Vary content every call.`;

const g = (q: string) => `https://news.google.com/search?q=${encodeURIComponent(q)}`;
const pm = (q: string) => `https://polymarket.com/markets?_q=${encodeURIComponent(q)}`;
const gs = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=isch`;
const gw = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;
const slug = (s: string) =>
  (s || "player")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "player";

type GroundedMatch = {
  kickoffISO: string;
  state: "pre" | "in" | "post";
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  minute?: string;
  detail: string;
  phase: string;
  winner?: string;
  loser?: string;
  isKnockout: boolean;
};

const TEAM_HE: Record<string, string> = {
  Argentina: "ארגנטינה",
  Belgium: "בלגיה",
  Colombia: "קולומביה",
  Egypt: "מצרים",
  England: "אנגליה",
  France: "צרפת",
  Morocco: "מרוקו",
  Norway: "נורבגיה",
  Portugal: "פורטוגל",
  Spain: "ספרד",
  Switzerland: "שווייץ",
  "United States": "ארצות הברית",
};

const TITLE_STRENGTH: Record<string, number> = {
  Spain: 18,
  France: 17,
  Argentina: 15,
  Portugal: 14,
  England: 13,
  Belgium: 10,
  Morocco: 9,
  Colombia: 8,
  Norway: 8,
  Switzerland: 7,
  "United States": 7,
  Egypt: 5,
};

const TEAM_HOT_PLAYERS: Record<string, Array<Omit<HotPlayerLive, "country" | "imageSeed" | "hoursAgo" | "isPlayingLive" | "match">>> = {
  Portugal: [
    {
      name: "Cristiano Ronaldo",
      role: "Striker",
      blurb: "Portugal's jawline remains a broadcast event. The abs have their own federation.",
      blurb_he: "קו הלסת של פורטוגל הוא עדיין אירוע שידור. לקוביות יש התאחדות משלהן.",
      socialTeaser: "Instagram: post-training shirtless recovery shot, because subtlety retired first.",
      socialTeaser_he: "אינסטגרם: תמונת התאוששות בלי חולצה אחרי אימון, כי העדינות פרשה קודם.",
      socialUrl: gw("Cristiano Ronaldo instagram"),
      score: "9.9",
    },
    {
      name: "João Félix",
      role: "Second striker",
      blurb: "Portugal's soft-focus menace: sleepy eyes, expensive touch, unnecessary cheekbones.",
      blurb_he: "האיום הרך של פורטוגל: עיניים מנומנמות, מגע יקר, עצמות לחיים מיותרות.",
      socialTeaser: "Instagram: black-and-white hotel mirror selfie, no context, too much intent.",
      socialTeaser_he: "אינסטגרם: סלפי מראה בשחור-לבן מהמלון, בלי הקשר, עם יותר מדי כוונה.",
      socialUrl: gw("João Félix instagram"),
      score: "9.5",
    },
    {
      name: "Rafael Leão",
      role: "Left winger",
      blurb: "Portugal's grin is a public utility. The acceleration is merely the excuse.",
      blurb_he: "החיוך של פורטוגל הוא שירות ציבורי. התאוצה היא רק התירוץ.",
      socialTeaser: "Instagram: tunnel walk reel with sunglasses indoors. Illegal, but effective.",
      socialTeaser_he: "אינסטגרם: ריל הליכה במנהרה עם משקפי שמש בפנים. לא חוקי, אבל עובד.",
      socialUrl: gw("Rafael Leão instagram"),
      score: "9.4",
    },
  ],
  Spain: [
    {
      name: "Lamine Yamal",
      role: "Right winger",
      blurb: "Spain's baby-faced problem: absurd feet, calm eyes, defenders visibly aging.",
      blurb_he: "הבעיה הצעירה של ספרד: רגליים לא הגיוניות, עיניים רגועות, מגנים שמזדקנים מולך.",
      socialTeaser: "Instagram: boots-and-chain close-up before kickoff. The comments are unwell.",
      socialTeaser_he: "אינסטגרם: קלוז-אפ של נעליים ושרשרת לפני שריקה. התגובות לא יציבות.",
      socialUrl: gw("Lamine Yamal instagram"),
      score: "9.7",
    },
    {
      name: "Pedri",
      role: "Central midfielder",
      blurb: "Spain's quiet luxury midfielder. Looks innocent, ruins entire pressing schemes.",
      blurb_he: "קשר השקט-יוקרתי של ספרד. נראה תמים, הורס תוכניות לחץ שלמות.",
      socialTeaser: "Instagram: recovery-room photo with wet hair and a caption pretending it is about work.",
      socialTeaser_he: "אינסטגרם: תמונת התאוששות עם שיער רטוב וכיתוב שמעמיד פנים שזה על עבודה.",
      socialUrl: gw("Pedri instagram"),
      score: "9.4",
    },
    {
      name: "Nico Williams",
      role: "Left winger",
      blurb: "Spain's speed merchant with a smile that keeps starting side quests.",
      blurb_he: "סוחר המהירות של ספרד עם חיוך שפותח משימות צד.",
      socialTeaser: "TikTok: dressing-room dance clip, suspiciously perfect lighting, zero apologies.",
      socialTeaser_he: "טיקטוק: ריקוד חדר הלבשה, תאורה מושלמת מדי, אפס התנצלות.",
      socialUrl: gw("Nico Williams tiktok"),
      score: "9.3",
    },
  ],
  "United States": [
    {
      name: "Christian Pulisic",
      role: "Winger",
      blurb: "United States' main character energy, now with stubble and suspicious calm.",
      blurb_he: "אנרגיית הדמות הראשית של ארצות הברית, עכשיו עם זיפים ורוגע חשוד.",
      socialTeaser: "Instagram: captain-core locker photo, jaw clenched like a campaign poster.",
      socialTeaser_he: "אינסטגרם: תמונת קפטן מחדר ההלבשה, לסת נעולה כמו פוסטר בחירות.",
      socialUrl: gw("Christian Pulisic instagram"),
      score: "9.1",
    },
    {
      name: "Weston McKennie",
      role: "Box-to-box midfielder",
      blurb: "United States' chaos engine with shoulders built for post-match thirst edits.",
      blurb_he: "מנוע הכאוס של ארצות הברית עם כתפיים לעריכות צמא אחרי משחק.",
      socialTeaser: "Instagram story: gym mirror, sleeveless top, pretending the weights are the subject.",
      socialTeaser_he: "סטורי באינסטגרם: מראת חדר כושר, גופייה, כאילו המשקולות הן הנושא.",
      socialUrl: gw("Weston McKennie instagram"),
      score: "8.9",
    },
  ],
  Belgium: [
    {
      name: "Kevin De Bruyne",
      role: "Playmaker",
      blurb: "Belgium's stern art teacher look, if the art teacher could pass through walls.",
      blurb_he: "מראה המורה לאמנות הקשוח של בלגיה, אם המורה היה מוסר דרך קירות.",
      socialTeaser: "Instagram: training-ground stare into the middle distance. Mature. Dangerous.",
      socialTeaser_he: "אינסטגרם: מבט אימונים לאופק. בוגר. מסוכן.",
      socialUrl: gw("Kevin De Bruyne instagram"),
      score: "9.2",
    },
    {
      name: "Jérémy Doku",
      role: "Winger",
      blurb: "Belgium's turbo button with cheekbones and an alarming disregard for ankles.",
      blurb_he: "כפתור הטורבו של בלגיה עם עצמות לחיים וזלזול מדאיג בקרסוליים.",
      socialTeaser: "TikTok: tunnel bounce before warmups. The comments have lost procedural dignity.",
      socialTeaser_he: "טיקטוק: קפיצות במנהרה לפני חימום. התגובות איבדו כל כבוד פרוצדורלי.",
      socialUrl: gw("Jérémy Doku tiktok"),
      score: "9.0",
    },
  ],
  Argentina: [
    {
      name: "Julián Álvarez",
      role: "Forward",
      blurb: "Argentina's polite assassin: soft smile, very rude movement in the box.",
      blurb_he: "המתנקש המנומס של ארגנטינה: חיוך רך, תנועה חצופה ברחבה.",
      socialTeaser: "Instagram: sleepy travel-day selfie, hoodie low, national crisis in comments.",
      socialTeaser_he: "אינסטגרם: סלפי יום נסיעה ישנוני, קפוצ'ון נמוך, משבר לאומי בתגובות.",
      socialUrl: gw("Julián Álvarez instagram"),
      score: "9.3",
    },
    {
      name: "Lautaro Martínez",
      role: "Striker",
      blurb: "Argentina's clenched-jaw striker, built like a warning label.",
      blurb_he: "החלוץ של ארגנטינה עם לסת נעולה, בנוי כמו תווית אזהרה.",
      socialTeaser: "Instagram: post-gym black tank photo. Nobody involved was trying to be subtle.",
      socialTeaser_he: "אינסטגרם: תמונת אחרי חדר כושר בגופייה שחורה. אף אחד לא ניסה להיות עדין.",
      socialUrl: gw("Lautaro Martínez instagram"),
      score: "9.1",
    },
  ],
  Egypt: [
    {
      name: "Mohamed Salah",
      role: "Right winger",
      blurb: "Egypt's curls, shoulders, and left foot remain three separate problems.",
      blurb_he: "התלתלים, הכתפיים ורגל שמאל של מצרים הם שלוש בעיות נפרדות.",
      socialTeaser: "Instagram: recovery mat photo, arms out, pretending it is just stretching.",
      socialTeaser_he: "אינסטגרם: תמונת מזרן התאוששות, ידיים פרושות, כאילו זו רק מתיחה.",
      socialUrl: gw("Mohamed Salah instagram"),
      score: "9.6",
    },
  ],
  France: [
    {
      name: "Kylian Mbappé",
      role: "Forward",
      blurb: "France's smile says harmless. The sprint says your evening is cancelled.",
      blurb_he: "החיוך של צרפת אומר תמים. הספרינט אומר שהערב שלך בוטל.",
      socialTeaser: "Instagram: tunnel grin and gloves, posted exactly when everyone needed oxygen.",
      socialTeaser_he: "אינסטגרם: חיוך במנהרה וכפפות, פורסם בדיוק כשכולם היו צריכים חמצן.",
      socialUrl: gw("Kylian Mbappé instagram"),
      score: "9.8",
    },
    {
      name: "Ousmane Dembélé",
      role: "Winger",
      blurb: "France's chaos dribbler with sleepy eyes and bad intentions for full-backs.",
      blurb_he: "הדריבליסט הכאוטי של צרפת עם עיניים מנומנמות וכוונות רעות למגנים.",
      socialTeaser: "Instagram: headphones-on bus selfie, jawline doing unnecessary overtime.",
      socialTeaser_he: "אינסטגרם: סלפי אוטובוס עם אוזניות, קו לסת עובד שעות נוספות.",
      socialUrl: gw("Ousmane Dembélé instagram"),
      score: "9.1",
    },
  ],
  Morocco: [
    {
      name: "Achraf Hakimi",
      role: "Wing-back",
      blurb: "Morocco's runway-speed full-back. Cheekbones, engines, consequences.",
      blurb_he: "המגן של מרוקו במהירות מסלול. עצמות לחיים, מנועים, השלכות.",
      socialTeaser: "Instagram: tailored arrival fit, sunglasses, everybody suddenly understands tactics.",
      socialTeaser_he: "אינסטגרם: לוק הגעה מחויט, משקפי שמש, ופתאום כולם מבינים טקטיקה.",
      socialUrl: gw("Achraf Hakimi instagram"),
      score: "9.5",
    },
  ],
  England: [
    {
      name: "Jude Bellingham",
      role: "Midfielder",
      blurb: "England's brooding headline generator. Every camera knows where he is.",
      blurb_he: "מחולל הכותרות המהורהר של אנגליה. כל מצלמה יודעת איפה הוא.",
      socialTeaser: "Instagram: post-match stare, shirt half-zipped, comments behaving predictably.",
      socialTeaser_he: "אינסטגרם: מבט אחרי משחק, חולצה חצי פתוחה, תגובות צפויות לחלוטין.",
      socialUrl: gw("Jude Bellingham instagram"),
      score: "9.8",
    },
    {
      name: "Bukayo Saka",
      role: "Winger",
      blurb: "England's golden boy smile, weaponized against both full-backs and cynicism.",
      blurb_he: "חיוך ילד הזהב של אנגליה, נשק נגד מגנים וציניות.",
      socialTeaser: "Instagram: recovery boots and soft grin. The internet folded neatly.",
      socialTeaser_he: "אינסטגרם: מגפי התאוששות וחיוך רך. האינטרנט התקפל יפה.",
      socialUrl: gw("Bukayo Saka instagram"),
      score: "9.2",
    },
  ],
  Norway: [
    {
      name: "Erling Haaland",
      role: "Striker",
      blurb: "Norway's Nordic demolition unit, inexplicably photogenic while terrifying people.",
      blurb_he: "יחידת ההריסה הנורדית של נורבגיה, פוטוגנית באופן לא סביר בזמן שהיא מפחידה אנשים.",
      socialTeaser: "Instagram: ice-bath recovery photo. Very Viking, very unnecessary.",
      socialTeaser_he: "אינסטגרם: תמונת אמבטיית קרח. מאוד ויקינגי, מאוד לא הכרחי.",
      socialUrl: gw("Erling Haaland instagram"),
      score: "9.7",
    },
  ],
  Colombia: [
    {
      name: "Jhon Durán",
      role: "Striker",
      blurb: "Colombia's chaos finisher with movie-villain eyebrows and zero chill.",
      blurb_he: "המסיים הכאוטי של קולומביה עם גבות של נבל קולנוע ואפס רוגע.",
      socialTeaser: "Instagram: late-night studio story, chain visible, caption doing no work.",
      socialTeaser_he: "אינסטגרם: סטורי אולפן לילי, שרשרת בפריים, כיתוב שלא עובד קשה.",
      socialUrl: gw("Jhon Durán instagram"),
      score: "9.0",
    },
  ],
  Switzerland: [
    {
      name: "Granit Xhaka",
      role: "Midfielder",
      blurb: "Switzerland's stern jaw, perfect hair, and elite argument posture.",
      blurb_he: "הלסת הקשוחה, השיער המושלם ועמידת הוויכוח העילית של שווייץ.",
      socialTeaser: "Instagram: captain's tunnel photo, sleeves tight enough to file paperwork.",
      socialTeaser_he: "אינסטגרם: תמונת קפטן במנהרה, שרוולים צמודים מספיק לבירוקרטיה.",
      socialUrl: gw("Granit Xhaka instagram"),
      score: "8.8",
    },
  ],
};

function canonicalTeam(name: string) {
  if (name === "USA" || /united states|u\.s\./i.test(name)) return "United States";
  return name.replace(/\s+/g, " ").trim();
}

function isPlaceholderTeam(name: string) {
  return /winner|runner|round of|group|tbd|to be determined/i.test(name);
}

function uniq<T>(items: T[]) {
  return Array.from(new Set(items));
}

function matchupLabel(match: GroundedMatch) {
  return `${match.home} vs ${match.away}`;
}

function buildLiveMicroTips(liveMatches: GroundedMatch[], upcomingMatches: GroundedMatch[], recentMatches: GroundedMatch[]): MicroTip[] {
  const tips: MicroTip[] = [];
  const live = liveMatches[0];
  if (live) {
    tips.push({
      en: `${matchupLabel(live)} is live at ${live.homeScore}-${live.awayScore}; say "compact mid-block" and look busy.`,
      he: `${live.home} נגד ${live.away} חי עכשיו ב-${live.homeScore}-${live.awayScore}; תגידי "בלוק אמצעי צפוף" ותיראי עסוקה.`,
    });
    tips.push({
      en: `${live.home} and ${live.away} are the only acceptable live gossip targets right now.`,
      he: `${live.home} ו-${live.away} הן מטרות הרכילות החיות היחידות כרגע.`,
    });
  }
  const next = upcomingMatches[0];
  if (next) {
    tips.push({
      en: `Next up: ${matchupLabel(next)}. Prepare one opinion about pressing and one snack exit plan.`,
      he: `הבא בתור: ${next.home} נגד ${next.away}. להכין דעה אחת על לחץ ותוכנית מילוט לנשנושים.`,
    });
  }
  for (const match of recentMatches) {
    if (!match.loser || !match.winner) continue;
    tips.push({
      en: `${match.loser} are out after ${match.homeScore}-${match.awayScore} vs ${match.winner}; update the group chat accordingly.`,
      he: `${match.loser} הודחה אחרי ${match.homeScore}-${match.awayScore} מול ${match.winner}; לעדכן את הווטסאפ בהתאם.`,
    });
    if (tips.length >= 5) break;
  }
  for (const match of upcomingMatches.slice(1)) {
    tips.push({
      en: `${matchupLabel(match)} is still pending, so any title takes must include both teams.`,
      he: `${match.home} נגד ${match.away} עדיין מחכה, אז כל תחזית זכייה חייבת לכלול את שתיהן.`,
    });
    if (tips.length >= 5) break;
  }
  return tips.slice(0, 5);
}

function buildLiveOdds(liveMatches: GroundedMatch[], upcomingMatches: GroundedMatch[], eliminatedTeams: string[]): OddsRow[] {
  const eliminated = new Set(eliminatedTeams.map((t) => t.toLowerCase()));
  const activeTeams = uniq(
    [...liveMatches, ...upcomingMatches].flatMap((m) => [m.home, m.away]),
  ).filter((team) => !isPlaceholderTeam(team) && !eliminated.has(team.toLowerCase()));

  const scoreFor = (team: string) => {
    let score = TITLE_STRENGTH[team] ?? 4;
    const live = liveMatches.find((m) => m.home === team || m.away === team);
    if (live) {
      const own = live.home === team ? live.homeScore : live.awayScore;
      const opp = live.home === team ? live.awayScore : live.homeScore;
      if (own > opp) score += 4;
      if (own < opp) score -= 6;
      score += 1;
    }
    return Math.max(1, score);
  };

  const ranked = activeTeams
    .map((team) => ({ team, raw: scoreFor(team) }))
    .sort((a, b) => b.raw - a.raw)
    .slice(0, 5);
  const total = ranked.reduce((sum, row) => sum + row.raw, 0) || 1;
  return ranked.map((row) => ({
    team: row.team,
    team_he: TEAM_HE[row.team] ?? row.team,
    pct: Math.max(1, Math.round((row.raw / total) * 78)),
  }));
}

function buildLiveHotPlayers(liveMatches: GroundedMatch[], upcomingMatches: GroundedMatch[]): HotPlayerLive[] {
  const players: HotPlayerLive[] = [];
  const addTeam = (team: string, match: GroundedMatch, isLive: boolean, limit: number) => {
    if (isPlaceholderTeam(team)) return;
    const pool = TEAM_HOT_PLAYERS[team] ?? [];
    for (const base of pool.slice(0, limit)) {
      players.push({
        ...base,
        country: team,
        imageSeed: slug(`${base.name}-${team}`),
        hoursAgo: isLive ? 0 : 1,
        isPlayingLive: isLive,
        match: `${isLive ? "LIVE — " : "NEXT — "}${matchupLabel(match)}`,
      });
    }
  };

  for (const match of liveMatches) {
    addTeam(match.home, match, true, 2);
    addTeam(match.away, match, true, 2);
  }
  for (const match of upcomingMatches.slice(0, 1)) {
    addTeam(match.home, match, false, 2);
    addTeam(match.away, match, false, 2);
  }
  for (const match of upcomingMatches.slice(1)) {
    addTeam(match.home, match, false, 1);
    addTeam(match.away, match, false, 1);
    if (players.length >= 8) break;
  }

  return players.slice(0, 8).map((p, i) => ({
    ...p,
    score: (Math.max(8.4, Number(p.score) - i * 0.03)).toFixed(1),
  }));
}

async function wikiThumb(name: string): Promise<string | undefined> {
  if (!name) return undefined;
  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/\s+/g, "_"))}`,
      { signal: AbortSignal.timeout(2500), headers: { accept: "application/json" } },
    );
    if (!r.ok) return undefined;
    const j = (await r.json()) as {
      originalimage?: { source?: string };
      thumbnail?: { source?: string };
      type?: string;
    };
    if (j.type === "disambiguation") return undefined;
    return j.thumbnail?.source ?? j.originalimage?.source;
  } catch {
    return undefined;
  }
}

async function attachHotPlayerImages(players: HotPlayerLive[]) {
  const withImages = await Promise.all(
    players.map(async (p) => ({ ...p, imageUrl: await wikiThumb(p.name) })),
  );
  return withImages.filter((p) => !!p.imageUrl);
}

const FALLBACK: Omit<MondialIntel, "fetchedAt" | "polymarketOnline"> = {
  totalWageredUsd: 48_312_000,
  markets: [
    {
      question: "Will France win the 2026 World Cup?",
      question_he: "האם צרפת תזכה במונדיאל 2026?",
      topOption: "Yes",
      topOption_he: "כן",
      pricePct: 27,
      volumeUsd: 3_412_000,
      take: "The market wants glamour. History wants penalties. Guess who wins.",
      take_he: "השוק רוצה זוהר. ההיסטוריה רוצה פנדלים. נחשי מי מנצח.",
      url: pm("france win world cup 2026"),
    },
    {
      question: "Golden Boot winner",
      question_he: "מלך השערים",
      topOption: "Kylian Mbappé",
      topOption_he: "קיליאן אמבפה",
      pricePct: 34,
      volumeUsd: 1_980_000,
      take: "One man, one calf muscle, an entire GDP riding on it.",
      take_he: "בן אדם אחד, שריר סובך אחד, תמ\"ג שלם תלוי בו.",
      url: pm("world cup 2026 golden boot"),
    },
    {
      question: "Any red card in FRA vs ARG?",
      question_he: "כרטיס אדום במשחק צרפת נגד ארגנטינה?",
      topOption: "Yes",
      topOption_he: "כן",
      pricePct: 71,
      volumeUsd: 612_400,
      take: "The referee already looks tired. The market has noticed.",
      take_he: "השופט כבר נראה עייף. השוק שם לב.",
      url: pm("france argentina red card world cup"),
    },
    {
      question: "Will Belgium's manager Rudi Jansen be sacked before the semi-final?",
      question_he: "האם מאמן בלגיה רודי ינסן יפוטר לפני חצי הגמר?",
      topOption: "Yes",
      topOption_he: "כן",
      pricePct: 58,
      volumeUsd: 284_100,
      take: "Belgium's dressing room sounds like a group chat mid-breakup.",
      take_he: "חדר ההלבשה של בלגיה נשמע כמו קבוצת ווטסאפ באמצע פרידה.",
      url: pm("belgium manager sacked world cup"),
    },
  ],
  winners: [
    {
      handle: "@calf_muscle_maxi",
      amountUsd: 184_200,
      wager: "Bet on Morocco to reach the quarter-finals in January",
      wager_he: "הימר על מרוקו לרבע הגמר עוד בינואר",
      vibe: "Insufferable at parties. Correct exactly once per decade.",
      vibe_he: "בלתי נסבל במסיבות. צודק בדיוק פעם בעשור.",
      profileUrl: "https://polymarket.com/profile/calf_muscle_maxi",
    },
    {
      handle: "@wag_alpha",
      amountUsd: 92_800,
      wager: "Parlayed 'Brazil own goal + Neymar hair change' at 40:1",
      wager_he: "רץ פרליי על 'שער עצמי של ברזיל + החלפת שיער של ניימאר' ביחס 40:1",
      vibe: "Watches only the halftime interviews. Somehow this works.",
      vibe_he: "צופה רק בראיונות המחצית. איכשהו זה עובד.",
      profileUrl: "https://polymarket.com/profile/wag_alpha",
    },
    {
      handle: "@grandma_tactics",
      amountUsd: 41_050,
      wager: "0-0 at halftime in three consecutive England group games",
      wager_he: "0-0 במחצית בשלושה משחקי בית ברצף של אנגליה",
      vibe: "Has never explained her system. Refuses to.",
      vibe_he: "מעולם לא הסבירה את השיטה. מסרבת.",
      profileUrl: "https://polymarket.com/profile/grandma_tactics",
    },
  ],
  drops: [
    {
      headline: "Belgium's captain De Wilde 'accidentally' liked a Portugal celebration reel.",
      headline_he: "דה וילדה, קפטן בלגיה, 'בטעות' עשה לייק לסרטון חגיגות של פורטוגל.",
      source: "Tunnel Cam Weekly",
      sourceUrl: g("Belgium captain De Wilde Portugal like"),
      minutesAgo: 12,
      tag: "DRAMA",
    },
    {
      headline: "Spain's coach Rojas filmed drinking espresso from a boot. Merch confirmed.",
      headline_he: "רוחאס, מאמן ספרד, צולם שותה אספרסו מתוך נעל כדורגל. מרצ'נדייז בדרך.",
      source: "The Bench Report",
      sourceUrl: g("Spain coach Rojas espresso boot"),
      minutesAgo: 27,
      tag: "OFF-PITCH",
    },
    {
      headline: "England fan zone runs out of both lager and hope by 71st minute.",
      headline_he: "אזור האוהדים של אנגליה נגמרה בו הבירה והתקווה עד דקה 71.",
      source: "Post-Match Panic",
      sourceUrl: g("England fan zone lager 71st minute"),
      minutesAgo: 41,
      tag: "DRAMA",
    },
    {
      headline: "Anonymous bettor moves $2.1M onto 'Argentina wins, someone cries'.",
      headline_he: "מהמר אנונימי הזרים 2.1 מיליון דולר על 'ארגנטינה מנצחת, מישהו בוכה'.",
      source: "The Ledger",
      sourceUrl: g("Polymarket Argentina 2.1 million bet"),
      minutesAgo: 58,
      tag: "MONEY",
    },
    {
      headline: "Brazil's #10 Lucas Andrade dedicates goal to 'the woman who pretends to care'.",
      headline_he: "לוקאס אנדרדה, מספר 10 של ברזיל, הקדיש שער 'לאישה שמעמידה פנים שאכפת לה'.",
      source: "Post-Match Panic",
      sourceUrl: g("Brazil Lucas Andrade goal dedication"),
      minutesAgo: 74,
      tag: "OFF-PITCH",
    },
  ],
  gossip: [
    {
      player: "Mateo Vidal",
      country: "Spain",
      headline: "Spain's Mateo Vidal arrived at the stadium in a full leather tracksuit.",
      headline_he: "מטאו וידאל, ספרד, הגיע לאצטדיון בחליפת עור מלאה.",
      caption: "Confidence: 100. Ventilation: 0. We respect the commitment.",
      caption_he: "ביטחון: 100. אוורור: 0. מכבדים את המחויבות.",
      verdict: "CHAOS",
      source: "Tunnel Cam Weekly",
      sourceUrl: gs("Mateo Vidal Spain tunnel outfit"),
      imageSeed: "vidal-spain-leather-fit",
      minutesAgo: 42,
    },
    {
      player: "Théo Laurent",
      country: "France",
      headline: "France's Théo Laurent debuted a €4,200 cropped chore coat at airport arrivals.",
      headline_he: "תיאו לורן, צרפת, חשף מעיל ג'ורי קרופ ב-4,200 יורו בשדה התעופה.",
      caption: "The coat is short. The abs are on display. This was not an accident.",
      caption_he: "המעיל קצר. הבטן חשופה. זו לא הייתה טעות.",
      verdict: "HIT",
      source: "The Bench Report",
      sourceUrl: gs("Theo Laurent France airport outfit"),
      imageSeed: "laurent-france-cropped-coat",
      minutesAgo: 87,
    },
    {
      player: "Diogo Vaz",
      country: "Portugal",
      headline: "Portugal's Diogo Vaz wore three watches to a press conference. Three.",
      headline_he: "דיוגו וז, פורטוגל, הגיע למסיבת עיתונאים עם שלושה שעונים. שלושה.",
      caption: "One per timezone he plans to break hearts in.",
      caption_he: "אחד לכל אזור זמן שהוא מתכנן לשבור בו לבבות.",
      verdict: "HIT",
      source: "Post-Match Panic",
      sourceUrl: gs("Diogo Vaz Portugal watch press conference"),
      imageSeed: "vaz-portugal-three-watches",
      minutesAgo: 133,
    },
    {
      player: "Rodrigo de Paz",
      country: "Argentina",
      headline: "Argentina's Rodrigo de Paz turned up in cargo shorts and a fur-lined coat.",
      headline_he: "רודריגו דה פאס, ארגנטינה, הופיע במכנסי דגמ\"ח ומעיל פרווה.",
      caption: "Nobody asked. Nobody survived either.",
      caption_he: "אף אחד לא שאל. אף אחד גם לא שרד.",
      verdict: "MISS",
      source: "Off-Pitch Daily",
      sourceUrl: gs("Rodrigo de Paz Argentina cargo shorts fur coat"),
      imageSeed: "depaz-argentina-cargo-fur",
      minutesAgo: 190,
    },
    {
      player: "Sven de Vries",
      country: "Netherlands",
      headline: "Netherlands' Sven de Vries wore a mesh top to team dinner. Coach: 'no comment.'",
      headline_he: "סבן דה פריס, הולנד, הגיע לארוחה עם חולצת רשת. המאמן: 'ללא תגובה.'",
      caption: "The mesh has a plot. We are following it closely.",
      caption_he: "לרשת הזאת יש עלילה. אנחנו עוקבות מקרוב.",
      verdict: "HIT",
      source: "Tunnel Cam Weekly",
      sourceUrl: gs("Sven de Vries Netherlands mesh top"),
      imageSeed: "devries-netherlands-mesh-top",
      minutesAgo: 260,
    },
    {
      player: "Cho Gue-sung",
      country: "Korea",
      headline: "Korea's Cho Gue-sung shows up in matching cream co-ord; the internet melts.",
      headline_he: "צ'ו גיה-סונג, קוריאה, הופיע בחליפה תואמת בקרם; האינטרנט נמס.",
      caption: "Business on top, statement on bottom. Also a haircut.",
      caption_he: "עסקים למעלה, הצהרה למטה. וגם תספורת.",
      verdict: "HIT",
      source: "The Bench Report",
      sourceUrl: gs("Cho Gue-sung Korea cream co-ord outfit"),
      imageSeed: "cho-korea-cream-coord",
      minutesAgo: 340,
    },
  ],
  hotPlayers: [
    {
      name: "Théo Laurent",
      country: "France",
      role: "#10 · Attacking mid",
      blurb: "France's chaos merchant with wet-look curls and a devastating left foot.",
      blurb_he: "אמן הכאוס של צרפת עם תלתלים רטובים ורגל שמאל הרסנית.",
      socialTeaser: "Instagram story: shirtless ice-bath video, no caption, 3 hours ago.",
      socialTeaser_he: "סטורי באינסטגרם: אמבטיית קרח ללא חולצה, בלי טקסט, לפני 3 שעות.",
      socialUrl: gw("Theo Laurent France instagram"),
      imageSeed: "laurent-france-hot",
      score: "9.7",
      hoursAgo: 2,
      isPlayingLive: false,
      match: "vs Argentina",
    },
    {
      name: "Mateo Vidal",
      country: "Spain",
      role: "Left winger",
      blurb: "Spain's cheekbone situation is a public safety concern.",
      blurb_he: "עצמות הלחיים של ספרד — הן סכנה ציבורית מובהקת.",
      socialTeaser: "TikTok: dressing-room dance with the kit man, suspicious eye contact.",
      socialTeaser_he: "טיקטוק: ריקוד בחדר הלבשה עם אחראי הציוד, מבטים חשודים.",
      socialUrl: gw("Mateo Vidal Spain tiktok"),
      imageSeed: "vidal-spain-hot",
      score: "9.6",
      hoursAgo: 6,
      isPlayingLive: false,
      match: "vs Germany",
    },
    {
      name: "Diogo Vaz",
      country: "Portugal",
      role: "Right winger",
      blurb: "Portugal's renaissance-painting bone structure. Weaponized.",
      blurb_he: "מבנה עצמות מציור רנסנס מטעם פורטוגל. חמוש.",
      socialTeaser: "Instagram: 'recovery day' post-swim photo, towel low, comments off.",
      socialTeaser_he: "אינסטגרם: תמונה אחרי שחייה, מגבת נמוכה, תגובות סגורות.",
      socialUrl: gw("Diogo Vaz Portugal instagram"),
      imageSeed: "vaz-portugal-hot",
      score: "9.5",
      hoursAgo: 10,
      isPlayingLive: false,
      match: "vs Ghana",
    },
    {
      name: "Cho Gue-sung",
      country: "Korea",
      role: "Striker",
      blurb: "Korea's 6'2\" whose jawline trends on impact.",
      blurb_he: "החלוץ של קוריאה, 1.88, קו לסת שעולה לטרנד ברגע.",
      socialTeaser: "Instagram Live last night, tank top, casually cooking ramyeon.",
      socialTeaser_he: "אינסטגרם לייב אתמול, גופייה, מבשל ראמיון ברוגע.",
      socialUrl: gw("Cho Gue-sung Korea instagram"),
      imageSeed: "cho-korea-hot",
      score: "9.4",
      hoursAgo: 14,
      isPlayingLive: false,
      match: "vs Uruguay",
    },
    {
      name: "Sven de Vries",
      country: "Netherlands",
      role: "Center-back",
      blurb: "Netherlands' 6'4\" ponytail with sad eyes and a devastating aerial game.",
      blurb_he: "המגן של הולנד, 1.94, קוקו, עיניים עצובות ומשחק אווירי הרסני.",
      socialTeaser: "Twitter: cryptic single-emoji tweet at 2am. Nine thousand replies.",
      socialTeaser_he: "טוויטר: ציוץ עם אמוג'י אחד בשתיים לפנות בוקר. תשעת אלפים תגובות.",
      socialUrl: gw("Sven de Vries Netherlands twitter"),
      imageSeed: "devries-netherlands-hot",
      score: "9.2",
      hoursAgo: 20,
      isPlayingLive: false,
      match: "vs USA",
    },
    {
      name: "Lucas Andrade",
      country: "Brazil",
      role: "Forward",
      blurb: "Brazil's shampoo-ad smile. Scored two, memed by breakfast.",
      blurb_he: "החיוך של ברזיל מפרסומת לשמפו. שני שערים, ומם עד ארוחת בוקר.",
      socialTeaser: "Instagram reel: samba with grandma. Nobody is okay.",
      socialTeaser_he: "ריל באינסטגרם: סמבה עם סבתא. אף אחד לא בסדר.",
      socialUrl: gw("Lucas Andrade Brazil instagram"),
      imageSeed: "andrade-brazil-hot",
      score: "9.6",
      hoursAgo: 30,
      isPlayingLive: false,
      match: "vs Serbia",
    },
    {
      name: "Marko Perišić",
      country: "Croatia",
      role: "Wing-back",
      blurb: "Croatia's forearm veins have their own fan account.",
      blurb_he: "לוורידים באמות של קרואטיה יש חשבון מעריצים משלהם.",
      socialTeaser: "Instagram: post-training photo, sleeves cut off, deliberately.",
      socialTeaser_he: "אינסטגרם: תמונה אחרי אימון, שרוולים חתוכים, בכוונה.",
      socialUrl: gw("Marko Perisic Croatia instagram"),
      imageSeed: "perisic-croatia-hot",
      score: "8.9",
      hoursAgo: 40,
      isPlayingLive: false,
      match: "vs Japan",
    },
    {
      name: "Rodrigo de Paz",
      country: "Argentina",
      role: "Central midfielder",
      blurb: "Argentina's chaos-eyed midfielder. The scowl is deliberate.",
      blurb_he: "הקשר עם המבט הכאוטי של ארגנטינה. הזעף מכוון.",
      socialTeaser: "TikTok: locker-room 'get ready with me', someone in the mirror.",
      socialTeaser_he: "טיקטוק: 'תתכוננו איתי' בחדר הלבשה, מישהו במראה.",
      socialUrl: gw("Rodrigo de Paz Argentina tiktok"),
      imageSeed: "depaz-argentina-hot",
      score: "8.7",
      hoursAgo: 55,
      isPlayingLive: false,
      match: "vs Poland",
    },
  ],
  microTips: [
    { en: "Brazil's star winger dyed his hair again; use this to pretend you've been watching.", he: "הכוכב של ברזיל צבע שוב את השיער. תשתמשי בזה כדי להעמיד פנים שצפית." },
    { en: "VAR is currently the enemy of joy. Nod and sigh when someone mentions 'replays'.", he: "ה-VAR הוא כרגע אויב השמחה. תהנהני ותאנחי כשמישהו מזכיר 'שידור חוזר'." },
    { en: "France's main striker drinks herbal tea. Vital leverage for your next argument.", he: "החלוץ המרכזי של צרפת שותה תה צמחים. מנוף חיוני לוויכוח הבא שלך." },
    { en: "Morocco is the sentimental favorite. Praising them is socially free real estate.", he: "מרוקו היא המועדפת הסנטימנטלית. לשבח אותה זה נדל\"ן חברתי חינם." },
    { en: "England looked 'fine, actually'. Which, for England fans, counts as a crisis.", he: "אנגליה נראתה 'בסדר, האמת'. שזה, לאוהדי אנגליה, נחשב למשבר." },
  ],
  odds: [
    { team: "France", team_he: "צרפת", pct: 24 },
    { team: "Brazil", team_he: "ברזיל", pct: 21 },
    { team: "Argentina", team_he: "ארגנטינה", pct: 18 },
    { team: "England", team_he: "אנגליה", pct: 14 },
    { team: "Spain", team_he: "ספרד", pct: 11 },
  ],
  peaceForecast: [
    { slot: "Tues 18:00", slot_he: "שלישי 18:00", note: "Likely shouting & spilled beer", note_he: "צעקות ובירה שנשפכת", level: "critical" },
    { slot: "Wed 14:00", slot_he: "רביעי 14:00", note: "Productive apathy", note_he: "אדישות פרודוקטיבית", level: "safe" },
    { slot: "Thu 20:00", slot_he: "חמישי 20:00", note: "Semi-final: brace for tears", note_he: "חצי גמר: היכוני לדמעות", level: "critical" },
    { slot: "Fri 12:00", slot_he: "שישי 12:00", note: "No matches. Actual daylight.", note_he: "אין משחקים. אור יום ממשי.", level: "safe" },
  ],
  proTips: [
    { label: "Pro Survival Tip", label_he: "טיפ הישרדות מקצועי", text: "\"When they say 'False Nine', just nod. Don't ask what it means. Nobody actually knows.\"", text_he: "\"כשאומרים 'תשע כוזב', פשוט תהנהני. אל תשאלי מה זה. אף אחד באמת לא יודע.\"" },
    { label: "Pro Survival Tip #2", label_he: "טיפ הישרדות מקצועי #2", text: "\"If he mentions 'xG' three times in one sentence, pour yourself a glass of wine and tune out.\"", text_he: "\"אם הוא מזכיר 'xG' שלוש פעמים במשפט אחד, מזגי לך כוס יין ותנתקי.\"" },
  ],
  fakeLines: [
    { en: "\"Their midfield press is a mess.\"", he: "\"הלחיצה שלהם בקישור בלגן מוחלט.\"" },
    { en: "\"Honestly? Give me a proper number nine.\"", he: "\"בכנות? תני לי חלוץ מספר תשע אמיתי.\"" },
    { en: "\"You can't defend that with three at the back.\"", he: "\"אי אפשר להתגונן עם שלושה מאחור.\"" },
  ],
};

export const getMondialIntel = createServerFn({ method: "GET" }).handler(
  async (): Promise<MondialIntel> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const now = Date.now();

    // Try Polymarket public gamma-api for a "live" online signal
    let polymarketOnline = false;
    try {
      const pm = await fetch(
        "https://gamma-api.polymarket.com/markets?closed=false&limit=1",
        { signal: AbortSignal.timeout(3500) },
      );
      polymarketOnline = pm.ok;
    } catch {
      polymarketOnline = false;
    }

    // Ground every visible section in real ESPN data first. The AI can add
    // color, but standings-sensitive widgets come from this deterministic block.
    const ymd = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}${m}${day}`;
    };
    const start = ymd(new Date(now - 5 * 86_400_000));
    const end = ymd(new Date(now + 7 * 86_400_000));
    let groundedMatches: GroundedMatch[] = [];
    let liveTeams: string[] = [];
    let upcomingTeams: string[] = [];
    let recentResults: string[] = [];
    let eliminatedTeams: string[] = [];
    try {
      const scb = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${start}-${end}`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (scb.ok) {
        const data = (await scb.json()) as {
          events?: Array<{
            date: string;
            competitions: Array<{
              status: { displayClock?: string; type: { state: string; detail?: string; shortDetail?: string; completed?: boolean } };
              competitors: Array<{
                homeAway: "home" | "away";
                score?: string;
                winner?: boolean;
                team: { displayName: string };
              }>;
            }>;
            season?: { slug?: string };
          }>;
        };
        const events = data.events ?? [];
        for (const e of events) {
          const c = e.competitions?.[0];
          if (!c) continue;
          const st = c.status.type.state as GroundedMatch["state"];
          const home = c.competitors.find((x) => x.homeAway === "home");
          const away = c.competitors.find((x) => x.homeAway === "away");
          if (!home || !away) continue;
          const hn = canonicalTeam(home.team.displayName);
          const an = canonicalTeam(away.team.displayName);
          const slug = e.season?.slug ?? "";
          const isKnockout = /round-of|quarter|semi|final/i.test(slug);
          const hs = Number(home.score ?? "0");
          const as = Number(away.score ?? "0");
          const winner =
            home.winner === true ? hn : away.winner === true ? an : st === "post" && hs > as ? hn : st === "post" && as > hs ? an : undefined;
          const loser = winner === hn ? an : winner === an ? hn : undefined;
          groundedMatches.push({
            kickoffISO: e.date,
            state: st,
            home: hn,
            away: an,
            homeScore: hs,
            awayScore: as,
            minute: c.status.displayClock || c.status.type.shortDetail,
            detail: c.status.type.detail ?? c.status.type.shortDetail ?? "",
            phase: slug.replace(/-/g, " ") || "world cup",
            winner,
            loser,
            isKnockout,
          });
          if (st === "in") {
            liveTeams.push(hn, an);
          } else if (st === "pre") {
            upcomingTeams.push(hn, an);
          } else if (st === "post") {
            recentResults.push(`${hn} ${hs}-${as} ${an}`);
            if (isKnockout) {
              if (loser) eliminatedTeams.push(loser);
            }
          }
        }
      }
    } catch {
      // best-effort — fall through with empty context
    }
    groundedMatches = groundedMatches.sort((a, b) => a.kickoffISO.localeCompare(b.kickoffISO));
    const liveMatches = groundedMatches.filter((m) => m.state === "in");
    const upcomingMatches = groundedMatches.filter((m) => m.state === "pre");
    const recentMatches = groundedMatches
      .filter((m) => m.state === "post")
      .sort((a, b) => b.kickoffISO.localeCompare(a.kickoffISO));
    liveTeams = uniq(liveTeams).filter((team) => !isPlaceholderTeam(team));
    upcomingTeams = uniq(upcomingTeams).filter((team) => !isPlaceholderTeam(team));
    eliminatedTeams = uniq(eliminatedTeams).filter((team) => !isPlaceholderTeam(team));
    const stillActive = uniq([...liveTeams, ...upcomingTeams]).filter(
      (team) => !isPlaceholderTeam(team) && !eliminatedTeams.map((t) => t.toLowerCase()).includes(team.toLowerCase()),
    );
    const groundedMicroTips = buildLiveMicroTips(liveMatches, upcomingMatches, recentMatches);
    const groundedOdds = buildLiveOdds(liveMatches, upcomingMatches, eliminatedTeams);
    const groundedHotPlayers = await attachHotPlayerImages(buildLiveHotPlayers(liveMatches, upcomingMatches));

    if (!apiKey) {
      return {
        ...FALLBACK,
        fetchedAt: now,
        polymarketOnline,
        microTips: groundedMicroTips.length ? groundedMicroTips : [],
        odds: groundedOdds,
        hotPlayers: groundedHotPlayers,
      };
    }

    const groundingBlock = `LIVE_CONTEXT (from ESPN, ${new Date(now).toISOString()}):
- Teams playing RIGHT NOW: ${liveTeams.length ? liveTeams.join(", ") : "NONE"}
- Teams with upcoming matches in next 7 days: ${upcomingTeams.length ? upcomingTeams.join(", ") : "NONE"}
- Teams still active in tournament (union of above): ${stillActive.length ? stillActive.join(", ") : "UNKNOWN — no data"}
- Teams already ELIMINATED (do NOT include in odds, hotPlayers, isPlayingLive): ${eliminatedTeams.length ? eliminatedTeams.join(", ") : "none known"}
- Recent results (last 5 days): ${recentResults.length ? recentResults.join(" | ") : "none"}

CRITICAL GROUNDING RULES:
1. "odds" MUST only contain teams from stillActiveTeams. Never include an eliminatedTeam. If stillActiveTeams is UNKNOWN, use the top 5 favorites from the 2026 tournament.
2. "hotPlayers" MUST only feature players from stillActiveTeams. Never from an eliminatedTeam.
3. "isPlayingLive" MUST be true ONLY when the player's country is in liveTeams AND liveTeams is non-empty. Otherwise ALL isPlayingLive must be false.
4. "microTips" MUST reference stillActiveTeams or the recent results above. Do NOT invent gossip about eliminated teams.
5. "drops" and "gossip" MUST prioritise players/coaches from stillActiveTeams. Occasional post-elimination drama is allowed but MUST be phrased as past-tense ("after their exit", "since bowing out").`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: `${groundingBlock}\n\nGenerate a fresh payload for right now. Seed: ${now}. Return only the JSON object.`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 1.05,
        }),
      });

      if (!res.ok) {
        return { ...FALLBACK, fetchedAt: now, polymarketOnline };
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content;
      if (!content) return { ...FALLBACK, fetchedAt: now, polymarketOnline };

      const parsed = JSON.parse(content) as Partial<MondialIntel>;
      if (
        !Array.isArray(parsed.markets) ||
        !Array.isArray(parsed.winners) ||
        !Array.isArray(parsed.drops)
      ) {
        return { ...FALLBACK, fetchedAt: now, polymarketOnline };
      }

      // Normalize: guarantee URLs even when the model omits them.
      const markets = (parsed.markets.slice(0, 4) as BettingMarket[]).map((m) => ({
        ...m,
        url: m.url && m.url.startsWith("http") ? m.url : pm(`world cup 2026 ${m.question ?? ""}`),
      }));
      const winners = (parsed.winners.slice(0, 3) as BiggestWinner[]).map((w) => ({
        ...w,
        profileUrl:
          w.profileUrl && w.profileUrl.startsWith("http")
            ? w.profileUrl
            : `https://polymarket.com/profile/${(w.handle ?? "").replace(/^@/, "")}`,
      }));
      const drops = (parsed.drops.slice(0, 5) as JuicyDrop[]).map((d) => ({
        ...d,
        sourceUrl:
          d.sourceUrl && d.sourceUrl.startsWith("http") ? d.sourceUrl : g(d.headline ?? "world cup"),
      }));
      const eliminatedSet = new Set(eliminatedTeams.map((t) => t.toLowerCase()));
      const liveSet = new Set(liveTeams.map((t) => t.toLowerCase()));
      const activeSet = new Set(stillActive.map((t) => t.toLowerCase()));
      const isEliminated = (country?: string) =>
        !!country && eliminatedSet.has(country.toLowerCase());

      const hotPlayersFiltered = ((parsed.hotPlayers ?? []).slice(0, 12) as HotPlayerLive[])
        .filter((p) => p && p.name && !isEliminated(p.country))
        .map((p) => ({
          ...p,
          imageSeed: slug(p.imageSeed || `${p.name ?? "player"}-${p.country ?? ""}`),
          socialUrl:
            p.socialUrl && p.socialUrl.startsWith("http")
              ? p.socialUrl
              : gw(`${p.name ?? ""} ${p.country ?? ""} instagram`),
          // Force correct isPlayingLive: only true when that country is actually on the pitch RIGHT NOW.
          isPlayingLive: !!p.isPlayingLive && liveSet.has((p.country ?? "").toLowerCase()),
        }))
        .slice(0, 8)
        .sort((a, b) => {
          if (a.isPlayingLive !== b.isPlayingLive) return a.isPlayingLive ? -1 : 1;
          return (a.hoursAgo ?? 999) - (b.hoursAgo ?? 999);
        });

      // Resolve real player photos from Wikipedia in parallel.
      const wikiThumb = async (name: string): Promise<string | undefined> => {
        if (!name) return undefined;
        try {
          const r = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/\s+/g, "_"))}`,
            { signal: AbortSignal.timeout(2500), headers: { accept: "application/json" } },
          );
          if (!r.ok) return undefined;
          const j = (await r.json()) as {
            originalimage?: { source?: string };
            thumbnail?: { source?: string };
            type?: string;
          };
          if (j.type === "disambiguation") return undefined;
          return j.originalimage?.source ?? j.thumbnail?.source;
        } catch {
          return undefined;
        }
      };
      const hotPlayers = await Promise.all(
        hotPlayersFiltered.map(async (p) => ({ ...p, imageUrl: await wikiThumb(p.name) })),
      );

      const gossipFiltered = ((parsed.gossip ?? []).slice(0, 8) as GossipItem[])
        .filter((it) => it && it.player && !isEliminated(it.country))
        .map((it) => ({
          ...it,
          imageSeed: slug(it.imageSeed || `${it.player ?? "player"}-${it.country ?? ""}`),
          sourceUrl:
            it.sourceUrl && it.sourceUrl.startsWith("http")
              ? it.sourceUrl
              : gs(`${it.player ?? ""} ${it.country ?? ""} outfit tunnel`),
        }))
        .slice(0, 6);
      const gossipWithImages = await Promise.all(
        gossipFiltered.map(async (it) => ({ ...it, imageUrl: await wikiThumb(it.player) })),
      );

      const microTips = ((parsed.microTips ?? []) as MicroTip[])
        .filter((m) => m && m.en && m.he).slice(0, 5);
      let odds = ((parsed.odds ?? []) as OddsRow[])
        .filter(
          (o) =>
            o &&
            o.team &&
            typeof o.pct === "number" &&
            !eliminatedSet.has(o.team.toLowerCase()),
        )
        .slice(0, 5);
      // If we know the active set, also drop odds rows for teams that aren't in it (extra safety).
      if (activeSet.size > 0) {
        const filtered = odds.filter((o) => activeSet.has(o.team.toLowerCase()));
        if (filtered.length >= 3) odds = filtered;
      }
      const peaceForecast = ((parsed.peaceForecast ?? []) as PeaceSlot[])
        .filter((p) => p && p.slot && p.note).slice(0, 4);
      const proTips = ((parsed.proTips ?? []) as ProTip[])
        .filter((p) => p && p.text && p.text_he).slice(0, 2);
      const fakeLines = ((parsed.fakeLines ?? []) as FakeLine[])
        .filter((f) => f && f.en && f.he).slice(0, 3);

      // Fallback odds: strip any eliminated teams from the built-in list too.
      const safeFallbackOdds = FALLBACK.odds.filter(
        (o) => !eliminatedSet.has(o.team.toLowerCase()),
      );
      return {
        fetchedAt: now,
        polymarketOnline,
        totalWageredUsd:
          typeof parsed.totalWageredUsd === "number"
            ? parsed.totalWageredUsd
            : FALLBACK.totalWageredUsd,
        markets,
        winners,
        drops,
        gossip: gossipWithImages.length ? gossipWithImages : FALLBACK.gossip,
        hotPlayers: hotPlayers.length ? hotPlayers : FALLBACK.hotPlayers,
        microTips: microTips.length ? microTips : FALLBACK.microTips,
        odds: odds.length ? odds : (safeFallbackOdds.length ? safeFallbackOdds : FALLBACK.odds),
        peaceForecast: peaceForecast.length ? peaceForecast : FALLBACK.peaceForecast,
        proTips: proTips.length === 2 ? proTips : FALLBACK.proTips,
        fakeLines: fakeLines.length ? fakeLines : FALLBACK.fakeLines,
      };
    } catch {
      return { ...FALLBACK, fetchedAt: now, polymarketOnline };
    }
  },
);