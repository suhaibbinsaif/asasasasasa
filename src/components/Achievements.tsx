import { Shield, Zap, Code, Star, Box, Terminal } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const achievements = [
  { id: 1, name: 'Initiate', desc: 'Join the Shadow Club', icon: Shield, unlocked: true },
  { id: 2, name: 'First Blood', desc: 'Attend a digital summit', icon: Zap, unlocked: true },
  { id: 3, name: 'Architect', desc: 'Submit a verified project', icon: Box, unlocked: true },
  { id: 4, name: 'Node Operator', desc: 'Host a workshop', icon: Terminal, unlocked: false },
  { id: 5, name: 'Codebreaker', desc: 'Win a seasonal hackathon', icon: Code, unlocked: false },
  { id: 6, name: 'Black Tier', desc: 'Achieve elite status', icon: Star, unlocked: false },
];

export function Achievements() {
  return (
    <section id="dossier" className="py-24 bg-[#080808]/85 backdrop-blur-[2px] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal direction="up" distance={20} className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-cyan-400 font-mono tracking-[0.2em] text-sm mb-4 uppercase">Operative Dossier</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">Achievements</h3>
          </div>
          <div className="flex gap-6 text-sm font-mono border border-white/10 bg-black p-4 rounded-sm">
            <div>
              <div className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Events Attended</div>
              <div className="text-cyan-400 text-xl">12</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="text-gray-500 uppercase tracking-widest text-[10px] mb-1">Projects Built</div>
              <div className="text-cyan-400 text-xl">03</div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((badge, i) => (
            <ScrollReveal
              key={badge.id}
              direction="up"
              distance={24}
              delay={i * 0.08}
              duration={0.65}
              className="h-full"
            >
              <div
                className={`h-full relative p-6 border rounded-sm flex flex-col items-center text-center transition-all duration-300 ${
                  badge.unlocked 
                    ? 'bg-black border-cyan-500/30 hover:border-cyan-500/70 shadow-[0_0_20px_rgba(0,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:-translate-y-1' 
                    : 'bg-black/30 border-white/5 grayscale opacity-50'
                }`}
              >
                <div className={`w-12 h-12 mb-4 flex items-center justify-center rounded-full border transition-colors ${
                  badge.unlocked ? 'border-cyan-400/50 bg-cyan-900/20 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)]' : 'border-gray-700 bg-gray-900 text-gray-600'
                }`}>
                  <badge.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-2">{badge.name}</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{badge.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
