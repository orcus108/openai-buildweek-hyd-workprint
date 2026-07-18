# Workprint

Workprint is a private story inbox for builders. It reconstructs a timeline from real work artifacts, finds the moments worth sharing, asks the builder for the perspective only they can provide, and produces one evidence-grounded story.

This repository is the demo-ready MVP built for the OpenAI Build Week Community Hackathon in Hyderabad.

## Demo

[Watch the Workprint product demo](./demo%20vid.mp4)

## The product loop

1. Add a Git log, Codex export, work notes, and optional screenshots.
2. GPT-5.6 reconstructs a chronological timeline.
3. Workprint finds exactly three narrative moments and explains why each matters.
4. The builder chooses one and answers two specific questions.
5. Workprint writes one editable build-in-public story.
6. Material factual claims reveal the commit, session excerpt, screenshot, or note that supports them.

The interface starts with detected moments, not a blank prompt. The model may infer that an event is interesting, but it may not invent what the builder felt or learned.

## Run locally

Requirements:

- Node.js 20.9 or newer
- npm
- An OpenAI API key for live analysis (optional for the curated demo)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To use live analysis, add this to `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6-sol
```

The primary demo does not require a key. Click **Watch it find this story** to run the deterministic recursive demo through the same interface states as live analysis.

## Model integration

Workprint uses the OpenAI Responses API with:

- `gpt-5.6-sol` for high-quality narrative reconstruction and editing
- explicit `medium` reasoning effort
- strict JSON Schema output for timelines, moments, questions, claims, and evidence links
- explicit low-detail image inputs for optional screenshots
- a privacy-preserving safety identifier per browser session
- a 90-second request timeout and clear error recovery

The prompts enforce the product boundary:

- use supplied facts only
- never fabricate feelings, lessons, metrics, dates, reactions, or outcomes
- ask the builder for private interpretation
- cite only evidence IDs that exist in the source tray
- generate one strong story rather than variants

## Architecture

```text
Browser
  Source tray
      -> /api/analyze
          -> GPT-5.6 structured timeline + 3 moments
      -> Story Inbox
      -> two-question reflection
      -> /api/draft
          -> GPT-5.6 structured story + claim citations
      -> Story Studio + proof inspector
```

Important files:

- `components/workprint-app.tsx`: complete product state machine and UI
- `app/api/analyze/route.ts`: evidence-to-timeline and moment detection
- `app/api/draft/route.ts`: reflection-to-story editing
- `lib/types.ts`: shared evidence, moment, timeline, and story contracts
- `lib/sample-data.ts`: deterministic recursive demo
- `HACKATHON_DEMO.md`: presentation script and recovery plan

All product state stays in the browser for this MVP. There is no database, account system, background collector, or publishing integration.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
npm audit
```

The demo flow has also been verified in a real headless Chromium session at desktop and mobile viewports, in dark and light system themes. Captures are stored in `artifacts/`.

## Scope choices

Included:

- paste and file-based evidence ingestion
- optional screenshot input for live multimodal analysis
- chronological reconstruction
- exactly three ranked story moments
- two human reflection questions
- one editable story
- claim-level proof inspection
- Markdown export and clipboard copy
- deterministic offline demo
- loading, empty, disabled, and error states

Intentionally excluded from the hackathon MVP:

- accounts and cloud persistence
- GitHub, Figma, Linear, or Codex OAuth collectors
- autonomous publishing
- analytics and audience-response learning
- browser extension or desktop ambient observer

Those belong after the core detection to reflection to proof loop earns trust.
