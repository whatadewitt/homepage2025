---
title: "We All Live in a Yellow (Serverless) Submarine"
event: "Web Unleashed 2018"
date: 2018-10-01
location: "Toronto, ON"
summary: "What \"serverless\" actually means for web developers: why you'd use it, when it fits, when it doesn't, and a live demo of a serverless meme generator."
---

<!-- From the slides and the 2018 speech script ("WebU - We All Live in a
     Yellow (Serverless) Submarine" in Google Drive), condensed. -->

I'm your captain today on this adventure through the high seas of serverless…
but it's a submarine, so I don't know if "high seas" applies.

**What it is**

Serverless is one of those buzzwords everyone uses and not a lot of folks
understand, like "big data" or "the blockchain." The first misconception: it
doesn't mean *no servers*. It means you stop worrying about managing them.
Leave the boxes to the professionals, and the code to you. Think of it as
*server-less*.

The concise version: a cloud computing model where a server dynamically
allocates resources to execute your code on demand. You'll also hear it called
FaaS, functions as a service.

It isn't new, either. Zimki offered pay-as-you-go computing back in 2006, and
was shut down on Christmas Eve 2007 (Ebenezer Scrooge must have been an
investor). The idea was reborn in 2014 with AWS Lambda, and now it's
everywhere: Google Cloud Functions, Azure Functions, Apache OpenWhisk, and more.
Lambda started with only Node and now runs Python, Java, Go and C# too. Most of
this talk is about Lambda, because that's where my experience is.

**Why serverless?**

- **No servers to deal with.** Focus on what you do well: building something
  great for your users and clients.
- **It's cheap.** At 1024MB, a function that runs 1,000 times at 80ms each
  (AWS rounds up to 100ms) costs about 17 cents. Host the form on S3 too and
  you're running a site for less than a quarter a month, before bandwidth and
  the database.
- **It scales automatically.** If that form blows up to thousands of
  submissions a minute, it keeps up without you.
- **Less complex development, and fast prototyping.** You can prove an idea is
  feasible quickly and cheaply.
- **You get stuff done faster.** There are only so many hours in the day to play
  Fortnite.

**When it fits**

- Websites and APIs with an endpoint or two.
- Event streaming and pub/sub. Functions don't have to run on an HTTP request:
  file uploads, log messages, cron schedules and database changes can all
  trigger them.
- IoT. I hate the term, but a lot of those platforms run on serverless.
- Continuous integration, like running tests on every push.
- Image and video work: cropping, resizing, pulling audio, filters, even
  detecting illicit content. *(Not a hotdog.)*

**Why not?**

- Getting started is a pain. There's a lot to learn about security, permissions
  and deployments first, and every provider is different.
- No server means less control.
- Testing is hard, and logging and error handling take extra setup.
- The cost model may not fit. A $3 or $4 server might be worth it to skip the
  hassle.
- Your language might not be supported, and there are execution time limits
  (about five minutes on Lambda at the time).
- **Cold starts.** The first run loads your function into memory, and you pay
  for that time. Under heavy concurrent load, you pay it on multiple boxes. If
  response time matters most, those extra hundreds of milliseconds could be a
  problem.

None of these are dealbreakers. Just know them, and pick what's best for your
project.

**What's next**

"Serverless" is spreading past functions: serverless databases, priced on
storage and I/O, and serverless containers like AWS Fargate, billed only while
your container is up.

**Demo: the #thatsweb meme generator**

Talk is cheap. So: a React app (*this is not a React talk*) uploads a photo to
S3 with AWS Amplify. The upload triggers a Lambda function that composites the
#thatsweb frame onto the photo with ImageMagick, saves it to a public bucket,
and records it in a serverless database. The app polls the public bucket until
the meme shows up, then you share it. A second endpoint pulls 20 random memes
back out, which is the more typical HTTP-triggered flow.

One tip from building it: lock down your upload bucket's policy so people can't
upload whatever they want.

The code is on GitHub:
[whatadewitt/thatsweb](https://github.com/whatadewitt/thatsweb).
