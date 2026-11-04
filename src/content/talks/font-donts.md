---
title: "Font Don'ts"
event: "REDspace Tech Share"
date: 2021-10-18
summary: "The most common ways web fonts go wrong: blocking embeds, faux bold, fuzzy rendering, and why variable fonts are the next step."
---

<!-- Draft from the slides. Swap in your own notes. -->

For most of us, at some level, a user is looking at text on whatever we build.
My friend [Jason Pamental](https://rwt.io) put it best:

> Type is how we "hear" what we read.

If you care about type on the web, Jason is the person to learn from. (We did a
variable fonts workshop with him back in January 2020.)

**Embedding fonts properly**

Avoid `@import` for embedding fonts: it blocks rendering. Use `@font-face`
instead, listing `woff2` first and `woff` as the fallback.

**Using fonts incorrectly**

The classic mistake: you declare only the regular weight, then set
`font-weight: bold` on it. There's no bold file, so the browser fakes it by
smearing the regular one. Bad!

The "fix" a lot of us reach for is just as bad: declaring the bold file as its
own family, like `"Open Sans Bold"`, and switching families to get bold text.
Now bold isn't a weight anymore, and if you also set `font-weight: bold`, the
browser fakes bold on top of the real bold. Bad, bad!

What you want is one family with a face per weight:

```css
@font-face {
  font-family: "Open Sans";
  src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
       url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
}

@font-face {
  font-family: "Open Sans";
  src: url("/fonts/OpenSans-Bold-webfont.woff2") format("woff2"),
       url("/fonts/OpenSans-Bold-webfont.woff") format("woff");
  font-weight: bold;
}

.bold {
  font-family: "Open Sans";
  font-weight: bold;
}
```

Now `font-weight: bold` picks the real bold file.

**Font smoothing**

Ever put a web font on your site and it just doesn't look right? You may be
having an anti-aliasing issue, and there's a simple fix:

```css
html,
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Variable fonts**

Variable fonts are the next evolution of fonts: every variation of a font from
a single embed. Fewer files means less bandwidth, which means faster sites. Many
of the free Google Fonts are now available as variable fonts, like
[Lora](https://fonts.google.com/specimen/Lora).
