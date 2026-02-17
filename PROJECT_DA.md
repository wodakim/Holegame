# URBAN VOID - ART DIRECTION & PROJECT BIBLE

## 1. VISION & THEME
**"Geeky Voxel-Vector Chaos"**
A high-energy, colorful "eat-em-up" set in a stylized geek culture city. The visual style draws heavy inspiration from **Dofus/Wakfu (Ankama)** — emphasizing isometric perspectives, vibrant saturated colors, thick vector-like outlines, and a playful, organic feel even for mechanical objects.

### Pillars
*   **Juicy & Bouncy:** Everything should feel alive. Buttons squash and stretch. The player "hole" wobbles. Eating things feels satisfying (screen shake, particles).
*   **Readable Chaos:** despite the destruction, the game must remain readable. Clean outlines, distinct color coding for tiers.
*   **Geek Culture:** Props and buildings reference gaming, tech, and pop culture (Arcade machines, Servers, Comic shops).

---

## 2. COLOR PALETTE
Moving away from "Neon/Dark" to "Vibrant/Daylight".

| Element | Color Hex | Description |
| :--- | :--- | :--- |
| **Background (Void)** | `#2C3E50` | Deep blue-grey (The "Abyss" beneath the city) |
| **Ground (City)** | `#ECF0F1` | Clean, bright paper/concrete texture |
| **Outlines** | `#2C3E50` | Thick, consistent dark strokes (not pure black) |
| **Player (Hole)** | `#1ABC9C` | Vibrant Turquoise (Gradient to Dark) |
| **UI Primary** | `#F1C40F` | Sunflower Yellow (Buttons, Highlights) |
| **UI Secondary** | `#E67E22` | Carrot Orange (Alerts, Important text) |
| **UI Accent** | `#9B59B6` | Amethyst Purple (Magic/Tech vibes) |

---

## 3. ASSETS & GRAPHICS
Currently procedural (Canvas API), but moving towards SVG/Sprite-based rendering.

### SVG Asset Wishlist (To be implemented)
*   **Characters/Skins:**
    *   `skin-base-hole.svg`: A swirling, stylized vortex.
    *   `skin-glitch.svg`: Pixelated edges.
    *   `skin-mouth.svg`: Toon teeth around the rim.
*   **Props (Tiered):**
    *   *Tier 1:* `prop-rubik-cube.svg` (replacing Box), `prop-joystick.svg`.
    *   *Tier 2:* `prop-arcade-cabinet.svg` (replacing Kiosk), `prop-server-rack.svg`.
    *   *Tier 3:* `prop-drone.svg` (Flying unit), `prop-scooter.svg`.
    *   *Tier 4:* `vehicle-foodtruck.svg` (Burger/Ramen theme).
    *   *Tier 5:* `building-gaming-cafe.svg`, `building-comic-store.svg`.
*   **Environment:**
    *   `floor-tile-circuit.svg`: Subtle circuit board pattern on the ground.
    *   `decor-tree-pixel.svg`: Voxel-style trees.

### Current Procedural Guidelines (Immediate Plan)
*   **Stroke:** All objects must have a `lineWidth` of 2-3px with `strokeStyle = '#2C3E50'`.
*   **Shading:** Use "Cel-Shading" logic (solid fill + 1 shadow layer + 1 highlight layer). No smooth gradients.
*   **Perspective:** 2.5D Isometric projection for buildings/tall objects.

---

## 4. USER INTERFACE (UI)
*   **Style:** "Mobile Casual AAA". Big rounded buttons, inner shadows to give depth.
*   **Animations:**
    *   *Press:* Scale down to 0.95.
    *   *Appear:* Elastic bounce (BackOut easing).
*   **Layout:**
    *   Top: HUD (Score, Time) in "Pill" shapes floating.
    *   Bottom: Virtual Joystick (Hidden/Subtle).
    *   Menus: Modal cards with backdrop blur.

---

## 5. AUDIO (OSCILLATORS)
**Goal:** Retro-Modern Synthesis.
*   **UI Clicks:** High-pitched "Wood block" or "Bubble" pop (Sine wave, fast decay).
*   **Eat Small:** Short "Bloop" (Sine sweep up).
*   **Eat Big:** Bass-heavy "Crunch" (Sawtooth + Low Pass Filter sweep).
*   **Level Up:** Positive Major Chord Arpeggio (Square wave).

---

## 6. TECH ROADMAP
1.  **Phase 1 (Design):** Establish this document and rules.
2.  **Phase 2 (UI):** Reskin CSS to match the "Dofus/Geek" palette and shapes.
3.  **Phase 3 (Renderer):** Rewrite `draw()` methods to add outlines and "toon" shading.
4.  **Phase 4 (Audio):** Implement `Synth` class for better SFX.
5.  **Phase 5 (Juice):** Add particles, screenshake, and elastic animations.
