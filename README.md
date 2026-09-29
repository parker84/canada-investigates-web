# Canada Investigates — web

Mobile-first React + TypeScript + Vite frontend for community research across Canada. Companion: [backend](https://github.com/parker84/canada-investigates-backend). Intended domain: CanadaInvestigates.dev.

## Run locally

Requires Node.js 22+ and the backend running on port 8000.

```sh
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the backend. Start the backend with `SEED_CASES=true` to explore the three sourced real cases, and `ENABLE_SUBMISSIONS=true` to test private submissions locally.

```sh
npm run build
npm run preview
```

For deployment or the production preview, set `VITE_API_URL` to the backend origin **before building**, and allow the web origin in backend `CORS_ORIGINS`. The development proxy does not apply to deployed static files. Deploy the generated `dist/` folder to a static host. Hash routes work without a server rewrite rule.

## First working slice

- Responsive discovery page with the recovered charcoal/red investigative design direction.
- Case archive with live search, status and province filters, loading/error/empty states.
- Case details with explicit uncertainty, source library, and timeline.
- Validated submission form with server success/error feedback.
- Approach page and links to the public source code.

The starter cases cover real reported incidents discussed in Keep Canada Weird episodes 231–232. Each file includes dated status, sources, attributed claims, and official police contact details. “Active” means an unresolved research file; it does not assert current police activity. This project is independent of the podcast and police. No invented community metrics or vote counts are presented as real. Editorial artwork is generated and bundled locally; it is illustrative, not source evidence. No runtime image API is required. Google Fonts are optional with system fallbacks.

## Interactive discovery

The landing page includes a source-reading scene for the Winnipeg Pokémon shop break-in with three inspectable notes, keyboard-accessible markers, exploration progress, and a link to the related case. Subtle film grain, section reveals, a reading-progress line, and a slow hero shot support the investigative mood. Motion is disabled for `prefers-reduced-motion`. The desktop scene includes a pointer-following light; mobile uses tap targets.

## Next

Authentication, moderation, evidence uploads, discussions, follows, real geographic exploration. These features are not represented as working controls in this slice. The frontend currently uses public read endpoints and an opt-in submission API. No production deployment has been made.

Design context was recovered from the “Plan OSINT Platform” conversation and its supplied reference image. Prior starter ZIPs were unavailable, so this implementation was recreated from the agreed architecture and reference.
