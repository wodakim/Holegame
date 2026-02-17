import Minimap from './minimap.js';

export default class UIManager {
    constructor(app) {
        this.app = app;
        this.screens = {
            menu: document.getElementById('screen-main-menu'),
            hud: document.getElementById('screen-hud'),
            shop: document.getElementById('screen-shop'),
            gameOver: document.getElementById('screen-game-over'),
            pause: document.getElementById('screen-pause')
        };

        this.minimap = new Minimap(document.getElementById('minimap-canvas'), app);
        this.bindEvents();
    }

    bindEvents() {
        // Main Menu
        document.getElementById('btn-play').addEventListener('click', () => this.app.gameManager.startGame());
        document.getElementById('btn-shop').addEventListener('click', () => this.app.shopManager.openShop());
        document.getElementById('btn-no-ads').addEventListener('click', () => this.app.shopManager.buyNoAds());

        // Shop
        document.getElementById('btn-back-shop').addEventListener('click', () => this.app.shopManager.closeShop());

        // Game Over
        document.getElementById('btn-revive').addEventListener('click', () => this.app.gameManager.revivePlayer());
        document.getElementById('btn-replay').addEventListener('click', () => this.app.gameManager.startGame());

        // Pause
        document.getElementById('btn-pause').addEventListener('click', () => this.app.gameManager.pauseGame());
        document.getElementById('btn-resume').addEventListener('click', () => this.app.gameManager.resumeGame());
        document.getElementById('btn-quit').addEventListener('click', () => this.app.gameManager.quitGame());
    }

    switchScreen(screenName) {
        // Hide all
        Object.values(this.screens).forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });

        // Show target
        const screen = this.screens[screenName];
        if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('active');
        }
    }

    updateHUD(time, score, kills, players, player) {
        // Timer
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        document.getElementById('game-timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        // Score
        document.getElementById('hud-score').textContent = Math.floor(score);
        document.getElementById('hud-kills').textContent = kills; // Use passed kills

        // Leaderboard
        const leaderboard = document.getElementById('leaderboard');
        leaderboard.innerHTML = '';

        // Sort players by score/radius
        // We need a copy to sort without affecting game logic array order (though Physics logic iterates, render order matters?)
        // Physics update order doesn't matter much. Render order: bigger on top? usually smaller on top?
        // Let's just sort a copy.
        const sorted = [...players].sort((a, b) => b.radius - a.radius).slice(0, 5);

        sorted.forEach((h, index) => {
            const div = document.createElement('div');
            div.className = 'rank-item';
            div.textContent = `${index + 1}. ${h.name} (${Math.floor(h.score || h.radius)})`;
            if (h === player) div.style.color = '#ffae00';
            leaderboard.appendChild(div);
        });

        // Update Minimap
        this.minimap.update();
    }

    updateMenuCoins(coins) {
        const menuCoins = document.getElementById('menu-coin-count');
        if (menuCoins) menuCoins.textContent = coins;

        // Update Missions if GameManager exists (might be called before init)
        if (this.app.gameManager && this.app.gameManager.missionManager) {
            this.updateMissions(this.app.gameManager.missionManager.getMissionsText());
        }

        const shopCoins = document.getElementById('shop-coin-count');
        if (shopCoins) shopCoins.textContent = coins;

        // Check for Shop Badge
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
        document.getElementById('final-rank').textContent = `RANK #${rank}`;
        document.getElementById('earned-coins').textContent = coinsEarned;

        // Animate progress bar?
        const bar = document.getElementById('progress-bar-fill');
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = '100%'; // Just fill it for visual feedback
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
            notif.style.fontSize = '24px';
            notif.style.fontWeight = 'bold';
            notif.style.fontFamily = 'Montserrat, sans-serif';
            notif.style.textShadow = '0 0 10px #000';
            notif.style.zIndex = '1000';
            notif.style.pointerEvents = 'none';
            notif.style.transition = 'opacity 0.5s';
            document.body.appendChild(notif);
        }

        notif.textContent = text;
        notif.style.color = color || '#fff';
        notif.style.opacity = '1';

        // Clear previous timeout if any? A bit complex to track without variable.
        // Simple overlap is fine.
        setTimeout(() => {
            notif.style.opacity = '0';
        }, 3000);
    }
}
