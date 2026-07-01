import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import player1 from "@/assets/player-1.jpg";
import player2 from "@/assets/player-2.jpg";
import player3 from "@/assets/player-3.jpg";
import player4 from "@/assets/player-4.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

// Target: end of the current FIFA World Cup final.
// (Placeholder date — adjust when the real fixture is set.)
const FINAL_DATE = new Date("2026-07-19T22:00:00Z");

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

const microNews = [
  "Brazil's star winger dyed his hair again; use this to pretend you've been watching.",
  "VAR is currently the enemy of joy. Nod and sigh when someone mentions 'replays'.",
  "The main striker for France drinks herbal tea. Vital leverage for your next argument.",
  "Morocco is the sentimental favorite. Praising them is socially free real estate.",
  "England looked 'fine, actually'. Which, for England fans, counts as a crisis.",
];

const winOdds = [
  { team: "France", pct: 24 },
  { team: "Brazil", pct: 21 },
  { team: "Argentina", pct: 18 },
  { team: "England", pct: 14 },
  { team: "Spain", pct: 11 },
];

const peaceForecast = [
  { slot: "Tues 18:00", note: "Likely shouting & spilled beer", level: "critical" as const },
  { slot: "Wed 14:00", note: "Productive apathy", level: "safe" as const },
  { slot: "Thu 20:00", note: "Semi-final: brace for tears", level: "critical" as const },
  { slot: "Fri 12:00", note: "No matches. Actual daylight.", level: "safe" as const },
];

const fixtures = [
  {
    time: "16:00 GMT",
    when: "Tomorrow",
    match: "Morocco vs Belgium",
    window: "The last 12 minutes. That's when the drama peaks. Skip the rest.",
  },
  {
    time: "20:00 GMT",
    when: "Tomorrow",
    match: "Germany vs Spain",
    window: "First 20 mins for the anthem stares, then go read a book until full-time.",
  },
  {
    time: "19:30 GMT",
    when: "Thursday",
    match: "France vs Argentina",
    window: "Skip. It will go to penalties. It always goes to penalties.",
  },
];

function Index() {
  const { days, hours, minutes, seconds } = useCountdown(FINAL_DATE);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-baseline gap-6 border-b-2 border-foreground pb-8 mb-12 animate-[slideUp_0.6s_var(--ease-out-expo)_both]">
        <div className="space-y-1">
          <h1 className="text-5xl md:text-7xl font-display italic tracking-tight">The Offside Guide</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Edition 04 // Vol. 3: Survival is the Goal
          </p>
        </div>

        <div className="bg-foreground text-background p-6 rounded-sm min-w-[320px]">
          <p className="font-mono text-[10px] uppercase tracking-tighter mb-2 opacity-60">
            Countdown to Emotional Freedom
          </p>
          <div className="flex gap-4 items-end">
            <div className="text-3xl font-extrabold tabular-nums">
              {pad(days)}
              <span className="text-[10px] ml-1 font-mono uppercase opacity-50">D</span>
            </div>
            <div className="text-3xl font-extrabold tabular-nums">
              {pad(hours)}
              <span className="text-[10px] ml-1 font-mono uppercase opacity-50">H</span>
            </div>
            <div className="text-3xl font-extrabold tabular-nums">
              {pad(minutes)}
              <span className="text-[10px] ml-1 font-mono uppercase opacity-50">M</span>
            </div>
            <div className="text-3xl font-extrabold tabular-nums opacity-60">
              {pad(seconds)}
              <span className="text-[10px] ml-1 font-mono uppercase opacity-50">S</span>
            </div>
            <div className="animate-[pulseRed_1.5s_infinite] size-2 bg-primary rounded-full mb-3 ml-auto" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* LEFT: intel + odds + peace */}
        <div className="md:col-span-4 space-y-12">
          <section className="animate-[slideUp_0.6s_var(--ease-out-expo)_60ms_both]">
            <h2 className="font-mono text-[11px] uppercase tracking-widest border-b border-border pb-2 mb-4">
              Must-Know Micro-Intel
            </h2>
            <div className="space-y-4">
              {microNews.map((n, i) => (
                <div key={i}>
                  <p className="text-sm leading-relaxed">
                    <span className="text-primary font-bold mr-2 tabular-nums">
                      {pad(i + 1)}
                    </span>
                    {n}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-[slideUp_0.6s_var(--ease-out-expo)_120ms_both]">
            <h2 className="font-mono text-[11px] uppercase tracking-widest border-b border-border pb-2 mb-6">
              Win Probability (The Likeliest Culprits)
            </h2>
            <div className="space-y-5">
              {winOdds.map((o) => (
                <div key={o.team} className="flex items-center gap-4">
                  <span className="w-12 font-mono text-xs text-muted-foreground tabular-nums">
                    {o.pct}%
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground"
                      style={{ width: `${o.pct * 3}%`, maxWidth: "100%" }}
                    />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-tight w-20 text-right">
                    {o.team}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface border border-border p-6 rounded-sm animate-[slideUp_0.6s_var(--ease-out-expo)_180ms_both]">
            <h2 className="font-mono text-[11px] uppercase tracking-widest mb-6">
              Household Peace Forecast
            </h2>
            <div className="space-y-4">
              {peaceForecast.map((p) => (
                <div key={p.slot} className="flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{p.slot}</p>
                    <p className="text-[11px] text-muted-foreground uppercase">{p.note}</p>
                  </div>
                  {p.level === "critical" ? (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full ring-1 ring-primary/30 whitespace-nowrap">
                      Critical
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-full ring-1 ring-success/30 whitespace-nowrap">
                      Safe
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CENTER: Hot Player Index */}
        <div className="md:col-span-5 animate-[slideUp_0.6s_var(--ease-out-expo)_240ms_both]">
          <h2 className="font-display text-3xl italic mb-8 border-b-2 border-foreground pb-4">
            The Hot Player Index
          </h2>

          <div className="space-y-8">
            <div className="group relative">
              <div className="w-full aspect-[4/5] bg-muted rounded-sm overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img
                  src={player1}
                  alt="Rank 1 — Mateo V., Spain midfielder"
                  width={896}
                  height={1120}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex justify-between items-start gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase text-primary font-bold">
                    #01 // Spain
                  </p>
                  <h3 className="text-2xl font-display italic">Mateo Vidal</h3>
                  <p className="text-sm mt-2 max-w-[36ch] text-pretty text-muted-foreground">
                    The hair remains impeccable despite 90 minutes of sprinting. A
                    miracle of modern engineering.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[10px] uppercase text-muted-foreground">
                    Hotness
                  </p>
                  <p className="text-3xl font-extrabold tracking-tighter italic">9.8</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 pt-8 border-t border-border">
              <div className="col-span-2">
                <div className="aspect-square bg-muted rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                  <img
                    src={player2}
                    alt="Rank 2 — Cho Gue-sung"
                    width={768}
                    height={768}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <p className="font-mono text-[10px] uppercase text-primary font-bold">
                  #02 // Korea
                </p>
                <h3 className="text-xl font-display italic">Cho Gue-sung</h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  Breaks the internet every time he subs on. Jawline could cut glass. Kickoff at 12:30 GMT — set an alarm.
                </p>
                <p className="font-mono text-[10px] uppercase text-muted-foreground pt-1">
                  Hotness <span className="text-foreground font-extrabold not-italic ml-1">9.4</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 pt-8 border-t border-border">
              <div className="col-span-2">
                <div className="aspect-square bg-muted rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                  <img
                    src={player3}
                    alt="Rank 3 — Théo L."
                    width={896}
                    height={1120}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <p className="font-mono text-[10px] uppercase text-primary font-bold">
                  #03 // France
                </p>
                <h3 className="text-xl font-display italic">Théo Laurent</h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  Emotionally available on Instagram. Cries after every match. Plays Thursday 19:30.
                </p>
                <p className="font-mono text-[10px] uppercase text-muted-foreground pt-1">
                  Hotness <span className="text-foreground font-extrabold not-italic ml-1">9.1</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 pt-8 border-t border-border">
              <div className="col-span-2">
                <div className="aspect-square bg-muted rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                  <img
                    src={player4}
                    alt="Rank 4 — Rodrigo de P."
                    width={768}
                    height={768}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <p className="font-mono text-[10px] uppercase text-primary font-bold">
                  #04 // Argentina
                </p>
                <h3 className="text-xl font-display italic">Rodrigo de Paz</h3>
                <p className="text-xs text-muted-foreground leading-snug">
                  Chaotic energy, elite bone structure. The scowl is a choice. A solid pick for the quarter-finals.
                </p>
                <p className="font-mono text-[10px] uppercase text-muted-foreground pt-1">
                  Hotness <span className="text-foreground font-extrabold not-italic ml-1">8.7</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: fixtures + tip */}
        <div className="md:col-span-3 space-y-12 animate-[slideUp_0.6s_var(--ease-out-expo)_300ms_both]">
          <section>
            <h2 className="font-mono text-[11px] uppercase tracking-widest border-b border-border pb-2 mb-6">
              Optimal Viewing
            </h2>
            <div className="space-y-8">
              {fixtures.map((f) => (
                <div key={f.match} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase bg-foreground text-background px-1.5 py-0.5">
                      {f.time}
                    </span>
                    <span className="text-[10px] text-primary font-bold uppercase">
                      {f.when}
                    </span>
                  </div>
                  <p className="font-bold text-lg leading-tight uppercase tracking-tighter">
                    {f.match}
                  </p>
                  <div className="p-3 bg-muted rounded-sm">
                    <p className="text-[10px] font-bold uppercase mb-1 text-primary">
                      Optimal Window:
                    </p>
                    <p className="text-xs leading-relaxed italic text-muted-foreground">
                      {f.window}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="p-6 border-2 border-primary rounded-sm bg-primary/5">
            <p className="font-mono text-[10px] uppercase text-primary font-bold mb-2">
              Pro Survival Tip
            </p>
            <p className="text-sm leading-snug font-medium italic">
              "When they say 'False Nine', just nod. Don't ask what it means. Nobody actually knows."
            </p>
          </div>

          <div className="p-6 border border-border rounded-sm">
            <p className="font-mono text-[10px] uppercase text-muted-foreground font-bold mb-2">
              Fake-Conversation Kit
            </p>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li>&mdash; "Their midfield press is a mess."</li>
              <li>&mdash; "Honestly? Give me a proper number nine."</li>
              <li>&mdash; "You can't defend that with three at the back."</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 border-t border-foreground py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          The Offside Guide © {new Date().getFullYear()}
        </p>
        <div className="flex gap-8">
          <a href="#" className="font-mono text-[10px] uppercase hover:text-primary transition-colors">
            The Exit Strategy
          </a>
          <a href="#" className="font-mono text-[10px] uppercase hover:text-primary transition-colors">
            Mute Keywords
          </a>
          <a href="#" className="font-mono text-[10px] uppercase hover:text-primary transition-colors">
            Peace Protocols
          </a>
        </div>
      </footer>
    </div>
  );
}
