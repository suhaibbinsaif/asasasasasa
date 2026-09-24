import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { safeStorage } from '../utils/storage';

export type AudioMode = 'rain' | 'cyber-drone';

interface AudioContextType {
  isPlaying: boolean;
  isTabVisible: boolean;
  isAutoPaused: boolean;
  toggleAudio: () => void;
  playAudio: (isManual?: boolean) => void;
  pauseAudio: (isManual?: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  audioMode: AudioMode;
  setAudioMode: (mode: AudioMode) => void;
}

const AudioContextInstance = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(() => (typeof document !== 'undefined' ? !document.hidden : true));
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [audioMode, setAudioModeState] = useState<AudioMode>('rain');

  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const cachedNoiseBufferRef = useRef<AudioBuffer | null>(null);
  const isPlayingRef = useRef(false);
  const wasAutoPausedRef = useRef(false);

  // Track if user explicitly muted the audio manually (persisted in safeStorage)
  // Default to false so audio is ON when user is on the website
  const userDisabledRef = useRef<boolean>(
    safeStorage.getItem('rain-audio-enabled', 'true') === 'false'
  );

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

  // Generate Warm Pink Noise Buffer for realistic rain texture (cached for fast tab switching)
  const getRainNoiseBuffer = (ctx: AudioContext, seconds = 4): AudioBuffer => {
    if (cachedNoiseBufferRef.current && cachedNoiseBufferRef.current.sampleRate === ctx.sampleRate) {
      return cachedNoiseBufferRef.current;
    }
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
    cachedNoiseBufferRef.current = buffer;
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
    const noiseBuffer = getRainNoiseBuffer(ctx, 4);
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
  const playAudio = useCallback((isManual = false) => {
    if (isManual) {
      userDisabledRef.current = false;
      safeStorage.setItem('rain-audio-enabled', 'true');
    }

    // Do not play if user intentionally muted, or if the document/tab is currently hidden
    if (userDisabledRef.current) return;
    if (typeof document !== 'undefined' && (document.hidden || document.visibilityState === 'hidden')) {
      return;
    }

    const ctx = getOrCreateContext();
    if (!ctx || !masterGainRef.current) return;

    const performPlay = () => {
      const masterGain = masterGainRef.current;
      if (!masterGain) return;

      if (!rainNodesRef.current.isRunning) {
        startRainSound(ctx, masterGain);
      }

      // Smooth fade in
      const targetVol = volumeRef.current * 0.45;
      try {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        const currentVal = masterGain.gain.value > 0 ? masterGain.gain.value : 0.001;
        masterGain.gain.setValueAtTime(currentVal, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, targetVol), ctx.currentTime + 0.6);
      } catch {
        masterGain.gain.value = targetVol;
      }

      setIsPlaying(true);
      isPlayingRef.current = true;
      wasAutoPausedRef.current = false;
      setIsAutoPaused(false);
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(performPlay).catch(() => {
        // Autoplay policy waiting for user gesture
      });
    } else {
      performPlay();
    }
  }, [startRainSound]);

  // Pause Audio with smooth fade out
  const pauseAudio = useCallback((isManual = true) => {
    if (isManual) {
      userDisabledRef.current = true;
      safeStorage.setItem('rain-audio-enabled', 'false');
      wasAutoPausedRef.current = false;
      setIsAutoPaused(false);
    } else {
      // Auto-paused because tab lost focus / visibility
      wasAutoPausedRef.current = true;
      setIsAutoPaused(true);
    }

    const ctx = ctxRef.current;
    const masterGain = masterGainRef.current;

    if (ctx && masterGain && ctx.state !== 'closed') {
      try {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        const curGain = masterGain.gain.value > 0.0001 ? masterGain.gain.value : 0.1;
        masterGain.gain.setValueAtTime(curGain, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      } catch {
        masterGain.gain.value = 0;
      }

      setTimeout(() => {
        stopSoundGenerators();
        setIsPlaying(false);
        isPlayingRef.current = false;
      }, 300);
    } else {
      stopSoundGenerators();
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [stopSoundGenerators]);

  const toggleAudio = useCallback(() => {
    if (isPlaying) {
      pauseAudio(true);
    } else {
      userDisabledRef.current = false;
      safeStorage.setItem('rain-audio-enabled', 'true');
      playAudio(true);
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

  // Tab Visibility & Focus Lifecycle Management:
  // "web be thuk le audio off thake web thuk le jate on thake"
  // When leaving web (switching tab, minimizing, blur) -> Audio OFF
  // When on web (focused, visible) -> Audio ON
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      const isHidden = document.hidden || document.visibilityState === 'hidden';
      setIsTabVisible(!isHidden);

      if (isHidden) {
        // Tab switched away or minimized: turn audio OFF immediately
        if (isPlayingRef.current) {
          pauseAudio(false);
        }
      } else {
        // Returned to tab: turn audio back ON if user hasn't explicitly disabled it
        if (!userDisabledRef.current) {
          playAudio(false);
        }
      }
    };

    const handleBlur = () => {
      // Window lost focus (user moved to another program/window)
      if (isPlayingRef.current) {
        pauseAudio(false);
      }
    };

    const handleFocus = () => {
      // Window gained focus
      if (!document.hidden && !userDisabledRef.current && wasAutoPausedRef.current) {
        playAudio(false);
      }
    };

    const handlePageHide = () => {
      if (isPlayingRef.current) {
        pauseAudio(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [pauseAudio, playAudio]);

  // Initial Auto-Start When on Web ("web thuk le jate on thake"):
  // Tries immediate autoplay, and hooks into first user gesture (touch, scroll, click, keydown)
  // to satisfy browser autoplay requirements without user having to hunt for buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Try starting immediately if tab is visible and audio isn't user-disabled
    if (!userDisabledRef.current && !document.hidden) {
      playAudio(false);
    }

    // Modern browsers require a user interaction to resume AudioContext.
    // As soon as the user touches, scrolls, or clicks anything on the website:
    const handleFirstGesture = () => {
      if (!userDisabledRef.current && !document.hidden && !isPlayingRef.current) {
        playAudio(false);
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('scroll', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
    };
  }, [playAudio]);

  // Cleanup on unmount
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
        isTabVisible,
        isAutoPaused,
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
