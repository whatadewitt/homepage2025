---
title: "Symmetric Pandemic"
tag: "rebuild · 2025"
blurb: "An old project, brought back with Claude Code."
summary: "A seeded deck shuffler that lets two teams play the same game of Pandemic head to head."
order: 5
post: "symmetric-pandemic"
link: "https://whatadewitt.github.io/symmetric-pandemic/"
source: "https://github.com/whatadewitt/symmetric-pandemic"
image: "/images/pandemic.png"
imageAlt: "Pandemic board game"
---

About 13 years ago we wanted to turn Pandemic into a competition: if two teams
play with the same deck, they're essentially playing the same game. A simple
seed made the shuffle repeatable across devices.

**My first vibe-coded project.** When I rebuilt it in 2025, it was the first
time I really tried to "vibe" a project from the start. The original code still
existed: a static jQuery page built for a 2012 iPod Touch screen. Instead of
porting it line by line, I loosely described what I wanted and let Claude Code
build it. In a couple of hours it was playable again, now a React and
TypeScript app with seeded shuffles, a game log, shareable game URLs and offline
support. I fixed a few bugs along the way, with and without Claude, and Gemini
made the pandemic-ridden city artwork.

The one thing I didn't love: Claude rewrote the seed logic. It's better than
mine ever was, but the legendary seed 666 doesn't annihilate you anymore.

The whole story is in the Dew Drop below.
