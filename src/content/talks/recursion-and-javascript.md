---
title: "Recursion & JavaScript: WTF"
event: "REDspace Tech Share"
date: 2017-01-31
summary: "Why deep recursion blows the stack in JavaScript, the setTimeout trick that gets around it, and where tail call optimization actually stood."
---

<!-- Draft from the slides. Swap in your own notes. -->

An internal tech share at REDspace. I love recursion. JavaScript, historically,
has not loved it back.

**Why it breaks**

JavaScript wasn't tail call optimized. Every recursive call has to remember
where it was called from so it can resume there, so the calls stack up on each
other until you run out of memory.

**Until this...**

Then I found a `setTimeout(..., 0)` in our code with the comment *"prevents
stack blowout with recursion."* Calling the function again from inside a
timeout starts it on a fresh stack, so the old one never builds up. Or at least,
that's how it was explained to me.

**Turns out...**

Tail call optimization is part of the ES6 standard, but most platforms hadn't
implemented it yet:

- iOS 10 supported it. #appleFTW
- Node 6.5+ supported it, but only behind the `--harmony` flag.
- The full picture: the [ES6 compatibility table](https://kangax.github.io/compat-table/es6/).
