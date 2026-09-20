import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  SlidersHorizontal,
  Activity,
  Play,
  Pause,
  Repeat,
  SkipForward,
  Maximize2,
  Tv,
  X,
  Sparkles,
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { TelemetryCard } from './TelemetryCard';
import { TelemetryTheaterModal } from './TelemetryTheaterModal';
import { TELEMETRY_CHANNELS } from '../data/telemetryChannels';
import { TelemetryChannel, TelemetryCategory } from '../types/telemetry';

interface FilterOption {
  key: TelemetryCategory;
  label: string;
  count: number;
}

const ROTATION_INTERVAL = 30; // 30 seconds per feed for ambient rotation

export function Showcase() {
  const [activeFilter, setActiveFilter] = useState<TelemetryCategory>('all');
  const [activeModalChannel, setActiveModalChannel] = useState<TelemetryChannel | null>(null);

  // Play All 30-second Ambient Rotation Mode State
  const [isPlayAllActive, setIsPlayAllActive] = useState(false);
  const [isPlayAllPaused, setIsPlayAllPaused] = useState(false);
  const [activeFeedIndex, setActiveFeedIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(ROTATION_INTERVAL);

  // Dynamic CSS Glow State for the Telemetry Cards Container
  const [hoveredChannel, setHoveredChannel] = useState<TelemetryChannel | null>(null);
  const [containerMouse, setContainerMouse] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { key: 'all', label: 'ALL FEEDS', count: TELEMETRY_CHANNELS.length },
      { key: 'fish', label: 'FISH & AQUA', count: 1 },
      { key: 'birds', label: 'BIRDS & AVIAN', count: 1 },
      { key: 'marine', label: 'DEEP OCEAN', count: 1 },
      { key: 'flower', label: 'CYBER FLORA', count: 1 },
    ],
    []
  );

  const filteredChannels = useMemo(() => {
    if (activeFilter === 'all') return TELEMETRY_CHANNELS;
    return TELEMETRY_CHANNELS.filter((c) => c.filterKey === activeFilter);
  }, [activeFilter]);

  const activeRotatingChannel = TELEMETRY_CHANNELS[activeFeedIndex];
  const nextRotatingIndex = (activeFeedIndex + 1) % TELEMETRY_CHANNELS.length;
  const nextRotatingChannel = TELEMETRY_CHANNELS[nextRotatingIndex];

  // 30-second Auto-Rotation Engine
  useEffect(() => {
    if (!isPlayAllActive || isPlayAllPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance to next feed in rotation
          setActiveFeedIndex((curr) => {
            const nextIdx = (curr + 1) % TELEMETRY_CHANNELS.length;
            const nextChan = TELEMETRY_CHANNELS[nextIdx];
            // If theater modal is open, seamlessly advance it as well
            setActiveModalChannel((modal) => (modal ? nextChan : null));
            return nextIdx;
          });
          return ROTATION_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlayAllActive, isPlayAllPaused]);

  // Toggle Play All Mode
  const handleTogglePlayAll = useCallback(() => {
    setIsPlayAllActive((prev) => {
      const next = !prev;
      if (next) {
        setActiveFilter('all');
        setSecondsRemaining(ROTATION_INTERVAL);
        setIsPlayAllPaused(false);
      }
      return next;
    });
  }, []);

  // Skip to next feed immediately in rotation
  const handleSkipNext = useCallback(() => {
    setActiveFeedIndex((curr) => {
      const nextIdx = (curr + 1) % TELEMETRY_CHANNELS.length;
      const nextChan = TELEMETRY_CHANNELS[nextIdx];
      setActiveModalChannel((modal) => (modal ? nextChan : null));
      return nextIdx;
    });
    setSecondsRemaining(ROTATION_INTERVAL);
  }, []);

  // Handle relative mouse move over the telemetry card container for dynamic CSS glow positioning
  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardsContainerRef.current) return;
    const rect = cardsContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setContainerMouse({ x: Math.round(xPct), y: Math.round(yPct) });
  };

  const handleContainerMouseLeave = () => {
    setHoveredChannel(null);
    setContainerMouse({ x: 50, y: 50 });
  };

  return (
    <section
      id="showcase-section"
      aria-label="Featured Telemetry Showcase"
      className="py-24 md:py-32 bg-[#050608]/85 backdrop-blur-[2px] relative overflow-hidden"
    >
      {/* Background Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#081726_1px,transparent_1px),linear-gradient(to_bottom,#081726_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-cyan-950/25 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[300px] bg-purple-950/20 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">
        {/* Section Header */}
        <ScrollReveal direction="up" distance={20} className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 font-mono text-xs uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>LIVE OPERATIONAL SURVEILLANCE &amp; TELEMETRY</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight uppercase mb-4 drop-shadow-sm">
            Featured Telemetry
          </h2>

          <p className="text-gray-300/90 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-sans">
            Real-time biometric and cyber-physical surveillance feeds from our decentralized hardware nodes, monitoring aquatic bio-sensors, avian swarm vectors, deep-sea benthic arrays, and synthetic morphogenesis.
          </p>
        </ScrollReveal>

        {/* Channel Filter Navigation Tabs & Play All Ambient Control */}
        <ScrollReveal direction="up" distance={15} delay={0.1} className="mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div
              role="tablist"
              aria-label="Telemetry channel categories"
              className="inline-flex max-w-full overflow-x-auto p-1.5 rounded-md bg-black/70 backdrop-blur-xl border border-white/15 gap-1.5 sm:gap-2 no-scrollbar"
            >
              {filterOptions.map((opt) => {
                const isActive = activeFilter === opt.key;
                return (
                  <button
                    key={opt.key}
                    role="tab"
                    id={`tab-${opt.key}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${opt.key}`}
                    onClick={() => {
                      setActiveFilter(opt.key);
                    }}
                    className={`relative min-h-[44px] px-3.5 sm:px-5 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isActive
                        ? 'text-cyan-200 font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {/* Animated Neon HUD Active Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeFilterPill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 bg-gradient-to-r from-cyan-950/80 via-cyan-900/60 to-cyan-950/80 border border-cyan-400 rounded shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1.5">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      )}
                      <span>{opt.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isActive
                            ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {opt.count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Play All Mode Quick Toggle Action */}
            <div className="flex items-center gap-2.5">
              <button
                id="btn-play-all-toggle"
                onClick={handleTogglePlayAll}
                aria-label={
                  isPlayAllActive
                    ? 'Stop Play All ambient rotation'
                    : 'Start Play All ambient mode (rotates feeds every 30 seconds)'
                }
                title="Play All: Automatically rotates through all feeds every 30 seconds for an ambient experience"
                className={`min-h-[44px] px-4 py-2 rounded-md font-mono text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isPlayAllActive
                    ? 'bg-cyan-950/90 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.45)]'
                    : 'bg-black/70 hover:bg-cyan-950/40 border border-white/15 hover:border-cyan-400/60 text-gray-300 hover:text-cyan-300 backdrop-blur-xl'
                }`}
              >
                {isPlayAllActive ? (
                  <>
                    <Repeat
                      className="w-4 h-4 text-cyan-400 animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                    <span className="font-bold">AMBIENT ROTATION</span>
                    <span className="bg-cyan-400 text-black px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-normal shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                      {secondsRemaining}s
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />
                    <span>PLAY ALL</span>
                    <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded text-[10px] border border-cyan-500/30">
                      30S CYCLE
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Ambient Play All Active HUD Control Strip */}
        <AnimatePresence>
          {isPlayAllActive && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden mb-6"
            >
              <div className="p-3 sm:p-4 rounded-lg bg-black/80 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                  {/* Left: Active Stream Details */}
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                    </span>
                    <div>
                      <span className="text-gray-400">CURRENT FEED [{activeFeedIndex + 1}/4]:</span>{' '}
                      <span className="text-cyan-300 font-bold uppercase">
                        {activeRotatingChannel.name} ({activeRotatingChannel.feedTitle})
                      </span>
                    </div>
                  </div>

                  {/* Right: Next Feed Countdown & Actions */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="text-gray-400">
                      NEXT:{' '}
                      <span className="text-gray-200">
                        {nextRotatingChannel.name} in {secondsRemaining}s
                      </span>
                    </span>

                    {/* Pause/Resume Timer */}
                    <button
                      onClick={() => setIsPlayAllPaused((p) => !p)}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
                      title={isPlayAllPaused ? 'Resume auto-rotation' : 'Pause auto-rotation timer'}
                    >
                      {isPlayAllPaused ? (
                        <>
                          <Play className="w-3 h-3 fill-current text-cyan-400" />
                          <span>RESUME</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3 text-cyan-400" />
                          <span>PAUSE</span>
                        </>
                      )}
                    </button>

                    {/* Skip to Next Feed */}
                    <button
                      onClick={handleSkipNext}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
                      title="Skip to next feed immediately"
                    >
                      <SkipForward className="w-3 h-3 text-cyan-400" />
                      <span>SKIP</span>
                    </button>

                    {/* Open Ambient Theater */}
                    <button
                      onClick={() => setActiveModalChannel(activeRotatingChannel)}
                      className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 flex items-center gap-1 transition-colors font-semibold"
                      title="View active rotating feed in full-screen HD Theater"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>THEATER</span>
                    </button>

                    {/* Exit Play All */}
                    <button
                      onClick={handleTogglePlayAll}
                      className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
                      title="Exit Play All mode"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 30-Second Dynamic Cyber Progress Bar */}
                <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${((ROTATION_INTERVAL - secondsRemaining) / ROTATION_INTERVAL) * 100}%`,
                    }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-300 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(6,182,212,0.9)]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Telemetry Card Container with Dynamic CSS-based Glow Effect */}
        <div
          id="telemetry-cards-container"
          ref={cardsContainerRef}
          onMouseMove={handleContainerMouseMove}
          onMouseLeave={handleContainerMouseLeave}
          className="relative p-2 sm:p-4 rounded-xl transition-all duration-500"
        >
          {/* Dynamic CSS Atmospheric Glow Backdrop that intensifies when user hovers over a specific card */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-700 ease-out ${
              hoveredChannel
                ? 'opacity-90 blur-[100px] scale-105'
                : isPlayAllActive
                ? 'opacity-60 blur-[85px] scale-100'
                : 'opacity-25 blur-[65px] scale-95'
            }`}
            style={{
              background: hoveredChannel
                ? `radial-gradient(900px circle at ${containerMouse.x}% ${containerMouse.y}%, ${hoveredChannel.accentHex}45 0%, ${hoveredChannel.accentHex}18 35%, transparent 70%)`
                : isPlayAllActive
                ? `radial-gradient(800px circle at 50% 50%, ${activeRotatingChannel.accentHex}35 0%, transparent 65%)`
                : `radial-gradient(750px circle at 50% 50%, rgba(6,182,212,0.2) 0%, transparent 70%)`,
            }}
          />

          {/* Secondary Cyber Edge Container Glow */}
          <div
            aria-hidden="true"
            className={`absolute -inset-1 rounded-2xl pointer-events-none transition-all duration-500 border ${
              hoveredChannel
                ? 'opacity-90 border-cyan-400/40 shadow-[0_0_50px_rgba(6,182,212,0.2)]'
                : isPlayAllActive
                ? 'opacity-60 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                : 'opacity-0 border-transparent'
            }`}
          />

          {/* Telemetry Cards Grid with Smooth Filtering and Live Autoplay */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8 md:gap-10 relative z-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredChannels.map((channel) => {
                const isCurrentlyActiveStream =
                  isPlayAllActive && activeRotatingChannel.id === channel.id;

                return (
                  <motion.div
                    key={channel.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="h-full"
                  >
                    <TelemetryCard
                      channel={channel}
                      isRotatedActive={isCurrentlyActiveStream}
                      onHoverChange={(isHovered) => {
                        setHoveredChannel(isHovered ? channel : null);
                      }}
                      onOpenTheater={(selected) => {
                        setActiveModalChannel(selected);
                        if (isPlayAllActive) {
                          const idx = TELEMETRY_CHANNELS.findIndex((c) => c.id === selected.id);
                          if (idx !== -1) {
                            setActiveFeedIndex(idx);
                            setSecondsRemaining(ROTATION_INTERVAL);
                          }
                        }
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Global Stream Status Footer Pill */}
        <div className="mt-12 md:mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded bg-black/60 border border-white/10 text-xs font-mono backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-gray-300">
              CLUSTER TELEMETRY ARCHIVE: <span className="text-cyan-400">4 / 4 CHANNELS SYNCHRONIZED</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-400 text-[11px]">
            <span>NODE LATENCY: &lt;14ms</span>
            <span className="text-white/20">•</span>
            <span>BANDWIDTH: 14.8 MB/S</span>
            <span className="text-white/20">•</span>
            <span className="text-cyan-400">HARDWARE ACCELERATION: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* HD Telemetry Theater Modal */}
      <AnimatePresence>
        {activeModalChannel && (
          <TelemetryTheaterModal
            channel={activeModalChannel}
            allChannels={TELEMETRY_CHANNELS}
            isPlayAllActive={isPlayAllActive}
            onTogglePlayAll={handleTogglePlayAll}
            rotationSecondsRemaining={secondsRemaining}
            onClose={() => setActiveModalChannel(null)}
            onSelectChannel={(next) => {
              setActiveModalChannel(next);
              if (isPlayAllActive) {
                const idx = TELEMETRY_CHANNELS.findIndex((c) => c.id === next.id);
                if (idx !== -1) {
                  setActiveFeedIndex(idx);
                  setSecondsRemaining(ROTATION_INTERVAL);
                }
              }
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
