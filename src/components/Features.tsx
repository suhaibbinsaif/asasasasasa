import { Users, Calendar, Network, Cpu, Briefcase, Award } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const features = [
  { icon: Users, title: 'Private Community', desc: 'Invite-only forums and real-time comms.' },
  { icon: Calendar, title: 'Exclusive Events', desc: 'Digital symposiums and physical meetups.' },
  { icon: Network, title: 'Creator Network', desc: 'Connect with multidisciplinary talent.' },
  { icon: Cpu, title: 'Digital Resources', desc: 'Access proprietary tools and datasets.' },
  { icon: Briefcase, title: 'Premium Projects', desc: 'Collaborate on high-stakes ventures.' },
  { icon: Award, title: 'Member Benefits', desc: 'Perks from our hardware and software partners.' },
];

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32 bg-[#0a0a0a]/85 backdrop-blur-[2px] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal direction="up" distance={24} className="text-center mb-16">
          <h2 className="text-cyan-400 font-mono tracking-[0.2em] text-sm mb-4 uppercase">Capabilities</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">Club Features</h3>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <ScrollReveal
              key={f.title}
              direction="up"
              distance={30}
              delay={0.08 * i}
              duration={0.7}
              className="h-full"
            >
              <div className="group h-full p-8 bg-black border border-white/5 hover:border-cyan-500/40 transition-all duration-300 rounded-sm relative overflow-hidden flex flex-col justify-between hover:shadow-[0_0_30px_rgba(0,255,255,0.06)]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] group-hover:bg-cyan-500/15 transition-colors pointer-events-none" />
                <div>
                  <div className="w-12 h-12 rounded-sm bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-all">
                    <f.icon className="w-6 h-6 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 uppercase tracking-wide group-hover:text-cyan-200 transition-colors">
                    {f.title}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
