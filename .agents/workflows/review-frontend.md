# Frontend Code Review Workflow

## Trigger
```
/review-frontend [file_or_dir_path]
```

## Purpose
Performs a structured, opinionated frontend code review tailored to the Pyi-Taw-Tar POS design
system. Enforces consistency across component architecture, UI tokens, UX completeness, and
accessibility — producing actionable, refactored code snippets alongside the verdict.

## Rules & Standards
- **Primary rule set**: `.agents/rules/react-vite.md`
- **UI standard skill**: `.agents/skills/my-ui-standard/SKILL.md`
- **Project conventions**: `AGENTS.md` (arch, i18n, auth, Tailwind CDN, import map)

---

## Review Steps

### Step 1 — Load Context
1. Read `.agents/rules/react-vite.md` and `.agents/skills/my-ui-standard/SKILL.md`.
2. Read `AGENTS.md` to recall project-level constraints (Tailwind CDN, import map, i18n key usage,
   `AppContext` state management, JWT auth pattern).
3. Read the target `[file_or_dir_path]` in full. If a directory, list files first and read each
   `.tsx` / `.ts` / `.css` file sequentially.

### Step 2 — Component Structure & Size
Check every component against these criteria:

| Criterion | Pass condition |
|-----------|---------------|
| Single Responsibility | Component does one thing; data-fetching, logic, and render are not all tangled together |
| File length | < 300 lines per component file (flag; > 500 lines = hard violation) |
| Props destructuring | Props are destructured at function signature, not accessed via `props.x` inside body |
| Named exports for sub-components | Shared sub-components exported individually, not buried inside parent |
| No inline function definitions in JSX that recreate on every render | Handlers defined outside JSX or memoized |
| Context usage | Only reads `AppContext` / `LanguageContext` at the page level; passes data down via props |

### Step 3 — UI Consistency (Design System)
Check usage of design tokens and approved component libraries:

| Area | Required pattern | Common violation |
|------|-----------------|-----------------|
| **Buttons** | Use standard button token classes (`btn-primary`, `btn-secondary`, etc. per `my-ui-standard`) | Raw `bg-blue-500` ad-hoc classes |
| **Date pickers** | Use `react-date-range` (imported via CDN import map) | Native `<input type="date">` or other libs |
| **Icons** | Use `lucide-react` (CDN import map) only | Inline SVGs, emoji, or other icon sets |
| **Colors** | Use Tailwind theme tokens (`brand-*`, `primary-*`, `dark-*`, `status-*`) defined in `index.html` tailwind config | Arbitrary hex values or non-token Tailwind classes |
| **i18n strings** | All user-visible text via `t("key")` from `LanguageContext` | Hardcoded English or Myanmar strings |
| **Typography** | Use theme-defined text sizes; no arbitrary `text-[14px]` values | Arbitrary font sizes |

### Step 4 — UX Completeness
Every interactive component or data-fetching page must have:

| UX requirement | What to check |
|---------------|--------------|
| **Loading state** | Skeleton loader or spinner shown while async data is in flight |
| **Error state** | User-friendly error message displayed on API failure (not just `console.error`) |
| **Empty state** | Meaningful empty-state UI when list/table has zero results |
| **Disabled during submission** | Submit/action buttons set `disabled` and show a pending indicator while a mutation/request is in progress |
| **Optimistic feedback** | Form fields do not reset unexpectedly; success feedback (toast / inline message) shown after mutation |
| **Stale data guard** | Components that poll or refetch handle unmount cleanup to avoid state updates on unmounted components |

### Step 5 — Accessibility & Responsive Design
Run through each of these checks:

**Semantic HTML & ARIA**
- Landmark elements used correctly (`<main>`, `<nav>`, `<header>`, `<section>`, `<aside>`).
- Interactive elements are true buttons/links — not `<div onClick>` or `<span onClick>`.
- Every `<img>` has a meaningful `alt` attribute (or `alt=""` for decorative images).
- Form inputs are associated with `<label>` via `htmlFor` / `id` pairing.
- ARIA roles/attributes added only where native semantics are insufficient.

**Keyboard Focus**
- All interactive elements reachable and operable via Tab / Shift+Tab.
- Focus ring visible (not removed with `outline-none` without a replacement).
- Modal / drawer traps focus correctly; focus returns to trigger on close.
- No keyboard trap outside intentional modal contexts.

**Responsive / Mobile-first**
- Base styles target mobile; breakpoint prefixes (`sm:`, `md:`, `lg:`) layer up.
- No fixed pixel widths that overflow on small screens.
- Touch targets ≥ 44 × 44 px for all interactive elements.
- Tables / data grids scroll horizontally on small viewports rather than overflowing the page.

---

## Output Format

Produce the review in the following four sections. **Do not skip any section**; write "✅ None
found" if a section has no findings.

---

### 🏛 Executive Verdict
A 2–4 sentence summary of overall quality. State clearly: **PASS / PASS WITH MINOR FIXES /
NEEDS WORK / REJECT**. Give the single biggest concern and the single biggest strength.

---

### 🎨 Design System Violations
List each violation as:
```
[SEVERITY: HIGH | MEDIUM | LOW] <file>:<line-range>
Problem : <what is wrong>
Fix     : <one-line description of the correct approach>
```
Then provide a **refactored code snippet** for each HIGH/MEDIUM violation.

---

### ♿ UX / Accessibility Gaps
List each gap as:
```
[TYPE: UX | A11Y | RESPONSIVE] <file>:<line-range>
Problem : <what is missing or broken>
Fix     : <one-line description>
```
Provide a **refactored code snippet** for each gap rated critical or moderate.

---

### 🔧 Actionable Refactor Snippets
Consolidate the most impactful before/after code blocks here. Each snippet must:
- Show the **before** (verbatim excerpt from the file).
- Show the **after** (corrected replacement).
- Include a one-line rationale.

---

## Agent Assignment
Invoke the following agents in parallel for Steps 2–5:

| Agent | Scope |
|-------|-------|
| `react-reviewer` | Steps 2 & 3 — component structure and design system |
| `typescript-reviewer` | Step 2 — type safety, prop types, generics |
| `a11y-architect` | Step 5 — accessibility and responsive design |
| `security-reviewer` | Cross-cutting — XSS via dangerouslySetInnerHTML, unvalidated user input rendered in JSX |

After all agents complete, synthesize results into the unified four-section output above.

---

## Notes
- This workflow is **read-only** — it never modifies source files automatically. All suggested
  changes are presented as snippets for the developer to apply.
- If `[file_or_dir_path]` is omitted, default to reviewing the most recently modified `.tsx` file
  in `pages/` or `components/` (check `git diff --name-only HEAD` to find it).
- Myanmar-language UI strings inside `t()` calls are **not** flagged as hardcoded strings.
