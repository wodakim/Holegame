import Player from '../entities/player.js';
import Bot from '../entities/bot.js';
import PoliceBot from '../entities/police-bot.js';
import Prop from '../entities/prop.js';
import PowerUp from '../entities/power-up.js';
import Particle from '../entities/particle.js';
import FloatingText from '../entities/floating-text.js';
import Physics from '../core/physics.js';
import Camera from '../core/camera.js';
import TrafficManager from './traffic-manager.js';
import MissionManager from './mission-manager.js';
import MapManager from './map-manager.js';

export default class GameManager {
    constructor(app) {
        this.app = app;
        this.physics = new Physics();
        this.camera = new Camera();
        this.trafficManager = new TrafficManager(this); // Pass self
        this.mapManager = new MapManager(this); // Pass self
        this.missionManager = new MissionManager(app.saveManager);

        this.entities = [];
        this.player = null;

        this.state = 'MENU';
        this.score = 0;
        this.kills = 0;
        this.gameTime = 120; // Default

        this.botCount = 10;
        this.policeCount = 0;
        this.maxPolice = 2;
        this.policeSpawnTimer = 0;

        this.killStreak = 0;
        this.lastKillTime = 0;
        this.slowMoTimer = 0;
        this.paused = false;
    }

    startGame(duration = 120) {
        this.paused = false;
        this.app.soundManager.init();
        this.state = 'PLAYING';
        this.score = 0;
        this.kills = 0;
        this.gameTime = duration;
        this.entities = [];

        // UI Transition
        this.app.saveManager.updateUI();
        this.app.uiManager.switchScreen('hud');

        // Create Player
        const skinInfo = this.app.saveManager.getCurrentSkinInfo();
        this.player = new Player(0, 0, 40, skinInfo.color, 'You', this.app.saveManager);
        this.player.shape = skinInfo.shape || 'circle';
        this.entities.push(this.player);

        // Reset Managers
        this.mapManager.activeChunks.clear();
        this.mapManager.update(0, 0); // Initial Generation around 0,0
        this.trafficManager.cars = []; // Clear old cars

        // Create Bots
        for (let i = 0; i < this.botCount; i++) {
            this.spawnBot();
        }

        // Reset Camera
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.zoom = 1;
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;
        if (this.paused) return;

        // SlowMo Recovery
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

        // 2. Managers Update
        this.mapManager.update(this.player.x, this.player.y);
        this.trafficManager.update(dt);

        // 3. Physics Update
        this.physics.update(dt, this.entities, (eater, eaten) => {
            // Sound & Feedback
            if (eater === this.player) {
                if (eaten.propType === 'police' || (eaten.type === 'bot' && eaten.isPolice)) {
                    this.app.soundManager.play('eatLarge');
                    this.spawnFloatingText(eater.x, eater.y, "CURED!", '#ff0000', 30);
                    this.camera.shake(20);
                    if (navigator.vibrate) navigator.vibrate(200);
                }
                else if (eaten.type === 'prop') {
                    this.app.soundManager.play('eatSmall');
                    const value = eaten.value || 1;
                    this.spawnFloatingText(eaten.x, eaten.y, `+${value}`, '#39ff14');
                    if (eaten.propType === 'car') this.missionManager.onEvent('eat_car');
                }
                else if (eaten.type === 'hole') {
                    this.app.soundManager.play('eatLarge');
                    const reward = Math.floor(eaten.score / 3);
                    this.spawnFloatingText(eaten.x, eaten.y, `+${reward > 0 ? reward : 10}`, '#39ff14');
                    this.missionManager.onEvent('kill_hole');
                }
                else if (eaten.type === 'powerup') {
                    this.app.soundManager.play('levelUp');
                    this.spawnFloatingText(eater.x, eater.y, "SPEED!", '#00ffff');
                }
            }

            // Particles
            const pCount = eaten.type === 'hole' ? 10 : (eaten.value > 10 ? 5 : 2);
            this.spawnParticles(eaten.x, eaten.y, eaten.color, pCount);

            // Camera Shake
            if (eaten.type === 'hole') {
                this.camera.shake(25);
                if (eater === this.player) this.handlePlayerKill(eaten);
            } else if (eaten.value && eaten.value > 10) {
                this.camera.shake(5);
            }
        });

        // 4. Entity Logic Update
        this.entities.forEach(entity => {
            if (entity === this.player) {
                if (!entity.markedForDeletion) {
                    const input = this.app.inputHandler.getVector();
                    entity.update(dt, input);
                    this.camera.follow(this.player, dt);
                    const targetZoom = Math.max(0.4, 1 - (this.player.radius - 40) / 1000); // Smoother zoom
                    this.camera.setTargetZoom(targetZoom);
                }
            } else if (entity.type === 'hole') {
                entity.update(dt, this.entities);
            } else if (entity.isPolice) {
                entity.update(dt, this.entities);
            } else {
                if (entity.update) entity.update(dt);
            }
        });

        // 5. Cleanup & Spawning
        // Mark distant bots for deletion
        if (this.player) {
            this.entities.forEach(e => {
                if (e.type === 'hole' && e !== this.player) {
                    const dx = e.x - this.player.x;
                    const dy = e.y - this.player.y;
                    if (dx*dx + dy*dy > 2500*2500) e.markedForDeletion = true;
                }
            });
        }

        this.entities = this.entities.filter(e => !e.markedForDeletion);

        // Respawn Bots (Near player)
        const currentBots = this.entities.filter(e => e.type === 'hole' && e !== this.player).length;
        if (currentBots < this.botCount) {
             this.spawnBot();
        }

        // Spawn Powerups (Rare Speed)
        if (Math.random() < 0.002) { // Very rare
            this.spawnPowerUp();
        }

        // Check if player died
        if (this.player && this.player.markedForDeletion) {
            this.gameOver();
        }

        // 6. Update HUD
        this.updateHUD();

        // 7. Check Police Spawn
        this.checkPoliceSpawn(dt);
    }

    checkPoliceSpawn(dt) {
        if (!this.player || this.player.markedForDeletion) return;

        if (this.player.score > 500) {
             this.policeSpawnTimer += dt;
             const currentPolice = this.entities.filter(e => e.isPolice).length;

             if (currentPolice < this.maxPolice && this.policeSpawnTimer > 15) { // Every 15s
                 this.spawnPolice();
                 this.policeSpawnTimer = 0;
             }
        }
    }

    spawnPolice() {
        if (!this.player) return;
        const angle = Math.random() * Math.PI * 2;
        const dist = 1000 + Math.random() * 500;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        const police = new PoliceBot(x, y, 60);
        this.entities.push(police);

        this.app.uiManager.showNotification("POLICE ALERT!", "#ff0000");
        this.app.soundManager.play('siren');
    }

    spawnBot() {
        if (!this.player) return;
        let x, y, dist;
        let attempts = 0;
        do {
            const angle = Math.random() * Math.PI * 2;
            const d = 800 + Math.random() * 1200; // 800-2000 away
            x = this.player.x + Math.cos(angle) * d;
            y = this.player.y + Math.sin(angle) * d;

            // Check if too close (redundant given math above, but good practice)
            const dx = x - this.player.x;
            const dy = y - this.player.y;
            dist = Math.sqrt(dx*dx + dy*dy);
            attempts++;
        } while (dist < 800 && attempts < 10);

        const names = ['VoidWalker', 'Eater_X', 'NoBrainer', 'Destroyer99', 'AbyssKing', 'NullPtr', 'GlitchUser', 'System32'];
        const name = names[Math.floor(Math.random() * names.length)];
        const colors = ['#ff00ff', '#39ff14', '#ffae00', '#00f3ff', '#ff3333'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Bot grows slightly with time? Or static? Static start is fair.
        const bot = new Bot(x, y, 40 + Math.random() * 20, color, name);
        this.entities.push(bot);
    }

    spawnPowerUp() {
        if (!this.player) return;
        const angle = Math.random() * Math.PI * 2;
        const dist = 300 + Math.random() * 500;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        this.entities.push(new PowerUp(x, y, 'speed'));
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

    spawnParticles(x, y, color, amount = 5) {
        const count = Math.min(amount, 8);
        for (let i = 0; i < count; i++) {
            this.entities.push(new Particle(x, y, color));
        }
    }

    spawnFloatingText(x, y, text, color, fontSize=20) {
        this.entities.push(new FloatingText(x, y, text, color, fontSize));
    }

    updateHUD() {
        if (!this.player) return;
        const holes = this.entities.filter(e => e.type === 'hole');
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
             // Respawn safely
             this.player.x += 1000;
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
