# Feishu-Style Dark Theme Design Specification (Tailwind CSS v4)

## 1. Design Principles

*   **Calm & Restrained**: The interface should feel quiet and stable. Avoid high-contrast jarring elements. The dark theme is not "night mode" but a professional, low-light work environment.
*   **Content-First**: Chrome (UI shell) recedes; content (documents, chats, data) stands out. Use subtle background distinctions rather than heavy borders.
*   **High Trust**: Colors and interactions should feel precise and reliable. Avoid neon, cyberpunk, or "gamified" aesthetics.
*   **Depth via Layering**: Use lightness (surface brightness) to indicate depth, not heavy drop shadows. The closer the element, the lighter the background.

## 2. Color System

### Core Palette (CSS Variables & Tokens)

We use a "near-black" foundation with cool-toned grays.

#### Backgrounds (Layering)
*   `--bg-app`: `#141414` (Main app background, lowest level)
*   `--bg-surface-1`: `#1F1F1F` (Sidebar, cards, panels)
*   `--bg-surface-2`: `#2B2B2B` (Modals, dropdowns, elevated cards)
*   `--bg-surface-3`: `#373737` (Hover states, inputs)

#### Foreground / Typography
*   `--fg-primary`: `#FFFFFF` (Primary text, headings - 90-100% opacity visual equivalent)
*   `--fg-secondary`: `#EBEBEB` (Body text, icons - ~85% opacity visual equivalent)
*   `--fg-tertiary`: `#A6A6A6` (Meta data, placeholders - ~60% opacity visual equivalent)
*   `--fg-disabled`: `#5C5C5C` (Disabled states)

#### Borders & Dividers
*   `--border-subtle`: `#333333` (Default dividers)
*   `--border-strong`: `#484848` (Input borders, active boundaries)

#### Brand / Accent (Feishu Blue)
*   `--color-primary`: `#3370FF` (Brand base - adjusted for dark mode visibility if needed, often slightly lighter like `#4E83FD` for better contrast on dark)
*   `--color-primary-hover`: `#5C8DFF`
*   `--color-primary-active`: `#2454D6`
*   `--color-primary-subtle`: `rgba(51, 112, 255, 0.15)` (Backgrounds for selected items)

#### Functional Colors
*   `--color-success`: `#2E9E64` (Text/Icon), `rgba(46, 158, 100, 0.15)` (Bg)
*   `--color-warning`: `#FF8800` (Text/Icon), `rgba(255, 136, 0, 0.15)` (Bg)
*   `--color-danger`: `#F54A45` (Text/Icon), `rgba(245, 74, 69, 0.15)` (Bg)

## 3. Typography

*   **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
*   **Scale**:
    *   `text-xs`: 12px / 18px
    *   `text-sm`: 14px / 22px (Base UI font)
    *   `text-base`: 16px / 24px (Reading text)
    *   `text-lg`: 18px / 26px
    *   `text-xl`: 20px / 28px (Section headers)
    *   `text-2xl`: 24px / 32px (Page titles)
*   **Weights**:
    *   Regular (400): Body text
    *   Medium (500): UI labels, buttons, subheaders
    *   Semibold (600): Page titles, emphasis (Use sparingly)

## 4. Spacing & Layout

*   **Grid System**: 4px baseline grid.
*   **Density**:
    *   *Compact*: For data-heavy tables/lists (padding-y: 4px-8px).
    *   *Comfortable*: For chat, documents, settings (padding-y: 12px-16px).
*   **Radius**:
    *   `rounded-sm` (4px): Checkboxes, tags, small inputs.
    *   `rounded-md` (6px): Buttons, inputs, standard cards.
    *   `rounded-lg` (10px): Modals, large containers.
    *   `rounded-xl` (12px+): App windows, floating panels.

## 5. Components

### Button (Primary)
```html
<button class="
  bg-[--color-primary] text-white
  px-4 py-1.5 rounded-md
  text-sm font-medium
  hover:bg-[--color-primary-hover]
  active:bg-[--color-primary-active]
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-primary]
  transition-colors duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Confirm
</button>
```

### Card (Standard)
```html
<div class="
  bg-[--bg-surface-1]
  border border-[--border-subtle]
  rounded-lg
  p-5
  shadow-sm
">
  <h3 class="text-[--fg-primary] text-base font-medium mb-2">Project Alpha</h3>
  <p class="text-[--fg-secondary] text-sm">Q3 Roadmap planning and resource allocation.</p>
</div>
```

### Input Field
```html
<div class="flex flex-col gap-1.5">
  <label class="text-xs font-medium text-[--fg-secondary]">Email Address</label>
  <input type="email" class="
    bg-[--bg-surface-1]
    text-[--fg-primary]
    border border-[--border-subtle]
    rounded-md
    px-3 py-2
    text-sm
    placeholder:text-[--fg-tertiary]
    focus:border-[--color-primary] focus:ring-1 focus:ring-[--color-primary] focus:outline-none
    transition-all duration-200
  " placeholder="name@example.com" />
</div>
```

## 6. Interaction & Motion

*   **Duration**: Fast and snappy. 100ms - 200ms for micro-interactions (hover, active). 250ms - 300ms for larger transitions (modals, panels).
*   **Easing**: `ease-out` for entering elements, `ease-in` for exiting.
*   **Feedback**:
    *   Hover: Slight brightness increase (bg) or subtle color shift.
    *   Active: Slight scale down (98%) or brightness decrease.
    *   Focus: Distinct ring (usually primary color), never just browser default.

## 7. Accessibility

*   **Contrast**: Ensure text on backgrounds meets WCAG AA (4.5:1).
    *   *Note*: `--fg-tertiary` on `--bg-app` might be low contrast; use only for non-critical info.
*   **Focus Management**: Always provide visible focus states for keyboard navigation.
*   **Semantic HTML**: Use `<button>`, `<a>`, `<input>`, `<nav>`, `<main>` correctly.
*   **Screen Readers**: Use `sr-only` for icon-only buttons.

## 8. Tailwind v4 Implementation Notes

### CSS Configuration (`app.css`)

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-bg-app: #141414;
  --color-bg-surface-1: #1F1F1F;
  --color-bg-surface-2: #2B2B2B;
  --color-bg-surface-3: #373737;

  --color-fg-primary: #FFFFFF;
  --color-fg-secondary: #EBEBEB;
  --color-fg-tertiary: #A6A6A6;

  --color-border-subtle: #333333;
  --color-border-strong: #484848;

  --color-primary: #3370FF;
  --color-primary-hover: #5C8DFF;

  /* Spacing / Radius overrides if needed */
  --radius-md: 6px;
}

/* Custom Utilities */
@utility text-balance {
  text-wrap: balance;
}
```

### Usage in Markup
Use the CSS variables directly via Tailwind's arbitrary value syntax or mapped utilities if configured.
*   `bg-[--bg-app]`
*   `text-[--fg-primary]`
*   `border-[--border-subtle]`

## 9. Do/Don’t Checklist

| Category | Do | Don't |
| :--- | :--- | :--- |
| **Color** | **Do** use off-black (`#141414`) for backgrounds to reduce eye strain. | **Don't** use pure black (`#000000`) unless for specific media borders. |
| **Contrast** | **Do** use text hierarchy (Primary/Secondary) to guide the eye. | **Don't** use low-contrast gray text for essential reading content. |
| **Effects** | **Do** use subtle 1px borders (`border-[--border-subtle]`) to define edges. | **Don't** use heavy drop shadows or neon glows to separate layers. |
| **Layout** | **Do** use whitespace to group related elements. | **Don't** clutter the UI with excessive divider lines. |
| **Typography** | **Do** stick to 2-3 font sizes per view to maintain calm. | **Don't** use uppercase text heavily; it feels aggressive. |
