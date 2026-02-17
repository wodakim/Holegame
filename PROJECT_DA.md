# URBAN VOID - ART DIRECTION & PROJECT BIBLE

## 1. VISION & THEME
**"Geeky Voxel-Vector Chaos"**
A high-energy, colorful "eat-em-up" set in a stylized geek culture city. The visual style draws heavy inspiration from **Dofus/Wakfu (Ankama)** — emphasizing isometric perspectives, vibrant saturated colors, thick vector-like outlines ("Pathfinder Style"), and a playful, organic feel even for mechanical objects.

### Pillars
*   **Juicy & Bouncy:** Everything should feel alive. Buttons squash and stretch. The player "hole" wobbles. Eating things feels satisfying (screen shake, particles).
*   **Readable Chaos:** Clean outlines, distinct color coding for tiers. The UI must be readable (High Contrast/Stroke).
*   **Geek Culture:** Props and buildings reference gaming, tech, and pop culture (Arcade machines, Servers, Comic shops).
*   **Coherence:** Eating mechanics must feel fair. If it looks smaller, it is eatable.

---

## 2. COLOR PALETTE
Moving away from "Neon/Dark" to "Vibrant/Daylight".

| Element | Color Hex | Description |
| :--- | :--- | :--- |
| **Background (Sky)** | `#3498DB` | Bright Blue Sky (Replaces Abyss) |
| **Ground (City)** | `#ECF0F1` | Clean, bright paper/concrete texture |
| **Outlines** | `#2C3E50` | Thick, consistent dark strokes (3px) |
| **Player (Hole)** | `#1ABC9C` | Vibrant Turquoise (Gradient to Dark) |
| **UI Primary** | `#F1C40F` | Sunflower Yellow (Buttons, Highlights) |
| **UI Secondary** | `#E67E22` | Carrot Orange (Alerts, Important text) |
| **UI Accent** | `#9B59B6` | Amethyst Purple (Magic/Tech vibes) |

---

## 3. ASSETS & GRAPHICS
Currently procedural (Canvas API).

### Procedural Guidelines (Current)
*   **Stroke:** All objects must have a `lineWidth` of 3px with `strokeStyle = '#2C3E50'`.
*   **Shading:** Use "Cel-Shading" logic (solid fill + 1 shadow layer + 1 highlight layer). No smooth gradients.
*   **Perspective:** 2.5D Isometric projection for buildings/tall objects.
*   **Solidity:** Small objects (Trash, Humans, Small Vehicles) are **SOFT** (non-solid). Only Structures (Buildings, Walls) are **SOLID**.

---

## 4. USER INTERFACE (UI)
*   **Style:** "Mobile Casual AAA". Big rounded buttons, inner shadows to give depth.
*   **Typography:** Thick "Pathfinder" outlines on all headers and buttons for readability.
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
*   [x] **Phase 1 (Design):** Establish this document and rules.
*   [x] **Phase 2 (UI):** Reskin CSS to match the "Dofus/Geek" palette and shapes. Added Pathfinder outlines.
*   [x] **Phase 3 (Renderer):** Rewrite `draw()` methods to add outlines and "toon" shading.
*   [x] **Phase 4 (Audio):** Implement `Synth` class for better SFX.
*   [x] **Phase 5 (Polish):** Fixed Physics coherence (Eating Threshold 1.0) and visual bugs (Rubik strobe).
*   [ ] **Phase 6 (Content):** Add more skins, missions, and tiered props.
