export default class UIManager {
    constructor(app) {
        this.app = app;
        this.currentScreen = 'screen-main-menu';

        // Matchmaking State
        this.selectedTime = 120;
        this.matchmakingTimer = null;
        this.matchOverlay = null;

        // Elements
        this.hudScore = document.getElementById('hud-score');
        this.hudKills = document.getElementById('hud-kills');
        this.gameTimer = document.getElementById('game-timer');
        this.leaderboard = document.getElementById('leaderboard');
        this.finalRank = document.getElementById('final-rank');
        this.earnedCoins = document.getElementById('earned-coins');

        this.menuCoinCount = document.getElementById('menu-coin-count');
        this.shopCoinCount = document.getElementById('shop-coin-count');

        this.matchOverlay = document.getElementById('matchmaking-overlay');
        this.matchStatus = document.getElementById('match-status');

        // Minimap logic (basic stub)
        this.minimapCanvas = document.getElementById('minimap-canvas');
        if(this.minimapCanvas) {
             this.minimapCtx = this.minimapCanvas.getContext('2d');
        }

        this.bindEvents();
    }

    bindEvents() {
        // Main Menu - Find Match
        const btnPlay = document.getElementById('btn-play');
        if(btnPlay) btnPlay.addEventListener('click', () => this.startMatchmaking());

        // Mode Select
        document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedTime = parseInt(e.target.getAttribute('data-time'));
            });
        });

        // Cancel Match
        const btnCancel = document.getElementById('btn-cancel-match');
        if(btnCancel) btnCancel.addEventListener('click', () => this.cancelMatchmaking());

        // HUD - Pause
        const btnPause = document.getElementById('btn-pause');
        if(btnPause) btnPause.addEventListener('click', () => this.app.gameManager.pauseGame());

        // Pause Screen
        const btnResume = document.getElementById('btn-resume');
        if(btnResume) btnResume.addEventListener('click', () => this.app.gameManager.resumeGame());

        const btnQuit = document.getElementById('btn-quit');
        if(btnQuit) btnQuit.addEventListener('click', () => this.app.gameManager.quitGame());

        // Shop Buttons
        const btnShop = document.getElementById('btn-shop');
        if(btnShop) btnShop.addEventListener('click', () => this.switchScreen('screen-shop'));

        const btnBackShop = document.getElementById('btn-back-shop');
        if(btnBackShop) btnBackShop.addEventListener('click', () => this.switchScreen('screen-main-menu'));

        // Game Over
        const btnReplay = document.getElementById('btn-replay');
        if(btnReplay) btnReplay.addEventListener('click', () => this.app.gameManager.quitGame()); // Replay -> Menu

        const btnRevive = document.getElementById('btn-revive');
        if(btnRevive) btnRevive.addEventListener('click', () => this.app.gameManager.revivePlayer());
    }

    startMatchmaking() {
        if(!this.matchOverlay) return;
        this.matchOverlay.classList.remove('hidden');
        this.matchOverlay.classList.add('active');
        this.matchStatus.innerText = "Connecting to region...";

        // Fake Steps sequence
        const steps = [
            { t: 1000, msg: "Searching for players (1/10)..." },
            { t: 2000, msg: "Searching for players (4/10)..." },
            { t: 3000, msg: "Searching for players (8/10)..." },
            { t: 4000, msg: "Match Found! Starting..." }
        ];

        let maxTime = 0;
        steps.forEach(step => {
            setTimeout(() => {
                // Only update if still active
                if(!this.matchOverlay.classList.contains('hidden')) {
                     this.matchStatus.innerText = step.msg;
                }
            }, step.t);
            maxTime = Math.max(maxTime, step.t);
        });

        this.matchmakingTimer = setTimeout(() => {
            this.matchOverlay.classList.add('hidden');
            this.matchOverlay.classList.remove('active');
            this.app.gameManager.startGame(this.selectedTime);
        }, maxTime + 1000);
    }

    cancelMatchmaking() {
        if(this.matchmakingTimer) clearTimeout(this.matchmakingTimer);
        this.matchOverlay.classList.add('hidden');
        this.matchOverlay.classList.remove('active');
    }

    switchScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => {
            // Keep overlay visible if we are in it? No, switchScreen usually implies full switch.
            if(s.id !== 'matchmaking-overlay') {
                s.classList.add('hidden');
                s.classList.remove('active');
            }
        });

        // Show target
        const target = document.getElementById(screenId);
        if(target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }
    }

    updateHUD(time, score, kills, bots, player) {
        // Timer
        const m = Math.floor(time / 60).toString().padStart(2, '0');
        const s = Math.floor(time % 60).toString().padStart(2, '0');
        if(this.gameTimer) this.gameTimer.innerText = `${m}:${s}`;

        if(this.hudScore) this.hudScore.innerText = Math.floor(score);
        if(this.hudKills) this.hudKills.innerText = kills;

        // Leaderboard Logic
        // Combine bots + player
        // In this architecture, 'bots' passed here usually includes player if called from GameManager
        // If not, we merge.

        // Assuming 'bots' is actually all 'hole' entities.
        const all = [...bots];
        all.sort((a, b) => (b.score || 0) - (a.score || 0)); // Sort by score descending

        if(this.leaderboard) {
            let html = '';
            // Top 3
            for(let i=0; i<Math.min(3, all.length); i++) {
                const ent = all[i];
                const isMe = (ent === player);
                html += `<div class="rank-item" style="${isMe ? 'color:#00f3ff; font-weight:bold' : ''}">${i+1}. ${ent.name || 'Bot'}</div>`;
            }
            // If player not in top 3
            const pIndex = all.indexOf(player);
            if(pIndex > 2) {
                 html += `<div class="rank-item" style="color:#00f3ff; font-weight:bold">${pIndex+1}. ${player.name}</div>`;
            }
            this.leaderboard.innerHTML = html;
        }

        // Minimap
        this.updateMinimap(all, player);
    }

    updateMinimap(allHoles, player) {
        if(!this.minimapCtx) return;
        const ctx = this.minimapCtx;
        const w = this.minimapCanvas.width;
        const h = this.minimapCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw World Bounds? Infinite map, so just draw relative to player?
        // Usually minimap shows a fixed area around player.
        // Let's say 2000 units radius.
        const range = 2000;

        ctx.save();
        ctx.translate(w/2, h/2);

        // Draw Dots
        for(const hole of allHoles) {
            if(hole.markedForDeletion) continue;

            const dx = hole.x - player.x;
            const dy = hole.y - player.y;

            // Map dx/dy to minimap space
            // Range -> w/2
            const mx = (dx / range) * (w/2);
            const my = (dy / range) * (h/2);

            // Clamp to bounds
            if (mx < -w/2 || mx > w/2 || my < -h/2 || my > h/2) continue; // Out of radar

            ctx.fillStyle = (hole === player) ? '#00f3ff' : '#ff0000';
            ctx.beginPath();
            ctx.arc(mx, my, 3, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.restore();
    }

    showGameOver(rank, coins) {
        if(this.finalRank) this.finalRank.innerText = `RANK #${rank}`;
        if(this.earnedCoins) this.earnedCoins.innerText = coins;
        this.switchScreen('screen-game-over');
    }

    updateMenuCoins(coins) {
        if(this.menuCoinCount) this.menuCoinCount.innerText = coins;
        if(this.shopCoinCount) this.shopCoinCount.innerText = coins;
    }

    showNotification(text, color) {
        const div = document.createElement('div');
        div.innerText = text;
        div.style.position = 'absolute';
        div.style.top = '20%';
        div.style.left = '50%';
        div.style.transform = 'translate(-50%, -50%)';
        div.style.color = color || '#fff';
        div.style.fontSize = '2rem';
        div.style.fontWeight = 'bold';
        div.style.textShadow = '0 0 10px black';
        div.style.zIndex = '2000';
        div.className = 'pulse';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2000);
    }
}
