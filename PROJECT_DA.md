# PROJECT_DA.md - URBAN VOID: DA & UX Overhaul

## 1. Vision & Mood
**Theme:** "Satirical City" / "Geek Fun"
**Style:** High-quality Cartoon SVG (Vector Art), Clean lines, Flat Design with subtle gradients/shadows (2.5D feel).
**Atmosphere:** Vibrant, chaotic, playful. The city feels alive but silly. Objects have personality (e.g., hydrants with eyes, vending machines that look surprised).
**Target Audience:** Mobile gamers, fans of io games, casual players.

## 2. Color Palette
High contrast, saturated colors to pop on mobile screens.

*   **Primary (Action/Player):** `#00F3FF` (Cyan Neon) -> `#00D4FF` (Deep Sky Blue)
*   **Secondary (Enemies/Danger):** `#FF0055` (Radical Red) -> `#D40044`
*   **Tertiary (Points/Gold):** `#FFD700` (Gold) -> `#FFAA00`
*   **Background (Floor/Asphalt):** `#2C3E50` (Dark Blue Grey) - Not pitch black, cleaner look.
*   **UI Backgrounds:** `#FFFFFF` (Clean White) with `#000000` text for readability, or Dark Mode with Neon accents.
*   **Success/Growth:** `#39FF14` (Neon Green)

## 3. Typography
**Headings:** `Fredoka One` or `Baloo 2` (Rounded, bold, friendly).
**Body Text:** `Montserrat` or `Nunito` (Readable, rounded sans-serif).

## 4. Assets (SVG List)
All assets will be generated as SVG strings/files to ensure crisp rendering at any scale.

### Props (Satirical City)
1.  **Hydrant:** Red, classic shape, but with two "eyes" (bolts) looking worried.
2.  **Cone:** Orange/White striped, slightly bent/melted looking.
3.  **Mailbox:** Blue, boxy, overflowing with letters (one stuck in the slot like a tongue).
4.  **Trash Bin:** Green metal can, lid slightly open, fish bone sticking out.
5.  **Vending Machine:** Retro style, colorful bottles visible, "Sold Out" sign.
6.  **Car:** Round, beetle-like shape, exaggerated wheels, no sharp angles.
7.  **Bus/Van:** Rectangular but with rounded corners, "School Bus" yellow or "Hippie Van" flowers.
8.  **Tree:** Simple geometric foliage (spheres/clouds), brown trunk.
9.  **Building:** Isometric block, colorful windows, maybe a face on the facade?

### Skins (Player)
1.  **Default:** Black Hole with a spinning neon rim.
2.  **UFO:** Flying saucer shape, beam underneath (the "hole").
3.  **Glitch:** Pixelated edges, shifting colors.
4.  **Donut:** Pink frosting, sprinkles.

### UI Icons
1.  **Coin:** Gold coin with a sparkle.
2.  **Skull:** Cartoon skull (for kills).
3.  **Clock:** Stopwatch style (for time).
4.  **Pause/Play:** Rounded buttons.

## 5. Audio (SFX)
**Style:** Cartoon/Slapstick.
*   **Eat Small:** "Pop!", "Bloop!"
*   **Eat Large:** "Crunch!", "Gulp!"
*   **Level Up:** "Ta-da!", Fanfare.
*   **Die:** "Womp womp", Vinyl scratch.
*   **Music:** Upbeat, funky, looping bassline (Synth-based).

## 6. Technical Constraints
*   **Format:** SVG for graphics, WebAudio for sound (procedural or base64 samples).
*   **Performance:**
    *   Preload all SVGs as `Image` objects at startup.
    *   Draw using `ctx.drawImage` in the loop.
    *   Use offscreen canvases for complex static shapes if needed.
*   **Responsiveness:** UI must scale perfectly from iPhone SE to iPad Pro. Touch targets > 44px.

## 7. Implementation Plan
1.  **AssetManager:** Load SVGs.
2.  **Renderer:** Draw SVGs.
3.  **UI:** Apply CSS/HTML overhaul.
4.  **Polish:** Animations and "Juice".
