export default class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
        this.sounds = {}; // Cache for buffers if we used files, unused for synth
    }

    init() {
        if (this.initialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Master Volume
            this.masterGain.connect(this.ctx.destination);

            this.initialized = true;
            console.log("Audio Initialized");

            // Start Ambient
            this.startAmbience();
        } catch (e) {
            console.warn("WebAudio API not supported or blocked", e);
        }
    }

    // Call this on user interaction (Play Button)
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    play(type) {
        if (!this.initialized) return;
        this.resume();

        const now = this.ctx.currentTime;

        switch (type) {
            case 'eatSmall':
                this.playPop(now);
                break;
            case 'eatLarge':
                this.playCrunch(now);
                break;
            case 'levelUp':
                this.playFanfare(now);
                break;
            case 'kill':
                this.playKill(now);
                break;
            case 'siren':
                this.playSiren(now);
                break;
            case 'uiClick':
                this.playClick(now);
                break;
        }
    }

    playPop(now) {
        // "Bloop" sound: Sine wave pitch envelope up + fast decay
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playCrunch(now) {
        // "Crunch": White noise burst + Low Sawtooth
        // 1. Noise
        const bufferSize = this.ctx.sampleRate * 0.2; // 0.2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, now);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now);

        // 2. Low Thud
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playFanfare(now) {
        // Major Arpeggio: C - E - G - C
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const start = now + i * 0.08;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);

            osc.start(start);
            osc.stop(start + 0.4);
        });
    }

    playKill(now) {
        // Retro "Power Down" / Scratch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    playClick(now) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.frequency.setValueAtTime(800, now);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playSiren(now) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.3);
        osc.frequency.linearRampToValueAtTime(600, now + 0.6);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.6);
        gain.gain.linearRampToValueAtTime(0, now + 0.8);

        osc.start(now);
        osc.stop(now + 0.8);
    }

    startAmbience() {
        // Deep Space Drone / City Hum
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Lowpass Filter for "muffled" city sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120; // Deep rumble

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sawtooth'; // Richer than sine
        osc.frequency.value = 60; // 60Hz hum
        gain.gain.value = 0.1;

        // LFO to make it breathe
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.2; // Slow cycle
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 20; // Modulate filter frequency by +/- 20Hz

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        lfo.start();
        osc.start();
    }
}
