---
title: "Modern CSS Selectors"
event: "REDspace Tech Share"
date: 2023-01-25
summary: "I can :has() parent? The sibling combinators I love, :where() and :is() and how they change specificity, and :has(), the parent selector we waited years for."
---

<!-- Draft from the slides. Swap in your own notes. -->

I love CSS. You know that by now.

**Some old favorites**

Yes, like children, you can have favorites:

- **Adjacent sibling (`+`):** `.element + .element` matches an element only if
  it immediately follows the first one, with the same parent.
- **General sibling (`~`):** `.element ~ .element` matches every following
  sibling, not just the next one.

**Some new favorites: `:where()` and `:is()`**

Both take a selector list and match any element that matches one of the
selectors in it. So instead of listing the damn selectors:

```css
.container h1,
.container .element {
  color: red;
}
```

you can write:

```css
.container :is(h1, .element) {
  color: red;
}
```

Wait a second… `:where()` and `:is()` have the *exact same* definition on MDN.
Where is this going?

Compared to listing selectors, both are more compact, and both are
**forgiving**: one invalid selector in the list doesn't throw out the whole
rule, the way it would in a regular selector list.

The difference is **specificity**:

- `:is()` takes the specificity of the most specific selector in its list.
- `:where()` always has a specificity of 0, whatever you put in it.

That makes `:where()` great for defaults that are easy to override. (A quick
refresher on specificity is in the slides, including the most important rule:
never use `!important`.)

My rating: 5/10. Handy, not life-changing.

**`:has()`**

We're talkin' parent selectors, baby! `:has()` matches an element if any of the
selectors you pass it match something inside it:

```css
article:has(h2) {
  color: red;
}
```

Style a parent based on its children, finally. And that's just the tip of the
iceberg.

My rating: 9/10. The future has arrived.

Go forth and style! More on MDN:
[`:where()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:where),
[`:is()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:is) and
[`:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has).
