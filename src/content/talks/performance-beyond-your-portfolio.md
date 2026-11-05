---
title: "Performance: Beyond Your Portfolio"
event: "Web Unleashed 2016"
date: 2016-10-04
location: "Toronto, ON"
summary: "Google's RAIL model for what fast feels like, quick wins you can ship today, and how HTTP/2 changes the way the web is delivered."
---

<!-- Draft from the slides. Swap in your own notes. -->

*Jokes may not be as funny.*

**It's all about the user**

Google's RAIL model breaks performance into what people actually feel:

- **Response:** react within 100ms, or it feels like lag. Respond immediately,
  and with substance.
- **Animation:** 60 frames per second, which gives you about 16ms per frame.
- **Idle:** keep background work in small chunks, under 50ms.
- **Load:** get something useful on screen in under a second.

It lines up with the classic response-time limits: 0.1 seconds feels
instantaneous, 1 second keeps the flow of thought, and 10 seconds is about as
long as you'll hold someone's attention.

**Quick wins**

- **Critical path CSS:** inline what the first screen needs so it can render
  before the rest arrives.
- **Render-blocking JavaScript:** move scripts from the `<head>` to just before
  `</body>`.
- **Image compression:** one image went from 1.7MB to 305.9KB (-82%) through
  [TinyPNG](https://tinypng.com).
- **Responsive images:** `srcset` so phones don't download desktop images.
- **Lazy loading:** only load images when they're about to be seen.
- **File compression:** gzip everything you can.

**HTTP/2**

HTTP/2 grew out of Google's SPDY. A lot of what we did to speed up HTTP/1.1
was a workaround for its limits: concatenating files, inlining assets,
combining images into sprites, and sharding across domains. HTTP/2 makes most
of those unnecessary:

- **Binary protocol:** more compact and less error-prone to parse than text.
- **Multiplexing:** many requests and responses share one connection at the
  same time, instead of queueing up behind each other.
- **Header compression:** repeated headers aren't sent over and over.

The catch: browsers only speak HTTP/2 over TLS, so you need HTTPS. Support was
already broad across browsers, servers (Node.js, PHP, Go, nginx, Apache, IIS)
and CDNs (CloudFlare, CloudFront, Akamai). HTTP/2 is here.

Further reading from the slides: Ilya Grigorik's "Primer on Web Performance"
chapter in *High Performance Browser Networking*, "HTTP/2 for a Faster Web",
and CloudFlare's "What is HTTP/2?".
