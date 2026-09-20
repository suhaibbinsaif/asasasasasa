import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  Radio,
  Wifi,
  Sliders,
  RotateCcw,
  Repeat,
} from 'lucide-react';
import { TelemetryChannel } from '../types/telemetry';

interface TelemetryTheaterModalProps {
  channel: TelemetryChannel;
  allChannels: TelemetryChannel[];
  onClose: () => void;
  onSelectChannel: (channel: TelemetryChannel) => void;
  isPlayAllActive?: boolean;
  onTogglePlayAll?: () => void;
  rotationSecondsRemaining?: number;
}

export function TelemetryTheaterModal({
  channel,
  allChannels,
  onClose,
  onSelectChannel,
  isPlayAllActive = false,
  onTogglePlayAll,
  rotationSecondsRemaining = 30,
}: TelemetryTheaterModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [realResolution, setRealResolution] = useState(channel.nominalResolution);
  const [realFps, setRealFps] = useState(channel.nominalFps);
  const [hasError, setHasError] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);

  // Lock body scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Format time utility (mm:ss)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find index for prev/next
  const currentIndex = allChannels.findIndex((c) => c.id === channel.id);
  const prevChannel = allChannels[(currentIndex - 1 + allChannels.length) % allChannels.length];
  const nextChannel = allChannels[(currentIndex + 1) % allChannels.length];

  // Channel switch
  const handlePrev = useCallback(() => {
    setHasError(false);
    onSelectChannel(prevChannel);
  }, [prevChannel, onSelectChannel]);

  const handleNext = useCallback(() => {
    setHasError(false);
    onSelectChannel(nextChannel);
  }, [nextChannel, onSelectChannel]);

  // Video playback management
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Fullscreen management
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, togglePlay, handlePrev, handleNext]);

  // Video metadata & time update
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    setDuration(v.duration || 0);
    if (v.videoWidth && v.videoHeight) {
      setRealResolution(`${v.videoWidth}x${v.videoHeight}`);
    }
    setHasError(false);
    v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isScrubbing) return;
    const v = videoRef.current;
    setCurrentTime(v.currentTime);

    // Update real buffer progress
    if (v.buffered && v.buffered.length > 0 && v.duration > 0) {
      const bufferedEnd = v.buffered.end(v.buffered.length - 1);
      const percent = Math.min(100, Math.round((bufferedEnd / v.duration) * 100));
      setBufferedPercent(percent);
    }
  };

  // Scrubber scrubbing
  const handleScrubMove = (clientX: number) => {
    if (!scrubberRef.current || !videoRef.current || !duration) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleScrubberMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleScrubMove(e.clientX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleScrubMove(moveEvent.clientX);
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || !duration) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pos * duration);
    setHoverX(e.clientX - rect.left);
  };

  const handleScrubberMouseLeave = () => {
    setHoverTime(null);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${channel.name} HD Telemetry Theater`}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8"
    >
      {/* Blurred Cyber Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
      />

      {/* Main Theater Modal Container */}
      <motion.div
        ref={containerRef}
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative z-10 w-full max-w-6xl max-h-[95vh] bg-[#07080a] border border-cyan-500/30 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
      >
        {/* Corner Reticles for Cyber Look */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
              <span className="text-white font-mono font-bold text-xs sm:text-sm tracking-wider uppercase truncate">
                {channel.name}
              </span>
            </div>

            <span className="hidden sm:inline-block text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
              {channel.badge}
            </span>

            <span className="text-gray-400 font-mono text-xs hidden md:inline truncate">
              {channel.feedTitle} // {channel.category}
            </span>
          </div>

          {/* Quick Channel Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded border border-white/10">
              {allChannels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectChannel(c)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded uppercase tracking-wider transition-colors ${
                    c.id === channel.id
                      ? 'bg-cyan-500 text-black font-semibold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {c.filterKey}
                </button>
              ))}
            </div>

            {/* Auto-Rotate Play All Ambient Mode Toggle */}
            {onTogglePlayAll && (
              <button
                id="modal-toggle-play-all"
                onClick={onTogglePlayAll}
                aria-label={isPlayAllActive ? 'Stop Auto-Rotate Play All' : 'Start Auto-Rotate Play All (30s cycle)'}
                title="Automatically cycle through all feeds every 30 seconds"
                className={`px-2.5 py-1 text-[11px] font-mono rounded flex items-center gap-1.5 transition-all ${
                  isPlayAllActive
                    ? 'bg-cyan-950/90 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Repeat
                  className={`w-3.5 h-3.5 ${isPlayAllActive ? 'text-cyan-400 animate-spin' : 'text-gray-400'}`}
                  style={{ animationDuration: '6s' }}
                />
                <span className="hidden sm:inline font-semibold">AUTO-ROTATE</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isPlayAllActive ? 'bg-cyan-400 text-black' : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {isPlayAllActive ? `${rotationSecondsRemaining}s` : '30s'}
                </span>
              </button>
            )}

            <button
              id="btn-close-theater"
              onClick={onClose}
              aria-label="Close HD Telemetry Theater"
              className="p-1.5 sm:p-2 rounded text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          {hasError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Activity className="w-10 h-10 text-red-400 animate-pulse" />
              <div className="font-mono text-sm text-red-400 uppercase tracking-wider">
                STREAM DISCONNECTED // SIGNAL TIMEOUT
              </div>
              <p className="text-xs text-gray-400 max-w-sm">
                Unable to establish optical telemetry feed with remote sensor node. Verify subsea / aerial link state.
              </p>
              <button
                onClick={() => {
                  setHasError(false);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-mono text-xs hover:bg-cyan-500/30 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RECONNECT STREAM</span>
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={channel.videoSrc}
              poster={channel.posterSrc}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onError={() => setHasError(true)}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            />
          )}

          {/* Futuristic HUD Diagnostics Overlay */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 pointer-events-none font-mono text-[10px] sm:text-[11px] text-cyan-300 bg-black/75 px-3 py-2 rounded border border-cyan-500/30 backdrop-blur-md flex flex-col gap-0.5 shadow-lg">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">STREAM: ONLINE</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Wifi className="w-3 h-3 text-cyan-400" />
              <span>SIGNAL: STABLE</span>
              <span className="text-white/30">•</span>
              <span>LATENCY: LOW (&lt;12ms)</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 pt-0.5 border-t border-white/10 mt-1">
              <span>FPS: {realFps}</span>
              <span>RES: {realResolution}</span>
              <span>BUFFER: {bufferedPercent}%</span>
            </div>
            {isPlayAllActive && (
              <div className="flex items-center gap-2 text-cyan-300 pt-1 border-t border-cyan-500/20 text-[10px]">
                <Repeat className="w-2.5 h-2.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="font-bold">AUTO-CYCLE: {rotationSecondsRemaining}s TO NEXT</span>
              </div>
            )}
          </div>

          {/* Previous / Next Floating Hover Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label={`Previous Channel: ${prevChannel.name}`}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-cyan-500/30 border border-white/20 hover:border-cyan-400 text-gray-300 hover:text-cyan-200 transition-all opacity-80 hover:opacity-100 backdrop-blur-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label={`Next Channel: ${nextChannel.name}`}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-cyan-500/30 border border-white/20 hover:border-cyan-400 text-gray-300 hover:text-cyan-200 transition-all opacity-80 hover:opacity-100 backdrop-blur-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Interactive HUD Control Deck */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-3 px-3 sm:px-5 flex flex-col gap-2">
            {/* Scrubber Timeline Bar */}
            <div
              ref={scrubberRef}
              onMouseDown={handleScrubberMouseDown}
              onMouseMove={handleScrubberMouseMove}
              onMouseLeave={handleScrubberMouseLeave}
              className="relative h-2 w-full bg-white/20 hover:h-3 rounded-full cursor-pointer transition-all overflow-visible group/scrubber"
            >
              {/* Buffer Bar */}
              <div
                style={{ width: `${bufferedPercent}%` }}
                className="absolute inset-y-0 left-0 bg-white/30 rounded-full transition-all duration-300"
              />

              {/* Played Progress Bar */}
              <div
                style={{ width: `${progressPercent}%` }}
                className="absolute inset-y-0 left-0 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] relative"
              >
                {/* Scrubber Handle */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/scrubber:scale-100 transition-transform" />
              </div>

              {/* Hover Timestamp Tooltip */}
              {hoverTime !== null && (
                <div
                  style={{ left: `${hoverX}px` }}
                  className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 pointer-events-none shadow-md"
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Media Controls Bar */}
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Play/Pause */}
                <button
                  id="modal-play-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause stream' : 'Play stream'}
                  className="p-1.5 sm:p-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                </button>

                {/* Volume & Mute */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute stream' : 'Mute stream'}
                    className="p-1.5 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume level"
                    className="w-16 sm:w-20 h-1 bg-white/20 accent-cyan-400 rounded cursor-pointer hidden sm:block"
                  />
                </div>

                {/* Time Indicator */}
                <div className="text-gray-300 text-[11px] font-mono">
                  <span className="text-cyan-300">{formatTime(currentTime)}</span>
                  <span className="text-white/40 mx-1">/</span>
                  <span className="text-gray-400">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Side Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Prev & Next Quick Buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    title="Previous Channel (Left Arrow)"
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-[11px]"
                  >
                    PREV
                  </button>
                  <button
                    onClick={handleNext}
                    title="Next Channel (Right Arrow)"
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-[11px]"
                  >
                    NEXT
                  </button>
                </div>

                {/* Fullscreen Toggle */}
                <button
                  id="modal-fullscreen-btn"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  className="p-1.5 sm:p-2 rounded text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Detailed Telemetry & Specs */}
        <div className="p-4 sm:p-6 bg-[#08090c] border-t border-white/10 overflow-y-auto max-h-[30vh]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
                  {channel.name} — {channel.feedTitle}
                </h3>
                <span className="text-xs font-mono text-cyan-400">
                  [{channel.category}]
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed font-sans">
                {channel.description}
              </p>
              <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
                <span className="text-cyan-400 font-medium">SUBJECT:</span>
                <span>{channel.subject}</span>
              </div>
            </div>

            {/* Live Metrics Cards */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {channel.telemetryMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="px-3 py-2 rounded bg-black/60 border border-white/10 font-mono text-left"
                >
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {metric.label}
                  </div>
                  <div className="text-sm font-bold text-cyan-300">
                    {metric.value}{' '}
                    <span className="text-[10px] font-normal text-gray-400">
                      {metric.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Specs Tags */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mr-1">
              Active Substrates:
            </span>
            {channel.techSpecs.map((spec) => (
              <span
                key={spec}
                className="px-2.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
