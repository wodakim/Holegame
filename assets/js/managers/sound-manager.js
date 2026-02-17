export default class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
        this.muted = false;
    }

    init() {
        if (this.initialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4; // Reasonable volume
        this.masterGain.connect(this.ctx.destination);

        this.initialized = true;

        // Start ambient drone (The "City Hum")
        this.startAmbience();
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.4, this.ctx.currentTime, 0.1);
        }
    }

    play(type) {
        if (!this.initialized || this.muted) return;

        try {
            if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});

            const t = this.ctx.currentTime;

            switch (type) {
            case 'uiClick':
                this.playTone(t, 800, 'sine', 0.1, 0.1);
                this.playTone(t, 1200, 'triangle', 0.05, 0.05); // "Click" transient
                break;

            case 'uiOpen':
                // Whoosh up
                this.playSweep(t, 200, 600, 0.3, 'sine');
                break;

            case 'eatSmall':
                // "Bloop"
                this.playSweep(t, 400, 800, 0.1, 'sine');
                break;

            case 'eatMedium':
                // "Chomp"
                this.playTone(t, 200, 'square', 0.1, 0.2);
                this.playFilterSweep(t, 500, 100, 0.2);
                break;

            case 'eatLarge':
                // "CRUNCH" - Bass heavy
                this.playTone(t, 60, 'sawtooth', 0.3, 0.4);
                this.playNoise(t, 0.2); // White noise burst
                this.playFilterSweep(t, 800, 50, 0.3);
                break;

            case 'levelUp':
                // Major Chord Arpeggio (C Major: C, E, G, C)
                const base = 440; // A4
                const intervals = [0, 4, 7, 12]; // Semitones
                intervals.forEach((semitone, i) => {
                    const freq = base * Math.pow(2, semitone/12);
                    this.playTone(t + i*0.08, freq, 'square', 0.1, 0.4);
                });
                break;

            case 'gameOver':
                // Sad slide down
                this.playSweep(t, 400, 100, 1.0, 'sawtooth');
                this.playTone(t, 300, 'sine', 1.0, 1.0);
                break;

            case 'siren':
                // Police Siren Loop (needs manual stop ideally, but here one-shot for effect)
                this.playSweep(t, 600, 1200, 0.6, 'sawtooth');
                this.playSweep(t+0.6, 1200, 600, 0.6, 'sawtooth');
                break;
            }
        } catch (e) {
            console.warn("Audio Error:", e);
        }
    }

    // --- Synthesis Helpers ---

    playTone(time, freq, type, duration, release = 0.1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration + release);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + duration + release);
    }

    playSweep(time, startFreq, endFreq, duration, type = 'sine') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

        gain.gain.setValueAtTime(0.5, time);
        gain.gain.linearRampToValueAtTime(0.01, time + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + duration);
    }

    playNoise(time, duration) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.linearRampToValueAtTime(0.01, time + duration);

        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start(time);
    }

    playFilterSweep(time, startFreq, endFreq, duration) {
        // Just simulates the filter effect on the noise/sawtooth context if connected,
        // but here we used separate nodes.
        // For a true synth, we'd route osc -> filter -> gain.
        // Let's make a specific "Crunch" synth method instead of this helper if needed.
        // But for now, the playTone/playNoise layering is sufficient for 'Juice'.
    }

    startAmbience() {
        // A low, warm city hum (Pink Noise + Low Pass)
        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0; // Initialize outside loop
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02; // Simple Brown Noise filter
            lastOut = data[i];
            data[i] *= 3.5;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.05; // Very Quiet

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }
}
