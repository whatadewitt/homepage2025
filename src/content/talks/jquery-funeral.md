---
title: "A Very Public and Overdue Funeral for jQuery"
event: "Web Unleashed 2017"
date: 2017-09-25
location: "Toronto, ON"
summary: "A fond and somewhat embarrassing goodbye to jQuery, and the modern browser APIs you can use instead, today."
---

<!-- From the 2017 speech script ("jQuery Funeral Speech" in Google Drive),
     lightly edited: stage directions out, slide cues as asides. -->

*The slides for this one are lost to time. The script survived, so here's the
eulogy, more or less as delivered.*

---

Dearly beloved, and… people… calling you all beloved is kind of weird…

Anyway… welcome. My name is Luke DeWitt. I lead a team of developers at
REDspace on the East Coast, in Bedford, which is part of Halifax.

We are gathered here today to say goodbye to an old friend. It's often said
that the things we love are always taken from us too early: Glenn on *The
Walking Dead*, and I'll always argue that McDonald's pizza was put to rest too
soon. But the timing here seems right… jQuery… the bell tolls for thee.

Dude, harsh! Not an unfair comment, but it's also not untrue. Let me take the
pulse of the audience so I know whether I'm going to make it off the stage.

Okay, that's a decent number of you still using it. You may have seen that I
originally titled this talk "A Very Public and *Humiliating* Funeral for
jQuery." Then I started writing it and realized that jQuery helped turn me into
the developer I am today, and shaped the web as we know it.

**How I came to know jQuery**

As normally goes at a funeral, I want to talk a little about how I came to know
the deceased. I moved to Halifax in 2007 after a startup I'd joined in my
hometown went under. I joined REDspace, 20 people at the time, as a Flash
developer building all sorts of apps for Nickelodeon and BET.

It wasn't long before a guy got up on stage and started waxing about a device
that ended up completely revolutionizing our world. The iPhone was the next big
thing, and it was here, and… it didn't support Flash?

Hah! We all laughed at this stupid little device. Apple talked about how
terrible Flash was for memory usage. They weren't wrong, and we knew that, but
we didn't care: Flash was the only way we knew to build truly innovative,
interactive sites at the time.

Then the next iPhone came out… and still no Flash? Some visionary, right?

Android came out, and supported Flash. BlackBerry eventually unveiled the
PlayBook, which not only supported Flash, its whole OS was Flash-based and its
entire marketing campaign was about it. *"FLASH! Ah-ahhhh!"*

We kept building our sites. Then our clients started noticing how much of their
traffic was coming from phones. Androids could handle Flash but crashed all the
time, and on the iPhone the site just looked broken. Clients started asking us
to build sites without Flash, and we started freaking out a bit.

You have to understand: we'd made our living building Flash experiences on
high-traffic sites. It was our biggest tool, and it was being taken from us.
"Use JavaScript" seemed like an unreal ask. Most of our experience with it was
Flash talking a bit to JavaScript, and that was *not* an enjoyable experience.
JavaScript was the butt of so many jokes back then.

But then we found something: "the little library that could." A library that
made our lives so much easier and worked in IE *and* Chrome *and* Firefox. We
could animate, update, so much, so easily… and that's what the clients wanted,
so that's what we did.

He'd done it… that crazy bastard… he'd done it.

*(Cue the slide: Steve Jobs' head on Samuel L. Jackson's body, pointing a gun at
the Flash logo.)*

He killed Flash. Oh sure, not officially. Just a few months ago Adobe announced
end-of-life for Flash in 2020. But as any ex-Flash developer can tell you, it
died on a stage in California years ago, and let no one tell you different.

I didn't tell that story to show how interesting I am. I can assure you that
outside of fantasy baseball and smoking meats, I'm not. I told it because in
your career you will absolutely hit moments like this, where it's time to move
on from something you know to something new. You should not only expect it,
you should learn to embrace it. More than just about any other career, this one
is about change and how you adapt to it.

**Why it's time**

I mean absolutely no disrespect when I say it's time to send jQuery to that
great big trash bin in the sky. But… it's time to send jQuery to that great big
trash bin in the sky. A co-worker suggested we think of jQuery as a successful
charity: it outlived its purpose.

Seriously, I haven't used jQuery on a site in well over two years. Google,
Microsoft, Apple and everyone else are pouring resources into their browsers,
not just to make sites better to visit, but to make our lives as developers
easier. And every little bit of bandwidth you save matters. Clients want their
content in front of their users *fast*, and the little bit of simplicity jQuery
gives you isn't worth the weight it adds, especially when so much of what it
used to do now lives right in the browser. A lot of credit for that goes to
jQuery for forcing the issue.

So, while my little eulogy has no doubt stirred up many emotions, here are the
things I use every day that I used to need jQuery for.

**Selecting elements**

Quick show of hands (and there will be more "poll the audience" moments than at
any other funeral you've been to): who's using jQuery mainly for DOM
manipulation? You're not wrong. That's pretty much all I used it for for many
moons. But now I'm going to tell you that you're wrong.

jQuery has the famous `$` for selecting elements. (I'm so influenced by jQuery
that I still prefix variables holding DOM elements with a dollar sign.) It's
great, but why use it when you have `getElementById`, or `querySelector` and
`querySelectorAll`, which take selectors exactly the way jQuery does? Look at
that support!

Before HTTP/2, we loaded all our scripts in one file for caching, so I'd check
whether an element existed before running page-specific code: if
`$('#about').length` was more than zero, run the "about" page code. I did that a
*ton*. Today you call `querySelector` and check for `null`. Same one-liner.

**Classes**

Another sweeping generalization: we all add and remove classes at will with
`.addClass`, `.removeClass` and `.toggleClass`. Every browser supports
`classList` now: `classList.add`, `.remove` and `.toggle`. And to my dude right
here thinking "but jQuery has `.hasClass`": `classList.contains`. You're
welcome, my dude.

**Data attributes**

Has anyone worked with data attributes in jQuery? I hate it. God, I hate it. It
never felt *right*. Today the `dataset` property gives you every data attribute
as an object, and reading and writing them is as easy as a, b, c.

**Requests**

Before jQuery we wrote ridiculously long XHR requests, then jQuery said *nope*,
here's `$.ajax` with a `success` callback, and we all lost our minds. Now we
have `fetch`, and it does pretty much the same thing in less code.

"But uh, your support ain't great here." Chill, mang. There are polyfills for
all of these things, and the `fetch` one was written by GitHub. If you trust
them to store and protect your code, you can probably trust what they're giving
the open source community.

**Working with data**

When the data comes back, jQuery had `.each()`, `.map()` and `.merge()`. Vanilla
JavaScript has `Array.forEach` (which you shouldn't use, but that's another
talk), `Array.map` and `Array.concat`. No reason to add jQuery for that.

**Promises**

Back in 2011, working on a mobile app, I really came to understand the
asynchronous nature of JavaScript, and jQuery was there to help me through it.
That's how I learned what promises were. Show of hands: who knew jQuery had
promises built in? It really saved my ass. (Can I say ass? No? Okay, sorry.)

But people, it's 2017, and promises are supported in almost every browser. They
work a little differently, but write one natively once and you'll get it:
return a `Promise` and call `resolve` or `reject` when your async work is done.
Async/await will be here soon enough to make it even easier. Either way, it's
another thing you don't need jQuery for.

**Animation**

I once built a site completely with jQuery animations. It worked. We didn't have
today's tools, so it was jQuery animations nested inside completion callbacks
nested inside more completion callbacks. My god, are we lucky today.

Today we should mostly lean on CSS transitions and animations, or maybe the Web
Animations API. Add the `classList` tricks from earlier, and canvas when you
need real power, and you can build amazing sites without sixteen levels of
nested jQuery animations.

These are all simple changes you can make in your code today. You'll understand
JavaScript better, and your site will get faster: everything I've talked about
today is faster in plain JavaScript than in jQuery.

**"But Luke, I just use the plugins"**

"Luke, I have all these little jQuery plugins. I don't really *use* jQuery, I
just use the plugins." Then why are you bloating things even more than you need
to?

Show of hands: who uses MicroJS? Who's even *aware* of MicroJS?
[MicroJS](http://microjs.com) is great. Type in what you want to do and it
suggests tiny libraries for it, with how popular each one is on GitHub. You can
find just about anything you'd ever want to do there.

…I said *almost* anything.

When I started writing this, I went back to the jQuery site for the first time
in literal years and saw "32KB minified and gzipped." I thought, wow, that's way
smaller than I remember it ever being.

*(Cue the "that's what she said" slide.)*

But you could pull in umpteen modules from MicroJS and probably still come in
under jQuery.

**Saying goodbye**

I get it. I really do. Saying goodbye is hard. But how we come through tough
moments is what makes us stronger, as people and as developers. You've probably
already been to sessions on Angular, React or Ember. Those are great tools that
speed up our work far more than jQuery ever did. And I'm not going to lie: I
fully expect jQuery 4 to come out tomorrow and make this whole talk useless. Such
is life.

One last time: jQuery was a huge help to me when I needed to change course in my
career, and for that I'll be forever grateful. Sometimes saying goodbye is the
hardest thing to do. I've done it, and I hope you will too.

Thank you all for coming. I think they'll be serving finger sandwiches in the
lobby after the talk.

No? Okay. Sorry, no sandwiches.
