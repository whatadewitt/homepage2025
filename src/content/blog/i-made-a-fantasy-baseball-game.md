---
title: "I Made a Fantasy Baseball Game"
date: "2026-04-15"
excerpt: "I can't believe it's taken this long."
featuredImage: "/images/fantasy-ball.png"
featuredImageAlt: "screenshot of Rookie Fantasy Baseball '26"
---

"Can I come too, dad?"

That's the question I heard from my son, now 11, the morning of my Fantasy Baseball Draft.

---

The Freddy Beach Fantasy Baseball League has been going on for 20 seasons now. We started this thing in 2007, a draft at Boston Pizza in Fredericton — a 9-team points league on Yahoo! Over the years, the league evolved, managers changed, and in 2013 I convinced the gang to move to a keeper league with an auction draft. There was some hesitance... until the third pick when one of my friends looked at another, "this is awesome..."

The league has been a creative outlet for me too. I built the [FBBL site](https://fbbl.whatadewitt.com), put together a [Node-based Yahoo! Fantasy Sports API wrapper](https://github.com/whatadewitt/yahoo-fantasy-sports-api) (mostly to help me automate a bunch of the commissioner jobs that needed to get done each year), and have spent the last couple of years using AI to generate weekly blog posts for the league. I don't think I'll ever run out of ideas for things I could build around this league that I probably spend way too much of my adult life thinking about — but what is being a sports fan all about if not over-obsessing about the team(s) you love?

---

So now, my son was asking me about coming to the draft. He's taken a love to the game of baseball just like me. I've coached him for the last 4 years and I hope his little brother enjoys it just as much as him when he starts T-Ball this Summer. I love that he wants to come, that he wants to play because my love of baseball has only increased by playing this [silly little game](https://www.youtube.com/watch?v=bsXoC5pLRtM), but alas, it's maybe not the best spot for kids, what with a late night and obviously a lot of adult beverages going around.

But that's when I had the idea to compromise. Obviously, AI is getting better every day so I made him an offer. How about we make our own fantasy game?

"You can do that?"

Time is limited as a father of 4, but AI really helps me scratch the itch of building things without having to spend too much time in the minuatae that I want to sort out but just don't have the bandwidth to take on.

So that was that, I was finally going to do it, I was going to build him a kid-friendly fantasy baseball game that he could play with his friends, and thus was the beginning of the Rookie Fantasy Ball Fantasy Game.

The game was going to be built for kids, so I wanted it to be a simple, box-based pool where I could take the top players at each position and let the kids pick a team. This would allow them to get to learn about a number of players who exist outside of their favorite team, but still get the chance to choose those players. 

The scoring needed to be straightforward too so they could learn about some different stats (and maybe understand how some of these things work together). I went with a 5x4 (5 hitting categories, 4 pitching categories) approach to points, where a hit, RBI, run, and home run were worth a point each (which stack, so a home run would actually be 4 points), and a stolen base is worth 2. Pitchers get a point for an out, a strikeout (again stacking), 4 points for a win and 5 for a save.

## The Stack

While AI handled a lot of the interface work, I still planned out the application as extensively as I felt I needed to before letting the robits take over. I went with something I was familiar with, and knew I could deploy as cheaply as possible (I don't need AI to help me with that decision).

I chose a Next.js app hosted on Vercel with Supabase for data persistence and auth. I've used Firebase in the past, but I've had more success with Supabase recently, especially for smaller projects like this where you need an auth layer and a database that's easy to work with without a lot of overhead. Deployment was surprisingly painless, and I was able to point my own domain at Vercel to save a(nother) buck.

For player data, I started with Fangraphs exports. I had previously noticed that their data included MLB player IDs, and knowing that the MLB APIs were pretty robust, the hardest part of the problem, identifying and mapping players, was already solved. From there, I set up a Vercel cron job that syncs points every morning at 6am so the kids can check standings before getting on the bus.

## The Game

My son is a gamer, but he spends very little time on "the internet" like his old man did when he was younger (unless you count hours logged online playing Fortnite). I wanted the interface to be as stripped-down as possible. The first pools I ever played in were done on paper when my mom would bring home "Playoff Box Pools" from her office and I would pick the players. That was the approach I wanted to take — and since kids can all pick the same player(s) if they want, there should be enough choices that I shouldn't see any duplicate teams.

The issue with the pools from my mother's office was that I would get updates at the mid-way point of the season and the end of the year. Part of the joy of Fantasy Sports is being able to log in the next morning and see how well your team did to see if you have improved your ranking. The landing page is the standings page where you get a look at the rankings, and you can see how well your team did yesterday.

I also knew I needed some sort of administrative panel. I set that up to allow me to run imports of MLB players, sync their 2025 stats for the player selection page (to make the kids decisions easier for the players they didn't know), but the big thing there was to allow us to select which players would live in each box. All-in-all, I didn't love the way this worked, and fixing some of the bugs that exist in it will be done before next year.

One of the big features that I wanted to have for this was a low-friction login system where a parent could help their kid login using the parent email address. The issue there is that parents often have more than 1 child who might want to play, so I spent some time leveraging Supabase's auth system to allow users to enter their email address and login to a specific team from an email that will be sent to that address. This way, you're not asking kids to have to remember logins, and you're not having parents setup and/or use multiple emails to let their kids play. Knowing a number of siblings and parents who would want to play, I think this was a good call, even though I don't expect players to have to log in often.

It was through this login system that I discovered "resend" as a cheap (free for the level I am using it) email system for delivering emails to the players. In the past I have had issues with Supabase's email system, and I was able to integrate resend with very little effort.

## The Mid-Season Shakeup

Baseball, unfortunately, has not been the healthiest sport over the last few years. Because of that, I designed the game so that during the All-Star break, players can swap out 4 of their boxes — whether because of injuries or poor player performance. The idea was to give the kids a reason to stay engaged at midseason and hopefully encourage some fun chirps between the managers. One of the more fun parts of any fantasy game is the trash talk, though my son bragging and dancing every morning that he's "still in first" is getting old.

## The AI Value Add

There were a couple of features that I would not have even attempted without AI. The two big ones were a "language filter" on the team names, which was an entertaining and eye-opening feature to build in some ways to ensure no teams were profanity laden. I didn't expect it from the people playing, but it did teach me about some edge cases that, perhaps, will help me in my day-to-day job going forward.

I also set up a random avatar builder based on an SVG to create team caps for the teams in the league. I've always wanted to make something like the "monster" gravatar generator, and I had a lot of fun putting this together. This was heavily AI built but I spent a lot of time going back and forth with it to really make sure I was building something that made avatars that didn't suck, and I am very happy with the end result.

---

I've spent 20 years in my career constantly talking about how I could build more sports-focused apps, and it took this long for my son to ask "you can do that?" to finally make a fantasy game. I couldn't be happier that it's something I was able to do with and for him, and I hope it isn't the last.