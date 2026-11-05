---
title: "MLB Pitch Clock Violations Bot"
tag: "bot · 2023"
blurb: "Tracking every pitch clock violation, until Twitter's API paywall."
summary: "A Twitter bot, written in Go, that tracked MLB pitch clock violations in the clock's first season."
order: 8
source: "https://github.com/whatadewitt/mlbviolations"
image: "/images/clock.jpg"
imageAlt: "An outfield pitch clock reading 00, with empty seats behind it"
# Both crops are wide; keep the clock, not the seats.
imagePosition: "50% 70%"
thumbnailPosition: "50% 70%"
---

2023 brought the pitch clock to MLB, and I wanted to see how often players were
running afoul of it. So I wrote a bot that tracked pitch clock violations
around the league and posted them to Twitter as @MLBClockTracker.

It was also my excuse to learn Go. I'd been meaning to pick it up, and a small
bot that polls an API, keeps a little state and posts what it finds felt like
the right size of project to learn a new language on.

Sadly, it's shut down: Twitter (now X) started charging for API access, and a
hobby bot couldn't justify the bill. The code is still up on GitHub.
