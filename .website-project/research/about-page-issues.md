# About page issue report

Date: 2026-11-25  
Source: live HTML fetched from https://gather.nexus/about/  
Local file: `about/index.html`  
No names, biographies, or testimonials were invented.

## Team cards

The live page contains **three separate team cards**, all heading **Alexa**, with different job lines:

| Card | Name as published | Job line as published |
| --- | --- | --- |
| 1 | Alexa | Dev team. Our ideas into action man. Busy helping clients. |
| 2 | Alexa | Marketing head. Startup tsar. Growth hacker. |
| 3 | Alexa | Marketing. King of copywriting. Loves design. |

These are three blocks in the markup, not one card repeated by a slider. There are **no photos** on the cards.

Local About keeps this live text unchanged and shows a `review-flag` asking for real names or removal.

## Testimonial

The live slider has **four slots**. All four use the same quote and attribution:

- Name: **David Mitchell**
- Role: **CFO at Directly Energy**
- Quote starts: “Managing multiple entities used to be a challenge…”

The person and company are **not verified**. Local About shows the quote **once** and adds `review-flag-inline`: “Shown once. The live page repeats this same quote in four slider slots.”

## What we did not do

- Did not invent replacement names.
- Did not invent biographies or photos.
- Did not invent additional testimonials.
- Did not remove the review flags.

## Recommended client action

1. Confirm the three team member names and job titles, or ask to remove the block.
2. Confirm whether the David Mitchell / Directly Energy quote is real and should appear once, four times, or not at all.
