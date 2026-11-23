@AGENTS.md

## Project overview

Diverge is an alternate-history app: pick a real historical event, ask "what if" questions, and Claude (as "DIVERGE-HISTORIAN") narrates how the world changes, with a divergence score, world mood, key facts and a final timeline summary.

**Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 plus heavy inline styles and CSS variables (`app/globals.css`), `motion` for animation, Supabase (auth, Postgres, avatar Storage), `@anthropic-ai/sdk`.

**Routes (`app/`):**
- `/` landing page with hero and featured events
- `/explore` browse all events, filter by era and year range
- `/diverge/[sessionId]` main experience: what-if chat, mood/divergence/key-facts panels, saved to Supabase
- `/sessions` the user's saved sessions, sortable
- `/profile` username, avatar upload, password change
- `/settings` theme, accent colour, font size, language, AI style/tone options
- `/about` project explainer, scroll animations
- `/auth` sign in / sign up

**API routes:** `api/diverge` (what-if analysis, large system prompt, JSON output), `api/summary` (timeline summary and real-vs-alternate comparison table), `api/auth/signup` (creates user and profile row).

**Key folders:** `components/` (Nav, StarBackground, CardBorderTrace, DualSlider), `context/AuthContext.tsx` (user, profile, settings), `data/events.json` (the one source of event data; run `npm run build:events` after editing it, which writes `lib/eventIndex.json`, `public/event-data/<id>.json` and card thumbnails), `lib/events.ts` (the small event list, eras and filters), `lib/eventDetail.ts` (loads an event's long text on demand), `lib/supabase.ts` (client), `types/` (shared types).

## Redesign rules

- Goal: make the UI polished, bubbly, interactive and alive-feeling, with smooth motion that doesn't feel slow. Visual and UX changes only unless the user says otherwise.
- Diverge works on desktop and on phones (the user asked for mobile support, so the old "desktop-only, show a message below 1024px" rule is gone). Desktop: 1024px and up, from a small window to fullscreen, with no fixed widths that leave big empty gaps or cut content off; verify at 1024, 1280, 1440 and 1920px. Phones: 360 to 430px wide, verified at 390px; tablet widths in between just have to not break. One layout per page that adapts with CSS (the phone rules live in one `@media (max-width: 820px)` block at the end of `globals.css`, plus per-page rules); the desktop look must not change when adding phone rules. Touch rules: no hover-only features, inputs at 16px or more, tap targets at least 40px, use pointer events (not mouse events) for drags, respect safe-area insets on fixed bars.
- Layout changes are allowed on `/diverge/[sessionId]` and it should be redesigned in a bubbly, interactive way, but it keeps the top header/nav (the shared `Nav`, with links to all the pages). Show a mockup screenshot and get approval before building the new layout for real.
- Every other page keeps its original layout, as it exists in the code at commit `f07b07f`, apart from responsive scaling fixes.
- Motion: use the Emil skills. Keep animation fast and purposeful, never animate keyboard-initiated actions, and respect `prefers-reduced-motion` (keep opacity and colour changes, drop movement).
- Use the impeccable skill for design decisions and the Emil skills for animation and interaction details.
- Don't change Supabase queries, auth logic, database schema, or the Claude API route logic without asking first. Approved so far: the `max_tokens` and `mapChanges` fix in `api/diverge` (done); wiring response length and depth (and the existing tone and plausibility settings) into the `api/diverge` prompt; adding a `suggestions` field (2-3 next "What if..." questions) to its response; making the prompt keep each answer's year at or after the previous answer's year; updating the saved Supabase `sessions` row when the user rewinds the timeline. Anything beyond those still needs approval.
- Work in chunks. Each chunk gets its own commit, and stop after each one so the user can test.
- After UI changes, start the dev server and use Playwright to screenshot the page at 1440px, and at 1024, 1280, 1920px and 390px (phone) when layout could be affected, and check that the main flows still work. Report anything broken.
