import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';

export type AudioMode = 'rain' | 'cyber-drone';

interface AudioContextType {
  isPlaying: boolean;
  toggleAudio: () => void;
  playAudio: () => void;
  pauseAudio: () => void;
  volume: number;
  setVolume: (v: number) => void;
  audioMode: AudioMode;
  setAudioMode: (mode: AudioMode) => void;
}

const AudioContextInstance = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [audioMode, setAudioModeState] = useState<AudioMode>('rain'); // Default to RAIN sound as requested

  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const rainNodesRef = useRef<{
    noiseSource?: AudioBufferSourceNode;
    dropletTimer?: ReturnType<typeof setTimeout>;
    lfo?: OscillatorNode;
    isRunning?: boolean;
  }>({});

  const volumeRef = useRef(0.5);
  volumeRef.current = volume;

  const audioModeRef = useRef<AudioMode>('rain');
  audioModeRef.current = audioMode;

  // Initialize Web Audio Context
  const getOrCreateContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      try {
        const ctx = new AudioCtx();
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.connect(ctx.destination);

        ctxRef.current = ctx;
        masterGainRef.current = masterGain;
      } catch {
        return null;
      }
    }
    return ctxRef.current;
  };

  // Generate Warm Pink Noise Buffer for realistic rain texture
  const createRainNoiseBuffer = (ctx: AudioContext, seconds = 4): AudioBuffer => {
    const bufferSize = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Paul Kellet's Pink Noise Algorithm for warm natural rain wash
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  };

  // Clean up existing sound nodes
  const stopSoundGenerators = useCallback(() => {
    if (rainNodesRef.current.dropletTimer) {
      clearTimeout(rainNodesRef.current.dropletTimer);
      rainNodesRef.current.dropletTimer = undefined;
    }
    if (rainNodesRef.current.noiseSource) {
      try {
        rainNodesRef.current.noiseSource.stop();
        rainNodesRef.current.noiseSource.disconnect();
      } catch {
        // ignore
      }
      rainNodesRef.current.noiseSource = undefined;
    }
    if (rainNodesRef.current.lfo) {
      try {
        rainNodesRef.current.lfo.stop();
        rainNodesRef.current.lfo.disconnect();
      } catch {
        // ignore
      }
      rainNodesRef.current.lfo = undefined;
    }
    rainNodesRef.current.isRunning = false;
  }, []);

  // Individual Raindrop Ping Generator (Simulates drops tapping on glass/pavement)
  const scheduleNextDroplet = useCallback((ctx: AudioContext, destination: GainNode) => {
    if (!rainNodesRef.current.isRunning || ctx.state === 'closed') return;

    try {
      const now = ctx.currentTime;
      // Fast pitch chirp for organic water droplet impact
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();

      const startFreq = Math.random() * 1600 + 1600; // 1600Hz to 3200Hz
      const endFreq = startFreq * (Math.random() * 0.3 + 0.4); // drops down fast
      const dropDuration = Math.random() * 0.025 + 0.025; // 25ms to 50ms

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(200, endFreq), now + dropDuration);

      const dropVol = (Math.random() * 0.08 + 0.04) * volumeRef.current;
      dropGain.gain.setValueAtTime(dropVol, now);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + dropDuration);

      osc.connect(dropGain);
      dropGain.connect(destination);

      osc.start(now);
      osc.stop(now + dropDuration + 0.01);
    } catch {
      // safe ignore
    }

    // Schedule next raindrop with natural randomness (50ms to 180ms)
    const nextInterval = Math.random() * 130 + 50;
    rainNodesRef.current.dropletTimer = setTimeout(() => {
      scheduleNextDroplet(ctx, destination);
    }, nextInterval);
  }, []);

  // Build Rain Sound Synthesizer Chain
  const startRainSound = useCallback((ctx: AudioContext, masterGain: GainNode) => {
    stopSoundGenerators();
    rainNodesRef.current.isRunning = true;

    // 1. Continuous rainfall wash through shaped filters
    const noiseBuffer = createRainNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Rain body filter (bandpass focused around rainfall frequencies)
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1150;
    rainFilter.Q.value = 0.85;

    // Air / High-frequency mist filter
    const highFilter = ctx.createBiquadFilter();
    highFilter.type = 'lowpass';
    highFilter.frequency.value = 3600;

    // Rainfall gust swell LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07; // Slow gentle swell
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.35;
    lfoGain.connect(rainGain.gain);

    noiseSource.connect(rainFilter);
    rainFilter.connect(highFilter);
    highFilter.connect(rainGain);
    rainGain.connect(masterGain);

    try {
      noiseSource.start();
      lfo.start();
    } catch {
      // safe ignore
    }

    rainNodesRef.current.noiseSource = noiseSource;
    rainNodesRef.current.lfo = lfo;

    // 2. Start organic droplet impacts
    scheduleNextDroplet(ctx, masterGain);
  }, [scheduleNextDroplet, stopSoundGenerators]);

  // Start Audio Engine with smooth volume ramp
  const playAudio = useCallback(() => {
    const ctx = getOrCreateContext();
    if (!ctx || !masterGainRef.current) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const masterGain = masterGainRef.current;
    startRainSound(ctx, masterGain);

    // Fade in cleanly
    const targetVol = volumeRef.current * 0.45;
    try {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value || 0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, targetVol), ctx.currentTime + 1.0);
    } catch {
      masterGain.gain.value = targetVol;
    }

    setIsPlaying(true);
  }, [startRainSound]);

  // Pause Audio with smooth fade out
  const pauseAudio = useCallback(() => {
    const ctx = ctxRef.current;
    const masterGain = masterGainRef.current;

    if (ctx && masterGain && ctx.state !== 'closed') {
      try {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.setValueAtTime(masterGain.gain.value || 0.1, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      } catch {
        masterGain.gain.value = 0;
      }

      setTimeout(() => {
        stopSoundGenerators();
        setIsPlaying(false);
      }, 650);
    } else {
      stopSoundGenerators();
      setIsPlaying(false);
    }
  }, [stopSoundGenerators]);

  const toggleAudio = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, pauseAudio, playAudio]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    volumeRef.current = clamped;

    const ctx = ctxRef.current;
    const masterGain = masterGainRef.current;
    if (ctx && masterGain && isPlaying) {
      try {
        const target = clamped * 0.45;
        masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.1);
      } catch {
        masterGain.gain.value = clamped * 0.45;
      }
    }
  }, [isPlaying]);

  const setAudioMode = useCallback((mode: AudioMode) => {
    setAudioModeState(mode);
    audioModeRef.current = mode;
    if (isPlaying && ctxRef.current && masterGainRef.current) {
      startRainSound(ctxRef.current, masterGainRef.current);
    }
  }, [isPlaying, startRainSound]);

  useEffect(() => {
    return () => {
      stopSoundGenerators();
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, [stopSoundGenerators]);

  return (
    <AudioContextInstance.Provider
      value={{
        isPlaying,
        toggleAudio,
        playAudio,
        pauseAudio,
        volume,
        setVolume,
        audioMode,
        setAudioMode,
      }}
    >
      {children}
    </AudioContextInstance.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContextInstance);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
