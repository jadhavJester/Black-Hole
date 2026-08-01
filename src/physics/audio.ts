/**
 * Web Audio API Procedural Cosmic Soundscape & LIGO GW Audio Chirp Engine
 * Physics-driven sound synthesizer: zero MP3 assets required
 * Generates ambient drones, solar wind plasma noise, supernova core bounce booms,
 * LIGO GW strain audio chirps (35 Hz -> 300 Hz), and quantum Hawking radiation hiss.
 */

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private isInitialized: boolean = false;

  // Sound Oscillators & Generators
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  private plasmaNoiseNode: AudioBufferSourceNode | null = null;
  private plasmaFilter: BiquadFilterNode | null = null;
  private plasmaGain: GainNode | null = null;

  private gwChirpOsc: OscillatorNode | null = null;
  private gwChirpGain: GainNode | null = null;

  private hawkingNoiseNode: AudioBufferSourceNode | null = null;
  private hawkingFilter: BiquadFilterNode | null = null;
  private hawkingGain: GainNode | null = null;

  private currentStageIndex: number = -1;

  public init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupSubBassDrone();
      this.setupPlasmaNoise();
      this.setupGWChirp();
      this.setupHawkingHiss();

      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported in browser", e);
    }
  }

  public toggleMute(): boolean {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0.0 : 0.4, this.ctx.currentTime, 0.1);
    }
    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // 1. Deep Sub-Bass Synth Drone
  private setupSubBassDrone() {
    if (!this.ctx || !this.masterGain) return;

    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();

    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(55.0, this.ctx.currentTime); // 55 Hz (A1)

    this.droneGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    this.droneOsc.start();
  }

  // 2. Solar Wind & Accretion Disk Plasma Noise Generator
  private setupPlasmaNoise() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.plasmaNoiseNode = this.ctx.createBufferSource();
    this.plasmaNoiseNode.buffer = noiseBuffer;
    this.plasmaNoiseNode.loop = true;

    this.plasmaFilter = this.ctx.createBiquadFilter();
    this.plasmaFilter.type = 'bandpass';
    this.plasmaFilter.frequency.setValueAtTime(400.0, this.ctx.currentTime);
    this.plasmaFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.plasmaGain = this.ctx.createGain();
    this.plasmaGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.plasmaNoiseNode.connect(this.plasmaFilter);
    this.plasmaFilter.connect(this.plasmaGain);
    this.plasmaGain.connect(this.masterGain);
    this.plasmaNoiseNode.start();
  }

  // 3. LIGO GW150914 Audio Chirp Synthesizer
  private setupGWChirp() {
    if (!this.ctx || !this.masterGain) return;

    this.gwChirpOsc = this.ctx.createOscillator();
    this.gwChirpGain = this.ctx.createGain();

    this.gwChirpOsc.type = 'sine';
    this.gwChirpOsc.frequency.setValueAtTime(35.0, this.ctx.currentTime);

    this.gwChirpGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.gwChirpOsc.connect(this.gwChirpGain);
    this.gwChirpGain.connect(this.masterGain);
    this.gwChirpOsc.start();
  }

  // 4. Hawking Quantum Emission High-Pass Hiss Generator
  private setupHawkingHiss() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.hawkingNoiseNode = this.ctx.createBufferSource();
    this.hawkingNoiseNode.buffer = noiseBuffer;
    this.hawkingNoiseNode.loop = true;

    this.hawkingFilter = this.ctx.createBiquadFilter();
    this.hawkingFilter.type = 'highpass';
    this.hawkingFilter.frequency.setValueAtTime(2500.0, this.ctx.currentTime);

    this.hawkingGain = this.ctx.createGain();
    this.hawkingGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.hawkingNoiseNode.connect(this.hawkingFilter);
    this.hawkingFilter.connect(this.hawkingGain);
    this.hawkingGain.connect(this.masterGain);
    this.hawkingNoiseNode.start();
  }

  // Update Audio Soundscape in Sync with Timeline Stages (0 to 9)
  public updateStageAudio(stageIndex: number, stageProgress: number, gwAmplitude: number, gwFrequency: number) {
    if (!this.ctx || !this.isInitialized || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Stage-Specific Ambient Modulation
    if (stageIndex === 0) {
      // Stage 1: Molecular Cloud Collapse -> Deep 55 Hz Drone
      if (this.droneOsc && this.droneGain) {
        this.droneOsc.frequency.setTargetAtTime(45.0 + stageProgress * 15.0, now, 0.1);
        this.droneGain.gain.setTargetAtTime(0.3, now, 0.1);
      }
      if (this.plasmaGain) this.plasmaGain.gain.setTargetAtTime(0.05, now, 0.1);
      if (this.gwChirpGain) this.gwChirpGain.gain.setTargetAtTime(0.0, now, 0.1);
      if (this.hawkingGain) this.hawkingGain.gain.setTargetAtTime(0.0, now, 0.1);
    } else if (stageIndex === 1 || stageIndex === 2) {
      // Stage 2 & 3: Protostar & Massive Star -> Solar Plasma Resonance & Wind Noise
      if (this.droneOsc && this.droneGain) {
        this.droneOsc.frequency.setTargetAtTime(110.0, now, 0.1);
        this.droneGain.gain.setTargetAtTime(0.2, now, 0.1);
      }
      if (this.plasmaGain && this.plasmaFilter) {
        this.plasmaFilter.frequency.setTargetAtTime(600.0 + stageProgress * 400.0, now, 0.1);
        this.plasmaGain.gain.setTargetAtTime(0.25, now, 0.1);
      }
      if (this.gwChirpGain) this.gwChirpGain.gain.setTargetAtTime(0.0, now, 0.1);
      if (this.hawkingGain) this.hawkingGain.gain.setTargetAtTime(0.0, now, 0.1);
    } else if (stageIndex === 3) {
      // Stage 4: Supernova Core Collapse -> Explosive Low-Frequency Boom
      if (this.droneOsc && this.droneGain) {
        const boomFreq = 35.0 + Math.sin(stageProgress * Math.PI) * 45.0;
        this.droneOsc.frequency.setTargetAtTime(boomFreq, now, 0.05);
        this.droneGain.gain.setTargetAtTime(0.5, now, 0.05);
      }
      if (this.plasmaGain && this.plasmaFilter) {
        this.plasmaFilter.frequency.setTargetAtTime(1500.0 * Math.sin(stageProgress * Math.PI), now, 0.05);
        this.plasmaGain.gain.setTargetAtTime(0.4 * Math.sin(stageProgress * Math.PI), now, 0.05);
      }
    } else if (stageIndex === 4 || stageIndex === 5) {
      // Stage 5 & 6: Event Horizon & Accretion -> Doppler Plasma Whirl
      if (this.droneOsc && this.droneGain) {
        this.droneOsc.frequency.setTargetAtTime(80.0, now, 0.1);
        this.droneGain.gain.setTargetAtTime(0.25, now, 0.1);
      }
      if (this.plasmaGain && this.plasmaFilter) {
        this.plasmaFilter.frequency.setTargetAtTime(800.0 + Math.sin(now * 3.0) * 200.0, now, 0.1);
        this.plasmaGain.gain.setTargetAtTime(0.35, now, 0.1);
      }
      if (this.gwChirpGain) this.gwChirpGain.gain.setTargetAtTime(0.0, now, 0.1);
      if (this.hawkingGain) this.hawkingGain.gain.setTargetAtTime(0.0, now, 0.1);
    } else if (stageIndex === 6) {
      // Stage 7: Binary Inspiral Merger -> LIGO GW150914 Strain Audio Chirp!
      if (this.gwChirpOsc && this.gwChirpGain) {
        const chirpFreq = Math.max(35.0, Math.min(320.0, gwFrequency));
        this.gwChirpOsc.frequency.setTargetAtTime(chirpFreq, now, 0.03);
        this.gwChirpGain.gain.setTargetAtTime(gwAmplitude * 0.45, now, 0.03);
      }
      if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.1, now, 0.1);
      if (this.plasmaGain) this.plasmaGain.gain.setTargetAtTime(0.1, now, 0.1);
    } else if (stageIndex === 7) {
      // Stage 8: Quiescence -> Silent Space Rumble
      if (this.droneOsc && this.droneGain) {
        this.droneOsc.frequency.setTargetAtTime(40.0, now, 0.1);
        this.droneGain.gain.setTargetAtTime(0.15, now, 0.1);
      }
      if (this.plasmaGain) this.plasmaGain.gain.setTargetAtTime(0.02, now, 0.1);
      if (this.gwChirpGain) this.gwChirpGain.gain.setTargetAtTime(0.0, now, 0.1);
      if (this.hawkingGain) this.hawkingGain.gain.setTargetAtTime(0.0, now, 0.1);
    } else {
      // Stage 9 & 10: Hawking Evaporation & Final Burst -> Quantum Radiation Hiss
      if (this.hawkingGain && this.hawkingFilter) {
        const hissFreq = 2000.0 + Math.pow(stageProgress, 2.5) * 6000.0;
        this.hawkingFilter.frequency.setTargetAtTime(hissFreq, now, 0.05);
        this.hawkingGain.gain.setTargetAtTime(0.1 + Math.pow(stageProgress, 2.0) * 0.4, now, 0.05);
      }
      if (this.droneGain) this.droneGain.gain.setTargetAtTime(0.1, now, 0.1);
      if (this.plasmaGain) this.plasmaGain.gain.setTargetAtTime(0.0, now, 0.1);
    }

    this.currentStageIndex = stageIndex;
  }
}

export const cosmicAudio = new CosmicAudioEngine();
