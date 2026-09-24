import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CloudRain, Wind, Droplets, Sparkles, Sliders, Eye, EyeOff, Radio, Volume2, VolumeX } from 'lucide-react';
import { CyberBackground } from './CyberBackground';
import { useAudio } from '../context/AudioContext';

export type WeatherType = 'digital-rain' | 'data-stream' | 'cyber-mist' | 'off';
export type WeatherIntensity = 'subtle' | 'normal' | 'intense';

interface RainStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  thickness: number;
  alpha: number;
  layer: number; // 0: background, 1: midground, 2: foreground
  color: string;
}

interface DataGlyph {
  x: number;
  y: number;
  vy: number;
  vx: number;
  char: string;
  size: number;
  alpha: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  color: string;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface CyberMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulsePhase: number;
  color: string;
}

export function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio Engine Hook (Realistic Ambient Rain Sound)
  const {
    isPlaying: isRainAudioPlaying,
    isAutoPaused,
    toggleAudio: toggleRainAudio,
    volume: rainVolume,
    setVolume: setRainVolume,
  } = useAudio();

  // Weather Settings State
  const [weatherType, setWeatherType] = useState<WeatherType>('digital-rain');
  const [intensity, setIntensity] = useState<WeatherIntensity>('subtle');
  const [isWeatherHudOpen, setIsWeatherHudOpen] = useState<boolean>(false);
  const [isAtmosphereActive, setIsAtmosphereActive] = useState<boolean>(true);

  // Randomized Ambient Weather Cycle (slow, natural shifts)
  const [ambientReadout, setAmbientReadout] = useState<{
    density: string;
    windKts: number;
    humidity: number;
  }>({
    density: 'OPTIMAL',
    windKts: 4.2,
    humidity: 88,
  });

  // Wind state for realistic angled drift
  const windRef = useRef<{ current: number; target: number }>({ current: -0.6, target: -0.8 });

  // Mouse wind wake interaction
  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number; lastX: number; lastY: number }>({
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    lastX: -9999,
    lastY: -9999,
  });

  // Reduced motion preference
  const prefersReducedMotion = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion.current = mediaQuery.matches;
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotion.current = e.matches;
        if (e.matches) setIsAtmosphereActive(false);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Periodic subtle ambient telemetry shift
  useEffect(() => {
    const interval = setInterval(() => {
      windRef.current.target = (Math.random() - 0.5) * 1.8;
      setAmbientReadout({
        density: intensity === 'subtle' ? 'LOW DENSITY' : intensity === 'intense' ? 'HEAVY CLUSTER' : 'OPTIMAL',
        windKts: parseFloat((Math.random() * 4 + 2).toFixed(1)),
        humidity: Math.floor(Math.random() * 15 + 80),
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [intensity]);

  // Main Weather Particle Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Weather Palette - Cyber Lime Matrix (Default)
    const rainColors = [
      'rgba(163, 230, 53, ', // lime-400
      'rgba(190, 242, 100, ', // lime-300
      'rgba(132, 204, 22, ', // lime-500
      'rgba(236, 252, 203, ', // ice lime core
      'rgba(34, 197, 94, ', // emerald-500
    ];

    const glyphChars = ['0', '1', '◈', '§', '::', 'λ', '∆', '0x', 'FF', '7', '#', '+', '•', 'Ø'];

    // Collections
    let streaks: RainStreak[] = [];
    let glyphs: DataGlyph[] = [];
    let splashes: Splash[] = [];
    let motes: CyberMote[] = [];

    // Density Multipliers
    const getCount = (base: number) => {
      const mult = intensity === 'subtle' ? 0.45 : intensity === 'intense' ? 1.6 : 1.0;
      return Math.floor(base * mult);
    };

    const initParticles = () => {
      streaks = [];
      glyphs = [];
      splashes = [];
      motes = [];

      // 1. Digital Rain Streaks
      const streakCount = getCount(Math.min(width, 1600) / 14);
      for (let i = 0; i < streakCount; i++) {
        const layer = Math.random() < 0.5 ? 0 : Math.random() < 0.8 ? 1 : 2;
        const color = rainColors[Math.floor(Math.random() * rainColors.length)];
        streaks.push({
          x: Math.random() * (width + 200) - 100,
          y: Math.random() * height,
          length: layer === 0 ? Math.random() * 12 + 10 : layer === 1 ? Math.random() * 20 + 16 : Math.random() * 32 + 24,
          speed: layer === 0 ? Math.random() * 4 + 5 : layer === 1 ? Math.random() * 7 + 8 : Math.random() * 10 + 12,
          thickness: layer === 0 ? 0.75 : layer === 1 ? 1.1 : 1.6,
          alpha: layer === 0 ? Math.random() * 0.18 + 0.1 : layer === 1 ? Math.random() * 0.3 + 0.15 : Math.random() * 0.45 + 0.25,
          layer,
          color,
        });
      }

      // 2. Falling Data Glyphs (Streams)
      const glyphCount = getCount(Math.min(width, 1600) / 38);
      for (let i = 0; i < glyphCount; i++) {
        const color = rainColors[Math.floor(Math.random() * rainColors.length)];
        glyphs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vy: Math.random() * 1.6 + 0.9,
          vx: 0,
          char: glyphChars[Math.floor(Math.random() * glyphChars.length)],
          size: Math.random() * 3 + 9,
          alpha: Math.random() * 0.45 + 0.2,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.03 + 0.015,
          swayAmp: Math.random() * 18 + 8,
          color,
        });
      }

      // 3. Ambient Atmospheric Cyber Motes (Mist / Ionized Dust)
      const moteCount = getCount(Math.min(width, 1600) / 28);
      for (let i = 0; i < moteCount; i++) {
        const color = rainColors[Math.floor(Math.random() * rainColors.length)];
        motes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: Math.random() * 0.3 + 0.15,
          radius: Math.random() * 1.5 + 0.8,
          alpha: Math.random() * 0.35 + 0.1,
          pulsePhase: Math.random() * Math.PI * 2,
          color,
        });
      }
    };

    initParticles();

    // Mouse Tracking for Interactive Wind Wake
    const handleMouseMove = (e: MouseEvent) => {
      const mouse = mouseRef.current;
      if (mouse.lastX !== -9999) {
        mouse.vx = (e.clientX - mouse.lastX) * 0.25;
        mouse.vy = (e.clientY - mouse.lastY) * 0.25;
      }
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      mouseRef.current.vx = 0;
      mouseRef.current.vy = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Render loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      if (!isAtmosphereActive || weatherType === 'off' || prefersReducedMotion.current) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Smooth Wind Evolution
      windRef.current.current += (windRef.current.target - windRef.current.current) * 0.02;
      const windX = windRef.current.current;

      const mouse = mouseRef.current;

      // ===============================================
      // 1. RENDER DIGITAL RAIN (Weather Mode: digital-rain)
      // ===============================================
      if (weatherType === 'digital-rain') {
        for (let i = 0; i < streaks.length; i++) {
          const s = streaks[i];

          // Move along angled vector with wind
          s.y += s.speed;
          s.x += windX * (s.layer + 1);

          // Mouse Wake Repulsion / Aerodynamic Push
          if (mouse.x !== -9999) {
            const dx = s.x - mouse.x;
            const dy = s.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 120 && dist > 1) {
              const push = (1 - dist / 120) * 8;
              s.x += (dx / dist) * push + mouse.vx * 0.5;
            }
          }

          // Loop or Splash
          if (s.y > height + 20) {
            // Trigger randomized splash on bottom edge
            if (Math.random() < 0.25 && splashes.length < 25) {
              splashes.push({
                x: s.x,
                y: height - Math.random() * 8,
                radius: 1,
                maxRadius: Math.random() * 6 + 3,
                alpha: 0.4,
                color: s.color,
              });
            }

            s.y = -s.length - Math.random() * 40;
            s.x = Math.random() * (width + 300) - 150;
          }

          // Draw Rain Streak with trailing fading gradient
          const endX = s.x + windX * (s.length * 0.4);
          const endY = s.y + s.length;

          const grad = ctx.createLinearGradient(s.x, s.y, endX, endY);
          grad.addColorStop(0, 'transparent');
          grad.addColorStop(0.7, `${s.color}${s.alpha * 0.7})`);
          grad.addColorStop(1, `${s.color}${s.alpha})`);

          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = s.thickness;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw Splashes
        for (let j = splashes.length - 1; j >= 0; j--) {
          const sp = splashes[j];
          sp.radius += 0.4;
          sp.alpha -= 0.025;

          if (sp.alpha <= 0) {
            splashes.splice(j, 1);
            continue;
          }

          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, sp.radius * 1.8, sp.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `${sp.color}${sp.alpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }

      // ===============================================
      // 2. RENDER FALLING DATA STREAMS (Weather Mode: data-stream or subtle blend in digital-rain)
      // ===============================================
      if (weatherType === 'data-stream' || weatherType === 'digital-rain') {
        const renderGlyphs = weatherType === 'data-stream' ? glyphs : glyphs.slice(0, Math.floor(glyphs.length * 0.4));
        ctx.textAlign = 'center';

        for (let k = 0; k < renderGlyphs.length; k++) {
          const g = renderGlyphs[k];

          g.y += g.vy;
          g.swayPhase += g.swaySpeed;
          const swayX = Math.sin(g.swayPhase) * g.swayAmp;
          const currentX = g.x + swayX + windX * 20;

          // Occasionally morph character for organic cyber telemetry feel
          if (Math.random() < 0.005) {
            g.char = glyphChars[Math.floor(Math.random() * glyphChars.length)];
          }

          if (g.y > height + 20) {
            g.y = -20 - Math.random() * 50;
            g.x = Math.random() * width;
            g.char = glyphChars[Math.floor(Math.random() * glyphChars.length)];
          }

          ctx.font = `${g.size}px monospace`;
          ctx.fillStyle = `${g.color}${g.alpha})`;
          ctx.fillText(g.char, currentX, g.y);
        }
      }

      // ===============================================
      // 3. RENDER ATMOSPHERIC CYBER MIST / IONIZED DUST
      // ===============================================
      if (weatherType === 'cyber-mist' || weatherType === 'digital-rain') {
        for (let m = 0; m < motes.length; m++) {
          const mote = motes[m];

          mote.x += mote.vx + windX * 0.4;
          mote.y += mote.vy;
          mote.pulsePhase += 0.02;

          if (mote.y > height) mote.y = 0;
          if (mote.x > width) mote.x = 0;
          else if (mote.x < 0) mote.x = width;

          const currentAlpha = mote.alpha * (0.6 + Math.sin(mote.pulsePhase) * 0.4);

          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${mote.color}${currentAlpha})`;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [weatherType, intensity, isAtmosphereActive]);

  return (
    <>
      {/* 1. Underlying Base Background Animations & Cyber Constellations */}
      <CyberBackground />

      {/* 2. Atmospheric Weather Particle Canvas Layer */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[1] select-none opacity-85"
      />

      {/* 3. Atmospheric Telemetry Ambient Control Pill */}
      <div className="fixed bottom-5 right-5 z-40 select-none">
        <div className="relative">
          {/* Expanded Atmosphere Control Deck */}
          {isWeatherHudOpen && (
            <div className="mb-2 p-3.5 rounded-lg bg-black/90 border border-cyan-500/40 backdrop-blur-xl text-xs font-mono shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col gap-3 min-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>ATMOSPHERE HUD</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {isAtmosphereActive && weatherType !== 'off' ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>

              {/* Weather Telemetry Readout */}
              <div className="p-2 rounded bg-white/5 border border-white/10 flex flex-col gap-1 text-[10px] text-gray-400">
                <div className="flex justify-between">
                  <span>ATMOSPHERE:</span>
                  <span className="text-cyan-300 font-bold uppercase">{weatherType.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATA WIND:</span>
                  <span className="text-gray-200">{ambientReadout.windKts} kts / 340°</span>
                </div>
                <div className="flex justify-between">
                  <span>HUMIDITY:</span>
                  <span className="text-gray-200">{ambientReadout.humidity}% DATA SATURATION</span>
                </div>
              </div>

              {/* Weather Preset Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-400 text-[10px] uppercase">Weather Phenomenon</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setWeatherType('digital-rain');
                      setIsAtmosphereActive(true);
                    }}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      weatherType === 'digital-rain' && isAtmosphereActive
                        ? 'bg-lime-500 text-black shadow-[0_0_10px_rgba(163,230,53,0.6)]'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <CloudRain className="w-3 h-3" />
                    <span>DIGITAL RAIN</span>
                  </button>

                  <button
                    onClick={() => {
                      setWeatherType('data-stream');
                      setIsAtmosphereActive(true);
                    }}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      weatherType === 'data-stream' && isAtmosphereActive
                        ? 'bg-lime-500 text-black shadow-[0_0_10px_rgba(163,230,53,0.6)]'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Droplets className="w-3 h-3" />
                    <span>DATA STREAMS</span>
                  </button>

                  <button
                    onClick={() => {
                      setWeatherType('cyber-mist');
                      setIsAtmosphereActive(true);
                    }}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      weatherType === 'cyber-mist' && isAtmosphereActive
                        ? 'bg-lime-500 text-black shadow-[0_0_10px_rgba(163,230,53,0.6)]'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Wind className="w-3 h-3" />
                    <span>CYBER MIST</span>
                  </button>

                  <button
                    onClick={() => {
                      setWeatherType('off');
                    }}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      weatherType === 'off' || !isAtmosphereActive
                        ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>CLEAR SKY</span>
                  </button>
                </div>
              </div>

              {/* Density & Intensity Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-400 text-[10px] uppercase">Particle Intensity</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['subtle', 'normal', 'intense'] as WeatherIntensity[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setIntensity(lvl)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        intensity === lvl
                          ? 'bg-lime-500/20 text-lime-300 border border-lime-400/60'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Realistic Rain Sound Audio Controller */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] uppercase flex items-center gap-1 font-mono">
                    <Volume2 className="w-3 h-3 text-lime-400" />
                    <span>Rain Audio FX</span>
                  </span>
                  <span className={`text-[9px] font-mono font-bold ${isRainAudioPlaying ? 'text-lime-400' : isAutoPaused ? 'text-amber-400' : 'text-gray-500'}`}>
                    {isRainAudioPlaying ? 'ACTIVE // PLAYING' : isAutoPaused ? 'STANDBY // TAB INACTIVE' : 'MUTED'}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-gray-500">
                  {isAutoPaused
                    ? '⏸ Tab inactive: audio muted. Resumes automatically on return.'
                    : '⚡ Smart Playback: Active on site, auto-mutes when away from tab.'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    id="hud-rain-audio-toggle"
                    onClick={toggleRainAudio}
                    className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isRainAudioPlaying
                        ? 'bg-lime-500 text-black shadow-[0_0_12px_rgba(163,230,53,0.5)]'
                        : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {isRainAudioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
                    <span>{isRainAudioPlaying ? 'PAUSE RAIN SOUND' : 'START RAIN SOUND'}</span>
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-2 px-1 pt-0.5">
                  <span className="text-[9px] text-gray-400 font-mono">VOL</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rainVolume}
                    onChange={(e) => setRainVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-lime-400 h-1 bg-white/10 rounded cursor-pointer"
                    title="Rain Audio Volume"
                  />
                  <span className="text-[9px] text-lime-400 font-mono w-6 text-right">
                    {Math.round(rainVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* Quick Toggle On / Off */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <button
                  onClick={() => setIsAtmosphereActive((p) => !p)}
                  className="flex-1 py-1.5 rounded bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white flex items-center justify-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {isAtmosphereActive ? (
                    <>
                      <EyeOff className="w-3 h-3 text-lime-400" />
                      <span>PAUSE ATMOSPHERE</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 text-lime-400" />
                      <span>RESUME ATMOSPHERE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Atmosphere HUD Pill */}
          <button
            id="btn-atmosphere-toggle"
            onClick={() => setIsWeatherHudOpen((o) => !o)}
            aria-label="Toggle Atmosphere Weather controls"
            title="Atmosphere & Rain Sound Controls"
            className="group px-3 py-1.5 rounded-full bg-black/85 hover:bg-black border border-lime-500/40 hover:border-lime-400 text-lime-300 font-mono text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.2)] hover:shadow-[0_0_25px_rgba(163,230,53,0.4)] backdrop-blur-md transition-all duration-300 cursor-pointer"
          >
            <CloudRain className="w-3.5 h-3.5 text-lime-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-bold">ATMOSPHERE:</span>
            <span className="text-gray-300 group-hover:text-lime-200 uppercase">
              {weatherType === 'off' || !isAtmosphereActive ? 'CLEAR' : weatherType.replace('-', ' ')}
            </span>
            {isRainAudioPlaying && (
              <span className="flex items-center gap-0.5 text-lime-400 font-bold ml-0.5">
                <Volume2 className="w-3 h-3 animate-pulse" />
              </span>
            )}
            <Sliders className="w-3 h-3 text-lime-400 group-hover:rotate-45 transition-transform" />
          </button>
        </div>
      </div>
    </>
  );
}
