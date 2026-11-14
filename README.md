# Review Pulse

A landing-page concept for a human-in-the-loop review triage assistant.
The product preview uses illustrative data; it is not connected to Google,
Gemini, or a backend.

## Getting started

Requires Bun 1.4.4 and Node.js 20.9 or later.

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Run `bun run lint` and
`bun run build` to validate changes.

## UI foundation

The app uses Next.js, React, Tailwind CSS, shadcn/ui's neutral theme, and
Motion. Theme colors are CSS variables in `src/app/globals.css`; the
landing-page layout is in `src/app/landing.css`. The Aceternity UI registry is
configured in `components.json` so components can be added with the shadcn
CLI when needed; no Aceternity component is used in this initial page.
