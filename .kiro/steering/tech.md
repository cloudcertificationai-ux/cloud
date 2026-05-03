# Tech Stack

Both `cloud_website` and `cloud` are Next.js applications sharing the same PostgreSQL database via Prisma.

## Shared Stack
- **Framework:** Next.js 16.1.1 (App Router)
- **Runtime:** React 19, TypeScript 5
- **Styling:** Tailwind CSS 4 (cloud_website), Tailwind CSS 3 (cloud)
- **Database ORM:** Prisma 7 with PostgreSQL (`@prisma/adapter-pg`)
- **Auth:** NextAuth v4 with `@next-auth/prisma-adapter`
- **Media Storage:** Cloudflare R2 via `@aws-sdk/client-s3` (S3-compatible)
- **Queue/Workers:** BullMQ + ioredis (Redis-backed job queues for transcoding, email, sync)
- **Deployment:** Vercel

## `cloud_website` — Additional Libraries
- `stripe` / `@stripe/stripe-js` — payments
- `hls.js` — HLS video playback
- `@headlessui/react`, `@heroicons/react` — UI primitives
- `@next/mdx` — MDX blog support
- `next-sitemap` — sitemap generation
- `@vercel/analytics`, `@vercel/speed-insights` — observability

## `cloud` (Admin) — Additional Libraries
- `@dnd-kit/core`, `@dnd-kit/sortable` — drag-and-drop curriculum builder
- `@tanstack/react-query` — server state management
- `@tanstack/react-table` — data tables
- `react-hook-form` + `zod` — form validation
- `zustand` — client state
- `recharts`, `chart.js` — analytics charts
- `bcryptjs` — password hashing

## Testing
- **Unit/Integration:** Jest 30 + `@testing-library/react`
- **Property-Based:** `fast-check` (cloud_website only)
- **E2E:** Playwright (cloud_website only)
- **Mocks:** `__mocks__/` directory for next-auth, jose, openid-client

## Common Commands

### `cloud_website` (run from `cloud_website/`)
```bash
npm run dev              # Dev server on port 3000
npm run build            # Production build (runs type-check first)
npm run start            # Production server
npm run lint             # ESLint
npm run type-check       # tsc --noEmit
npm test                 # Jest unit tests
npm run test:coverage    # Jest with coverage
npm run test:e2e         # Playwright E2E tests
npm run db:seed          # Seed database
npm run db:reset:dev     # Reset dev database (preserves admins)
npm run worker           # Start transcode worker
npm run workers          # Start all workers
```

### `cloud` admin panel (run from `cloud/`)
```bash
npm run dev              # Dev server on port 3001
npm run build            # Production build
npm run lint             # ESLint
npm run type-check       # tsc --noEmit
npm test                 # Jest (--runInBand)
npm run migrate          # prisma migrate dev
npm run create-default-admin  # Create admin@anywheredoor.com / Admin@123456
npm run list-admins      # List admin users
npm run reset-password   # Reset admin password
```

## Environment Variables
Both apps use `.env` files. Key variables:
- `DATABASE_URL` — shared PostgreSQL connection string
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` — auth config
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN` — Cloudflare R2
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — payments (cloud_website)
- `REDIS_URL` — BullMQ/Redis connection

## Notes
- `NODE_OPTIONS='--max-old-space-size=4096'` is set for dev/build in cloud_website due to memory requirements
- `tsx` is used to run TypeScript scripts directly
- Prisma client is auto-generated on `postinstall`
- `cloud_website` uses `tsconfig.build.json` for type-checking (excludes test files)
