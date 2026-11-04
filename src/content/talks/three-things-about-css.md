---
title: "Three Things You Might Not Know About CSS"
event: "REDspace Tech Share"
date: 2017-07-18
summary: "Browsers read selectors right to left, CSS can count, and the Fab Four technique makes emails responsive without media queries."
---

<!-- Draft from the slides. Swap in your own notes. -->

An internal tech share at REDspace, and an excuse to talk about CSS for half an
hour.

**1. Browsers read selectors right to left**

In `.card__body .card__body--red`, the browser matches `.card__body--red`
first. If the rightmost part doesn't match the element it's looking at, the
whole rule can be skipped quickly. That wasn't always how it worked, and
browsers do a lot more today to make matching fast.

Which leads to two habits:

- Don't use IDs in CSS. An ID outweighs any number of classes, so specificity
  gets away from you fast. Play with the
  [specificity calculator](https://specificity.keegan.st/).
- Keep selectors short. In Sass, `@at-root` helps you nest without the output
  piling up. Harry Roberts has a good post on
  [keeping CSS selectors short](https://csswizardry.com/2012/05/keep-your-css-selectors-short/).

**2. CSS counters**

CSS can count for you:

- `counter-reset: name;` defines a counter.
- `counter-increment: name;` steps it.
- `content: counter(name);` displays it.

They can also react to the page: count checked checkboxes and you've got a
score with no JavaScript. A couple of fun demos from CodePen:
[Chris Coyier's counters](https://codepen.io/chriscoyier/pen/sDoac) and
[Alex Erlandsson's](https://codepen.io/alexerlandsson/pen/KzQaEG).

**3. The Fab Four**

`calc()` plus `width`, `min-width` and `max-width`. The rules when they
disagree:

- If `width` is greater than `max-width`, `max-width` wins.
- If `min-width` is greater than `width` or `max-width`, `min-width` wins.

So with `width: calc((480px - 100%) * 480)`, a 500px parent gives a huge
negative width and `min-width: 50%` wins (two columns). A 400px parent gives a
huge positive width and `max-width: 100%` wins (one column). That's a
breakpoint at 480px with no media query, which matters in email clients that
ignore them. Here's
[the Fab Four demo](http://emails.hteumeuleu.fr/wp-content/uploads/2016/02/the-fab-four.html).

Quirks to watch for: old Outlook.com, `calc()` support, the Outlook web app, and
WebKit prefixes.
