---
title: "Claude Status Light"
tag: "macos · 2026"
blurb: "A stoplight for my Claude Code sessions."
summary: "A tiny macOS menu bar stoplight that shows what every Claude Code session is doing at a glance, and jumps you to the one that needs you."
order: 7
source: "https://github.com/whatadewitt/claude-status-light"
---

With several Claude Code sessions going at once, I kept losing track of which
one was waiting on me. So: a stoplight.

| Light | Meaning |
| --- | --- |
| Off | No active session |
| Red | Waiting on you: a permission prompt or a question |
| Yellow | Working (and the crab dances) |
| Green | Done, ready for the next task |

It lives in the menu bar, and optionally in a floating always-on-top window or
the Dock icon. The light is the Claude crab, tinted to the current state, and
while Claude is working the crab dances, wherever it's showing: the menu bar,
the floating window or the Dock. With several sessions running, the light shows
the most urgent state across all of them, a badge counts running subagents, and
clicking a session jumps straight to its terminal tab (iTerm2 and Terminal.app
by exact tab; other terminals come to the front).

Under the hood, Claude Code hooks run a small script on every lifecycle event
that writes each session's state to a JSON file. The Swift app watches that
folder and drops sessions whose process has gone away.
