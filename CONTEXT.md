# Workprint — Project Context

Last updated: 18 July 2026

This is the canonical handoff for Workprint. A new chat or contributor should read this file before changing the product, copy, flow, or visual design.

## One-line product

**Workprint finds things worth sharing in a builder's existing work and turns them into editable, evidence-grounded posts.**

The product should feel like posting without doing extra work. It watches the work the builder already does, finds the interesting moments, and gets them to a publishable draft in a few clicks.

## The user problem

Builders have plenty to share, but usually do not:

- they are too close to the work to notice what is interesting;
- reconstructing what happened takes effort;
- a blank composer makes them decide both what to say and how to say it;
- generic AI writing tools produce polished but untrustworthy "AI slop";
- maintaining another project log defeats the point.

Workprint removes that mental overhead. The intended experience is: open the app, see three things worth sharing, choose one, optionally add a personal detail, edit if needed, and post.

## Product thesis

AI has made building easier and more abundant. Distribution and storytelling are becoming the scarce parts.

The interesting story is usually already present in commits, Codex sessions, notes, and product decisions. Workprint should notice it without requiring the user to maintain a separate content workflow.

The key human/AI boundary is:

- Workprint may infer **what changed** and **why the change could be interesting** from evidence.
- Workprint must not invent **why the builder cared**, how they felt, what they learned, or what motivated them.
- When that human perspective would improve the post, Workprint asks one optional, specific question.

## Finalized user journey

### 1. Onboarding

The first screen introduces the outcome, not the setup:

> Your next post is already in your work.  
> Workprint finds it for you.

GitHub and Codex appear as already detected sources. The user confirms once with **Connect and continue**. There is no project creation, project description, manual log, or content prompt.

### 2. Catch-up

A brief transition says:

> Got it. I'm catching up.  
> Looking through today's work.

This communicates that Workprint is doing the work, not asking the user to do it.

### 3. Things worth sharing

Workprint shows exactly three editorially equal suggestions under **Things worth sharing.**

Each suggestion has:

- a number;
- a clear title;
- one sentence explaining the underlying evidence;
- an **Open draft** action.

The suggestions deliberately do not show platform recommendations. The builder chooses based on the idea, not an algorithmic score.

### 4. Draft

Opening a suggestion reveals:

- whether it is recommended for X or LinkedIn;
- platform logo controls for switching between versions;
- one editable post surface;
- character count for X or word count for LinkedIn;
- a link to the sources behind the claims;
- one optional personalization question;
- lightweight edits: **Shorten**, **Try another angle**, and **Ask Workprint…**;
- a primary **Post on X** or **Post on LinkedIn** action.

The entire draft is one content-editable surface. There is no separate headline editor. The post uses one consistent font size so it resembles the destination platform rather than a blog article.

### 5. Personalization

The hierarchy is intentionally quiet:

- eyebrow: **MAKE IT YOURS · Optional**;
- one contextual question, styled like the post body;
- a single-line answer field with “A sentence is enough”;
- **Use it** incorporates the answer into the draft.

This is optional. A user can ignore it and post immediately.

### 6. Publishing

- **Post on X** opens an X compose intent with the text populated and also copies the draft.
- **Post on LinkedIn** opens LinkedIn and copies the draft so it is ready to paste.
- Media upload is intentionally not in Workprint for the MVP; users can add images or video on the social platform.

## Demo content

The current demo finds three moments in Workprint's own development:

1. **The story inbox replaced the blank composer.**  
   A commit, a Codex session, and a product note point to the same product change.

2. **Evidence now survives every rewrite.**  
   Generated claims can be traced back to the work that produced them.

3. **The onboarding lost three screens.**  
   GitHub and Codex are detected once, then Workprint stays out of the way.

Each moment has a conversational X draft, a more developed LinkedIn draft, an alternate opening, one personalization question, and evidence-linked claims.

## Design direction — finalized

The visual language is simple, editorial, warm, and product-first: Apple/OpenAI/Codex restraint without looking unfinished.

Rules:

- light mode only;
- warm cream canvas (`#f8f5ed`), black ink, restrained warm greys;
- red (`#e5483f`) only as a brand/signal accent;
- no yellow;
- no gradients;
- no decorative shadows;
- no unnecessary cards or boxes;
- the post is always the strongest visual element on the draft page;
- suggestions are an open editorial grid, not three rounded cards;
- black pill buttons are reserved for the primary action;
- quiet navbar: Workprint mark/name on the left, circular profile control on the right;
- DM Sans typography;
- X, LinkedIn, GitHub, and Codex/OpenAI logos appear where relevant;
- mobile layouts preserve hierarchy and avoid horizontal overflow.

Do not reintroduce dashboards, analytics, sidebars, dense navigation, project-management UI, dark mode, or generic AI gradients.

## Copy principles

Workprint copy should be conversational enough to read aloud.

- Lead with what the user's life becomes, not implementation details.
- Prefer short, literal sentences.
- Avoid “unlock,” “supercharge,” “effortlessly,” “content engine,” “authentic voice,” and other generic AI/product language.
- Avoid wannabe-profound one-liners.
- Posts should sound like a real developer explaining what happened to another developer.
- Mild humour and honest specifics are better than polished inspiration.
- Do not call the product's output “content” when “post,” “draft,” “idea,” or “thing worth sharing” is clearer.
- Refer to Twitter as **X** in visible action copy. The accessible label may say **X (formerly Twitter)** for clarity.

## Current implementation state

### Shipped

- The finalized redesign is the main app at `/`.
- Public GitHub repository: <https://github.com/orcus108/openai-buildweek-hyd-workprint>
- Main branch contains the full onboarding → catch-up → suggestions → draft flow.
- Three deterministic demo moments with separate X and LinkedIn drafts.
- Unified editable post surface.
- Optional personalization question.
- Shorten, alternate-angle, and simulated Workprint rewrite interactions.
- Platform recommendation shown only after a suggestion is opened.
- X and LinkedIn posting handoff.
- Claim/evidence drawer using sample GitHub, Codex, and note evidence.
- Settings drawer with GitHub/Codex status plus OpenRouter/Google AI Studio demo-key fields stored in local storage.
- Responsive desktop/mobile CSS.
- TypeScript and ESLint checks pass.

### Important integration truth

The current polished interface is a **deterministic, frontend-driven hackathon demo**. Its three moments, drafts, rewrite behaviour, and source mappings are defined in `components/workprint-app.tsx`.

The repository also contains real structured generation routes:

- `POST /api/analyze` reconstructs a timeline and returns exactly three evidence-linked moments.
- `POST /api/draft` generates one evidence-linked build-in-public story from a selected moment and builder answers.

Those routes use the OpenAI Responses API through `lib/openai.ts`, but the redesigned main interface is **not currently wired to call them**. A future implementation should connect the new low-friction interface to these routes without restoring the old manual source-tray workflow.

The API provider controls in the settings drawer are currently demo UI only. The backend currently reads OpenAI configuration from server environment variables; it does not consume the browser-stored OpenRouter or Google AI Studio keys.

### Not yet built

- real automatic GitHub/Codex detection or OAuth;
- background/ambient collection;
- persistence, accounts, or cross-device history;
- live connection between the redesigned UI and `/api/analyze` or `/api/draft`;
- production OpenRouter/Google AI Studio routing;
- real LinkedIn text prefill (LinkedIn does not offer the same simple intent URL as X);
- analytics or learning from published-post performance;
- deployed production URL documented in this repository.

## Technical map

- `app/page.tsx` — mounts the main Workprint app.
- `components/workprint-app.tsx` — current demo state machine, content, and all principal interactions.
- `app/globals.css` — finalized visual system and responsive layouts.
- `app/api/analyze/route.ts` — structured evidence analysis endpoint.
- `app/api/draft/route.ts` — structured story drafting endpoint.
- `lib/openai.ts` — OpenAI Responses API helper.
- `lib/sample-data.ts` — evidence and legacy deterministic analysis data.
- `lib/types.ts` — shared evidence, timeline, moment, and draft types.
- `HACKATHON_DEMO.md` — older demo script; useful for thesis, but its click labels and screen sequence predate the final redesign.
- `README.md` — also describes the older, higher-friction product loop and should be updated before treating it as canonical.
- `design-lab/` — UI exploration sandbox. The official product is now `/`, not the sandbox.

Stack: Next.js 16, React 19, TypeScript, Tailwind/PostCSS, Phosphor icons, and the OpenAI Responses API.

## Pitch-deck spine

A clean deck can follow this sequence:

1. **Problem** — builders are doing interesting work but posting still requires a second job: noticing, reconstructing, writing, and formatting.
2. **Insight** — the story already exists in the exhaust of the work: commits, Codex sessions, and decisions.
3. **Product** — Workprint turns that work into three things worth sharing, then one editable, evidence-grounded post.
4. **Demo** — connect once → choose a moment → optionally personalize → post.
5. **Trust** — it can infer what changed, but asks rather than inventing why the builder cared; factual claims keep their sources.
6. **Why now** — AI makes building abundant, so distribution and credible storytelling become more valuable.
7. **Vision** — an ambient documentary and communications layer for everyone who builds.

The best concise pitch is:

> Builders already do the interesting work. Workprint notices what is worth sharing and gets it ready to post.

## Next priorities

1. Update `README.md` and `HACKATHON_DEMO.md` to match the finalized interface.
2. Wire the redesigned flow to live analysis/drafting without adding manual setup.
3. Decide the actual collection architecture for GitHub and Codex.
4. Add persistence so previously found moments do not disappear.
5. Add an intentional fallback when evidence is insufficient.
6. Verify the deployed build in a real browser and document the live URL.

## Non-negotiable product constraint

The user should spend as few mental calories as possible.

If a proposed feature makes the user create projects, maintain logs, explain their work before Workprint has tried to understand it, or manage another workflow, it is probably moving the product backwards.
