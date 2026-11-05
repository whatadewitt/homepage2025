---
title: "Light It Up"
tag: "sports · 2026"
blurb: "A player's season, lit up like a scoreboard."
summary: "Search a player from MLB, the NHL, NFL, NBA, WNBA or PWHL and watch their season light up like a stadium scoreboard, game by game across their team's schedule."
order: 6
link: "https://www.whatadewitt.com/light-it-up/"
source: "https://github.com/whatadewitt/light-it-up"
---

Pick a player and their season lights up like a stadium scoreboard: one cell
per team game, in schedule order, brighter for a bigger night. Games they
missed show as muted "did not play" slots and future games as dark sockets, so
an injury reads as a visible gap. Hover or focus a cell for the matchup and
their line.

It started with MLB and now covers the major leagues, women's pro leagues
included, each lit by the stat that fits the sport:

| League | Lights up by |
| --- | --- |
| MLB | Total bases |
| NHL | Points |
| NFL | Yards |
| NBA | Points |
| WNBA | Points |
| PWHL | Points |

The brightness ramp changes in luminance, not just hue, so it still reads for
red-green color blindness. The grid is fully keyboard navigable, and every
animation has a reduced-motion fallback.

No framework, no build step: plain ES modules and one stylesheet, fed by each
league's public data (the MLB StatsAPI, NHL, ESPN, Sleeper and nflverse, and
HockeyTech for the PWHL).
