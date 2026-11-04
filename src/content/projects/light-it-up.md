---
title: "Light It Up"
tag: "mlb · 2026"
blurb: "A hitter's season, lit up like a scoreboard."
summary: "Search an active MLB hitter and watch their season light up like a stadium scoreboard: total bases per game, mapped to the team's schedule."
order: 6
link: "https://www.whatadewitt.com/light-it-up/"
source: "https://github.com/whatadewitt/light-it-up"
---

Pick any active MLB hitter and their 2026 season lights up like a stadium
scoreboard: one cell per team game, in schedule order, brighter for more total
bases. Games they missed show as muted "did not play" slots and future games as
dark sockets, so an injury reads as a visible gap. Hover or focus a cell for
the matchup and batting line.

The brightness ramp changes in luminance, not just hue, so it still reads for
red-green color blindness. The grid is fully keyboard navigable, and every
animation has a reduced-motion fallback.

No framework, no build step: plain ES modules and one stylesheet, fed by the
public MLB StatsAPI.
