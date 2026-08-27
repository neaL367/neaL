# instant-nav rig: neal

- BUILD: `EXPOSE_TESTING_API=1 bun run build` using the local production artifact
- EXPOSE: `process.env.EXPOSE_TESTING_API === '1'` enables `experimental.exposeTestingApiInProductionBuild`; never set for normal production builds
- RUN: `bun run test:e2e` against `BASE_URL=http://localhost:3000` after starting `bun run start`
- TEST USER: public visitor; no authentication, feature flags, plan, role, or seeded account data required
- DRIFT: none beyond viewport size and browser state; routes use public generated MDX content
- LOOP: local build → start → Playwright test → inspect failure → fix → repeat; no deployment or secrets are required
- LIVENESS: n/a for the local build-and-start rig; the test server is started from the freshly built artifact
- WALLS: the app uses Turbopack with native `import.meta.glob` dynamic imports, and instant verification uses production `next start`
