import { motion } from 'motion/react';
import { Menu, X, Hexagon, Volume2, VolumeX, Palette, Send, Cloud, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAmbientAudio } from '../hooks/useAmbientAudio';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isPlaying, toggleAudio } = useAmbientAudio();
  const { openModal } = useAuth();
  const { theme, cycleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Membership', href: '#membership' },
    { name: 'Events', href: '#events' },
    { name: 'Community', href: '#community' },
    { name: 'Dossier', href: '#dossier' },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/70 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2 group">
          <Hexagon className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          <span className="text-xl font-bold tracking-widest text-white">SHADOW</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm tracking-wider text-gray-400 hover:text-cyan-400 transition-colors uppercase"
            >
              {link.name}
            </a>
          ))}

          {/* Quick Portal Direct Links: 1 Telegram, 2 Cloud Beta, 3 GmailHub */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-sm p-1">
            <a
              id="nav-btn-telegram"
              href="https://cloudshot.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-mono text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Telegram: https://cloudshot.ai.studio/"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Telegram</span>
            </a>
            <a
              id="nav-btn-cloud"
              href="https://shadowtech.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-mono text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Cloud Beta: https://shadowtech.ai.studio/"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Cloud Beta</span>
            </a>
            <a
              id="nav-btn-gmailhub"
              href="https://gmailhub.ai.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-mono text-gray-300 hover:text-cyan-400 hover:bg-white/5 rounded-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="GmailHub: https://gmailhub.ai.studio/"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">GmailHub</span>
            </a>
          </div>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <button
              onClick={cycleTheme}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
              title={`Toggle Theme (Current: ${theme})`}
            >
              <Palette className="w-5 h-5" />
            </button>
            <button
              onClick={toggleAudio}
              className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-3"
              title="Toggle Ambient Audio"
            >
              {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              {/* Audio Visualizer */}
              <div className="flex items-end gap-[2px] h-4 w-4 overflow-hidden">
                <div className={`w-1 bg-cyan-400 rounded-t-sm transition-all duration-300 ${isPlaying ? 'h-full eq-bar-1' : 'h-[30%]'}`} />
                <div className={`w-1 bg-cyan-400 rounded-t-sm transition-all duration-300 ${isPlaying ? 'h-full eq-bar-2' : 'h-[50%]'}`} />
                <div className={`w-1 bg-cyan-400 rounded-t-sm transition-all duration-300 ${isPlaying ? 'h-full eq-bar-3' : 'h-[20%]'}`} />
              </div>
            </button>
            <button
              onClick={openModal}
              className="px-6 py-2 bg-transparent border border-cyan-500/50 text-cyan-400 text-sm font-bold tracking-widest uppercase hover:bg-cyan-500/10 transition-all rounded-sm cursor-pointer"
            >
              Join
            </button>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={cycleTheme}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
            title={`Toggle Theme (Current: ${theme})`}
          >
            <Palette className="w-5 h-5" />
          </button>
          <button
            onClick={toggleAudio}
            className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-3"
            title="Toggle Ambient Audio"
          >
            {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            {/* Audio Visualizer (Mobile) */}
            <div className="flex items-end gap-[2px] h-4 w-4 overflow-hidden">
              <div className={`w-1 bg-cyan-400 rounded-t-sm transition-all duration-300 ${isPlaying ? 'h-full eq-bar-1' : 'h-[30%]'}`} />
              <div className={`w-1 bg-cyan-400 rounded-t-sm transition-all duration-300 ${isPlaying ? 'h-full eq-bar-2' : 'h-[50%]'}`} />
              <div className={`w-1 bg-cyan-400 rounded-t-sm transition-all duration-300 ${isPlaying ? 'h-full eq-bar-3' : 'h-[20%]'}`} />
            </div>
          </button>
          <button
            className="text-gray-300 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 flex flex-col items-center py-8 gap-6 md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg tracking-wider text-gray-400 hover:text-cyan-400 uppercase"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          {/* Mobile Portal Direct Links: 1 Telegram, 2 Cloud Beta, 3 GmailHub */}
          <div className="w-full px-6 pt-4 border-t border-white/10">
            <div className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-widest text-center mb-3">
              Direct Portals
            </div>
            <div className="grid grid-cols-3 gap-2">
              <a
                id="mobile-btn-telegram"
                href="https://cloudshot.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 hover:border-cyan-500/50 rounded-sm text-gray-300 hover:text-cyan-300 transition-colors"
              >
                <Send className="w-4 h-4 text-cyan-400 mb-1.5" />
                <span className="font-mono text-[11px] font-bold">Telegram</span>
              </a>
              <a
                id="mobile-btn-cloud"
                href="https://shadowtech.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 hover:border-cyan-500/50 rounded-sm text-gray-300 hover:text-cyan-300 transition-colors"
              >
                <Cloud className="w-4 h-4 text-cyan-400 mb-1.5" />
                <span className="font-mono text-[11px] font-bold">Cloud Beta</span>
              </a>
              <a
                id="mobile-btn-gmailhub"
                href="https://gmailhub.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/10 hover:border-cyan-500/50 rounded-sm text-gray-300 hover:text-cyan-300 transition-colors"
              >
                <Mail className="w-4 h-4 text-cyan-400 mb-1.5" />
                <span className="font-mono text-[11px] font-bold">GmailHub</span>
              </a>
            </div>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              openModal();
            }}
            className="mt-2 px-8 py-3 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-bold tracking-widest uppercase rounded-sm cursor-pointer w-full max-w-xs text-center"
          >
            Join the Club
          </button>
        </motion.div>
      )}
    </header>
  );
}
