import { createServerFn } from "@tanstack/react-start";

export type LiveTeam = {
  name: string;
  shortName: string;
  abbr: string;
  score: string;
  logo?: string;
  flagCountry?: string;
};

export type LiveMatch = {
  id: string;
  kickoffISO: string;
  home: LiveTeam;
  away: LiveTeam;
  minute?: string; // e.g. "63'", "HT"
  detail: string; // ESPN's status detail
  state: "pre" | "in" | "post";
  venue?: string;
  competition: string; // e.g. "Round of 32"
  espnUrl: string;
};

export type MondialLive = {
  generatedAt: number;
  live: LiveMatch[];
  upcoming: LiveMatch[]; // next kickoffs, chronological
  recent: LiveMatch[]; // finished, most-recent first
  source: "espn" | "fallback";
  competitionPhase: string;
};

// yyyymmdd in UTC
function ymd(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

type EspnCompetitor = {
  homeAway: "home" | "away";
  score?: string;
  team: {
    displayName: string;
    shortDisplayName: string;
    abbreviation: string;
    logo?: string;
    location?: string;
  };
};

type EspnEvent = {
  id: string;
  date: string;
  shortName: string;
  competitions: Array<{
    venue?: { fullName?: string };
    status: {
      displayClock?: string;
      period?: number;
      type: { state: "pre" | "in" | "post"; detail: string; shortDetail: string };
    };
    competitors: EspnCompetitor[];
  }>;
  season?: { slug?: string };
  links?: Array<{ href: string; rel?: string[] }>;
};

function toMatch(e: EspnEvent): LiveMatch | null {
  const c = e.competitions?.[0];
  if (!c) return null;
  const home = c.competitors.find((x) => x.homeAway === "home");
  const away = c.competitors.find((x) => x.homeAway === "away");
  if (!home || !away) return null;
  const st = c.status.type;
  let minute: string | undefined;
  if (st.state === "in") {
    minute = c.status.displayClock ? `${c.status.displayClock}` : st.shortDetail;
  } else if (st.state === "post") {
    minute = st.shortDetail; // "FT", "AET", "FT/Pens"
  }
  const espnHref =
    e.links?.find((l) => l.rel?.includes("summary"))?.href ??
    `https://www.espn.com/soccer/match/_/gameId/${e.id}`;
  return {
    id: e.id,
    kickoffISO: e.date,
    home: {
      name: home.team.displayName,
      shortName: home.team.shortDisplayName,
      abbr: home.team.abbreviation,
      score: home.score ?? "",
      logo: home.team.logo,
      flagCountry: home.team.location,
    },
    away: {
      name: away.team.displayName,
      shortName: away.team.shortDisplayName,
      abbr: away.team.abbreviation,
      score: away.score ?? "",
      logo: away.team.logo,
      flagCountry: away.team.location,
    },
    minute,
    detail: st.detail,
    state: st.state,
    venue: c.venue?.fullName,
    competition: (e.season?.slug || "").replace(/-/g, " ") || "world cup",
    espnUrl: espnHref,
  };
}

async function fetchScoreboard(dateParam: string): Promise<EspnEvent[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateParam}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return [];
  const json = (await res.json()) as { events?: EspnEvent[] };
  return json.events ?? [];
}

export const getMondialLive = createServerFn({ method: "GET" }).handler(
  async (): Promise<MondialLive> => {
    const now = new Date();
    const start = new Date(now.getTime() - 2 * 86_400_000);
    const end = new Date(now.getTime() + 6 * 86_400_000);
    const range = `${ymd(start)}-${ymd(end)}`;

    let events: EspnEvent[] = [];
    try {
      events = await fetchScoreboard(range);
    } catch {
      events = [];
    }

    if (events.length === 0) {
      return {
        generatedAt: Date.now(),
        live: [],
        upcoming: [],
        recent: [],
        source: "fallback",
        competitionPhase: "World Cup 2026",
      };
    }

    const matches = events.map(toMatch).filter((m): m is LiveMatch => !!m);
    const live = matches
      .filter((m) => m.state === "in")
      .sort((a, b) => a.kickoffISO.localeCompare(b.kickoffISO));
    const upcoming = matches
      .filter((m) => m.state === "pre")
      .sort((a, b) => a.kickoffISO.localeCompare(b.kickoffISO))
      .slice(0, 6);
    const recent = matches
      .filter((m) => m.state === "post")
      .sort((a, b) => b.kickoffISO.localeCompare(a.kickoffISO))
      .slice(0, 6);

    // Best-effort competition phase from most recent event slug
    const phaseSlug =
      events[events.length - 1]?.season?.slug ??
      events[0]?.season?.slug ??
      "world-cup";
    const competitionPhase = phaseSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      generatedAt: Date.now(),
      live,
      upcoming,
      recent,
      source: "espn",
      competitionPhase,
    };
  },
);