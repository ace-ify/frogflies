/**
 * FROGFLIES - 100% NATIVE FROM-SCRATCH CANVAS 2D GAME ENGINE
 * Zero iframes. Zero vendor engine blobs. 100% pure readable vanilla JavaScript.
 * Built with the exact mathematical physics formulas, procedural spawners, and audio triggers.
 */

(function() {
    'use strict';

    // =========================================================================
    // GAME CONSTANTS & RECOVERED PHYSICS SPECIFICATION
    // =========================================================================
    const VIRTUAL_WIDTH = 2048;
    const VIRTUAL_HEIGHT = 2732;
    const TARGET_FPS = 60;

    const PLAYER_GRAVITY = 0.5;
    const PLAYER_SPIN_MAGNITUDE = -2.0;
    const PLAYER_ANGULAR_DAMPENING = 0.9995;
    const PLAYER_TONGUE_RANGE_MIN = 200;
    const PLAYER_TONGUE_RANGE_MAX = 1000;
    const PLAYER_ATTACH_MULTIPLIER = 1.16;
    const PLAYER_RELEASE_MULTIPLIER = 1.18;
    const PLAYER_RELEASE_VY_BONUS = 6.0;
    const PLAYER_BOUNCE_FACTOR = -1.15;
    const PLAYER_SCREEN_MARGIN = 1.25;

    const FIREWALL_SPEED_BASE = 2.0;
    const FIREWALL_SPEED_INC = 0.1 / TARGET_FPS;
    const FIREWALL_START_X = -VIRTUAL_WIDTH / 2 - 500;
    const FIREWALL_DISTANCE_MAX = 3 * VIRTUAL_WIDTH;

    const LILYPAD_ANGLE = 10 * Math.PI / 180;
    const LILYPAD_HEIGHT_FACTOR = 1.025;
    const LILYPAD_STALK_OFFSET = -5;
    const LILYPAD_SPAWN_MARGIN = 2 * VIRTUAL_WIDTH;
    const LILYPAD_SPAWN_X_MIN = 50;
    const LILYPAD_SPAWN_X_VAR = 1450;
    const LILYPAD_SPAWN_Y_MIN = -50;
    const LILYPAD_SPAWN_Y_VAR = -300;
    const LILYPAD_PICKUP_CHANCE = 0.25;

    const HOOK_SPAWN_MARGIN = 2 * VIRTUAL_WIDTH;
    const HOOK_SPAWN_X_MIN = 500;
    const HOOK_SPAWN_X_VAR = 1000;
    const HOOK_SPAWN_Y_MIN = -700;
    const HOOK_SPAWN_Y_VAR = -900;
    const HOOK_SEARCH_OFFSET = 100;
    const HOOK_DOUBLE_CHANCE = 0.1;
    const HOOK_DOUBLE_SPREAD = 0.25;
    const HOOK_OFFLINE_TICKS = 60;

    const GRASS_SPAWN_MARGIN = 2 * VIRTUAL_WIDTH;
    const GRASS_SPAWN_X_MIN = 10;
    const GRASS_SPAWN_X_VAR = 990;
    const GRASS_SPAWN_Y = 200;

    const SCORE_PER_DISTANCE = 0.01;
    const SCORE_PICKUP_MULTIPLIER = 0.1;

    // 4 Vast Cosmic Biomes with Full Environmental Metamorphosis
    const BIOMES = [
        {
            id: 0,
            name: 'MIDNIGHT MARSH',
            sub: 'Crimson Eclipse & Ancient Pines',
            startDist: 0,
            portalDist: 8000, // Portal I is far ahead at 8,000m (completely off-screen even on 32:9 displays)
            skyTop: [2, 2, 6],
            skyBottom: [9, 14, 25],
            treeFilterBack: 'brightness(0.25) contrast(1.1)',
            treeFilterFront: 'brightness(0.42)',
            moonType: 'blood_moon',
            moonHue: 0,
            portalColor: '#00f0ff',
            waterColor: 'rgba(5, 14, 28, 0.75)',
            floraColor: '#55ff99',
            auroraIntensity: 0.20,
            auroraColor1: 'rgba(0, 255, 140, 0.35)',
            auroraColor2: 'rgba(0, 180, 80, 0.25)',
            nextGateTitle: 'HYPER-PORTAL I : CYBER AURORA'
        },
        {
            id: 1,
            name: 'BIOLUMINESCENT AURORA',
            sub: 'Electric Canopies & Neon Ether',
            startDist: 8000,
            portalDist: 15000, // Portal II is at 15,000m
            skyTop: [1, 14, 26],
            skyBottom: [3, 44, 60],
            treeFilterBack: 'hue-rotate(135deg) brightness(0.55) saturate(2.0)',
            treeFilterFront: 'hue-rotate(135deg) brightness(0.85) saturate(2.2)',
            moonType: 'ringed_exoplanet', // 3D Ringed Gas Giant exoplanet!
            moonHue: 175,
            portalColor: '#ffaa00',
            waterColor: 'rgba(0, 180, 200, 0.65)',
            floraColor: '#00f0ff',
            auroraIntensity: 0.85,
            auroraColor1: 'rgba(0, 240, 255, 0.7)',
            auroraColor2: 'rgba(210, 80, 255, 0.6)',
            nextGateTitle: 'HYPER-PORTAL II : SOLAR INFERNO'
        },
        {
            id: 2,
            name: 'SOLAR FLARE INFERNO',
            sub: 'Corona of Starlight & Volcanic Embers',
            startDist: 15000,
            portalDist: 26000, // Portal III is at 26,000m
            skyTop: [34, 6, 2],
            skyBottom: [72, 24, 4],
            treeFilterBack: 'hue-rotate(-45deg) brightness(0.6) saturate(2.4) contrast(1.2)',
            treeFilterFront: 'hue-rotate(-45deg) brightness(0.9) saturate(2.6) contrast(1.3)',
            moonType: 'solar_supernova', // Blazing sun with pulsating solar flare coronal ejections!
            moonHue: 40,
            portalColor: '#e066ff',
            waterColor: 'rgba(230, 60, 0, 0.7)',
            floraColor: '#ff8800',
            auroraIntensity: 0.75,
            auroraColor1: 'rgba(255, 120, 0, 0.7)',
            auroraColor2: 'rgba(255, 220, 0, 0.6)',
            nextGateTitle: 'HYPER-PORTAL III : VOID SINGULARITY'
        },
        {
            id: 3,
            name: 'VOID OF INFINITY',
            sub: 'Beyond Time & Space-Time Event Horizon',
            startDist: 26000,
            portalDist: 40000, // Endgame portal
            skyTop: [10, 1, 24],
            skyBottom: [42, 4, 64],
            treeFilterBack: 'hue-rotate(240deg) brightness(0.65) saturate(2.2)',
            treeFilterFront: 'hue-rotate(240deg) brightness(1.0) saturate(2.5)',
            moonType: 'black_hole_singularity', // Black hole with glowing 3D accretion disk!
            moonHue: 285,
            portalColor: '#00f0ff',
            waterColor: 'rgba(140, 20, 220, 0.7)',
            floraColor: '#e066ff',
            auroraIntensity: 0.90,
            auroraColor1: 'rgba(180, 50, 255, 0.75)',
            auroraColor2: 'rgba(0, 220, 255, 0.65)',
            nextGateTitle: 'HYPER-PORTAL IV : ETERNAL RIFT'
        }
    ];

    // Asset Lists
    const IMAGE_PATHS = {
        background: 'assets/images/background.png',
        moon: 'assets/images/moon.png',
        foreground: 'assets/images/foreground.png',
        frog: 'assets/images/frog.png',
        hook: 'assets/images/hook.png',
        highlight: 'assets/images/highlight.png',
        lilypad: 'assets/images/lilypad.png',
        stalk: 'assets/images/stalk.png',
        collectable: 'assets/images/collectable.png',
        firewallBase: 'assets/images/firewallBase.png',
        firewallColumn: 'assets/images/firewallColumn.png',
        grassTall: 'assets/images/grassTall.png',
        grassShort: 'assets/images/grassShort.png',
        grassAngled: 'assets/images/grassAngled.png',
        rangeIndicator: 'assets/images/rangeIndicator.png'
    };

    // Upit LK Engine Overwrite Target Dimensions (Exact Display Dimensions)
    const TARGET_SIZES = {
        background: { width: 2732, height: 2732 },
        moon: { width: 600, height: 599.2 },
        frog: { width: 131.2, height: 120 },
        hook: { width: 150, height: 147.97 },
        highlight: { width: 250, height: 239.51 },
        lilypad: { width: 200, height: 100.17 },
        stalk: { width: 15, height: 607.5 },
        collectable: { width: 75, height: 85.6 },
        rangeIndicator: { width: 2000, height: 2000 },
        foreground: { width: 1600, height: 1790.6 },
        firewallBase: { width: 375, height: 705.32 },
        firewallColumn: { width: 150, height: 627.84 },
        grassTall: { width: 318.9, height: 1000 },
        grassShort: { width: 396.18, height: 400 },
        grassAngled: { width: 404.77, height: 500 }
    };

    const SOUND_PATHS = {
        frogTongue: 'assets/sounds/frogTongue.mp3',
        pickupCaught: 'assets/sounds/pickupCaught.mp3',
        frogBounce: 'assets/sounds/frogBounce.mp3',
        lilypadBounce: 'assets/sounds/lilypadBounce.mp3',
        noTarget: 'assets/sounds/noTarget.mp3',
        frogDeath: 'assets/sounds/frogDeath.mp3',
        fireCrackle: 'assets/sounds/fireCrackle.mp3',
        fireCrackling1: 'assets/sounds/fireCrackling1.mp3',
        fireCrackling2: 'assets/sounds/fireCrackling2.mp3',
        fireCrackling4: 'assets/sounds/fireCrackling4.mp3',
        backgroundAmbient: 'assets/sounds/backgroundAmbient.mp3'
    };

    // =========================================================================
    // AUDIO ENGINE (Web Audio API & HTML5 Audio fallback)
    // =========================================================================
    class SoundManager {
        constructor() {
            this.muted = false;
            this.unlocked = false;
            this.audioElements = {};
            this.ambientAudio = null;
            this.loadSounds();
        }

        loadSounds() {
            for (const [key, path] of Object.entries(SOUND_PATHS)) {
                const audio = new Audio(path);
                audio.preload = 'auto';
                this.audioElements[key] = audio;
            }
            if (this.audioElements.backgroundAmbient) {
                this.ambientAudio = this.audioElements.backgroundAmbient;
                this.ambientAudio.loop = true;
                this.ambientAudio.volume = 0.35;
            }
        }

        unlock() {
            if (this.unlocked) return;
            this.unlocked = true;
            for (const audio of Object.values(this.audioElements)) {
                try {
                    audio.load();
                } catch (e) {}
            }
            this.startAmbient();
        }

        play(name, volume = 1.0) {
            if (this.muted) return;
            const original = this.audioElements[name];
            if (!original) return;
            try {
                // Clone node for overlapping SFX
                const sound = original.cloneNode();
                sound.volume = Math.max(0, Math.min(1, volume));
                sound.play().catch(() => {});
            } catch (e) {}
        }

        startAmbient() {
            if (this.ambientAudio && !this.muted) {
                this.ambientAudio.play().catch(() => {});
            }
        }

        setMuted(muted) {
            this.muted = muted;
            if (this.ambientAudio) {
                if (muted) this.ambientAudio.pause();
                else this.ambientAudio.play().catch(() => {});
            }
        }

        playGateChime() {
            if (this.muted) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                if (!this.synthCtx) {
                    this.synthCtx = new AudioCtx();
                }
                if (this.synthCtx.state === 'suspended') {
                    this.synthCtx.resume().catch(() => {});
                }
                const now = this.synthCtx.currentTime;
                // Harmonic celestial chord: C5, E5, G5, B5, D6
                const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];
                freqs.forEach((freq, idx) => {
                    const osc = this.synthCtx.createOscillator();
                    const gain = this.synthCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                    gain.gain.setValueAtTime(0.001, now + idx * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.6);

                    osc.connect(gain);
                    gain.connect(this.synthCtx.destination);

                    osc.start(now + idx * 0.08);
                    osc.stop(now + idx * 0.08 + 1.8);
                });
            } catch (e) {
                this.play('pickupCaught', 1.0);
            }
        }

        playWarpBoom() {
            if (this.muted) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                if (!this.synthCtx) this.synthCtx = new AudioCtx();
                if (this.synthCtx.state === 'suspended') this.synthCtx.resume().catch(() => {});

                const now = this.synthCtx.currentTime;
                // Deep resonant spatial bass drop & filter sweep
                const osc = this.synthCtx.createOscillator();
                const gain = this.synthCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(32, now + 1.3);

                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

                osc.connect(gain);
                gain.connect(this.synthCtx.destination);
                osc.start(now);
                osc.stop(now + 1.5);
            } catch (e) {
                this.play('frogBounce', 1.0);
            }
        }

        playSweetSpotChime() {
            if (this.muted) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                if (!this.synthCtx) this.synthCtx = new AudioCtx();
                if (this.synthCtx.state === 'suspended') this.synthCtx.resume().catch(() => {});

                const now = this.synthCtx.currentTime;
                // Crisp high-frequency metallic harmonic chime
                [1479.98, 2217.46].forEach((f) => {
                    const osc = this.synthCtx.createOscillator();
                    const gain = this.synthCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, now);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
                    osc.connect(gain);
                    gain.connect(this.synthCtx.destination);
                    osc.start(now);
                    osc.stop(now + 0.5);
                });
            } catch (e) {
                this.play('pickupCaught', 0.8);
            }
        }
        playSpinCharge(level) {
            if (this.muted) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                if (!this.synthCtx) this.synthCtx = new AudioCtx();
                if (this.synthCtx.state === 'suspended') this.synthCtx.resume().catch(() => {});

                const now = this.synthCtx.currentTime;
                const baseFreq = level === 1 ? 440 : (level === 2 ? 620 : 880);
                const targetFreq = level === 1 ? 660 : (level === 2 ? 980 : 1320);

                const osc = this.synthCtx.createOscillator();
                const gain = this.synthCtx.createGain();
                osc.type = level === 3 ? 'sawtooth' : 'sine';
                osc.frequency.setValueAtTime(baseFreq, now);
                osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.18);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(level === 3 ? 0.14 : 0.10, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

                osc.connect(gain);
                gain.connect(this.synthCtx.destination);
                osc.start(now);
                osc.stop(now + 0.3);
            } catch (e) {
                this.play('pickupCaught', 0.5);
            }
        }

        playSlingshotRelease(level) {
            if (this.muted) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                if (!this.synthCtx) this.synthCtx = new AudioCtx();
                if (this.synthCtx.state === 'suspended') this.synthCtx.resume().catch(() => {});

                const now = this.synthCtx.currentTime;
                // Punchy low impact
                const oscLow = this.synthCtx.createOscillator();
                const gainLow = this.synthCtx.createGain();
                oscLow.type = 'sine';
                oscLow.frequency.setValueAtTime(level === 3 ? 180 : 130, now);
                oscLow.frequency.exponentialRampToValueAtTime(36, now + 0.35);

                gainLow.gain.setValueAtTime(0.28, now);
                gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

                oscLow.connect(gainLow);
                gainLow.connect(this.synthCtx.destination);
                oscLow.start(now);
                oscLow.stop(now + 0.4);

                // High-velocity laser whip snap
                const oscHigh = this.synthCtx.createOscillator();
                const gainHigh = this.synthCtx.createGain();
                oscHigh.type = 'triangle';
                oscHigh.frequency.setValueAtTime(1400 + level * 300, now);
                oscHigh.frequency.exponentialRampToValueAtTime(280, now + 0.22);

                gainHigh.gain.setValueAtTime(0.18, now);
                gainHigh.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

                oscHigh.connect(gainHigh);
                gainHigh.connect(this.synthCtx.destination);
                oscHigh.start(now);
                oscHigh.stop(now + 0.25);
            } catch (e) {
                this.play('frogBounce', 1.0);
            }
        }

        playSwarmRescue() {
            if (this.muted) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                if (!this.synthCtx) this.synthCtx = new AudioCtx();
                if (this.synthCtx.state === 'suspended') this.synthCtx.resume().catch(() => {});

                const now = this.synthCtx.currentTime;
                // Radiant celestial harp arpeggio: G4 (392), C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
                const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    const osc = this.synthCtx.createOscillator();
                    const gain = this.synthCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.05);

                    gain.gain.setValueAtTime(0.001, now + idx * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.05 + 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.85);

                    osc.connect(gain);
                    gain.connect(this.synthCtx.destination);
                    osc.start(now + idx * 0.05);
                    osc.stop(now + idx * 0.05 + 0.9);
                });

                // Warm protective bass loft
                const bassOsc = this.synthCtx.createOscillator();
                const bassGain = this.synthCtx.createGain();
                bassOsc.type = 'sine';
                bassOsc.frequency.setValueAtTime(140, now);
                bassOsc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
                bassGain.gain.setValueAtTime(0.25, now);
                bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
                bassOsc.connect(bassGain);
                bassGain.connect(this.synthCtx.destination);
                bassOsc.start(now);
                bassOsc.stop(now + 0.7);
            } catch (e) {
                this.play('pickupCaught', 1.0);
            }
        }

        playSwarmRecharged() {
            if (this.muted) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                if (!this.synthCtx) this.synthCtx = new AudioCtx();
                if (this.synthCtx.state === 'suspended') this.synthCtx.resume().catch(() => {});

                const now = this.synthCtx.currentTime;
                [1567.98, 2093.00, 3135.96].forEach((f, idx) => {
                    const osc = this.synthCtx.createOscillator();
                    const gain = this.synthCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, now + idx * 0.06);
                    gain.gain.setValueAtTime(0.12, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.5);
                    osc.connect(gain);
                    gain.connect(this.synthCtx.destination);
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 0.55);
                });
            } catch (e) {
                this.play('pickupCaught', 0.8);
            }
        }
    }

    // =========================================================================
    // ASSET LOADER
    // =========================================================================
    class AssetManager {
        constructor() {
            this.images = {};
            this.loaded = false;
        }

        async loadAll() {
            const promises = Object.entries(IMAGE_PATHS).map(([key, path]) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = path;
                    img.onload = () => {
                        this.images[key] = img;
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn('Failed loading image:', path);
                        resolve();
                    };
                });
            });
            await Promise.all(promises);
            this.loaded = true;
        }

        get(name) {
            return this.images[name];
        }
    }

    // =========================================================================
    // PROCEDURAL ENTITIES
    // =========================================================================
    class Hook {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 120;
            this.height = 120;
            this.scaleX = 1;
            this.flipCounter = 0;
            this.flipInterval = 20 + Math.floor(Math.random() * 40);
            this.enabled = true;
            this.disabledTicks = 0;
        }

        disable() {
            this.enabled = false;
            this.disabledTicks = HOOK_OFFLINE_TICKS;
        }

        update() {
            if (!this.enabled) {
                this.disabledTicks--;
                if (this.disabledTicks <= 0) {
                    this.enabled = true;
                }
            }
            this.flipCounter++;
            if (this.flipCounter >= this.flipInterval) {
                this.scaleX *= -1;
                this.flipCounter = 0;
                this.flipInterval = 20 + Math.floor(Math.random() * 40);
            }
        }

        draw(ctx, assets, isTarget, highlightRotation) {
            ctx.save();
            ctx.translate(this.x, this.y);

            // Highlight reticle if targeted
            if (isTarget && this.enabled) {
                const hl = assets.get('highlight');
                if (hl) {
                    ctx.save();
                    ctx.rotate(highlightRotation);
                    const hlw = TARGET_SIZES.highlight.width;
                    const hlh = TARGET_SIZES.highlight.height;
                    ctx.drawImage(hl, -hlw / 2, -hlh / 2, hlw, hlh);
                    ctx.restore();
                }
            }

            const hookImg = assets.get('hook');
            if (hookImg) {
                ctx.scale(this.scaleX, 1);
                if (!this.enabled) {
                    ctx.filter = 'brightness(0.3)';
                }
                const hw = TARGET_SIZES.hook.width;
                const hh = TARGET_SIZES.hook.height;
                ctx.drawImage(hookImg, -hw / 2, -hh / 2, hw, hh);
            }
            ctx.restore();
        }
    }

    class Lilypad {
        constructor(x, y, active = true, inert = false) {
            this.x = x;
            this.y = y;
            this.active = active;
            this.inert = inert;
            this.destroying = false;
            this.alpha = 1.0;
            this.destroyed = false;
            this.stalkRotation = LILYPAD_ANGLE * (1 - 2 * Math.random());
            this.pickup = null;
        }

        launch(sounds, onPickupCollect) {
            this.active = false;
            this.destroying = true;
            sounds.play('frogBounce');
            if (this.pickup) {
                this.pickup.collect(sounds, onPickupCollect);
            }
        }

        update() {
            if (this.destroying) {
                if (this.alpha <= 0) {
                    this.destroyed = true;
                }
                this.alpha -= 0.1;
                this.y += 10;
            }
        }

        draw(ctx, assets) {
            if (this.destroyed) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.globalAlpha = Math.max(0, this.alpha);

            // Draw Stalk
            const stalkImg = assets.get('stalk');
            if (stalkImg) {
                ctx.save();
                ctx.translate(0, LILYPAD_STALK_OFFSET);
                ctx.rotate(this.stalkRotation);
                const stalkH = -(this.y + LILYPAD_STALK_OFFSET) * LILYPAD_HEIGHT_FACTOR;
                const sw = TARGET_SIZES.stalk.width;
                ctx.filter = 'brightness(1.15) hue-rotate(30deg) saturate(1.5)';
                ctx.drawImage(stalkImg, -sw / 2, 0, sw, Math.max(10, stalkH));
                ctx.restore();
            }

            // Draw Lilypad Top
            const padImg = assets.get('lilypad');
            if (padImg) {
                const pw = TARGET_SIZES.lilypad.width;
                const ph = TARGET_SIZES.lilypad.height;
                ctx.drawImage(padImg, -pw / 2, -ph / 2, pw, ph);
            }

            ctx.restore();
        }
    }

    class Pickup {
        constructor(x, y, type = 'firefly') {
            this.x = x;
            this.y = y;
            this.type = type; // 'firefly', 'golden', 'chrono', 'spore'
            this.collected = false;
            this.rotation = Math.random() * Math.PI * 2;
            this.destroyed = false;
            this.radius = 45;
            this.bobOffset = Math.random() * Math.PI * 2;
            this.bobSpeed = 0.04 + Math.random() * 0.02;
        }

        collect(sounds, onScoreBoost) {
            if (!this.collected) {
                this.collected = true;
                this.destroyed = true;
                sounds.play('pickupCaught');
                if (onScoreBoost) onScoreBoost(this.type);
            }
        }

        update() {
            this.rotation += 0.03;
            this.bobOffset += this.bobSpeed;
        }

        draw(ctx, assets) {
            if (this.destroyed) return;
            const img = assets.get('collectable');
            if (!img) return;

            ctx.save();
            const bobY = Math.sin(this.bobOffset) * 14;
            ctx.translate(this.x, this.y + bobY);

            // Aura ring based on pickup type
            if (this.type === 'golden') {
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 25;
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, 36, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'chrono') {
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 25;
                ctx.fillStyle = 'rgba(0, 240, 255, 0.32)';
                ctx.beginPath();
                ctx.arc(0, 0, 36, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'spore') {
                ctx.shadowColor = '#00ffaa';
                ctx.shadowBlur = 22;
                ctx.fillStyle = 'rgba(0, 255, 170, 0.28)';
                ctx.beginPath();
                ctx.arc(0, 0, 34, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.rotate(this.rotation);
            const cw = TARGET_SIZES.collectable.width;
            const ch = TARGET_SIZES.collectable.height;

            if (this.type === 'golden') {
                ctx.filter = 'brightness(1.5) sepia(1) hue-rotate(5deg) saturate(3)';
            } else if (this.type === 'chrono') {
                ctx.filter = 'hue-rotate(140deg) brightness(1.3)';
            } else if (this.type === 'spore') {
                ctx.filter = 'hue-rotate(90deg) brightness(1.2)';
            }

            ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch);
            ctx.restore();
        }
    }

    class Rift {
        constructor(x, y, type = 'celestial') {
            this.x = x;
            this.y = y;
            this.radius = 92;
            this.rotation = Math.random() * Math.PI * 2;
            this.active = true;
            this.type = type; // 'celestial', 'chrono', 'inferno'
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.05 + Math.random() * 0.02;
            this.particles = [];
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    angle: Math.random() * Math.PI * 2,
                    dist: 30 + Math.random() * 55,
                    speed: 0.03 + Math.random() * 0.03,
                    size: 2 + Math.random() * 3
                });
            }
        }

        update() {
            this.rotation += 0.025;
            this.pulse += this.pulseSpeed;
            for (const p of this.particles) {
                p.angle += p.speed;
                p.dist -= 0.35;
                if (p.dist < 15) p.dist = 85;
            }
        }

        draw(ctx) {
            if (!this.active) return;
            ctx.save();
            ctx.translate(this.x, this.y);

            const pScale = 1 + Math.sin(this.pulse) * 0.08;
            ctx.scale(pScale, pScale);

            // Radial Energy Glow
            const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, this.radius);
            if (this.type === 'chrono') {
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, '#00f0ff');
                grad.addColorStop(0.7, 'rgba(0, 120, 255, 0.4)');
                grad.addColorStop(1, 'rgba(0, 0, 40, 0)');
            } else if (this.type === 'inferno') {
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, '#ffaa00');
                grad.addColorStop(0.7, 'rgba(255, 60, 0, 0.4)');
                grad.addColorStop(1, 'rgba(40, 0, 0, 0)');
            } else {
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, '#d550ff');
                grad.addColorStop(0.7, 'rgba(0, 240, 255, 0.4)');
                grad.addColorStop(1, 'rgba(20, 0, 60, 0)');
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Swirling Accretion Orbit Ring
            ctx.rotate(this.rotation);
            ctx.strokeStyle = this.type === 'chrono' ? '#00f0ff' : (this.type === 'inferno' ? '#ff7700' : '#e066ff');
            ctx.lineWidth = 5;
            ctx.setLineDash([16, 14]);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.68, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Second Counter-Rotating Orbit Ring
            ctx.rotate(-this.rotation * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 18]);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Inflowing Vortex Sparkles
            for (const p of this.particles) {
                const px = Math.cos(p.angle) * p.dist;
                const py = Math.sin(p.angle) * p.dist;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Singularity Core
            ctx.fillStyle = '#030206';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Center Event Horizon Bead
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, 0, 6 + Math.sin(this.pulse * 2) * 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    class ShootingStar {
        constructor() {
            this.active = false;
            this.cooldown = 60 + Math.floor(Math.random() * 200);
            this.x = 0;
            this.y = 0;
            this.len = 0;
            this.speed = 0;
            this.angle = 0;
            this.alpha = 0;
        }

        update(virtW, virtH) {
            if (!this.active) {
                this.cooldown--;
                if (this.cooldown <= 0) {
                    this.active = true;
                    this.x = Math.random() * virtW;
                    this.y = Math.random() * (virtH * 0.35);
                    this.len = 100 + Math.random() * 160;
                    this.speed = 20 + Math.random() * 22;
                    this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.25;
                    this.alpha = 1.0;
                }
                return;
            }

            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.alpha -= 0.024;
            if (this.alpha <= 0) {
                this.active = false;
                this.cooldown = 180 + Math.floor(Math.random() * 350);
            }
        }

        draw(ctx) {
            if (!this.active || this.alpha <= 0) return;
            ctx.save();
            const tailX = this.x - Math.cos(this.angle) * this.len;
            const tailY = this.y - Math.sin(this.angle) * this.len;
            const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(0.7, `rgba(0, 240, 255, ${this.alpha * 0.6})`);
            grad.addColorStop(1, `rgba(255, 255, 255, ${this.alpha})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Grass {
        constructor(x, y, assetKey, scale) {
            this.x = x;
            this.y = y;
            this.assetKey = assetKey;
            this.scale = scale;
            this.flipX = Math.random() < 0.5 ? 1 : -1;
        }

        draw(ctx, assets) {
            const img = assets.get(this.assetKey);
            if (!img) return;
            const target = TARGET_SIZES[this.assetKey] || { width: 300, height: 400 };
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.scale * this.flipX, this.scale);
            ctx.globalAlpha = 0.75;
            ctx.drawImage(img, -target.width / 2, -target.height, target.width, target.height);
            ctx.restore();
        }
    }

    // =========================================================================
    // BIOLUMINESCENT LOTUS (WATER FLORA)
    // =========================================================================
    class Lotus {
        constructor(x, y, color) {
            this.x = x;
            this.baseY = y;
            this.color = color || '#00f0ff';
            this.bobOffset = Math.random() * Math.PI * 2;
            this.petalCount = 7;
            this.scale = 0.75 + Math.random() * 0.35;
        }

        update() {
            this.bobOffset += 0.03;
        }

        draw(ctx) {
            const bobY = this.baseY + Math.sin(this.bobOffset) * 6;
            ctx.save();
            ctx.translate(this.x, bobY);
            ctx.scale(this.scale, this.scale);

            const pulse = 0.8 + 0.2 * Math.sin(this.bobOffset * 1.5);

            // Water Ripple Ring
            ctx.beginPath();
            ctx.ellipse(0, 10, 48, 12, 0, 0, Math.PI * 2);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.35 * pulse;
            ctx.stroke();

            // Lotus Pad underneath
            ctx.beginPath();
            ctx.ellipse(0, 5, 38, 10, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#06201a';
            ctx.fill();
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            ctx.stroke();

            // Glowing Lotus Blossom Petals
            ctx.globalAlpha = 0.9;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 18 * pulse;

            for (let i = 0; i < this.petalCount; i++) {
                const angle = (i * Math.PI) / (this.petalCount - 1) - Math.PI;
                ctx.save();
                ctx.rotate(angle * 0.5);
                ctx.beginPath();
                ctx.ellipse(0, -18, 7, 20, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.restore();
            }

            // Center glowing core
            ctx.beginPath();
            ctx.arc(0, -5, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.fill();

            ctx.restore();
        }
    }

    // =========================================================================
    // DYNAMIC BIOME WEATHER & ATMOSPHERIC PARTICLES
    // =========================================================================
    class WeatherParticleSystem {
        constructor() {
            this.particles = [];
            this.maxCount = 45;
            for (let i = 0; i < this.maxCount; i++) {
                this.particles.push({
                    x: Math.random() * 4000 - 1000,
                    y: Math.random() * 2732,
                    vx: -1.5 - Math.random() * 2.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    size: 2.5 + Math.random() * 4.5,
                    alpha: 0.2 + Math.random() * 0.6,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.03 + Math.random() * 0.04
                });
            }
        }

        update(biome, virtualWidth, virtualHeight) {
            for (const p of this.particles) {
                p.pulse += p.pulseSpeed;

                if (biome.id === 0) {
                    // Marsh: gentle fireflies floating lazily
                    p.x += Math.cos(p.pulse) * 1.0;
                    p.y += Math.sin(p.pulse * 0.7) * 0.8;
                } else if (biome.id === 1) {
                    // Cyber Aurora: luminous cyan bio-spores drifting with the wind
                    p.x += p.vx * 1.2;
                    p.y += Math.sin(p.pulse) * 1.4;
                } else if (biome.id === 2) {
                    // Solar Inferno: fiery embers rising upward rapidly with heat
                    p.y -= 2.8 + Math.random() * 2.5;
                    p.x += (Math.random() - 0.5) * 2.5;
                } else if (biome.id === 3) {
                    // Void: cosmic stardust streaming diagonally
                    p.x += p.vx * 2.4;
                    p.y += 1.8;
                }

                // Screen wrapping
                if (p.x < -400) p.x = virtualWidth + 400;
                if (p.x > virtualWidth + 400) p.x = -400;
                if (p.y < 0) p.y = virtualHeight;
                if (p.y > virtualHeight) p.y = 0;
            }
        }

        draw(ctx, biome) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const color = biome.floraColor || '#00f0ff';

            for (const p of this.particles) {
                const alpha = Math.max(0, p.alpha * (0.6 + 0.4 * Math.sin(p.pulse)));
                ctx.globalAlpha = alpha;
                ctx.fillStyle = biome.id === 2 ? '#ffaa00' : (biome.id === 0 ? '#66ff88' : color);
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 12;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // =========================================================================
    // TRUE 3D CHRONO-PORTAL (GYROSCOPIC INTERDIMENSIONAL WORMHOLE)
    // =========================================================================
    class ChronoPortal3D {
        constructor(x, y, biomeData, targetBiomeIndex) {
            this.x = x;
            this.y = y !== undefined ? y : -900;
            this.biomeData = biomeData;
            this.targetBiomeIndex = targetBiomeIndex;
            this.radius = 290;
            this.passed = false;

            // 3D Gyroscope Euler Rotations
            this.yaw = 0;
            this.pitch = 0.32;
            this.roll = 0.14;
            this.precession = Math.random() * Math.PI * 2;
            this.pulseTime = 0;

            // 3D Levitating Quantum Motes (Orbiting in inclined 3D plane)
            this.motes = [];
            for (let i = 0; i < 16; i++) {
                this.motes.push({
                    angle: (i * Math.PI * 2) / 16,
                    radius: 340 + (i % 3) * 35,
                    speed: 0.02 + (i % 2) * 0.015,
                    size: 4 + (i % 4) * 2
                });
            }

            // Suction vortex particles streaming into singularity
            this.suctionParticles = [];
            for (let i = 0; i < 26; i++) {
                this.suctionParticles.push({
                    angle: Math.random() * Math.PI * 2,
                    dist: 120 + Math.random() * 260,
                    speed: 2 + Math.random() * 3,
                    spin: 0.05 + Math.random() * 0.03,
                    size: 2 + Math.random() * 3
                });
            }
        }

        update(frog) {
            this.yaw += 0.035;
            this.precession += 0.025;
            this.pitch = 0.30 + Math.sin(this.precession) * 0.16;
            this.pulseTime += 0.06;

            for (const m of this.motes) {
                m.angle += m.speed;
            }

            for (const sp of this.suctionParticles) {
                sp.dist -= sp.speed;
                sp.angle += sp.spin;
                if (sp.dist < 25) {
                    sp.dist = 280 + Math.random() * 80;
                    sp.angle = Math.random() * Math.PI * 2;
                }
            }

            // Gravitational Tractor Well Pull when frog is near
            if (frog && !frog.sitting && !this.passed) {
                const dx = this.x - frog.x;
                const dy = this.y - frog.y;
                const distSq = dx * dx + dy * dy;
                const pullRadius = 650;
                if (distSq < pullRadius * pullRadius && distSq > 100) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / pullRadius) * 1.8;
                    frog.vx += (dx / dist) * force;
                    frog.vy += (dy / dist) * force * 0.6;
                }
            }
        }

        project3D(x, y, z, yaw, pitch, roll) {
            // 3D Euler Matrix Rotation
            // Pitch (around X axis)
            let y1 = y * Math.cos(pitch) - z * Math.sin(pitch);
            let z1 = y * Math.sin(pitch) + z * Math.cos(pitch);

            // Yaw (around Y axis)
            let x2 = x * Math.cos(yaw) + z1 * Math.sin(yaw);
            let z2 = -x * Math.sin(yaw) + z1 * Math.cos(yaw);

            // Roll (around Z axis)
            let x3 = x2 * Math.cos(roll) - y1 * Math.sin(roll);
            let y3 = x2 * Math.sin(roll) + y1 * Math.cos(roll);

            // Camera FOV perspective
            const fov = 750;
            const scale = fov / (fov + z2 + 100);
            return {
                x: x3 * scale,
                y: y3 * scale,
                z: z2,
                scale: scale
            };
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);

            const color = this.biomeData.portalColor || '#00f0ff';
            const pulse = 1 + Math.sin(this.pulseTime) * 0.08;

            // 1. Orbitals Behind Portal (z < 0)
            this.drawMotes(ctx, color, -1);

            // 2. Outer 3D Gyro Ring - Back Arc (z < 0)
            this.draw3DRing(ctx, this.radius, 14, color, this.yaw, this.pitch, this.roll, -1);

            // 3. Middle 3D Gyro Ring - Back Arc (z < 0)
            this.draw3DRing(ctx, this.radius * 0.72, 8, '#ffffff', -this.yaw * 1.5, this.pitch * 0.8, -this.roll * 1.2, -1);

            // 4. Center Singularity Event Horizon Vortex (Drawn in between back & front!)
            this.drawSingularity(ctx, color, pulse);

            // 5. Suction Spiral Particles Streaming into Singularity
            this.drawSuctionParticles(ctx, color);

            // 6. Middle 3D Gyro Ring - Front Arc (z >= 0)
            this.draw3DRing(ctx, this.radius * 0.72, 8, '#ffffff', -this.yaw * 1.5, this.pitch * 0.8, -this.roll * 1.2, 1);

            // 7. Outer 3D Gyro Ring - Front Arc (z >= 0) with 3D Levitating Anchor Brackets
            this.draw3DRing(ctx, this.radius, 14, color, this.yaw, this.pitch, this.roll, 1);
            this.draw3DAnchors(ctx, this.radius, color, this.yaw, this.pitch, this.roll);

            // 8. Orbitals in Front of Portal (z >= 0)
            this.drawMotes(ctx, color, 1);

            // 9. Floating Holographic Cyber Title Plate
            this.drawHoloTitle(ctx, color);

            ctx.restore();
        }

        draw3DRing(ctx, radius, lineWidth, color, yaw, pitch, roll, depthFilter) {
            const segments = 40;
            ctx.save();
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = depthFilter > 0 ? 25 : 8;
            ctx.lineCap = 'round';

            for (let i = 0; i < segments; i++) {
                const a1 = (i * Math.PI * 2) / segments;
                const a2 = ((i + 1) * Math.PI * 2) / segments;

                const p1 = this.project3D(Math.cos(a1) * radius, Math.sin(a1) * radius, 0, yaw, pitch, roll);
                const p2 = this.project3D(Math.cos(a2) * radius, Math.sin(a2) * radius, 0, yaw, pitch, roll);

                if ((depthFilter < 0 && p1.z < 0) || (depthFilter > 0 && p1.z >= 0)) {
                    ctx.globalAlpha = depthFilter > 0 ? 0.95 : 0.45;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
            ctx.restore();
        }

        drawSingularity(ctx, color, pulse) {
            ctx.save();
            ctx.scale(pulse, pulse);

            // Deep Singularity Cosmic Gradient
            const grad = ctx.createRadialGradient(0, 0, 15, 0, 0, this.radius * 0.75);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.2, color);
            grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.85)');
            grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.4)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.75, 0, Math.PI * 2);
            ctx.fill();

            // Rotating Accretion Spiral Arms
            ctx.save();
            ctx.rotate(this.pulseTime * 0.8);
            for (let arm = 0; arm < 4; arm++) {
                ctx.beginPath();
                for (let r = 20; r < this.radius * 0.7; r += 8) {
                    const theta = (arm * Math.PI) / 2 + r * 0.035;
                    const sx = Math.cos(theta) * r;
                    const sy = Math.sin(theta) * r;
                    if (r === 20) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.globalAlpha = 0.6;
                ctx.shadowColor = color;
                ctx.shadowBlur = 15;
                ctx.stroke();
            }
            ctx.restore();

            // Singularity Dark Core Horizon
            ctx.beginPath();
            ctx.arc(0, 0, 35, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 18;
            ctx.fill();

            ctx.restore();
        }

        drawSuctionParticles(ctx, color) {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;

            for (const sp of this.suctionParticles) {
                const px = Math.cos(sp.angle) * sp.dist;
                const py = Math.sin(sp.angle) * sp.dist;
                const alpha = Math.min(1, sp.dist / 140);
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(px, py, sp.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        draw3DAnchors(ctx, radius, color, yaw, pitch, roll) {
            for (let a = 0; a < 4; a++) {
                const angle = (a * Math.PI) / 2 + this.yaw * 0.3;
                const p = this.project3D(Math.cos(angle) * (radius + 20), Math.sin(angle) * (radius + 20), 0, yaw, pitch, roll);
                if (p.z >= 0) {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.scale(p.scale, p.scale);
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 20;

                    // Diamond Pylon
                    ctx.beginPath();
                    ctx.moveTo(0, -22);
                    ctx.lineTo(14, 0);
                    ctx.lineTo(0, 22);
                    ctx.lineTo(-14, 0);
                    ctx.closePath();
                    ctx.fill();

                    // Pylon Core
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(0, 0, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        drawMotes(ctx, color, depthFilter) {
            for (const m of this.motes) {
                const p = this.project3D(Math.cos(m.angle) * m.radius, Math.sin(m.angle) * m.radius, 0, this.yaw * 0.8, this.pitch * 1.2, this.roll * 0.9);
                if ((depthFilter < 0 && p.z < 0) || (depthFilter > 0 && p.z >= 0)) {
                    ctx.save();
                    ctx.globalAlpha = depthFilter > 0 ? 0.95 : 0.4;
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 14;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, m.size * p.scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        drawHoloTitle(ctx, color) {
            ctx.save();
            ctx.translate(0, -this.radius - 85);

            // Sci-fi floating plaque
            ctx.fillStyle = 'rgba(4, 8, 16, 0.85)';
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowColor = color;
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.roundRect(-240, -45, 480, 90, 14);
            ctx.fill();
            ctx.stroke();

            // Holographic Title & Distance
            ctx.font = '900 28px Consolas, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(this.biomeData.nextGateTitle || 'HYPER-PORTAL', 0, -12);

            ctx.font = '700 18px Consolas, monospace';
            ctx.fillStyle = color;
            ctx.fillText(`✦ HORIZON GATE: ${Math.round(this.x)}m ✦`, 0, 20);

            ctx.restore();
        }
    }

    // =========================================================================
    // FIREWALL HAZARD
    // =========================================================================
    class Firewall {
        constructor(startX) {
            this.x = startX;
            this.speed = FIREWALL_SPEED_BASE;
            this.columnCount = 10;
            this.columnFlips = new Array(this.columnCount).fill(1);
            this.tickCounter = 0;
        }

        update(frogSitting, frogX) {
            this.tickCounter++;
            if (this.tickCounter % 6 === 0) {
                const idx = Math.floor(Math.random() * this.columnCount);
                this.columnFlips[idx] *= -1;
            }

            if (!frogSitting) {
                this.speed += FIREWALL_SPEED_INC;
                this.x += this.speed;
                if (this.x < frogX - FIREWALL_DISTANCE_MAX) {
                    this.x = frogX - FIREWALL_DISTANCE_MAX;
                }
            }
        }

        draw(ctx, assets) {
            const baseImg = assets.get('firewallBase');
            const colImg = assets.get('firewallColumn');
            if (!baseImg || !colImg) return;

            ctx.save();
            ctx.translate(this.x, 0);

            // Dark heat veil behind firewall
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(-VIRTUAL_WIDTH * 2, -VIRTUAL_HEIGHT * 2, VIRTUAL_WIDTH * 2, VIRTUAL_HEIGHT * 4);

            const baseW = TARGET_SIZES.firewallBase.width;
            const baseH = TARGET_SIZES.firewallBase.height;
            const colW = TARGET_SIZES.firewallColumn.width;
            const colH = TARGET_SIZES.firewallColumn.height;

            // Base
            ctx.drawImage(baseImg, -baseW / 2, -baseH, baseW, baseH);

            // Columns rising into sky
            const baseHeight = baseH * 0.7;
            const colHStep = colH * 0.7;

            for (let i = 0; i < this.columnCount; i++) {
                ctx.save();
                const yPos = -baseHeight - i * colHStep;
                ctx.translate(0, yPos);
                ctx.scale(this.columnFlips[i], 1);
                ctx.drawImage(colImg, -colW / 2, -colH, colW, colH);
                ctx.restore();
            }

            ctx.restore();
        }
    }

    // =========================================================================
    // PLAYER FROG (PENDULUM GRAVITY & TONGUE SPRING PHYSICS)
    // =========================================================================
    class Frog {
        constructor(x, y) {
            this.startX = x;
            this.startY = y;
            this.reset();
        }

        reset() {
            this.x = this.startX;
            this.y = this.startY;
            this.rotation = Math.PI / 2;
            this.sitting = true;
            this.hooked = false;
            this.hookedObj = null;
            this.hookLength = 0;
            this.initialHookLength = 0;
            this.angularVelocity = 0;
            this.velocityAngle = 0;
            this.vx = 0;
            this.vy = 0;
            this.collisionRadius = 38;
            this.isGliding = false;
            this.spinAngleTotal = 0;
            this.spinChargeLevel = 0;
            this.spinDirection = 0;
            this.continuousSpinAngle = 0;
            this.onChargeLevelUp = null;
            this.slingshotBoostLevel = 0;
            this.slingshotBoostTimer = 0;
        }

        attach(hook, sounds) {
            if (hook && hook.enabled) {
                const wasSitting = this.sitting;
                this.hooked = true;
                this.sitting = false;
                this.isGliding = false;
                this.hookedObj = hook;
                this.spinAngleTotal = 0;
                this.spinChargeLevel = 0;
                this.spinDirection = 0;
                this.continuousSpinAngle = 0;

                const dx = this.x - hook.x;
                const dy = this.y - hook.y;
                this.hookLength = Math.max(PLAYER_TONGUE_RANGE_MIN, Math.sqrt(dx * dx + dy * dy));
                this.initialHookLength = this.hookLength;
                this.velocityAngle = Math.atan2(dy, dx);

                if (wasSitting) {
                    this.angularVelocity = -0.042;
                    this.vx = 9.0;
                    this.vy = -6.0;
                } else {
                    const currentDir = Math.atan2(this.vy, this.vx);
                    const magnitude = Math.sin(currentDir - this.velocityAngle) * PLAYER_ATTACH_MULTIPLIER;
                    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    const rawAngular = (magnitude * speed) / this.hookLength;
                    // Initial angular velocity safety governor (prevents centrifuge runaway while allowing loops)
                    const MAX_ANGULAR_VEL = 0.088;
                    this.angularVelocity = Math.max(-MAX_ANGULAR_VEL, Math.min(MAX_ANGULAR_VEL, rawAngular));
                }

                this.rotation = this.velocityAngle + Math.PI;
                sounds.play('frogTongue');
            } else {
                sounds.play('noTarget');
            }
        }

        release(sounds, onSweetSpot, onSpinRelease) {
            if (this.hooked && this.hookedObj) {
                // Tangential launch velocity
                const normalAngle = this.velocityAngle + Math.PI / 2;
                const rawVx = this.angularVelocity * this.hookLength * Math.cos(normalAngle);
                const rawVy = this.angularVelocity * this.hookLength * Math.sin(normalAngle);
                const tangentialSpeed = Math.abs(this.angularVelocity) * this.hookLength;

                // Optimal forward swing window
                let isSweetSpot = false;
                if (rawVx > 10 && tangentialSpeed > 14) {
                    isSweetSpot = true;
                }

                const chargeLevel = this.spinChargeLevel;

                this.hookedObj.disable();
                this.hookedObj = null;
                this.hooked = false;

                let mult = 1.06; // Balanced launch multiplier
                let vyBonus = 3.2; // Controlled lift
                if (isSweetSpot) {
                    mult = 1.16; // Satisfying sweet spot boost
                    vyBonus = 4.0;
                    if (onSweetSpot) onSweetSpot(this.x, this.y);
                }

                // Centrifugal Wind-up Slingshot Launch Boost
                // Supercharged multipliers reflecting true centrifugal momentum
                let spinMult = 1.0;
                let boostVxBonus = 0;
                let boostVyBonus = 0;

                if (chargeLevel > 0) {
                    if (chargeLevel === 1) {
                        spinMult = 1.45;
                        boostVxBonus = 6.0;
                        boostVyBonus = -3.5;
                    } else if (chargeLevel === 2) {
                        spinMult = 1.80;
                        boostVxBonus = 11.0;
                        boostVyBonus = -5.5;
                    } else {
                        spinMult = 2.25;
                        boostVxBonus = 17.0;
                        boostVyBonus = -8.0;
                    }

                    this.slingshotBoostLevel = chargeLevel;
                    this.slingshotBoostTimer = 75 + chargeLevel * 25; // Sustained supersonic flight window

                    if (sounds && sounds.playSlingshotRelease) sounds.playSlingshotRelease(chargeLevel);
                    if (onSpinRelease) onSpinRelease(chargeLevel, this.x, this.y);
                } else {
                    this.slingshotBoostLevel = 0;
                    this.slingshotBoostTimer = 0;
                }

                this.vx = rawVx * mult * spinMult;
                if (chargeLevel > 0 && this.vx > 0) {
                    this.vx += boostVxBonus;
                }
                this.vy = rawVy * mult * Math.min(1.35, spinMult) - vyBonus + boostVyBonus;

                // CRITICAL SAFETY CAPS:
                // 1. Upward Launch Limit: Prevents rocket launch into the empty stratosphere (-3000px)!
                const maxUpwardVy = -15.0 - chargeLevel * 1.5; // Up to -19.5 for L3
                this.vy = Math.max(maxUpwardVy, Math.min(21.0, this.vy));
                // 2. Forward Velocity Cap: High ceiling allowing true high-speed slingshot momentum
                const maxForwardVx = 22.0 + chargeLevel * 5.5; // L1: 27.5, L2: 33.0, L3: 38.5!
                this.vx = Math.max(-8.0, Math.min(maxForwardVx, this.vx));

                this.hookLength = 0;
                this.spinChargeLevel = 0;
                this.spinAngleTotal = 0;
                this.spinDirection = 0;
                this.continuousSpinAngle = 0;
            }
        }

        bounce() {
            if (this.hooked) {
                this.angularVelocity = -Math.sign(this.angularVelocity) * Math.min(Math.abs(this.angularVelocity), 0.04);
            } else {
                // Fixed-energy trampoline spring bounce: reliable, crisp, never compounding to stratosphere
                this.vy = -Math.min(Math.max(Math.abs(this.vy) * 0.9, 11.0), 14.0);
                this.vx = Math.max(this.vx, 8.5);
            }
        }

        update(isAirBraking = false, keys = null) {
            if (this.sitting) return;

            if (this.hooked && this.hookedObj) {
                this.isGliding = false;

                // Hook Angle from pivot to frog:
                // x = hook.x + L*cos(hookAngle), y = hook.y + L*sin(hookAngle)
                const hookAngle = Math.atan2(this.y - this.hookedObj.y, this.x - this.hookedObj.x);
                const sinAngle = Math.sin(hookAngle);

                // Active WASD / Arrow Key Tongue & Swing Pumping Controls
                if (keys) {
                    // W or Up: Reel in tongue (shorten distance, climb upward away from water/abyss)
                    if (keys.up) {
                        const minLen = 175;
                        if (this.hookLength > minLen) {
                            const oldLen = this.hookLength;
                            this.hookLength = Math.max(minLen, this.hookLength - 7.5);
                            // Conservation of momentum: shortening radius boosts angular velocity
                            this.angularVelocity *= (oldLen / this.hookLength);
                        }
                    }
                    // S or Down: Reel out tongue (lengthen distance, descend lower)
                    if (keys.down) {
                        const maxLen = 950;
                        if (this.hookLength < maxLen) {
                            this.hookLength = Math.min(maxLen, this.hookLength + 7.5);
                        }
                    }

                    // A/D & Left/Right Screen-Intuitive Swing Pumping:
                    // 1. Bottom Half (y > hook.y, sinAngle > 0):
                    //    - Right (D / ArrowRight): pushes RIGHT across bottom -> angularVelocity DECREASES (counter-clockwise)
                    //    - Left (A / ArrowLeft): pushes LEFT across bottom -> angularVelocity INCREASES (clockwise)
                    // 2. Top Half (y <= hook.y, sinAngle <= 0):
                    //    - Left (A / ArrowLeft): pushes LEFT over top -> angularVelocity DECREASES (counter-clockwise loop)
                    //    - Right (D / ArrowRight): pushes RIGHT over top -> angularVelocity INCREASES (clockwise loop)
                    // 3. Smooth Horizontal Transition:
                    //    - Near horizontal (|sinAngle| < 0.18), momentum carries cleanly without abrupt braking traps!
                    const pumpForce = 0.0090;
                    const inBottomHalf = (sinAngle > 0);
                    const isNearHorizontal = Math.abs(sinAngle) < 0.18;

                    let torque = 0;
                    if (inBottomHalf) {
                        if (keys.right) {
                            torque -= pumpForce;
                        }
                        if (keys.left) {
                            torque += pumpForce;
                        }
                    } else {
                        // Top half over the hook
                        if (keys.left) {
                            // Left drives counter-clockwise over the top to the left
                            torque -= pumpForce;
                        }
                        if (keys.right) {
                            // Right drives clockwise over the top to the right
                            torque += pumpForce;
                        }
                    }

                    // Near-horizontal momentum smoothing:
                    // If moving fast through horizontal, assist or smoothly preserve momentum
                    if (isNearHorizontal) {
                        if (this.angularVelocity < -0.015 && keys.right) {
                            torque = Math.min(torque, -pumpForce * 0.7);
                        } else if (this.angularVelocity > 0.015 && keys.left) {
                            torque = Math.max(torque, pumpForce * 0.7);
                        }
                    }

                    // Tactile swing timing juice: +30% boost when pumping in swing direction
                    if ((torque < 0 && this.angularVelocity < 0) || (torque > 0 && this.angularVelocity > 0)) {
                        torque *= 1.30;
                    }

                    this.angularVelocity += torque;
                }

                // Pendulum physics around hook
                const perpAccel = PLAYER_GRAVITY * Math.sin(hookAngle + Math.PI / 2);
                this.angularVelocity += perpAccel / this.hookLength;
                this.angularVelocity *= PLAYER_ANGULAR_DAMPENING;

                // Track genuine single-direction continuous revolutions around hook (2*PI radians = 1 full 360 loop)
                // Fixes the pendulum oscillation false-charging bug
                if (Math.abs(this.angularVelocity) > 0.004) {
                    const dir = Math.sign(this.angularVelocity);
                    if (this.spinDirection === 0) {
                        this.spinDirection = dir;
                    }
                    if (dir === this.spinDirection) {
                        this.continuousSpinAngle += Math.abs(this.angularVelocity);
                    } else {
                        // Swing direction reversed -> reset continuous loop progress!
                        this.spinDirection = dir;
                        this.continuousSpinAngle = 0;
                    }
                }

                const fullRotations = Math.floor(this.continuousSpinAngle / (Math.PI * 2));
                const targetCharge = Math.min(3, fullRotations);

                if (targetCharge > this.spinChargeLevel) {
                    this.spinChargeLevel = targetCharge;
                    if (this.onChargeLevelUp) {
                        this.onChargeLevelUp(this.spinChargeLevel, this.x, this.y);
                    }
                }

                // Conservation of Angular Momentum & Parametric Pumping
                if (this.spinChargeLevel > 0) {
                    // Tongue wraps & tightens slightly by 5.5% per level
                    const targetLength = Math.max(PLAYER_TONGUE_RANGE_MIN, this.initialHookLength * (1 - this.spinChargeLevel * 0.055));
                    this.hookLength += (targetLength - this.hookLength) * 0.08;

                    // Subtle continuous rotational pumping
                    const pumpMult = 1 + this.spinChargeLevel * 0.0012;
                    this.angularVelocity *= pumpMult;
                }

                // Dynamic angular velocity limit scaled by charge level
                // 0.092 provides the kinetic energy needed to easily complete 360 loops over the top
                const maxAngular = 0.092 + this.spinChargeLevel * 0.008;
                this.angularVelocity = Math.max(-maxAngular, Math.min(maxAngular, this.angularVelocity));
                this.velocityAngle += this.angularVelocity;

                this.vx = (this.hookedObj.x + this.hookLength * Math.cos(this.velocityAngle)) - this.x;
                this.vy = (this.hookedObj.y + this.hookLength * Math.sin(this.velocityAngle)) - this.y;

                this.x += this.vx;
                this.y += this.vy;
                this.rotation = hookAngle + Math.PI;
            } else {
                // Free parabolic flight
                this.isGliding = isAirBraking;

                if (isAirBraking) {
                    // Player holds Space/Click in air: Aerodynamic Air-Brake & Feather Glide!
                    if (Math.abs(this.vx) > 10.5) {
                        this.vx *= 0.952; // Crisp, responsive deceleration to comfortable cruising speed
                    }
                    this.vy += PLAYER_GRAVITY * 0.38; // 62% cushioned gravity float
                    if (this.vy > 5.0) {
                        this.vy *= 0.92; // Gentle feather descent
                    }
                } else {
                    // Slingshot Boost Flight Mechanics: zero artificial drag during boost timer!
                    if (this.slingshotBoostTimer > 0) {
                        this.slingshotBoostTimer--;
                        // Cushion gravity slightly during boost (low-arc slingshot trajectory)
                        this.vy += PLAYER_GRAVITY * (this.slingshotBoostLevel >= 2 ? 0.72 : 0.85);
                        // Very light aerodynamic resistance only at extreme hypersonic velocities
                        if (this.vx > 34.0) {
                            this.vx *= 0.994;
                        }
                    } else {
                        // Natural aerodynamic cruising drag when not in slingshot boost
                        if (this.vx > 18.0) {
                            this.vx *= 0.985;
                        }
                        this.vy += PLAYER_GRAVITY;
                    }
                }

                // Terminal fall velocity clamp
                this.vy = Math.min(18.0, this.vy);

                // Sky ceiling boundary: prevents frog from ever being stranded in outer space
                if (this.y < -1650) {
                    this.vy += 1.8;
                }

                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.angularVelocity * PLAYER_SPIN_MAGNITUDE;
            }
        }

        draw(ctx, assets, hasGuardianSwarm = false) {
            // Draw Range Indicator Circle around frog (radius 1000, diameter 2000)
            const rangeImg = assets.get('rangeIndicator');
            if (rangeImg) {
                ctx.save();
                ctx.globalAlpha = 0.12;
                const rw = TARGET_SIZES.rangeIndicator.width;
                const rh = TARGET_SIZES.rangeIndicator.height;
                ctx.drawImage(rangeImg, this.x - rw / 2, this.y - rh / 2, rw, rh);
                ctx.restore();
            }

            // Draw tongue line if hooked
            if (this.hooked && this.hookedObj) {
                ctx.save();
                let tongueColor = '#ff69b4';
                let tongueWidth = 10;
                let tongueGlow = null;

                if (this.spinChargeLevel === 1) {
                    tongueColor = '#ffd700';
                    tongueWidth = 12;
                    tongueGlow = '#ffd700';
                } else if (this.spinChargeLevel === 2) {
                    tongueColor = '#00f0ff';
                    tongueWidth = 14;
                    tongueGlow = '#00f0ff';
                } else if (this.spinChargeLevel >= 3) {
                    tongueColor = '#ffffff';
                    tongueWidth = 16;
                    tongueGlow = '#00ffff';
                }

                if (tongueGlow) {
                    ctx.shadowColor = tongueGlow;
                    ctx.shadowBlur = 18;
                }

                ctx.strokeStyle = tongueColor;
                ctx.lineWidth = tongueWidth;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.hookedObj.x, this.hookedObj.y);
                ctx.stroke();

                // Tongue tip ellipse
                ctx.fillStyle = tongueColor;
                ctx.beginPath();
                ctx.arc(this.hookedObj.x, this.hookedObj.y, tongueWidth + 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Draw Frog Body
            const frogImg = assets.get('frog');
            if (frogImg) {
                ctx.save();
                ctx.translate(this.x, this.y);
                // Subtle breathing scale when resting on lilypad
                if (this.sitting) {
                    const breathe = 1 + Math.sin(Date.now() * 0.005) * 0.035;
                    ctx.scale(breathe, 2 - breathe);
                }
                ctx.rotate(this.rotation);
                const fw = TARGET_SIZES.frog.width;
                const fh = TARGET_SIZES.frog.height;
                ctx.drawImage(frogImg, -fw / 2, -fh / 2, fw, fh);
                ctx.restore();
            }

            // Draw Centrifugal Wind-Up Spin Aura while hooked or in slingshot boost flight
            const activeCharge = this.hooked ? this.spinChargeLevel : (this.slingshotBoostTimer > 0 ? this.slingshotBoostLevel : 0);
            if (activeCharge > 0) {
                ctx.save();
                ctx.translate(this.x, this.y);
                const t = Date.now() * 0.008;
                const charge = activeCharge;
                const auraColor = charge === 1 ? '#ffd700' : (charge === 2 ? '#00f0ff' : '#ff7700');

                ctx.strokeStyle = auraColor;
                ctx.shadowColor = auraColor;
                ctx.shadowBlur = 22;

                // Primary spinning orbital ring
                ctx.save();
                ctx.rotate(t * 3.5);
                ctx.lineWidth = 3 + charge;
                ctx.beginPath();
                ctx.arc(0, 0, 48 + charge * 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();

                // Secondary counter-rotating dashed ring (Level 2 & 3)
                if (charge >= 2) {
                    ctx.save();
                    ctx.rotate(-t * 4.5);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([14, 14]);
                    ctx.beginPath();
                    ctx.arc(0, 0, 62 + charge * 6, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }

                // Level 3 Hyper-Nova radiating plasma shockwave
                if (charge >= 3) {
                    const pulseR = 56 + (Math.sin(t * 12) * 14 + 14);
                    ctx.save();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }

                // Orbiting plasma sparks
                const numSparks = charge * 4;
                for (let i = 0; i < numSparks; i++) {
                    const sparkAngle = t * 4 + (i * Math.PI * 2) / numSparks;
                    const sparkDist = 52 + charge * 8;
                    const sx = Math.cos(sparkAngle) * sparkDist;
                    const sy = Math.sin(sparkAngle) * sparkDist;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(sx, sy, 3 + charge, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Diegetic HUD level badge above frog
                ctx.fillStyle = auraColor;
                ctx.font = '900 24px Consolas, monospace';
                ctx.textAlign = 'center';
                const badgeLabel = this.hooked 
                    ? (charge === 3 ? '⚡ L3 MAX ⚡' : `⚡ L${charge}`)
                    : (charge === 3 ? '🔥 HYPER-NOVA BOOST! 🔥' : (charge === 2 ? '⚡ MEGA BOOST! ⚡' : '✦ SLINGSHOT BOOST! ✦'));
                ctx.fillText(badgeLabel, 0, -68 - charge * 8);

                ctx.restore();
            }

            // Draw Aerodynamic Glide Wings / Air-Brake Contrails if braking in air
            if (this.isGliding) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                const pulse = 0.75 + 0.25 * Math.sin(Date.now() * 0.02);
                ctx.strokeStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 18;
                ctx.lineWidth = 4;
                ctx.globalAlpha = 0.85 * pulse;

                // Dual aerodynamic air-brake feather winglets
                ctx.beginPath();
                ctx.moveTo(-20, 10);
                ctx.quadraticCurveTo(-60, 20, -85, 45);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(20, 10);
                ctx.quadraticCurveTo(60, 20, 85, 45);
                ctx.stroke();

                // Wind cushion bow shockwave arc
                ctx.beginPath();
                ctx.arc(0, 25, 42, Math.PI * 0.15, Math.PI * 0.85);
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.restore();
            }

            // Draw Guardian Fireflies floating around the frog if clutch rescue is ready
            if (hasGuardianSwarm && !this.sitting) {
                const t = Date.now() * 0.005;
                for (let i = 0; i < 2; i++) {
                    const orbitAngle = t + i * Math.PI;
                    const orbitR = 48 + Math.sin(t * 3 + i) * 10;
                    const gx = this.x + Math.cos(orbitAngle) * orbitR;
                    const gy = this.y + Math.sin(orbitAngle) * orbitR;

                    ctx.save();
                    ctx.shadowColor = '#ffd700';
                    ctx.shadowBlur = 14;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(gx, gy, 4, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.arc(gx - Math.cos(orbitAngle) * 5, gy - Math.sin(orbitAngle) * 5, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
    }

    // =========================================================================
    // VISUAL PARTICLES & GAME JUICE FX
    // =========================================================================
    class Particle {
        constructor(x, y, vx, vy, color, size, maxLife, decay = 0.96) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = size;
            this.life = maxLife;
            this.maxLife = maxLife;
            this.decay = decay;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= this.decay;
            this.vy *= this.decay;
            this.life--;
        }

        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class FloatingText {
        constructor(x, y, text, color = '#ffd700', fontSize = 70, life = 50) {
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color;
            this.fontSize = fontSize;
            this.life = life;
            this.maxLife = life;
        }

        update() {
            this.y -= 3;
            this.life--;
        }

        draw(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
            ctx.fillStyle = this.color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 6;
            ctx.font = `800 ${this.fontSize}px Consolas, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText(this.text, this.x, this.y);
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    }

    // =========================================================================
    // MASTER GAME APPLICATION
    // =========================================================================
    class FrogfliesGame {
        constructor() {
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d', { alpha: false });
            this.assets = new AssetManager();
            this.sounds = new SoundManager();

            // Game State
            this.score = 0;
            this.multiplier = 1.0;
            this.distance = 0;
            this.maxDistance = 0;
            this.gameOver = false;
            this.paused = true;
            this.bestScore = parseInt(localStorage.getItem('frogflies_best_score') || '0', 10);

            // Responsive Virtual Space Dimensions
            this.virtualWidth = 2048;
            this.virtualHeight = 2732;

            // Entities Containers
            this.hooks = [];
            this.lilypads = [];
            this.pickups = [];
            this.rifts = [];
            this.grass = [];
            this.shootingStars = [new ShootingStar(), new ShootingStar()];
            this.firewall = null;
            this.frog = null;
            this.targetHook = null;
            this.highlightRotation = 0;
            this.chronoTimeRemaining = 0;

            // Visual Particles & Juice
            this.particles = [];
            this.floatingTexts = [];
            this.screenShake = 0;
            this.viewOffsetX = 0;
            this.viewOffsetY = 0;
            this.ticks = 0;
            this.isActionHeld = false;
            this.keys = { up: false, down: false, left: false, right: false };
            this.swarmCharges = 1;
            this.swarmMaxCharges = 1;
            this.firefliesSinceRescue = 0;
            this.firefliesPerRescue = 8;
            this.swarmSlowdownTimer = 0;
            this.hudSwarmBadge = document.getElementById('hudSwarmBadge');

            // Fixed Timestep Engine & Simulation Velocity (0x to 4x, default 1.0x)
            this.gameSpeed = parseFloat(localStorage.getItem('frogflies_game_speed') || '1.0');
            this.lastTime = performance.now();
            this.accumulator = 0;

            // Spawners tracking
            this.nextHookX = 0;
            this.nextLilypadX = 0;
            this.nextRiftX = 1400;
            this.nextGrassX = 0;

            // Camera
            this.cameraX = 0;
            this.cameraY = 0;
            this.zoom = 1;

            // DOM Binding
            this.hudBestScore = document.getElementById('hudBestScore');
            this.startPrompt = document.getElementById('startPrompt');
            this.gameOverScreen = document.getElementById('gameOverScreen');
            this.finalScoreNum = document.getElementById('finalScoreNum');
            this.finalMultiplierNum = document.getElementById('finalMultiplierNum');
            this.recordScoreNum = document.getElementById('recordScoreNum');
            this.newBestBadge = document.getElementById('newBestBadge');
            this.screenVignette = document.getElementById('screenVignette');
            this.crtOverlay = document.getElementById('crtOverlay');

            // Biomes & Active 3D Chrono Portal
            this.activePortal = null;
            this.weather = new WeatherParticleSystem();
            this.lotuses = [];
            this.currentBiomeIndex = 0;
            this.nextLotusX = -400;
            this.gateFlash = 0;
            this.warpTimer = 0;
            this.comboStreak = 0;
            this.biomeBannerTimeout = null;
            this.biomeBanner = document.getElementById('biomeBanner');
            this.biomeBannerPre = document.getElementById('biomeBannerPre');
            this.biomeBannerTitle = document.getElementById('biomeBannerTitle');
            this.biomeBannerSub = document.getElementById('biomeBannerSub');

            this.init();
        }

        getBiomeAt(x) {
            for (let i = BIOMES.length - 1; i >= 0; i--) {
                if (x >= BIOMES[i].startDist) return BIOMES[i];
            }
            return BIOMES[0];
        }

        getCurrentBiomeBlend(x) {
            if (this.warpTimer > 0) {
                const current = BIOMES[this.prevBiomeIndex !== undefined ? this.prevBiomeIndex : 0];
                const next = BIOMES[this.targetBiomeIndex !== undefined ? this.targetBiomeIndex : Math.min(this.currentBiomeIndex + 1, BIOMES.length - 1)];
                return { current, next, t: this.biomeTransitionT || 0, index: this.prevBiomeIndex || 0 };
            }
            const current = BIOMES[this.currentBiomeIndex];
            const next = BIOMES[this.currentBiomeIndex];
            return { current, next, t: 0, index: this.currentBiomeIndex };
        }

        showBiomeBanner(biome) {
            if (!this.biomeBanner) return;
            if (this.biomeBannerPre) this.biomeBannerPre.textContent = '✦ ' + (biome.gateName || 'ENTERED SECTOR') + ' ✦';
            if (this.biomeBannerTitle) {
                this.biomeBannerTitle.textContent = biome.name;
                this.biomeBannerTitle.style.textShadow = '0 0 20px ' + biome.floraColor + ', 0 0 45px ' + biome.floraColor;
            }
            if (this.biomeBannerSub) this.biomeBannerSub.textContent = biome.sub;

            this.biomeBanner.classList.add('active');
            if (this.biomeBannerTimeout) clearTimeout(this.biomeBannerTimeout);
            this.biomeBannerTimeout = setTimeout(() => {
                if (this.biomeBanner) this.biomeBanner.classList.remove('active');
            }, 3200);
        }

        drawAuroraCurtains(ctx, blend) {
            const curInt = blend.current && blend.current.auroraIntensity !== undefined ? blend.current.auroraIntensity : 0.2;
            const nextInt = blend.next && blend.next.auroraIntensity !== undefined ? blend.next.auroraIntensity : curInt;
            const intensity = curInt + (nextInt - curInt) * (blend.t || 0);
            if (intensity <= 0.02) return;

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const time = this.ticks * 0.015;

            const col1 = (blend.current && blend.current.auroraColor1) || 'rgba(0, 255, 140, 0.4)';
            const col2 = (blend.current && blend.current.auroraColor2) || 'rgba(0, 200, 255, 0.4)';

            const curtains = [
                { yBase: 380, amp: 90, color: col1, speed: 1.0 },
                { yBase: 520, amp: 130, color: col2, speed: 1.3 },
                { yBase: 680, amp: 80, color: col1, speed: 0.8 }
            ];

            const w = this.virtualWidth;
            for (let c = 0; c < curtains.length; c++) {
                const curtain = curtains[c];
                ctx.save();
                ctx.globalAlpha = Math.min(1, intensity * 0.65);

                ctx.beginPath();
                ctx.moveTo(-100, 0);

                const step = 80;
                for (let x = -100; x <= w + 100; x += step) {
                    const wave1 = Math.sin(x * 0.002 + time * curtain.speed + c * 1.5);
                    const wave2 = Math.cos(x * 0.004 - time * 0.5);
                    const y = curtain.yBase + (wave1 + wave2 * 0.5) * curtain.amp;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w + 100, 0);
                ctx.closePath();

                const grad = ctx.createLinearGradient(0, 0, 0, curtain.yBase + curtain.amp + 180);
                grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
                grad.addColorStop(0.4, curtain.color || 'rgba(0, 255, 200, 0.4)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            }

            ctx.restore();
        }

        async init() {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            window.addEventListener('orientationchange', () => this.resizeCanvas());
            document.addEventListener('fullscreenchange', () => this.resizeCanvas());
            document.addEventListener('webkitfullscreenchange', () => this.resizeCanvas());

            const cabinet = document.getElementById('arcadeCabinet');
            if (window.ResizeObserver && cabinet) {
                const ro = new ResizeObserver(() => this.resizeCanvas());
                ro.observe(cabinet);
                const stage = cabinet.querySelector('.game-stage');
                if (stage) ro.observe(stage);
            }

            await this.assets.loadAll();
            this.bindControls();
            this.setGameSpeed(this.gameSpeed);
            this.resetGame();

            if (this.hudBestScore) {
                this.hudBestScore.textContent = this.bestScore.toLocaleString();
            }

            requestAnimationFrame((t) => this.loop(t));
        }

        resizeCanvas() {
            const cabinet = document.getElementById('arcadeCabinet');
            if (!cabinet || !this.canvas) return;

            const stage = cabinet.querySelector('.game-stage') || cabinet;
            const rect = stage.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = Math.round(rect.width * dpr);
            this.canvas.height = Math.round(rect.height * dpr);

            const isDesktopMode = cabinet.classList.contains('mode-desktop') || 
                                  (!cabinet.classList.contains('mode-phone') && !cabinet.classList.contains('mode-cabinet'));

            this.virtualHeight = 2732;
            if (isDesktopMode) {
                // Adaptive panoramic widescreen: 100% canvas coverage with zero black bars!
                const aspect = rect.width / rect.height;
                this.virtualWidth = Math.round(this.virtualHeight * aspect);
                this.scaleFactor = this.canvas.height / this.virtualHeight;
                this.viewOffsetX = 0;
                this.viewOffsetY = 0;
            } else {
                // Fixed 2048 x 2732 arcade cabinet / phone frame mode
                this.virtualWidth = 2048;
                const scaleX = this.canvas.width / this.virtualWidth;
                const scaleY = this.canvas.height / this.virtualHeight;
                this.scaleFactor = Math.min(scaleX, scaleY);
                this.viewOffsetX = (this.canvas.width - this.virtualWidth * this.scaleFactor) / 2;
                this.viewOffsetY = (this.canvas.height - this.virtualHeight * this.scaleFactor) / 2;
            }
        }

        setGameSpeed(speed) {
            const parsed = parseFloat(speed);
            this.gameSpeed = Math.max(0, Math.min(2, Math.round(parsed * 10) / 10));
            localStorage.setItem('frogflies_game_speed', this.gameSpeed.toString());

            const text = this.gameSpeed.toFixed(1) + 'x';

            const hudVal = document.getElementById('hudSpeedVal');
            if (hudVal) hudVal.textContent = text;

            const popVal = document.getElementById('popoverSpeedVal');
            if (popVal) popVal.textContent = text;

            const drawerVal = document.getElementById('drawerSpeedVal');
            if (drawerVal) drawerVal.textContent = text;

            const hudSlider = document.getElementById('hudSpeedSlider');
            if (hudSlider) hudSlider.value = this.gameSpeed.toString();

            const drawerSlider = document.getElementById('drawerSpeedSlider');
            if (drawerSlider) drawerSlider.value = this.gameSpeed.toString();

            document.querySelectorAll('.speed-chip').forEach(chip => {
                const s = parseFloat(chip.getAttribute('data-speed'));
                chip.classList.toggle('active', Math.abs(s - this.gameSpeed) < 0.05);
            });
        }

        triggerSwarmRescue() {
            if (this.swarmCharges <= 0) return;
            this.swarmCharges = 0;
            this.firefliesSinceRescue = 0;
            this.swarmSlowdownTimer = 22; // 0.36s dramatic time dilation

            // Release frog safely from any hook
            this.frog.release(null);
            // Loft into safe hook playing zone
            this.frog.vy = -14.5;
            this.frog.vx = Math.max(this.frog.vx + 6.0, 16.5);

            // Firewall pushback shockwave
            this.firewall.x -= 450;
            this.screenShake = 14;

            // Spawn 36 golden swarm vortex particles
            for (let i = 0; i < 36; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 8 + Math.random() * 18;
                this.particles.push(new Particle(
                    this.frog.x, this.frog.y + 30,
                    Math.cos(angle) * spd, Math.sin(angle) * spd - 6,
                    i % 3 === 0 ? '#ffffff' : '#ffd700',
                    6 + Math.random() * 5,
                    45 + Math.random() * 20
                ));
            }

            this.sounds.playSwarmRescue();
            this.floatingTexts.push(new FloatingText(this.frog.x, this.frog.y - 90, '✨ GUARDIAN SWARM RESCUE! ✨', '#ffd700', 78, 85));
            this.updateSwarmHud();
        }

        updateSwarmHud() {
            if (!this.hudSwarmBadge) return;
            if (this.swarmCharges > 0) {
                this.hudSwarmBadge.classList.add('ready');
                this.hudSwarmBadge.classList.remove('recharging');
                this.hudSwarmBadge.innerHTML = '<span class="swarm-icon">✨</span><span class="swarm-label">SWARM READY</span>';
            } else {
                this.hudSwarmBadge.classList.remove('ready');
                this.hudSwarmBadge.classList.add('recharging');
                this.hudSwarmBadge.innerHTML = `<span class="swarm-icon">🪲</span><span class="swarm-label">SWARM: ${this.firefliesSinceRescue}/${this.firefliesPerRescue}</span>`;
            }
        }

        resetGame() {
            this.score = 0;
            this.multiplier = 1.0;
            this.distance = 0;
            this.gameOver = false;
            this.paused = true;
            this.particles = [];
            this.floatingTexts = [];
            this.screenShake = 0;
            this.chronoTimeRemaining = 0;
            this.keys = { up: false, down: false, left: false, right: false };
            this.swarmCharges = 1;
            this.firefliesSinceRescue = 0;
            this.swarmSlowdownTimer = 0;
            this.updateSwarmHud();

            const playerStartX = -400;
            const playerStartY = -1300;
            this.maxDistance = playerStartX;

            this.frog = new Frog(playerStartX, playerStartY);
            this.frog.onChargeLevelUp = (level, x, y) => this.onSpinChargeLevelUp(level, x, y);
            this.firewall = new Firewall(FIREWALL_START_X);

            this.hooks = [];
            this.lilypads = [];
            this.pickups = [];
            this.rifts = [];
            this.grass = [];
            this.lotuses = [];
            this.currentBiomeIndex = 0;
            this.prevBiomeIndex = 0;
            this.targetBiomeIndex = 0;
            this.biomeTransitionT = 0;
            this.warpTimer = 0;
            this.warpDuration = 90;
            this.isActionHeld = false;
            this.activePortal = new ChronoPortal3D(BIOMES[0].portalDist, -900, BIOMES[0], 1);
            this.weather = new WeatherParticleSystem();
            this.comboStreak = 0;
            this.gateFlash = 0;
            this.shootingStars = [new ShootingStar(), new ShootingStar()];

            // Initial starting lilypad (vertical stalk down to ground)
            const defaultPad = new Lilypad(playerStartX, playerStartY, false, true);
            defaultPad.stalkRotation = 0;
            this.lilypads.push(defaultPad);
            this.defaultPad = defaultPad;

            // Initial active lilypad layout
            const pad1 = new Lilypad(-480, -500, true, true);
            pad1.stalkRotation = 0.01;
            this.lilypads.push(pad1);

            const pad2 = new Lilypad(-320, -300, true, true);
            pad2.stalkRotation = -0.02;
            this.lilypads.push(pad2);

            const pad3 = new Lilypad(220, -180, true, true);
            pad3.stalkRotation = 0.03;
            this.lilypads.push(pad3);

            const pad4 = new Lilypad(520, -420, true, true);
            pad4.stalkRotation = -0.01;
            this.lilypads.push(pad4);

            // Ladybug perched on decorative lilypad 4
            const ladybug = new Pickup(520, -420 - 40, 'firefly');
            pad4.pickup = ladybug;
            this.pickups.push(ladybug);

            // Initial target hook (ONLY ONE hook on screen at start)
            const firstHook = new Hook(defaultPad.x + 400, defaultPad.y + 200); // (0, -1100)
            this.hooks.push(firstHook);
            this.targetHook = firstHook;

            // Spawner positions
            this.nextHookX = firstHook.x; // 0
            this.nextLilypadX = 520;
            this.nextRiftX = 1400;
            this.nextGrassX = FIREWALL_START_X;
            this.nextLotusX = -400;

            // Spawn initial procedural chunk
            this.spawnWorld();

            if (this.gameOverTimeout) {
                clearTimeout(this.gameOverTimeout);
                this.gameOverTimeout = null;
            }
            if (this.gameOverScreen) {
                this.gameOverScreen.classList.remove('active');
            }
            if (this.screenVignette) {
                this.screenVignette.classList.remove('danger');
            }
            if (this.toggleDrawer) {
                this.toggleDrawer(false);
            }
            const pop = document.getElementById('speedPopover');
            if (pop) pop.classList.remove('active');
        }

        spawnWorld() {
            const spawnMargin = Math.max(this.virtualWidth * 1.5, 6000);

            // Spawner: Hooks
            while (this.nextHookX - this.frog.x < spawnMargin) {
                this.nextHookX += HOOK_SPAWN_X_MIN + HOOK_SPAWN_X_VAR * Math.random();
                const x = this.nextHookX;
                const y = HOOK_SPAWN_Y_MIN + HOOK_SPAWN_Y_VAR * Math.random();
                this.hooks.push(new Hook(x, y));

                if (Math.random() < HOOK_DOUBLE_CHANCE) {
                    const y2 = HOOK_SPAWN_Y_MIN + HOOK_SPAWN_Y_VAR - HOOK_SPAWN_Y_VAR * HOOK_DOUBLE_SPREAD * Math.random();
                    this.hooks.push(new Hook(x, y2));
                }
            }

            // Spawner: Lilypads & Insects
            while (this.nextLilypadX - this.frog.x < spawnMargin) {
                this.nextLilypadX += LILYPAD_SPAWN_X_MIN + LILYPAD_SPAWN_X_VAR * Math.random();
                const x = this.nextLilypadX;
                const y = LILYPAD_SPAWN_Y_MIN + LILYPAD_SPAWN_Y_VAR * Math.random();
                const pad = new Lilypad(x, y);

                // Chance to spawn insect variety above lilypad
                if (Math.random() < LILYPAD_PICKUP_CHANCE) {
                    const roll = Math.random();
                    let insectType = 'firefly';
                    if (roll < 0.12) insectType = 'golden';
                    else if (roll < 0.22) insectType = 'chrono';
                    else if (roll < 0.30) insectType = 'spore';

                    const pickup = new Pickup(x, y - 50 - 100 * Math.random(), insectType);
                    pad.pickup = pickup;
                    this.pickups.push(pickup);
                }

                this.lilypads.push(pad);
            }

            // Spawner: Cosmic Rifts of Infinity
            while (this.nextRiftX - this.frog.x < spawnMargin) {
                this.nextRiftX += 1800 + Math.random() * 2200;
                const rx = this.nextRiftX;
                const ry = -1200 - Math.random() * 800;
                const riftTypes = ['celestial', 'chrono', 'inferno'];
                const rType = riftTypes[Math.floor(Math.random() * riftTypes.length)];
                this.rifts.push(new Rift(rx, ry, rType));
            }

            // Spawner: Marsh Grass
            const grassTypes = ['grassTall', 'grassShort', 'grassAngled'];
            while (this.nextGrassX - this.frog.x < spawnMargin) {
                this.nextGrassX += 10 + 990 * Math.random();
                const x = this.nextGrassX;
                const asset = grassTypes[Math.floor(Math.random() * grassTypes.length)];
                const scale = 1 + 0.15 * (1 - 2 * Math.random());
                this.grass.push(new Grass(x, 200, asset, scale));
            }

            // Spawner: Floating Bioluminescent Lotuses
            while (this.nextLotusX - this.frog.x < spawnMargin) {
                this.nextLotusX += 350 + Math.random() * 450;
                const lx = this.nextLotusX;
                const ly = -25 + (Math.random() - 0.5) * 15;
                const biome = this.getBiomeAt(lx);
                this.lotuses.push(new Lotus(lx, ly, biome.floraColor));
            }
        }

        cleanupWorld() {
            const cullX = this.firewall.x - 400;
            this.hooks = this.hooks.filter(h => h.x >= cullX);
            this.lilypads = this.lilypads.filter(l => !l.destroyed && l.x >= cullX);
            this.pickups = this.pickups.filter(p => !p.destroyed && p.x >= cullX);
            this.rifts = this.rifts.filter(r => r.active && r.x >= cullX);
            this.grass = this.grass.filter(g => g.x >= cullX);
            this.lotuses = this.lotuses.filter(l => l.x >= cullX);
        }

        findTargetHook() {
            let closestHook = null;
            let maxDistanceSq = PLAYER_TONGUE_RANGE_MAX * PLAYER_TONGUE_RANGE_MAX;

            // Check forward hooks
            for (const hook of this.hooks) {
                if (hook !== this.frog.hookedObj && hook.enabled) {
                    const dx = hook.x - this.frog.x;
                    if (dx >= HOOK_SEARCH_OFFSET) {
                        const dy = hook.y - this.frog.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < maxDistanceSq) {
                            maxDistanceSq = distSq;
                            closestHook = hook;
                        }
                    }
                }
            }

            // Fallback backward hooks
            if (!closestHook) {
                for (const hook of this.hooks) {
                    if (hook !== this.frog.hookedObj && hook.enabled) {
                        const dx = hook.x - this.frog.x;
                        if (dx < HOOK_SEARCH_OFFSET && dx > -400) {
                            const dy = hook.y - this.frog.y;
                            const distSq = dx * dx + dy * dy;
                            if (distSq < maxDistanceSq) {
                                maxDistanceSq = distSq;
                                closestHook = hook;
                            }
                        }
                    }
                }
            }

            this.targetHook = closestHook;
        }

        onPlayerActionDown() {
            this.isActionHeld = true;
            if (this.gameOver) {
                this.resetGame();
                return;
            }

            if (this.startPrompt) {
                this.startPrompt.classList.add('hidden');
            }

            this.sounds.startAmbient();

            if (this.paused) {
                this.paused = false;
                if (this.defaultPad) {
                    this.defaultPad.launch(this.sounds);
                }
            }

            this.frog.attach(this.targetHook, this.sounds);
        }

        onSweetSpotHit(x, y) {
            this.comboStreak++;
            this.multiplier = Math.round((this.multiplier + 0.1) * 10) / 10;
            this.score += 150 * this.comboStreak;
            this.sounds.playSweetSpotChime();

            // Golden kinetic sparks explosion
            for (let i = 0; i < 18; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 6 + Math.random() * 16;
                this.particles.push(new Particle(
                    x, y,
                    Math.cos(angle) * spd, Math.sin(angle) * spd,
                    '#ffd700',
                    6 + Math.random() * 5,
                    30 + Math.random() * 15
                ));
            }

            const label = this.comboStreak > 1 
                ? `PERFECT SWING x${this.comboStreak}! +0.1x` 
                : 'PERFECT SWING! +0.1x';
            this.floatingTexts.push(new FloatingText(x, y - 60, label, '#ffd700', 80));
        }

        onSpinChargeLevelUp(level, x, y) {
            this.sounds.playSpinCharge(level);

            if (level === 1) {
                this.screenShake = Math.max(this.screenShake, 3);
                for (let i = 0; i < 14; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const spd = 4 + Math.random() * 8;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * spd, Math.sin(angle) * spd,
                        '#ffd700', 4.5, 35
                    ));
                }
                this.floatingTexts.push(new FloatingText(x, y - 75, '✦ WIND-UP L1! ✦', '#ffd700', 65, 55));
            } else if (level === 2) {
                this.screenShake = Math.max(this.screenShake, 6);
                for (let i = 0; i < 22; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const spd = 6 + Math.random() * 12;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * spd, Math.sin(angle) * spd,
                        i % 2 === 0 ? '#00f0ff' : '#ffffff', 5.5, 45
                    ));
                }
                this.floatingTexts.push(new FloatingText(x, y - 85, '⚡ MEGA CHARGE L2! ⚡', '#00f0ff', 72, 65));
            } else if (level >= 3) {
                this.screenShake = Math.max(this.screenShake, 10);
                for (let i = 0; i < 34; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const spd = 8 + Math.random() * 16;
                    const col = i % 3 === 0 ? '#ffffff' : (i % 3 === 1 ? '#00ffff' : '#ffea00');
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * spd, Math.sin(angle) * spd,
                        col, 7.0, 55
                    ));
                }
                this.floatingTexts.push(new FloatingText(x, y - 95, '🔥 HYPER-NOVA MAX L3! 🔥', '#ffffff', 80, 80));
            }
        }

        onSpinChargeRelease(level, x, y) {
            this.comboStreak++;
            let bonusMult = 0.1;
            let bonusScore = 200;
            let shake = 6;
            let label = '✦ WIND-UP LAUNCH! +0.1x ✦';
            let color = '#ffd700';

            if (level === 2) {
                bonusMult = 0.2;
                bonusScore = 500;
                shake = 10;
                label = '⚡ MEGA SLINGSHOT! +0.2x ⚡';
                color = '#00f0ff';
            } else if (level >= 3) {
                bonusMult = 0.3;
                bonusScore = 1000;
                shake = 16;
                label = '🔥 HYPER-NOVA SLINGSHOT! +0.3x 🔥';
                color = '#ffea00';
            }

            this.multiplier = Math.round((this.multiplier + bonusMult) * 10) / 10;
            this.score += bonusScore * this.comboStreak;
            this.screenShake = Math.max(this.screenShake, shake);

            // Radial shockwave burst
            const count = level * 16;
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 7 + Math.random() * (12 + level * 6);
                const pColor = level >= 3 
                    ? (i % 2 === 0 ? '#ffffff' : '#00ffff')
                    : (level === 2 ? '#00f0ff' : '#ffd700');
                this.particles.push(new Particle(
                    x, y,
                    Math.cos(angle) * spd, Math.sin(angle) * spd,
                    pColor,
                    5 + level * 1.5,
                    40 + level * 10
                ));
            }

            this.floatingTexts.push(new FloatingText(x, y - 80, label, color, 68 + level * 5, 75 + level * 10));
        }

        onPlayerActionUp() {
            this.isActionHeld = false;
            this.frog.release(
                this.sounds, 
                (x, y) => this.onSweetSpotHit(x, y),
                (level, x, y) => this.onSpinChargeRelease(level, x, y)
            );
        }

        onPickupCollected(pickup) {
            let bonusMult = 0.1;
            let label = '+0.1x';
            let color = '#ffd700';

            if (pickup.type === 'golden') {
                bonusMult = 0.3;
                label = 'GOLDEN SCARAB! +0.3x';
                color = '#ffe555';
                this.score += 250;
            } else if (pickup.type === 'chrono') {
                bonusMult = 0.2;
                label = 'CHRONO FOCUS!';
                color = '#00f0ff';
                this.chronoTimeRemaining = 240; // 4 seconds of time dilation!
            } else if (pickup.type === 'spore') {
                bonusMult = 0.2;
                label = 'FIREWALL PUSHBACK!';
                color = '#55ffff';
                this.firewall.x -= 800; // Pushes firewall back!
                this.screenShake = 12;
            }

            // Guardian Firefly Swarm Recharge
            if (this.swarmCharges < this.swarmMaxCharges) {
                this.firefliesSinceRescue++;
                if (this.firefliesSinceRescue >= this.firefliesPerRescue) {
                    this.swarmCharges = 1;
                    this.firefliesSinceRescue = 0;
                    this.sounds.playSwarmRecharged();
                    this.floatingTexts.push(new FloatingText(this.frog.x, this.frog.y - 70, '✨ SWARM READY! ✨', '#ffd700', 72, 75));
                }
                this.updateSwarmHud();
            }

            this.multiplier = Math.round((this.multiplier + bonusMult) * 10) / 10;

            // Spawn sparks
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 4 + Math.random() * 12;
                this.particles.push(new Particle(
                    pickup.x, pickup.y,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    color,
                    6 + Math.random() * 6,
                    35 + Math.random() * 20
                ));
            }
            this.floatingTexts.push(new FloatingText(pickup.x, pickup.y - 70, label, color, 85));
        }

        onLilypadBounce(pad) {
            // Spawn 14 green bounce spores
            for (let i = 0; i < 14; i++) {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
                const speed = 5 + Math.random() * 12;
                this.particles.push(new Particle(
                    this.frog.x, this.frog.y + 40,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    '#55ff99',
                    6 + Math.random() * 6,
                    25 + Math.random() * 15
                ));
            }
            this.screenShake = 8;
        }

        bindControls() {
            const cabinet = document.getElementById('arcadeCabinet');

            // View Mode Switcher (Desktop Panoramic vs Phone Frame vs Cabinet)
            const setViewMode = (mode) => {
                if (!cabinet) return;
                cabinet.classList.remove('mode-desktop', 'mode-phone', 'mode-cabinet');
                cabinet.classList.add('mode-' + mode);
                localStorage.setItem('frogflies_view_mode_v2', mode);
                const pillDesktop = document.getElementById('pillDesktop');
                const pillPhone = document.getElementById('pillPhone');
                const pillCabinet = document.getElementById('pillCabinet');
                if (pillDesktop) pillDesktop.classList.toggle('active', mode === 'desktop');
                if (pillPhone) pillPhone.classList.toggle('active', mode === 'phone');
                if (pillCabinet) pillCabinet.classList.toggle('active', mode === 'cabinet');
                setTimeout(() => this.resizeCanvas(), 50);
                setTimeout(() => this.resizeCanvas(), 150);
                setTimeout(() => this.resizeCanvas(), 300);
            };

            const btnViewMode = document.getElementById('btnViewMode');
            if (btnViewMode) {
                btnViewMode.addEventListener('click', () => {
                    let nextMode = 'desktop';
                    if (cabinet.classList.contains('mode-desktop')) nextMode = 'phone';
                    else if (cabinet.classList.contains('mode-phone')) nextMode = 'cabinet';
                    else nextMode = 'desktop';
                    setViewMode(nextMode);
                });
            }

            const pillDesktop = document.getElementById('pillDesktop');
            const pillPhone = document.getElementById('pillPhone');
            const pillCabinet = document.getElementById('pillCabinet');
            if (pillDesktop) pillDesktop.addEventListener('click', () => setViewMode('desktop'));
            if (pillPhone) pillPhone.addEventListener('click', () => setViewMode('phone'));
            if (pillCabinet) pillCabinet.addEventListener('click', () => setViewMode('cabinet'));

            // Default to desktop mode on desktop screens!
            let savedMode = localStorage.getItem('frogflies_view_mode_v2');
            if (!savedMode) {
                savedMode = (window.innerWidth >= 900) ? 'desktop' : 'phone';
                localStorage.setItem('frogflies_view_mode_v2', savedMode);
            }
            setViewMode(savedMode);

            // Audio unlock on first interaction
            const unlockAudio = () => {
                this.sounds.unlock();
                window.removeEventListener('pointerdown', unlockAudio);
                window.removeEventListener('keydown', unlockAudio);
            };
            window.addEventListener('pointerdown', unlockAudio);
            window.addEventListener('keydown', unlockAudio);

            // Spacebar & Keyboard
            let isSpaceHeld = false;
            window.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

                if (e.code === 'Space') {
                    e.preventDefault();
                    if (!isSpaceHeld) {
                        isSpaceHeld = true;
                        this.onPlayerActionDown();
                    }
                } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                    e.preventDefault();
                    this.keys.up = true;
                } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                    e.preventDefault();
                    this.keys.down = true;
                } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                    e.preventDefault();
                    this.keys.left = true;
                } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                    e.preventDefault();
                    this.keys.right = true;
                } else if (e.code === 'KeyR') {
                    this.resetGame();
                } else if (e.code === 'KeyP') {
                    const cabinet = document.getElementById('arcadeCabinet');
                    if (cabinet) {
                        let nextMode = 'desktop';
                        if (cabinet.classList.contains('mode-desktop')) nextMode = 'phone';
                        else if (cabinet.classList.contains('mode-phone')) nextMode = 'cabinet';
                        else nextMode = 'desktop';
                        const pill = document.getElementById('pill' + nextMode.charAt(0).toUpperCase() + nextMode.slice(1));
                        if (pill) pill.click();
                    }
                } else if (e.code === 'KeyM') {
                    const btnMute = document.getElementById('btnMute');
                    if (btnMute) btnMute.click();
                } else if (e.code === 'KeyF') {
                    const drawerBtnFullscreen = document.getElementById('drawerBtnFullscreen');
                    if (drawerBtnFullscreen) drawerBtnFullscreen.click();
                } else if (e.code === 'Digit1') {
                    this.setGameSpeed(1.0);
                } else if (e.code === 'Digit2') {
                    this.setGameSpeed(2.0);
                } else if (e.code === 'Digit0') {
                    this.setGameSpeed(0.0);
                } else if (e.code === 'BracketLeft' || e.code === 'Minus') {
                    this.setGameSpeed(this.gameSpeed - 0.25);
                } else if (e.code === 'BracketRight' || e.code === 'Equal') {
                    this.setGameSpeed(this.gameSpeed + 0.25);
                } else if (e.code === 'Escape') {
                    const btnCodex = document.getElementById('btnCodex');
                    if (btnCodex) btnCodex.click();
                } else if (e.code === 'Enter') {
                    if (this.gameOver) this.resetGame();
                }
            });

            window.addEventListener('keyup', (e) => {
                if (e.code === 'Space' && isSpaceHeld) {
                    isSpaceHeld = false;
                    e.preventDefault();
                    this.onPlayerActionUp();
                } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                    this.keys.up = false;
                } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                    this.keys.down = false;
                } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
                    this.keys.left = false;
                } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
                    this.keys.right = false;
                }
            });

            // Canvas Pointer / Touch
            if (cabinet) {
                // Prevent touch scroll / pinch zoom on mobile
                cabinet.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

                cabinet.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.hud-top-bar') || e.target.closest('.codex-drawer') || e.target.closest('.gameover-box')) return;
                    e.preventDefault();
                    this.onPlayerActionDown();
                });
                window.addEventListener('mouseup', () => {
                    this.onPlayerActionUp();
                });

                cabinet.addEventListener('touchstart', (e) => {
                    if (e.target.closest('.hud-top-bar') || e.target.closest('.codex-drawer') || e.target.closest('.gameover-box')) return;
                    e.preventDefault();
                    this.onPlayerActionDown();
                }, { passive: false });
                cabinet.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.onPlayerActionUp();
                }, { passive: false });
                cabinet.addEventListener('touchcancel', () => {
                    this.onPlayerActionUp();
                });
                window.addEventListener('blur', () => {
                    this.onPlayerActionUp();
                    this.keys.up = false;
                    this.keys.down = false;
                    this.keys.left = false;
                    this.keys.right = false;
                });
            }

            // Retry Button
            const btnRetry = document.getElementById('btnRetry');
            if (btnRetry) {
                btnRetry.addEventListener('click', () => this.resetGame());
            }

            const btnRestart = document.getElementById('btnRestart');
            if (btnRestart) {
                btnRestart.addEventListener('click', () => this.resetGame());
            }

            // Mute Button
            const btnMute = document.getElementById('btnMute');
            if (btnMute) {
                btnMute.addEventListener('click', () => {
                    const muted = !this.sounds.muted;
                    this.sounds.setMuted(muted);
                    btnMute.classList.toggle('active', muted);
                    btnMute.innerHTML = muted
                        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
                        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
                });
            }

            // CRT Button
            const btnCrt = document.getElementById('btnCrt');
            const switchCrt = document.getElementById('switchCrt');
            const toggleCrt = (active) => {
                if (this.crtOverlay) this.crtOverlay.classList.toggle('disabled', !active);
                if (btnCrt) btnCrt.classList.toggle('active', active);
                if (switchCrt) switchCrt.checked = active;
            };
            if (btnCrt) btnCrt.addEventListener('click', () => toggleCrt(this.crtOverlay.classList.contains('disabled')));
            if (switchCrt) switchCrt.addEventListener('change', (e) => toggleCrt(e.target.checked));

            // Danger Glow Switch
            const switchDangerGlow = document.getElementById('switchDangerGlow');
            if (switchDangerGlow) {
                switchDangerGlow.addEventListener('change', (e) => {
                    this.dangerGlowEnabled = e.target.checked;
                    if (!this.dangerGlowEnabled && this.screenVignette) {
                        this.screenVignette.classList.remove('danger');
                    }
                });
            }

            // Fullscreen controls with robust fallback and responsive sync
            const btnFs = document.getElementById('btnFullscreen');
            const updateFsUI = () => {
                const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || cabinet.classList.contains('mode-fullscreen'));
                if (btnFs) {
                    btnFs.classList.toggle('active', isFs);
                    btnFs.setAttribute('title', isFs ? 'Exit Fullscreen (F)' : 'Fullscreen (F)');
                    btnFs.setAttribute('aria-label', isFs ? 'Exit Fullscreen' : 'Fullscreen');
                    btnFs.innerHTML = isFs
                        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`
                        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
                }
                this.resizeCanvas();
            };

            const toggleFullscreen = () => {
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    if (cabinet.requestFullscreen) {
                        cabinet.requestFullscreen().catch(() => {
                            cabinet.classList.toggle('mode-fullscreen');
                            updateFsUI();
                        });
                    } else if (cabinet.webkitRequestFullscreen) {
                        cabinet.webkitRequestFullscreen();
                    } else {
                        cabinet.classList.toggle('mode-fullscreen');
                        updateFsUI();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen().catch(() => {});
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                    cabinet.classList.remove('mode-fullscreen');
                }
                setTimeout(() => updateFsUI(), 50);
                setTimeout(() => updateFsUI(), 150);
                setTimeout(() => updateFsUI(), 300);
            };

            if (btnFs) {
                btnFs.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                });
            }

            document.addEventListener('fullscreenchange', () => {
                updateFsUI();
            });
            document.addEventListener('webkitfullscreenchange', () => {
                updateFsUI();
            });

            // Codex Drawer
            const btnCodex = document.getElementById('btnCodex');
            const codexDrawer = document.getElementById('codexDrawer');
            const drawerBackdrop = document.getElementById('drawerBackdrop');
            const btnCloseDrawer = document.getElementById('btnCloseDrawer');

            const toggleDrawer = (open) => {
                if (codexDrawer) codexDrawer.classList.toggle('open', open);
                if (drawerBackdrop) drawerBackdrop.classList.toggle('active', open);
            };
            this.toggleDrawer = toggleDrawer;

            if (btnCodex) btnCodex.addEventListener('click', () => toggleDrawer(!codexDrawer.classList.contains('open')));
            if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', () => toggleDrawer(false));
            if (drawerBackdrop) drawerBackdrop.addEventListener('click', () => toggleDrawer(false));

            // Soundboard Chips
            document.querySelectorAll('.sfx-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const soundKey = chip.getAttribute('data-sound');
                    this.sounds.play(soundKey);
                });
            });

            // Speed Controller (0x to 4x)
            const btnSpeed = document.getElementById('btnSpeed');
            const speedPopover = document.getElementById('speedPopover');
            if (btnSpeed && speedPopover) {
                btnSpeed.addEventListener('click', (e) => {
                    e.stopPropagation();
                    speedPopover.classList.toggle('active');
                });

                window.addEventListener('click', (e) => {
                    if (!e.target.closest('.hud-speed-wrapper')) {
                        speedPopover.classList.remove('active');
                    }
                });
            }

            const hudSpeedSlider = document.getElementById('hudSpeedSlider');
            if (hudSpeedSlider) {
                hudSpeedSlider.addEventListener('input', (e) => {
                    this.setGameSpeed(parseFloat(e.target.value));
                });
            }

            const drawerSpeedSlider = document.getElementById('drawerSpeedSlider');
            if (drawerSpeedSlider) {
                drawerSpeedSlider.addEventListener('input', (e) => {
                    this.setGameSpeed(parseFloat(e.target.value));
                });
            }

            document.querySelectorAll('.speed-chip').forEach(chip => {
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const spd = parseFloat(chip.getAttribute('data-speed'));
                    this.setGameSpeed(spd);
                    if (speedPopover) speedPopover.classList.remove('active');
                });
            });

            const drawerBtnFullscreen = document.getElementById('drawerBtnFullscreen');
            if (drawerBtnFullscreen) {
                drawerBtnFullscreen.addEventListener('click', () => toggleFullscreen());
            }
        }

        triggerGameOver() {
            if (this.gameOver) return;
            this.gameOver = true;
            this.frog.release();
            this.sounds.play('frogDeath');

            // Fiery death explosion particles
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 4 + Math.random() * 16;
                this.particles.push(new Particle(
                    this.frog.x, this.frog.y,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    Math.random() < 0.5 ? '#ff2200' : '#ff9900',
                    8 + Math.random() * 8,
                    45 + Math.random() * 25
                ));
            }
            this.screenShake = 18;

            if (this.score > this.bestScore) {
                this.bestScore = Math.floor(this.score);
                localStorage.setItem('frogflies_best_score', this.bestScore.toString());
                if (this.hudBestScore) {
                    this.hudBestScore.textContent = this.bestScore.toLocaleString();
                }
                if (this.newBestBadge) {
                    this.newBestBadge.style.display = 'block';
                }
            } else if (this.newBestBadge) {
                this.newBestBadge.style.display = 'none';
            }

            if (this.finalScoreNum) this.finalScoreNum.textContent = Math.floor(this.score).toLocaleString();
            if (this.finalMultiplierNum) this.finalMultiplierNum.textContent = this.multiplier.toFixed(1) + 'x';
            if (this.recordScoreNum) this.recordScoreNum.textContent = this.bestScore.toLocaleString();

            if (this.gameOverTimeout) clearTimeout(this.gameOverTimeout);
            this.gameOverTimeout = setTimeout(() => {
                if (this.gameOverScreen && this.gameOver) {
                    this.gameOverScreen.classList.add('active');
                }
            }, 300);

            if (this.screenVignette) {
                this.screenVignette.classList.remove('danger');
            }
        }

        triggerWarpJump(portal) {
            portal.passed = true;
            this.warpDuration = 90;
            this.warpTimer = this.warpDuration;
            this.prevBiomeIndex = this.currentBiomeIndex;
            this.targetBiomeIndex = portal.targetBiomeIndex !== undefined ? portal.targetBiomeIndex : Math.min(this.currentBiomeIndex + 1, BIOMES.length - 1);
            this.biomeTransitionT = 0.0;

            this.gateFlash = 1.0;
            this.screenShake = 22;
            this.firewall.x -= 900; // Major breathing room reward for reaching milestone
            this.score += 2500;
            this.multiplier = Math.round((this.multiplier + 0.5) * 10) / 10;
            this.sounds.playWarpBoom();
            this.sounds.playGateChime();

            // Controlled Hyperspace Slingshot Velocity (smooth, thrilling, fully controllable)
            this.frog.release();
            this.frog.vx = 17.5;
            this.frog.vy = -4.5;

            // Target biome announcement timed to climax of warp jump
            const newBiome = BIOMES[this.targetBiomeIndex];
            setTimeout(() => {
                this.showBiomeBanner(newBiome);
            }, 400);

            // Spawn next 3D Chrono Portal far ahead in target sector
            const nextIdx = Math.min(this.targetBiomeIndex + 1, BIOMES.length - 1);
            this.activePortal = new ChronoPortal3D(newBiome.portalDist, -900, newBiome, nextIdx);

            // Wormhole Nova Burst
            const burstColor = newBiome.portalColor || '#00f0ff';
            for (let i = 0; i < 55; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 8 + Math.random() * 26;
                this.particles.push(new Particle(
                    portal.x, portal.y,
                    Math.cos(angle) * spd, Math.sin(angle) * spd,
                    i % 2 === 0 ? '#ffffff' : burstColor,
                    8 + Math.random() * 8,
                    55 + Math.random() * 25
                ));
            }
            this.floatingTexts.push(new FloatingText(portal.x, portal.y - 180, '✦ HYPERSPACE WARP! +0.5x ✦', burstColor, 110));
        }

        update() {
            if (this.gameOver || this.paused) return;

            this.ticks++;
            this.highlightRotation += 0.03;

            // Chrono Focus countdown
            if (this.chronoTimeRemaining > 0) {
                this.chronoTimeRemaining--;
                this.firewall.speed = Math.max(1.0, FIREWALL_SPEED_BASE * 0.4);
            }

            // Frog Update with Air-Braking check
            const isAirBraking = this.isActionHeld && !this.frog.hooked && !this.frog.sitting;
            this.frog.update(isAirBraking, this.keys);

            // Spawn dynamic aerodynamic air-braking wisps & motes when braking in air
            if (isAirBraking && Math.random() < 0.45) {
                const angle = this.frog.rotation + Math.PI + (Math.random() - 0.5) * 0.7;
                const speed = 2.5 + Math.random() * 4.5;
                this.particles.push(new Particle(
                    this.frog.x, this.frog.y,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    '#00f0ff',
                    4 + Math.random() * 4,
                    22 + Math.random() * 12,
                    0.91
                ));
            }

            // Firewall Update
            this.firewall.update(this.frog.sitting, this.frog.x);

            // Distance & Score Calculation
            if (!this.frog.sitting) {
                if (this.frog.x > this.maxDistance) {
                    const deltaDist = this.frog.x - this.maxDistance;
                    this.score += deltaDist * SCORE_PER_DISTANCE * this.multiplier;
                    this.maxDistance = this.frog.x;
                }
            }

            // Spawners & Cleanup
            this.spawnWorld();
            this.cleanupWorld();

            // Update entities
            for (const h of this.hooks) h.update();
            for (const l of this.lilypads) l.update();
            for (const p of this.pickups) p.update();
            for (const r of this.rifts) r.update();
            for (const s of this.shootingStars) s.update(this.virtualWidth, this.virtualHeight);
            for (const lotus of this.lotuses) lotus.update();
            this.weather.update(BIOMES[this.currentBiomeIndex], this.virtualWidth, this.virtualHeight);

            // Hyperspace Warp Speed progress & smooth biome cross-fade
            if (this.warpTimer > 0) {
                this.warpTimer--;
                const rawT = 1.0 - (this.warpTimer / this.warpDuration);
                // Sinusoidal ease-in-out
                this.biomeTransitionT = 0.5 - 0.5 * Math.cos(rawT * Math.PI);
                // Zero-G cosmic levitation during hyperspace warp
                this.frog.vy = -Math.sin(rawT * Math.PI) * 2.5;
                this.firewall.x = this.frog.x - FIREWALL_DISTANCE_MAX;
                if (this.warpTimer === 0) {
                    this.currentBiomeIndex = this.targetBiomeIndex;
                    this.biomeTransitionT = 0.0;
                }
            } else {
                this.biomeTransitionT = 0.0;
            }

            // 3D Chrono Portal Gravitational Physics & Auto-Catchment Threshold
            if (this.activePortal && !this.activePortal.passed) {
                this.activePortal.update(this.frog);
                const pDx = this.activePortal.x - this.frog.x;
                const pDy = this.activePortal.y - this.frog.y;
                const pDist = Math.sqrt(pDx * pDx + pDy * pDy);
                // Direct singularity radius OR forward plane crossing in flight zone
                const crossedGateway = this.frog.x >= (this.activePortal.x - 120) && Math.abs(this.frog.y - this.activePortal.y) < 700;
                if (pDist < 180 || crossedGateway) {
                    this.triggerWarpJump(this.activePortal);
                }
            }

            // Gate flash decay
            if (this.gateFlash > 0.005) {
                this.gateFlash *= 0.91;
            } else {
                this.gateFlash = 0;
            }

            // Particles & Floating texts update
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update();
                if (this.particles[i].life <= 0) this.particles.splice(i, 1);
            }
            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                this.floatingTexts[i].update();
                if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
            }

            // Screen shake dampening
            if (this.screenShake > 0) {
                this.screenShake *= 0.88;
                if (this.screenShake < 0.2) this.screenShake = 0;
            }

            // Free flight trail sparks and slingshot supersonic plasma contrails
            if (!this.frog.sitting && !this.frog.hooked) {
                const speed = Math.sqrt(this.frog.vx * this.frog.vx + this.frog.vy * this.frog.vy);
                
                // Supersonic Slingshot Boost Plasma Trail
                if (this.frog.slingshotBoostTimer > 0) {
                    const bLevel = this.frog.slingshotBoostLevel;
                    const trailColor = bLevel >= 3 ? '#ffea00' : (bLevel === 2 ? '#00f0ff' : '#ffd700');
                    const numParticles = 2 + bLevel;
                    for (let p = 0; p < numParticles; p++) {
                        this.particles.push(new Particle(
                            this.frog.x + (Math.random() - 0.5) * 26,
                            this.frog.y + (Math.random() - 0.5) * 26,
                            -this.frog.vx * (0.2 + Math.random() * 0.15),
                            -this.frog.vy * 0.15 + (Math.random() - 0.5) * 3,
                            trailColor,
                            6 + bLevel * 2.5,
                            24 + bLevel * 8,
                            0.90
                        ));
                    }
                } else if (speed > 10 && Math.random() < 0.5) {
                    this.particles.push(new Particle(
                        this.frog.x + (Math.random() - 0.5) * 20,
                        this.frog.y + (Math.random() - 0.5) * 20,
                        -this.frog.vx * 0.15, -this.frog.vy * 0.15,
                        'rgba(0, 240, 255, 0.45)',
                        5 + Math.random() * 4,
                        18,
                        0.93
                    ));
                }
            }

            // Hook target selector
            this.findTargetHook();

            // Collision: Frog vs Firefly / Insect Pickups
            for (const p of this.pickups) {
                if (!p.collected) {
                    const dx = p.x - this.frog.x;
                    const dy = p.y - this.frog.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < (p.radius + this.frog.collisionRadius) ** 2) {
                        p.collect(this.sounds, () => {
                            this.multiplier += SCORE_PICKUP_MULTIPLIER;
                            this.onPickupCollected(p);
                        });
                    }
                }
            }

            // Collision: Frog vs Lilypads
            for (const l of this.lilypads) {
                if (l.active && !l.destroying) {
                    const dx = Math.abs(l.x - this.frog.x);
                    const dy = Math.abs(l.y - this.frog.y);
                    const prevY = this.frog.y - this.frog.vy;
                    const sweptY = (Math.min(prevY, this.frog.y) <= l.y + 60 && Math.max(prevY, this.frog.y) >= l.y - 75);

                    if (dx < 137.5 && (dy < 75 || sweptY) && this.frog.vy > 0) {
                        this.frog.y = l.y - 45;
                        this.frog.bounce();
                        l.launch(this.sounds, () => {
                            this.multiplier += SCORE_PICKUP_MULTIPLIER;
                            this.onPickupCollected(l.pickup);
                        });
                        this.onLilypadBounce(l);
                    }
                }
            }

            // Collision: Frog vs Rifts of Infinity (Warp Boost)
            for (const r of this.rifts) {
                if (r.active) {
                    const dx = r.x - this.frog.x;
                    const dy = r.y - this.frog.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < (r.radius + this.frog.collisionRadius) ** 2) {
                        r.active = false;
                        // Hyper warp impulse forward
                        this.frog.release();
                        this.frog.vx = Math.max(this.frog.vx + 16, 22);
                        this.frog.vy = -10;
                        this.multiplier += 0.5;
                        this.screenShake = 16;
                        this.sounds.play('frogBounce', 1.0);

                        // Warp Supernova burst
                        for (let i = 0; i < 35; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const spd = 6 + Math.random() * 18;
                            this.particles.push(new Particle(
                                r.x, r.y,
                                Math.cos(angle) * spd, Math.sin(angle) * spd,
                                r.type === 'chrono' ? '#00f0ff' : (r.type === 'inferno' ? '#ff8800' : '#e066ff'),
                                8 + Math.random() * 8,
                                45 + Math.random() * 25
                            ));
                        }
                        this.floatingTexts.push(new FloatingText(r.x, r.y - 100, 'WARP BOOST! +0.5x', '#00f0ff', 95));
                    }
                }
            }

            // Dynamic firewall crackle sound based on distance (every 60 frames)
            if (this.ticks % 60 === 0 && !this.frog.sitting) {
                const fwDist = this.frog.x - this.firewall.x;
                const volume = Math.pow(1 + Math.max(0, fwDist) / 1000, -1);
                const soundIdx = Math.floor(volume * 4);
                if (soundIdx > 0) {
                    this.sounds.play('fireCrackling' + (soundIdx === 3 ? '2' : soundIdx === 4 ? '4' : '1'), volume);
                }
            }

            // Firewall threat glow proximity
            if (this.screenVignette && (this.dangerGlowEnabled !== false)) {
                const fwDist = this.frog.x - this.firewall.x;
                const isThreat = fwDist < 750 && !this.frog.sitting;
                this.screenVignette.classList.toggle('danger', isThreat);
            }

            // Death conditions: Touch Firewall or Fall below ground level (y > 0)
            const isNearAbyss = (this.frog.y > -90 && this.frog.vy > 0 && !this.targetHook);
            const isFirewallEngulf = (this.frog.x - this.firewall.x < 50);

            if ((this.frog.y > 0 || this.frog.x < this.firewall.x || isNearAbyss || isFirewallEngulf) && this.warpTimer <= 0) {
                if (this.swarmCharges > 0) {
                    this.triggerSwarmRescue();
                } else {
                    this.triggerGameOver();
                }
            }
        }

        renderForegroundTrees(ctx, startX, startY, filterStyle, alpha, scale, camX, shiftFactor) {
            const fgImg = this.assets.get('foreground');
            if (!fgImg) return;
            const fgW = TARGET_SIZES.foreground.width;
            const fgH = TARGET_SIZES.foreground.height;
            const segmentWidth = fgW * 2; // 3200

            ctx.save();
            const shiftX = camX * shiftFactor;
            ctx.translate(startX - shiftX, startY);
            ctx.scale(scale, scale);
            ctx.globalAlpha = alpha;
            if (filterStyle) {
                ctx.filter = filterStyle;
            }

            // Camera anchor in virtual space
            const isDesktop = this.virtualWidth > 2200;
            const anchorX = isDesktop ? Math.round(this.virtualWidth * 0.38) : Math.round(this.virtualWidth / 2);

            // Compute visible range in tree local coordinate space
            const minScreenX = -anchorX / this.zoom - 1200;
            const maxScreenX = (this.virtualWidth - anchorX) / this.zoom + 1200;
            const minCx = (minScreenX - (startX - shiftX)) / scale - segmentWidth;
            const maxCx = (maxScreenX - (startX - shiftX)) / scale + segmentWidth;

            const startCx = Math.floor(minCx / segmentWidth) * segmentWidth;
            for (let cx = startCx; cx <= maxCx; cx += segmentWidth) {
                // Left half (mirrored at cx, extending from cx to cx - fgW)
                ctx.save();
                ctx.translate(cx, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(fgImg, 0, -fgH, fgW, fgH);
                ctx.restore();

                // Right half (normal from cx to cx + fgW)
                ctx.save();
                ctx.translate(cx, 0);
                ctx.drawImage(fgImg, 0, -fgH, fgW, fgH);
                ctx.restore();
            }

            ctx.restore();
        }

        drawWaterSurface(ctx, currentBiome, blend, camX) {
            ctx.save();
            const waterHalfWidth = Math.max(3800, (this.virtualWidth / this.zoom) + 1600);

            if (blend && blend.t > 0.001) {
                // Cross-fade old biome water and new biome water
                ctx.save();
                ctx.globalAlpha = 1.0 - blend.t;
                const waterGradPrev = ctx.createLinearGradient(0, -70, 0, 200);
                waterGradPrev.addColorStop(0, blend.current.waterColor);
                waterGradPrev.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
                ctx.fillStyle = waterGradPrev;
                ctx.fillRect(camX - waterHalfWidth, -60, waterHalfWidth * 2, 280);
                ctx.restore();

                ctx.save();
                ctx.globalAlpha = blend.t;
                const waterGradNext = ctx.createLinearGradient(0, -70, 0, 200);
                waterGradNext.addColorStop(0, blend.next.waterColor);
                waterGradNext.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
                ctx.fillStyle = waterGradNext;
                ctx.fillRect(camX - waterHalfWidth, -60, waterHalfWidth * 2, 280);
                ctx.restore();
            } else {
                const waterGrad = ctx.createLinearGradient(0, -70, 0, 200);
                waterGrad.addColorStop(0, currentBiome.waterColor);
                waterGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
                ctx.fillStyle = waterGrad;
                ctx.fillRect(camX - waterHalfWidth, -60, waterHalfWidth * 2, 280);
            }

            // Shimmering specular wave crest
            const floraCol = (blend && blend.t > 0.5) ? (blend.next.floraColor || '#00f0ff') : (currentBiome.floraColor || '#00f0ff');
            ctx.strokeStyle = floraCol;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.45;
            ctx.beginPath();
            const time = this.ticks * 0.04;
            for (let wx = camX - waterHalfWidth; wx <= camX + waterHalfWidth; wx += 40) {
                const wy = -45 + Math.sin(wx * 0.015 + time) * 6 + Math.cos(wx * 0.008 - time * 0.7) * 4;
                if (wx === camX - waterHalfWidth) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
            ctx.restore();
        }

        drawCelestialGraphic(ctx, biome, alpha, moonImg, radius, mw, mh) {
            if (alpha <= 0.001) return;
            ctx.save();
            ctx.globalAlpha = alpha;
            const type = biome.moonType || 'blood_moon';

            if (type === 'blood_moon') {
                // Biome 0: Blood Moon with scarlet corona aura
                const corona = ctx.createRadialGradient(0, 0, radius * 0.7, 0, 0, radius * 1.5);
                corona.addColorStop(0, 'rgba(255, 30, 0, 0.45)');
                corona.addColorStop(0.5, 'rgba(255, 60, 0, 0.2)');
                corona.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = corona;
                ctx.beginPath();
                ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
                ctx.fill();

                if (moonImg) {
                    ctx.drawImage(moonImg, -mw / 2, -mh / 2, mw, mh);
                }
            } else if (type === 'ringed_exoplanet') {
                // Biome 1: Cyan / Turquoise 3D Ringed Gas Giant Exoplanet
                const ringTilt = -0.38;
                const ringR_outer = radius * 1.55;
                const ringR_inner = radius * 1.08;
                const ringScaleY = 0.32;

                // 1. Back Ring Half (behind planet)
                ctx.save();
                ctx.rotate(ringTilt);
                ctx.scale(1, ringScaleY);
                for (let r = ringR_inner; r <= ringR_outer; r += 12) {
                    ctx.beginPath();
                    ctx.arc(0, 0, r, Math.PI, 0, false);
                    ctx.strokeStyle = r > ringR_inner + 40 && r < ringR_outer - 30 
                        ? 'rgba(0, 240, 255, 0.55)' 
                        : 'rgba(180, 255, 255, 0.35)';
                    ctx.lineWidth = 7;
                    ctx.shadowColor = '#00f0ff';
                    ctx.shadowBlur = 12;
                    ctx.stroke();
                }
                ctx.restore();

                // 2. Planet Sphere Body
                const planetGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
                planetGrad.addColorStop(0, '#e0ffff');
                planetGrad.addColorStop(0.3, '#00d4ff');
                planetGrad.addColorStop(0.65, '#005b88');
                planetGrad.addColorStop(0.95, '#001a2e');
                planetGrad.addColorStop(1, '#000812');
                ctx.fillStyle = planetGrad;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();

                // Atmospheric Glow
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 14;
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 35;
                ctx.stroke();

                // 3. Front Ring Half (in front of planet)
                ctx.save();
                ctx.rotate(ringTilt);
                ctx.scale(1, ringScaleY);
                for (let r = ringR_inner; r <= ringR_outer; r += 12) {
                    ctx.beginPath();
                    ctx.arc(0, 0, r, 0, Math.PI, false);
                    ctx.strokeStyle = r > ringR_inner + 40 && r < ringR_outer - 30 
                        ? 'rgba(0, 240, 255, 0.75)' 
                        : 'rgba(220, 255, 255, 0.45)';
                    ctx.lineWidth = 7;
                    ctx.shadowColor = '#00f0ff';
                    ctx.shadowBlur = 18;
                    ctx.stroke();
                }
                ctx.restore();

            } else if (type === 'solar_supernova') {
                // Biome 2: Blazing Solar Flare Star with pulsating corona
                const t = this.ticks * 0.02;

                // Solar heat rays
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                for (let i = 0; i < 12; i++) {
                    const angle = (i * Math.PI * 2) / 12 + t * 0.3;
                    const rayLen = radius * (1.6 + 0.3 * Math.sin(t * 2 + i));
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
                    ctx.strokeStyle = 'rgba(255, 140, 0, 0.28)';
                    ctx.lineWidth = 32;
                    ctx.stroke();
                }
                ctx.restore();

                // Coronal Prominences
                for (let i = 0; i < 14; i++) {
                    const angle = (i * Math.PI * 2) / 14 + t * 0.5;
                    const flareLen = radius * (1.15 + 0.25 * Math.sin(t * 3 + i * 1.5));
                    ctx.beginPath();
                    ctx.arc(Math.cos(angle) * flareLen, Math.sin(angle) * flareLen, 45, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 90, 0, 0.5)';
                    ctx.shadowColor = '#ff5500';
                    ctx.shadowBlur = 25;
                    ctx.fill();
                }

                // Searing Core Star
                const sunGrad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
                sunGrad.addColorStop(0, '#ffffff');
                sunGrad.addColorStop(0.3, '#fff275');
                sunGrad.addColorStop(0.65, '#ff8800');
                sunGrad.addColorStop(0.92, '#ff2200');
                sunGrad.addColorStop(1, '#8b0000');
                ctx.fillStyle = sunGrad;
                ctx.shadowColor = '#ff8800';
                ctx.shadowBlur = 50;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();

            } else if (type === 'black_hole_singularity') {
                // Biome 3: Supermassive Black Hole with 3D Relativistic Accretion Disk
                const diskTilt = -0.32;
                const diskScaleY = 0.30;

                // 1. Relativistic Jet Plumes
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                const jetGrad = ctx.createLinearGradient(0, -radius * 1.8, 0, radius * 1.8);
                jetGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
                jetGrad.addColorStop(0.35, 'rgba(224, 102, 255, 0.4)');
                jetGrad.addColorStop(0.5, '#ffffff');
                jetGrad.addColorStop(0.65, 'rgba(224, 102, 255, 0.4)');
                jetGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
                ctx.fillStyle = jetGrad;
                ctx.fillRect(-18, -radius * 1.8, 36, radius * 3.6);
                ctx.restore();

                // 2. Upper Gravitational Lensing Warp Arc
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(0, -radius * 0.45, radius * 1.35, radius * 0.75, 0, Math.PI, 0, false);
                ctx.strokeStyle = 'rgba(224, 102, 255, 0.65)';
                ctx.lineWidth = 26;
                ctx.shadowColor = '#e066ff';
                ctx.shadowBlur = 30;
                ctx.stroke();
                ctx.restore();

                // 3. Tilted Accretion Disk
                ctx.save();
                ctx.rotate(diskTilt);
                ctx.scale(1, diskScaleY);
                for (let r = radius * 0.95; r <= radius * 1.65; r += 14) {
                    ctx.beginPath();
                    ctx.arc(0, 0, r, 0, Math.PI * 2);
                    ctx.strokeStyle = r < radius * 1.25 ? 'rgba(0, 240, 255, 0.65)' : 'rgba(224, 102, 255, 0.45)';
                    ctx.lineWidth = 10;
                    ctx.shadowColor = '#00f0ff';
                    ctx.shadowBlur = 22;
                    ctx.stroke();
                }
                ctx.restore();

                // 4. Black Hole Event Horizon
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 25;
                ctx.fill();

                // 5. Photon Sphere Rim
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.86, 0, Math.PI * 2);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
            ctx.restore();
        }

        drawCelestialBody(ctx, currentBiome, blend, moonImg) {
            ctx.save();
            ctx.translate(this.virtualWidth / 2, this.virtualHeight / 2 - 400);
            const moonScale = 1 - 0.25 + 0.25 * this.zoom;
            ctx.scale(moonScale, moonScale);
            const mw = TARGET_SIZES.moon.width;
            const mh = TARGET_SIZES.moon.height;
            const radius = mw / 2;

            if (blend && blend.t > 0.001) {
                // Smooth cross-fade between old and new celestial body during hyperspace warp
                this.drawCelestialGraphic(ctx, blend.current, 1.0 - blend.t, moonImg, radius, mw, mh);
                this.drawCelestialGraphic(ctx, blend.next, blend.t, moonImg, radius, mw, mh);
            } else {
                this.drawCelestialGraphic(ctx, currentBiome, 1.0, moonImg, radius, mw, mh);
            }

            // Central Score & Multiplier Typography (Solid, legible, always on top)
            ctx.font = '800 130px Consolas, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 14;
            ctx.strokeText(Math.floor(this.score).toString(), 0, -75);
            ctx.fillStyle = '#000000';
            ctx.fillText(Math.floor(this.score).toString(), 0, -75);

            ctx.font = '800 90px Consolas, monospace';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 12;
            ctx.strokeText(this.multiplier.toFixed(1) + 'x', 0, 15);
            ctx.fillStyle = '#000000';
            ctx.fillText(this.multiplier.toFixed(1) + 'x', 0, 15);

            ctx.restore();
        }

        render() {
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;

            // Clear Background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            if (!this.assets.loaded) return;

            ctx.save();
            ctx.translate(this.viewOffsetX, this.viewOffsetY);
            ctx.scale(this.scaleFactor, this.scaleFactor);

            // Screen shake application
            if (this.screenShake > 0) {
                const shakeX = (Math.random() - 0.5) * this.screenShake * 3;
                const shakeY = (Math.random() - 0.5) * this.screenShake * 3;
                ctx.translate(shakeX, shakeY);
            }

            // Compute Camera Zoom and Offset
            const targetZoom = Math.min(1.0, this.virtualHeight / (Math.abs(this.frog.y) * PLAYER_SCREEN_MARGIN));
            this.zoom += (targetZoom - this.zoom) * 0.1;
            this.zoom = Math.max(0.7, Math.min(1.0, this.zoom));

            // Current Active Biome & progression blend
            const currentBiome = BIOMES[this.currentBiomeIndex];
            const blend = this.getCurrentBiomeBlend(this.frog.x);

            // 1. Seamless Mirror-Tiled Background Sky
            const bgImg = this.assets.get('background');
            if (bgImg) {
                const bgW = TARGET_SIZES.background.width;
                const bgH = TARGET_SIZES.background.height;
                for (let bx = -bgW; bx < this.virtualWidth + bgW; bx += bgW) {
                    ctx.drawImage(bgImg, bx, this.virtualHeight - bgH, bgW, bgH);
                }
            }

            // Atmospheric Biome Sky Color Wash
            if (blend.index > 0 || blend.t > 0) {
                const topRGB = [
                    Math.round(blend.current.skyTop[0] + (blend.next.skyTop[0] - blend.current.skyTop[0]) * blend.t),
                    Math.round(blend.current.skyTop[1] + (blend.next.skyTop[1] - blend.current.skyTop[1]) * blend.t),
                    Math.round(blend.current.skyTop[2] + (blend.next.skyTop[2] - blend.current.skyTop[2]) * blend.t)
                ];
                const botRGB = [
                    Math.round(blend.current.skyBottom[0] + (blend.next.skyBottom[0] - blend.current.skyBottom[0]) * blend.t),
                    Math.round(blend.current.skyBottom[1] + (blend.next.skyBottom[1] - blend.current.skyBottom[1]) * blend.t),
                    Math.round(blend.current.skyBottom[2] + (blend.next.skyBottom[2] - blend.current.skyBottom[2]) * blend.t)
                ];
                const skyGrad = ctx.createLinearGradient(0, 0, 0, this.virtualHeight);
                skyGrad.addColorStop(0, `rgba(${topRGB[0]}, ${topRGB[1]}, ${topRGB[2]}, 0.55)`);
                skyGrad.addColorStop(1, `rgba(${botRGB[0]}, ${botRGB[1]}, ${botRGB[2]}, 0.55)`);
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
            }

            // 2. Shooting Stars streaking across night sky
            for (const s of this.shootingStars) {
                s.draw(ctx);
            }

            // 2.5 Dynamic Celestial Aurora Curtains
            this.drawAuroraCurtains(ctx, blend);

            // 2.8 Dynamic Biome Weather Motes & Fireflies
            this.weather.draw(ctx, currentBiome);

            // 3. Moon / Dynamic Celestial Orb
            this.drawCelestialBody(ctx, currentBiome, blend, this.assets.get('moon'));

            // 4. Camera World Container
            const isDesktop = this.virtualWidth > 2200;
            const anchorX = isDesktop ? Math.round(this.virtualWidth * 0.38) : Math.round(this.virtualWidth / 2);

            ctx.save();
            ctx.translate(anchorX, this.virtualHeight);
            ctx.scale(this.zoom, this.zoom);

            const camX = this.frog.x - (-400);

            // Parallax Shadowground and Foreground Pine Forest with Biome Cross-Fade
            if (blend && blend.t > 0.001) {
                const oldWeight = 1.0 - blend.t;
                const newWeight = blend.t;
                // Old biome trees fading out
                this.renderForegroundTrees(ctx, -450, -200, blend.current.treeFilterBack, 0.5 * oldWeight, 0.65, camX, 0.7);
                this.renderForegroundTrees(ctx, -200, 0, blend.current.treeFilterFront, 0.85 * oldWeight, 1.0, camX, 1.0);
                // New biome trees fading in
                this.renderForegroundTrees(ctx, -450, -200, blend.next.treeFilterBack, 0.5 * newWeight, 0.65, camX, 0.7);
                this.renderForegroundTrees(ctx, -200, 0, blend.next.treeFilterFront, 0.85 * newWeight, 1.0, camX, 1.0);
            } else {
                this.renderForegroundTrees(ctx, -450, -200, currentBiome.treeFilterBack, 0.5, 0.65, camX, 0.7);
                this.renderForegroundTrees(ctx, -200, 0, currentBiome.treeFilterFront, 0.85, 1.0, camX, 1.0);
            }

            // World Entities Container
            ctx.save();
            ctx.translate(-camX, 0);

            // Bottom Reflective Glowing Water Surface
            this.drawWaterSurface(ctx, currentBiome, blend, camX);

            // Draw Floating Bioluminescent Lotuses
            for (const lotus of this.lotuses) {
                lotus.draw(ctx);
            }

            // Draw Active 3D Gyroscopic Chrono Portal
            if (this.activePortal) {
                this.activePortal.draw(ctx);
            }

            // Draw Rifts of Infinity
            for (const r of this.rifts) {
                r.draw(ctx);
            }

            // Draw Lilypads
            for (const pad of this.lilypads) {
                pad.draw(ctx, this.assets);
            }

            // Draw Pickups (Fireflies, Golden Scarabs, Chrono Bugs, Spores)
            for (const pickup of this.pickups) {
                pickup.draw(ctx, this.assets);
            }

            // Draw Hooks
            for (const hook of this.hooks) {
                const isTarget = hook === this.targetHook;
                hook.draw(ctx, this.assets, isTarget, this.highlightRotation);
            }

            // Draw Grass
            for (const g of this.grass) {
                g.draw(ctx, this.assets);
            }

            // Draw Player Frog
            this.frog.draw(ctx, this.assets, this.swarmCharges > 0);

            // Draw Firewall
            this.firewall.draw(ctx, this.assets);

            // Draw Particles & Sparks
            for (const p of this.particles) {
                p.draw(ctx);
            }

            // Draw Floating Score & Multiplier Texts
            for (const ft of this.floatingTexts) {
                ft.draw(ctx);
            }

            ctx.restore(); // End World Entities Container
            ctx.restore(); // End Camera World Container

            // 5. Gateway Supernova Screen Flash Bloom
            if (this.gateFlash > 0.01) {
                ctx.fillStyle = `rgba(220, 255, 255, ${this.gateFlash * 0.45})`;
                ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
            }

            // 6. Hyperspace Warp Speed Streak Explosion
            if (this.warpTimer > 0) {
                const warpProgress = this.warpTimer / 75; // 1 down to 0
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                const cx = this.virtualWidth / 2;
                const cy = this.virtualHeight / 2;
                const streakColor = currentBiome.portalColor || '#00f0ff';
                const numStreaks = 85;
                for (let i = 0; i < numStreaks; i++) {
                    const angle = (i * Math.PI * 2) / numStreaks + (1 - warpProgress) * 0.4;
                    const minR = 60 + (i % 6) * 35;
                    const maxR = minR + (1 - warpProgress * 0.4) * (this.virtualWidth * 0.75);
                    ctx.beginPath();
                    ctx.moveTo(cx + Math.cos(angle) * minR, cy + Math.sin(angle) * minR);
                    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
                    ctx.strokeStyle = i % 2 === 0 ? '#ffffff' : streakColor;
                    ctx.lineWidth = 3 + (i % 4) * 2;
                    ctx.globalAlpha = Math.sin(warpProgress * Math.PI) * 0.85;
                    ctx.stroke();
                }
                ctx.restore();
            }

            ctx.restore(); // End Virtual Scale
        }

        loop(currentTime = performance.now()) {
            let dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
            this.lastTime = currentTime;

            if (this.swarmSlowdownTimer > 0) {
                dt *= 0.20;
                this.swarmSlowdownTimer--;
            }

            // Fixed 60 TPS timestep loop with delta accumulator scaled by gameSpeed (0x to 4x)
            this.accumulator += dt * this.gameSpeed;
            const step = 1 / TARGET_FPS;
            let updates = 0;
            const maxUpdates = Math.max(5, Math.ceil(this.gameSpeed * 8));
            while (this.accumulator >= step && updates < maxUpdates) {
                this.update();
                this.accumulator -= step;
                updates++;
            }

            this.render();
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    // Start Game on Window Load
    window.addEventListener('DOMContentLoaded', () => {
        window.gameInstance = new FrogfliesGame();
    });

})();
