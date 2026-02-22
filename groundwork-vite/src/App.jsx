import { useState, useEffect, useCallback, useRef } from "react";

/* ─────────────────────────────────────────
   DESIGN TOKENS  — Linen & Forest
───────────────────────────────────────── */
const T = {
  // Backgrounds
  linen:    "#f5f0e8",
  cream:    "#faf8f3",
  card:     "#fffef9",
  white:    "#ffffff",

  // The one accent colour
  forest:   "#2d4a3e",
  forestMd: "#3d6b5a",
  forestLt: "#e8f0ec",
  forestBd: "#1e3329",

  // Tan / warm neutrals
  tan:      "#c8b898",
  tanSoft:  "#e8dfc8",
  tanDim:   "#f0ead8",

  // Text
  ink:      "#1e2420",
  inkMid:   "#4a5548",
  inkSoft:  "#7a8878",
  inkFaint: "#b0bab0",

  // Borders
  line:     "#ddd5c0",
  lineSoft: "#ebe4d0",
};

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const SKILL_AREAS = [
  { id:"product",    label:"Product Thinking",    icon:"◆" },
  { id:"metrics",    label:"Metrics & Data",      icon:"◈" },
  { id:"brand",      label:"Brand & Positioning", icon:"◇" },
  { id:"behavioral", label:"Behavioral",          icon:"◉" },
  { id:"startup",    label:"Startup Mindset",     icon:"◎" },
  { id:"problem",    label:"Problem Solving",     icon:"◐" },
];

const DAILY_TASKS = [
  { id:"problem",  label:"Problem Challenge",    icon:"◐", skill:"problem"    },
  { id:"product",  label:"Product Analysis",     icon:"◆", skill:"product"    },
  { id:"question", label:"Interview Practice",   icon:"◉", skill:"behavioral" },
  { id:"reading",  label:"Read & Reflect",       icon:"▦", skill:"startup"    },
];

const WEEKLY_TASKS = [
  { id:"write",    label:"Product Write-Up",   icon:"✦",
    prompt:"Choose a product you used this week. Write a 200-word analysis: who the target user is, what core problem it solves, one thing it does brilliantly, and one specific improvement with a measurable success metric.",
    sample:"This week I analysed Headspace. Target user: stressed professionals aged 25–40 who know they should meditate but feel too busy. Core problem: meditation feels effortful and abstract — the activation energy is too high. What it does brilliantly: 3-minute 'mini' sessions dramatically lower the barrier to starting. My improvement: add a mood check-in before each session and use that signal to recommend session type — a validated mood-to-content matching feature. Success metric: 30-day session completion rate and streak retention at day 7. The deepest insight here is that the best product features reduce friction rather than add capability." },
  { id:"teardown", label:"Product Teardown",   icon:"◈",
    prompt:"Pick an app you use regularly. Do a structured teardown: (1) Onboarding — how does it activate new users? (2) Core loop — what behaviour do they want you to repeat? (3) Retention hooks — what keeps you coming back? (4) Monetisation — when and how do they ask for money? (5) What would you change and why?",
    sample:"Teardown: Notion. (1) Onboarding — the template gallery lowers blank-page anxiety; a user feels productive on day one without building anything themselves. (2) Core loop — create and organise blocks; the deeper your workspace, the more invested you become. (3) Retention — switching cost is the moat; everything you build is locked inside Notion's structure. (4) Monetisation — free plan is deliberately generous, but team features are gated (a clean B2B wedge). (5) My change: a native 'Quick Capture' widget for mobile. The current app is too heavy for fast note-taking — which is the #1 mobile use case by session frequency. Success metric: mobile DAU and quick-capture creation events per session." },
  { id:"case",     label:"Case Question",      icon:"◇",
    prompt:"Estimate: How many coffee cups does Pret a Manger sell in London per day? Walk through your reasoning step by step. Show your assumptions clearly and sanity-check your answer at the end. The goal is transparent reasoning, not a precise number.",
    sample:"London population ~9M. Working adults (20–65): ~55% = ~5M. Assume 40% pass a Pret on a typical weekday = ~2M people. Of those, ~20% buy a coffee = 400,000 cups. Pret has ~250 London locations = ~1,600 cups per store per day. Sanity check: a busy Pret serves ~1 customer per minute over 12 hours = 720 customers minimum; 1,600 feels plausible for a central-London average blending flagship and smaller sites. Final estimate: ~400,000 cups/day across London. The PM takeaway: structure your assumptions explicitly, order-of-magnitude thinking beats false precision, and always sanity-check with a different angle." },
  { id:"network",  label:"Networking Prep",    icon:"◎",
    prompt:"You have a coffee chat with a PM at a Series B startup next week. Write out: (1) Your 60-second intro positioning you for a product role. (2) Three questions that show genuine curiosity — not 'what's your day like?' (3) One specific thing about their company you found interesting and why.",
    sample:"(1) Intro: 'I've spent the last [X years] in [current role] working close to both the customer and the product — specifically [one concrete thing]. I'm now deliberately moving toward product ownership at a startup because I want to see my decisions directly affect outcomes. I've been building my product thinking for [time] and I'm here to learn from people who are living it.' (2) Strong questions: 'What decision are you most uncertain about right now?' / 'What does your team debate most internally?' / 'What did you get completely wrong in the last 6 months?' These signal maturity and genuine curiosity. (3) Research hook: Reference something specific — a product decision, a blog post, a feature change — and explain why it caught your attention. Generic flattery is forgettable; a specific observation is memorable." },
];

const MONTHLY_TASKS = [
  { id:"mock",    label:"Mock Interview",    icon:"◎",
    prompt:"Run a 20-minute mock interview (with yourself or a friend). Use these questions in order: (1) Tell me about yourself and why product. (2) Walk me through how you'd improve Instagram Stories. (3) DAU drops 15% — what do you do? (4) Tell me about a time you influenced without authority. Record yourself. Then write your self-assessment: what landed well, what felt weak, your top 3 priorities to improve.",
    sample:"Strong self-assessment example: 'My Q1 storytelling was clear but too long — I need a crisper 90-second version that leads with the punchline, not the context. My product answer (Q2) jumped to features before defining a user segment — I must spend 30 seconds naming the segment and their problem before proposing anything. My metrics answer (Q3) was diagnostic and structured — that's a genuine strength to preserve. My behavioral answer (Q4) had a good outcome but the action was vague — I need to slow down and explain my specific reasoning. Top 3 priorities: (1) Trim intro to 90 seconds max. (2) Never propose a feature before naming the user and their problem. (3) In STAR stories, make the Action more specific — what exactly did I do and why?'" },
  { id:"project", label:"Mini Project",      icon:"✦",
    prompt:"Build something this month. Options: (a) Write a 500-word product spec for a feature you wish existed. (b) Create a one-page competitive analysis of 3 products in a space you find interesting. (c) Design a user research plan — 5 questions you'd ask to validate a product idea. Share what you built here and reflect: what did you learn?",
    sample:"Example product spec — Spotify Mood Mode: Problem: users' listening needs vary by context (focus, commute, social) but Spotify treats all sessions identically. The playlist recommendation algorithm ignores context entirely. Solution: a session-start prompt — Work / Commute / Wind-down / Social — that adjusts playlist recommendations, BPM filtering, and auto-volume. User story: 'As a morning commuter, I want Spotify to know I'm on the tube so it queues something energising without me searching.' Success metrics: session-start engagement rate, skip rate reduction, session length increase by context type. Risks: the prompt adds friction at session start — test with 10% of users first and measure drop-off vs engagement lift. Build vs buy: can be built on top of existing context signals (time of day, device type, movement speed via accelerometer)." },
  { id:"reflect", label:"Monthly Review",    icon:"◈",
    prompt:"End-of-month reflection. Answer each honestly: (1) Which skill area improved most and what specifically did you do? (2) Which is still weakest — what pattern do you notice? (3) One thing you learned that surprised you. (4) What will you do differently next month? (5) Rate your consistency 1–10 and explain why.",
    sample:"Strong reflection: 'Metrics improved most — I now automatically think in funnels and I always define what I'd measure before proposing a solution. Still weakest: behavioral storytelling — my STAR answers feel rehearsed rather than natural, and I'm still leading with context instead of the action. Surprise: I learned that great PMs spend 40% of their time talking to customers directly — I had the ratio completely wrong, assuming most time was roadmap and meetings. Next month: I'll conduct 2 real user interviews (not practice ones) on a product I'm analysing, and write up what I found. Consistency: 6/10 — I missed 8 days. Pattern: I skip when tired in the evening. Fix: move practice to 8am before the day starts.'" },
];

const PROBLEMS = [
  { title:"The Broken Elevator", skill:"problem",
    prompt:"A 10-floor office building has one elevator. Tenants say it's too slow. You have a tiny budget — you cannot replace or upgrade it. How do you solve the problem?",
    hint:"The complaint might not be what it seems. What is the actual emotion behind 'it's too slow'?",
    answer:"The root problem isn't speed — it's perceived wait time. These are different problems requiring different solutions. Install mirrors in the lobby: people watching themselves feel less impatient and lose track of time. Add a floor-display screen showing where the elevator is — uncertainty makes waiting feel longer than it is. Both interventions cost almost nothing. The PM lesson: always ask 'what is the user actually feeling?' before proposing solutions. 'Elevator is slow' is a symptom; 'waiting feels unbearable' is the diagnosis. Solving the feeling is often faster, cheaper, and more effective than solving the engineering." },
  { title:"The Instagram Drop", skill:"product",
    prompt:"You're PM at Instagram. Story views dropped 30% over the last 2 weeks. Your CEO wants an explanation and action plan by end of day.",
    hint:"Structure matters more than speed. What phases would a methodical PM go through before proposing anything?",
    answer:"Phase 1 — Validate: Confirm the data is real, not a tracking or logging bug. Did any instrumentation change recently? Phase 2 — Segment: Is the drop global or specific — iOS vs Android, one geography, one age cohort, one feature surface? A 30% drop everywhere is a fundamentally different problem than a 30% drop on iOS only. Phase 3 — Diagnose: What shipped in the last 2 weeks? Any algorithm change, UI update, or infrastructure migration? Did a competitor launch something? Phase 4 — Hypothesise: Form one clear, specific hypothesis. 'I believe [X] caused the drop because [evidence].' Not three hypotheses — one best guess. Phase 5 — Act: Test with minimal exposure first. Roll back the most recent relevant change for 10% of users and measure story view recovery within 48 hours before any broader action. The PM lesson: never propose a solution before completing diagnosis. Structured thinking under pressure is the skill being tested." },
  { title:"The Empty Restaurant", skill:"problem",
    prompt:"A restaurant is always empty at lunch but packed at dinner. The owner wants to increase lunchtime revenue without reducing dinner prices.",
    hint:"Who has time for lunch nearby, and what is their real constraint? It may not be price.",
    answer:"The target customer is office workers within a 5-minute walk who have 30–45 minute lunch breaks. Their constraint is not price — it's speed and predictability. They need to know they can eat and return on time, every time. The right solution addresses that constraint: launch a 'Lunch Guarantee' — any order delivered in under 12 minutes or it's free. Add online pre-ordering so food is ready on arrival. Create a fixed-price power lunch menu of 5 fast items, rotating weekly. These changes speak directly to the real constraint. Measure success through: average table turn time at lunch, repeat lunch customers per week, and pre-order conversion rate. The PM lesson: the customer's stated problem ('expensive') is often not the real one ('unreliable, too slow'). Misdiagnosing the constraint leads to solutions that don't move the metric." },
  { title:"The Vanishing Feature", skill:"metrics",
    prompt:"Your team shipped 'Smart Sort' 3 weeks ago. Adoption is 2%, target was 40%. Engineering says it works perfectly. Design says it's intuitive. What do you do?",
    hint:"A working feature with low adoption is almost always a discovery or framing problem, not a technical one.",
    answer:"Do not conclude the feature failed. Diagnose why adoption is low — there are two very different root causes with very different fixes. First, check discovery: look at session recordings — do users even encounter the feature? If it's buried in settings or a sub-menu, most users will never find it regardless of how good it is. Second, check comprehension: interview 5 users who did encounter it. Ask what they thought it would do. If they found it but didn't use it, they didn't understand the value proposition — not because they're wrong, but because the framing failed. The fix for a discovery problem is placement and contextual triggers. The fix for a framing problem is better copy and in-context education. For Smart Sort specifically: add a contextual nudge — 'You have 12 overdue tasks — want me to sort by urgency?' — that fires when the feature is most relevant. Let users experience the value before they consciously choose it. Measure: feature encounter rate, activation rate from encounter, and repeat usage at day 7 and day 30." },
  { title:"The $1M Question", skill:"startup",
    prompt:"Early-stage startup: $1M left, 6 months runway, 10,000 users, 8% weekly retention. The team wants to build 3 new features. Investors want growth. What do you actually do?",
    hint:"8% weekly retention means 92% of users who return once don't return the next week. What does that tell you about where to invest?",
    answer:"Do not build new features. Do not run growth campaigns. Both would be catastrophic uses of limited runway. Here's the arithmetic: 8% weekly retention means 92% of users who return once don't come back the next week. Any user acquired through a growth campaign will follow the same curve — you're filling a bathtub with the drain open. Every acquisition dollar is wasted until retention is fixed. With 6 months of runway, here is the plan: Months 1–2: conduct 20 user interviews specifically with the 8% who ARE retained. What are they doing differently? What value did they find that others missed? This is your product-market fit signal hiding in plain sight. Month 3: identify the single biggest drop-off point in the first 7 days and build one targeted intervention — nothing else. Months 4–5: measure retention impact. Month 6: if retention improved, you have a fundable story. Tell investors: 'We discovered that users who complete [action X] in their first session retain at 40%. We've now built the product to funnel everyone toward that moment. Here's the data.' That is a Series A narrative. Tell investors now: 'Growth on a leaky bucket destroys runway. We are fixing the bucket first.'" },
  { title:"The Feature Factory", skill:"startup",
    prompt:"You've just joined a startup as their first PM. The founder hands you 47 feature requests from sales calls and expects a roadmap by Friday. How do you handle this without burning bridges?",
    hint:"Your job is not to schedule 47 features. It's to find the 5 real problems underneath them.",
    answer:"If you build a roadmap from this list, you become a feature factory — and feature factories ship constantly but progress rarely. Here's the right approach: Step 1: Cluster the 47 requests into themes in one sitting. Almost always, 47 requests collapse into 5–7 underlying user problems. The specific feature requested is the customer's proposed solution; your job is to find their actual problem. Step 2: Score each theme by signal quality — frequency of request, who is asking (ICP vs. edge case), and whether churned users mentioned it (a stronger signal than prospects). Step 3: For the top 3 themes, reframe: not 'how do we build this feature?' but 'what outcome is the user trying to achieve?' These are different questions that lead to very different solutions. Step 4: Come to Friday with a problem roadmap, not a feature list. Show the founder: 'These 47 requests are really 5 problems. Here is how I would prioritise them and why.' This earns trust immediately, demonstrates strategic thinking, and resets expectations about what a PM actually does. The long-term message: we will always work from problems, not from feature lists." },
];

const INTERVIEW_QS = [
  { cat:"product", q:"How would you improve Spotify?",
    process:"Clarify goal → pick a user segment → diagnose their pain → solution → success metrics. Never jump to features.",
    answer:"I'd target casual listeners who churn in month one. Their problem: they don't build a listening habit before the trial ends. The fix is not better algorithms — it's a smarter onboarding that actively builds a routine in the first week. I'd redesign the first-session experience to create a personalised weekly soundtrack around their schedule — commute, workout, wind-down — and send a contextual push at the right moment each day for 7 days. The goal is habit formation before the user has to think about it. Success metrics: 30-day retention rate (primary) and 7-day playlist save rate (leading indicator of habit formation)." },
  { cat:"metrics", q:"Your app's DAU dropped 20% overnight. Walk me through your approach.",
    process:"Diagnose before you react. Never jump to solutions. Segment → isolate → hypothesise → act.",
    answer:"Step 1: Confirm the drop is real, not a data pipeline or logging issue — this happens more often than people expect. Step 2: Segment immediately — is this drop global across all users, or isolated to one platform (iOS/Android), one geography, one user cohort, or one feature surface? A 20% drop on iOS only is a very different problem from a 20% global drop. Step 3: Check the changelog — what shipped in the last 48–72 hours? Correlate the deployment timestamp with the drop timestamp. Step 4: Check external signals — competitor launch, App Store algorithm change, media coverage? Step 5: Form one specific hypothesis. 'I believe the [X] deployment at [time] caused [Y cohort] to drop because [evidence].' Step 6: Test with minimal exposure — roll back that change for 10% of users and measure DAU recovery over 24 hours before making any broader decision." },
  { cat:"brand", q:"How would you position a new productivity app in a crowded market?",
    process:"Start with who is emotionally underserved. Find a truth competitors can't or won't claim.",
    answer:"Every major productivity app — Notion, Todoist, Linear, Asana — speaks to ambitious, organised people who want to do more. That positioning is saturated. The underserved segment is people who feel overwhelmed and want to do less, better — to have fewer things but finish them. This is a real, large, and emotionally distinct audience. Position the product as the anti-hustle productivity tool: calm, focused, ruthlessly selective about what makes the list. Tone: like a trusted editor, not a coach. Tagline: 'Less. But better.' (borrowing from Dieter Rams' design philosophy). This is a defensible positioning because it requires the brand to say no to features that every competitor would add — that restraint becomes the product identity." },
  { cat:"behavioral", q:"Tell me about a time you influenced someone without authority.",
    process:"Show empathy → strategy → persistence. You understood their goals and framed your idea in their terms, not yours.",
    answer:"I needed engineering buy-in for a feature that wasn't on the roadmap — the team was already stretched. Rather than pitching my feature, I started by asking the lead engineer what frustrated them most about the current system. They mentioned that a specific data structure made every new integration take twice as long. I realised my feature, if architected correctly, would solve that problem as a side effect. I reframed the proposal entirely: not 'I want to build X' but 'here is a solution to your architecture problem, and it also unlocks this user capability.' They took it to the CTO. The lesson: influence without authority is almost always about finding the overlap between your goal and their goal — and leading with theirs." },
  { cat:"startup", q:"What would you do in your first 30 days at an early-stage startup?",
    process:"Lead with listening. Earn the right to have opinions before trying to change anything.",
    answer:"Weeks 1–2: I would not propose anything. I'd talk to as many customers as possible — existing, churned, and prospective — with no agenda except understanding. I'd shadow every function: sales calls, support tickets, engineering standups. I want to absorb the lived reality of the product before forming any opinion. Week 3: I'd synthesise what I heard and share it openly — not as conclusions but as observations. 'Here's what I noticed. Does this match your experience?' The goal is calibration, not assertion. Week 4: I'd propose one small, low-risk experiment based on the clearest signal I found. Not a roadmap, not a strategy — one test. The philosophy: in a startup, credibility is earned by understanding before prescribing. The founders have been living this for years. I should be the most curious person in the room, not the loudest." },
  { cat:"behavioral", q:"Tell me about a decision you made with incomplete information.",
    process:"Make the Action in STAR rich. Show how you reasoned through uncertainty — that you can move decisively without all the answers.",
    answer:"We were deciding whether to delay a product launch because user test data was inconclusive — we'd run 8 sessions and the results were split. Delaying meant losing a committed press slot and partner window. I made the call to launch, but structured it as a phased rollout to 20% of users first. My reasoning: the inconclusive results weren't telling us the product was bad — they were telling us the test script was wrong. Real usage data from 2,000 real users would teach us more in 48 hours than 40 more test sessions would. We launched, monitored closely, and caught a friction point in the onboarding flow within 24 hours — a problem we'd never have found in a lab setting. We fixed it before the full rollout. The lesson: incomplete information is the permanent condition of product work. The skill is knowing when you have enough signal to move, and how to structure your action to limit downside." },
];

const PRODUCTS = [
  { product:"Notion", icon:"N", context:"All-in-one workspace for notes, docs, databases. 30M+ users.", segment:"Power users and remote teams", topPain:"Slow mobile, no real offline, deceptive AI pricing",
    complaints:["Reddit: 'Switching pages takes 2–3 seconds on a fast MacBook. Completely kills my flow state.'","Trustpilot 2025: Plus subscribers get only 20 lifetime AI responses, buried in fine print — then forced to upgrade to $20/mo.","App Store: No multi-window support, broken text selection on iOS, offline notes vanish when switching networks.","Reddit: 'They're building a mail client while the offline mode has been broken for 3 years. Core product feels abandoned.'","Capterra: 'Complex databases bog down in large workspaces. Permissions become a nightmare at scale.'"] },
  { product:"Duolingo", icon:"D", context:"Language learning app, gamified with streaks and XP. 500M+ users.", segment:"Casual adult learners targeting conversational fluency", topPain:"Gamification over real acquisition; users plateau early without realising",
    complaints:["Reddit: 'It feels like a slot machine, not language learning. I'm optimising for streak, not fluency.'","App Store: 'After a 400-day streak I still can't hold a basic conversation. I'm memorising, not learning.'","Users: 'The Hearts system punishes mistakes instead of encouraging experimentation — wrong for language acquisition.'","Reddit: 'Great for vocabulary, terrible for grammar. I had to use YouTube to actually understand structure.'","Reviews: '$80/year is not worth it — the free tier covers 90% of the content.'"] },
  { product:"Calm", icon:"C", context:"Meditation and sleep app with guided sessions and sleep stories. #1 mental health app.", segment:"Stressed professionals seeking sleep and anxiety relief", topPain:"Zero personalisation, no progress continuity, offline access locked behind paywall",
    complaints:["Reddit: '$70/year and the best content is still paywalled — including sessions I already used, which get re-locked.'","App Store: 'No offline mode. I downloaded this specifically for long-haul flights and it does not work without internet.'","Users: 'Guide quality is wildly inconsistent — some are exceptional, others sound like they'd rather be anywhere else.'","Reviews: 'The app never remembers where I left off in a course. I find my place manually every single time.'","Reddit: 'After 2 years of daily use, it still recommends me beginner content I finished in week one.'"] },
  { product:"Airbnb", icon:"A", context:"Home-sharing marketplace. 7M+ listings worldwide.", segment:"Frequent travellers booking 5+ stays per year", topPain:"Hidden fee structure destroys trust; review system integrity broken",
    complaints:["Reddit: 'An $80/night listing with a $150 cleaning fee. The total-price-before-checkout experience is deliberately deceptive.'","Trustpilot: 'Listed as an entire apartment but the host lives there. No way to reliably filter for truly private stays.'","Users: 'Hosts rate guests before guests can rate hosts — creates social pressure to leave positive reviews regardless.'","Reddit: 'Filtered for no stairs, half the results have stairs. Accessibility is clearly not a product priority.'","Reviews: 'Customer support before a trip is a chatbot loop. No path to a human.'"] },
  { product:"LinkedIn", icon:"L", context:"Professional networking platform. 1B+ members.", segment:"Mid-career professionals actively job hunting", topPain:"Feed quality broken; job application experience dishonest about listing freshness",
    complaints:["Reddit: 'The feed is 80% hustle-culture inspirational content from people I don't follow and 20% my actual network.'","Users: 'Easy Apply sends you to jobs posted 3 months ago, already filled. No indication of this anywhere.'","App Store: 'Every notification is engineered to pull you back. Work anniversaries from strangers I've never interacted with.'","Reddit: 'InMail response rates are near zero — everyone marks recruiter messages as spam — yet they keep charging for it.'","Power users: 'Content reach is throttled unless you post every day. The algorithm penalises anyone with a life.'"] },
];

const KNOWLEDGE = [
  { topic:"Jobs-to-be-Done", category:"Product Thinking", icon:"◆",
    concept:"People don't buy products — they hire them to do a job in their lives. A milkshake bought at 8am is hired to make a boring commute more interesting and filling, not simply to satisfy hunger. This reframe — from product attributes to the job being done — changes everything about how you design, prioritise, and communicate. Clayton Christensen developed this theory after watching McDonald's struggle to improve milkshake sales. Every improvement they made based on taste or texture failed. When they asked 'what job is the customer hiring this milkshake to do?' they discovered the real competitor wasn't other milkshakes — it was a banana, a bagel, the radio. Understanding the job meant understanding the real competition and the real design constraints.",
    apply:"In interviews, when asked how you'd improve a product, open with the job the user is hiring it for. 'Users hire Calm to feel less anxious before bed — not to learn meditation as a skill.' This framing immediately separates your thinking from surface-level feature suggestions.",
    exercise:"Pick one app on your phone. Write one sentence describing what job you personally hire it for. Then check if that matches what the company says the product is for in their marketing. What is the gap, and what does it imply about their positioning?",
    answer:"Strong answer: Take Spotify. Spotify's marketing says it's about 'music for every moment' — a broad, functional positioning. But the job most daily users actually hire it for is different by context: in the morning commute, they hire it to ease the transition between home and work. During exercise, they hire it to sustain physical effort. Late at night, they hire it to decompress. These are three distinct jobs with different success criteria (energy vs. calm, discovery vs. familiarity, foreground listening vs. background atmosphere). If Spotify understood its product through a jobs lens, it would build context-aware sessions — not just playlists, but a product that knows which job is being done and optimises for that. The implication for product strategy: features that serve the commute job (short, energising, no decision-making) might actively hurt the sleep job (long, calming, fading volume). Understanding jobs prevents you from building features that cannibalise each other." },

  { topic:"The Activation Metric", category:"Metrics", icon:"◈",
    concept:"Activation is the moment when a new user first experiences the core value your product delivers — their 'aha moment.' This is distinct from signup, onboarding, or first login. Facebook's growth team famously discovered that users who added 7 friends within their first 10 days retained at dramatically higher rates than those who didn't. Slack found a similar threshold around 2,000 messages sent as a team. The activation metric is the leading indicator of long-term retention — it predicts whether a user will stay before you can see whether they stayed. Most products don't know what their activation metric is, because they confuse it with completion of onboarding steps rather than experience of genuine value.",
    apply:"In interviews about improving a product or fixing retention, always ask: 'What is their activation moment, and what percentage of new users reach it?' Framing your answer around activation signals PM maturity — it shows you think about the new user experience as a funnel with a specific threshold to optimise.",
    exercise:"Define the activation moment for Spotify in one sentence, including a specific, measurable threshold. For example: 'A user who saves [X] songs or follows [Y] artists within their first [Z] days activates.' Justify your choice of threshold.",
    answer:"Strong answer: Spotify's activation metric is likely something like 'creating or saving at least one playlist within the first 3 days.' Here's the reasoning: a playlist represents intentionality — the user has moved from passive consumption to active curation. That shift indicates they've found value worth organising. Compare this to a user who simply listens to curated radio: they may enjoy the session but have no investment in returning specifically to Spotify — any music service would do. The playlist creator has begun building something inside Spotify that has switching cost. The operational implication: every onboarding action Spotify takes should funnel users toward their first playlist creation. The 'Made for You' playlists (Discover Weekly, Daily Mix) are Spotify's attempt at this — they create playlists on behalf of the user — but the activation event likely requires the user to internalise ownership of that playlist, not just consume it. Testing hypothesis: A/B test prompting users to name or edit an auto-generated playlist vs. simply playing it, and measure 30-day retention difference." },

  { topic:"The Innovator's Dilemma", category:"Strategy", icon:"◇",
    concept:"Clayton Christensen's most important insight: successful, well-managed companies fail not because they do things wrong, but because they do everything right. They listen carefully to their best customers, invest in the most profitable improvements, and ignore low-end 'inferior' products — until those products improve and take the market. Blockbuster listened to its best customers (people who wanted new releases, in-store experience) and ignored Netflix's DVD-by-mail service (worse selection, no impulse browsing). By the time Netflix streaming was undeniably better, Blockbuster had no path to compete. The pattern repeats across industries: mainframes ignored minicomputers, minicomputers ignored PCs, PCs ignored smartphones. The incumbent is always optimising for the customer they have. The disruptor is serving the customer the incumbent ignores.",
    apply:"At a startup, you are almost always the disruptor. In strategy interviews, positioning your company through this lens — 'we are starting with the customer [incumbent] ignores, and improving from there' — demonstrates sophisticated competitive thinking. It also explains why you don't need to beat the incumbent on their own terms initially.",
    exercise:"Name one company you believe is currently vulnerable to disruption from below. Who is the underserved customer the disruptor would target first? What would the disruptive product look like in its early, 'worse but cheaper/simpler' form?",
    answer:"Strong answer: Salesforce is vulnerable. Its best customers are large enterprise sales teams with complex CRM needs — and it has optimised aggressively for them, making the product increasingly powerful and increasingly complex. The underserved customer is the small B2B startup with 2–10 salespeople who need basic pipeline management, not a configurable enterprise platform. The disruptive entrant looks like Attio, Folk, or Twenty — CRMs that are radically simpler, priced accessibly, and designed for founders rather than sales ops managers. They are 'worse' by Salesforce's metrics: fewer integrations, less customisability, no enterprise compliance features. But they are better by the small team's metrics: immediate to set up, intuitive to use without training, priced at $20/user rather than $150. The disruption pattern: these tools start with startups, gradually add features as their customers grow, and eventually reach the mid-market where Salesforce is most profitable. By that point, switching costs are high and the disruptor has a loyal user base that grew up with them. Salesforce's rational response — optimise further for enterprise — accelerates the dynamic rather than reversing it." },

  { topic:"Retention Curves", category:"Metrics", icon:"◉",
    concept:"A retention curve plots the percentage of users who return to a product over time — day 1, day 7, day 30, day 90. The shape of this curve is one of the most diagnostic charts in product management. Products that have found product-market fit for a segment produce curves that 'flatten' — they decline from 100% but stabilise above 0% at some level. This means some cohort of users has decided this product is a permanent part of their life. Products without product-market fit produce curves that slope continuously toward zero — every cohort eventually leaves. The level at which a curve flattens tells you the size and nature of your retained segment. A curve that flattens at 40% means 40% of users find permanent value; a curve that flattens at 5% means your product has a small but loyal core. Neither is inherently bad — but they imply very different growth strategies.",
    apply:"When given a retention problem in an interview, always ask first: does the curve flatten or go to zero? If it flattens, the strategy is expanding the segment that retains. If it goes to zero, the product hasn't found its value yet and no amount of growth investment will compound — you're filling a bucket with a hole in it.",
    exercise:"Sketch (or describe) the shape of the retention curve for: (1) a strong consumer social product, (2) a B2B SaaS tool used daily, (3) a travel booking app. What level does each flatten at, and what does that imply about the growth strategy for each?",
    answer:"Strong answer: (1) A strong consumer social product like WhatsApp has a high-flattening curve — likely stabilising around 70–80% at day 30 and remaining near that through day 90. The implication is that once users establish their social graph inside the product, switching cost is high and churn is low. Growth strategy: pure acquisition — every user you get tends to stay, so spend aggressively on top-of-funnel. (2) A B2B SaaS tool used daily (like Notion or Linear) has a medium-flattening curve — day 30 retention might be 50–60% but it's very durable past that. The initial drop-off is users who tried it and found it too complex; those who stay build deep workflows. Growth strategy: improve activation (get users to the 'aha moment' faster) to lift the retention floor, then invest in expansion revenue from retained users. (3) A travel booking app (like Airbnb or Booking.com) has a fundamentally different shaped curve — high spikes around trip planning cycles but with very long gaps. Measuring weekly or monthly retention is misleading; the right metric is trips booked per year per user, not daily active rate. Growth strategy is about increasing frequency of occasion (business travel, weekend trips) rather than improving daily retention, which is an irrelevant metric for a low-frequency behaviour." },

  { topic:"The Kano Model", category:"Prioritisation", icon:"◎",
    concept:"Noriaki Kano's model classifies product features into three types based on how users respond to their presence and absence. Basic needs (Must-haves): users don't notice when they're present but are intensely dissatisfied when they're missing. A hotel room must have a working lock — no guest gives you credit for it. Performance needs (Linear satisfiers): more is better, users will pay for improvements here — faster delivery, better battery life, sharper camera. Delighters (Attractive features): users don't expect them and won't ask for them, but they create disproportionate delight and loyalty when present. The Ritz-Carlton remembers your name. The critical mistake most product teams make: they invest in performance features and delighters while basic needs are broken. Users won't remember the delightful onboarding animation if the app crashes on login.",
    apply:"In prioritisation interviews, applying the Kano model shows you think about user emotion, not just utility. It also helps you argue for fixing foundational issues over adding features — a common startup trap. 'Before we build the delight layer, we need to fix the basic needs that are broken.'",
    exercise:"Take any product you know well. Identify one feature in each Kano category: one Basic need, one Performance need, one Delighter. Justify each classification with a specific user behaviour or reaction.",
    answer:"Strong answer using Spotify: Basic need — reliable offline playback. Users don't praise Spotify when offline works (they expect it) but they churn immediately if downloaded songs fail to play on a plane. This is a must-have that, if broken, overrides every other feature. Performance need — personalisation quality. The better Discover Weekly and Daily Mix recommendations are, the more time users spend, the more they pay for Premium, and the less likely they are to leave. More = better, with clear diminishing returns at very high accuracy. Delighter — the Wrapped annual summary. Users had no idea they wanted a visual story of their listening year — Spotify invented the desire and now users anticipate it every December. It generates enormous organic social sharing and strengthens identity association with the brand. The Kano implication for Spotify's roadmap: if offline playback is broken for any user segment, fix it before improving recommendations or building more Wrapped-style features. The broken basic need poisons all the delight built on top of it." },

  { topic:"North Star Metric", category:"Strategy", icon:"◆",
    concept:"A North Star Metric (NSM) is the single number that best captures the core value your product delivers to customers. It sits between vanity metrics (total signups, app downloads) which measure acquisition without value, and revenue metrics which measure business outcomes but lag user value. The best NSMs directly represent user value and have a predictable relationship to long-term business outcomes. Airbnb: Nights Booked. Spotify: Time Spent Listening. Facebook (early): Daily Active Users. The NSM serves as an alignment tool — every team, every quarter, every feature decision should trace back to moving this number. The danger of the wrong NSM: Facebook's shift toward engagement metrics (time on site) optimised for outrage-driven content that increased session time while eroding the quality of the platform. The NSM you choose shapes the product you build.",
    apply:"In every product interview, name the likely North Star of the product you're discussing and propose solutions that move it. Saying 'this would increase [NSM] because...' signals strategic thinking rather than tactical feature-building.",
    exercise:"Propose a North Star Metric for a B2B project management tool (like Asana or Linear). Write it as a specific, measurable number with a time dimension. Then explain: (1) why this metric and not revenue, (2) what user behaviour it represents, (3) one way it could be gamed and why that would be a problem.",
    answer:"Strong answer: North Star Metric for a B2B project management tool: 'Number of tasks completed by teams within the platform per week' — specifically tasks with at least 2 collaborators involved. Here's the justification: (1) Why not revenue: revenue lags user value by months in B2B SaaS — a team might pay for 6 months before churning, making revenue a lagging indicator of a problem you can no longer fix. Task completion with collaboration is a leading indicator of whether the product is genuinely embedded in how teams work. (2) What it represents: a completed collaborative task means the product successfully facilitated coordination between people — that's the core value proposition of any project management tool. A tool where tasks are created but not completed is being used as a list, not as a collaboration system. (3) Gaming risk: teams could mark tasks complete prematurely to hit targets. This would show up as a spike in completion rate accompanied by a drop in subsequent task creation from those teams — a detectable anomaly. Counter-metric: pair the NSM with 'tasks reopened within 48 hours of completion' as a quality signal. The best NSMs are hard to game without also improving the real outcome, because gaming them requires doing the real thing." },

  { topic:"Customer Discovery", category:"Research", icon:"◇",
    concept:"Rob Fitzpatrick's 'Mom Test' principle: don't ask people if they like your idea — your mother will say yes to be supportive, and so will everyone else. Instead, ask about their life, their actual past behaviour, their real problems. 'Would you use this?' is a useless question — people are optimistic about hypothetical futures. 'Tell me about the last time you tried to solve this problem' is gold — past behaviour is a reliable signal, hypothetical behaviour is not. The three rules of the Mom Test: (1) Talk about their life, not your idea. (2) Ask about specifics in the past, not generalities or opinions about the future. (3) Talk less and listen more. The goal is to learn whether a real problem exists and how people currently solve it — not to validate your solution.",
    apply:"In behavioral interviews about user research, referencing Mom Test principles demonstrates that you understand how to collect unbiased signal. Many PMs conduct research that only confirms what they already believe — showing you know how to avoid this bias is differentiating.",
    exercise:"Write 3 user research questions you'd ask to understand how professionals manage their workload and task prioritisation — using Mom Test principles. No leading questions, no hypotheticals, no product-pitching. Then explain what insight each question is designed to surface.",
    answer:"Strong answer — 3 Mom Test-style questions for understanding workload management: (1) 'Walk me through how yesterday actually went — from the moment you started work to when you stopped. What did you work on and in what order?' This surfaces the real task prioritisation behaviour — not what people think they do, but what they actually do. It often reveals that people ignore their stated system and prioritise based on what's loudest or most anxious, not most important. (2) 'Tell me about the last time you felt like you completely lost control of your workload. What happened, and how did you recover?' This surfaces the failure mode — the emotional experience of the problem at its worst. This is where product insight lives: not in the average day but in the breakdown. (3) 'What tools or systems do you currently use to manage your tasks, and which ones have you tried and abandoned? Why did you stop using them?' This surfaces the graveyard of failed solutions — critical intelligence. If every person has tried and abandoned Todoist, that's a signal about a real unmet need. If they've abandoned 5 tools for different reasons, that's a signal that the category has a fundamental problem no one has solved. The meta-lesson: all three questions ask about real, past behaviour with no mention of any product or solution. The goal is to understand the problem space before even considering whether to build something." },

  { topic:"Switching Costs & Moats", category:"Strategy", icon:"◉",
    concept:"A moat is a sustainable competitive advantage that prevents users from switching to a competitor even when a better product exists. Switching costs are the friction — time, money, lost data, broken habits, lost network — that makes leaving painful. The most durable moats: (1) Network effects: the product becomes more valuable as more people use it. WhatsApp is more valuable because everyone you know is on it. (2) Data lock-in: the longer you use a product, the more your data is trapped inside it. Notion workspaces, Spotify playlists, Gmail history. (3) Workflow integration: the product becomes embedded in daily processes. Slack notifications, Jira tickets, Salesforce pipelines. Teams rebuild workflows to accommodate these tools — switching means rebuilding everything. (4) Habit formation: the product creates a daily ritual. Duolingo streaks, morning Headspace sessions. Breaking a habit requires activation energy most users never generate. Products without moats can be displaced by a slightly better product overnight — the cost of switching is zero.",
    apply:"In product strategy interviews, thinking about what moat you'd build — not just what feature — shows you think about defensibility, not just desirability. Startups especially need to identify the moat they're building from day one, because they don't have brand or distribution.",
    exercise:"You're building a new note-taking app to compete with Notion. What specific moat would you try to build in the first 6 months, and what product decisions would you make to build it? Be specific about the mechanism.",
    answer:"Strong answer: The moat I'd build in 6 months is data network effects through collaborative knowledge graphs — where the value of a user's notes increases as more of their team is also using the product. Here's the mechanism: individual note-taking has no network effect (my Notion is equally valuable whether my team is on it or not). But if the product creates linked knowledge — where my notes automatically surface relevant notes from my colleagues when I'm working on a related topic — then every teammate I add makes my own notes more useful. This is not a feature, it's an architecture decision made in month one: build every note as a node in a network, not a document in a folder. The moat deepens over time: after 6 months of collaborative use, a team's knowledge graph is both extremely valuable and completely irreplaceable — you cannot export a knowledge graph to Notion. The switching cost is the loss of every connection between notes, which represents months of organisational intelligence. Product decisions required: (1) Every note gets automatic tagging and contextual linking from day one. (2) The core UX is 'related notes from your team' rather than 'your personal notes.' (3) Onboarding requires inviting at least one teammate before the product shows its value — individual use is deliberately inferior. This makes the product harder to adopt individually but nearly impossible to abandon once a team is inside it." },
];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const getTodayKey  = () => new Date().toISOString().split("T")[0];
const getWeekKey   = () => { const d=new Date(),dy=d.getDay(),diff=d.getDate()-dy+(dy===0?-6:1); return new Date(new Date().setDate(diff)).toISOString().split("T")[0]; };
const getMonthKey  = () => { const d=new Date(); return `${d.getFullYear()}-${d.getMonth()}`; };
const getDaySeed   = () => { const d=new Date(); return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(); };
const getDayIndex  = () => { const d=new Date().getDay(); return d===0?6:d-1; };
const DAYS         = ["M","T","W","T","F","S","S"];

const safeGet = async (k) => { try { const r=await window.storage.get(k); return r?JSON.parse(r.value):null; } catch { return null; } };
const safeSet = async (k,v) => { try { await window.storage.set(k,JSON.stringify(v)); } catch {} };

/* ─────────────────────────────────────────
   ATOMS
───────────────────────────────────────── */
const Lbl = ({children,color=T.forest}) =>
  <div style={{fontSize:9,letterSpacing:2,fontFamily:"'Courier New',monospace",color,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>{children}</div>;

const Divider = () => <div style={{height:1,background:T.lineSoft,margin:"18px 0"}}/>;

const Chip = ({children,active,onClick}) =>
  <button onClick={onClick} style={{borderRadius:20,padding:"5px 14px",fontSize:11,fontFamily:"'Courier New',monospace",border:`1.5px solid ${active?T.forest:T.line}`,background:active?T.forest:"transparent",color:active?T.cream:T.inkSoft,cursor:"pointer",letterSpacing:.3,transition:"all .2s"}}>{children}</button>;

const Pill = ({children,color=T.forest}) =>
  <span style={{fontSize:9,letterSpacing:1.5,fontFamily:"'Courier New',monospace",color,background:color+"18",border:`1px solid ${color}30`,borderRadius:3,padding:"3px 9px",fontWeight:700}}>{children}</span>;

function FCard({children,style={}}) {
  return <div style={{background:T.card,border:`1.5px solid ${T.line}`,borderRadius:16,padding:20,...style}}>{children}</div>;
}

function GBtn({onClick,children,style={}}) {
  return <button onClick={onClick} style={{background:"transparent",border:`1.5px solid ${T.line}`,borderRadius:20,padding:"7px 16px",cursor:"pointer",fontSize:11,color:T.inkSoft,fontFamily:"'Courier New',monospace",letterSpacing:.3,...style}}>{children}</button>;
}

function PBtn({onClick,children,outline=false,style={}}) {
  return <button onClick={onClick} style={{borderRadius:20,padding:"9px 22px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Courier New',monospace",letterSpacing:.5,border:`1.5px solid ${T.forest}`,background:outline?"transparent":T.forest,color:outline?T.forest:T.cream,transition:"all .2s",...style}}>{children}</button>;
}

function Spin() {
  return <div style={{display:"flex",justifyContent:"center",padding:"16px"}}>
    <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${T.tanSoft}`,borderTopColor:T.forest,animation:"sp .7s linear infinite"}}/>
    <style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style>
  </div>;
}

/* ─────────────────────────────────────────
   ANSWER BLOCK
───────────────────────────────────────── */
function AnswerBlock({storageKey, questionContext, showImproved=true}) {
  const [ans,setAns]     = useState("");
  const [saved,setSaved] = useState(false);
  const [fb,setFb]       = useState(null);
  const [imp,setImp]     = useState(null);
  const [fbL,setFbL]     = useState(false);
  const [impL,setImpL]   = useState(false);
  const [fbOpen,setFbOpen]   = useState(false);
  const [impOpen,setImpOpen] = useState(false);
  const db = useRef(null);

  useEffect(()=>{
    safeGet(`ans:${storageKey}`).then(v=>{
      if(v?.text) setAns(v.text);
      if(v?.fb)   setFb(v.fb);
      if(v?.imp)  setImp(v.imp);
    });
  },[storageKey]);

  const persist = useCallback((t,f=fb,i=imp)=>{
    clearTimeout(db.current);
    db.current=setTimeout(async()=>{
      await safeSet(`ans:${storageKey}`,{text:t,fb:f,imp:i,savedAt:new Date().toISOString()});
      setSaved(true); setTimeout(()=>setSaved(false),2000);
    },800);
  },[storageKey,fb,imp]);

  const onChange = v => { setAns(v); persist(v); };

  const getFb = async () => {
    if(!ans.trim()) return;
    setFbL(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,messages:[{role:"user",content:`You are a senior PM interview coach. Give specific, honest feedback.

${questionContext}

Their answer: "${ans}"

Reply in this exact format (labels on own lines):

WHAT WORKED
(2–3 sentences on genuine strengths — be specific, not generic)

WHAT WAS SHALLOW  
(2–3 sentences on what was missing, weak, or vague — be direct)

HOW TO SHARPEN IT
(3 concrete sentences of specific advice)

SCORE
(Format: X/10 — one sentence reason)`}]})});
      const d=await r.json(); const txt=d.content?.map(b=>b.text||"").join("")||"";
      const ex=(a,b)=>{const rx=new RegExp(`${a}\\s*\\n([\\s\\S]*?)(?=\\n${b}\\s*\\n|$)`,"i");const m=txt.match(rx);return m?m[1].trim():null;};
      const result={got:ex("WHAT WORKED","WHAT WAS SHALLOW"),shallow:ex("WHAT WAS SHALLOW","HOW TO SHARPEN IT"),sharpen:ex("HOW TO SHARPEN IT","SCORE"),score:ex("SCORE","ZZZNOMATCH")};
      setFb(result); setFbOpen(true);
      persist(ans,result,imp);
      // Record skill score
      const sm=questionContext.match(/skill:(\w+)/i);
      if(sm){
        const n=parseInt((result.score||"5").match(/(\d+)/)?.[1]||5);
        const ex2=await safeGet("skills:scores")||{};
        const arr=ex2[sm[1]]||[]; arr.push(n); if(arr.length>10) arr.shift();
        ex2[sm[1]]=arr; await safeSet("skills:scores",ex2);
      }
    } catch{}
    setFbL(false);
  };

  const getImp = async () => {
    if(!ans.trim()) return;
    setImpL(true);
    try {
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`Rewrite this answer applying all improvements needed. Keep their voice but make it sharper, more structured, more specific.

Context: ${questionContext}
Their answer: "${ans}"

Start with: "Here is what your answer could look like:"
Write the improved version in 4–8 sentences.
End with: "Key upgrade: [the single most important thing that changed]"`}]})});
      const d=await r.json(); const txt=d.content?.map(b=>b.text||"").join("")||"";
      setImp(txt); setImpOpen(true);
      persist(ans,fb,txt);
    } catch{}
    setImpL(false);
  };

  const score = fb?.score ? parseInt((fb.score).match(/(\d+)/)?.[1]||0) : null;

  return (
    <div>
      <Lbl>Your Answer</Lbl>
      <textarea value={ans} onChange={e=>onChange(e.target.value)}
        placeholder="Write your answer here before revealing the sample..."
        style={{width:"100%",minHeight:96,background:T.linen,border:`1.5px solid ${T.line}`,borderRadius:10,padding:"12px 14px",color:T.ink,fontSize:13,lineHeight:1.8,resize:"vertical",fontFamily:"Georgia,'Times New Roman',serif",outline:"none",boxSizing:"border-box"}}/>
      <div style={{fontSize:10,color:saved?T.forestMd:T.inkFaint,fontFamily:"'Courier New',monospace",marginTop:5,transition:"color .3s",letterSpacing:.5}}>
        {saved?"✓ saved":"autosaves as you type"}
      </div>
      <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
        <PBtn onClick={getFb} style={{fontSize:11,padding:"7px 18px"}}>{fbL?"thinking...":"✦ get feedback"}</PBtn>
        {showImproved && <GBtn onClick={getImp} style={{fontSize:11}}>{impL?"rewriting...":"✧ show improved"}</GBtn>}
      </div>
      {fbL && <div style={{marginTop:10}}><Spin/></div>}
      {fb && fbOpen && (
        <div style={{marginTop:14,background:T.linen,border:`1.5px solid ${T.line}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 16px",background:T.forestLt,borderBottom:`1px solid ${T.line}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:10,color:T.forest,fontFamily:"'Courier New',monospace",fontWeight:700,letterSpacing:1.5}}>FEEDBACK</span>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {score && <span style={{fontSize:14,fontWeight:700,color:T.forest,fontFamily:"Georgia,serif"}}>{score}/10</span>}
              <button onClick={()=>setFbOpen(false)} style={{background:"transparent",border:"none",color:T.inkSoft,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
            </div>
          </div>
          <div style={{padding:"14px 16px"}}>
            {fb.got && <div style={{marginBottom:12}}>
              <Lbl color={T.forestMd}>✓ What Worked</Lbl>
              <div style={{fontSize:13,color:T.ink,lineHeight:1.8}}>{fb.got}</div>
            </div>}
            {fb.shallow && <div style={{marginBottom:12,paddingTop:12,borderTop:`1px solid ${T.lineSoft}`}}>
              <Lbl color="#a05050">⚠ What Was Shallow</Lbl>
              <div style={{fontSize:13,color:T.ink,lineHeight:1.8}}>{fb.shallow}</div>
            </div>}
            {fb.sharpen && <div style={{paddingTop:12,borderTop:`1px solid ${T.lineSoft}`}}>
              <Lbl color={T.forest}>→ How to Sharpen It</Lbl>
              <div style={{fontSize:13,color:T.ink,lineHeight:1.8}}>{fb.sharpen}</div>
            </div>}
            {fb.score && <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.lineSoft}`,fontSize:12,color:T.inkMid,fontStyle:"italic"}}>{fb.score}</div>}
          </div>
        </div>
      )}
      {impL && <div style={{marginTop:10}}><Spin/></div>}
      {imp && impOpen && (
        <div style={{marginTop:12,background:T.forestLt,border:`1.5px solid ${T.tanSoft}`,borderRadius:12,padding:"14px 16px"}}>
          <Lbl color={T.forest}>Improved Version</Lbl>
          <div style={{fontSize:13,color:T.ink,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{imp}</div>
          <GBtn onClick={()=>setImpOpen(false)} style={{marginTop:10,fontSize:10}}>close</GBtn>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   HOME TAB
───────────────────────────────────────── */
function HomeTab({dailyChecks, weeklyChecks, monthlyChecks, scores, seed, setTab, setPracticeView}) {
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  const dayStr = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const todayDone = DAILY_TASKS.filter(t=>dailyChecks[t.id]).length;
  const weekDone  = WEEKLY_TASKS.filter(t=>weeklyChecks[t.id]).length;
  const monthDone = MONTHLY_TASKS.filter(t=>monthlyChecks[t.id]).length;
  const knowledge = KNOWLEDGE[seed % KNOWLEDGE.length];

  const allScores = Object.values(scores||{}).flat();
  const avgScore  = allScores.length ? (allScores.reduce((a,b)=>a+b,0)/allScores.length).toFixed(1) : null;
  const skillsSorted = SKILL_AREAS.map(s=>({...s,avg:scores?.[s.id]?.length?+(scores[s.id].reduce((a,b)=>a+b,0)/scores[s.id].length).toFixed(1):null})).filter(s=>s.avg).sort((a,b)=>a.avg-b.avg);

  return (
    <div>
      {/* Hero */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,color:T.inkFaint,fontFamily:"'Courier New',monospace",letterSpacing:2,marginBottom:6}}>{dayStr.toUpperCase()}</div>
        <div style={{fontSize:26,fontFamily:"'Lora','Georgia',serif",fontWeight:700,color:T.ink,lineHeight:1.25}}>{greeting}</div>
        <div style={{fontSize:14,color:T.inkSoft,marginTop:4,fontFamily:"Georgia,serif"}}>Your prep journal is ready.</div>
      </div>

      {/* Today's tasks */}
      <FCard style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <Lbl>Today's Practice</Lbl>
          <span style={{fontSize:11,color:todayDone===DAILY_TASKS.length?T.forest:T.inkSoft,fontFamily:"'Courier New',monospace",fontWeight:700}}>{todayDone}/{DAILY_TASKS.length}</span>
        </div>
        {DAILY_TASKS.map((t,i)=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<DAILY_TASKS.length-1?`1px solid ${T.lineSoft}`:"none"}}>
            <div style={{width:17,height:17,borderRadius:"50%",border:`2px solid ${dailyChecks[t.id]?T.forest:T.line}`,background:dailyChecks[t.id]?T.forest:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {dailyChecks[t.id]&&<span style={{color:T.cream,fontSize:9,fontWeight:700}}>✓</span>}
            </div>
            <span style={{fontSize:13,color:dailyChecks[t.id]?T.inkFaint:T.ink,textDecoration:dailyChecks[t.id]?"line-through":"none",flex:1}}>{t.label}</span>
            {!dailyChecks[t.id] && <span style={{fontSize:9,color:T.inkFaint,fontFamily:"'Courier New',monospace"}}>{t.icon}</span>}
          </div>
        ))}
        <div style={{marginTop:14}}>
          <GBtn onClick={()=>setTab("practice")} style={{fontSize:11}}>Open practice →</GBtn>
        </div>
      </FCard>

      {/* Progress row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        {[{label:"This Week",done:weekDone,total:WEEKLY_TASKS.length,view:"weekly"},{label:"This Month",done:monthDone,total:MONTHLY_TASKS.length,view:"monthly"}].map(p=>(
          <FCard key={p.label} style={{cursor:"pointer",padding:16}} onClick={()=>{setTab("practice");setPracticeView(p.view);}}>
            <Lbl>{p.label}</Lbl>
            <div style={{fontSize:24,fontWeight:700,fontFamily:"'Lora','Georgia',serif",color:p.done===p.total?T.forest:T.ink}}>{p.done}<span style={{fontSize:14,color:T.inkFaint,fontWeight:400}}>/{p.total}</span></div>
            <div style={{background:T.linen,borderRadius:6,height:4,marginTop:10,overflow:"hidden"}}>
              <div style={{width:`${p.total?(p.done/p.total)*100:0}%`,height:"100%",background:T.forest,borderRadius:6,transition:"width .5s"}}/>
            </div>
          </FCard>
        ))}
      </div>

      {/* Skills snapshot */}
      {skillsSorted.length>0 && (
        <FCard style={{marginBottom:12}}>
          <Lbl>Skill Map</Lbl>
          {avgScore && <div style={{fontSize:13,color:T.inkMid,marginBottom:12,fontFamily:"Georgia,serif"}}>Average score: <strong style={{color:T.forest}}>{avgScore}/10</strong> across {allScores.length} sessions</div>}
          {skillsSorted.map(s=>(
            <div key={s.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:T.inkMid}}>{s.icon} {s.label}</span>
                <span style={{fontSize:11,fontFamily:"'Courier New',monospace",color:s.avg>=7?T.forest:s.avg>=5?T.inkMid:"#a05050",fontWeight:700}}>{s.avg}/10</span>
              </div>
              <div style={{background:T.linen,borderRadius:6,height:6,overflow:"hidden"}}>
                <div style={{width:`${(s.avg/10)*100}%`,height:"100%",background:s.avg>=7?T.forest:s.avg>=5?T.tan:"#c09090",borderRadius:6,transition:"width .5s"}}/>
              </div>
            </div>
          ))}
          {skillsSorted.length>0 && (
            <div style={{marginTop:12,padding:"10px 12px",background:T.forestLt,borderRadius:8,fontSize:12,color:T.forest,lineHeight:1.7}}>
              Focus on <strong>{skillsSorted[0]?.label}</strong> — your lowest area. Your strongest: <strong>{skillsSorted[skillsSorted.length-1]?.label}</strong>.
            </div>
          )}
        </FCard>
      )}

      {/* Learn teaser */}
      <FCard style={{background:T.tanDim,border:`1.5px solid ${T.tanSoft}`}}>
        <Lbl color={T.tan.replace("#c8","#a0")}>Today's Concept</Lbl>
        <div style={{fontSize:16,fontFamily:"'Lora','Georgia',serif",fontWeight:700,color:T.ink,marginBottom:8,lineHeight:1.35}}>{knowledge.icon} {knowledge.topic}</div>
        <div style={{fontSize:13,color:T.inkMid,lineHeight:1.75,marginBottom:12}}>{knowledge.concept.substring(0,140)}…</div>
        <GBtn onClick={()=>setTab("learn")} style={{fontSize:11}}>Read full concept →</GBtn>
      </FCard>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRACTICE TAB  (daily + weekly + monthly)
───────────────────────────────────────── */
function ProblemCard({seed}) {
  const p = PROBLEMS[seed % PROBLEMS.length];
  const [showAns,setShowAns] = useState(false);
  const key = `problem:${seed%PROBLEMS.length}:${getTodayKey()}`;
  const ctx = `skill:${p.skill}\nChallenge: ${p.prompt}\nSample answer: ${p.answer}`;
  return (
    <FCard style={{marginBottom:12}}>
      <Pill>Problem Challenge</Pill>
      <div style={{fontSize:15,fontFamily:"'Lora','Georgia',serif",fontWeight:700,color:T.ink,margin:"10px 0 12px",lineHeight:1.4}}>{p.title}</div>
      <div style={{fontSize:13,color:T.ink,lineHeight:1.8,background:T.linen,borderRadius:10,padding:"12px 14px",marginBottom:10}}>{p.prompt}</div>
      <div style={{fontSize:12,color:T.inkMid,fontStyle:"italic",marginBottom:14}}>Hint: {p.hint}</div>
      <AnswerBlock storageKey={key} questionContext={ctx}/>
      <Divider/>
      <GBtn onClick={()=>setShowAns(!showAns)} style={{fontSize:11}}>{showAns?"▲ hide sample":"✓ see sample answer"}</GBtn>
      {showAns && <div style={{marginTop:14,fontSize:13,color:T.ink,lineHeight:1.85,background:T.forestLt,borderRadius:10,padding:"12px 14px"}}>{p.answer}</div>}
    </FCard>
  );
}

function ProductCard({seed}) {
  const pr = PRODUCTS[seed % PRODUCTS.length];
  const [ai,setAi]   = useState(null);
  const [load,setLoad] = useState(false);
  const [showAns,setShowAns] = useState(false);
  const key = `product:${seed%PRODUCTS.length}:${getTodayKey()}`;

  const gen = useCallback(async()=>{
    setLoad(true); setAi(null); setShowAns(false);
    try {
      const c3=pr.complaints.slice(0,3).join("\n- ");
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`Write a PM practice brief. 4 sections, labels on own lines in CAPS:\n\nCORE PROBLEM\n(2-3 sentences synthesising complaints into one root problem)\n\nTHE OPPORTUNITY\n(1-2 sentences on market gap)\n\nYOUR CHALLENGE\n(one interview question for the student to answer about ${pr.product})\n\nSAMPLE STRONG ANSWER\n(4-6 sentences: user empathy, specific solution, success metrics)\n\nProduct: ${pr.product} — ${pr.context}\nSegment: ${pr.segment}\nComplaints:\n- ${c3}\nNo preamble.`}]})});
      const d=await r.json(); const raw=d.content?.map(b=>b.text||"").join("")||"";
      const ex=(a,b)=>{const rx=new RegExp(`${a}\\s*\\n([\\s\\S]*?)(?=\\n${b}\\s*\\n|$)`,"i");const m=raw.match(rx);return m?m[1].trim():null;};
      setAi({core:ex("CORE PROBLEM","THE OPPORTUNITY"),opp:ex("THE OPPORTUNITY","YOUR CHALLENGE"),q:ex("YOUR CHALLENGE","SAMPLE STRONG ANSWER"),ans:ex("SAMPLE STRONG ANSWER","ZZZNOMATCH")});
    } catch { setAi({error:true}); }
    setLoad(false);
  },[pr]);

  useEffect(()=>{gen();},[gen]);
  const ctx = `skill:product\nProduct: ${pr.product}\nChallenge: ${ai?.q||""}\nSample: ${ai?.ans||""}`;

  return (
    <FCard style={{marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:T.forest,display:"flex",alignItems:"center",justifyContent:"center",color:T.cream,fontWeight:700,fontSize:15,fontFamily:"'Courier New',monospace",flexShrink:0}}>{pr.icon}</div>
        <div>
          <div style={{fontSize:15,fontFamily:"'Lora','Georgia',serif",fontWeight:700,color:T.ink}}>{pr.product}</div>
          <div style={{fontSize:11,color:T.inkSoft}}>{pr.context}</div>
        </div>
      </div>
      <Lbl color="#a05050">Real User Complaints</Lbl>
      {pr.complaints.map((c,i)=>(
        <div key={i} style={{fontSize:12,color:T.inkMid,lineHeight:1.65,padding:"6px 10px 6px 12px",borderLeft:`2px solid ${T.tan}`,marginBottom:5,background:T.tanDim,borderRadius:"0 6px 6px 0"}}>{c}</div>
      ))}
      {load && <div style={{marginTop:12}}><Spin/></div>}
      {!load && ai && !ai.error && <>
        {ai.core && <><Divider/><Lbl>Core Problem</Lbl><div style={{fontSize:13,color:T.ink,lineHeight:1.8,background:T.linen,borderRadius:10,padding:"10px 12px"}}>{ai.core}</div></>}
        {ai.opp  && <><div style={{marginTop:10}}><Lbl color={T.forestMd}>The Opportunity</Lbl><div style={{fontSize:13,color:T.ink,lineHeight:1.8,background:T.forestLt,borderRadius:10,padding:"10px 12px"}}>{ai.opp}</div></div></>}
        {ai.q    && <><Divider/><Lbl>Your Challenge</Lbl><div style={{fontSize:13,color:T.ink,lineHeight:1.8,marginBottom:14,fontStyle:"italic"}}>{ai.q}</div><AnswerBlock storageKey={key} questionContext={ctx}/></>}
        {ai.ans  && <><Divider/><GBtn onClick={()=>setShowAns(!showAns)} style={{fontSize:11}}>{showAns?"▲ hide sample":"✓ see sample answer"}</GBtn>{showAns&&<div style={{marginTop:12,fontSize:13,color:T.ink,lineHeight:1.85,background:T.forestLt,borderRadius:10,padding:"12px 14px"}}>{ai.ans}</div>}</>}
        <GBtn onClick={gen} style={{marginTop:10,fontSize:10}}>↺ regenerate</GBtn>
      </>}
    </FCard>
  );
}

function QuestionCard({seed}) {
  const q = INTERVIEW_QS[seed % INTERVIEW_QS.length];
  const [showAns,setShowAns] = useState(false);
  const key = `iq:${seed%INTERVIEW_QS.length}:${getTodayKey()}`;
  const ctx = `skill:${q.cat}\nQuestion: ${q.q}\nProcess: ${q.process}\nSample: ${q.answer}`;
  return (
    <FCard style={{marginBottom:12}}>
      <Pill>{q.cat}</Pill>
      <div style={{fontSize:15,fontFamily:"'Lora','Georgia',serif",fontWeight:700,color:T.ink,margin:"10px 0 8px",lineHeight:1.4}}>{q.q}</div>
      <div style={{fontSize:12,color:T.inkSoft,fontStyle:"italic",marginBottom:14,lineHeight:1.7}}>Process: {q.process}</div>
      <AnswerBlock storageKey={key} questionContext={ctx}/>
      <Divider/>
      <GBtn onClick={()=>setShowAns(!showAns)} style={{fontSize:11}}>{showAns?"▲ hide":"✓ see sample answer"}</GBtn>
      {showAns && <div style={{marginTop:12,fontSize:13,color:T.ink,lineHeight:1.85,background:T.forestLt,borderRadius:10,padding:"12px 14px"}}>{q.answer}</div>}
    </FCard>
  );
}

function TaskExpandCard({task, done, onToggle, storageKey, isWeekly}) {
  const [open,setOpen]         = useState(false);
  const [showSample,setShowSample] = useState(false);
  const skillMap = {write:"product",teardown:"product",case:"metrics",network:"startup",mock:"startup",project:"startup",reflect:"startup"};
  const ctx = `skill:${skillMap[task.id]||"startup"}\nTask: ${task.label}\nPrompt: ${task.prompt}`;
  return (
    <FCard style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div onClick={onToggle} style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${done?T.forest:T.line}`,background:done?T.forest:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all .2s"}}>
          {done&&<span style={{color:T.cream,fontSize:10,fontWeight:700}}>✓</span>}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontFamily:"'Lora','Georgia',serif",fontWeight:600,color:done?T.inkFaint:T.ink,textDecoration:done?"line-through":"none"}}>{task.label}</div>
        </div>
        <GBtn onClick={()=>setOpen(!open)} style={{fontSize:10,padding:"4px 12px"}}>{open?"▲ close":"▼ open"}</GBtn>
      </div>
      {open && <>
        <Divider/>
        <Lbl>This {isWeekly?"Week's":"Month's"} Prompt</Lbl>
        <div style={{fontSize:13,color:T.ink,lineHeight:1.85,background:T.linen,borderRadius:10,padding:"12px 14px",marginBottom:14}}>{task.prompt}</div>
        <AnswerBlock storageKey={storageKey} questionContext={ctx}/>
        <Divider/>
        <GBtn onClick={()=>setShowSample(!showSample)} style={{fontSize:11}}>{showSample?"▲ hide sample":"✓ see sample answer"}</GBtn>
        {showSample && <div style={{marginTop:12,fontSize:13,color:T.ink,lineHeight:1.85,background:T.forestLt,borderRadius:10,padding:"12px 14px"}}>{task.sample}</div>}
      </>}
    </FCard>
  );
}

function PracticeTab({dailyChecks, togDaily, weeklyChecks, togWeekly, monthlyChecks, togMonthly, seed, view, setView}) {
  const dayIdx = getDayIndex();
  const [activeDaily, setActiveDaily] = useState(null);
  const SECTIONS = {problem:<ProblemCard seed={seed}/>, product:<ProductCard seed={seed}/>, question:<QuestionCard seed={seed}/>};

  const views = [{id:"daily",label:"Daily"},{id:"weekly",label:"Weekly"},{id:"monthly",label:"Monthly"}];

  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {views.map(v=><Chip key={v.id} active={view===v.id} onClick={()=>setView(v.id)}>{v.label}</Chip>)}
      </div>

      {view==="daily" && <>
        <div style={{fontSize:13,color:T.inkSoft,marginBottom:18,lineHeight:1.7}}>Open each session, write your answer, get feedback, then mark it done.</div>
        {DAILY_TASKS.map(t=>(
          <div key={t.id}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px",borderRadius:12,cursor:"pointer",background:dailyChecks[t.id]?T.forestLt:T.card,border:`1.5px solid ${dailyChecks[t.id]?T.tanSoft:T.line}`,marginBottom:6,transition:"all .2s"}} onClick={()=>togDaily(t.id)}>
              <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${dailyChecks[t.id]?T.forest:T.line}`,background:dailyChecks[t.id]?T.forest:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {dailyChecks[t.id]&&<span style={{color:T.cream,fontSize:9,fontWeight:700}}>✓</span>}
              </div>
              <span style={{fontSize:9,color:T.inkFaint,fontFamily:"'Courier New',monospace"}}>{t.icon}</span>
              <span style={{fontSize:14,color:dailyChecks[t.id]?T.inkFaint:T.ink,textDecoration:dailyChecks[t.id]?"line-through":"none",flex:1}}>{t.label}</span>
            </div>
            {t.id!=="reading" && <div style={{marginLeft:6,marginBottom:8}}>
              <GBtn onClick={()=>setActiveDaily(activeDaily===t.id?null:t.id)} style={{fontSize:10,padding:"4px 12px",borderRadius:8}}>{activeDaily===t.id?"▲ close":"▼ open session"}</GBtn>
            </div>}
            {activeDaily===t.id && <div style={{marginBottom:14}}>{SECTIONS[t.id]}</div>}
          </div>
        ))}
      </>}

      {view==="weekly" && <>
        <div style={{display:"flex",gap:4,marginBottom:18}}>
          {DAYS.map((d,i)=>(<div key={i} style={{flex:1,textAlign:"center",padding:"7px 0",borderRadius:8,background:dayIdx===i?T.forestLt:T.card,border:`1.5px solid ${dayIdx===i?T.forest:T.line}`}}>
            <div style={{fontSize:10,color:dayIdx===i?T.forest:T.inkFaint,fontFamily:"'Courier New',monospace",fontWeight:dayIdx===i?700:400}}>{d}</div>
            {dayIdx===i&&<div style={{width:4,height:4,background:T.forest,borderRadius:"50%",margin:"3px auto 0"}}/>}
          </div>))}
        </div>
        <div style={{fontSize:13,color:T.inkSoft,marginBottom:16,lineHeight:1.7}}>One task per week. Each has a full guided prompt and sample answer.</div>
        {WEEKLY_TASKS.map(t=><TaskExpandCard key={t.id} task={t} done={!!weeklyChecks[t.id]} onToggle={()=>togWeekly(t.id)} storageKey={`weekly:${t.id}:${getWeekKey()}`} isWeekly={true}/>)}
      </>}

      {view==="monthly" && <>
        <div style={{fontSize:13,color:T.inkSoft,marginBottom:16,lineHeight:1.7}}>Monthly milestones. Each has a detailed prompt to guide real, portfolio-worthy work.</div>
        {MONTHLY_TASKS.map(t=><TaskExpandCard key={t.id} task={t} done={!!monthlyChecks[t.id]} onToggle={()=>togMonthly(t.id)} storageKey={`monthly:${t.id}:${getMonthKey()}`} isWeekly={false}/>)}
        <FCard style={{background:T.forestLt,border:`1.5px solid ${T.tanSoft}`,marginTop:8}}>
          <div style={{fontSize:14,fontFamily:"'Lora','Georgia',serif",fontWeight:700,color:T.forest,marginBottom:8}}>Your North Star</div>
          <div style={{fontSize:13,color:T.inkMid,lineHeight:1.8}}>Land a Product / Brand role at a startup where you own the product, shape the strategy, and build the brand from the ground up.</div>
          <div style={{marginTop:8,fontSize:11,color:T.inkFaint,fontStyle:"italic",fontFamily:"'Courier New',monospace"}}>Daily → weekly → monthly → hired.</div>
        </FCard>
      </>}
    </div>
  );
}

/* ─────────────────────────────────────────
   PROGRESS TAB
───────────────────────────────────────── */
function ProgressTab({scores, dailyChecks, weeklyChecks, monthlyChecks}) {
  const allScores = Object.values(scores||{}).flat();
  const avg = allScores.length ? (allScores.reduce((a,b)=>a+b,0)/allScores.length).toFixed(1) : null;
  const sessions = allScores.length;
  const dDone = DAILY_TASKS.filter(t=>dailyChecks[t.id]).length;
  const wDone = WEEKLY_TASKS.filter(t=>weeklyChecks[t.id]).length;
  const mDone = MONTHLY_TASKS.filter(t=>monthlyChecks[t.id]).length;

  const skillsSorted = SKILL_AREAS.map(s=>({
    ...s,
    avg:scores?.[s.id]?.length ? +(scores[s.id].reduce((a,b)=>a+b,0)/scores[s.id].length).toFixed(1) : null,
    sessions:scores?.[s.id]?.length||0
  })).sort((a,b)=>(a.avg||0)-(b.avg||0));

  return (
    <div>
      {/* Summary stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        {[
          {label:"Sessions",value:sessions||"—"},
          {label:"Avg Score",value:avg?`${avg}/10`:"—"},
          {label:"Today",value:`${dDone}/${DAILY_TASKS.length}`},
          {label:"This Week",value:`${wDone}/${WEEKLY_TASKS.length}`},
        ].map(s=>(
          <FCard key={s.label} style={{textAlign:"center",padding:"16px 10px"}}>
            <div style={{fontSize:28,fontFamily:"'Lora','Georgia',serif",fontWeight:700,color:T.forest}}>{s.value}</div>
            <div style={{fontSize:10,color:T.inkFaint,fontFamily:"'Courier New',monospace",marginTop:4,letterSpacing:1}}>{s.label.toUpperCase()}</div>
          </FCard>
        ))}
      </div>

      {/* Skill breakdown */}
      <FCard style={{marginBottom:14}}>
        <Lbl>Skill Breakdown</Lbl>
        {!sessions && <div style={{fontSize:13,color:T.inkSoft,lineHeight:1.75,padding:"10px 0"}}>Complete practice sessions and get AI feedback to populate your skill map.</div>}
        {skillsSorted.map(s=>(
          <div key={s.id} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <div>
                <span style={{fontSize:13,color:T.ink}}>{s.icon} {s.label}</span>
                <span style={{fontSize:10,color:T.inkFaint,fontFamily:"'Courier New',monospace",marginLeft:8}}>{s.sessions} sessions</span>
              </div>
              <span style={{fontSize:13,fontFamily:"'Courier New',monospace",fontWeight:700,color:!s.avg?T.inkFaint:s.avg>=7?T.forest:s.avg>=5?T.inkMid:"#a05050"}}>{s.avg||"—"}{s.avg?"/10":""}</span>
            </div>
            <div style={{background:T.linen,borderRadius:8,height:8,overflow:"hidden"}}>
              <div style={{width:`${s.avg?(s.avg/10)*100:0}%`,height:"100%",background:!s.avg?T.lineSoft:s.avg>=7?T.forest:s.avg>=5?T.tan:"#c09090",borderRadius:8,transition:"width .6s ease"}}/>
            </div>
          </div>
        ))}
      </FCard>

      {/* Insight box */}
      {sessions>0 && (
        <FCard style={{background:T.forestLt,border:`1.5px solid ${T.tanSoft}`}}>
          <Lbl color={T.forest}>Coaching Insight</Lbl>
          {(() => {
            const withData = skillsSorted.filter(s=>s.avg);
            if(!withData.length) return null;
            const low = withData[0], high = withData[withData.length-1];
            return <div style={{fontSize:13,color:T.inkMid,lineHeight:1.8}}>
              Your <strong style={{color:T.ink}}>{low.label}</strong> scores average <strong style={{color:"#a05050"}}>{low.avg}/10</strong> — this is your priority area. Dedicate your next 5 practice sessions specifically to this skill type.<br/><br/>
              Your strongest area is <strong style={{color:T.ink}}>{high.label}</strong> at <strong style={{color:T.forest}}>{high.avg}/10</strong> — maintain it, but don't over-index. Interviewers will probe your weaknesses.
            </div>;
          })()}
        </FCard>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   LEARN TAB
───────────────────────────────────────── */
function LearnTab({seed}) {
  const [idx, setIdx] = useState(seed % KNOWLEDGE.length);
  const k = KNOWLEDGE[idx];
  const key = `learn:${idx}:${getTodayKey()}`;
  const ctx = `skill:${k.category==="Metrics"?"metrics":k.category==="Strategy"?"startup":"product"}\nConcept: ${k.topic}\nExercise: ${k.exercise}`;

  return (
    <div>
      {/* Concept selector */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
        {KNOWLEDGE.map((kn,i)=>(
          <button key={i} onClick={()=>setIdx(i)} style={{width:34,height:34,borderRadius:"50%",border:`2px solid ${i===idx?T.forest:T.line}`,background:i===idx?T.forest:T.card,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,transition:"all .2s"}}>
            <span style={{filter:i===idx?"brightness(10)":"none"}}>{kn.icon}</span>
          </button>
        ))}
      </div>

      {/* Category + topic */}
      <div style={{marginBottom:4}}><Pill>{k.category}</Pill></div>
      <div style={{fontSize:22,fontFamily:"'Lora','Georgia',serif",fontWeight:700,color:T.ink,margin:"10px 0 6px",lineHeight:1.3}}>{k.topic}</div>

      <Divider/>

      {/* Concept */}
      <Lbl>The Concept</Lbl>
      <div style={{fontSize:14,color:T.ink,lineHeight:1.9,marginBottom:18}}>{k.concept}</div>

      {/* Apply */}
      <FCard style={{background:T.forestLt,border:`1.5px solid ${T.tanSoft}`,marginBottom:14}}>
        <Lbl color={T.forest}>How to Use This in an Interview</Lbl>
        <div style={{fontSize:13,color:T.inkMid,lineHeight:1.8}}>{k.apply}</div>
      </FCard>

      {/* Exercise + answer */}
      <FCard style={{marginBottom:14}}>
        <Lbl>Today's Exercise</Lbl>
        <div style={{fontSize:13,color:T.ink,lineHeight:1.8,background:T.linen,borderRadius:10,padding:"12px 14px",marginBottom:14}}>{k.exercise}</div>
        <AnswerBlock storageKey={key} questionContext={ctx} showImproved={false}/>
      </FCard>

      {/* In-depth sample answer */}
      <FCard style={{background:T.tanDim,border:`1.5px solid ${T.tanSoft}`}}>
        <Lbl color={T.inkMid}>In-Depth Sample Answer</Lbl>
        <div style={{fontSize:13,color:T.ink,lineHeight:1.9}}>{k.answer}</div>
      </FCard>

      <div style={{textAlign:"center",marginTop:20,fontSize:11,color:T.inkFaint,fontFamily:"'Courier New',monospace",letterSpacing:1}}>{idx+1} / {KNOWLEDGE.length}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ROOT APP
───────────────────────────────────────── */
export default function App() {
  const [tab,setTab]               = useState("home");
  const [practiceView,setPracticeView] = useState("daily");
  const [dailyChecks,setDailyChecks]   = useState({});
  const [weeklyChecks,setWeeklyChecks] = useState({});
  const [monthlyChecks,setMonthlyChecks]=useState({});
  const [scores,setScores]         = useState({});

  const todayKey = getTodayKey(), weekKey = getWeekKey(), monthKey = getMonthKey();
  const seed = getDaySeed();

  useEffect(()=>{
    (async()=>{
      const d=await safeGet(`daily:${todayKey}`);   if(d) setDailyChecks(d);
      const w=await safeGet(`weekly:${weekKey}`);   if(w) setWeeklyChecks(w);
      const m=await safeGet(`monthly:${monthKey}`); if(m) setMonthlyChecks(m);
      const s=await safeGet("skills:scores");       if(s) setScores(s);
    })();
  },[]);

  useEffect(()=>{
    const t=setInterval(async()=>{const s=await safeGet("skills:scores");if(s)setScores(s);},20000);
    return()=>clearInterval(t);
  },[]);

  const togDaily   = async(id)=>{const n={...dailyChecks,[id]:!dailyChecks[id]};setDailyChecks(n);await safeSet(`daily:${todayKey}`,n);};
  const togWeekly  = async(id)=>{const n={...weeklyChecks,[id]:!weeklyChecks[id]};setWeeklyChecks(n);await safeSet(`weekly:${weekKey}`,n);};
  const togMonthly = async(id)=>{const n={...monthlyChecks,[id]:!monthlyChecks[id]};setMonthlyChecks(n);await safeSet(`monthly:${monthKey}`,n);};

  const TABS = [
    {id:"home",     label:"Home",     icon:"⌂"},
    {id:"practice", label:"Practice", icon:"◈"},
    {id:"progress", label:"Progress", icon:"◎"},
    {id:"learn",    label:"Learn",    icon:"◆"},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.linen,fontFamily:"Georgia,'Times New Roman',serif",color:T.ink,maxWidth:560,margin:"0 auto",paddingBottom:85}}>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap" rel="stylesheet"/>
      <style>{`* { box-sizing: border-box; } textarea { font-family: Georgia,'Times New Roman',serif; } button { transition: opacity .15s; } button:active { opacity: .75; }`}</style>

      {/* TOP BAR */}
      <div style={{padding:"18px 20px 14px",borderBottom:`1px solid ${T.line}`,background:T.cream,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:17,fontFamily:"'Lora','Georgia',serif",fontWeight:700,color:T.ink,letterSpacing:-.3}}>groundwork</div>
          <div style={{fontSize:9,color:T.inkFaint,fontFamily:"'Courier New',monospace",letterSpacing:2,marginTop:1}}>STARTUP PREP JOURNAL</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[
            {l:"D",d:Object.values(dailyChecks).filter(Boolean).length,t:DAILY_TASKS.length},
            {l:"W",d:Object.values(weeklyChecks).filter(Boolean).length,t:WEEKLY_TASKS.length},
          ].map(p=>(
            <div key={p.l} style={{background:p.d===p.t?T.forest:T.tanDim,border:`1.5px solid ${p.d===p.t?T.forest:T.line}`,borderRadius:20,padding:"3px 10px",display:"flex",gap:4,alignItems:"center"}}>
              <span style={{fontSize:10,fontFamily:"'Courier New',monospace",color:p.d===p.t?T.cream:T.inkSoft,fontWeight:700}}>{p.l} {p.d}/{p.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{padding:"20px 20px 10px"}}>
        {tab==="home" && <HomeTab dailyChecks={dailyChecks} weeklyChecks={weeklyChecks} monthlyChecks={monthlyChecks} scores={scores} seed={seed} setTab={setTab} setPracticeView={setPracticeView}/>}
        {tab==="practice" && <PracticeTab dailyChecks={dailyChecks} togDaily={togDaily} weeklyChecks={weeklyChecks} togWeekly={togWeekly} monthlyChecks={monthlyChecks} togMonthly={togMonthly} seed={seed} view={practiceView} setView={setPracticeView}/>}
        {tab==="progress" && <ProgressTab scores={scores} dailyChecks={dailyChecks} weeklyChecks={weeklyChecks} monthlyChecks={monthlyChecks}/>}
        {tab==="learn" && <LearnTab seed={seed}/>}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:560,background:T.cream,borderTop:`1px solid ${T.line}`,display:"flex"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"12px 0 10px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,borderTop:`2px solid ${tab===t.id?T.forest:"transparent"}`,transition:"border-color .2s"}}>
            <span style={{fontSize:16,fontFamily:"'Courier New',monospace",color:tab===t.id?T.forest:T.inkFaint}}>{t.icon}</span>
            <span style={{fontSize:9,color:tab===t.id?T.forest:T.inkFaint,fontFamily:"'Courier New',monospace",letterSpacing:1,fontWeight:tab===t.id?700:400}}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
