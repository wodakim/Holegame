import Minimap from './minimap.js';

export default class UIManager {
    constructor(app) {
        this.app = app;
        this.screens = {
            menu: document.getElementById('screen-main-menu'),
            hud: document.getElementById('screen-hud'),
            shop: document.getElementById('screen-shop'),
            gameOver: document.getElementById('screen-game-over'),
            pause: document.getElementById('screen-pause'),
            matchmaking: document.getElementById('screen-matchmaking'),
            levelup: document.getElementById('screen-levelup')
        };

        this.popups = {
            timeSelect: document.getElementById('popup-time-select')
        };

        this.minimap = new Minimap(document.getElementById('minimap-canvas'), app);
        this.bindEvents();
    }

    // Helper to bind buttons with sound
    bindBtn(id, callback) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                this.app.soundManager.play('uiClick');
                // visual bounce handled by CSS :active
                callback(e);
            });
        }
    }

    bindEvents() {
        // Main Menu
        this.bindBtn('btn-play-menu', () => this.showPopup('timeSelect'));
        this.bindBtn('btn-shop', () => this.app.shopManager.openShop());
        this.bindBtn('btn-no-ads', () => this.app.shopManager.buyNoAds());

        // Popup: Time Selection
        const timeButtons = document.querySelectorAll('.btn-time');
        timeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.app.soundManager.play('uiClick');
                const target = e.target.closest('.btn-time');
                const time = parseInt(target.dataset.time);
                this.hidePopup('timeSelect');
                this.startMatchmaking(time);
            });
        });

        this.bindBtn('btn-close-popup', () => this.hidePopup('timeSelect'));

        // Shop
        this.bindBtn('btn-back-shop', () => this.app.shopManager.closeShop());

        // Game Over
        this.bindBtn('btn-revive', () => this.app.gameManager.revivePlayer());
        this.bindBtn('btn-replay', () => this.app.gameManager.startGame(this.lastDuration || 120));
        this.bindBtn('btn-menu-gameover', () => this.app.gameManager.quitGame());

        // Pause / HUD
        this.bindBtn('btn-pause', () => this.app.gameManager.pauseGame());
        this.bindBtn('btn-resume', () => this.app.gameManager.resumeGame());
        this.bindBtn('btn-quit', () => this.app.gameManager.quitGame());
    }

    startMatchmaking(duration) {
        this.lastDuration = duration;
        this.switchScreen('matchmaking');

        const waitSpan = document.getElementById('wait-time');
        let timeLeft = 3;
        if (waitSpan) waitSpan.textContent = timeLeft;

        const interval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0 && waitSpan) waitSpan.textContent = timeLeft;
        }, 1000);

        setTimeout(() => {
            clearInterval(interval);
            if (this.app && this.app.gameManager) {
                this.app.gameManager.startGame(duration);
            }
        }, 3000);
    }

    showPopup(name) {
        const p = this.popups[name];
        if (p) {
            this.app.soundManager.play('uiOpen');
            p.classList.remove('hidden');
        }
    }

    hidePopup(name) {
        const p = this.popups[name];
        if (p) {
            p.classList.add('hidden');
        }
    }

    showCountdown(num) {
        let el = document.getElementById('countdown-overlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'countdown-overlay';
            el.style.position = 'absolute';
            el.style.top = '0';
            el.style.left = '0';
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.display = 'flex';
            el.style.justifyContent = 'center';
            el.style.alignItems = 'center';
            el.style.fontSize = '8rem';
            el.style.fontWeight = '900';
            el.style.color = '#fff';
            // el.style.textShadow = '0 0 20px #00f3ff'; // Old neon
            el.style.textShadow = '4px 4px 0 #2C3E50'; // New hard shadow
            el.style.zIndex = '100';
            el.style.pointerEvents = 'none';
            document.body.appendChild(el);
        }
        el.textContent = num;
        el.classList.remove('hidden');
        // Play tick sound
        this.app.soundManager.play('uiClick');
    }

    updateCountdown(num) {
        const el = document.getElementById('countdown-overlay');
        if (el) {
             if (el.textContent != num) this.app.soundManager.play('uiClick');
             el.textContent = num;
        }
    }

    hideCountdown() {
        const el = document.getElementById('countdown-overlay');
        if (el) el.classList.add('hidden');
        // Play GO sound?
        this.app.soundManager.play('levelUp');
    }

    showLevelUp(choices, onSelect) {
        this.switchScreen('levelup');
        this.app.soundManager.play('levelUp'); // Positive sound

        const container = document.getElementById('upgrade-cards-container');
        if (!container) return;
        container.innerHTML = '';

        choices.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.style.animationDelay = `${index * 0.1}s`;

            const icon = document.createElement('div');
            icon.className = 'upgrade-icon';
            icon.textContent = choice.icon;

            const title = document.createElement('h3');
            title.textContent = choice.name;

            const desc = document.createElement('p');
            desc.textContent = choice.desc;

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(desc);

            card.addEventListener('click', () => {
                this.app.soundManager.play('uiClick');
                onSelect(choice.id);
            });

            container.appendChild(card);
        });
    }

    switchScreen(screenName) {
        Object.values(this.screens).forEach(s => {
            if (s) {
                s.classList.add('hidden');
                s.classList.remove('active');
            }
        });

        const screen = this.screens[screenName];
        if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('active');
            if (screenName !== 'hud') {
                this.app.soundManager.play('uiOpen');
            }
        }
    }

    updateHUD(time, score, kills, players, player) {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        document.getElementById('game-timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        document.getElementById('hud-score').textContent = Math.floor(score);
        document.getElementById('hud-kills').textContent = kills;

        const leaderboard = document.getElementById('leaderboard');
        leaderboard.innerHTML = '';

        const sorted = [...players].sort((a, b) => b.radius - a.radius).slice(0, 5);

        sorted.forEach((h, index) => {
            const div = document.createElement('div');
            div.className = 'rank-item';
            // Added bold colors for rank
            div.textContent = `${index + 1}. ${h.name}`;
            if (h === player) {
                div.style.color = '#E67E22'; // Orange for player
                div.style.fontWeight = '900';
            }
            leaderboard.appendChild(div);
        });

        this.minimap.update();
    }

    updateMenuCoins(coins) {
        const menuCoins = document.getElementById('menu-coin-count');
        if (menuCoins) menuCoins.textContent = coins;

        if (this.app.gameManager && this.app.gameManager.missionManager) {
            this.updateMissions(this.app.gameManager.missionManager.getMissionsText());
        }

        const shopCoins = document.getElementById('shop-coin-count');
        if (shopCoins) shopCoins.textContent = coins;

        const badge = document.getElementById('shop-badge');
        if (badge) {
            if (coins >= 500) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    updateMissions(missions) {
        const list = document.getElementById('mission-list');
        if (!list) return;
        list.innerHTML = '';
        missions.forEach(txt => {
            const li = document.createElement('li');
            li.textContent = txt;
            list.appendChild(li);
        });
    }

    showGameOver(rank, coinsEarned) {
        this.switchScreen('gameOver');
        this.app.soundManager.play('gameOver'); // Sad sound

        document.getElementById('final-rank').textContent = `RANK #${rank}`;
        document.getElementById('earned-coins').textContent = coinsEarned;

        const bar = document.getElementById('progress-bar-fill');
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = '100%';
        }, 100);
    }

    showNotification(text, color) {
        let notif = document.getElementById('notification-overlay');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'notification-overlay';
            notif.style.position = 'absolute';
            notif.style.top = '15%';
            notif.style.left = '50%';
            notif.style.transform = 'translate(-50%, -50%)';
            notif.style.fontSize = '2rem';
            notif.style.fontWeight = '900';
            notif.style.fontFamily = 'Montserrat, sans-serif';
            notif.style.textShadow = '3px 3px 0 #000';
            notif.style.zIndex = '1000';
            notif.style.pointerEvents = 'none';
            notif.style.transition = 'opacity 0.5s';
            document.body.appendChild(notif);
        }

        notif.textContent = text;
        notif.style.color = color || '#F1C40F';
        notif.style.opacity = '1';

        // Pop sound
        this.app.soundManager.play('uiOpen');

        setTimeout(() => {
            notif.style.opacity = '0';
        }, 3000);
    }
}
