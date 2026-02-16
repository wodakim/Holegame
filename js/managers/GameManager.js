import Player from '../entities/Player.js';
import Bot from '../entities/Bot.js';
import PoliceBot from '../entities/PoliceBot.js';
import Prop from '../entities/Prop.js';
import PowerUp from '../entities/PowerUp.js';
import Particle from '../entities/Particle.js';
import FloatingText from '../entities/FloatingText.js';
import Physics from '../core/Physics.js';
import Camera from '../core/Camera.js';
import TrafficManager from './TrafficManager.js';
import MissionManager from './MissionManager.js';

export default class GameManager {
    constructor(app) {
        this.app = app;
        this.physics = new Physics();
        this.camera = new Camera();
        this.trafficManager = new TrafficManager(this);
        this.missionManager = new MissionManager(app.saveManager);

        this.entities = [];
        this.player = null;

        this.state = 'MENU'; // MENU, PLAYING, GAMEOVER
        this.score = 0;
        this.kills = 0;
        this.gameTime = 120; // 2 minutes

        // Configuration
        this.botCount = 10; // Increased bots for larger map
        this.propCount = 1000; // Increased props for larger map
        this.worldSize = 4000; // Larger Map

        this.policeCount = 0;
        this.maxPolice = 2;
        this.policeSpawnTimer = 0;

        this.killStreak = 0;
        this.lastKillTime = 0;
        this.slowMoTimer = 0;
        this.paused = false;
    }

    startGame() {
        this.paused = false;
        this.app.soundManager.init(); // User gesture required
        this.state = 'PLAYING';
        this.score = 0;
        this.kills = 0;
        this.gameTime = 120;
        this.entities = [];

        // UI Transition
        this.app.saveManager.updateUI(); // Refresh coins in UI
        this.app.uiManager.switchScreen('hud');

        // Create Player
        // Load skin from saveManager
        const skinInfo = this.app.saveManager.getCurrentSkinInfo();
        this.player = new Player(0, 0, 40, skinInfo.color, 'You', this.app.saveManager);
        this.player.shape = skinInfo.shape || 'circle';
        this.entities.push(this.player);

        // Create Bots
        for (let i = 0; i < this.botCount; i++) {
            this.spawnBot();
        }

        // Create Props (Clustered)
        this.spawnInitialProps();

        // Reset Camera
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.zoom = 1;
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;
        if (this.paused) return; // Pause Logic

        // Handle SlowMo Recovery
        if (this.slowMoTimer > 0) {
            this.slowMoTimer -= dt;
            if (this.app.gameLoop.timeScale < 1.0) {
                 this.app.gameLoop.timeScale += 0.05;
                 if (this.app.gameLoop.timeScale > 1.0) this.app.gameLoop.timeScale = 1.0;
            }
        }

        // 1. Update Timer
        this.gameTime -= dt;
        if (this.gameTime <= 0) {
            this.gameOver();
            return;
        }

        // 2. Update Traffic
        this.trafficManager.update(dt);

        // 3. Physics Update (Collision, Suction, Movement)
        this.physics.update(dt, this.entities, (eater, eaten) => {
            // Sound & Feedback
            if (eater === this.player) {
                if (eaten.propType === 'police' || (eaten.type === 'bot' && eaten.isPolice)) {
                    // BAD
                    this.app.soundManager.play('eatLarge');
                    this.spawnFloatingText(eater.x, eater.y, "CURED!", '#ff0000', 30);
                    this.camera.shake(20);
                    if (navigator.vibrate) navigator.vibrate(200);
                }
                else if (eaten.type === 'prop') {
                    this.app.soundManager.play('eatSmall');
                    const value = eaten.value || 1;
                    this.spawnFloatingText(eaten.x, eaten.y, `+${value}`, '#39ff14');

                    // Mission: Eat Car
                    if (eaten.propType === 'car') this.missionManager.onEvent('eat_car');
                }
                else if (eaten.type === 'hole') {
                    this.app.soundManager.play('eatLarge');
                    const reward = Math.floor(eaten.score / 3);
                    this.spawnFloatingText(eaten.x, eaten.y, `+${reward > 0 ? reward : 10}`, '#39ff14');
                    // Mission: Kill Hole
                    this.missionManager.onEvent('kill_hole');
                }
                else if (eaten.type === 'powerup') {
                    this.app.soundManager.play('levelUp');
                    this.spawnFloatingText(eater.x, eater.y, eaten.powerType.toUpperCase(), eaten.color);
                }
            }

            // Particles (Reduced count)
            const pCount = eaten.type === 'hole' ? 10 : (eaten.value > 10 ? 5 : 2);
            this.spawnParticles(eaten.x, eaten.y, eaten.color, pCount);

            // Camera Shake for large eats
            if (eaten.type === 'hole') {
                this.camera.shake(25);
                // Kill Logic
                if (eater === this.player) {
                    this.handlePlayerKill(eaten);
                }
            } else if (eaten.value && eaten.value > 10) {
                this.camera.shake(5);
            }
        });

        // 3. Entity Logic Update
        // Input for player
        if (this.player && !this.player.markedForDeletion) {
            const input = this.app.inputHandler.getVector();
            this.player.update(dt, input);

            // Camera Follow Player
            this.camera.follow(this.player, dt);

            // Adjust Zoom based on player size
            const targetZoom = Math.max(0.2, 1 - (this.player.radius - 40) / 1000); // Smoother zoom for large map
            this.camera.setTargetZoom(targetZoom);
        }

        // Bot Logic
        this.entities.forEach(entity => {
            if (entity.type === 'hole' && entity !== this.player) {
                // Pass all entities to bot for AI decision
                entity.update(dt, this.entities);
            } else if (entity.type === 'bot' && entity.isPolice) {
                 // Police update
                 entity.update(dt, this.entities);
            }
        });

        // 4. Cleanup & Spawning
        this.entities = this.entities.filter(e => !e.markedForDeletion);

        // Respawn Bots
        const currentBots = this.entities.filter(e => e.type === 'hole' && e !== this.player).length;
        if (currentBots < this.botCount) {
             this.spawnBot();
        }

        // Respawn Props
        const currentProps = this.entities.filter(e => e.type === 'prop').length;
        if (currentProps < this.propCount) {
            this.spawnProp();
        }

        // Spawn Powerups (Rare)
        if (Math.random() < 0.005) {
            this.spawnPowerUp();
        }

        // Check if player died
        if (this.player && this.player.markedForDeletion) {
            this.gameOver();
        }

        // 5. Update HUD
        this.updateHUD();

        // 6. Check Police Spawn
        this.checkPoliceSpawn(dt);
    }

    checkPoliceSpawn(dt) {
        // Only spawn if player is big enough
        if (!this.player || this.player.markedForDeletion) return;

        if (this.player.score > 500) { // Threshold for police attention
             this.policeSpawnTimer += dt;

             // Check current police count
             const currentPolice = this.entities.filter(e => e.isPolice).length;

             if (currentPolice < this.maxPolice && this.policeSpawnTimer > 10) { // Every 10s check
                 this.spawnPolice();
                 this.policeSpawnTimer = 0;
             }
        }
    }

    spawnPolice() {
        // Spawn relative to player but not too close
        const angle = Math.random() * Math.PI * 2;
        const dist = 800 + Math.random() * 400;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        // Clamp to world
        const clampedX = Math.max(-this.worldSize/2, Math.min(this.worldSize/2, x));
        const clampedY = Math.max(-this.worldSize/2, Math.min(this.worldSize/2, y));

        const police = new PoliceBot(clampedX, clampedY, 60); // Slightly larger than start
        this.entities.push(police);

        // Announce
        this.app.uiManager.showNotification("POLICE ALERT!", "#ff0000");
        this.app.soundManager.play('siren'); // Assuming sound manager handles this, or generic alert
    }

    spawnBot() {
        let x, y, dist;
        let attempts = 0;
        do {
            x = (Math.random() - 0.5) * this.worldSize;
            y = (Math.random() - 0.5) * this.worldSize;

            if (this.player && !this.player.markedForDeletion) {
                const dx = x - this.player.x;
                const dy = y - this.player.y;
                dist = Math.sqrt(dx*dx + dy*dy);
            } else {
                dist = 9999;
            }
            attempts++;
        } while (dist < 800 && attempts < 10); // Don't spawn too close

        const names = ['VoidWalker', 'Eater_X', 'NoBrainer', 'Destroyer99', 'AbyssKing', 'NullPtr', 'GlitchUser', 'System32'];
        const name = names[Math.floor(Math.random() * names.length)];
        const colors = ['#ff00ff', '#39ff14', '#ffae00', '#00f3ff', '#ff3333'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const bot = new Bot(x, y, 40 + Math.random() * 20, color, name);
        this.entities.push(bot);
    }

    spawnInitialProps() {
        // Generate "City Blocks"
        const blockSize = 400;
        const blocks = Math.floor(this.worldSize / blockSize);

        for (let i = 0; i < this.propCount; i++) {
             this.spawnProp();
        }
    }

    spawnProp() {
        // More intelligent spawning:
        // 1. Pick a random grid cell (City Block)
        // 2. Spawn inside it

        const x = (Math.random() - 0.5) * this.worldSize;
        const y = (Math.random() - 0.5) * this.worldSize;

        const rand = Math.random();
        let type, width, height, color, value;

        // Increased building chance (30%)
        if (rand < 0.3) {
            type = 'building';
            width = 50 + Math.random() * 50;
            height = 50 + Math.random() * 50;
            const bColors = ['#00ffff', '#ff00ff', '#39ff14', '#ffffff'];
            color = bColors[Math.floor(Math.random() * bColors.length)];
            value = 20 + Math.floor(width/10);
        } else if (rand < 0.6) { // 30% Cars/Traffic (Static parked cars)
            type = 'car';
            width = 20;
            height = 30;
            color = Math.random() > 0.5 ? '#cc0000' : '#0000cc';
            value = 5;
        } else { // 40% Small Objects (Cones, Barrels, Boxes)
            type = 'cone';
            width = 10;
            height = 10;
            color = '#ffae00';
            value = 1;
        }

        const prop = new Prop(x, y, type, value, width, height, color);
        this.entities.push(prop);
    }

    spawnPowerUp() {
        const x = (Math.random() - 0.5) * this.worldSize;
        const y = (Math.random() - 0.5) * this.worldSize;
        const types = ['magnet', 'speed', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.entities.push(new PowerUp(x, y, type));
    }

    handlePlayerKill(victim) {
        this.kills++;
        const now = Date.now();
        if (now - this.lastKillTime < 5000) {
            this.killStreak++;
        } else {
            this.killStreak = 1;
        }
        this.lastKillTime = now;

        this.app.gameLoop.timeScale = 0.2;
        this.slowMoTimer = 0.5;

        let text = "KILL!";
        let color = "#fff";
        let size = 30;

        if (this.killStreak === 2) { text = "DOUBLE KILL!"; color = "#ffae00"; size = 40; }
        if (this.killStreak === 3) { text = "TRIPLE KILL!"; color = "#ff00ff"; size = 50; }
        if (this.killStreak >= 4) { text = "RAMPAGE!"; color = "#ff0000"; size = 60; }

        this.spawnFloatingText(this.player.x, this.player.y - 50, text, color, size);
    }

    spawnParticles(x, y, color, amount = 10) {
        for (let i = 0; i < amount; i++) {
            this.entities.push(new Particle(x, y, color));
        }
    }

    spawnFloatingText(x, y, text, color, fontSize=20) {
        this.entities.push(new FloatingText(x, y, text, color, fontSize));
    }

    updateHUD() {
        if (!this.player) return;

        const holes = this.entities.filter(e => e.type === 'hole');
        // Pass entities for Minimap if needed, or Minimap accesses gameManager
        this.app.uiManager.updateHUD(this.gameTime, this.player.score, this.kills, holes, this.player);
    }

    gameOver() {
        this.state = 'GAMEOVER';

        const holes = this.entities.filter(e => e.type === 'hole');
        holes.sort((a, b) => b.radius - a.radius);
        const rank = holes.indexOf(this.player) + 1 || holes.length + 1;

        if (this.player.score > 5000) this.missionManager.onEvent('reach_mass', 5000);

        const missionReward = this.missionManager.checkCompletion();

        const coinsEarned = Math.floor(this.player.score / 10) + missionReward;
        this.app.saveManager.addCoins(coinsEarned);

        if (this.player.score > this.app.saveManager.getHighScore()) {
            this.app.saveManager.setHighScore(this.player.score);
        }

        this.app.uiManager.showGameOver(rank, coinsEarned);
    }

    revivePlayer() {
        this.app.adManager.showRewardedAd(() => {
             this.player.markedForDeletion = false;
             this.player.radius = 40;
             this.player.x = (Math.random() - 0.5) * this.worldSize;
             this.player.y = (Math.random() - 0.5) * this.worldSize;
             this.entities.push(this.player);

             this.state = 'PLAYING';
             this.gameTime += 30;

             this.app.uiManager.switchScreen('hud');
        });
    }

    pauseGame() {
        if (this.state === 'PLAYING') {
            this.paused = true;
            this.app.uiManager.switchScreen('pause');
        }
    }

    resumeGame() {
        this.paused = false;
        this.app.uiManager.switchScreen('hud');
    }

    quitGame() {
        this.state = 'MENU';
        this.paused = false;
        this.entities = [];
        this.player = null;
        this.app.uiManager.switchScreen('menu');
        this.app.saveManager.updateUI();
    }
}
