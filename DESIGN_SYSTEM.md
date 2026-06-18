DESIGN_SYSTEM.md

Status: ACTIVE

Owner: CONDUCTOR

Scope: Frontend UI / UX / Visual System / Animation / Interaction / Tailwind Governance

⸻

1. Purpose

This Design System is the central rulebook for the entire UI.

It governs:

* UI style consistency
* UX behavior
* theme tokens
* layout structure
* animation rules
* component system
* Tailwind enforcement

Every frontend must comply 100%.

⸻

2. Core Principles

* Semantic UI First
* Theme Token Driven
* Tailwind Only
* No arbitrary CSS
* Component Reuse Only
* Consistency > Creativity

⸻

3. Styling Rules (Strict)

Allowed

* Tailwind CSS only
* className usage only
* semantic tokens only

Forbidden

* CSS / SCSS / SASS
* styled-components
* inline style
* arbitrary values (bg-[#fff], p-[13px])

⸻

4. Theme System (Critical)

4.1 Source of Truth

Theme tokens must be defined via Tailwind CSS variables in:

modules/desktop-app/frontend/src/style.css

and must support `@theme inline`.

⸻

4.2 Required Semantic Tokens

All UI MUST use only these tokens:

Background

* bg-background
* bg-card
* bg-primary
* bg-secondary
* bg-muted
* bg-accent

Text

* text-foreground
* text-card-foreground
* text-primary-foreground
* text-secondary-foreground
* text-muted-foreground
* text-accent-foreground

Border

* border-border

State

* success / warning / error must be mapped via semantic tokens only

⸻

4.3 Forbidden Colors

* bg-blue-500
* bg-red-500
* bg-green-500
* text-gray-500
* any hex / rgb usage

⸻

5. Layout System

Page Structure

Every page MUST follow:

Page
 ├── Header
 ├── Main Content
 ├── Footer (optional)

⸻

Container Rule

All pages must use:

max-w-7xl mx-auto px-6

⸻

Grid System

* card-grid → responsive grid system
* flex → only for alignment
* no custom layout hacks

⸻

6. Typography System

Allowed styles only:

* text-sm
* text-base
* text-lg
* text-xl
* text-2xl
* text-3xl

Semantic usage:

* h1 → page title
* h2 → section title
* h3 → card title
* body → normal text
* caption → metadata

No arbitrary font sizes.

⸻

7. Component System (Mandatory)

All UI must use shared components:

* Button
* Input
* Textarea
* Select
* Card
* Dialog
* Modal
* Table
* Tabs
* Badge
* Avatar

Rules

* No duplicated UI components
* No page-level styling logic
* No ad-hoc UI patterns

⸻

8. Interaction Rules

* Hover effects must be subtle
* Click feedback required
* Disabled states required
* Loading states required

⸻

9. Animation System

Allowed

* fade
* slide
* scale
* modal transitions
* hover transitions

Rules

* duration: 150-300ms
* no bounce / excessive motion
* must not affect usability

⸻

10. UX Requirements

Every page MUST implement:

* loading state
* empty state
* error state
* disabled state

⸻

11. Dark Mode Support

Mandatory:

* light mode
* dark mode

All tokens must support both modes automatically.

⸻

12. Accessibility

Required:

* semantic HTML
* aria labels where needed
* keyboard navigation
* visible focus state

⸻

13. Tailwind Enforcement

System must enforce:

* no inline styles
* no CSS files outside style.css (theme only)
* no arbitrary values
* no external styling system

⸻

14. File Integration Rule

Theme validation source:

modules/desktop-app/frontend/src/style.css

Must include:

* @theme inline
* semantic token mapping
* dark/light definitions

⸻

15. UI Consistency Gate

Before merge, must verify:

* semantic tokens used
* no raw colors
* components reused
* layout consistent
* animation within limits
* accessibility compliant

Failure → BLOCK STAGE.

⸻

16. Final Authority

Only the Conductor may modify this design system.

All UI decisions must comply strictly with this file.
