import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const events = [
  { name: 'CyberSec Summit 2026', date: 'Oct 15, 2026', category: 'Conference' },
  { name: 'Neural Net Workshop', date: 'Nov 02, 2026', category: 'Digital Workshop' },
  { name: 'Shadow Protocol Launch', date: 'Nov 18, 2026', category: 'Project Reveal' },
  { name: 'Global Founders Meet', date: 'Dec 05, 2026', category: 'Networking' },
];

export function Events() {
  return (
    <section id="events" className="py-24 md:py-32 bg-[#0a0a0a]/85 backdrop-blur-[2px] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal direction="up" distance={20} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-cyan-400 font-mono tracking-[0.2em] text-sm mb-4 uppercase">Calendar</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">Upcoming Events</h3>
          </div>
          <button className="text-gray-400 hover:text-cyan-400 flex items-center gap-2 uppercase tracking-widest text-sm transition-colors group font-bold cursor-pointer">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </ScrollReveal>

        <div className="space-y-4">
          {events.map((evt, i) => (
            <ScrollReveal
              key={evt.name}
              direction="left"
              distance={28}
              delay={i * 0.1}
              duration={0.65}
            >
              <div
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 bg-black border border-white/5 hover:border-cyan-500/40 hover:bg-white/[0.01] transition-all duration-300 group rounded-sm gap-4 hover:shadow-[0_0_25px_rgba(0,255,255,0.05)]"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-cyan-400 font-mono text-xs uppercase tracking-widest">{evt.date}</span>
                    <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs uppercase tracking-wider rounded-sm">{evt.category}</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">{evt.name}</h4>
                </div>
                <button className="px-6 py-3 bg-transparent border border-gray-700 text-white font-bold tracking-widest uppercase hover:border-cyan-500 hover:text-cyan-400 transition-colors text-sm rounded-sm whitespace-nowrap cursor-pointer">
                  Register
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
