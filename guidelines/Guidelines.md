**Add your own guidelines here**
# Project Guidelines (for Codex / AI)

## Non-negotiables
- Keep changes **small, reviewable, and scoped**. No drive-by refactors.
- **Do not edit generated output**: `node_modules/`, `dist/`, any build artifacts.
- **No new production dependencies** without explicit approval.
- Never introduce or log **secrets** (tokens/keys). Redact if encountered.
- Respect existing conventions in the repo; **follow precedent** before inventing new patterns.

## Tooling (source of truth)
- Package manager: **pnpm** (lockfile: `pnpm-lock.yaml`)
- Dev/build: **Vite**
- Language: **TypeScript** (`tsconfig.json`)
- Tests: **Vitest**
- Lint: **ESLint**
- Router: **react-router**

## Canonical commands (use these exact scripts)
- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test (CI): `pnpm test`
- Test (watch): `pnpm test:watch`

### Verification rules (default)
- Any behavior/UI logic change ⇒ `pnpm lint && pnpm typecheck && pnpm test`
- Styling-only (no logic) ⇒ `pnpm lint && pnpm typecheck` (tests optional unless risky)
- Dependency change ⇒ ask first + run full verification and ensure lockfile updated

## Implementation workflow
1) **Understand**: locate similar patterns/components in the codebase and mirror them.
2) **Plan** (if > small edit): propose 3–7 steps + what commands will validate it.
3) **Implement**: minimal diff, keep boundaries clean.
4) **Verify**: run commands above; if you can’t run, state why and what to run.
5) **Report**: summary + files changed + commands run + how to verify + risks/follow-ups.

## TypeScript standards
- Avoid `any`. Prefer `unknown` + narrowing (type guards) at boundaries.
- Keep types explicit at module boundaries (exported functions/hooks/components).
- Don’t change `tsconfig.json` without explicit approval (project-wide contract).
- Prefer pure helpers for complex logic (testable functions in `utils/`).

## React / UI standards
- Functional components + hooks.
- No side effects at module import time.
- Accessibility:
  - Use semantic HTML first.
  - Ensure keyboard navigation and visible focus.
  - Provide `aria-label` for icon-only buttons.
- Prefer **one UI approach per feature**:
  - If the project already uses a component pattern, follow it.
  - Avoid mixing MUI and Radix *in the same component tree* unless the existing codebase already does.

## Styling & layout
- Prefer **responsive layouts** using flex/grid.
- Avoid absolute positioning unless necessary.
- Keep UI consistent: spacing, typography, and component rhythm should match existing screens.
- If Tailwind is used in the project, prefer Tailwind utility classes for layout and spacing.
- Don’t introduce a new styling system.

## Forms & validation
- Prefer `react-hook-form` for forms.
- Validate user inputs at boundaries; show actionable errors.
- Don’t silently fail; surface errors (inline + toast if appropriate).

## Data / side effects
- No real network calls in tests.
- For API/data access, prefer a small client module (`src/api/*`) rather than scattered `fetch` calls.
- Keep effects localized; cleanup timers/subscriptions.

## Testing (Vitest)
- Bugfix ⇒ add a regression test.
- New feature ⇒ happy path + important edge cases.
- Tests should be deterministic (no time/network flakiness).
- If UI testing utilities are not present, don’t add them without approval.

## Dependency policy
- Ask before adding deps.
- Prefer existing deps already in package.json.
- When adding:
  - explain why it’s necessary
  - keep it minimal
  - update lockfile
  - ensure licensing/maintenance risk is reasonable

## Definition of Done (DoD)
A change is done when:
- Lint passes (`pnpm lint`)
- Typecheck passes (`pnpm typecheck`)
- Tests pass when behavior changed (`pnpm test`)
- No secrets introduced
- Final output includes:
  - Summary (what/why)
  - Files changed
  - Commands run
  - How to verify
  - Risks / rollout notes / follow-ups

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->
