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
**Headings:** `Montserrat` (Bold/Black).
**Body Text:** `Montserrat` (Regular).

## 4. Assets (SVG List)
All assets are generated as SVG strings/files to ensure crisp rendering at any scale.

### Props (Satirical City)
1.  **Hydrant:** Red, classic shape, but with two "eyes" (bolts) looking worried.
2.  **Cone:** Orange/White striped, slightly bent/melted looking with glitch effect.
3.  **Mailbox:** Blue, boxy, overflowing with letters.
4.  **Trash Bin:** Green metal can, lid slightly open, fish bone sticking out.
5.  **Vending Machine:** Retro style, colorful bottles visible, dispenser slot.
6.  **Car:** Round, beetle-like shape, exaggerated wheels, no sharp angles.
7.  **Bus/Van:** Rectangular but with rounded corners, "School Bus" yellow or "Hippie Van" flowers.
8.  **Tree:** Simple geometric foliage (spheres/clouds), brown trunk.
9.  **Building:** Isometric block (2.5D), colorful windows.

### Skins (Player)
1.  **Default:** Black Hole with a procedural neon rim.
2.  **UFO:** Flying saucer shape, beam underneath (the "hole").
3.  **Glitch:** Pixelated edges, shifting colors.
4.  **Donut:** Pink frosting, sprinkles.

### UI Icons
1.  **Coin:** Gold coin with a sparkle.
2.  **Skull:** Cartoon skull (for kills).
3.  **Clock:** Stopwatch style (for time).
4.  **Pause/Play:** Rounded buttons.

## 5. Audio (SFX)
**Style:** Cartoon/Slapstick + Retro Arcade.
*   **Eat Small:** "Pop!", "Bloop!" (Sine wave pitch bend).
*   **Eat Large:** "Crunch!" (Noise burst + Sawtooth thud).
*   **Level Up:** "Fanfare!" (Major Arpeggio).
*   **Die:** "Power Down" (Sawtooth pitch drop).
*   **Ambient:** "City Hum" (Low frequency drone + LFO).
*   **UI Click:** "Blip" (Short Triangle wave).

## 6. Technical Constraints
*   **Format:** SVG for graphics (Base64 in AssetManager), WebAudio for sound (procedural).
*   **Performance:**
    *   Preload all SVGs as `Image` objects at startup (`AssetManager.loadAll`).
    *   Draw using `ctx.drawImage` in the loop.
    *   Use offscreen canvases for complex static shapes if needed.
*   **Responsiveness:** UI scales perfectly from iPhone SE to iPad Pro. Touch targets > 44px.
*   **Mobile:** Dynamic Joystick logic, viewport meta tags, haptic feedback disabled (as per user request).
