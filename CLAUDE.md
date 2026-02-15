# CLAUDE.md - AI Assistant Guide for CEFR B1+ Opinion Essay Writing Platform

## Project Overview

A client-side educational web application that teaches CEFR B1+ English learners to write opinion essays. Users study model essays, access language toolkits, learn essay organisation, and write essays that receive automated AI-powered feedback with scoring and error highlighting.

**Zero-build, zero-dependency vanilla JS project** — no frameworks, no npm, no build tools. Open `index.html` in a browser to run.

## File Structure

```
/
├── index.html          # All UI markup (812 lines) — single-page app structure
├── css/
│   └── styles.css      # All styling, responsive design, animations (1109 lines)
├── js/
│   ├── app.js          # Navigation, page logic, user interactions (391 lines)
│   ├── ai-checker.js   # Essay analysis engine, grading algorithm (752 lines)
│   └── essays-data.js  # Static data: 8 model essays + topic list (220 lines)
└── CLAUDE.md           # This file
```

**Total:** 5 source files (~3300 lines). Each file has a single, clear responsibility.

## Architecture

- **Single-Page Application** with section-based navigation managed by `navigateTo(page)` in `app.js`
- **No server required** — all logic runs in the browser
- **localStorage** for persisting essay submissions (no database)
- **Simulated AI analysis** — local regex-based grammar/vocabulary/organisation/content checking in `ai-checker.js`, not API-based
- **Google Fonts (Inter)** is the only external dependency (loaded via CDN)

### Page Sections

| Section | Purpose |
|---------|---------|
| Home | Hero + feature overview + "How It Works" guide |
| Model Essays | 8 browsable essays (2 per type), filterable, viewed in modals |
| Language Toolkit | 4 tabbed panels with linkers/phrases by essay relationship type |
| Organisation Guide | Structural templates for each essay type |
| Write & Submit | Main feature: write essay, get AI feedback, submit for review |

### Essay Types Supported

1. Advantage & Disadvantage
2. Problem & Solution
3. Cause & Effect
4. Compare & Contrast

## Key Code Paths

### Navigation
`app.js`: `navigateTo(page)` toggles `.page-section` visibility and updates `.nav-link.active` state.

### AI Analysis Pipeline
`ai-checker.js`: `AIChecker.analyseEssay(text, topic)` returns a result object with:
- **Scores** (0-5 each): Content, Organisation, Grammar, Vocabulary → total out of 20
- **Grammar errors**: 20+ regex patterns for common B1+ mistakes (subject-verb agreement, articles, confused words, prepositions, tense consistency, comma splices, capitalisation)
- **Vocabulary metrics**: Advanced word detection (35+ words), basic overused word detection (16 words), type-token ratio, linker usage across 7 categories
- **Organisation checks**: 4-paragraph structure, word count (target 270-330), thesis/topic sentence/conclusion validation
- **Content checks**: Topic relevance, opinion statements, supporting examples, paragraph development

### Data Flow
```
User writes essay → updateWordCount() (real-time) → checkEssay() → AIChecker.analyseEssay()
    → displayResults(result) → corrected essay with error highlights + score breakdown + feedback grid
```

### Submission Storage
Saved to `localStorage` as JSON with structure:
```javascript
{ id, studentName, topic, essay, wordCount, submittedAt, status: "pending_review" }
```

## Development Workflow

### Running Locally
Open `index.html` directly in a browser, or use any static file server:
```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

### No Build Process
Files are served as-is. No transpilation, bundling, or minification steps.

### No Automated Tests
Testing is manual. Key scenarios to verify:
- Navigation between all 5 sections
- Essay filtering and modal open/close (including Escape key)
- Toolkit tab switching
- Word count accuracy and colour-coding (green: 270-330, yellow: outside range)
- AI analysis produces sensible scores for various essay qualities
- Error highlighting renders correctly with tooltips
- localStorage persistence across page reloads
- Responsive layout at desktop (>1280px), tablet, mobile (<768px), small mobile (<480px)

### Deployment
Static hosting only — GitHub Pages, Netlify, Vercel, or any web server. Upload all files preserving directory structure.

## Coding Conventions

### JavaScript
- **camelCase** for functions and variables: `navigateTo()`, `updateWordCount()`, `escapeHtml()`
- Verb-based function names: `open`, `close`, `switch`, `update`, `render`, `check`, `submit`, `display`
- `const`/`let` (ES6+), no `var`
- Template literals for HTML generation
- Event handlers via `onclick` attributes in HTML
- `escapeHtml()` used to sanitise user input before DOM insertion (XSS prevention)
- Section headers in comments using `// ===== SECTION NAME =====`
- `setTimeout(1500ms)` simulates AI processing delay

### CSS
- CSS custom properties for theming:
  - `--primary: #2563eb` (blue), `--secondary: #0f172a` (dark navy)
  - `--accent: #f59e0b` (amber), `--success: #10b981`, `--danger: #ef4444`
  - Shadow scale: `--shadow`, `--shadow-md`, `--shadow-lg`
- `rem` units for spacing and typography (base scale: 0.75rem–2.5rem)
- BEM-like class naming: `.essay-card`, `.score-circle`, `.feedback-grid`
- State classes: `.active`, `.open`, `.disabled`, `.score-high`, `.score-mid`, `.score-low`
- Mobile-first responsive breakpoints: 768px, 480px
- CSS Grid for card layouts; Flexbox for navigation and inline elements

### HTML
- Semantic elements: `<nav>`, `<main>`, `<section>`, `<footer>`
- Section comments: `<!-- ===== SECTION NAME ===== -->`
- IDs in camelCase: `#essayText`, `#essayTopic`, `#checkerResults`, `#loadingOverlay`
- `data-` attributes for page routing (`data-page`) and toolkit selection (`data-toolkit`)
- Accessibility: `aria-label` on interactive elements, `<label for="">` on form inputs

## Important Implementation Details

- **No external JS libraries** — all UI components, analysis logic, and data management are custom
- **AI checker is deterministic** — same input always produces same output (regex-based, no randomness)
- **Word count target** is 270-330 words for essays (matches CEFR B1+ exam requirements)
- **8 model essays** are hardcoded in `essays-data.js`, 2 per essay type
- **Score display** uses colour coding: red (<50%), yellow (50-74%), green (>=75%)
- **Modal** closes on Escape key and background click
- **Mobile navigation** uses hamburger menu toggle via `toggleMenu()`

## Browser Compatibility

Requires ES6+ support (template literals, arrow functions, `const`/`let`, CSS Grid, CSS custom properties):
- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

## When Making Changes

- Maintain the vanilla JS approach — do not introduce frameworks or build tools without explicit request
- Keep the single-file-per-concern structure (markup in HTML, styles in CSS, logic in JS)
- Use `escapeHtml()` when inserting any user-provided text into the DOM
- Test responsive layout at mobile breakpoints after CSS changes
- The AI checker regex patterns in `ai-checker.js` are intentionally tuned for B1+ level errors — changes should preserve educational accuracy
- Model essays in `essays-data.js` follow a strict schema: `{ id, title, type, tag, paragraphs: [{ label, text }] }`
- Topics list is defined at the bottom of `essays-data.js` as the `essayTopics` array
