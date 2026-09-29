# Canada Investigates — web

Mobile-first React + TypeScript + Vite frontend for community research across Canada. Companion: [backend](https://github.com/parker84/canada-investigates-backend). Intended domain: CanadaInvestigates.dev.

## Run locally

Requires Node.js 22+ and the backend running on port 8000.

```sh
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the backend. Start the backend with `SEED_CASES=true AUTH_DEV_MODE=true ENABLE_SUBMISSIONS=true` to explore the cases and test accounts. Local sign-in displays a one-time link after you enter an email; SMTP is required outside local development.

```sh
npm run build
npm run preview
```

For deployment or the production preview, set `VITE_API_URL` to an API origin under the same site (for example, `https://api.canadainvestigates.dev`) **before building**, and allow the web origin in backend `CORS_ORIGINS`. Same-site hosting lets the secure session cookie work with the web app. The development proxy does not apply to deployed static files. Deploy the generated `dist/` folder to a static host. Hash routes work without a server rewrite rule.

## First working slice

- Responsive discovery page with the recovered charcoal/red investigative design direction.
- Case archive with live search, status and province filters, loading/error/empty states.
- Case details with explicit uncertainty, source library, and timeline.
- Validated submission form with server success/error feedback.
- Email-link sign-in, contributor profile, saved draft through sign-in, and personal contribution status.
- Case discussions for questions, public sources, and corrections. Every contribution waits for an editor; approved posts can be reported.
- Editorial queue for publication decisions and reports.
- Approach page and links to the public source code.

The starter cases cover real reported incidents discussed in Keep Canada Weird episodes 231–232. Each file includes dated status, sources, attributed claims, and official police contact details. “Active” means an unresolved research file; it does not assert current police activity. This project is independent of the podcast and police. No invented community metrics or vote counts are presented as real. Editorial artwork is generated and bundled locally; it is illustrative, not source evidence. No runtime image API is required. Google Fonts are optional with system fallbacks.

## Interactive discovery

The landing page includes a source-reading scene for the Winnipeg Pokémon shop break-in with three inspectable notes, keyboard-accessible markers, exploration progress, and a link to the related case. Subtle film grain, section reveals, a reading-progress line, and a slow hero shot support the investigative mood. Motion is disabled for `prefers-reduced-motion`. The desktop scene includes a pointer-following light; mobile uses tap targets.

## Next

Evidence uploads, follows, and geographic exploration remain future work. No production deployment has been made.

Design context was recovered from the “Plan OSINT Platform” conversation and its supplied reference image. Prior starter ZIPs were unavailable, so this implementation was recreated from the agreed architecture and reference.

## Editorial language

Use Canadian English in all interface and editorial copy (for example, colour, centre, neighbourhood, behaviour, and licence as a noun). Preserve proper names, quoted source titles, API fields, and CSS keywords. Lead with “Real cases. You can help.” and keep “Help solve real Canadian crimes” / “Browse active cases” as the primary invitation.
