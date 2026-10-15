# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curious history fans: general-public readers who enjoy history and "what if" questions. They arrive out of curiosity, on a desktop or laptop, for sessions of reading and asking, and come back to see how a changed event ripples forward. Students and teachers are not the primary audience (not confirmed as secondary either).

## Product Purpose

Diverge lets a person pick a real historical event, ask a "what if" question, and read how the world would have changed, shown next to what actually happened. Each answer carries a divergence score, a world mood and key facts. Questions can be chained so the alternate world builds on itself, and a final summary compares the alternate world with ours. Success is a reader who finishes a chain of what-ifs and wants to save it or start another.

## Positioning

The alternate timeline is always shown against the real one, with the divergence measured, and the AI (DIVERGE-HISTORIAN) is constrained to grounded history: it refuses non-history questions, avoids invented statistics and fabricated quotes, and flags uncertainty. A generic chatbot or a free-form alt-history story generator does not do this.

## Operating Context

Core flow: Explore (or home) to pick an event, then `/diverge/[sessionId]` for the what-if chat and split real-vs-diverged view, then an optional summary and, when signed in, saved sessions. Guests can use the core flow without an account; sessions, profile and settings need sign-in (Supabase auth). Responses come from the Claude API and currently take roughly 30 to 40 seconds each.

## Capabilities and Constraints

- Static catalogue of historical events in `lib/events.ts` (title, year, era, short and full description, real facts). Event imagery is currently a mix of local and stock images and is unreliable.
- AI response shape: narration paragraph, key facts with explanations, world mood (STABLE, TENSE, CRITICAL, AT WAR, CATASTROPHIC, REBUILDING, FLOURISHING), divergence score, year, reliability notes, uncertainty level.
- Existing user settings (stored per signed-in user in Supabase `user_settings`): theme, language, accent colour, font size, AI response style, AI plausibility, AI tone, confidence-level and historian's-note toggles, default era. Guests have no persisted settings. Only the response style is currently sent to the API; plausibility and tone are saved but unused.
- Planned: response length (short / medium / long) and depth (simple / in-depth), which must change what the API returns. The same prompt change wires the saved tone and plausibility settings, adds a `suggestions` field (2-3 clickable next "What if..." questions), and requires each answer's year to be at or after the previous answer's year.
- Planned diverge layout (Option B, chosen from mockups): a chat thread of question and answer bubbles plus a sticky world panel. Each answer collapses and expands from its header (latest open, earlier ones collapsed, several can be open), and each fact bullet inside an answer expands independently. The world panel holds the divergence gauge with year, mood and confidence chips (no per-question bubble chart), suggested next questions that fill and submit the input, "Meanwhile in real history" (real events around the current timeline year, from existing event data), and "Unanswered history" (real events after the current year that the timeline hasn't addressed, clickable to ask about them). Timeline dots sit in a bottom dock with hover stat cards and click-to-rewind with a 6-second Undo toast (Supabase is updated only after the toast expires).
- Constraint: Diverge is a desktop-only app. Supported viewports are 1024px and up, from a small window to fullscreen, and every page must scale cleanly across that range with no fixed widths leaving big gaps or cutting content off. Below 1024px the app shows a "Diverge is built for desktop" message instead of the page. No mobile or tablet layouts are designed or maintained.
- Constraint: the `/diverge/[sessionId]` layout may be redesigned in a bubbly, interactive way, but it keeps the top header/nav (the shared `Nav`, with links to all the pages). A mockup is shown and approved before it is built. Every other page keeps its original layout (as in the code at the start of the redesign), apart from responsive scaling fixes.
- Constraint: the work on the `redesign` branch is visual and UX only. Supabase queries, auth logic, schema and the Claude API route logic are not changed without asking. Approved so far: the `max_tokens` and `mapChanges` fix in `api/diverge` (done), wiring response length and depth into the `api/diverge` prompt, and updating the saved `sessions` row when the user rewinds the timeline.
- Open decision: how the voice choice below is exposed in the UI and wired to the API.

## Brand Commitments

- Name: Diverge. Existing hero line: "History had a plan. You don't have to follow it."
- Personality of the interface: bubbly, interactive and alive-feeling, with smooth, quick motion that respects reduced-motion preferences. Confirmed by the user.
- Voice: the user can choose between a **Serious historian** voice (measured, evidence-first, flags uncertainty) and a **Dramatic storyteller** voice (cinematic and tense, still grounded). Both stay grounded in documented history. Not decided: which is the default.

## Evidence on Hand

- Real JFK session content to reuse in design work: event record in `lib/events.ts` and one live what-if response and summary captured during the audit (Kennedy survives through 1968).
- Event images at `public/events/` (some events only); no usable imagery for most events. No testimonials, user counts or press exist and none should be invented.
- Builder: Adi Sharma, CS student at the University of Delaware (from the About page).

## Product Principles

1. Real versus alternate is the product: the comparison is always legible, and divergence is visible, not just stated.
2. Grounded beats dramatic: speculation is labelled, uncertainty is shown, and nothing in the interface implies certainty the AI does not have.
3. The reader's question stays central: what they asked, and what changed because of it, is never lost.
4. Waiting is part of the experience: responses are slow, so the interface must make the wait understandable.
5. It must feel authored, polished and alive as a showcase piece on desktop: bubbly and interactive, but never slow or noisy.
6. Users stay in control of their timeline: they can revisit any point, and rewinding (which discards later questions) always asks first.

## Accessibility & Inclusion

No specific requirement was stated. Baseline: WCAG AA contrast, visible keyboard focus, and reduced-motion support, designed for desktop viewports of 1024px and up. Long-form reading comfort matters because the core content is paragraphs.
