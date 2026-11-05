---
title: "React Server-Side Rendering with PHP"
event: "REDspace Tech Share"
date: 2018-06-26
summary: "Server-side rendering React from a PHP server, by embedding Google's V8 engine with V8Js. I don't know why either."
---

<!-- Draft from the slides. Swap in your own notes. -->

An internal tech share at REDspace. The title slide's subtitle said it best:
*I don't know why either.*

React's `react-dom/server` module renders components to HTML, but it expects to
run in Node. I'd read that you could do it from PHP, so I tried.

**How it works**

- [V8Js](https://github.com/phpv8/v8js) embeds Google's V8 JavaScript engine in
  PHP. Install it with PECL and enable it in `php.ini`.
- PHP runs your React bundle through V8, calls `renderToString`, and sends the
  HTML to the browser.
- In the browser, React hydrates that markup and takes over.

**Getting React ready**

- Expose React (and anything else the render needs) globally, so V8 can reach it.
- Watch your plugins: not everything runs outside a browser.
- `BrowserRouter` doesn't work on the server, so know where those edges are.

**Was it worth it?**

A lot of work for... what? Data fetched in `componentDidMount` still happens in
the browser, so the SEO win is limited. It might make sense for the page
structure (headers, nav, layout) while the requests happen client-side, for
more dynamic content, or for serializing the app's state as a whole.
