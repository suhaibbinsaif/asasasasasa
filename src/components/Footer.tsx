import { Hexagon, Send, CheckCircle2, Cloud, Mail, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { ScrollReveal } from './ScrollReveal';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Save to local storage for demo purposes
    const existing = JSON.parse(localStorage.getItem('shadow_newsletter') || '[]');
    if (!existing.includes(email)) {
      localStorage.setItem('shadow_newsletter', JSON.stringify([...existing, email]));
    }

    setSubscribed(true);
    addToast(`Encrypted comms established for ${email}.`);
    setEmail('');
    
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-black py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal direction="up" distance={20} duration={0.7} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Hexagon className="w-6 h-6 text-cyan-400" />
              <span className="text-lg font-bold tracking-widest text-white">SHADOW CLUB</span>
            </div>
            <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-6">
              A private digital club built for creators, technology enthusiasts, gamers, and innovators. Redefining the boundaries of collaboration.
            </p>
            {/* Quick Portals Direct Links: 1 Telegram, 2 Cloud Beta, 3 GmailHub */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                id="footer-btn-telegram"
                href="https://cloudshot.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 rounded-sm text-xs font-mono text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                Telegram
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
              <a
                id="footer-btn-cloud"
                href="https://shadowtech.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 rounded-sm text-xs font-mono text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                Cloud Beta
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
              <a
                id="footer-btn-gmailhub"
                href="https://gmailhub.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 rounded-sm text-xs font-mono text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                GmailHub
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Navigation</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors uppercase tracking-wider">About</a></li>
              <li><a href="#membership" className="hover:text-cyan-400 transition-colors uppercase tracking-wider">Membership</a></li>
              <li><a href="#events" className="hover:text-cyan-400 transition-colors uppercase tracking-wider">Events</a></li>
              <li><a href="#community" className="hover:text-cyan-400 transition-colors uppercase tracking-wider">Community</a></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-cyan-400 transition-colors uppercase tracking-wider">Contact</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors uppercase tracking-wider">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors uppercase tracking-wider">Terms of Service</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Intel Feed</h4>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              Subscribe to our encrypted newsletter for exclusive drops, event invites, and network updates.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER COMM-LINK (EMAIL)"
                disabled={subscribed}
                className="w-full bg-white/5 border border-white/10 rounded-sm py-3 pl-4 pr-12 text-sm text-white font-mono tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 backdrop-blur-md transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={subscribed}
                className="absolute right-2 p-2 text-gray-500 hover:text-cyan-400 transition-colors disabled:text-cyan-500"
              >
                {subscribed ? <CheckCircle2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </ScrollReveal>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600 uppercase tracking-widest">
          <p>&copy; 2026 Shadow Club. All rights reserved.</p>
          <p>System Online</p>
        </div>
      </div>
    </footer>
  );
}
