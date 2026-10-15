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

**Key folders:** `components/` (Nav, StarBackground, CardBorderTrace, DualSlider), `context/AuthContext.tsx` (user, profile, settings), `lib/events.ts` (static event data and eras), `lib/supabase.ts` (client), `types/` (shared types).

## Redesign rules

- We're redesigning the UI on the `redesign` branch. Visual and UX changes only unless the user says otherwise.
- Don't change Supabase queries, auth logic, database schema, or the Claude API route logic without asking first.
- Work one page or component at a time, and stop after each one so the user can review.
- After UI changes, start the dev server and use Playwright to screenshot the page and check that the main flows still work. Report anything broken.
- Use the impeccable skill for design decisions and the Emil skills for animation and interaction details.
