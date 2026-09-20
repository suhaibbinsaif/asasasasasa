import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, CornerDownLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAudio } from '../context/AudioContext';

interface CommandItem {
  id: string;
  name: string;
  desc: string;
  category: 'portal' | 'section' | 'action';
  action: () => void;
}

export function CommandConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { openModal } = useAuth();
  const { cycleTheme, theme } = useTheme();
  const { addToast } = useToast();
  const { isPlaying: isRainAudioPlaying, toggleAudio: toggleRainAudio } = useAudio();

  const commands: CommandItem[] = [
    {
      id: 'telegram',
      name: 'telegram',
      desc: 'Connect to Telegram Network portal (cloudshot.ai.studio)',
      category: 'portal',
      action: () => window.open('https://cloudshot.ai.studio/', '_blank', 'noopener,noreferrer'),
    },
    {
      id: 'cloud',
      name: 'cloud',
      desc: 'Launch ShadowTech Cloud MTProto storage drive (shadowtech.ai.studio)',
      category: 'portal',
      action: () => window.open('https://shadowtech.ai.studio/', '_blank', 'noopener,noreferrer'),
    },
    {
      id: 'gmailhub',
      name: 'gmailhub',
      desc: 'Open GmailHub encrypted comms workspace (gmailhub.ai.studio)',
      category: 'portal',
      action: () => window.open('https://gmailhub.ai.studio/', '_blank', 'noopener,noreferrer'),
    },
    {
      id: 'about',
      name: 'about',
      desc: 'Jump to About / Ecosystem section',
      category: 'section',
      action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'features',
      name: 'features',
      desc: 'Jump to Capabilities & Club Features',
      category: 'section',
      action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'membership',
      name: 'membership',
      desc: 'Jump to Access Tiers & Pricing',
      category: 'section',
      action: () => document.getElementById('membership')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'events',
      name: 'events',
      desc: 'Jump to Upcoming Operations & Events Calendar',
      category: 'section',
      action: () => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'community',
      name: 'community',
      desc: 'Jump to Operative Network Stats',
      category: 'section',
      action: () => document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'dossier',
      name: 'dossier',
      desc: 'Jump to Operative Dossier & Achievements',
      category: 'section',
      action: () => document.getElementById('dossier')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'showcase',
      name: 'showcase',
      desc: 'Jump to Featured Work showcase',
      category: 'section',
      action: () => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'theme',
      name: 'theme',
      desc: `Cycle visual palette (Current: ${theme.toUpperCase()})`,
      category: 'action',
      action: () => {
        cycleTheme();
        addToast('Visual theme spectrum shifted.');
      },
    },
    {
      id: 'clearance',
      name: 'clearance',
      desc: 'Open Operative Identity & Passkey verification',
      category: 'action',
      action: () => openModal(),
    },
    {
      id: 'join',
      name: 'join',
      desc: 'Request Operative Clearance into Shadow Club',
      category: 'action',
      action: () => openModal(),
    },
    {
      id: 'bgfx',
      name: 'bgfx',
      desc: 'Toggle interactive background animations HUD and presets',
      category: 'action',
      action: () => {
        const btn = document.getElementById('btn-bg-fx-toggle');
        if (btn) btn.click();
        addToast('Background animation telemetry HUD toggled.');
      },
    },
    {
      id: 'atmosphere',
      name: 'atmosphere',
      desc: 'Toggle site weather-like particle atmosphere (Digital Rain, Data Streams, Cyber Mist)',
      category: 'action',
      action: () => {
        const btn = document.getElementById('btn-atmosphere-toggle');
        if (btn) btn.click();
        addToast('Atmosphere weather particle HUD toggled.');
      },
    },
    {
      id: 'rain',
      name: 'rain',
      desc: `Toggle realistic procedural rain sound ambiance (${isRainAudioPlaying ? 'PLAYING' : 'MUTED'})`,
      category: 'action',
      action: () => {
        toggleRainAudio();
        addToast(isRainAudioPlaying ? 'Rain audio muted.' : 'Rain audio synthesizer started.');
      },
    },
    {
      id: 'sound',
      name: 'sound',
      desc: `Toggle atmospheric audio playback (${isRainAudioPlaying ? 'PLAYING' : 'MUTED'})`,
      category: 'action',
      action: () => {
        toggleRainAudio();
        addToast(isRainAudioPlaying ? 'Audio muted.' : 'Atmospheric rain sound started.');
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(input.toLowerCase().trim()) ||
    c.desc.toLowerCase().includes(input.toLowerCase().trim())
  );

  const executeCommand = useCallback((cmd: CommandItem) => {
    setIsOpen(false);
    cmd.action();
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Body scroll lock & focus
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setSelectedIndex(0);
      setInput('');
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);

      return () => {
        document.body.style.overflow = prevOverflow;
        clearTimeout(focusTimer);
      };
    }
  }, [isOpen]);

  // Reset selected index when input changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [input]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        const item = filteredCommands[selectedIndex] || filteredCommands[0];
        executeCommand(item);
      } else if (input.trim()) {
        addToast(`Command '${input.trim()}' not recognized in secure sector.`);
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[150] flex items-start justify-center pt-[12vh] sm:pt-[15vh] bg-black/75 backdrop-blur-md p-4"
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Command Terminal"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: -15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-cyan-500/40 rounded-sm shadow-[0_0_80px_rgba(0,255,255,0.2)] overflow-hidden font-mono relative"
            >
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />

              <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-black/70 relative z-10">
                <Terminal className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a command or jump... (e.g. 'events', 'cloud', 'theme')"
                  aria-label="Search commands"
                  className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm placeholder:text-gray-600"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-block text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-sm border border-white/10">
                    ↑↓ NAVIGATE
                  </span>
                  <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-sm border border-white/10">
                    ESC
                  </span>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto relative z-10 p-2">
                {filteredCommands.length > 0 ? (
                  <ul ref={listRef} className="space-y-1" role="listbox">
                    {filteredCommands.map((cmd, i) => {
                      const isSelected = i === selectedIndex;
                      return (
                        <li
                          key={cmd.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={`px-3.5 py-2.5 flex justify-between items-center cursor-pointer rounded-sm transition-all duration-150 group ${
                            isSelected
                              ? 'bg-cyan-500/15 border-l-2 border-cyan-400 text-white'
                              : 'border-l-2 border-transparent text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span
                              className={`text-sm font-bold tracking-wider uppercase ${
                                isSelected ? 'text-cyan-300 translate-x-0.5' : 'text-cyan-400'
                              } transition-transform`}
                            >
                              {cmd.name}
                            </span>
                            <span className="text-gray-500 text-xs tracking-wider truncate">
                              — {cmd.desc}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-gray-500">
                            {cmd.category === 'portal' && <ExternalLink className="w-3.5 h-3.5 opacity-70" />}
                            {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-xs font-mono uppercase tracking-widest">
                    No matching operative directive found for "{input}".
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-white/5 bg-black/40 text-[11px] text-gray-600 flex justify-between items-center">
                <span>SHADOW PROTOCOL OS</span>
                <span>PRESS ENTER TO EXECUTE</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
