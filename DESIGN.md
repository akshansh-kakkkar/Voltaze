# Design System Document: The Kinetic Monolith

## 1. Overview & Creative North Star
**Creative North Star: "Digital Brutalism Editorial"**
This design system rejects the "bubbled" softness of modern SaaS in favor of a high-impact, architectural aesthetic. By combining the raw precision of zero border-radius geometry with a high-contrast palette, we create an experience that feels like a premium avant-garde magazine. 

We break the "template" look by utilizing heavy typographic scales, intentional asymmetry, and "The Kinetic Monolith" principle—where large, unyielding blocks of color and type create a sense of immovable authority and focused energy. 

## 2. Colors & Surface Logic
The palette is rooted in a stark, high-contrast foundation punctuated by a singular, "Electric Orange" accent that demands immediate cognitive attention.

### The Palette (Material Design Tokens)
*   **Primary (Electric Orange):** `#a93100` (Main CTA, critical focus)
*   **Primary Container:** `#d34000` (Hover states, high-energy backgrounds)
*   **Surface:** `#f9f9f9` (The primary canvas)
*   **On-Surface:** `#1b1b1b` (Primary text and high-contrast iconography)
*   **Surface Container Tiers:**
    *   **Lowest:** `#ffffff` (Floating cards/elevated content)
    *   **Low:** `#f3f3f3` (Section differentiation)
    *   **High:** `#e8e8e8` (Subtle UI elements)

### The "No-Line" Rule
**Standard 1px borders are strictly prohibited.** Layout boundaries must be defined exclusively through background color shifts. To separate a hero section from a feature grid, transition from `surface` to `surface-container-low`. This creates a sophisticated, "stacked paper" aesthetic rather than a wireframe look.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack. 
*   **Base:** `surface` (#f9f9f9)
*   **Nested Content:** Use `surface-container-lowest` (#ffffff) for modules that need to "pop" forward.
*   **In-set Content:** Use `surface-container-high` (#e8e8e8) for utility bars or secondary information wells.

### The "Glass & Gradient" Rule
While the system is minimalist, use `surface-tint` (#ad3300) at 5% opacity with a `20px` backdrop blur for floating navigation bars. This prevents the "flat" look and adds a layer of high-end digital polish. Use subtle linear gradients (Primary to Primary Container) on large CTA blocks to give them "weight" and dimension.

## 3. Typography
We use a dual-typeface system to balance technical precision with editorial flair.

*   **Display & Headlines (Space Grotesk):** This is our "Voice." Its wide stance and geometric terminals provide the brutalist edge.
    *   *Usage:* All H1–H3 tags and labels. Use `display-lg` (3.5rem) for hero statements to create an "Editorial Cover" feel.
*   **Body & Titles (Satoshi/Inter):** This is our "Information." It provides high legibility and a neutral tone.
    *   *Usage:* All long-form text and button labels.
*   **Hierarchy Note:** Always over-scale your headlines. If a section feels "generic," increase the `headline-lg` size and decrease the `body-md` size to create a more dramatic visual tension.

## 4. Elevation & Depth
In a zero-radius system, traditional drop shadows can look messy. We utilize **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by placing a `surface-container-lowest` card on a `surface-container-low` background. The slight shift in hex code provides all the separation required.
*   **Ambient Shadows:** If an element must float (e.g., a modal), use a massive blur (48px+) at 4% opacity using a tinted version of `on-surface`. It should feel like a soft glow, not a hard shadow.
*   **The "Ghost Border" Fallback:** For input fields only, use `outline-variant` (#e6beb2) at 20% opacity. Never use 100% opaque lines.

## 5. Components

### Buttons (Zero Radius)
*   **Primary:** Background: `primary`; Text: `on-primary`. 0px border-radius. Padding: `1rem 2rem`. Text must be `label-md` all-caps.
*   **Secondary:** Background: `on-surface`; Text: `surface`. This creates a high-contrast "Invert" look.
*   **Tertiary:** No background. Underline using `primary` at 2px thickness.

### Cards & Lists
*   **Card Styling:** No borders. Use `surface-container-lowest`. 
*   **No Dividers:** Prohibit the use of horizontal rules. Use the Spacing Scale (e.g., `spacing-8`) to create "Active Negative Space" between list items.

### Input Fields
*   **Style:** Bottom-border only (2px, `outline-variant` at 40%). When focused, the border transitions to `primary` (Electric Orange).
*   **Labels:** Use `label-sm` in `primary` color to keep the focus sharp.

### Event-Specific Components
*   **The Countdown Monolith:** A large-scale typography block using `display-lg` in `on-surface` with a `primary` background.
*   **Registration Chip:** A high-contrast tag using `on-secondary-container` on `secondary-container` for status updates (e.g., "LIMITED SLOTS").

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetry:** Place text on the far left and the CTA on the far right to force the eye to travel across the "Monolith."
*   **Embrace the 0px:** Ensure every single corner—from buttons to images to focus states—is a sharp 90-degree angle.
*   **Scale the Type:** Use `display-lg` for headers that feel "uncomfortably large." This is the hallmark of high-end editorial design.

### Don't:
*   **Don't use 1px Borders:** It breaks the "Surface Logic" and makes the site look like a bootstrap template.
*   **Don't use Rounded Corners:** Even a 2px radius will ruin the brutalist integrity of this system.
*   **Don't use Grey Shadows:** Always tint your shadows with the brand's `on-surface` or `primary` hues to maintain color depth.
*   **Don't Overcrowd:** If a section feels busy, double the spacing using `spacing-20` (7rem). Large gaps are a luxury.