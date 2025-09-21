---
title: "Symmetric Pandemic"
date: "2025-09-21"
excerpt: "After MANY years, I used Claude Code to help me rebuild an old project and bring some fun back."
featuredImage: "/images/pandemic.png"
featuredImageAlt: "pandemic boardgame"
---

Boardgames have always been a big part of our culture at REDspace. It's not uncommon to see a group gathering over lunch hour, or after hours, to play some boardgames. One of our favorites over the years has been Pandemic.

About 13 years ago, we had the idea of turning Pandemic into a competitive endeavor. The premise was simple: if two teams played with the same deck, they could essentially play the same game. Each team could pick their own roles, but they'd have to deal with the same problem areas, benefit from the same event cards, and suffer the same outbreaks. It seemed like a fun idea, so I decided to look into it.

I spent the better part of an evening putting a **very** simple script together. I hardcoded a bunch of values of cities, colours, ignored some event cards that might cause problems, and most importantly I built a simple "seed" mechanic that would allow the randomness of the card shuffling to be duplicated across different team devices. Think of a seed like a unique code or password for a specific shuffled deck. **Symetric Pandemic** was born.

We ended up playing a few games in teams at the office a few times, and used the "app" (static HTML page) to play the game without having to spend too much time setting the game up.

We're mostly back at the office now, and boardgames are a popular way to spend the lunch hour. The other day, we were reminiscing about playing Symmetric Pandemic, and I mentioned I should pull the code down. The other night, that's exactly what I did... and boy was I surprised!

Something I'd completely forgotten: I built this before responsive design was really a thing, or at least before I was using it. The code was written well before my "funeral for jQuery" (which was used **heavily** in the project), and what I thought was a decent UI was truly terrible. It was a great laugh to see an app built for an iPhone or iPod Touch screen from 2011/2012. Like anyone would, I got a kick out of looking at code I wrote so long ago and thought it would be fun to update it so we could play again.

Unfortunately, 2025 Luke doesn't have nearly the time that 2012 Luke had. Finding time to write code after hours is something that has been incredibly difficult. Normally, I am driving kids between activities and by the time I get home I am ready to pass out. What 2025 Luke does have, however, is AI, and AI has been very helpful for a number of prototypes I've built, some refactors and migrations I have done at work, and I know it's really great at fairly simple designs, so why not give it a shot?

Because I've been using AI more and more at work, I've gotten better and better at refining my strategies to leverage it. Claude Code has been my tool of choice most reecently. I won't bore you with the details of why, or how I am leveraging it, but in the matter of a couple of hours I was able to have a front end that I very loosely defined built out and playable. There were a few bugs that I solved with and without the help of Claude (as is the case on most projects like this), and have since been thinking (independantly and with the AI) about additional features that could be added. I also leveraged Gemini to put together some color-coded, pandemic ridden city scapes of the cities in the game, and I hope to add something similar to our event cards which don't feel as "sexy" as the other cards do right now.

One of my other goals for the project, and basically all of my personal projects, is to deploy it as cheaply as possible. It's the reason for the original static HTML/JS/CSS approach that I hosted on a cheap webserver I used to rent, but options on both sides of the deployment are so much better now. The application is a client side React app, so for the most part I am sticking with the static approach. Github Pages is a fantastic resources for simple deploys like this. I am also integrating some PWA features so it can be installed on your devices homepage and used on or offline (note: not sure who is "offline" much nowadays, but I am hopeful it helps someone at some point), and I've also integrated both a game log and game logging, with the idea that, eventually, we might be able to collect some interesting statistics on our game plays. I digress, Symmetric Pandemic is available here: [https://whatadewitt.github.io/symmetric-pandemic/] and you can see the code on Github as well, here: [https://github.com/whatadewitt/symmetric-pandemic]

The app is ready to go, and I wanted to share some of the features that make it special. Here's a breakdown of what the AI helped me build:

🎯 Core Game Features

- Seeded Random Generation - Reproducible games using custom seeds for symmetric gameplay
- Player Configuration - Support for 2-5 players with customizable epidemic counts (4-7)
- Automatic Card Dealing - Round-robin distribution of 2 cards per player at game start
- Step-by-Step Setup - Official Pandemic initialization: player cards → infection levels 1-2-3 → begin

🃏 Card Management

- Complete Card Database - All 48 city cards with authentic images and population data
- Special Event Cards - Full collection with auto-activation (Forecast, One Quiet Night, Resilient Population, etc.)
- Epidemic Handling - Proper bottom card drawing with manual user confirmation
- Visual Card Display - Multiple card sizes (small/medium/large) with color-coded designs

📱 User Interface

- Mobile-First Design - Touch-optimized responsive interface for all devices
- Overlay Panels - Non-intrusive game log and effects panels that don't squeeze main UI
- Modern Styling - Tailwind CSS with pandemic-themed color palette and gradients
- Intuitive Controls - Clear button states and visual feedback for all game phases

🎮 Gameplay Features

- Real-Time Game State - Live tracking of deck counts, discard piles, and game phase
- Special Effects Management - Visual indicators for active events (Forecast, One Quiet Night, etc.)
- Phase Management - Clear progression through setup, playing, and epidemic phases
- Button State Logic - Proper enabling/disabling based on game state and available actions

📊 Data & Logging

- Complete Game Logging - Every card draw, special event, and game action recorded with timestamps
- Persistent State - LocalStorage backup with automatic saving every 5 actions
- Export Functionality - Download complete game logs for analysis
- URL State Management - Shareable game URLs with seed and configuration parameters

🔄 Advanced Features

- Game Sharing - Copy shareable URLs to clipboard for symmetric gameplay
- State Persistence - Resume games after browser refresh or session interruption
- Expansion Support - Framework ready for On The Brink, In The Lab, and State of Emergency
- Performance Optimized - Lazy loading and efficient rendering for smooth gameplay

🛠 Technical Architecture

- Modern React - Functional components with hooks and TypeScript for type safety
- Zustand State Management - Lightweight, predictable state updates
- Component Reusability - Modular CardDisplay component with multiple size variants
- Responsive Images - Optimized city images with proper loading and fallbacks

🎨 Visual Design

- Authentic Card Styling - Color-coded cards matching official Pandemic design
- Smooth Animations - Card slide transitions and pulse effects for epidemics
- Dark Theme - Professional dark color scheme with accent colors
- Clear Typography - Readable fonts with proper contrast and sizing hierarchy

📋 Game Phases

1. Initial Cards - Display player starting hands with card visuals
2. Infection Setup - Draw 3 cards each for levels 1, 2, and 3 (1-2-3 cubes)
3. Main Game - Player and infection card drawing with epidemic handling
4. Special Events - Automatic activation and manual effect management

Up next will be to add some unit tests, and this is more for me to work on prompting my unit tests than being overly concerned about all the situations in this game, but I have seen and read a good amount of success doing this with AI, so it's a great opportunity to learn.

Before I wrap this up I want to call out one thing the AI did that I didn't love. I haven't reverted it yet because I think it did a better job of implementing the seed logic than I did, originally, but my greatest memory of this app was jokingly entering seed 666 with some friends at the office one day and getting absolutely annihilated by the deck. If I recall correctly we basically hit our first 2 outbreaks as quickly in succession as the deck logic would allow, and immediately saw a double and triple outbreak in successive turns. We also drew player cards that had us, as a team, in about the worst spot possible on the board to be able to combat anything. That said, it's a popular topic of conversation in pretty much any game of Pandemic that has happened since.

So, what's next? I'm planning to add some unit tests, which is more about me learning to prompt AI for them than anything else. But for now, I'm just excited to get this back in the hands of my coworkers. Check out Symmetric Pandemic and let me know what you think! And if you play it and come up with the new 666 seed, please feel free to share it with me on any of the socials.
