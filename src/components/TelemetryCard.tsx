import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Play, Pause, Maximize2, Radio, Activity, Eye, AlertCircle, RotateCcw } from 'lucide-react';
import { TelemetryChannel } from '../types/telemetry';
import { useReducedMotion, useIsTouchDevice } from '../hooks/useVideoTelemetry';

interface TelemetryCardProps {
  channel: TelemetryChannel;
  onOpenTheater: (channel: TelemetryChannel) => void;
  isRotatedActive?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

export function TelemetryCard({
  channel,
  onOpenTheater,
  isRotatedActive = false,
  onHoverChange,
}: TelemetryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const prefersReducedMotion = useReducedMotion();
  const isTouchDevice = useIsTouchDevice();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [detectedResolution, setDetectedResolution] = useState(channel.nominalResolution);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 3D Parallax Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for cursor tracking
  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 25 });

  // Map mouse offsets (-0.5 to 0.5) to subtle 3D tilt angles (-7 to 7 deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  // Handle cursor movement for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false);
    x.set(0);
    y.set(0);
  };

  // IntersectionObserver for performance: only play when in view
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '100px 0px' }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, []);

  // Control video based on in-view state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView && isPlaying) {
      video.play().catch(() => {
        // Autoplay may be restricted by browser until interaction
      });
    } else {
      video.pause();
    }
  }, [isInView, isPlaying]);

  // Video events
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.videoWidth && video.videoHeight) {
      setDetectedResolution(`${video.videoWidth}x${video.videoHeight}`);
    }
    setHasError(false);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgressPercent(pct);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Handle reload if error
  const handleReload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{ perspective: prefersReducedMotion ? 'none' : 1100 }}
      className="h-full w-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic CSS Backlight Glow Aura that intensifies when hovered or active */}
      <div
        aria-hidden="true"
        className={`absolute -inset-1.5 sm:-inset-2 rounded-lg pointer-events-none transition-all duration-500 ease-out ${
          isRotatedActive
            ? 'opacity-100 blur-2xl scale-[1.03]'
            : isHovered
            ? 'opacity-95 blur-2xl scale-[1.02]'
            : 'opacity-0 blur-md scale-95'
        }`}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${channel.accentHex}88 0%, ${channel.accentHex}22 55%, transparent 75%)`,
          filter: `drop-shadow(0 0 30px ${channel.accentHex}99) drop-shadow(0 0 60px ${channel.accentHex}55)`,
        }}
      />

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        onClick={() => onOpenTheater(channel)}
        style={{
          rotateX: prefersReducedMotion || isTouchDevice ? 0 : rotateX,
          rotateY: prefersReducedMotion || isTouchDevice ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        id={`telemetry-card-${channel.id}`}
        tabIndex={0}
        role="button"
        aria-label={`Open Telemetry Theater for ${channel.name} ${channel.feedTitle}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenTheater(channel);
          }
        }}
        className={`group relative h-full min-h-[420px] md:min-h-[460px] bg-gradient-to-br ${channel.bgGradient} to-black rounded-sm overflow-hidden flex flex-col justify-between p-5 sm:p-7 transition-all duration-300 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          isRotatedActive
            ? 'border-2 border-cyan-400 shadow-[0_0_45px_rgba(6,182,212,0.45)]'
            : isHovered
            ? 'border border-cyan-300/90 shadow-[0_0_50px_rgba(6,182,212,0.35)]'
            : 'border border-white/10 hover:border-cyan-400/70 hover:shadow-[0_0_40px_rgba(6,182,212,0.22)]'
        }`}
      >
        {/* Cyber HUD Corner Reticles ┌ ┐ └ ┘ */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/70 pointer-events-none group-hover:border-cyan-300 transition-colors" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/70 pointer-events-none group-hover:border-cyan-300 transition-colors" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/70 pointer-events-none group-hover:border-cyan-300 transition-colors" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/70 pointer-events-none group-hover:border-cyan-300 transition-colors" />

        {/* Video Background with Hardware Acceleration */}
        {hasError ? (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-0">
            <AlertCircle className="w-8 h-8 text-red-400 animate-pulse" />
            <span className="text-xs font-mono text-red-400 uppercase tracking-wider">
              TELEMETRY STREAM OFFLINE
            </span>
            <button
              onClick={handleReload}
              className="px-3 py-1.5 rounded bg-white/10 border border-white/20 text-xs font-mono text-cyan-300 hover:bg-white/20 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RECONNECT</span>
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={isInView ? channel.videoSrc : undefined}
            poster={channel.posterSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onError={() => setHasError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700 pointer-events-none"
            style={{ willChange: 'transform, opacity' }}
          />
        )}

        {/* Contrast Protection Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Subtle Cyber Scanlines */}
        <div
          className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.8)_50%)] bg-[size:100%_4px] pointer-events-none"
          style={{ transform: 'translateZ(0px)' }}
        />

        {/* TOP HUD BAR */}
        <div
          style={{ transform: prefersReducedMotion || isTouchDevice ? 'none' : 'translateZ(30px)' }}
          className="relative z-10 flex items-center justify-between w-full"
        >
          {/* Status Badge & Channel ID */}
          <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded border border-white/15 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-gray-200 font-semibold tracking-wider">{channel.name}</span>
            <span className="text-cyan-400/90 border-l border-white/20 pl-2 text-[10px] font-mono uppercase">
              {channel.badge}
            </span>
            {isRotatedActive && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-400/20 border border-cyan-400/60 text-[10px] font-mono text-cyan-300 font-bold animate-pulse">
                <Radio className="w-2.5 h-2.5 text-cyan-400" />
                <span>PLAY ALL ACTIVE</span>
              </span>
            )}
          </div>

          {/* Quick HUD Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Play/Pause Button */}
            <button
              id={`btn-play-${channel.id}`}
              onClick={togglePlay}
              aria-label={isPlaying ? `Pause ${channel.name} stream` : `Play ${channel.name} stream`}
              title={isPlaying ? 'Pause telemetry stream' : 'Play telemetry stream'}
              className="p-2 rounded bg-black/75 backdrop-blur-md border border-white/15 text-gray-300 hover:text-cyan-400 hover:border-cyan-400/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
            </button>

            {/* Expand / Theater Button */}
            <button
              id={`btn-theater-${channel.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenTheater(channel);
              }}
              aria-label={`Open ${channel.name} in HD Theater`}
              title="Open full-screen HD Telemetry Theater"
              className="p-2 rounded bg-black/75 backdrop-blur-md border border-white/15 text-gray-300 hover:text-cyan-400 hover:border-cyan-400/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Floating Indicator */}
        <div
          style={{ transform: prefersReducedMotion || isTouchDevice ? 'none' : 'translateZ(25px)' }}
          className="relative z-10 flex items-center gap-2 my-auto"
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono text-cyan-300">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>SIGNAL: 100%</span>
            <span className="text-white/30">•</span>
            <span>{detectedResolution}</span>
            <span className="text-white/30">•</span>
            <span>{channel.nominalFps} FPS</span>
          </div>
        </div>

        {/* BOTTOM METADATA & SPECS */}
        <motion.div
          style={{ transform: prefersReducedMotion || isTouchDevice ? 'none' : 'translateZ(40px)' }}
          className="relative z-10 pt-4"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest font-semibold">
              {channel.category}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-gray-400 font-mono text-xs tracking-wider truncate">
              {channel.feedTitle}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide drop-shadow-md mb-2 group-hover:text-cyan-200 transition-colors">
            {channel.name}
          </h3>

          <p className="text-xs sm:text-sm text-gray-300/90 line-clamp-2 mb-3.5 leading-relaxed font-sans">
            {channel.description}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 mb-3 bg-black/30 px-2 rounded">
            {channel.telemetryMetrics.map((m) => (
              <div key={m.label} className="text-left font-mono">
                <div className="text-[9px] text-gray-400 truncate uppercase">{m.label}</div>
                <div className="text-xs font-bold text-cyan-300 truncate">
                  {m.value} <span className="text-[9px] font-normal text-gray-400">{m.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Substrate tags & Inspect CTA */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {channel.techSpecs.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform font-medium">
              <Eye className="w-3.5 h-3.5" />
              <span>THEATER</span>
            </div>
          </div>

          {/* Live Progress Bar Indicator at bottom */}
          <div className="absolute -bottom-5 sm:-bottom-7 left-0 right-0 h-1 bg-white/10 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-cyan-400 transition-all duration-200 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
