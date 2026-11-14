# Maze Adventures 1996

An original, family-friendly isometric arcade game inspired by 1990s maze games. It does not claim to recreate an identified historical title. All characters, geometry, and audio are generated in code; no proprietary game assets are used.

## Install and play

Install Node.js 22.12+ (or Node 24 LTS), then in a terminal:

    cd maze-adventures-1996
    npm install
    npm run dev

Open the Local URL printed by Vite (normally http://127.0.0.1:5173). Works in modern WebGL-capable browsers on Windows and macOS. Enable hardware acceleration if graphics are unavailable.

    npm test        # game rules and maze reachability
    npm run build   # strict TypeScript check and production bundle
    npm run preview # serve the built bundle locally

## Controls and rules

- Arrow keys or WASD: move along the maze grid (up is toward the far edge). Movement continues until a wall; a queued turn happens at the next valid tile.
- P / Escape: pause or resume. Switching tabs or windows pauses automatically.
- M or Sound button: toggle synthesized sound.
- Enter or the main button: start, resume, advance, or retry.
- On-screen direction buttons are available on narrow screens.
- Restart run resets all progress.

Collect every pellet to clear Land, Underwater, then Space. Pellets are 10 points, large power orbs are 50 points and grant six seconds of ghost-catching ability. Catching a ghost earns 200 points. Each completed world earns 500 points. Three lives are shared across the whole run; a collision resets actor positions but keeps collected pellets. Respawn grants 1.8 seconds of blinking immunity. Enemies alternate shortest-path chasing with corner patrols and move more slowly than the player. Clear Space to win.

## Architecture

- src/levels.ts: readable ASCII maps, theme colors, and grid/pathfinding helpers.
- src/game.ts: deterministic simulation, score, collisions, enemies, and state transitions; no browser or Three.js dependency.
- src/scene.ts: Three.js orthographic camera, generated meshes, lighting, interpolation, and responsive rendering.
- src/audio.ts: short original Web Audio synth effects; initialized by a user gesture.
- src/main.ts: keyboard/touch input, fixed 150 ms simulation ticks, HUD, and screens.
- src/style.css: responsive arcade presentation.
- src/game.test.ts: Vitest tests of reachability, walls, scoring, power, lives, pause, and progression.

The simulation decides what happens; the renderer only displays it. Start contributions with a color change or a new map. In maps, # is a wall, . is a pellet, o is a power orb, P is the player, and G is a ghost. Keep rows rectangular, ensure all open cells connect, and run the tests after changes. Add another LEVELS entry and adapt the three-world UI if expanding the campaign.

## Known limitations

- This is an MVP: no saved progress, leaderboard, gamepad support, or backend.
- Movement is grid based; the display interpolates between cells. Direction keys follow maze axes, not exact screen-space diagonals.
- Maps are handcrafted; enemy intelligence is intentionally simple. Difficulty is not broadly playtested.
- Touch controls are a convenience; keyboard on desktop is the primary experience.
- WebGL is required. High-DPI resolution is capped at 2 for performance.
- Optional Google Fonts fall back to local system fonts when offline. After npm installation, gameplay needs no external data or services.
- Historical “1996” styling is fictional nostalgia, not an assertion about the original game’s identity.

No deployment or publication is configured.
