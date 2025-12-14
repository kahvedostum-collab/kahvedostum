**Repo Summary**: Kahvedostum is a React (v19) single-page app scaffolded with Vite. Styling uses Tailwind CSS 4 and UI primitives from Shadcn UI. The app is JavaScript-only (no TypeScript) and built/deployed via Vite and Docker (Nginx).

**Primary dev commands**:

- `npm run dev` — start Vite dev server (HMR)
- `npm run build` — produce production bundle (`dist/`)
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint rules (see `eslint.config.js`)

**Where to look first**:

- `src/main.jsx` — React entry (creates root, imports `index.css`).
- `src/App.jsx` — main app shell and routing (primary layout hook-ups).
- `src/components/` — UI components. Two component areas matter:
  - `src/components/shacdn/` — legacy/custom Shadcn components (existing code lives here)
  - `src/components/ui/` — preferred location for new Shadcn UI components
- `src/lib/utils.js` — utility helpers (e.g., `cn()` for merging classNames).
- `vite.config.js`, `jsconfig.json` — path alias `@/` is configured; prefer `@/` imports across the codebase.

**Key conventions & constraints (do not violate)**:

- JavaScript only. Do not introduce `.ts`/`.tsx` files or TypeScript typings — components must remain `.jsx`.
- Shadcn components must be JavaScript `.jsx` files. Use the `shadcn` CLI with JS mode (`components.json` has `"tsx": false`).
- Use `@/` alias for internal imports. Example: `import { Button } from "@/components/ui/button"`.
- Styling uses Tailwind CSS 4 and class-variance-authority. Use `cn()` from `src/lib/utils.js` when composing classes.
- Avoid changing build or Docker behavior without verifying `nginx.conf` SPA routing and multi-stage `Dockerfile` (production served by Nginx on port 80 inside the container).

**Code generation / component guidance**:

- When adding components follow the `src/components/ui/` layout and name files `.jsx`.
- For variant APIs, follow existing patterns that use `class-variance-authority` and `tailwind-merge` (see `src/components/ui/*` for examples).
- Prefer small, focused components using React hooks (no global state manager is present).

**Testing & verification workflow**:

- Local dev flow: `npm run dev` → exercise UI with HMR.
- Production sanity: `npm run build` then `npm run preview` to verify routing and static assets before building Docker images.
- Linting: `npm run lint` (ESLint flat config in `eslint.config.js`). Address React Hooks and HMR warnings first.

**Deployment notes**:

- Repository is deployed via Docker + Nginx. The project contains a multi-stage `Dockerfile` and an `nginx.conf` tuned for SPA routing — ensure routes fall back to `index.html`.
- Docker commands used in repo docs: `docker build -t kahvedostum-frontend .` and `docker run -d -p 8080:80 --name kahvedostum-frontend kahvedostum-frontend`.

**Files worth referencing when making changes**:

- `components.json` — shadcn CLI configuration (`"tsx": false`) and component paths.
- `vite.config.js` — alias resolution, plugins, React plugin options.
- `eslint.config.js` — linting rules and exceptions (e.g., unused-vars handling for component names).
- `src/index.css` — global CSS variables and theming (dark/light via CSS variables).

**Examples** (copyable):

- Importing a UI component: `import { Button } from "@/components/ui/button"`
- Using `cn()` helper: `const classes = cn("px-4 py-2", variant === 'primary' && 'bg-blue-600')`

If anything here is unclear or you want the file tailored to a specific AI assistant behaviour (e.g., stricter commit message format, PR labeling, or more examples), tell me which parts to expand or modify.
