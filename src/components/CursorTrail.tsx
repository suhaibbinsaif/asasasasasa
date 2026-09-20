import { useEffect, useRef } from 'react';

interface LightParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface LightShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1. Don't run cursor canvas on pure touch devices or reduced motion preference
    if (typeof window === 'undefined') return;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isCoarse || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let points: { x: number; y: number; age: number }[] = [];
    let fireParticles: LightParticle[] = [];
    let shockwaves: LightShockwave[] = [];
    let hueOffset = 0;
    let animationFrameId: number | null = null;
    let isRunning = false;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const startLoopIfNeeded = () => {
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      points.push({ x: e.clientX, y: e.clientY, age: 0 });
      // Keep queue bounded
      if (points.length > 30) {
        points.shift();
      }
      startLoopIfNeeded();
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Lightweight blue fire click effect (zero lag)
    const onMouseDown = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 4,
        maxRadius: 36,
        opacity: 0.85,
      });

      // 6 fast, lightweight blue spark/flame particles
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 3.5 + 1.5;
        fireParticles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: Math.random() * 2.8 + 1.8,
          life: 0,
          maxLife: Math.floor(Math.random() * 10 + 10),
          hue: 190 + Math.random() * 35, // Cyan to electric blue
        });
      }

      startLoopIfNeeded();
    };
    window.addEventListener('mousedown', onMouseDown, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Advance rainbow hue
      hueOffset = (hueOffset + 1.8) % 360;

      // Filter aged points
      points = points.filter((p) => p.age < 22);
      const total = points.length;

      // 1. Rainbow mouse line
      for (let i = 0; i < total; i++) {
        const p = points[i];
        const opacity = Math.max(0, 1 - p.age / 22);
        const radius = Math.max(1, 4 * opacity);
        const pointHue = (hueOffset + (i / Math.max(1, total)) * 360) % 360;

        if (i > 0) {
          const prev = points[i - 1];
          const prevOpacity = Math.max(0, 1 - prev.age / 22);
          const prevHue = (hueOffset + ((i - 1) / Math.max(1, total)) * 360) % 360;

          const gradient = ctx.createLinearGradient(prev.x, prev.y, p.x, p.y);
          gradient.addColorStop(0, `hsla(${prevHue}, 100%, 65%, ${prevOpacity * 0.7})`);
          gradient.addColorStop(1, `hsla(${pointHue}, 100%, 65%, ${opacity * 0.7})`);

          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.max(1.5, radius);
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${pointHue}, 100%, 70%, ${opacity * 0.85})`;
        ctx.fill();
      }

      // Cursor tip highlight
      if (points.length > 0) {
        const last = points[points.length - 1];
        const tipHue = (hueOffset + 360) % 360;

        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${tipHue}, 100%, 75%, 0.95)`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(last.x, last.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      for (let i = 0; i < points.length; i++) {
        points[i].age += 1;
      }

      // 2. Blue Fire Click Effect
      if (shockwaves.length > 0 || fireParticles.length > 0) {
        // Shockwave rings
        for (let i = shockwaves.length - 1; i >= 0; i--) {
          const sw = shockwaves[i];
          sw.radius += 3.2;
          sw.opacity *= 0.84;

          if (sw.opacity <= 0.04 || sw.radius >= sw.maxRadius) {
            shockwaves.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(195, 100%, 65%, ${sw.opacity})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // Blue Sparks / Flames
        for (let i = fireParticles.length - 1; i >= 0; i--) {
          const p = fireParticles[i];
          p.life++;

          if (p.life >= p.maxLife) {
            fireParticles.splice(i, 1);
            continue;
          }

          p.x += p.vx;
          p.y += p.vy;
          p.vy -= 0.1;
          p.vx *= 0.96;

          const progress = p.life / p.maxLife;
          const alpha = 1 - progress;
          const currentSize = Math.max(0.5, p.size * alpha);

          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${alpha})`;
          ctx.fill();
        }
      }

      // Idle sleep: if no points or particles remain, stop the RAF loop until user action
      if (points.length === 0 && shockwaves.length === 0 && fireParticles.length === 0) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        isRunning = false;
        animationFrameId = null;
        return;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[100]"
    />
  );
}

