# Canada Investigates — web

Mobile-first React + TypeScript + Vite frontend for community research across Canada. Companion: [backend](https://github.com/parker84/canada-investigates-backend). Intended domain: CanadaInvestigates.dev.

## Run locally

Requires Node.js 22+ and the backend running on port 8000.

```sh
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the backend. Start the backend with `SEED_DEMO=true` to explore the four fictional cases, and `ENABLE_SUBMISSIONS=true` to test private submissions locally.

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

All sample stories are clearly labeled fictional. No invented community metrics or vote counts are presented as real. Decorative artwork is original CSS; no stock-image or image API dependency. Google Fonts are optional with system fallbacks.

## Next

Authentication, moderation, evidence uploads, discussions, follows, real geographic exploration, and sourced editorial case data. These features are not represented as working controls in this slice. The frontend currently uses public read endpoints and an opt-in submission API. No production deployment has been made.

Design context was recovered from the “Plan OSINT Platform” conversation and its supplied reference image. Prior starter ZIPs were unavailable, so this implementation was recreated from the agreed architecture and reference.
