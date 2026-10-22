<div align="center">

# 🐸 Frogflies

**A one-button swinging arcade game — tap & hold to swing, reel and pump to build speed, catch fireflies to boost your multiplier, and outrun a wall of fire across four cosmic biomes.**

`Vanilla JavaScript` `Canvas 2D` `Zero dependencies` `No build step`

</div>

---

## ✨ Features

- **🪝 One-button pendulum physics** — hold to shoot your tongue at canopy hooks and swing with real tangential velocity math; release to sling forward with momentum.
- **🕸️ Full rope manipulation** — while hooked: `W/S` reels the tongue in and out, `A/D` pumps torque to spin full 360° loops over the hook, and holding in mid-air brakes into a glide.
- **✨ Guardian Firefly Swarm** — one emergency rescue per run: a cinematic slow-motion golden swarm scoops you out of fatal eliminations, then recharges after you collect 8 fireflies.
- **🔥 Firewall chase** — an accelerating inferno column hunts you from behind and keeps absorbing the world you pass through.
- **🌠 Four evolving biomes** — Midnight Marsh → Bioluminescent Aurora → Solar Flare Inferno → Void of Infinity, each with its own sky, aurora, flora tint and celestial body (blood moon, ringed exoplanet, solar supernova…).
- **🪞 Arcade presentation** — desktop / phone / arcade-cabinet view modes, toggleable CRT scanline overlay, threat-glow vignette, fullscreen support.
- **🎛️ Adjustables** — simulation speed hotkeys (0x pause up to 4x), hold-adjust speed dial, soundboard drawer, persistent local best score.

## 🎮 Controls

| Input | Action |
| --- | --- |
| `SPACE` / Click / Touch (hold) | Shoot tongue & swing; release to launch forward |
| `W` / `S` | Reel tongue in / out while hooked |
| `A` / `D` | Pump swing torque (360° loops) while hooked |
| Hold in air | Brake — convert momentum into a glide |
| `R` | Restart run |
| `M` | Toggle sound |
| `1` `2` `3` `4` / `0` | Simulation speed 1x–4x / pause |
| `[` `]` | Speed down / up by 0.25x |
| `F` | Toggle fullscreen |
| `ESC` | Open / close the Settings drawer |

## 🚀 Running the Game

**There is no build step.** The game is a plain static site — any modern browser (Chrome, Edge, Firefox, Safari) plays it directly. You only need a browser with Canvas 2D + Web Audio support, and internet access for the two Google Fonts (the game falls back to system fonts offline).

### Option 1 — Open directly

Double-click `index.html`, or drag it into a browser window.

### Option 2 — Serve locally (recommended)

```bash
# with Node.js (npm start / npm run serve)
npm start            # → http://localhost:8080

# or with Python
python -m http.server 8080
```

### Shipping / deployment

Copy the repository contents to any static file host (GitHub Pages, Netlify, itch.io zip, S3/CDN…). The only hard requirements are that `index.html`, `index.css`, `game.js`, and the `assets/` folder stay together with their relative paths intact.

## 🗂️ Repository Structure

```
.
├── index.html            # Entry point — arcade shell, HUD, settings drawer, soundboard
├── index.css             # Arcade cabinetry, HUD and CRT-overlay styling
├── game.js               # The game: native Canvas 2D engine, physics, spawners, audio, biomes
├── assets/
│   ├── images/           # Sprites & background art
│   └── sounds/           # SFX & ambient loops in .mp3/.webm
├── docs/superpowers/     # Design spec + implementation plan for the v1.1 feature work
├── LICENSE               # MIT license for this repository's source code
└── README.md
```

### Architecture notes

- `game.js` is a **self-contained, from-scratch Canvas 2D engine** (no libraries, no iframes): a fixed **60 TPS timestep loop** with a delta accumulator, procedural spawners (hooks, lilypads, grass), a virtual **2048×2732** stage scaled to fit any screen, a Web Audio/HTML5 audio manager, and the biome state machine.

## 🔗 Attribution & Notice

**Frogflies** © 2026 — the game code in this repository (`index.html`, `index.css`, `game.js`) is released under the **MIT License** (see `LICENSE`). The artwork and audio under `assets/` are part of this game and are covered by the same grant.

A brief credits line is also shown inside the game's Settings drawer.

## 📦 Third-Party Assets

The only third-party runtime dependency is **typography**, served via the Google Fonts CDN:

| Asset | Files | Source | License |
| --- | --- | --- | --- |
| **JetBrains Mono** font | loaded via Google Fonts CDN in `index.html` | JetBrains / Google Fonts | **SIL Open Font License 1.1** |
| **Outfit** font | loaded via Google Fonts CDN in `index.html` | The Outfit project / Google Fonts | **SIL Open Font License 1.1** |

Everything else in this repository — engine code, styling, sprites and audio — is part of this project. There are no other runtime dependencies.

> **Note on bundled assets:** The origin and rights holders of some of the bundled artwork and audio files under `assets/` could not be verified. If any of these assets belong to you, please open an issue and they will be properly credited or removed.

## 🤖 AI Tools Disclosure

This project was developed with AI assistance, used as follows:

- **JetBrains IDE AI coding agent** — used during development to implement the feature work on `game.js` (Guardian Firefly Swarm rescue system, WASD/arrow-key rope controls, the four-biome environment system), the corresponding HUD/UI in `index.html` / `index.css`, and the design documents under `docs/superpowers/`.
- **Freebuff (Codebuff agent)** — used for production-readiness work: repository structure, this README, the `LICENSE` file, and verification of the build.

Everything AI-generated was human-directed, human-reviewed, and committed by the maintainer.

## 📄 License

This project's source code is released under the [MIT License](LICENSE).
