import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Sliders, Play, Pause, Eye, EyeOff, Layers, ShieldCheck } from 'lucide-react';

export type BackgroundMode = 'neural' | 'matrix' | 'grid';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
  originalColor: string;
}

interface DataPacket {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
  color: string;
}

interface MatrixDrop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  headChar: string;
  charChangeRate: number;
  lastChange: number;
  length: number;
}

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // User Interactive Settings
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [mode, setMode] = useState<BackgroundMode>('neural');
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [intensity, setIntensity] = useState<'stealth' | 'normal' | 'vivid'>('normal');

  // Mouse & Touch Tracking
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  // Reduced motion preference
  const prefersReducedMotion = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion.current = mediaQuery.matches;
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotion.current = e.matches;
        if (e.matches) setIsPlaying(false);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Main Canvas Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // High-DPI screen support
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
      initElements();
    };

    window.addEventListener('resize', handleResize);

    // Particle Palette - Cyber Lime Matrix (Default)
    const cyanHues = [
      'rgba(163, 230, 53, ', // lime-400
      'rgba(190, 242, 100, ', // lime-300
      'rgba(132, 204, 22, ', // lime-500
      'rgba(236, 252, 203, ', // lime-100 ice core
      'rgba(34, 197, 94, ', // emerald-500
    ];

    // Neural Particles Collection
    let particles: Particle[] = [];
    let packets: DataPacket[] = [];

    // Matrix Rain Drops Collection
    let matrixDrops: MatrixDrop[] = [];
    const matrixChars = '010101XYZ01λΩΔΨ9876543210§#<>[]{}*+/=~SHADOWCLUB';

    const particleCount =
      intensity === 'stealth'
        ? Math.floor(Math.min(width, 1440) / 38)
        : intensity === 'vivid'
        ? Math.floor(Math.min(width, 1440) / 16)
        : Math.floor(Math.min(width, 1440) / 24);

    const initElements = () => {
      // 1. Initialize Neural Particles
      particles = [];
      packets = [];
      for (let i = 0; i < particleCount; i++) {
        const baseColor = cyanHues[Math.floor(Math.random() * cyanHues.length)];
        const r = Math.random() * 1.6 + 0.8;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (intensity === 'stealth' ? 0.35 : intensity === 'vivid' ? 0.9 : 0.6),
          vy: (Math.random() - 0.5) * (intensity === 'stealth' ? 0.35 : intensity === 'vivid' ? 0.9 : 0.6),
          radius: r,
          baseRadius: r,
          alpha: Math.random() * 0.4 + 0.3,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
          color: baseColor,
          originalColor: baseColor,
        });
      }

      // 2. Initialize Matrix Drops
      matrixDrops = [];
      const columns = Math.floor(width / 24);
      for (let i = 0; i < columns; i++) {
        matrixDrops.push({
          x: i * 24 + 12,
          y: Math.random() * -height,
          speed: Math.random() * 2.5 + 1.8,
          chars: Array.from({ length: 14 }, () =>
            matrixChars.charAt(Math.floor(Math.random() * matrixChars.length))
          ),
          headChar: matrixChars.charAt(Math.floor(Math.random() * matrixChars.length)),
          charChangeRate: 8,
          lastChange: 0,
          length: Math.floor(Math.random() * 8) + 8,
        });
      }
    };

    initElements();

    // Mouse Tracking Handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    let lastTime = performance.now();
    let gridOffset = 0;
    let scanlineY = 0;
    let packetTimer = 0;

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Handle Pause or Reduced Motion
      if (!isPlaying || prefersReducedMotion.current) {
        // Draw elegant static cyber constellation
        drawStaticState(ctx, width, height, particles);
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      // ==========================================
      // MODE 1: NEURAL CONSTELLATION & DATA PACKETS
      // ==========================================
      if (mode === 'neural') {
        renderNeuralMode(ctx, width, height, dt, time, particles, packets);
      }

      // ==========================================
      // MODE 2: CYBER DATA STREAM / MATRIX RAIN
      // ==========================================
      else if (mode === 'matrix') {
        renderMatrixMode(ctx, width, height, matrixDrops);
      }

      // ==========================================
      // MODE 3: QUANTUM PERSPECTIVE GRID
      // ==========================================
      else if (mode === 'grid') {
        gridOffset = (gridOffset + dt * 25) % 40;
        renderGridMode(ctx, width, height, gridOffset, time);
      }

      // Ambient Cyber Scanline Wave (passes down periodically)
      scanlineY = (scanlineY + dt * 140) % (height + 200);
      drawScanline(ctx, width, scanlineY);

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPlaying, mode, intensity]);

  // Helper: Draw Static State for Paused / Reduced Motion
  const drawStaticState = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    particles: Particle[]
  ) => {
    // Subtle background grid points
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    for (let x = 30; x < width; x += 60) {
      for (let y = 30; y < height; y += 60) {
        ctx.fillRect(x, y, 1.2, 1.2);
      }
    }

    // Static nodes
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}0.35)`;
      ctx.fill();
    }
  };

  // Helper: Neural Mesh Rendering Engine
  const renderNeuralMode = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dt: number,
    time: number,
    particles: Particle[],
    packets: DataPacket[]
  ) => {
    const mouse = mouseRef.current;
    const maxConnectDist = intensity === 'vivid' ? 140 : 115;
    const mouseInteractDist = 170;

    // Update & Draw Particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Physics Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap-around screen bounds
      if (p.x < 0) p.x = width;
      else if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      else if (p.y > height) p.y = 0;

      // Mouse interactive deflection / pull
      if (mouse.active) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouseInteractDist && dist > 1) {
          const force = (1 - dist / mouseInteractDist) * 0.45;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Pulse Radius
      p.pulsePhase += p.pulseSpeed;
      p.radius = p.baseRadius + Math.sin(p.pulsePhase) * 0.5;

      // Draw Node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${p.alpha})`;
      ctx.fill();

      // Core bright center for vivid aesthetic
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();

      // Check Inter-Node Proximity & Draw Dynamic Connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxConnectDist) {
          const lineAlpha = (1 - dist / maxConnectDist) * (intensity === 'vivid' ? 0.35 : 0.22);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();

          // Spontaneously create data packet traveling along the line
          if (Math.random() < 0.00035 && packets.length < 15) {
            packets.push({
              fromIdx: i,
              toIdx: j,
              progress: 0,
              speed: Math.random() * 0.015 + 0.01,
              color: Math.random() > 0.5 ? '#22d3ee' : '#a855f7',
            });
          }
        }
      }

      // Draw Mouse Laser Tethering
      if (mouse.active) {
        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < 140) {
          const tetherAlpha = (1 - mdist / 140) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${tetherAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Update and Draw Traveling Data Packets
    for (let k = packets.length - 1; k >= 0; k--) {
      const pkt = packets[k];
      const p1 = particles[pkt.fromIdx];
      const p2 = particles[pkt.toIdx];

      if (!p1 || !p2) {
        packets.splice(k, 1);
        continue;
      }

      pkt.progress += pkt.speed;
      if (pkt.progress >= 1) {
        packets.splice(k, 1);
        continue;
      }

      const curX = p1.x + (p2.x - p1.x) * pkt.progress;
      const curY = p1.y + (p2.y - p1.y) * pkt.progress;

      ctx.beginPath();
      ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = pkt.color;
      ctx.shadowColor = pkt.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  };

  // Helper: Matrix Cyber Rain Mode
  const renderMatrixMode = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    drops: MatrixDrop[]
  ) => {
    ctx.font = '11px monospace';

    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      drop.y += drop.speed;

      if (drop.y > height + 200) {
        drop.y = Math.random() * -150;
        drop.speed = Math.random() * 2.5 + 1.8;
      }

      drop.lastChange++;
      if (drop.lastChange > drop.charChangeRate) {
        drop.lastChange = 0;
        drop.headChar = '0123456789ABCDEF'[Math.floor(Math.random() * 16)];
      }

      // Draw the trailing cascade
      for (let j = 0; j < drop.length; j++) {
        const charY = drop.y - j * 16;
        if (charY > 0 && charY < height) {
          const alpha = Math.max(0.04, (1 - j / drop.length) * 0.38);
          const char = drop.chars[j % drop.chars.length];

          if (j === 0) {
            // Head character: bright neon lime-yellow core glow
            ctx.fillStyle = 'rgba(236, 252, 203, 0.95)';
            ctx.fillText(drop.headChar, drop.x, charY);
          } else {
            ctx.fillStyle = `rgba(163, 230, 53, ${alpha})`;
            ctx.fillText(char, drop.x, charY);
          }
        }
      }
    }
  };

  // Helper: Quantum Perspective Grid Mode
  const renderGridMode = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number,
    time: number
  ) => {
    const horizon = height * 0.45;
    const step = 38;

    // Horizontal receding lines
    ctx.lineWidth = 1;
    for (let y = horizon; y < height; y += (y - horizon) * 0.22 + 8) {
      const alpha = Math.min(0.28, ((y - horizon) / (height - horizon)) * 0.35);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
      ctx.stroke();
    }

    // Radiating vertical perspective lines from central focal point
    const centerX = width * 0.5;
    const rayCount = 28;
    for (let i = 0; i <= rayCount; i++) {
      const targetX = ((i - rayCount / 2) / (rayCount / 2)) * width * 1.6 + centerX;
      ctx.beginPath();
      ctx.moveTo(centerX, horizon);
      ctx.lineTo(targetX, height);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.stroke();
    }

    // Drifting cyber wave horizon glow
    const grad = ctx.createLinearGradient(0, horizon - 80, 0, horizon + 80);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.16)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, horizon - 80, width, 160);
  };

  // Helper: Sweeping Cyber Telemetry Scanline
  const drawScanline = (ctx: CanvasRenderingContext2D, width: number, y: number) => {
    if (y < 0) return;
    const grad = ctx.createLinearGradient(0, y - 40, 0, y + 10);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.7, 'rgba(34, 211, 238, 0.08)');
    grad.addColorStop(1, 'rgba(34, 211, 238, 0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 40, width, 50);

    ctx.beginPath();
    ctx.moveTo(0, y + 10);
    ctx.lineTo(width, y + 10);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  return (
    <>
      {/* Background Volumetric Nebulae - CSS Animated Blobs */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      >
        {/* Deep Lime Ambient Plasma Orb Top-Left */}
        <div
          className="absolute -top-32 -left-32 w-[550px] md:w-[750px] h-[550px] md:h-[750px] rounded-full blur-[140px] opacity-25 md:opacity-30 bg-gradient-to-tr from-lime-600 via-emerald-600 to-transparent animate-cyber-glow"
          style={{ animationDuration: '9s' }}
        />

        {/* Electric Emerald Plasma Orb Mid-Right */}
        <div
          className="absolute top-1/3 -right-40 w-[500px] md:w-[700px] h-[500px] md:h-[700px] rounded-full blur-[150px] opacity-20 md:opacity-25 bg-gradient-to-bl from-emerald-800 via-lime-700 to-transparent animate-cyber-glow"
          style={{ animationDuration: '12s', animationDelay: '3s' }}
        />

        {/* Soft Lime Horizon Pulse Bottom-Center */}
        <div
          className="absolute -bottom-40 left-1/4 w-[600px] md:w-[800px] h-[450px] rounded-full blur-[160px] opacity-20 bg-gradient-to-t from-lime-500 via-emerald-900 to-transparent animate-cyber-glow"
          style={{ animationDuration: '14s', animationDelay: '6s' }}
        />

        {/* Fine Digital Micro-Grid Pattern Layer */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Primary HTML5 Canvas Render Layer */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 select-none opacity-90"
      />

      {/* Floating Ambient Background Animation Control HUD */}
      <div className="fixed bottom-5 left-5 z-40 select-none">
        <div className="relative">
          {/* Collapsible Panel */}
          {isControlsOpen && (
            <div className="mb-2 p-3.5 rounded-lg bg-black/90 border border-cyan-500/40 backdrop-blur-xl text-xs font-mono shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col gap-3 min-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BG ANIMATIONS</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {isPlaying ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>

              {/* Mode Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-400 text-[10px] uppercase">FX Engine Mode</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['neural', 'matrix', 'grid'] as BackgroundMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        mode === m
                          ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-gray-400 text-[10px] uppercase">Density & Glow</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['stealth', 'normal', 'vivid'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setIntensity(lvl)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        intensity === lvl
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="flex-1 py-1.5 rounded bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white flex items-center justify-center gap-1 text-[11px] font-semibold transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 text-cyan-400" />
                      <span>PAUSE FX</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current text-cyan-400" />
                      <span>RESUME FX</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Persistent Pill Button */}
          <button
            id="btn-bg-fx-toggle"
            onClick={() => setIsControlsOpen((o) => !o)}
            aria-label="Toggle background animation controls"
            title="Background Cyber Animations Controls"
            className="group px-3 py-1.5 rounded-full bg-black/85 hover:bg-black border border-lime-500/40 hover:border-lime-400 text-lime-300 font-mono text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.2)] hover:shadow-[0_0_25px_rgba(163,230,53,0.4)] backdrop-blur-md transition-all duration-300 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isPlaying ? 'bg-lime-400' : 'bg-gray-500'
                }`}
              />
            </span>
            <span className="hidden sm:inline font-bold">FX:</span>
            <span className="text-gray-300 group-hover:text-lime-200 uppercase">{mode}</span>
            <Sliders className="w-3 h-3 text-lime-400 group-hover:rotate-45 transition-transform" />
          </button>
        </div>
      </div>
    </>
  );
}
